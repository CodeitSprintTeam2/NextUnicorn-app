import { useState } from "react";
import { QUERY_STATE, canRetryQuery } from "../../api/queryState.js";
import { CompanyDataTable } from "../../components/CompanyDataTable.jsx";
import { FeedbackState } from "../../components/FeedbackState.jsx";
import { PageHeading } from "../../components/PageHeading.jsx";
import { Pagination } from "../../components/Pagination.jsx";
import { SortSelect } from "../../components/SortSelect.jsx";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery.js";
import { FIRST_PAGE } from "../../utils/pagination.js";
import { companyDetailPath } from "../../utils/routes.js";
import { getSortParams } from "../../utils/sort.js";
import { COMPANY_IDENTITY_COLUMNS } from "../../components/companyTable.js";
import { COMPARISON_STATUS_SORT_OPTIONS } from "./comparison.constants.js";
import { getComparisonStatus } from "./comparisons.api.js";

export function ComparisonStatusPage() {
  const [page, setPage] = useState(FIRST_PAGE);
  const [sort, setSort] = useState(COMPARISON_STATUS_SORT_OPTIONS[0].value);
  const result = usePaginatedQuery(getComparisonStatus, {
    page,
    ...getSortParams(sort),
  });

  const rows = result.rows.map(({ company, rank, myCompanySelections, comparisonSelections }) => ({
    ...company,
    rank,
    myCompanySelections,
    comparisonSelections,
  }));
  const columns = [
    { key: "rank", label: "순위" },
    ...COMPANY_IDENTITY_COLUMNS,
    {
      key: "myCompanySelections",
      label: "내 기업 선택 횟수",
      render: (company) => `${company.myCompanySelections}회`,
    },
    {
      key: "comparisonSelections",
      label: "비교 기업 선택 횟수",
      render: (company) => `${company.comparisonSelections}회`,
    },
  ];

  function handleSortChange(value) {
    setSort(value);
    setPage(FIRST_PAGE);
  }

  return (
    <section>
      <PageHeading title="비교 현황" />
      <SortSelect
        label="비교 현황 정렬"
        value={sort}
        options={COMPARISON_STATUS_SORT_OPTIONS}
        onChange={handleSortChange}
      />
      {result.state === QUERY_STATE.ready ? (
        <>
          <CompanyDataTable
            rows={rows}
            columns={columns}
            rowHref={(company) => companyDetailPath(company.id)}
          />
          <Pagination
            page={result.meta?.page ?? page}
            totalPages={result.meta?.totalPages ?? 0}
            onChange={setPage}
          />
        </>
      ) : (
        <FeedbackState
          state={result.state}
          message={result.message || undefined}
          onRetry={canRetryQuery(result.state) ? result.retry : undefined}
        />
      )}
    </section>
  );
}
