import {
  MAX_COMPARE_COMPANIES,
  MAX_RECENT_COMPANIES,
  MIN_COMPARE_COMPANIES,
} from "./comparison.constants.js";

export function isSameCompany(firstId, secondId) {
  return String(firstId) === String(secondId);
}

export function canSubmitComparison(myCompanyId, companies) {
  if (!myCompanyId || !companies) return false;
  if (companies.length < MIN_COMPARE_COMPANIES) return false;
  if (companies.length > MAX_COMPARE_COMPANIES) return false;

  const companyIds = companies.map((company) => String(company.id));
  const hasDuplicate = new Set(companyIds).size !== companies.length;
  const includesMyCompany = companies.some(
    (company) => isSameCompany(company.id, myCompanyId),
  );

  return !hasDuplicate && !includesMyCompany;
}

export function toggleCompanySelection(current, company) {
  const isSelected = current.some((item) => isSameCompany(item.id, company.id));

  if (isSelected) {
    return current.filter((item) => !isSameCompany(item.id, company.id));
  }

  if (current.length >= MAX_COMPARE_COMPANIES) return current;
  return [...current, company];
}

export function addRecentCompany(recentCompanies, company) {
  const otherCompanies = recentCompanies.filter(
    (item) => !isSameCompany(item.id, company.id),
  );
  return [company, ...otherCompanies].slice(0, MAX_RECENT_COMPANIES);
}
