import { createSortOptions } from "../../utils/sort.js";

export const INVESTMENT_MODE = {
  create: "create",
  update: "update",
  delete: "delete",
};

export const INVESTMENT_LIMITS = {
  investorName: { min: 1, max: 20 },
  comment: { min: 1, max: 200 },
  password: { min: 4, max: 20 },
  amount: { min: 1n, max: 9223372036854775807n },
};

export const INVESTMENT_MESSAGES = {
  investorName: "투자자 이름은 1자 이상 20자 이하로 입력해 주세요.",
  amount: "투자 금액은 1 이상 9223372036854775807 이하의 정수로 입력해 주세요.",
  comment: "투자 코멘트는 1자 이상 200자 이하로 입력해 주세요.",
  password: "비밀번호는 4자 이상 20자 이하로 입력해 주세요.",
  passwordConfirm: "비밀번호가 일치하지 않습니다.",
};

export const INVESTMENT_STATUS_SORT_OPTIONS = [
  ...createSortOptions(
    "virtualInvestment", "가상 투자 합계 높은 순", "가상 투자 합계 낮은 순",
  ),
  ...createSortOptions(
    "actualInvestment", "실제 누적 투자 금액 높은 순", "실제 누적 투자 금액 낮은 순",
  ),
];
