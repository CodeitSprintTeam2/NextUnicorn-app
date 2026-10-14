import { ApiError } from "../../errors/api-error.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const SORT_FIELDS = new Set(["actualInvestment", "revenue", "employees"]);
const SORT_ORDERS = new Set(["asc", "desc"]);

function invalidQuery() {
  return new ApiError(
    400,
    "INVALID_QUERY",
    "쿼리 값이 올바르지 않습니다.",
  );
}

function parsePositiveInteger(value, defaultValue) {
  if (value === undefined) return defaultValue;
  if (!/^[1-9]\d*$/.test(value)) throw invalidQuery();
  return Number(value);
}

export function parseCompanyId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new ApiError(
      400,
      "INVALID_PATH_PARAMETER",
      "경로 매개변수가 올바르지 않습니다.",
    );
  }

  return Number(value);
}

export function parseCompanyInvestmentsQuery(query) {
  const page = parsePositiveInteger(query.page, DEFAULT_PAGE);
  const limit = parsePositiveInteger(query.limit, DEFAULT_LIMIT);

  if (limit > MAX_LIMIT) throw invalidQuery();

  return { page, limit };
}

export function parseCompaniesQuery(query) {
  const page = parsePositiveInteger(query.page, DEFAULT_PAGE);
  const limit = parsePositiveInteger(query.limit, DEFAULT_LIMIT);
  const search = query.search?.trim() || undefined;
  const sortBy = query.sortBy;
  const order = query.order;

  if (limit > MAX_LIMIT) throw invalidQuery();
  if (sortBy !== undefined && !SORT_FIELDS.has(sortBy)) throw invalidQuery();
  if (order !== undefined && !SORT_ORDERS.has(order)) throw invalidQuery();
  if (order !== undefined && sortBy === undefined) throw invalidQuery();

  return {
    page,
    limit,
    search,
    sortBy,
    order: sortBy === undefined ? undefined : order || "asc",
  };
}
