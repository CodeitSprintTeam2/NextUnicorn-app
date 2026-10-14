import { useState } from "react";
import {
  COMPANY_COMPARISON_SORT_OPTIONS,
  COMPANY_RANKING_SORT_OPTIONS,
} from "../../utils/companySortOptions.js";
import { Button } from "../../components/Button.jsx";
import { Modal } from "../../components/Modal.jsx";
import { INVESTMENT_MODE, InvestmentDialogs } from "../investments/index.js";
import { COMPARISON_STEP, SELECTION_MODE } from "./comparison.constants.js";
import { CompanySelectionDialog } from "./components/CompanySelectionDialog.jsx";
import { ComparisonResultView } from "./components/ComparisonResultView.jsx";
import { ComparisonSelection } from "./components/ComparisonSelection.jsx";
import { useComparison } from "./useComparison.js";
import styles from "./ComparePage.module.css";

export function ComparePage() {
  const comparison = useComparison();
  const [resultSort, setResultSort] = useState(COMPANY_COMPARISON_SORT_OPTIONS[0].value);
  const [rankingSort, setRankingSort] = useState(COMPANY_RANKING_SORT_OPTIONS[0].value);
  const [selectionMode, setSelectionMode] = useState(null);
  const [investing, setInvesting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  function handleChooseMyCompany(company) {
    comparison.chooseMyCompany(company);
    setSelectionMode(null);
  }

  function handleChooseOtherCompanies() {
    comparison.showSelection();
    setSelectionMode(SELECTION_MODE.compareCompanies);
  }

  function handleReset() {
    comparison.reset();
    setConfirmReset(false);
  }

  return (
    <section aria-busy={comparison.pending}>
      {comparison.step === COMPARISON_STEP.select ? (
        <ComparisonSelection
          myCompany={comparison.myCompany}
          compareCompanies={comparison.compareCompanies}
          pending={comparison.pending}
          error={comparison.error}
          canCompare={comparison.canCompare}
          onChooseMyCompany={() => setSelectionMode(SELECTION_MODE.myCompany)}
          onChooseCompareCompanies={() => setSelectionMode(SELECTION_MODE.compareCompanies)}
          onRemoveCompany={comparison.toggleCompareCompany}
          onReset={() => setConfirmReset(true)}
          onCompare={comparison.compare}
        />
      ) : (
        <ComparisonResultView
          comparison={comparison.comparison}
          sort={resultSort}
          onSortChange={setResultSort}
          rankingSort={rankingSort}
          onRankingSortChange={setRankingSort}
          onChooseCompanies={handleChooseOtherCompanies}
          onInvest={() => setInvesting(true)}
        />
      )}
      <CompanySelectionDialog
        mode={selectionMode}
        myCompany={comparison.myCompany}
        recentMyCompanies={comparison.recentCompanies}
        selectedCompanies={comparison.compareCompanies}
        onSelectMyCompany={handleChooseMyCompany}
        onToggleCompareCompany={comparison.toggleCompareCompany}
        onClearCompareCompanies={comparison.clearCompareCompanies}
        onClose={() => setSelectionMode(null)}
      />
      <InvestmentDialogs
        company={comparison.comparison?.myCompany ?? comparison.myCompany}
        mode={investing ? INVESTMENT_MODE.create : null}
        onClose={() => setInvesting(false)}
        onChanged={() => setInvesting(false)}
      />
      <Modal open={confirmReset} title="선택 초기화" onClose={() => setConfirmReset(false)}>
        <p>선택한 내 기업과 비교 기업을 모두 초기화할까요?</p>
        <div className={styles.actions}>
          <Button variant="outline" onClick={() => setConfirmReset(false)}>취소</Button>
          <Button onClick={handleReset}>초기화</Button>
        </div>
      </Modal>
    </section>
  );
}
