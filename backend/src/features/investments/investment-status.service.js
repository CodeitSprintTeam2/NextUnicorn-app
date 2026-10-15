import { findInvestmentStatus } from "./investment-status.repository.js";

function serializeInvestmentStatus(row) {
  return {
    rank: row.rank,
    company: {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
    },
    virtualInvestment: row.virtualInvestment,
    actualInvestment: row.actualInvestment,
  };
}

export async function listInvestmentStatus(query) {
  const { rows, total } = await findInvestmentStatus(query);

  return {
    data: rows.map(serializeInvestmentStatus),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}
