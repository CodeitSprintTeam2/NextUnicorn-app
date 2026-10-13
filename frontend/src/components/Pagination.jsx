import "./Pagination.css";

function visiblePages(page, totalPages) {
  const first = Math.max(1, Math.min(page - 2, totalPages - 4));
  const last = Math.min(totalPages, Math.max(5, page + 2));
  return Array.from({ length: Math.max(0, last - first + 1) }, (_, index) => first + index);
}

export function Pagination({ page, totalPages, onChange, disabled = false }) {
  if (!Number.isInteger(totalPages) || totalPages <= 1) return null;
  const pages = visiblePages(page, totalPages);

  return (
    <nav className="pagination" aria-label="페이지 이동">
      <button className="pagination__button" type="button" aria-label="이전 페이지" disabled={disabled || page <= 1} onClick={() => onChange(page - 1)}>‹</button>
      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          className={`pagination__button${pageNumber === page ? " is-current" : ""}`}
          type="button"
          aria-current={pageNumber === page ? "page" : undefined}
          aria-label={`${pageNumber}페이지`}
          disabled={disabled}
          onClick={() => onChange(pageNumber)}
        >
          {pageNumber}
        </button>
      ))}
      <button className="pagination__button" type="button" aria-label="다음 페이지" disabled={disabled || page >= totalPages} onClick={() => onChange(page + 1)}>›</button>
    </nav>
  );
}
