import "./SearchSortBar.css";

export function SearchSortBar({
  search = "",
  onSearchChange,
  sortValue = "",
  sortOptions = [],
  onSortChange,
  searchPlaceholder = "검색어를 입력해 주세요",
  children,
}) {
  return (
    <div className="search-sort-bar">
      <label className="search-field">
        <span className="search-field__icon" aria-hidden="true">⌕</span>
        <span className="visually-hidden">기업명 검색</span>
        <input
          type="search"
          value={search}
          placeholder={searchPlaceholder}
          onChange={(event) => onSearchChange?.(event.target.value)}
        />
      </label>
      {sortOptions.length > 0 ? (
        <label className="sort-field">
          <span className="visually-hidden">정렬 기준</span>
          <select value={sortValue} onChange={(event) => onSortChange?.(event.target.value)}>
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <span className="sort-field__chevron" aria-hidden="true">⌄</span>
        </label>
      ) : null}
      {children}
    </div>
  );
}
