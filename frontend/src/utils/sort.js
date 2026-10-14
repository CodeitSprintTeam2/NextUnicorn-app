export const SORT_ORDER = { ascending: "asc", descending: "desc" };

export function getSortParams(value) {
  const [sortBy, order] = value.split(":");
  return { sortBy, order };
}

export function createSortOptions(field, descendingLabel, ascendingLabel) {
  return [
    { value: `${field}:${SORT_ORDER.descending}`, label: descendingLabel },
    { value: `${field}:${SORT_ORDER.ascending}`, label: ascendingLabel },
  ];
}
