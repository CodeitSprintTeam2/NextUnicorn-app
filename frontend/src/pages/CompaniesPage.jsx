import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listCompanies } from "../api/companies.js";
import { classifyApiError } from "../api/errors.js";
import { CompanyDataTable } from "../components/CompanyDataTable.jsx";
import { FeedbackState } from "../components/FeedbackState.jsx";
import { Pagination } from "../components/Pagination.jsx";
import { SearchSortBar } from "../components/SearchSortBar.jsx";
import { formatKoreanAmount } from "../utils/amount.js";
import "./CompaniesPage.css";

const PAGE_SIZE = 10;

const sortOptions = [
  { value: "revenue:desc", label: "매출액 높은 순" },
  { value: "revenue:asc", label: "매출액 낮은 순" },
  { value: "actualInvestment:desc", label: "누적 투자 금액 높은 순" },
  { value: "actualInvestment:asc", label: "누적 투자 금액 낮은 순" },
  { value: "employees:desc", label: "고용 인원 많은 순" },
  { value: "employees:asc", label: "고용 인원 적은 순" },
];

export function CompaniesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState("revenue:desc");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [result, setResult] = useState({ state: "loading", rows: [], meta: null, message: "" });

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearch(searchInput.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const [sortBy, order] = sortValue.split(":");

  useEffect(() => {
    let active = true;
    setResult((current) => ({ ...current, state: "loading", message: "" }));
    listCompanies({ page, limit: PAGE_SIZE, search: search || undefined, sortBy, order })
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
  }, [page, search, sortBy, order, refreshKey]);

  const columns = useMemo(() => [
    { key: "rowNumber", label: "순위", width: "54px", render: (_row, index) => (page - 1) * PAGE_SIZE + index + 1 },
    { key: "name", label: "기업 명", width: "150px" },
    { key: "description", label: "기업 소개", render: (row) => <span className="company-description">{row.description}</span> },
    { key: "category", label: "카테고리", width: "90px" },
    { key: "actualInvestment", label: "누적 투자 금액", width: "120px", render: (row) => formatKoreanAmount(row.actualInvestment) },
    { key: "revenue", label: "매출액", width: "100px", render: (row) => formatKoreanAmount(row.revenue) },
    { key: "employees", label: "고용 인원", width: "88px", render: (row) => `${row.employees}명` },
  ], [page]);

  function handleSearchChange(value) {
    setSearchInput(value);
    setPage(1);
  }

  function handleSortChange(value) {
    setSortValue(value);
    setPage(1);
  }

  function retry() {
    setRefreshKey((current) => current + 1);
  }

  return (
    <section className="companies-page">
      <div className="page-heading">
        <h1 className="page-title">전체 스타트업 목록</h1>
        <Link className="button button--outline companies-page__compare" to="/compare">기업 비교하기</Link>
      </div>
      <SearchSortBar
        search={searchInput}
        onSearchChange={handleSearchChange}
        sortValue={sortValue}
        sortOptions={sortOptions}
        onSortChange={handleSortChange}
      />
      {result.state === "ready" ? (
        <>
          <CompanyDataTable rows={result.rows} columns={columns} rowHref={(row) => `/companies/${row.id}`} />
          <Pagination page={result.meta?.page ?? page} totalPages={result.meta?.totalPages ?? 0} onChange={setPage} />
        </>
      ) : (
        <FeedbackState
          state={result.state}
          message={result.message || undefined}
          onRetry={result.state === "error" || result.state === "unavailable" ? retry : undefined}
        />
      )}
    </section>
  );
}
