import test from "node:test";
import assert from "node:assert/strict";

test("formats large won values without losing integer precision", async () => {
  const module = await import("../src/utils/amount.js").catch(() => ({}));

  assert.equal(module.formatKoreanAmount?.("12345678901234567890"), "123,456,789,012.3억 원");
  assert.equal(module.formatKoreanAmount?.("0"), "0원");
});

test("accepts the PostgreSQL BIGINT maximum amount and rejects overflow", async () => {
  const module = await import("../src/utils/validation.js").catch(() => ({}));

  assert.equal(module.isValidAmount?.("9223372036854775807"), true);
  assert.equal(module.isValidAmount?.("9223372036854775808"), false);
  assert.equal(module.isValidAmount?.("1.5"), false);
});

test("comparison requires one to five unique companies distinct from the own company", async () => {
  const module = await import("../src/utils/comparison.js").catch(() => ({}));

  assert.equal(module.canSubmitComparison?.(1, [2]), true);
  assert.equal(module.canSubmitComparison?.(1, []), false);
  assert.equal(module.canSubmitComparison?.(1, [1]), false);
  assert.equal(module.canSubmitComparison?.(1, [2, 2]), false);
  assert.equal(module.canSubmitComparison?.(1, [2, 3, 4, 5, 6, 7]), false);
});
