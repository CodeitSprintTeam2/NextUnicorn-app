import { useState } from "react";
import { classifyApiError } from "../../api/errors.js";
import { COMPARISON_STEP } from "./comparison.constants.js";
import {
  addRecentCompany,
  canSubmitComparison,
  isSameCompany,
  toggleCompanySelection,
} from "./comparisonSelection.js";
import { submitComparison } from "./comparisons.api.js";

export function useComparison() {
  const [myCompany, setMyCompany] = useState(null);
  const [compareCompanies, setCompareCompanies] = useState([]);
  const [recentCompanies, setRecentCompanies] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [step, setStep] = useState(COMPARISON_STEP.select);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const canCompare = canSubmitComparison(myCompany?.id, compareCompanies);

  function chooseMyCompany(company) {
    if (pending) return;

    setMyCompany(company);
    setCompareCompanies((current) => (
      current.filter((item) => !isSameCompany(item.id, company.id))
    ));
    setRecentCompanies((current) => addRecentCompany(current, company));
    setComparison(null);
    setStep(COMPARISON_STEP.select);
    setError("");
  }

  function toggleCompareCompany(company) {
    if (pending) return;

    setCompareCompanies((current) => toggleCompanySelection(current, company));
    setComparison(null);
    setError("");
  }

  function clearCompareCompanies() {
    if (pending) return;

    setCompareCompanies([]);
    setComparison(null);
    setError("");
  }

  async function compare() {
    if (!canCompare || pending) return;

    setPending(true);
    setError("");

    try {
      const response = await submitComparison({
        myCompanyId: Number(myCompany.id),
        compareCompanyIds: compareCompanies.map((company) => Number(company.id)),
      });
      setComparison(response.data);
      setStep(COMPARISON_STEP.results);
    } catch (apiError) {
      setError(classifyApiError(apiError).message);
    } finally {
      setPending(false);
    }
  }

  function reset() {
    if (pending) return;

    setMyCompany(null);
    setCompareCompanies([]);
    setComparison(null);
    setStep(COMPARISON_STEP.select);
    setError("");
  }

  function showSelection() {
    setStep(COMPARISON_STEP.select);
  }

  return {
    myCompany,
    compareCompanies,
    recentCompanies,
    comparison,
    step,
    pending,
    error,
    canCompare,
    chooseMyCompany,
    toggleCompareCompany,
    clearCompareCompanies,
    compare,
    reset,
    showSelection,
  };
}
