import { prisma } from "../../lib/prisma.js";
import { serializeCompany } from "./company.serializer.js";

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
