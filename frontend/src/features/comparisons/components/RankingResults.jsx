import { CompanyDataTable } from "../../../components/CompanyDataTable.jsx";
import { companyDetailPath } from "../../../utils/routes.js";
import { COMPANY_IDENTITY_COLUMNS, COMPANY_METRIC_COLUMNS } from "../../../components/companyTable.js";

const COLUMNS = [
  { key: "rank", label: "순위", width: "60px" },
  ...COMPANY_IDENTITY_COLUMNS,
  ...COMPANY_METRIC_COLUMNS,
];

export function RankingResults({ companies = [] }) {
  const rows = companies.map(({ company, rank }) => ({ ...company, rank }));

  return (
    <CompanyDataTable
      rows={rows}
      columns={COLUMNS}
      rowHref={(company) => companyDetailPath(company.id)}
    />
  );
}
