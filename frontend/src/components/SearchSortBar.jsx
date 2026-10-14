import { SortSelect } from "./SortSelect.jsx";
import styles from "./SearchSortBar.module.css";

export function SearchSortBar({
  search,
  onSearchChange,
  sortValue,
  sortOptions,
  onSortChange,
}) {
  return (
    <div className={styles.bar}>
      <label className={styles.search}>
        <span aria-hidden="true">⌕</span>
        <span className="visually-hidden">기업명 검색</span>
        <input
          type="search"
          value={search}
          placeholder="검색어를 입력해 주세요"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
      <SortSelect
        label="정렬 기준"
        value={sortValue}
        options={sortOptions}
        onChange={onSortChange}
        className={styles.sort}
      />
    </div>
  );
}
