import { useMemo } from "react";
import { CompanyDataTable } from "./CompanyDataTable.jsx";
import { formatKoreanAmount } from "../utils/amount.js";
import "./ComparisonResults.css";

const columns = [
  { key: "name", label: "기업 명", width: "160px" },
  { key: "description", label: "기업 소개", render: (row) => <span className="comparison-description">{row.description}</span> },
  { key: "category", label: "카테고리", width: "90px" },
  { key: "actualInvestment", label: "누적 투자 금액", width: "120px", render: (row) => formatKoreanAmount(row.actualInvestment) },
  { key: "revenue", label: "매출액", width: "100px", render: (row) => formatKoreanAmount(row.revenue) },
  { key: "employees", label: "고용 인원", width: "90px", render: (row) => `${row.employees}명` },
];

function compareBigInts(left, right) {
  try {
    const a = BigInt(left ?? 0);
    const b = BigInt(right ?? 0);
    return a < b ? -1 : a > b ? 1 : 0;
  } catch {
    return 0;
  }
}

export function ComparisonResults({ myCompany, compareCompanies = [], sortBy = "revenue", order = "desc" }) {
  const rows = useMemo(() => {
    const all = [myCompany, ...compareCompanies].filter(Boolean);
    return [...all].sort((left, right) => {
      const result = sortBy === "employees"
        ? Number(left.employees ?? 0) - Number(right.employees ?? 0)
        : compareBigInts(left[sortBy], right[sortBy]);
      if (result !== 0) return order === "asc" ? result : -result;
      return Number(left.id) - Number(right.id);
    });
  }, [myCompany, compareCompanies, sortBy, order]);

  return (
    <div className="comparison-results">
      <CompanyDataTable rows={rows} columns={columns} rowHref={(company) => `/companies/${company.id}`} />
    </div>
  );
}
