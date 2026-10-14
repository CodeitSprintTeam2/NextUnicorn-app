import { QUERY_STATE } from "../../../api/queryState.js";
import { Button } from "../../../components/Button.jsx";
import { CompanyMark } from "../../../components/CompanyMark.jsx";
import { FeedbackState } from "../../../components/FeedbackState.jsx";
import { PageHeading } from "../../../components/PageHeading.jsx";
import { SortSelect } from "../../../components/SortSelect.jsx";
import { getSortParams } from "../../../utils/sort.js";
import {
  COMPANY_COMPARISON_SORT_OPTIONS,
  COMPANY_RANKING_SORT_OPTIONS,
} from "../../../utils/companySortOptions.js";
import { useCompanyRanking } from "../useCompanyRanking.js";
import { ComparisonResults } from "./ComparisonResults.jsx";
import { RankingResults } from "./RankingResults.jsx";
import styles from "../ComparePage.module.css";

export function ComparisonResultView({
  comparison,
  sort,
  onSortChange,
  rankingSort,
  onRankingSortChange,
  onChooseCompanies,
  onInvest,
}) {
  const ranking = useCompanyRanking(comparison.myCompany.id, getSortParams(rankingSort));
  const myCompany = comparison.myCompany;

  return (
    <>
      <PageHeading title="내가 선택한 기업">
        <Button onClick={onChooseCompanies}>다른 기업 비교하기</Button>
      </PageHeading>
      <div className={styles.myCompanyResult}>
        <CompanyMark company={myCompany} size="lg" />
        <strong>{myCompany.name}</strong>
        <small>{myCompany.category}</small>
      </div>
      <section className={styles.resultSection}>
        <div className={styles.sectionHeading}>
          <h2>비교 결과 확인하기</h2>
          <SortSelect
            label="비교 결과 정렬"
            value={sort}
            options={COMPANY_COMPARISON_SORT_OPTIONS}
            onChange={onSortChange}
            className={styles.resultSort}
          />
        </div>
        <ComparisonResults
          myCompany={myCompany}
          compareCompanies={comparison.compareCompanies}
          {...getSortParams(sort)}
        />
      </section>
      <section className={styles.resultSection}>
        <div className={styles.sectionHeading}>
          <h2>
            기업 순위 확인하기
            {ranking.rank && (
              <span className={styles.rank}>현재 {ranking.rank}위</span>
            )}
          </h2>
          <SortSelect
            label="기업 순위 정렬"
            value={rankingSort}
            options={COMPANY_RANKING_SORT_OPTIONS}
            onChange={onRankingSortChange}
            className={styles.resultSort}
          />
        </div>
        {ranking.state === QUERY_STATE.ready ? (
          <RankingResults companies={ranking.rows} />
        ) : (
          <FeedbackState state={ranking.state} message={ranking.message || undefined} />
        )}
      </section>
      <div className={styles.submit}>
        <Button onClick={onInvest}>나의 기업에 투자하기</Button>
      </div>
    </>
  );
}
