import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCompany, listCompanyInvestments } from "../api/companies.js";
import { classifyApiError } from "../api/errors.js";
import { CompanyDataTable } from "../components/CompanyDataTable.jsx";
import { CompanyMark } from "../components/CompanyMark.jsx";
import { FeedbackState } from "../components/FeedbackState.jsx";
import { InvestmentDialogs } from "../components/InvestmentDialogs.jsx";
import { Pagination } from "../components/Pagination.jsx";
import { formatKoreanAmount } from "../utils/amount.js";
import "./CompanyDetailPage.css";

const PAGE_SIZE = 10;

function useRequest(load, dependencies) {
  const [result, setResult] = useState({ state: "loading", data: null, meta: null, message: "" });
  useEffect(() => {
    let active = true;
    setResult({ state: "loading", data: null, meta: null, message: "" });
    load()
      .then((response) => {
        if (!active) return;
        setResult({
          state: response.data?.length === 0 ? "empty" : "ready",
          data: response.data ?? response,
          meta: response.meta ?? null,
          message: "",
        });
      })
      .catch((error) => {
        if (!active) return;
        const failure = classifyApiError(error);
        setResult({ state: failure.kind === "unavailable" ? "unavailable" : "error", data: null, meta: null, message: failure.message });
      });
    return () => { active = false; };
  // The dependency list is composed by the page and remains primitive.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  return [result, setResult];
}

export function CompanyDetailPage() {
  const { companyId } = useParams();
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogMode, setDialogMode] = useState(null);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [companyResult] = useRequest(() => getCompany(companyId), [companyId, refreshKey]);
  const [investmentsResult] = useRequest(
    () => listCompanyInvestments(companyId, { page, limit: PAGE_SIZE }),
    [companyId, page, refreshKey],
  );
  const company = companyResult.data?.data ?? companyResult.data;

  const columns = useMemo(() => [
    { key: "rank", label: "순위", width: "56px", render: (_row, index) => (page - 1) * PAGE_SIZE + index + 1 },
    { key: "name", label: "투자자 이름", width: "150px" },
    { key: "amount", label: "투자 금액", width: "130px", render: (row) => formatKoreanAmount(row.amount) },
    { key: "comment", label: "투자 코멘트", render: (row) => <span className="investment-comment">{row.comment}</span> },
    {
      key: "actions",
      label: "",
      width: "58px",
      render: (row) => (
        <details className="investment-row-menu">
          <summary aria-label={`${row.investorName} 투자 내역 메뉴`}>⋮</summary>
          <div className="investment-row-menu__items">
            <button type="button" onClick={(event) => { event.currentTarget.closest("details").open = false; setSelectedInvestment(row); setDialogMode("update"); }}>수정하기</button>
            <button type="button" onClick={(event) => { event.currentTarget.closest("details").open = false; setSelectedInvestment(row); setDialogMode("delete"); }}>삭제하기</button>
          </div>
        </details>
      ),
    },
  ], [page]);

  const tableRows = useMemo(() => (investmentsResult.data ?? []).map((investment) => ({
    ...investment,
    name: investment.investorName,
    description: investment.comment,
  })), [investmentsResult.data]);

  function openCreate() {
    setSelectedInvestment(null);
    setDialogMode("create");
  }

  function closeDialog() {
    setDialogMode(null);
    setSelectedInvestment(null);
  }

  function refreshAfterChange() {
    setPage(1);
    setRefreshKey((current) => current + 1);
  }

  return (
    <section className="company-detail-page">
      <div className="company-detail-page__back-row">
        <Link className="back-link" to="/companies">‹ 전체 스타트업 목록</Link>
      </div>
      {companyResult.state === "ready" ? (
        <>
          <header className="company-profile">
            <CompanyMark company={company} size="lg" />
            <div>
              <h1>{company.name}</h1>
              <p>{company.category}</p>
            </div>
          </header>
          <div className="company-metrics" aria-label="기업 주요 지표">
            <Metric label="누적 투자 금액" value={formatKoreanAmount(company.actualInvestment)} />
            <Metric label="매출액" value={formatKoreanAmount(company.revenue)} />
            <Metric label="고용 인원" value={`${company.employees}명`} />
          </div>
          <section className="company-about">
            <h2>기업 소개</h2>
            <p>{company.description}</p>
          </section>
          <section className="company-investments">
            <div className="company-investments__heading">
              <div>
                <h2>View My Startup에서 받은 투자</h2>
                <p>총 {formatKoreanAmount(company.virtualInvestment)}</p>
              </div>
              <button className="button" type="button" onClick={openCreate}>기업에 투자하기</button>
            </div>
            {investmentsResult.state === "ready" && tableRows.length > 0 ? (
              <>
                <CompanyDataTable rows={tableRows} columns={columns} />
                <Pagination page={investmentsResult.meta?.page ?? page} totalPages={investmentsResult.meta?.totalPages ?? 0} onChange={setPage} />
              </>
            ) : investmentsResult.state === "empty" ? (
              <FeedbackState state="empty" compact title="아직 투자 내역이 없어요" message="이 기업에 첫 가상 투자를 등록해 보세요." />
            ) : (
              <FeedbackState
                state={investmentsResult.state}
                message={investmentsResult.message || undefined}
                compact={investmentsResult.state === "loading"}
                onRetry={investmentsResult.state === "error" || investmentsResult.state === "unavailable" ? refreshAfterChange : undefined}
              />
            )}
          </section>
          <InvestmentDialogs
            company={company}
            mode={dialogMode}
            investment={selectedInvestment}
            onClose={closeDialog}
            onChanged={refreshAfterChange}
          />
        </>
      ) : (
        <>
          <div className="page-heading"><h1 className="page-title">기업 상세</h1></div>
          <FeedbackState
            state={companyResult.state}
            message={companyResult.message || undefined}
            onRetry={() => setRefreshKey((current) => current + 1)}
          />
        </>
      )}
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="company-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
