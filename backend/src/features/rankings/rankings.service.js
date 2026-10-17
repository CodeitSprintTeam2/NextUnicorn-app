import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../errors/api-error.js";

function serializeCompany(company) {
  return {
    id: company.id,
    name: company.name,
    description: company.description,
    category: company.category?.name ?? company.category,
    actualInvestment: company.actualInvestment.toString(),
    revenue: company.revenue.toString(),
    employees: company.employees,
  };
}

export async function getCompanyRanking(companyId, { sortBy, order }) {
  const companies = await prisma.company.findMany({
    include: {
      category: true,
    },
  });

  const targetExists = companies.some((company) => company.id === companyId);
  if (!targetExists) {
    throw new ApiError(404, "COMPANY_NOT_FOUND", "기업을 찾을 수 없습니다.");
  }

  // 1. 순위 계산을 위해 항상 기준값 내림차순, 동점 시 id 오름차순으로 전체 정렬
  const sorted = [...companies].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (valA !== valB) {
      return valB > valA ? 1 : -1;
    }
    return a.id - b.id;
  });

  //공동 순위 계산
  let currentRank = 1;
  const ranked = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0) {
      const prevVal = sorted[i - 1][sortBy];
      const currVal = sorted[i][sortBy];
      if (currVal !== prevVal) {
        currentRank = i + 1;
      }
    }
    ranked.push({
      rank: currentRank,
      company: sorted[i],
    });
  }

  const targetIndex = ranked.findIndex((item) => item.company.id === companyId);
  const targetRank = ranked[targetIndex].rank;

  // 3. 근접 5개 기업 추출 (경계 조건 포함)
  const total = ranked.length;
  let window;
  if (total <= 5) {
    window = ranked;
  } else {
    let start = targetIndex - 2;
    if (start < 0) {
      start = 0;
    } else if (start + 5 > total) {
      start = total - 5;
    }
    window = ranked.slice(start, start + 5);
  }

  // 4. 표시 순서(order) 적용: order가 asc면 기준값 오름차순(동점 시 id 오름차순) 정렬
  const displayCompanies = [...window].sort((a, b) => {
    const valA = a.company[sortBy];
    const valB = b.company[sortBy];
    if (valA !== valB) {
      if (order === "asc") {
        return valA > valB ? 1 : -1;
      }
      return valB > valA ? 1 : -1;
    }
    return a.company.id - b.company.id;
  });

  return {
    companyId,
    rank: targetRank,
    sortBy,
    order,
    companies: displayCompanies.map((item) => ({
      rank: item.rank,
      company: serializeCompany(item.company),
    })),
  };
}

