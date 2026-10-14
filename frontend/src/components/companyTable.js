import { formatKoreanAmount } from "../utils/amount.js";

export const COMPANY_IDENTITY_COLUMNS = [
  { key: "name", label: "기업 명", width: "150px" },
  { key: "description", label: "기업 소개" },
  { key: "category", label: "카테고리", width: "90px" },
];

export const COMPANY_METRIC_COLUMNS = [
  {
    key: "actualInvestment",
    label: "누적 투자 금액",
    width: "120px",
    render: (company) => formatKoreanAmount(company.actualInvestment),
  },
  {
    key: "revenue",
    label: "매출액",
    width: "100px",
    render: (company) => formatKoreanAmount(company.revenue),
  },
  {
    key: "employees",
    label: "고용 인원",
    width: "88px",
    render: (company) => `${company.employees}명`,
  },
];
