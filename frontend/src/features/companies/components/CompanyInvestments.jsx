import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function closeMenu(event) {
      if (
        triggerRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }
      setIsOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handleViewportChange() {
      setIsOpen(false);
    }

    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen]);

  function handleToggle() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 120;
    const menuHeight = 84;
    const gap = 4;
    const viewportPadding = 8;
    const below = rect.bottom + gap;
    const top =
      below + menuHeight <= window.innerHeight - viewportPadding
        ? below
        : Math.max(viewportPadding, rect.top - menuHeight - gap);
    const left = Math.min(
      window.innerWidth - menuWidth - viewportPadding,
      Math.max(viewportPadding, rect.right - menuWidth),
    );

    setPosition({ top, left });
    setIsOpen(true);
  }

  function handleSelect(mode) {
    setIsOpen(false);
    onEdit(mode, investment);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.menuTrigger}
        aria-label={`${investment.investorName} 투자 내역 메뉴`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={handleToggle}
      >
        ⋮
      </button>
      {isOpen && createPortal(
        <div
          ref={menuRef}
          className={styles.menuPopover}
          role="menu"
          style={position}
        >
        <button
          type="button"
          role="menuitem"
          onClick={() => handleSelect(INVESTMENT_MODE.update)}
        >
          수정하기
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => handleSelect(INVESTMENT_MODE.delete)}
        >
          삭제하기
        </button>
        </div>,
        document.body,
      )}
    </>
  );
}

export function CompanyInvestments({ company, result, page, onPageChange, onEdit }) {
  const currentPage = result.meta?.page ?? page;
  const pageSize = result.meta?.limit;
  const columns = [
    {
      key: "rank",
      label: "순위",
      width: "56px",
      render: (_, index) => getRowNumber(currentPage, index, pageSize),
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
      <h2>Next Unicorn에서 받은 투자</h2>
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
            page={currentPage}
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
