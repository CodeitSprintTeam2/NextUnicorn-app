function idOf(value) {
  return typeof value === "object" && value !== null ? value.id : value;
}

export function canSubmitComparison(myCompanyId, compareCompanyIds) {
  if (myCompanyId === null || myCompanyId === undefined || myCompanyId === "") return false;
  if (!Array.isArray(compareCompanyIds) || compareCompanyIds.length < 1 || compareCompanyIds.length > 5) return false;

  const ownId = String(idOf(myCompanyId));
  const ids = compareCompanyIds.map((company) => String(idOf(company)));
  return ids.every((id) => id !== ownId) && new Set(ids).size === ids.length;
}

export function toggleCompanySelection(selectedCompanies, company) {
  const companyId = String(idOf(company));
  const selected = selectedCompanies.some((item) => String(idOf(item)) === companyId);
  return selected
    ? selectedCompanies.filter((item) => String(idOf(item)) !== companyId)
    : [...selectedCompanies, company];
}
