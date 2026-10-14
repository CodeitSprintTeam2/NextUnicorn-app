export const ROUTES = {
  companies: "/companies",
  companyDetail: "/companies/:companyId",
  compare: "/compare",
  comparisonStatus: "/compare/status",
  investments: "/investments",
};

export function companyDetailPath(companyId) {
  return `${ROUTES.companies}/${companyId}`;
}
