import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

// SQL identifiers and directions come only from these fixed fragments.
const SORT_COLUMNS = {
  virtualInvestment: Prisma.sql`virtual_investment`,
  actualInvestment: Prisma.sql`actual_investment`,
};
const SORT_DIRECTIONS = {
  asc: Prisma.sql`ASC`,
  desc: Prisma.sql`DESC`,
};

export async function findInvestmentStatus({ page, limit, sortBy, order }) {
  const sortColumn = SORT_COLUMNS[sortBy];
  const sortDirection = SORT_DIRECTIONS[order];
  const offset = (page - 1) * limit;

  const statusQuery = Prisma.sql`
    WITH investment_totals AS (
      SELECT
        company.id,
        company.name,
        company.description,
        category.name AS category,
        company.actual_investment,
        COALESCE(SUM(investment.amount), 0) AS virtual_investment
      FROM companies AS company
      JOIN categories AS category ON category.id = company.category_id
      LEFT JOIN investments AS investment
        ON investment.company_id = company.id
        AND investment.deleted_at IS NULL
      GROUP BY company.id, category.name
    ), ranked_companies AS (
      SELECT
        *,
        RANK() OVER (ORDER BY ${sortColumn} DESC) AS rank
      FROM investment_totals
    )
    SELECT
      id,
      name,
      description,
      category,
      rank::integer AS rank,
      virtual_investment::text AS "virtualInvestment",
      actual_investment::text AS "actualInvestment"
    FROM ranked_companies
    ORDER BY ${sortColumn} ${sortDirection}, id ASC
    LIMIT ${limit}::integer OFFSET ${offset}::bigint
  `;

  // The count and rows must describe the same snapshot, even during writes.
  const [total, rows] = await prisma.$transaction(
    [prisma.company.count(), prisma.$queryRaw(statusQuery)],
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );

  return { total, rows };
}
