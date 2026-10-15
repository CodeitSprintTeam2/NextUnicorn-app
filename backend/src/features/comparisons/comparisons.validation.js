import { ApiError } from "../../errors/api-error.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const MAX_DATABASE_INT = 2_147_483_647;
const VALIDATION_MESSAGE = "요청 값이 올바르지 않습니다.";
const INVALID_QUERY_MESSAGE = "쿼리 값이 올바르지 않습니다.";
const ALLOWED_SORT_BY = new Set(["myCompanySelections", "comparisonSelections"]);
const ALLOWED_SORT_ORDERS = new Set(["asc", "desc"]);

function isSafePositiveInteger(value) {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= MAX_DATABASE_INT
  );
}

export function parseCreateComparisonBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "VALIDATION_ERROR", VALIDATION_MESSAGE, [
      {
        field: "body",
        reason: "요청 본문은 객체 형식이어야 합니다.",
      },
    ]);
  }

  const details = [];
  const { myCompanyId, compareCompanyIds } = body;

  if (!isSafePositiveInteger(myCompanyId)) {
    details.push({
      field: "myCompanyId",
      reason: "존재하는 기업의 ID여야 합니다.",
    });
  }

  if (!Array.isArray(compareCompanyIds)) {
    details.push({
      field: "compareCompanyIds",
      reason: "비교 기업 ID 목록은 배열이어야 합니다.",
    });
  } else {
    if (compareCompanyIds.length < 1 || compareCompanyIds.length > 5) {
      details.push({
        field: "compareCompanyIds",
        reason: "비교 기업은 1개 이상 5개 이하로 선택해야 합니다.",
      });
    }

    for (let i = 0; i < compareCompanyIds.length; i++) {
      const companyId = compareCompanyIds[i];
      if (!isSafePositiveInteger(companyId)) {
        details.push({
          field: `compareCompanyIds[${i}]`,
          reason: "존재하는 기업의 ID여야 합니다.",
        });
      }
    }

    if (
      isSafePositiveInteger(myCompanyId) &&
      compareCompanyIds.includes(myCompanyId)
    ) {
      details.push({
        field: "compareCompanyIds",
        reason: "내 기업은 비교 대상에 넣을 수 없습니다.",
      });
    }

    const uniqueCompareCompanyIds = new Set(compareCompanyIds);
    if (uniqueCompareCompanyIds.size !== compareCompanyIds.length) {
      details.push({
        field: "compareCompanyIds",
        reason: "비교 기업은 중복할 수 없습니다.",
      });
    }
  }

  if (details.length > 0) {
    throw new ApiError(400, "VALIDATION_ERROR", VALIDATION_MESSAGE, details);
  }

  return { myCompanyId, compareCompanyIds };
}

export function parseComparisonStatusQuery(query = {}) {
  const details = [];

  let page = DEFAULT_PAGE;
  if (query.page !== undefined) {
    if (!/^[1-9]\d*$/.test(String(query.page))) {
      details.push({ field: "page", reason: "1 이상의 정수여야 합니다." });
    } else {
      const parsedPage = Number(query.page);
      if (!Number.isSafeInteger(parsedPage) || parsedPage > MAX_DATABASE_INT) {
        details.push({ field: "page", reason: "허용 범위를 초과한 페이지 번호입니다." });
      } else {
        page = parsedPage;
      }
    }
  }

  let limit = DEFAULT_LIMIT;
  if (query.limit !== undefined) {
    if (!/^[1-9]\d*$/.test(String(query.limit))) {
      details.push({ field: "limit", reason: "1~100의 정수여야 합니다." });
    } else {
      const parsedLimit = Number(query.limit);
      if (
        !Number.isSafeInteger(parsedLimit) ||
        parsedLimit < 1 ||
        parsedLimit > MAX_LIMIT
      ) {
        details.push({ field: "limit", reason: "1~100의 정수여야 합니다." });
      } else {
        limit = parsedLimit;
      }
    }
  }

  // offset 안전 정수 및 데이터베이스 상한 범위 검증
  const offset = (page - 1) * limit;
  if (!Number.isSafeInteger(offset) || offset > MAX_DATABASE_INT) {
    details.push({
      field: "page",
      reason: "페이지 범위가 안전한 정수 범위를 벗어났습니다.",
    });
  }

  const sortBy = query.sortBy;
  const order = query.order;

  if (sortBy !== undefined && !ALLOWED_SORT_BY.has(sortBy)) {
    details.push({
      field: "sortBy",
      reason: "myCompanySelections 또는 comparisonSelections만 허용됩니다.",
    });
  }

  if (order !== undefined && !ALLOWED_SORT_ORDERS.has(order)) {
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
    throw new ApiError(400, "INVALID_QUERY", INVALID_QUERY_MESSAGE, details);
  }

  return {
    page,
    limit,
    sortBy,
    order: sortBy === undefined ? undefined : order || "desc",
  };
}

