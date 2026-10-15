import { prisma } from "../../lib/prisma.js";

export async function createComparison(myCompanyId, compareCompanyIds) {
  const comparison = await prisma.$transaction(async (tx) => {
    const comparison = await tx.comparison.create({
      data: {
        myCompanyId,
      },
    });
//비교기업은 1~5개만
    if (
      !Array.isArray(compareCompanyIds) ||
      compareCompanyIds.length < 1 ||
      compareCompanyIds.length > 5
    ) {
      const error = new Error("비교 기업은 1~5개까지 선택할 수 있습니다.");
      error.code = "VALIDATION_ERROR";
      error.status = 400;
      throw error;
    }
//내 기업은 지정 불가
    if (compareCompanyIds.includes(myCompanyId)) {
    const error = new Error(
      "내 기업은 비교 기업으로 선택할 수 없습니다."
    );
    error.statusCode = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }
//비교하는 기업끼리도 중복 불가
  const uniqueCompareCompanyIds = new Set(compareCompanyIds);

  if (uniqueCompareCompanyIds.size !== compareCompanyIds.length) {
    const error = new Error(
      "비교 기업은 중복해서 선택할 수 없습니다."
    );
    error.statusCode = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

// 기업 존재 여부 확인
  const companyIds = [myCompanyId, ...compareCompanyIds];

  const companies = await prisma.company.findMany({
    where: {
      id: {
        in: companyIds,
      },
    },
    select: {
      id: true,
    },
  });

  if (companies.length !== companyIds.length) {
    const error = new Error(
      "존재하지 않는 기업이 포함되어 있습니다."
    );
    error.statusCode = 404;
    error.code = "COMPANY_NOT_FOUND";
    throw error;
  }

    await tx.comparisonTarget.createMany({
      data: compareCompanyIds.map((companyId) => ({
        comparisonId: comparison.id,
        companyId,
      })),
    });

    return comparison;
  });

  return comparison;
}