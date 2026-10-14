import { useState } from "react";
import { QUERY_STATE, canRetryQuery } from "../../api/queryState.js";
import { CompanyDataTable } from "../../components/CompanyDataTable.jsx";
import { FeedbackState } from "../../components/FeedbackState.jsx";
import { PageHeading } from "../../components/PageHeading.jsx";
import { Pagination } from "../../components/Pagination.jsx";
import { SortSelect } from "../../components/SortSelect.jsx";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery.js";
import { formatKoreanAmount } from "../../utils/amount.js";
import { FIRST_PAGE } from "../../utils/pagination.js";
import { companyDetailPath } from "../../utils/routes.js";
import { getSortParams } from "../../utils/sort.js";
import { COMPANY_IDENTITY_COLUMNS } from "../../components/companyTable.js";
import { INVESTMENT_STATUS_SORT_OPTIONS } from "./investment.constants.js";
import { getInvestmentStatus } from "./investments.api.js";

const COLUMNS = [
  { key: "rank", label: "순위" },
  ...COMPANY_IDENTITY_COLUMNS,
  {
    key: "virtualInvestment",
    label: "가상 투자 합계",
    render: (company) => formatKoreanAmount(company.virtualInvestment),
  },
  {
    key: "actualInvestment",
    label: "실제 누적 투자 금액",
    render: (company) => formatKoreanAmount(company.actualInvestment),
  },
];

export function InvestmentsPage() {
  const [page, setPage] = useState(FIRST_PAGE);
  const [sort, setSort] = useState(INVESTMENT_STATUS_SORT_OPTIONS[0].value);
  const result = usePaginatedQuery(getInvestmentStatus, {
    page,
    ...getSortParams(sort),
  });
  const rows = result.rows.map(({ company, rank, virtualInvestment, actualInvestment }) => ({
    ...company,
    rank,
    virtualInvestment,
    actualInvestment,
  }));

  function handleSortChange(value) {
    setSort(value);
    setPage(FIRST_PAGE);
  }

  return (
    <section>
      <PageHeading title="투자 현황" />
      <SortSelect
        label="투자 현황 정렬"
        value={sort}
        options={INVESTMENT_STATUS_SORT_OPTIONS}
        onChange={handleSortChange}
      />
      {result.state === QUERY_STATE.ready ? (
        <>
          <CompanyDataTable
            rows={rows}
            columns={COLUMNS}
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
