export function serializeInvestment(investment) {
  return {
    id: investment.id,
    companyId: investment.companyId,
    investorName: investment.investorName,
    amount: investment.amount.toString(),
    comment: investment.comment,
    createdAt: investment.createdAt.toISOString(),
    updatedAt: investment.updatedAt.toISOString(),
  };
}
