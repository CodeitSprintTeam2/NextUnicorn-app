import { SORT_ORDER } from "../../utils/sort.js";

export function sortComparisonCompanies(companies, sortBy, order) {
  return [...companies].sort((first, second) => {
    // Money stays as BigInt so values beyond Number's safe range remain ordered.
    const firstValue = BigInt(first[sortBy] ?? 0);
    const secondValue = BigInt(second[sortBy] ?? 0);

    if (firstValue === secondValue) return Number(first.id) - Number(second.id);

    const difference = firstValue < secondValue ? -1 : 1;
    return order === SORT_ORDER.ascending ? difference : -difference;
  });
}
