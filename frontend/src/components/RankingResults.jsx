import { CompanyDataTable } from "./CompanyDataTable.jsx";
import { formatKoreanAmount } from "../utils/amount.js";

const columns = [
  { key: "rank", label: "순위", width: "62px" },
  { key: "name", label: "기업 명", width: "150px" },
  { key: "description", label: "기업 소개", render: (row) => <span className="company-description">{row.description}</span> },
  { key: "category", label: "카테고리", width: "90px" },
  { key: "actualInvestment", label: "누적 투자 금액", width: "120px", render: (row) => formatKoreanAmount(row.actualInvestment) },
  { key: "revenue", label: "매출액", width: "100px", render: (row) => formatKoreanAmount(row.revenue) },
  { key: "employees", label: "고용 인원", width: "90px", render: (row) => `${row.employees}명` },
];

export function RankingResults({ companies = [] }) {
  const rows = companies.map((item) => ({ ...item.company, rank: item.rank }));
  return <CompanyDataTable rows={rows} columns={columns} rowHref={(company) => `/companies/${company.id}`} />;
}
