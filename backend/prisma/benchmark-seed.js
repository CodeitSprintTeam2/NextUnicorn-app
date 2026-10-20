import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma.js";

const COMPANY_COUNT = 1_000_000;
const COMPANY_BATCH_SIZE = 5_000;
const INVESTMENT_BATCH_SIZE = 5_000;
const PASSWORD_POOL_SIZE = 1_000;
const VERIFICATION_INVESTMENT_COUNT = 1_000;
const BCRYPT_ROUNDS = 10;
const DELETED_PERCENT = 15;

const COMPANY_NAME_PREFIX = "Benchmark Company ";
const INVESTOR_NAME_PREFIX = "bench-";
const CATEGORY_NAME = "Benchmark";

function assertLocalBenchmarkSeed() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("벤치마크 시드는 production 환경에서 실행할 수 없습니다.");
  }

  if (process.env.ALLOW_BENCHMARK_SEED !== "true") {
    throw new Error(
      "로컬 벤치마크 시드를 실행하려면 ALLOW_BENCHMARK_SEED=true를 설정하세요.",
    );
  }
}

function pad(value, length = 7) {
  return String(value).padStart(length, "0");
}

async function createHashPool() {
  const hashes = [];
  const concurrency = 20;

  for (let start = 0; start < PASSWORD_POOL_SIZE; start += concurrency) {
    const size = Math.min(concurrency, PASSWORD_POOL_SIZE - start);
    const batch = await Promise.all(
      Array.from({ length: size }, (_, offset) =>
        bcrypt.hash(`benchmark-pool-${start + offset}`, BCRYPT_ROUNDS),
      ),
    );
    hashes.push(...batch);
  }

  return hashes;
}

async function seedCompanies(categoryId) {
  for (let start = 1; start <= COMPANY_COUNT; start += COMPANY_BATCH_SIZE) {
    const end = Math.min(start + COMPANY_BATCH_SIZE - 1, COMPANY_COUNT);
    const data = [];

    for (let number = start; number <= end; number += 1) {
      data.push({
        name: `${COMPANY_NAME_PREFIX}${pad(number)}`,
        description: `인덱스 성능 측정을 위한 벤치마크 기업 ${number}`,
        categoryId,
        actualInvestment: BigInt(number) * 10_000_000n,
        revenue: BigInt(number) * 20_000_000n,
        employees: (number % 10_000) + 1,
      });
    }

    await prisma.company.createMany({ data, skipDuplicates: true });
    console.log(`기업 시드: ${end.toLocaleString()} / ${COMPANY_COUNT.toLocaleString()}`);
  }
}

function investmentsForCompany(position) {
  if (position <= 100) return 10_000;
  if (position <= 10_000) return 400;
  if (position <= 500_000) return 10;
  return 0;
}

function buildInvestment({ companyId, companyPosition, investmentPosition, passwordHash }) {
  const sequence = companyPosition * 10_000 + investmentPosition;
  const createdAt = new Date(Date.UTC(2025, 0, 1) + sequence * 1_000);
  const deletedAt = sequence % 100 < DELETED_PERCENT ? createdAt : null;

  return {
    companyId,
    investorName: `${INVESTOR_NAME_PREFIX}${pad(sequence % 10_000_000, 8)}`,
    amount: BigInt((sequence % 10_000) + 1) * 1_000_000n,
    comment: `벤치마크 가상투자 ${sequence}`,
    passwordHash,
    createdAt,
    updatedAt: createdAt,
    deletedAt,
  };
}

async function seedInvestments(companies, passwordPool) {
  let batch = [];
  let inserted = 0;

  for (let companyIndex = 0; companyIndex < companies.length; companyIndex += 1) {
    const companyPosition = companyIndex + 1;
    const count = investmentsForCompany(companyPosition);

    for (let investmentPosition = 1; investmentPosition <= count; investmentPosition += 1) {
      batch.push(
        buildInvestment({
          companyId: companies[companyIndex].id,
          companyPosition,
          investmentPosition,
          passwordHash:
            passwordPool[(companyPosition + investmentPosition) % passwordPool.length],
        }),
      );

      if (batch.length === INVESTMENT_BATCH_SIZE) {
        await prisma.investment.createMany({ data: batch });
        inserted += batch.length;
        batch = [];
        console.log(`가상투자 시드: ${inserted.toLocaleString()}건`);
      }
    }
  }

  if (batch.length > 0) {
    await prisma.investment.createMany({ data: batch });
    inserted += batch.length;
  }

  return inserted;
}

async function seedVerificationInvestments(companies) {
  for (let index = 1; index <= VERIFICATION_INVESTMENT_COUNT; index += 1) {
    const password = `benchmark-password-${pad(index, 6)}`;
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await prisma.investment.create({
      data: {
        companyId: companies[(index - 1) % companies.length].id,
        investorName: `verify-${pad(index, 6)}`,
        amount: BigInt(index) * 1_000_000n,
        comment: `수정·삭제 검증용 투자 ${index}`,
        passwordHash,
      },
    });
  }
}

async function main() {
  assertLocalBenchmarkSeed();

  const existingInvestment = await prisma.investment.findFirst({
    where: { investorName: { startsWith: INVESTOR_NAME_PREFIX } },
    select: { id: true },
  });

  if (existingInvestment) {
    throw new Error(
      "벤치마크 투자 데이터가 이미 존재합니다. 중복 생성을 막기 위해 실행을 중단합니다.",
    );
  }

  const category = await prisma.category.upsert({
    where: { name: CATEGORY_NAME },
    update: {},
    create: { name: CATEGORY_NAME },
  });

  await seedCompanies(category.id);

  const companies = await prisma.company.findMany({
    where: { name: { startsWith: COMPANY_NAME_PREFIX } },
    orderBy: { name: "asc" },
    select: { id: true },
  });

  if (companies.length !== COMPANY_COUNT) {
    throw new Error(
      `벤치마크 기업 수가 ${COMPANY_COUNT.toLocaleString()}건이 아닙니다: ${companies.length.toLocaleString()}건`,
    );
  }

  const passwordPool = await createHashPool();
  const investmentCount = await seedInvestments(companies, passwordPool);
  await seedVerificationInvestments(companies);

  console.log(`기업 ${companies.length.toLocaleString()}건 생성 완료`);
  console.log(`성능시험 투자 ${investmentCount.toLocaleString()}건 생성 완료`);
  console.log(`검증용 투자 ${VERIFICATION_INVESTMENT_COUNT.toLocaleString()}건 생성 완료`);
  console.log(
    "검증용 비밀번호 규칙: benchmark-password-000001 ~ benchmark-password-001000",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
