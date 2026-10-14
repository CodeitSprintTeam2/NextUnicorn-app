export const FIRST_PAGE = 1;
export const PAGE_SIZE = 10;
export const PAGE_BUTTON_COUNT = 5;

export function getRowNumber(page, index, limit = PAGE_SIZE) {
  return (page - FIRST_PAGE) * limit + index + FIRST_PAGE;
}

export function getVisiblePages(page, totalPages) {
  const groupIndex = Math.floor((page - FIRST_PAGE) / PAGE_BUTTON_COUNT);
  const firstPage = groupIndex * PAGE_BUTTON_COUNT + FIRST_PAGE;
  const lastPage = Math.min(firstPage + PAGE_BUTTON_COUNT - 1, totalPages);

  return Array.from(
    { length: Math.max(0, lastPage - firstPage + 1) },
    (_, index) => firstPage + index,
  );
}
