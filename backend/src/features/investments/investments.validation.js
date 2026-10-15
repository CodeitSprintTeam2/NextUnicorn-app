import { ApiError } from "../../errors/api-error.js";

const MAX_DATABASE_INT = 2_147_483_647;
const MAX_AMOUNT = 9_223_372_036_854_775_807n;
const VALIDATION_MESSAGE = "요청 값이 올바르지 않습니다.";

function addLengthError(details, field, value, min, max) {
  if (typeof value !== "string" || value.length < min || value.length > max) {
    details.push({ field, reason: `${min}~${max}자여야 합니다.` });
  }
}

function parseCompanyId(value, details) {
  if (!Number.isInteger(value) || value < 1 || value > MAX_DATABASE_INT) {
    details.push({
      field: "companyId",
      reason: "존재하는 기업의 ID여야 합니다.",
    });
    return undefined;
  }

  return value;
}

function parseAmount(value, details) {
  const reason = "1 이상 9223372036854775807 이하의 정수 문자열이어야 합니다.";

  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    details.push({ field: "amount", reason });
    return undefined;
  }

  const amount = BigInt(value);
  if (amount < 1n || amount > MAX_AMOUNT) {
    details.push({ field: "amount", reason });
    return undefined;
  }

  return amount;
}

export function parseCreateInvestmentBody(body) {
  const input = body && typeof body === "object" ? body : {};
  const details = [];
  const companyId = parseCompanyId(input.companyId, details);
  const investorName = typeof input.investorName === "string"
    ? input.investorName.trim()
    : "";
  const comment = typeof input.comment === "string" ? input.comment.trim() : "";
  const password = input.password;
  const amount = parseAmount(input.amount, details);

  addLengthError(details, "investorName", investorName, 1, 20);
  addLengthError(details, "comment", comment, 1, 200);
  addLengthError(details, "password", password, 4, 20);

  if (password !== input.passwordConfirm) {
    details.push({
      field: "passwordConfirm",
      reason: "비밀번호와 일치해야 합니다.",
    });
  }

  if (details.length > 0) {
    throw new ApiError(400, "VALIDATION_ERROR", VALIDATION_MESSAGE, details);
  }

  return { companyId, investorName, amount, comment, password };
}
