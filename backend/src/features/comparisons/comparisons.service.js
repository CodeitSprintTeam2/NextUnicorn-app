import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../errors/api-error.js";

function toCompanySummary(company) {
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

export async function createComparison(myCompanyId, compareCompanyIds) {
  // 1. 입력 유효성 검증
  if (!Number.isInteger(myCompanyId) || myCompanyId <= 0) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "내 기업 ID가 올바르지 않습니다.",
    );
  }

  if (
    !Array.isArray(compareCompanyIds) ||
    compareCompanyIds.length < 1 ||
    compareCompanyIds.length > 5
  ) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "비교 기업은 1개 이상 5개 이하로 선택해야 합니다.",
    );
  }

  for (const companyId of compareCompanyIds) {
    if (!Number.isInteger(companyId) || companyId <= 0) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "비교 기업 ID 형식이 올바르지 않습니다.",
      );
    }
  }

  if (compareCompanyIds.includes(myCompanyId)) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "내 기업은 비교 대상에 넣을 수 없습니다.",
    );
  }

  const uniqueCompareCompanyIds = new Set(compareCompanyIds);
  if (uniqueCompareCompanyIds.size !== compareCompanyIds.length) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "비교 기업은 중복할 수 없습니다.",
    );
  }

  // 2. 기업 존재 여부 확인 및 상세 정보 조회
  const allCompanyIds = [myCompanyId, ...compareCompanyIds];
  const companies = await prisma.company.findMany({
    where: {
      id: {
        in: allCompanyIds,
      },
    },
    include: {
      category: true,
    },
  });

  if (companies.length !== allCompanyIds.length) {
    throw new ApiError(
      404,
      "COMPANY_NOT_FOUND",
      "기업을 찾을 수 없습니다.",
    );
  }

  // 3. 트랜잭션: Comparison 및 ComparisonTarget 생성
  await prisma.$transaction(async (tx) => {
    const comparison = await tx.comparison.create({
      data: {
        myCompanyId,
      },
    });

    await tx.comparisonTarget.createMany({
      data: compareCompanyIds.map((companyId) => ({
        comparisonId: comparison.id,
        companyId,
      })),
    });
  });

  // 4. 응답용 CompanySummary 구성
  const companyMap = new Map(companies.map((c) => [c.id, c]));
  const myCompany = toCompanySummary(companyMap.get(myCompanyId));
  const compareCompanies = compareCompanyIds.map((id) =>
    toCompanySummary(companyMap.get(id)),
  );

  return {
    myCompany,
    compareCompanies,
  };
}

const ALLOWED_SORT_BY = new Set(["myCompanySelections", "comparisonSelections"]);

export async function getComparisonStatus({
  page = 1,
  limit = 10,
  sortBy,
  order,
} = {}) {
  // 1. 쿼리 파라미터 유효성 검증
  const details = [];

  if (!Number.isInteger(page) || page < 1) {
    details.push({
      field: "page",
      reason: "1 이상의 정수여야 합니다.",
    });
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    details.push({
      field: "limit",
      reason: "1~100의 정수여야 합니다.",
    });
  }

  if (sortBy !== undefined && !ALLOWED_SORT_BY.has(sortBy)) {
    details.push({
      field: "sortBy",
      reason: "myCompanySelections 또는 comparisonSelections만 허용됩니다.",
    });
  }

  if (order !== undefined && order !== "asc" && order !== "desc") {
    details.push({
      field: "order",
      reason: "asc 또는 desc만 허용됩니다.",
    });
  }

  if (order !== undefined && sortBy === undefined) {
    details.push({
      field: "order",
      reason: "sortBy 없이 order를 전달할 수 없습니다.",
    });
  }

  if (details.length > 0) {
    throw new ApiError(
      400,
      "INVALID_QUERY",
      "쿼리 값이 올바르지 않습니다.",
      details,
    );
  }

  // 2. 정렬 조건 구성
  let orderBySql;
  if (!sortBy) {
    orderBySql = Prisma.sql`c.id ASC`;
  } else {
    const direction = order ?? "desc";
    const column =
      sortBy === "myCompanySelections"
        ? "my_company_selections"
        : "comparison_selections";

    if (direction === "asc") {
      orderBySql = Prisma.sql`${Prisma.raw(column)} ASC, c.id ASC`;
    } else {
      orderBySql = Prisma.sql`${Prisma.raw(column)} DESC, c.id ASC`;
    }
  }

  // 3. 총 기업 수 및 페이지 수 계산
  const totalCountResult = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS total FROM companies
  `;
  const total = totalCountResult[0]?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;

  // 4. 집계 데이터 조회 (한 번도 선택되지 않은 기업도 포함하기 위해 LEFT JOIN 사용)
  const rows = await prisma.$queryRaw`
    SELECT
      c.id,
      c.name,
      c.description,
      cat.name AS category,
      c.actual_investment,
      c.revenue,
      c.employees,
      COALESCE(mc.cnt, 0)::int AS my_company_selections,
      COALESCE(ct.cnt, 0)::int AS comparison_selections
    FROM companies c
    JOIN categories cat ON cat.id = c.category_id
    LEFT JOIN (
      SELECT my_company_id, COUNT(*)::int AS cnt
      FROM comparisons
      GROUP BY my_company_id
    ) mc ON mc.my_company_id = c.id
    LEFT JOIN (
      SELECT company_id, COUNT(*)::int AS cnt
      FROM comparison_targets
      GROUP BY company_id
    ) ct ON ct.company_id = c.id
    ORDER BY ${orderBySql}
    LIMIT ${limit} OFFSET ${offset}
  `;

  // 5. 응답 포맷 구성
  const data = rows.map((row) => ({
    company: {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      actualInvestment: row.actual_investment.toString(),
      revenue: row.revenue.toString(),
      employees: row.employees,
    },
    myCompanySelections: row.my_company_selections,
    comparisonSelections: row.comparison_selections,
  }));

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}