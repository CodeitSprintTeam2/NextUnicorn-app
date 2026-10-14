import { FIRST_PAGE, getVisiblePages } from "../utils/pagination.js";
import styles from "./Pagination.module.css";

export function Pagination({ page = FIRST_PAGE, totalPages = 0, onChange }) {
  if (totalPages <= FIRST_PAGE) return null;

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <nav className={styles.pagination} aria-label="페이지 이동">
      <button
        type="button"
        aria-label="이전 페이지"
        disabled={page <= FIRST_PAGE}
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>
      {visiblePages.map((pageNumber) => (
        <button
          type="button"
          key={pageNumber}
          aria-current={pageNumber === page ? "page" : undefined}
          className={pageNumber === page ? styles.active : undefined}
          onClick={() => onChange(pageNumber)}
        >
          {pageNumber}
        </button>
      ))}
      <button
        type="button"
        aria-label="다음 페이지"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </nav>
  );
}
