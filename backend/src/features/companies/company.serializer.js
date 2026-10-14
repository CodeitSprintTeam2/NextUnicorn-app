export function sumActiveInvestments(investments = []) {
  return investments.reduce((total, investment) => {
    if (investment.deletedAt != null) return total;
    return total + investment.amount;
  }, 0n);
}

function toApiNumber(value, fieldName) {
  const number = Number(value);
  if (!Number.isSafeInteger(number)) {
    throw new RangeError(`${fieldName} exceeds the safe integer range.`);
  }
  return number;
}

export function serializeCompany(company) {
  return {
    id: company.id,
    name: company.name,
    description: company.description,
    category: company.category.name,
    totalInvestment: toApiNumber(
      sumActiveInvestments(company.investments),
      "totalInvestment",
    ),
    revenue: toApiNumber(company.revenue, "revenue"),
    employees: company.employees,
  };
}
