import bcrypt from "bcrypt";
import { ApiError } from "../../errors/api-error.js";
import { prisma } from "../../lib/prisma.js";
import { serializeInvestment } from "../../serializers/investment.serializer.js";

const PASSWORD_HASH_ROUNDS = 10;

function companyNotFound() {
  return new ApiError(
    404,
    "COMPANY_NOT_FOUND",
    "기업을 찾을 수 없습니다.",
  );
}

export async function createInvestment(input) {
  const company = await prisma.company.findUnique({
    where: { id: input.companyId },
    select: { id: true },
  });

  if (!company) throw companyNotFound();

  const passwordHash = await bcrypt.hash(input.password, PASSWORD_HASH_ROUNDS);
  const investment = await prisma.investment.create({
    data: {
      companyId: input.companyId,
      investorName: input.investorName,
      amount: input.amount,
      comment: input.comment,
      passwordHash,
    },
  });

  return { data: serializeInvestment(investment) };
}
