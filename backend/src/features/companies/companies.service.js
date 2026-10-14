import { prisma } from "../../lib/prisma.js";
import {
  serializeCompany,
  sumActiveInvestments,
} from "./company.serializer.js";

const companyRelations = {
  category: { select: { name: true } },
  investments: {
    where: { deletedAt: null },
    select: { amount: true },
  },
};

function buildWhere(search) {
  if (!search) return {};
  return { name: { contains: search, mode: "insensitive" } };
}

function buildOrderBy(sortBy, order) {
  if (!sortBy) return { id: "asc" };
  return [{ [sortBy]: order }, { id: "asc" }];
}

function compareInvestmentTotals(left, right, order) {
  const leftTotal = sumActiveInvestments(left.investments);
  const rightTotal = sumActiveInvestments(right.investments);

  if (leftTotal === rightTotal) return left.id - right.id;
  const result = leftTotal < rightTotal ? -1 : 1;
  return order === "asc" ? result : -result;
}

async function findCompaniesByTotalInvestment({ where, page, limit, order }) {
  return prisma.$transaction(async (transaction) => {
    const companies = await transaction.company.findMany({
      where,
      include: companyRelations,
    });
    const start = (page - 1) * limit;
    const data = companies
      .sort((left, right) => compareInvestmentTotals(left, right, order))
      .slice(start, start + limit)
      .map(serializeCompany);

    return { data, total: companies.length };
  });
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

export async function listCompanies({ page, limit, search, sortBy, order }) {
  const where = buildWhere(search);
  const result =
    sortBy === "totalInvestment"
      ? await findCompaniesByTotalInvestment({ where, page, limit, order })
      : await findCompaniesByColumn({
          where,
          page,
          limit,
          sortBy,
          order,
        });

  return {
    data: result.data,
    meta: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
}
