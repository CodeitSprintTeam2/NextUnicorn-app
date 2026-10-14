import { useState } from "react";
import { QUERY_STATE, canRetryQuery } from "../../api/queryState.js";
import { ButtonLink } from "../../components/Button.jsx";
import { CompanyDataTable } from "../../components/CompanyDataTable.jsx";
import { FeedbackState } from "../../components/FeedbackState.jsx";
import { PageHeading } from "../../components/PageHeading.jsx";
import { Pagination } from "../../components/Pagination.jsx";
import { SearchSortBar } from "../../components/SearchSortBar.jsx";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.js";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery.js";
import { FIRST_PAGE, getRowNumber } from "../../utils/pagination.js";
import { ROUTES, companyDetailPath } from "../../utils/routes.js";
import { getSortParams } from "../../utils/sort.js";
import { listCompanies } from "./companies.api.js";
import { COMPANY_SEARCH_DELAY_MS } from "./company.constants.js";
import { COMPANY_LIST_SORT_OPTIONS } from "../../utils/companySortOptions.js";
import { COMPANY_IDENTITY_COLUMNS, COMPANY_METRIC_COLUMNS } from "../../components/companyTable.js";
import styles from "./CompaniesPage.module.css";

export function CompaniesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState(COMPANY_LIST_SORT_OPTIONS[0].value);
  const [page, setPage] = useState(FIRST_PAGE);
  const search = useDebouncedValue(searchInput.trim(), COMPANY_SEARCH_DELAY_MS);
  const result = usePaginatedQuery(listCompanies, {
    page,
    search: search || undefined,
    ...getSortParams(sort),
  });

  const columns = [
    {
      key: "rank",
      label: "순위",
      width: "54px",
      render: (_, index) => getRowNumber(page, index),
    },
    ...COMPANY_IDENTITY_COLUMNS.map((column) => (
      column.key === "description"
        ? {
          ...column,
          render: (company) => (
            <span className={styles.description}>{company.description}</span>
          ),
        }
        : column
    )),
    ...COMPANY_METRIC_COLUMNS,
  ];

  function handleSearchChange(value) {
    setSearchInput(value);
    setPage(FIRST_PAGE);
  }

  function handleSortChange(value) {
    setSort(value);
    setPage(FIRST_PAGE);
  }

  return (
    <section>
      <PageHeading title="전체 스타트업 목록">
        <ButtonLink
          variant="outline"
          className={styles.compareLink}
          to={ROUTES.compare}
        >
          기업 비교하기
        </ButtonLink>
      </PageHeading>
      <SearchSortBar
        search={searchInput}
        onSearchChange={handleSearchChange}
        sortValue={sort}
        sortOptions={COMPANY_LIST_SORT_OPTIONS}
        onSortChange={handleSortChange}
      />
      {result.state === QUERY_STATE.ready ? (
        <>
          <CompanyDataTable
            rows={result.rows}
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
