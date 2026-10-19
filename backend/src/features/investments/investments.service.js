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

function investmentNotFound() {
  return new ApiError(
    404,
    "INVESTMENT_NOT_FOUND",
    "투자 내역을 찾을 수 없습니다.",
  );
}

function invalidPassword() {
  return new ApiError(
    401,
    "INVALID_PASSWORD",
    "비밀번호가 일치하지 않습니다.",
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

export async function updateInvestment(investmentId, { password, update }) {
  const investment = await prisma.investment.findFirst({
    where: {
      id: investmentId,
      deletedAt: null,
    },
  });

  if (!investment) throw investmentNotFound();

  const passwordMatches = await bcrypt.compare(password, investment.passwordHash);
  if (!passwordMatches) throw invalidPassword();

  const updatedInvestment = await prisma.investment.update({
    where: { id: investmentId },
    data: update,
  });

  return { data: serializeInvestment(updatedInvestment) };
}

export async function deleteInvestment(investmentId, password) {
  const investment = await prisma.investment.findFirst({
    where: {
      id: investmentId,
      deletedAt: null,
    },
  });

  if (!investment) throw investmentNotFound();

  const passwordMatches = await bcrypt.compare(password, investment.passwordHash);
  if (!passwordMatches) throw invalidPassword();

  const result = await prisma.investment.updateMany({
    where: {
      id: investmentId,
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
  });

  if (result.count === 0) throw investmentNotFound();
}
