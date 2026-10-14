import assert from "node:assert/strict";
import test from "node:test";
import { parseCompaniesQuery } from "../src/features/companies/companies.query.js";

test("parseCompaniesQuery applies defaults", () => {
  assert.deepEqual(parseCompaniesQuery({}), {
    page: 1,
    limit: 10,
    search: undefined,
    sortBy: undefined,
    order: undefined,
  });
});

test("parseCompaniesQuery accepts the API sort fields", () => {
  assert.deepEqual(
    parseCompaniesQuery({
      page: "2",
      limit: "20",
      search: "  코드  ",
      sortBy: "actualInvestment",
      order: "desc",
    }),
    {
      page: 2,
      limit: 20,
      search: "코드",
      sortBy: "actualInvestment",
      order: "desc",
    },
  );
});

test("parseCompaniesQuery rejects invalid values", () => {
  const invalidQueries = [
    { page: "0" },
    { page: "1.5" },
    { limit: "101" },
    { sortBy: "totalInvestment" },
    { sortBy: "name" },
    { sortBy: "revenue", order: "newest" },
    { order: "asc" },
  ];

  for (const query of invalidQueries) {
    assert.throws(
      () => parseCompaniesQuery(query),
      (error) => error.code === "INVALID_QUERY" && error.status === 400,
    );
  }
});
