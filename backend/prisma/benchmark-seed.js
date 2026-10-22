import bcrypt from "bcrypt";

let prisma;

const COMPANY_COUNT = 1_000_000;
const COMPANY_BATCH_SIZE = 5_000;
const INVESTMENT_BATCH_SIZE = 5_000;
const PASSWORD_POOL_SIZE = 1_000;
const VERIFICATION_INVESTMENT_COUNT = 1_000;
const BCRYPT_ROUNDS = 10;
const DELETED_PERCENT = 15;
const BENCHMARK_DATABASE_NAME = "nextunicorn_benchmark";
const PERFORMANCE_INVESTMENT_COUNT = 9_860_000;
const VERIFICATION_TOTAL_COUNT = 1_000;
const TOTAL_INVESTMENT_COUNT =
  PERFORMANCE_INVESTMENT_COUNT + VERIFICATION_TOTAL_COUNT;
const LOCAL_DATABASE_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

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

function assertLocalBenchmarkDatabase() {
  let databaseUrl;

  try {
    databaseUrl = new URL(process.env.DATABASE_URL);
  } catch {
    throw new Error("DATABASE_URL을 해석할 수 없어 투자 재생성을 중단합니다.");
  }

  const databaseName = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ""));

  if (!LOCAL_DATABASE_HOSTS.has(databaseUrl.hostname)) {
    throw new Error(
      `투자 재생성은 로컬 DB에서만 가능합니다: host=${databaseUrl.hostname || "unknown"}`,
    );
  }

  if (databaseName !== BENCHMARK_DATABASE_NAME) {
    throw new Error(
      `투자 재생성 대상은 ${BENCHMARK_DATABASE_NAME} DB여야 합니다: database=${databaseName || "unknown"}`,
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

function deletedInvestmentCount(companyPosition, investmentCount) {
  const scaledCount = investmentCount * DELETED_PERCENT;
  const minimumCount = Math.floor(scaledCount / 100);
  const remainder = scaledCount % 100;
  const deterministicBucket = (companyPosition * 37) % 100;

  return minimumCount + (deterministicBucket < remainder ? 1 : 0);
}

function shouldSoftDelete(companyPosition, investmentPosition, investmentCount) {
  const deleteCount = deletedInvestmentCount(companyPosition, investmentCount);
  const offset = (companyPosition * 2_654_435_761) % investmentCount;
  const relativePosition =
    (investmentPosition - 1 - offset + investmentCount) % investmentCount;

  return relativePosition < deleteCount;
}

function summarizeCompanyInvestments(companyPosition) {
  const total = investmentsForCompany(companyPosition);
  let deleted = 0;

  for (let investmentPosition = 1; investmentPosition <= total; investmentPosition += 1) {
    if (shouldSoftDelete(companyPosition, investmentPosition, total)) {
      deleted += 1;
    }
  }

  return { total, active: total - deleted, deleted };
}

function summarizeCompanyGroup(startPosition, endPosition) {
  let total = 0;
  let deleted = 0;

  for (let companyPosition = startPosition; companyPosition <= endPosition; companyPosition += 1) {
    const investmentCount = investmentsForCompany(companyPosition);
    total += investmentCount;
    deleted += deletedInvestmentCount(companyPosition, investmentCount);
  }

  return { total, active: total - deleted, deleted };
}

function validateSeedDistribution() {
  const samples = [
    { type: "초인기", companyPosition: 1, expected: { total: 10_000, active: 8_500, deleted: 1_500 } },
    { type: "인기", companyPosition: 101, expected: { total: 400, active: 340, deleted: 60 } },
    { type: "일반(삭제 2건)", companyPosition: 10_001, expected: { total: 10, active: 8, deleted: 2 } },
    { type: "일반(삭제 1건)", companyPosition: 10_002, expected: { total: 10, active: 9, deleted: 1 } },
  ];

  for (const sample of samples) {
    const actual = summarizeCompanyInvestments(sample.companyPosition);
    const isValid = Object.entries(sample.expected).every(
      ([key, expectedValue]) => actual[key] === expectedValue,
    );

    if (!isValid) {
      throw new Error(
        `${sample.type} 기업 분포 검증 실패: expected=${JSON.stringify(sample.expected)}, actual=${JSON.stringify(actual)}`,
      );
    }

    console.log(
      `분포 검증 - ${sample.type}: 전체 ${actual.total.toLocaleString()}건, 활성 ${actual.active.toLocaleString()}건, 삭제 ${actual.deleted.toLocaleString()}건`,
    );
  }

  const groups = [
    { type: "초인기 전체", range: [1, 100], expected: { total: 1_000_000, active: 850_000, deleted: 150_000 } },
    { type: "인기 전체", range: [101, 10_000], expected: { total: 3_960_000, active: 3_366_000, deleted: 594_000 } },
    { type: "일반 전체", range: [10_001, 500_000], expected: { total: 4_900_000, active: 4_165_000, deleted: 735_000 } },
  ];

  for (const group of groups) {
    const actual = summarizeCompanyGroup(...group.range);
    const isValid = Object.entries(group.expected).every(
      ([key, expectedValue]) => actual[key] === expectedValue,
    );

    if (!isValid) {
      throw new Error(
        `${group.type} 분포 검증 실패: expected=${JSON.stringify(group.expected)}, actual=${JSON.stringify(actual)}`,
      );
    }

    console.log(
      `분포 검증 - ${group.type}: 전체 ${actual.total.toLocaleString()}건, 활성 ${actual.active.toLocaleString()}건, 삭제 ${actual.deleted.toLocaleString()}건`,
    );
  }

  console.log("소규모 시드 분포 검증 완료");
}

function buildInvestment({
  companyId,
  companyPosition,
  investmentPosition,
  investmentCount,
  passwordHash,
}) {
  const sequence = companyPosition * 10_000 + investmentPosition;
  const createdAt = new Date(Date.UTC(2025, 0, 1) + sequence * 1_000);
  const deletedAt = shouldSoftDelete(
    companyPosition,
    investmentPosition,
    investmentCount,
  )
    ? createdAt
    : null;

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
          investmentCount: count,
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

async function getBenchmarkCompanies() {
  const companies = await prisma.company.findMany({
    where: { name: { startsWith: COMPANY_NAME_PREFIX } },
    orderBy: { name: "asc" },
    select: { id: true },
  });

  if (companies.length !== COMPANY_COUNT) {
    throw new Error(
      `기존 벤치마크 기업 수가 ${COMPANY_COUNT.toLocaleString()}건이 아닙니다: ${companies.length.toLocaleString()}건`,
    );
  }

  return companies;
}

async function validateExistingInvestmentOwnership() {
  const [total, performance, verification] = await Promise.all([
    prisma.investment.count(),
    prisma.investment.count({
      where: { investorName: { startsWith: INVESTOR_NAME_PREFIX } },
    }),
    prisma.investment.count({
      where: { investorName: { startsWith: "verify-" } },
    }),
  ]);
  const other = total - performance - verification;

  if (
    total !== TOTAL_INVESTMENT_COUNT ||
    performance !== PERFORMANCE_INVESTMENT_COUNT ||
    verification !== VERIFICATION_TOTAL_COUNT ||
    other !== 0
  ) {
    throw new Error(
      `기존 투자 데이터 소유권 검증 실패: total=${total.toLocaleString()}, bench=${performance.toLocaleString()}, verify=${verification.toLocaleString()}, other=${other.toLocaleString()}`,
    );
  }

  console.log(
    `기존 투자 데이터 검증 완료: 전체 ${total.toLocaleString()}건, 성능시험용 ${performance.toLocaleString()}건, 검증용 ${verification.toLocaleString()}건`,
  );
}

async function summarizeStoredGroup(startName, endName) {
  const baseWhere = {
    investorName: { startsWith: INVESTOR_NAME_PREFIX },
    company: { name: { gte: startName, lte: endName } },
  };
  const [total, deleted] = await Promise.all([
    prisma.investment.count({ where: baseWhere }),
    prisma.investment.count({
      where: { ...baseWhere, deletedAt: { not: null } },
    }),
  ]);

  return { total, active: total - deleted, deleted };
}

async function validateStoredInvestmentDistribution() {
  const groups = [
    {
      type: "초인기 전체",
      names: ["Benchmark Company 0000001", "Benchmark Company 0000100"],
      expected: { total: 1_000_000, active: 850_000, deleted: 150_000 },
    },
    {
      type: "인기 전체",
      names: ["Benchmark Company 0000101", "Benchmark Company 0010000"],
      expected: { total: 3_960_000, active: 3_366_000, deleted: 594_000 },
    },
    {
      type: "일반 전체",
      names: ["Benchmark Company 0010001", "Benchmark Company 0500000"],
      expected: { total: 4_900_000, active: 4_165_000, deleted: 735_000 },
    },
  ];

  for (const group of groups) {
    const actual = await summarizeStoredGroup(...group.names);
    const isValid = Object.entries(group.expected).every(
      ([key, expectedValue]) => actual[key] === expectedValue,
    );

    if (!isValid) {
      throw new Error(
        `${group.type} DB 분포 검증 실패: expected=${JSON.stringify(group.expected)}, actual=${JSON.stringify(actual)}`,
      );
    }

    console.log(
      `DB 분포 검증 - ${group.type}: 전체 ${actual.total.toLocaleString()}건, 활성 ${actual.active.toLocaleString()}건, 삭제 ${actual.deleted.toLocaleString()}건`,
    );
  }

  const [verificationTotal, verificationDeleted] = await Promise.all([
    prisma.investment.count({
      where: { investorName: { startsWith: "verify-" } },
    }),
    prisma.investment.count({
      where: {
        investorName: { startsWith: "verify-" },
        deletedAt: { not: null },
      },
    }),
  ]);

  if (
    verificationTotal !== VERIFICATION_TOTAL_COUNT ||
    verificationDeleted !== 0
  ) {
    throw new Error(
      `검증용 투자 DB 분포 검증 실패: total=${verificationTotal.toLocaleString()}, deleted=${verificationDeleted.toLocaleString()}`,
    );
  }

  console.log(
    `DB 분포 검증 - 검증용: 전체 ${verificationTotal.toLocaleString()}건, 활성 ${verificationTotal.toLocaleString()}건, 삭제 0건`,
  );
}

async function assertInvestmentTable() {
  const tables = await prisma.$queryRaw`
    SELECT table_name AS "tableName"
    FROM information_schema.tables
    WHERE table_schema = current_schema()
      AND table_name = 'investments'
  `;

  if (tables.length !== 1 || tables[0].tableName !== "investments") {
    throw new Error(
      "현재 스키마에서 investments 테이블을 정확히 확인할 수 없어 투자 재생성을 중단합니다.",
    );
  }
}

async function getInvestmentIndexDefinitions() {
  return prisma.$queryRaw`
    SELECT indexname AS "indexName", indexdef AS "indexDefinition"
    FROM pg_indexes
    WHERE schemaname = current_schema()
      AND tablename = 'investments'
    ORDER BY indexname
  `;
}

async function truncateInvestments() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "investments" RESTART IDENTITY RESTRICT',
  );

  const remaining = await prisma.investment.count();

  if (remaining !== 0) {
    throw new Error(
      `TRUNCATE 후 투자 데이터가 남아 있습니다: ${remaining.toLocaleString()}건`,
    );
  }

  console.log("기존 투자 데이터 TRUNCATE 완료");
}

async function analyzeInvestmentTable() {
  await prisma.$executeRawUnsafe('ANALYZE "investments"');
  console.log("투자 테이블 ANALYZE 완료");
}

async function vacuumInvestmentTable() {
  await prisma.$executeRawUnsafe('VACUUM (ANALYZE) "investments"');
  console.log("투자 테이블 VACUUM (ANALYZE) 완료");
}

async function reseedInvestments() {
  await assertInvestmentTable();
  const companies = await getBenchmarkCompanies();
  await validateExistingInvestmentOwnership();

  if (!process.argv.includes("--confirm-delete-investments")) {
    throw new Error(
      "기존 투자 데이터를 삭제하려면 --confirm-delete-investments 옵션을 함께 지정하세요. 현재 데이터는 변경되지 않았습니다.",
    );
  }

  const indexesBeforeTruncate = await getInvestmentIndexDefinitions();
  await truncateInvestments();
  const indexesAfterTruncate = await getInvestmentIndexDefinitions();

  if (
    JSON.stringify(indexesAfterTruncate) !== JSON.stringify(indexesBeforeTruncate)
  ) {
    throw new Error(
      "TRUNCATE 전후 투자 테이블의 인덱스 정의가 달라 재생성을 중단합니다.",
    );
  }

  console.log(
    `투자 테이블 인덱스 ${indexesAfterTruncate.length.toLocaleString()}개 보존 확인`,
  );

  const passwordPool = await createHashPool();
  const investmentCount = await seedInvestments(companies, passwordPool);
  await seedVerificationInvestments(companies);

  if (investmentCount !== PERFORMANCE_INVESTMENT_COUNT) {
    throw new Error(
      `성능시험용 투자 생성 건수가 예상과 다릅니다: expected=${PERFORMANCE_INVESTMENT_COUNT.toLocaleString()}, actual=${investmentCount.toLocaleString()}`,
    );
  }

  await validateStoredInvestmentDistribution();
  await analyzeInvestmentTable();

  if (process.argv.includes("--vacuum-after-reseed")) {
    await vacuumInvestmentTable();
  }

  console.log(
    `투자 재생성 완료: 성능시험용 ${investmentCount.toLocaleString()}건, 검증용 ${VERIFICATION_TOTAL_COUNT.toLocaleString()}건`,
  );
}

async function main() {
  validateSeedDistribution();

  if (process.argv.includes("--validate-only")) {
    return;
  }

  assertLocalBenchmarkSeed();

  const shouldReseedInvestments = process.argv.includes("--reseed-investments");

  if (shouldReseedInvestments) {
    assertLocalBenchmarkDatabase();
  }

  ({ prisma } = await import("../src/lib/prisma.js"));

  if (shouldReseedInvestments) {
    await reseedInvestments();
    return;
  }

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
    if (prisma) {
      await prisma.$disconnect();
    }
  });
