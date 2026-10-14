import { CompanyDataTable } from "../../../components/CompanyDataTable.jsx";
import { companyDetailPath } from "../../../utils/routes.js";
import { SORT_ORDER } from "../../../utils/sort.js";
import { COMPANY_IDENTITY_COLUMNS, COMPANY_METRIC_COLUMNS } from "../../../components/companyTable.js";
import { sortComparisonCompanies } from "../sortComparisonCompanies.js";

const COLUMNS = [...COMPANY_IDENTITY_COLUMNS, ...COMPANY_METRIC_COLUMNS];

export function ComparisonResults({
  myCompany,
  compareCompanies = [],
  sortBy = "actualInvestment",
  order = SORT_ORDER.descending,
}) {
  const companies = [myCompany, ...compareCompanies].filter(Boolean);
  const rows = sortComparisonCompanies(companies, sortBy, order);

  return (
    <CompanyDataTable
      rows={rows}
      columns={COLUMNS}
      rowHref={(company) => companyDetailPath(company.id)}
    />
  );
}
