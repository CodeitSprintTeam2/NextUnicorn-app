import { ApiError } from "../../errors/api-error.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const DEFAULT_SORT_FIELD = "virtualInvestment";
const DEFAULT_SORT_ORDER = "desc";
const ALLOWED_QUERY_FIELDS = new Set(["page", "limit", "sortBy", "order"]);
const SORT_FIELDS = new Set(["virtualInvestment", "actualInvestment"]);
const SORT_ORDERS = new Set(["asc", "desc"]);

function invalidQuery() {
  return new ApiError(400, "INVALID_QUERY", "쿼리 값이 올바르지 않습니다.");
}

function parsePositiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw invalidQuery();
  }

  const number = Number(value);
  if (!Number.isSafeInteger(number)) throw invalidQuery();
  return number;
}

export function parseInvestmentStatusQuery(query) {
  if (Object.keys(query).some((key) => !ALLOWED_QUERY_FIELDS.has(key))) {
    throw invalidQuery();
  }

  const page = parsePositiveInteger(query.page, DEFAULT_PAGE);
  const limit = parsePositiveInteger(query.limit, DEFAULT_LIMIT);

  if (limit > MAX_LIMIT || !Number.isSafeInteger((page - 1) * limit)) {
    throw invalidQuery();
  }
  if (query.sortBy !== undefined && !SORT_FIELDS.has(query.sortBy)) {
    throw invalidQuery();
  }
  if (query.order !== undefined && !SORT_ORDERS.has(query.order)) {
    throw invalidQuery();
  }
  if (query.order !== undefined && query.sortBy === undefined) {
    throw invalidQuery();
  }

  return {
    page,
    limit,
    sortBy: query.sortBy ?? DEFAULT_SORT_FIELD,
    order: query.order ?? DEFAULT_SORT_ORDER,
  };
}
