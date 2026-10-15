import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QUERY_STATE, canRetryQuery } from "../../api/queryState.js";
import { FeedbackState } from "../../components/FeedbackState.jsx";
import { PageHeading } from "../../components/PageHeading.jsx";
import { FIRST_PAGE } from "../../utils/pagination.js";
import { ROUTES } from "../../utils/routes.js";
import { InvestmentDialogs } from "../investments/index.js";
import { CompanyInvestments } from "./components/CompanyInvestments.jsx";
import { CompanyProfile } from "./components/CompanyProfile.jsx";
import { useCompanyDetailData } from "./useCompanyDetailData.js";
import styles from "./CompanyDetailPage.module.css";

export function CompanyDetailPage() {
  const { companyId } = useParams();
  // A company change starts a new detail session, including its page and dialogs.
  return <CompanyDetail key={companyId} companyId={companyId} />;
}

function CompanyDetail({ companyId }) {
  const [page, setPage] = useState(FIRST_PAGE);
  const [dialog, setDialog] = useState(null);
  const { company, investments, refresh } = useCompanyDetailData(companyId, page);

  function openInvestmentDialog(mode, investment) {
    setDialog({ mode, investment });
  }

  function handleInvestmentChanged() {
    setPage(FIRST_PAGE);
    refresh();
  }

  if (company.state !== QUERY_STATE.ready) {
    return (
      <section>
        <p className={styles.back}>
          <Link to={ROUTES.companies}>‹ 전체 스타트업 목록</Link>
        </p>
        <PageHeading title="기업 상세" />
        <FeedbackState
          state={company.state}
          message={company.message || undefined}
          onRetry={canRetryQuery(company.state) ? refresh : undefined}
        />
      </section>
    );
  }

  return (
    <section>
      <p className={styles.back}>
        <Link to={ROUTES.companies}>‹ 전체 스타트업 목록</Link>
      </p>
      <CompanyProfile company={company.value} />
      <CompanyInvestments
        company={company.value}
        result={investments}
        page={page}
        onPageChange={setPage}
        onEdit={openInvestmentDialog}
      />
      <InvestmentDialogs
        company={company.value}
        mode={dialog?.mode}
        investment={dialog?.investment}
        onClose={() => setDialog(null)}
        onChanged={handleInvestmentChanged}
      />
    </section>
  );
}
