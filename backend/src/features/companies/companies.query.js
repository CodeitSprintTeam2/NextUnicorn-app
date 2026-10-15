import { ApiError } from "../../errors/api-error.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const MAX_DATABASE_INT = 2_147_483_647;
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

  const parsedValue = Number(value);
  if (!Number.isSafeInteger(parsedValue)) throw invalidQuery();

  return parsedValue;
}

function validatePaginationRange(page, limit) {
  if (!Number.isSafeInteger((page - 1) * limit)) throw invalidQuery();
}

export function parseCompanyId(value) {
  const companyId = Number(value);

  if (
    !/^[1-9]\d*$/.test(value) ||
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

export function parseCompanyInvestmentsQuery(query) {
  const page = parsePositiveInteger(query.page, DEFAULT_PAGE);
  const limit = parsePositiveInteger(query.limit, DEFAULT_LIMIT);

  if (limit > MAX_LIMIT) throw invalidQuery();
  validatePaginationRange(page, limit);

  return { page, limit };
}

export function parseCompaniesQuery(query) {
  const page = parsePositiveInteger(query.page, DEFAULT_PAGE);
  const limit = parsePositiveInteger(query.limit, DEFAULT_LIMIT);
  const search = query.search?.trim() || undefined;
  const sortBy = query.sortBy;
  const order = query.order;

  if (limit > MAX_LIMIT) throw invalidQuery();
  validatePaginationRange(page, limit);
  if (sortBy !== undefined && !SORT_FIELDS.has(sortBy)) throw invalidQuery();
  if (order !== undefined && !SORT_ORDERS.has(order)) throw invalidQuery();
  if (order !== undefined && sortBy === undefined) throw invalidQuery();

  return {
    page,
    limit,
    search,
    sortBy,
    order: sortBy === undefined ? undefined : order || "desc",
  };
}
