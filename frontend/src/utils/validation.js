const BIGINT_MAX = 9_223_372_036_854_775_807n;

export function isValidAmount(value) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return false;

  try {
    const amount = BigInt(value);
    return amount >= 1n && amount <= BIGINT_MAX;
  } catch {
    return false;
  }
}

export function validateInvestment(values, { mode = "create" } = {}) {
  const errors = {};
  const investorName = values.investorName?.trim() ?? "";
  const comment = values.comment?.trim() ?? "";
  const password = values.password ?? "";

  if (investorName.length < 1 || investorName.length > 20) {
    errors.investorName = "투자자 이름은 1자 이상 20자 이하로 입력해 주세요.";
  }
  if (!isValidAmount(values.amount ?? "")) {
    errors.amount = "투자 금액은 1 이상 9223372036854775807 이하의 정수로 입력해 주세요.";
  }
  if (comment.length < 1 || comment.length > 200) {
    errors.comment = "투자 코멘트는 1자 이상 200자 이하로 입력해 주세요.";
  }
  if (password.length < 4 || password.length > 20) {
    errors.password = "비밀번호는 4자 이상 20자 이하로 입력해 주세요.";
  }
  if (mode === "create" && password !== (values.passwordConfirm ?? "")) {
    errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
  }

  return errors;
}
