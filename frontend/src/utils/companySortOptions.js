import { createSortOptions } from "./sort.js";

const INVESTMENT_SORT_OPTIONS = createSortOptions(
  "actualInvestment", "누적 투자 금액 높은 순", "누적 투자 금액 낮은 순",
);
const REVENUE_SORT_OPTIONS = createSortOptions(
  "revenue", "매출액 높은 순", "매출액 낮은 순",
);
const EMPLOYEE_SORT_OPTIONS = createSortOptions(
  "employees", "고용 인원 많은 순", "고용 인원 적은 순",
);

export const COMPANY_LIST_SORT_OPTIONS = [
  ...REVENUE_SORT_OPTIONS,
  ...INVESTMENT_SORT_OPTIONS,
  ...EMPLOYEE_SORT_OPTIONS,
];

export const COMPANY_COMPARISON_SORT_OPTIONS = [
  ...INVESTMENT_SORT_OPTIONS,
  ...REVENUE_SORT_OPTIONS,
  ...EMPLOYEE_SORT_OPTIONS,
];

export const COMPANY_RANKING_SORT_OPTIONS = [
  ...REVENUE_SORT_OPTIONS,
  ...EMPLOYEE_SORT_OPTIONS,
];
