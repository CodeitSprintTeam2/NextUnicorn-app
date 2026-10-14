import { QUERY_STATE, canRetryQuery } from "../../../api/queryState.js";
import { Button } from "../../../components/Button.jsx";
import { CompanyDataTable } from "../../../components/CompanyDataTable.jsx";
import { FeedbackState } from "../../../components/FeedbackState.jsx";
import { Pagination } from "../../../components/Pagination.jsx";
import { formatKoreanAmount } from "../../../utils/amount.js";
import { getRowNumber } from "../../../utils/pagination.js";
import { INVESTMENT_MODE } from "../../investments/index.js";
import styles from "../CompanyDetailPage.module.css";

function InvestmentMenu({ investment, onEdit }) {
  function handleSelect(event, mode) {
    event.currentTarget.closest("details").open = false;
    onEdit(mode, investment);
  }

  return (
    <details className={styles.menu}>
      <summary aria-label={`${investment.investorName} 투자 내역 메뉴`}>⋮</summary>
      <div>
        <button
          type="button"
          onClick={(event) => handleSelect(event, INVESTMENT_MODE.update)}
        >
          수정하기
        </button>
        <button
          type="button"
          onClick={(event) => handleSelect(event, INVESTMENT_MODE.delete)}
        >
          삭제하기
        </button>
      </div>
    </details>
  );
}

export function CompanyInvestments({ company, result, page, onPageChange, onEdit }) {
  const columns = [
    {
      key: "rank",
      label: "순위",
      width: "56px",
      render: (_, index) => getRowNumber(page, index),
    },
    {
      key: "name",
      label: "투자자 이름",
      width: "150px",
      render: (investment) => investment.investorName,
    },
    {
      key: "amount",
      label: "투자 금액",
      width: "130px",
      render: (investment) => formatKoreanAmount(investment.amount),
    },
    {
      key: "comment",
      label: "투자 코멘트",
      render: (investment) => <span className={styles.comment}>{investment.comment}</span>,
    },
    {
      key: "actions",
      label: "",
      width: "56px",
      render: (investment) => <InvestmentMenu investment={investment} onEdit={onEdit} />,
    },
  ];
  const rows = result.rows.map((investment) => ({
    ...investment,
    name: investment.investorName,
    description: investment.comment,
  }));

  return (
    <section className={styles.investments}>
      <div className={styles.investmentHeading}>
        <div>
          <h2>View My Startup에서 받은 투자</h2>
          <strong>총 {formatKoreanAmount(company.virtualInvestment)}</strong>
        </div>
        <Button onClick={() => onEdit(INVESTMENT_MODE.create, null)}>
          기업에 투자하기
        </Button>
      </div>
      {result.state === QUERY_STATE.ready ? (
        <>
          <CompanyDataTable rows={rows} columns={columns} />
          <Pagination
            page={result.meta?.page ?? page}
            totalPages={result.meta?.totalPages ?? 0}
            onChange={onPageChange}
          />
        </>
      ) : result.state === QUERY_STATE.empty ? (
        <FeedbackState
          state={QUERY_STATE.empty}
          compact
          title="아직 투자 내역이 없어요"
          message="이 기업에 첫 가상 투자를 등록해 보세요."
        />
      ) : (
        <FeedbackState
          state={result.state}
          message={result.message || undefined}
          compact={result.state === QUERY_STATE.loading}
          onRetry={canRetryQuery(result.state) ? result.retry : undefined}
        />
      )}
    </section>
  );
}
