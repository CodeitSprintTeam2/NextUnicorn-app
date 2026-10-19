import { CompanyDataTable } from "../../../components/CompanyDataTable.jsx";
import { companyDetailPath } from "../../../utils/routes.js";
import { COMPANY_IDENTITY_COLUMNS, COMPANY_METRIC_COLUMNS } from "../../../components/companyTable.js";

import { isSameCompany } from "../comparisonSelection.js";
import styles from "./RankingResults.module.css";

const COLUMNS = [
  { key: "rank", label: "순위", width: "60px" },
  ...COMPANY_IDENTITY_COLUMNS,
  ...COMPANY_METRIC_COLUMNS,
];

export function RankingResults({ companies = [], myCompany }) {
  const rows = companies.map(({ company, rank }) => ({ ...company, rank }));

  return (
    <CompanyDataTable
      rows={rows}
      columns={COLUMNS}
      rowHref={(company) => companyDetailPath(company.id)}
      getRowClassName={(company) =>
        isSameCompany(company.id, myCompany?.id) ? styles.myCompanyRow : ""
      }
    />
  );
}
