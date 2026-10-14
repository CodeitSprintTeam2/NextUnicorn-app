import {
  INVESTMENT_LIMITS,
  INVESTMENT_MESSAGES,
  INVESTMENT_MODE,
} from "./investment.constants.js";

function hasValidLength(value, limits) {
  return value.length >= limits.min && value.length <= limits.max;
}

export function validatePassword(password = "") {
  return hasValidLength(password, INVESTMENT_LIMITS.password)
    ? undefined
    : INVESTMENT_MESSAGES.password;
}

function isValidAmount(value = "") {
  if (!/^\d+$/.test(value)) return false;

  try {
    const amount = BigInt(value);
    return amount >= INVESTMENT_LIMITS.amount.min
      && amount <= INVESTMENT_LIMITS.amount.max;
  } catch {
    return false;
  }
}

export function validateInvestment(values, { mode = INVESTMENT_MODE.create } = {}) {
  const errors = {};
  const investorName = values.investorName?.trim() ?? "";
  const comment = values.comment?.trim() ?? "";
  const password = values.password ?? "";

  if (!hasValidLength(investorName, INVESTMENT_LIMITS.investorName)) {
    errors.investorName = INVESTMENT_MESSAGES.investorName;
  }
  if (!isValidAmount(values.amount)) {
    errors.amount = INVESTMENT_MESSAGES.amount;
  }
  if (!hasValidLength(comment, INVESTMENT_LIMITS.comment)) {
    errors.comment = INVESTMENT_MESSAGES.comment;
  }

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  if (mode === INVESTMENT_MODE.create && password !== (values.passwordConfirm ?? "")) {
    errors.passwordConfirm = INVESTMENT_MESSAGES.passwordConfirm;
  }

  return errors;
}
