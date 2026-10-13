import { useEffect, useMemo, useState } from "react";
import { getComparisonStatus } from "../api/comparisons.js";
import { classifyApiError } from "../api/errors.js";
import { CompanyDataTable } from "../components/CompanyDataTable.jsx";
import { FeedbackState } from "../components/FeedbackState.jsx";
import { Pagination } from "../components/Pagination.jsx";
import "./StatusPages.css";

const PAGE_SIZE = 10;
const sortOptions = [
  { value: "myCompanySelections:desc", label: "내 기업 선택 횟수 높은 순" },
  { value: "myCompanySelections:asc", label: "내 기업 선택 횟수 낮은 순" },
  { value: "comparisonSelections:desc", label: "비교 기업 선택 횟수 높은 순" },
  { value: "comparisonSelections:asc", label: "비교 기업 선택 횟수 낮은 순" },
];

export function ComparisonStatusPage() {
  const [page, setPage] = useState(1);
  const [sortValue, setSortValue] = useState("myCompanySelections:desc");
  const [refreshKey, setRefreshKey] = useState(0);
  const [result, setResult] = useState({ state: "loading", rows: [], meta: null, message: "" });
  const [sortBy, order] = sortValue.split(":");

  useEffect(() => {
    let active = true;
    setResult((current) => ({ ...current, state: "loading", message: "" }));
    getComparisonStatus({ page, limit: PAGE_SIZE, sortBy, order })
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

  const columns = useMemo(() => [
    { key: "rank", label: "순위", width: "60px", render: (_row, index) => (page - 1) * PAGE_SIZE + index + 1 },
    { key: "name", label: "기업 명", width: "160px" },
    { key: "description", label: "기업 소개", render: (row) => <span className="status-description">{row.description}</span> },
    { key: "category", label: "카테고리", width: "110px" },
    { key: "myCompanySelections", label: "내 기업 선택 횟수", width: "130px", render: (row) => `${row.myCompanySelections}회` },
    { key: "comparisonSelections", label: "비교 기업 선택 횟수", width: "140px", render: (row) => `${row.comparisonSelections}회` },
  ], [page]);

  const rows = useMemo(() => result.rows.map((item) => ({
    ...item.company,
    myCompanySelections: item.myCompanySelections,
    comparisonSelections: item.comparisonSelections,
  })), [result.rows]);

  function changeSort(value) {
    setSortValue(value);
    setPage(1);
  }

  return (
    <section className="status-page">
      <div className="page-heading"><h1 className="page-title">비교 현황</h1></div>
      <div className="status-page__toolbar">
        <label className="status-page__sort">
          <span className="visually-hidden">비교 현황 정렬</span>
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
