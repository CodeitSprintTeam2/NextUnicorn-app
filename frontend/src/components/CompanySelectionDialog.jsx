import { useEffect, useState } from "react";
import { listCompanies } from "../api/companies.js";
import { classifyApiError } from "../api/errors.js";
import { CompanyMark } from "./CompanyMark.jsx";
import { FeedbackState } from "./FeedbackState.jsx";
import { Modal } from "./Modal.jsx";
import { Pagination } from "./Pagination.jsx";
import "./CompanySelectionDialog.css";

const PAGE_SIZE = 10;

export function CompanySelectionDialog({
  mode,
  myCompany,
  recentMyCompanies = [],
  selectedCompanies = [],
  onSelectMyCompany,
  onToggleCompareCompany,
  onClose,
}) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [result, setResult] = useState({ state: "loading", companies: [], meta: null, message: "" });
  const [limitMessage, setLimitMessage] = useState("");
  const ownMode = mode === "my-company";

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearch(searchInput.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setResult((current) => ({ ...current, state: "loading", message: "" }));
    listCompanies({ page, limit: PAGE_SIZE, search: search || undefined })
      .then((response) => {
        if (!active) return;
        setResult({ state: response.data?.length ? "ready" : "empty", companies: response.data ?? [], meta: response.meta ?? null, message: "" });
      })
      .catch((error) => {
        if (!active) return;
        const failure = classifyApiError(error);
        setResult({ state: failure.kind === "unavailable" ? "unavailable" : "error", companies: [], meta: null, message: failure.message });
      });
    return () => { active = false; };
  }, [page, search, refreshKey]);

  function handleSearch(value) {
    setSearchInput(value);
    setPage(1);
  }

  function chooseCompany(company) {
    if (ownMode) {
      onSelectMyCompany?.(company);
      return;
    }
    const selected = selectedCompanies.some((item) => String(item.id) === String(company.id));
    const isOwnCompany = String(myCompany?.id) === String(company.id);
    if (!selected && isOwnCompany) {
      setLimitMessage("내 기업은 비교 기업으로 선택할 수 없습니다.");
      return;
    }
    if (!selected && selectedCompanies.length >= 5) {
      setLimitMessage("비교 기업은 최대 5개까지 선택할 수 있습니다.");
      return;
    }
    setLimitMessage("");
    onToggleCompareCompany?.(company);
  }

  if (!mode) return null;

  return (
    <Modal
      open
      title={ownMode ? "나의 기업 선택하기" : "비교할 기업 선택하기"}
      onClose={onClose}
      className="modal--company-selection"
    >
      {!ownMode ? (
        <section className="selection-dialog__selected" aria-label="선택한 비교 기업">
          <div className="selection-dialog__section-heading">
            <h3>선택한 기업 ({selectedCompanies.length}/5)</h3>
            {selectedCompanies.length > 0 ? <button type="button" className="selection-dialog__text-button" onClick={() => selectedCompanies.forEach((company) => onToggleCompareCompany?.(company))}>전체 초기화</button> : null}
          </div>
          {selectedCompanies.length > 0 ? (
            <div className="selection-dialog__chips">
              {selectedCompanies.map((company) => (
                <button type="button" key={company.id} onClick={() => onToggleCompareCompany?.(company)} aria-label={`${company.name} 선택 취소`}>
                  {company.name}<span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          ) : <p className="selection-dialog__muted">비교할 기업을 선택해 주세요.</p>}
        </section>
      ) : recentMyCompanies.length > 0 ? (
        <section className="selection-dialog__recent">
          <h3>최근 선택한 기업 ({recentMyCompanies.length})</h3>
          <div className="selection-dialog__recent-list">
            {recentMyCompanies.map((company) => (
              <SelectionRow key={company.id} company={company} actionLabel="선택하기" selected={String(myCompany?.id) === String(company.id)} onChoose={() => onSelectMyCompany?.(company)} />
            ))}
          </div>
        </section>
      ) : null}

      <label className="selection-dialog__search">
        <span aria-hidden="true">⌕</span>
        <span className="visually-hidden">기업명 검색</span>
        <input type="search" value={searchInput} placeholder="기업명을 검색해 주세요" onChange={(event) => handleSearch(event.target.value)} />
      </label>

      {limitMessage ? <p className="selection-dialog__limit" role="alert">{limitMessage}</p> : null}
      {result.state === "ready" ? (
        <section className="selection-dialog__results" aria-label="기업 검색 결과">
          <h3>검색 결과 ({result.meta?.total ?? result.companies.length})</h3>
          <div className="selection-dialog__result-list">
            {result.companies.map((company) => {
              const selected = ownMode
                ? String(myCompany?.id) === String(company.id)
                : selectedCompanies.some((item) => String(item.id) === String(company.id));
              const isOwnCompany = !ownMode && String(myCompany?.id) === String(company.id);
              return (
                <SelectionRow
                  key={company.id}
                  company={company}
                  actionLabel={ownMode ? "선택하기" : selected ? "선택 취소" : "선택하기"}
                  selected={selected}
                  disabled={isOwnCompany}
                  onChoose={() => chooseCompany(company)}
                />
              );
            })}
          </div>
          <Pagination page={result.meta?.page ?? page} totalPages={result.meta?.totalPages ?? 0} onChange={setPage} />
        </section>
      ) : (
        <FeedbackState
          state={result.state}
          message={result.message || undefined}
          compact={result.state === "loading"}
          onRetry={result.state === "error" || result.state === "unavailable" ? () => setRefreshKey((current) => current + 1) : undefined}
        />
      )}
    </Modal>
  );
}

function SelectionRow({ company, actionLabel, selected = false, disabled = false, onChoose }) {
  return (
    <div className="selection-row">
      <CompanyMark company={company} size="sm" />
      <div className="selection-row__info">
        <strong>{company.name}</strong>
        <span>{company.category}</span>
      </div>
      <button
        className={`selection-row__action${selected ? " is-selected" : ""}`}
        type="button"
        disabled={disabled}
        onClick={onChoose}
      >
        {disabled ? "내 기업" : selected ? "✓ " : ""}{actionLabel}
      </button>
    </div>
  );
}
