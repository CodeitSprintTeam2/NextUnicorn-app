import { prisma } from "../src/lib/prisma.js";

const CATEGORIES = [
  { name: "핀테크" },
  { name: "AI·빅데이터" },
  { name: "헬스케어" },
  { name: "커머스" },
  { name: "모빌리티" },
  { name : "제과"}
];

// 기본 시드 베이스 이름 (10개)
const BASE_NAMES = [
  "코드페이", "딥인사이트", "메디커넥트", "오토무브", "클라우드랩",
  "스마트로지스", "바이오젠", "알고트레이드", "넥스트커머스", "파워포인트"
];

// 고정된 무작위 느낌의 접미사 해시 (3개 세트 -> 10 x 3 = 30개 생성)
const SUFFIX_HASHES = ["본사", "지사", "회사"];

// 30개의 기업 데이터 자동 조합 생성
const COMPANIES = [];
let seedIndex = 1;

for (const suffix of SUFFIX_HASHES) {
  for (let i = 0; i < BASE_NAMES.length; i++) {
    const baseName = BASE_NAMES[i];
    const category = CATEGORIES[i % CATEGORIES.length].name;

    COMPANIES.push({
      name: `${baseName}-${suffix}`,
      description: `${category} 분야를 혁신하는 ${baseName}의 ${suffix} 솔루션입니다.`,
      categoryName: category,
      // 금액과 인원수도 현실적인 범위의 규칙으로 생성
      actualInvestment: BigInt((seedIndex * 3 + 10) * 100_000_000), // 13억 ~ 100억
      revenue: BigInt((seedIndex * 2 + 5) * 100_000_000),           // 7억 ~ 65억
      employees: (seedIndex * 3) % 70 + 10,                        // 10명 ~ 80명
    });

    seedIndex++;
  }
}

// 검증 로직 (이슈2 완료 기준)
const MAX_BIGINT = 9223372036854775807n;

function validateSeedData(categories, companies) {
  const companyNames = companies.map((c) => c.name);
  if (companyNames.length !== new Set(companyNames).size) {
    throw new Error("시드 데이터에 중복된 기업명이 존재합니다.");
  }

  const validCategories = new Set(categories.map((c) => c.name));

  for (const c of companies) {
    if (!c.name || !c.description || !c.categoryName) {
      throw new Error(`[${c.name}] 필수 필드가 누락되었습니다.`);
    }
    if (!validCategories.has(c.categoryName)) {
      throw new Error(`[${c.name}] 유효하지 않은 카테고리입니다.`);
    }
    if (c.actualInvestment < 0n || c.actualInvestment > MAX_BIGINT || c.revenue < 0n || c.revenue > MAX_BIGINT) {
      throw new Error(`[${c.name}] 금액이 유효한 BIGINT 범위를 벗어났습니다.`);
    }
    if (c.employees < 0) {
      throw new Error(`[${c.name}] 고용 인원은 0 이상이어야 합니다.`);
    }
  }
}

async function main() {
  console.log("🌱 시드 데이터 유효성 검증 중...");
  validateSeedData(CATEGORIES, COMPANIES);

  // 1. 카테고리 upsert
  const categoryMap = new Map();
  for (const cat of CATEGORIES) {
    const record = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });
    categoryMap.set(record.name, record.id);
  }

  // 2. 기업 upsert (중복 실행 시에도 데이터 갱신으로 멱등성 유지)
  for (const comp of COMPANIES) {
    const categoryId = categoryMap.get(comp.categoryName);
    await prisma.company.upsert({
      where: { name: comp.name },
      update: {
        description: comp.description,
        categoryId,
        actualInvestment: comp.actualInvestment,
        revenue: comp.revenue,
        employees: comp.employees,
      },
      create: {
        name: comp.name,
        description: comp.description,
        categoryId,
        actualInvestment: comp.actualInvestment,
        revenue: comp.revenue,
        employees: comp.employees,
      },
    });
  }

  console.log(`🎉 시딩 완료: 카테고리 ${CATEGORIES.length}개, 기업 ${COMPANIES.length}개 생성/갱신됨`);
}

main()
  .catch((e) => {
    console.error("❌ 시딩 실패:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });