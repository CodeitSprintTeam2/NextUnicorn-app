import assert from "node:assert/strict";
import test from "node:test";
import {
  serializeCompany,
  sumActiveInvestments,
} from "../src/features/companies/company.serializer.js";

test("sumActiveInvestments excludes deleted investments", () => {
  assert.equal(
    sumActiveInvestments([
      { amount: 2_000_000_000n },
      { amount: 3_000_000_000n, deletedAt: null },
      { amount: 9_000_000_000n, deletedAt: new Date() },
    ]),
    5_000_000_000n,
  );
});

test("serializeCompany returns the API contract fields as numbers", () => {
  const company = {
    id: 1,
    name: "코드잇",
    description: "온라인 코딩 교육 스타트업",
    revenue: 1_200_000_000n,
    employees: 80,
    category: { name: "교육" },
    investments: [{ amount: 2_000_000_000n }, { amount: 3_000_000_000n }],
  };

  assert.deepEqual(serializeCompany(company), {
    id: 1,
    name: "코드잇",
    description: "온라인 코딩 교육 스타트업",
    category: "교육",
    totalInvestment: 5_000_000_000,
    revenue: 1_200_000_000,
    employees: 80,
  });
});

test("serializeCompany returns zero when a company has no investments", () => {
  const company = {
    id: 2,
    name: "투자없음",
    description: "투자 내역이 없는 기업",
    revenue: 0n,
    employees: 1,
    category: { name: "기타" },
    investments: [],
  };

  assert.equal(serializeCompany(company).totalInvestment, 0);
});

test("serializeCompany rejects amounts outside the safe integer range", () => {
  const company = {
    id: 3,
    name: "범위초과",
    description: "안전 정수 범위 테스트",
    revenue: BigInt(Number.MAX_SAFE_INTEGER) + 1n,
    employees: 1,
    category: { name: "기타" },
    investments: [],
  };

  assert.throws(() => serializeCompany(company), RangeError);
});
