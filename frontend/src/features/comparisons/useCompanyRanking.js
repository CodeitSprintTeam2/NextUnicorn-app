import { useEffect, useState } from "react";
import { QUERY_STATE, getQueryFailure } from "../../api/queryState.js";
import { getCompanyRanking } from "./comparisons.api.js";

export function useCompanyRanking(companyId, { sortBy, order }) {
  const [ranking, setRanking] = useState({
    state: QUERY_STATE.loading,
    rows: [],
    rank: null,
    message: "",
  });

  useEffect(() => {
    if (!companyId) return;

    let active = true;
    setRanking({ state: QUERY_STATE.loading, rows: [], rank: null, message: "" });

    async function loadRanking() {
      try {
        const response = await getCompanyRanking(companyId, { sortBy, order });
        if (!active) return;

        const rows = response.data.companies ?? [];
        setRanking({
          state: rows.length ? QUERY_STATE.ready : QUERY_STATE.empty,
          rows,
          rank: response.data.rank ?? null,
          message: "",
        });
      } catch (error) {
        if (!active) return;
        setRanking({ ...getQueryFailure(error), rows: [], rank: null });
      }
    }

    loadRanking();
    return () => { active = false; };
  }, [companyId, sortBy, order]);

  return ranking;
}
