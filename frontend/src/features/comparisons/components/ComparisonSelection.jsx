import { Button } from "../../../components/Button.jsx";
import { CompanyMark } from "../../../components/CompanyMark.jsx";
import { PageHeading } from "../../../components/PageHeading.jsx";
import { MAX_COMPARE_COMPANIES, MIN_COMPARE_COMPANIES } from "../comparison.constants.js";
import styles from "../ComparePage.module.css";

export function ComparisonSelection({
  myCompany,
  compareCompanies,
  pending,
  error,
  canCompare,
  onChooseMyCompany,
  onChooseCompareCompanies,
  onRemoveCompany,
  onReset,
  onCompare,
}) {
  return (
    <>
      <PageHeading title="나의 기업을 선택해 주세요!">
        {(myCompany || compareCompanies.length > 0) && (
          <Button variant="quiet" disabled={pending} onClick={onReset}>전체 초기화</Button>
        )}
      </PageHeading>
      <button
        className={styles.myCompanyCard}
        disabled={pending}
        onClick={onChooseMyCompany}
      >
        {myCompany ? (
          <>
            <CompanyMark company={myCompany} size="lg" />
            <strong>{myCompany.name}</strong>
            <small>{myCompany.category}</small>
          </>
        ) : (
          <>
            <span className={styles.addMark}>+</span>
            <strong>기업 추가</strong>
          </>
        )}
      </button>
      {myCompany && (
        <section className={styles.selection}>
          <div className={styles.sectionHeading}>
            <h2>어떤 기업이 궁금하세요?</h2>
            <Button disabled={pending} onClick={onChooseCompareCompanies}>기업 추가하기</Button>
          </div>
          {compareCompanies.length ? (
            <div className={styles.grid}>
              {compareCompanies.map((company) => (
                <article className={styles.companyCard} key={company.id}>
                  <button
                    aria-label={`${company.name} 선택 취소`}
                    disabled={pending}
                    onClick={() => onRemoveCompany(company)}
                  >
                    ×
                  </button>
                  <CompanyMark company={company} />
                  <strong>{company.name}</strong>
                  <small>{company.category}</small>
                </article>
              ))}
              {compareCompanies.length < MAX_COMPARE_COMPANIES && (
                <button
                  className={`${styles.companyCard} ${styles.addCard}`}
                  disabled={pending}
                  onClick={onChooseCompareCompanies}
                >
                  ＋<strong>기업 추가</strong>
                </button>
              )}
            </div>
          ) : (
            <button
              className={styles.empty}
              disabled={pending}
              onClick={onChooseCompareCompanies}
            >
              비교할 기업을 추가해 주세요.<br />
              최소 {MIN_COMPARE_COMPANIES}개, 최대 {MAX_COMPARE_COMPANIES}개까지 선택할 수 있습니다.
            </button>
          )}
        </section>
      )}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <div className={styles.submit}>
        <Button disabled={!canCompare || pending} onClick={onCompare}>
          {pending ? "비교 중..." : "기업 비교하기"}
        </Button>
      </div>
    </>
  );
}
