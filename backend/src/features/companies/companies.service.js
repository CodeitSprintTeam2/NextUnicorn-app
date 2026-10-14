import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../errors/api-error.js";
import {
  serializeCompany,
  serializeCompanyDetail,
} from "./company.serializer.js";
import { serializeInvestment } from "./investment.serializer.js";

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

export async function listCompanies({ page, limit, search, sortBy, order }) {
  const where = buildWhere(search);
  const result = await findCompaniesByColumn({
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
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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
