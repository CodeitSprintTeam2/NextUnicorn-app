import { useState } from "react";
import { QUERY_STATE, canRetryQuery } from "../../../api/queryState.js";
import { CompanyMark } from "../../../components/CompanyMark.jsx";
import { FeedbackState } from "../../../components/FeedbackState.jsx";
import { Modal } from "../../../components/Modal.jsx";
import { Pagination } from "../../../components/Pagination.jsx";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue.js";
import { usePaginatedQuery } from "../../../hooks/usePaginatedQuery.js";
import { FIRST_PAGE } from "../../../utils/pagination.js";
import { listCompanies } from "../../companies/index.js";
import {
  MAX_COMPARE_COMPANIES,
  SELECTION_MODE,
  SELECTION_SEARCH_DELAY_MS,
} from "../comparison.constants.js";
import { isSameCompany } from "../comparisonSelection.js";
import styles from "../CompanySelectionDialog.module.css";

function CompanySelectionRow({ company, selected, disabled, onSelect }) {
  return (
    <div className={styles.row}>
      <CompanyMark company={company} size="sm" />
      <div>
        <strong>{company.name}</strong>
        <small>{company.category}</small>
      </div>
      <button
        type="button"
        className={selected ? styles.selectedButton : undefined}
        disabled={disabled}
        onClick={() => onSelect(company)}
      >
        {disabled ? "내 기업" : selected ? "선택 취소" : "선택하기"}
      </button>
    </div>
  );
}

export function CompanySelectionDialog(props) {
  if (!props.mode) return null;
  return <CompanySelectionContent key={props.mode} {...props} />;
}

function CompanySelectionContent({
  mode,
  myCompany,
  recentMyCompanies = [],
  selectedCompanies = [],
  onSelectMyCompany,
  onToggleCompareCompany,
  onClearCompareCompanies,
  onClose,
}) {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(FIRST_PAGE);
  const [message, setMessage] = useState("");
  const search = useDebouncedValue(searchInput.trim(), SELECTION_SEARCH_DELAY_MS);
  const result = usePaginatedQuery(listCompanies, {
    page,
    search: search || undefined,
  });
  const isMyCompanySelection = mode === SELECTION_MODE.myCompany;

  function selectCompany(company) {
    if (isMyCompanySelection) {
      onSelectMyCompany(company);
      return;
    }

    if (isSameCompany(company.id, myCompany?.id)) {
      setMessage("내 기업은 비교 기업으로 선택할 수 없습니다.");
      return;
    }

    const isSelected = selectedCompanies.some(
      (selected) => isSameCompany(selected.id, company.id),
    );
    if (!isSelected && selectedCompanies.length >= MAX_COMPARE_COMPANIES) {
      setMessage(`비교 기업은 최대 ${MAX_COMPARE_COMPANIES}개까지 선택할 수 있습니다.`);
      return;
    }

    setMessage("");
    onToggleCompareCompany(company);
  }

  function renderCompanyRow(company) {
    const selected = isMyCompanySelection
      ? isSameCompany(myCompany?.id, company.id)
      : selectedCompanies.some((item) => isSameCompany(item.id, company.id));
    const disabled = !isMyCompanySelection && isSameCompany(company.id, myCompany?.id);

    return (
      <CompanySelectionRow
        key={company.id}
        company={company}
        selected={selected}
        disabled={disabled}
        onSelect={selectCompany}
      />
    );
  }

  function handleSearchChange(event) {
    setSearchInput(event.target.value);
    setPage(FIRST_PAGE);
  }

  function clearSelectedCompanies() {
    setMessage("");
    onClearCompareCompanies();
  }

  return (
    <Modal
      open
      title={isMyCompanySelection ? "나의 기업 선택하기" : "비교할 기업 선택하기"}
      onClose={onClose}
      className={styles.dialog}
    >
      {isMyCompanySelection && recentMyCompanies.length > 0 && (
        <section className={styles.recent}>
          <h3>최근 선택한 기업 ({recentMyCompanies.length})</h3>
          {recentMyCompanies.map(renderCompanyRow)}
        </section>
      )}
      {!isMyCompanySelection && (
        <section className={styles.selected}>
          <div>
            <h3>선택한 기업 ({selectedCompanies.length}/{MAX_COMPARE_COMPANIES})</h3>
            {selectedCompanies.length > 0 && (
              <button className={styles.reset} onClick={clearSelectedCompanies}>
                전체 초기화
              </button>
            )}
          </div>
          {selectedCompanies.map((company) => (
            <button
              key={company.id}
              className={styles.chip}
              onClick={() => selectCompany(company)}
            >
              {company.name} ×
            </button>
          ))}
        </section>
      )}
      <label className={styles.search}>
        <span aria-hidden="true">⌕</span>
        <span className="visually-hidden">기업명 검색</span>
        <input
          value={searchInput}
          placeholder="기업명을 검색해 주세요"
          onChange={handleSearchChange}
        />
      </label>
      {message && <p role="alert" className={styles.message}>{message}</p>}
      {result.state === QUERY_STATE.ready ? (
        <section className={styles.results}>
          <h3>검색 결과 ({result.meta?.total ?? result.rows.length})</h3>
          {result.rows.map(renderCompanyRow)}
          <Pagination
            page={result.meta?.page ?? page}
            totalPages={result.meta?.totalPages ?? 0}
            onChange={setPage}
          />
        </section>
      ) : (
        <FeedbackState
          state={result.state}
          message={result.message || undefined}
          compact={result.state === QUERY_STATE.loading}
          onRetry={canRetryQuery(result.state) ? result.retry : undefined}
        />
      )}
    </Modal>
  );
}
