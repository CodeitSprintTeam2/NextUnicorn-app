import { useCallback, useEffect, useState } from "react";
import { QUERY_STATE, getQueryFailure } from "../../api/queryState.js";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery.js";
import { getCompany, listCompanyInvestments } from "./companies.api.js";

export function useCompanyDetailData(companyId, page) {
  const [revision, setRevision] = useState(0);
  const [company, setCompany] = useState({
    state: QUERY_STATE.loading,
    value: null,
    message: "",
  });

  const fetchInvestments = useCallback(
    (params) => listCompanyInvestments(companyId, params),
    [companyId],
  );
  const investments = usePaginatedQuery(fetchInvestments, { page });

  useEffect(() => {
    let active = true;
    setCompany({ state: QUERY_STATE.loading, value: null, message: "" });

    async function loadCompany() {
      try {
        const response = await getCompany(companyId);
        if (!active) return;

        setCompany({ state: QUERY_STATE.ready, value: response.data, message: "" });
      } catch (error) {
        if (!active) return;
        setCompany({ ...getQueryFailure(error), value: null });
      }
    }

    loadCompany();
    return () => { active = false; };
  }, [companyId, revision]);

  function refresh() {
    setRevision((current) => current + 1);
    investments.retry();
  }

  return { company, investments, refresh };
}
