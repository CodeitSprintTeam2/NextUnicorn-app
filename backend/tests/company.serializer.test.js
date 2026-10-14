import assert from "node:assert/strict";
import test from "node:test";
import { serializeCompany } from "../src/features/companies/company.serializer.js";

test("serializeCompany returns the API contract fields", () => {
  const company = {
    id: 1,
    name: "코드잇",
    description: "온라인 코딩 교육 스타트업",
    actualInvestment: 5_000_000_000n,
    revenue: 1_200_000_000n,
    employees: 80,
    category: { name: "교육" },
  };

  assert.deepEqual(serializeCompany(company), {
    id: 1,
    name: "코드잇",
    description: "온라인 코딩 교육 스타트업",
    category: "교육",
    actualInvestment: "5000000000",
    revenue: "1200000000",
    employees: 80,
  });
});

test("serializeCompany preserves large amounts as decimal strings", () => {
  const amount = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
  const company = {
    id: 2,
    name: "큰금액",
    description: "안전 정수 범위를 넘는 금액 테스트",
    actualInvestment: amount,
    revenue: amount,
    employees: 1,
    category: { name: "기타" },
  };

  const serialized = serializeCompany(company);

  assert.equal(serialized.actualInvestment, amount.toString());
  assert.equal(serialized.revenue, amount.toString());
});
