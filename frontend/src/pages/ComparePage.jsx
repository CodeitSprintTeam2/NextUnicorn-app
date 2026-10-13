import { useEffect, useState } from "react";
import { getCompanyRanking, submitComparison } from "../api/comparisons.js";
import { classifyApiError } from "../api/errors.js";
import { CompanyMark } from "../components/CompanyMark.jsx";
import { CompanySelectionDialog } from "../components/CompanySelectionDialog.jsx";
import { ComparisonResults } from "../components/ComparisonResults.jsx";
import { FeedbackState } from "../components/FeedbackState.jsx";
import { InvestmentDialogs } from "../components/InvestmentDialogs.jsx";
import { Modal } from "../components/Modal.jsx";
import { RankingResults } from "../components/RankingResults.jsx";
import { canSubmitComparison, toggleCompanySelection } from "../utils/comparison.js";
import "./ComparePage.css";

const compareSorts = [
  { value: "actualInvestment:desc", label: "누적 투자 금액 높은 순" },
  { value: "actualInvestment:asc", label: "누적 투자 금액 낮은 순" },
  { value: "revenue:desc", label: "매출액 높은 순" },
  { value: "revenue:asc", label: "매출액 낮은 순" },
  { value: "employees:desc", label: "고용 인원 많은 순" },
  { value: "employees:asc", label: "고용 인원 적은 순" },
];

const rankingSorts = [
  { value: "revenue:desc", label: "매출액 높은 순" },
  { value: "revenue:asc", label: "매출액 낮은 순" },
  { value: "employees:desc", label: "고용 인원 많은 순" },
  { value: "employees:asc", label: "고용 인원 적은 순" },
];

export function ComparePage() {
  const [myCompany, setMyCompany] = useState(null);
  const [compareCompanies, setCompareCompanies] = useState([]);
  const [recentMyCompanies, setRecentMyCompanies] = useState([]);
  const [selectionMode, setSelectionMode] = useState(null);
  const [step, setStep] = useState("select");
  const [comparison, setComparison] = useState(null);
  const [sortValue, setSortValue] = useState("actualInvestment:desc");
  const [rankingSortValue, setRankingSortValue] = useState("revenue:desc");
  const [rankingResult, setRankingResult] = useState({ state: "idle", companies: [], rank: null, message: "" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [investing, setInvesting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const [sortBy, order] = sortValue.split(":");
  const [rankingSortBy, rankingOrder] = rankingSortValue.split(":");
  const resultMyCompany = comparison?.myCompany ?? myCompany;

  useEffect(() => {
    if (step !== "results" || !resultMyCompany?.id) return undefined;
    let active = true;
    setRankingResult({ state: "loading", companies: [], rank: null, message: "" });
    getCompanyRanking(resultMyCompany.id, { sortBy: rankingSortBy, order: rankingOrder })
      .then((response) => {
        if (!active) return;
        const data = response.data ?? {};
        setRankingResult({
          state: data.companies?.length ? "ready" : "empty",
          companies: data.companies ?? [],
          rank: data.rank ?? null,
          message: "",
        });
      })
      .catch((failure) => {
        if (!active) return;
        const classified = classifyApiError(failure);
        setRankingResult({
          state: classified.kind === "unavailable" ? "unavailable" : "error",
          companies: [],
          rank: null,
          message: classified.message,
        });
      });
    return () => { active = false; };
  }, [step, resultMyCompany?.id, rankingSortBy, rankingOrder]);

  function chooseMyCompany(company) {
    setMyCompany(company);
    setCompareCompanies((current) => current.filter((item) => String(item.id) !== String(company.id)));
    setRecentMyCompanies((current) => [company, ...current.filter((item) => String(item.id) !== String(company.id))].slice(0, 5));
    setComparison(null);
    setStep("select");
    setError("");
    setSelectionMode(null);
  }

  function toggleCompareCompany(company) {
    setCompareCompanies((current) => toggleCompanySelection(current, company));
    setComparison(null);
    setStep("select");
    setError("");
  }

  async function compareSelectedCompanies() {
    if (!canSubmitComparison(myCompany?.id, compareCompanies)) return;
    setPending(true);
    setError("");
    try {
      const response = await submitComparison({
        myCompanyId: Number(myCompany.id),
        compareCompanyIds: compareCompanies.map((company) => Number(company.id)),
      });
      setComparison(response.data);
      setStep("results");
    } catch (failure) {
      setError(classifyApiError(failure).message);
    } finally {
      setPending(false);
    }
  }

  function resetSelection() {
    setMyCompany(null);
    setCompareCompanies([]);
    setComparison(null);
    setError("");
    setStep("select");
    setConfirmClear(false);
  }

  function changeCompareSelection() {
    setComparison(null);
    setStep("select");
    setSelectionMode("compare-companies");
  }

  return (
    <section className="compare-page">
      {step === "select" ? (
        <>
          <div className="page-heading">
            <h1 className="page-title">나의 기업을 선택해 주세요!</h1>
            {(myCompany || compareCompanies.length > 0) ? (
              <button className="button button--quiet compare-page__reset" type="button" onClick={() => setConfirmClear(true)}>전체 초기화</button>
            ) : null}
          </div>

          <button className={`my-company-card${myCompany ? " is-selected" : ""}`} type="button" onClick={() => setSelectionMode("my-company")}>
            {myCompany ? (
              <>
                <span className="my-company-card__remove" aria-hidden="true">선택 취소</span>
                <CompanyMark company={myCompany} size="lg" />
                <strong>{myCompany.name}</strong>
                <small>{myCompany.category}</small>
              </>
            ) : (
              <>
                <span className="my-company-card__add" aria-hidden="true">+</span>
                <strong>기업 추가</strong>
              </>
            )}
          </button>

          {myCompany ? (
            <section className="compare-selection">
              <div className="compare-selection__heading">
                <h2>어떤 기업이 궁금하세요?</h2>
                <button className="button" type="button" onClick={() => setSelectionMode("compare-companies")}>기업 추가하기</button>
              </div>
              {compareCompanies.length ? (
                <div className="compare-selection__grid">
                  {compareCompanies.map((company) => (
                    <article className="compare-company-card" key={company.id}>
                      <button type="button" aria-label={`${company.name} 선택 취소`} onClick={() => toggleCompareCompany(company)}>×</button>
                      <CompanyMark company={company} size="md" />
                      <strong>{company.name}</strong>
                      <small>{company.category}</small>
                    </article>
                  ))}
                  {compareCompanies.length < 5 ? <button className="compare-company-card compare-company-card--add" type="button" onClick={() => setSelectionMode("compare-companies")}><span>+</span><strong>기업 추가</strong></button> : null}
                </div>
              ) : (
                <button className="compare-selection__empty" type="button" onClick={() => setSelectionMode("compare-companies")}>
                  <span>비교할 기업을 추가해 주세요.<br />최소 1개, 최대 5개까지 선택할 수 있습니다.</span>
                </button>
              )}
            </section>
          ) : null}

          {error ? <p className="compare-page__error" role="alert">{error}</p> : null}
          <div className="compare-page__submit-row">
            <button
              className="button compare-page__submit"
              type="button"
              disabled={!canSubmitComparison(myCompany?.id, compareCompanies) || pending}
              onClick={compareSelectedCompanies}
            >
              {pending ? "비교 중..." : "기업 비교하기"}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="page-heading compare-result-heading">
            <h1 className="page-title">내가 선택한 기업</h1>
            <button className="button" type="button" onClick={changeCompareSelection}>다른 기업 비교하기</button>
          </div>
          {resultMyCompany ? (
            <section className="compare-result-own">
              <CompanyMark company={resultMyCompany} size="lg" />
              <strong>{resultMyCompany.name}</strong>
              <small>{resultMyCompany.category}</small>
            </section>
          ) : null}
          <section className="compare-result-section">
            <div className="compare-result-section__heading">
              <h2>비교 결과 확인하기</h2>
              <label className="compare-page__sort">
                <span className="visually-hidden">비교 결과 정렬</span>
                <select value={sortValue} onChange={(event) => setSortValue(event.target.value)}>
                  {compareSorts.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
            <ComparisonResults myCompany={resultMyCompany} compareCompanies={comparison?.compareCompanies ?? []} sortBy={sortBy} order={order} />
          </section>
          <section className="compare-result-section">
            <div className="compare-result-section__heading">
              <h2>기업 순위 확인하기{rankingResult.rank ? <span className="compare-page__rank">현재 {rankingResult.rank}위</span> : null}</h2>
              <label className="compare-page__sort">
                <span className="visually-hidden">기업 순위 정렬 기준</span>
                <select value={rankingSortValue} onChange={(event) => setRankingSortValue(event.target.value)}>
                  {rankingSorts.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
            {rankingResult.state === "ready" ? <RankingResults companies={rankingResult.companies} /> : (
              <FeedbackState state={rankingResult.state === "idle" ? "loading" : rankingResult.state} message={rankingResult.message || undefined} compact={rankingResult.state !== "unavailable" && rankingResult.state !== "error"} />
            )}
          </section>
          <div className="compare-page__invest-row">
            <button className="button" type="button" onClick={() => setInvesting(true)}>나의 기업에 투자하기</button>
          </div>
          <InvestmentDialogs company={resultMyCompany} mode={investing ? "create" : null} onClose={() => setInvesting(false)} onChanged={() => setInvesting(false)} />
        </>
      )}

      <CompanySelectionDialog
        mode={selectionMode}
        myCompany={myCompany}
        recentMyCompanies={recentMyCompanies}
        selectedCompanies={compareCompanies}
        onSelectMyCompany={chooseMyCompany}
        onToggleCompareCompany={toggleCompareCompany}
        onClose={() => setSelectionMode(null)}
      />
      <Modal open={confirmClear} title="선택 초기화" onClose={() => setConfirmClear(false)} className="modal--clear-selection">
        <p className="compare-clear-copy">선택한 내 기업과 비교 기업을 모두 초기화할까요?</p>
        <div className="compare-clear-actions">
          <button className="button button--outline" type="button" onClick={() => setConfirmClear(false)}>취소</button>
          <button className="button" type="button" onClick={resetSelection}>초기화</button>
        </div>
      </Modal>
    </section>
  );
}
