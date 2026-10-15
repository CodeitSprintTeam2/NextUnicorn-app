export function serializeCompany(company) {
  return {
    id: company.id,
    name: company.name,
    description: company.description,
    category: company.category.name,
    actualInvestment: company.actualInvestment.toString(),
    revenue: company.revenue.toString(),
    employees: company.employees,
  };
}

export function serializeCompanyDetail(company, virtualInvestment) {
  return {
    ...serializeCompany(company),
    virtualInvestment: virtualInvestment.toString(),
  };
}
