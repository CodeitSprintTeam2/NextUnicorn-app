import { useEffect, useMemo, useState } from "react";
import { getInvestmentStatus } from "../api/investments.js";
import { classifyApiError } from "../api/errors.js";
import { CompanyDataTable } from "../components/CompanyDataTable.jsx";
import { FeedbackState } from "../components/FeedbackState.jsx";
import { Pagination } from "../components/Pagination.jsx";
import { formatKoreanAmount } from "../utils/amount.js";
import "./StatusPages.css";

const PAGE_SIZE = 10;
const sortOptions = [
  { value: "virtualInvestment:desc", label: "가상 투자 합계 높은 순" },
  { value: "virtualInvestment:asc", label: "가상 투자 합계 낮은 순" },
  { value: "actualInvestment:desc", label: "실제 누적 투자 금액 높은 순" },
  { value: "actualInvestment:asc", label: "실제 누적 투자 금액 낮은 순" },
];

export function InvestmentsPage() {
  const [page, setPage] = useState(1);
  const [sortValue, setSortValue] = useState("virtualInvestment:desc");
  const [refreshKey, setRefreshKey] = useState(0);
  const [result, setResult] = useState({ state: "loading", rows: [], meta: null, message: "" });
  const [sortBy, order] = sortValue.split(":");

  useEffect(() => {
    let active = true;
    setResult((current) => ({ ...current, state: "loading", message: "" }));
    getInvestmentStatus({ page, limit: PAGE_SIZE, sortBy, order })
      .then((response) => {
        if (!active) return;
        setResult({ state: response.data?.length ? "ready" : "empty", rows: response.data ?? [], meta: response.meta ?? null, message: "" });
      })
      .catch((error) => {
        if (!active) return;
        const failure = classifyApiError(error);
        setResult({ state: failure.kind === "unavailable" ? "unavailable" : "error", rows: [], meta: null, message: failure.message });
      });
    return () => { active = false; };
  }, [page, sortBy, order, refreshKey]);

  const rows = useMemo(() => result.rows.map((item) => ({
    ...item.company,
    rank: item.rank,
    virtualInvestment: item.virtualInvestment,
    actualInvestment: item.actualInvestment,
  })), [result.rows]);

  const columns = [
    { key: "rank", label: "순위", width: "60px" },
    { key: "name", label: "기업 명", width: "160px" },
    { key: "description", label: "기업 소개", render: (row) => <span className="status-description">{row.description}</span> },
    { key: "category", label: "카테고리", width: "110px" },
    { key: "virtualInvestment", label: "가상 투자 합계", width: "140px", render: (row) => formatKoreanAmount(row.virtualInvestment) },
    { key: "actualInvestment", label: "실제 누적 투자 금액", width: "160px", render: (row) => formatKoreanAmount(row.actualInvestment) },
  ];

  function changeSort(value) {
    setSortValue(value);
    setPage(1);
  }

  return (
    <section className="status-page">
      <div className="page-heading"><h1 className="page-title">투자 현황</h1></div>
      <div className="status-page__toolbar">
        <label className="status-page__sort">
          <span className="visually-hidden">투자 현황 정렬</span>
          <select value={sortValue} onChange={(event) => changeSort(event.target.value)}>
            {sortOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>
      {result.state === "ready" ? (
        <>
          <CompanyDataTable rows={rows} columns={columns} rowHref={(row) => `/companies/${row.id}`} />
          <Pagination page={result.meta?.page ?? page} totalPages={result.meta?.totalPages ?? 0} onChange={setPage} />
        </>
      ) : (
        <FeedbackState
          state={result.state}
          message={result.message || undefined}
          onRetry={result.state === "error" || result.state === "unavailable" ? () => setRefreshKey((current) => current + 1) : undefined}
        />
      )}
    </section>
  );
}
