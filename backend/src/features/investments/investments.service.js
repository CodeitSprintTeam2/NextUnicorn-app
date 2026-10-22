import { Prisma } from "@prisma/client";
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

async function lockInvestment(tx, investmentId) {
  const rows = await tx.$queryRaw`
    SELECT
      id,
      company_id AS "companyId",
      amount,
      password_hash AS "passwordHash",
      deleted_at AS "deletedAt"
    FROM investments
    WHERE id = ${investmentId}
    FOR UPDATE
  `;

  return rows[0];
}

export async function createInvestment(input) {
  const company = await prisma.company.findUnique({
    where: { id: input.companyId },
    select: { id: true },
  });

  if (!company) throw companyNotFound();

  const passwordHash = await bcrypt.hash(input.password, PASSWORD_HASH_ROUNDS);
  const investment = await prisma.$transaction(async (tx) => {
    const createdInvestment = await tx.investment.create({
      data: {
        companyId: input.companyId,
        investorName: input.investorName,
        amount: input.amount,
        comment: input.comment,
        passwordHash,
      },
    });

    await tx.company.update({
      where: { id: input.companyId },
      data: {
        virtualInvestment: {
          increment: new Prisma.Decimal(input.amount.toString()),
        },
      },
    });

    return createdInvestment;
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

  let updatedInvestment;

  try {
    updatedInvestment = await prisma.$transaction(async (tx) => {
      const current = await lockInvestment(tx, investmentId);
      if (!current || current.deletedAt !== null) throw investmentNotFound();

      const updated = await tx.investment.update({
        where: { id: investmentId },
        data: update,
      });

      if (update.amount !== undefined) {
        const amountDifference = update.amount - current.amount;
        if (amountDifference !== 0n) {
          await tx.company.update({
            where: { id: current.companyId },
            data: {
              virtualInvestment: {
                increment: new Prisma.Decimal(amountDifference.toString()),
              },
            },
          });
        }
      }

      return updated;
    });
  } catch (error) {
    if (error?.code === "P2025") throw investmentNotFound();
    throw error;
  }

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

  await prisma.$transaction(async (tx) => {
    const current = await lockInvestment(tx, investmentId);
    if (!current || current.deletedAt !== null) throw investmentNotFound();

    await tx.investment.update({
      where: { id: investmentId },
      data: { deletedAt: new Date() },
    });

    await tx.company.update({
      where: { id: current.companyId },
      data: {
        virtualInvestment: {
          decrement: new Prisma.Decimal(current.amount.toString()),
        },
      },
    });
  });
}
