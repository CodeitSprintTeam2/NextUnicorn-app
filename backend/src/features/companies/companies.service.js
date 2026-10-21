import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../errors/api-error.js";
import {
  serializeCompany,
  serializeCompanyDetail,
} from "./company.serializer.js";
import { serializeInvestment } from "../../serializers/investment.serializer.js";

const companyRelations = {
  category: { select: { name: true } },
};

function buildWhere(search) {
  if (!search) return {};
  return { name: { contains: search, mode: "insensitive" } };
}

function buildOrderBy(sortBy, order) {
  if (!sortBy) return { id: "asc" };
  return [{ [sortBy]: order }, { id: "asc" }];
}

async function findCompaniesByColumn({ where, page, limit, sortBy, order }) {
  const [total, companies] = await prisma.$transaction([
    prisma.company.count({ where }),
    prisma.company.findMany({
      where,
      orderBy: buildOrderBy(sortBy, order),
      skip: (page - 1) * limit,
      take: limit,
      include: companyRelations,
    }),
  ]);

  return { data: companies.map(serializeCompany), total };
}

async function findCompanyRanks({ companyIds, search, sortBy }) {
  if (!sortBy || companyIds.length === 0) return new Map();

  const column = {
    actualInvestment: Prisma.sql`c.actual_investment`,
    revenue: Prisma.sql`c.revenue`,
    employees: Prisma.sql`c.employees`,
  }[sortBy];
  const searchCondition = search
    ? Prisma.sql`WHERE c.name ILIKE ${`%${search}%`}`
    : Prisma.empty;

  const rows = await prisma.$queryRaw`
    WITH ranked AS (
      SELECT
        c.id,
        RANK() OVER (ORDER BY ${column} DESC)::int AS rank
      FROM companies c
      ${searchCondition}
    )
    SELECT id, rank
    FROM ranked
    WHERE id IN (${Prisma.join(companyIds)})
  `;

  return new Map(rows.map((row) => [row.id, row.rank]));
}

export async function listCompanies({ page, limit, search, sortBy, order }) {
  const where = buildWhere(search);
  const result = await findCompaniesByColumn({
    where,
    page,
    limit,
    sortBy,
    order,
  });
  const ranks = await findCompanyRanks({
    companyIds: result.data.map((company) => company.id),
    search,
    sortBy,
  });
  const data = result.data.map((company, index) => ({
    ...company,
    rank: sortBy
      ? ranks.get(company.id)
      : (page - 1) * limit + index + 1,
  }));

  return {
    data,
    meta: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
}

function companyNotFound() {
  return new ApiError(
    404,
    "COMPANY_NOT_FOUND",
    "기업을 찾을 수 없습니다.",
  );
}

async function findCompanyOrThrow(companyId) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: companyRelations,
  });

  if (!company) throw companyNotFound();
  return company;
}

async function ensureCompanyExists(companyId) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!company) throw companyNotFound();
}

export async function getCompanyDetail(companyId) {
  const company = await findCompanyOrThrow(companyId);
  const aggregate = await prisma.investment.aggregate({
    where: { companyId, deletedAt: null },
    _sum: { amount: true },
  });

  return {
    data: serializeCompanyDetail(company, aggregate._sum.amount ?? 0n),
  };
}

export async function listCompanyInvestments({ companyId, page, limit }) {
  await ensureCompanyExists(companyId);
  const where = { companyId, deletedAt: null };

const [total, investments] = await prisma.$transaction([
  prisma.investment.count({ where }),
  prisma.investment.findMany({
    where,
    select: {
      id: true,
      companyId: true,
      investorName: true,
      amount: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      { deletedAt: "desc" },
      { createdAt: "desc" },
      { id: "desc" },
    ],
    skip: (page - 1) * limit,
    take: limit,
    }),
  ]);

  return {
    data: investments.map(serializeInvestment),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
