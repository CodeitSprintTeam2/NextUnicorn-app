import { useEffect, useState } from "react";
import { getQueryFailure, QUERY_STATE } from "../api/queryState.js";
import { FIRST_PAGE, PAGE_SIZE } from "../utils/pagination.js";

export function usePaginatedQuery(
  fetchPage,
  { page = FIRST_PAGE, limit = PAGE_SIZE, search, sortBy, order },
  { enabled = true } = {},
) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({
    state: QUERY_STATE.loading,
    rows: [],
    meta: null,
    message: "",
  });

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    setResult({ state: QUERY_STATE.loading, rows: [], meta: null, message: "" });

    async function loadPage() {
      try {
        const response = await fetchPage({ page, limit, search, sortBy, order });
        if (!active) return;

        const rows = response.data ?? [];
        setResult({
          state: rows.length ? QUERY_STATE.ready : QUERY_STATE.empty,
          rows,
          meta: response.meta,
          message: "",
        });
      } catch (error) {
        if (!active) return;
        setResult({ ...getQueryFailure(error), rows: [], meta: null });
      }
    }

    loadPage();
    // Ignore responses from an earlier page, filter, or unmounted screen.
    return () => { active = false; };
  }, [fetchPage, page, limit, search, sortBy, order, enabled, revision]);

  function retry() {
    setRevision((current) => current + 1);
  }

  return { ...result, retry };
}
