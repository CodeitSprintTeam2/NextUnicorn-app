import { createSortOptions } from "../../utils/sort.js";

export const MIN_COMPARE_COMPANIES = 1;
export const MAX_COMPARE_COMPANIES = 5;
export const MAX_RECENT_COMPANIES = 5;
export const SELECTION_SEARCH_DELAY_MS = 200;

export const COMPARISON_STEP = { select: "select", results: "results" };
export const SELECTION_MODE = {
  myCompany: "my-company",
  compareCompanies: "compare-companies",
};

export const COMPARISON_STATUS_SORT_OPTIONS = [
  ...createSortOptions(
    "myCompanySelections", "내 기업 선택 횟수 높은 순", "내 기업 선택 횟수 낮은 순",
  ),
  ...createSortOptions(
    "comparisonSelections", "비교 기업 선택 횟수 높은 순", "비교 기업 선택 횟수 낮은 순",
  ),
];
