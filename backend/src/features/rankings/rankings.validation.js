import { ApiError } from "../../errors/api-error.js";

const MAX_DATABASE_INT = 2_147_483_647;
const ALLOWED_SORT_BY = new Set(["revenue", "employees"]);
const ALLOWED_ORDER = new Set(["asc", "desc"]);

export function parseCompanyId(value) {
  const companyId = Number(value);

  if (
    !/^[1-9]\d*$/.test(String(value)) ||
    !Number.isSafeInteger(companyId) ||
    companyId > MAX_DATABASE_INT
  ) {
    throw new ApiError(
      400,
      "INVALID_PATH_PARAMETER",
      "경로 매개변수가 올바르지 않습니다.",
    );
  }

  return companyId;
}

export function parseCompanyRankingQuery(query = {}) {
  const details = [];

  const allowedKeys = new Set(["sortBy", "order"]);
  for (const key of Object.keys(query)) {
    if (!allowedKeys.has(key)) {
      details.push({
        field: key,
        reason: "허용되지 않은 쿼리 매개변수입니다.",
      });
    }
  }

  const { sortBy, order } = query;

  if (sortBy === undefined) {
    details.push({
      field: "sortBy",
      reason: "sortBy는 필수 값입니다.",
    });
  } else if (!ALLOWED_SORT_BY.has(sortBy)) {
    details.push({
      field: "sortBy",
      reason: "revenue 또는 employees만 허용됩니다.",
    });
  }

  if (order !== undefined && !ALLOWED_ORDER.has(order)) {
    details.push({
      field: "order",
      reason: "asc 또는 desc만 허용됩니다.",
    });
  }

  if (details.length > 0) {
    throw new ApiError(
      400,
      "INVALID_QUERY",
      "순위 기준이나 정렬 방향이 올바르지 않습니다.",
      details,
    );
  }

  return {
    sortBy,
    order: order || "desc",
  };
}

