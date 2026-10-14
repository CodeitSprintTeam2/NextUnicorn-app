import { prisma } from "../src/lib/prisma.js";

// 1. 카테고리 정의
// 1. 카테고리 정의 (12개 분야)
const CATEGORIES = [
  { name: "핀테크" },
  { name: "AI·빅데이터" },
  { name: "헬스케어·바이오" },
  { name: "커머스·유통" },
  { name: "모빌리티·자율주행" },
  { name: "클라우드·SaaS" },
  { name: "로보틱스·제조" },
  { name: "친환경·에너지" },
  { name: "보안·블록체인" },
  { name: "에듀테크" },
  { name: "푸드테크" },
  { name: "미디어·콘텐츠" },
];

// 2. 단어 조합 풀 (10 x 10 x 10 = 1,000개의 고유한 조합 생성)
const PREFIXES = ["스마트", "넥스트", "딥", "하이퍼", "클라우드", "에이아이", "알파", "퓨처", "에코", "네오"];
const CORES = ["페이", "데이터", "모빌리티", "바이오", "로보틱스", "헬스", "커머스", "보안", "에너지", "물류"];
const SUFFIXES = ["랩스", "테크", "솔루션", "컴퍼니", "파트너스", "웍스", "스튜디오", "네트웍스", "시스템", "허브"];

const TOTAL_COUNT = 1000;

// 3. Array.from을 활용한 1,000개 기업 데이터 생성
const COMPANIES = Array.from({ length: TOTAL_COUNT }, (_, i) => {
  const p = PREFIXES[i % PREFIXES.length];
  const c = CORES[Math.floor(i / PREFIXES.length) % CORES.length];
  const s = SUFFIXES[Math.floor(i / (PREFIXES.length * CORES.length)) % SUFFIXES.length];
  
  const name = `${p}${c}${s}`;
  const categoryName = CATEGORIES[i % CATEGORIES.length].name;

  return {
    name,
    description: `${categoryName} 분야에서 ${p} 기술과 ${c} 솔루션을 선도하는 혁신 스타트업입니다.`,
    categoryName,
    // 현실적인 금액 분포 (10억 ~ 89억) 및 매출 (5억 ~ 54억)
    actualInvestment: BigInt(((i % 80) + 10) * 100_000_000),
    revenue: BigInt(((i % 50) + 5) * 100_000_000),
    employees: (i % 120) + 5, // 5명 ~ 124명
  };
});

// 4. 이슈2 완료 기준 유효성 검증
const MAX_BIGINT = 9223372036854775807n;

function validateSeedData(categories, companies) {
  // 기준 1: 시드 입력 데이터 내 기업명 중복 검사
  const companyNames = companies.map((c) => c.name);
  if (companyNames.length !== new Set(companyNames).size) {
    throw new Error("시드 데이터에 중복된 기업명이 존재하여 중단합니다.");
  }

  const validCategories = new Set(categories.map((c) => c.name));

  for (const c of companies) {
    // 기준 2: 필수 필드 누락 검사
    if (!c.name?.trim() || !c.description?.trim() || !c.categoryName?.trim()) {
      throw new Error(`[${c.name}] 필수 필드가 누락되었습니다.`);
    }
    // 기준 3: 유효한 카테고리 매핑 검사
    if (!validCategories.has(c.categoryName)) {
      throw new Error(`[${c.name}] 유효하지 않은 카테고리(${c.categoryName})입니다.`);
    }
    // 기준 4: BIGINT 범위 (음수 방지 및 상한 검사)
    if (c.actualInvestment < 0n || c.actualInvestment > MAX_BIGINT || c.revenue < 0n || c.revenue > MAX_BIGINT) {
      throw new Error(`[${c.name}] 투자금/매출액이 유효한 BIGINT 범위를 벗어났습니다.`);
    }
    // 기준 5: 고용 인원 양의 정수 검사
    if (c.employees < 0) {
      throw new Error(`[${c.name}] 고용 인원은 0 이상이어야 합니다.`);
    }
  }
}

// 5. 메인 시딩 실행
async function main() {
  console.log("🌱 시드 데이터 유효성 검증 시작...");
  validateSeedData(CATEGORIES, COMPANIES);
  console.log("✅ 유효성 검증 통과");

  // 카테고리 upsert 및 ID 매핑
  console.log("📁 카테고리 동기화 중...");
  const categoryMap = new Map();
  for (const cat of CATEGORIES) {
    const record = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });
    categoryMap.set(record.name, record.id);
  }

  // DB 삽입용 데이터 포맷 (categoryId 연결)
  const companyData = COMPANIES.map(({ categoryName, ...rest }) => ({
    ...rest,
    categoryId: categoryMap.get(categoryName),
  }));

  console.log(`🚀 ${TOTAL_COUNT}개 기업 데이터 일괄 삽입(createMany) 진행 중...`);
  
  // 초고속 벌크 인서트 (중복 실행 시에도 에러 없이 skip 처리하여 멱등성 보장)
  const result = await prisma.company.createMany({
    data: companyData,
    skipDuplicates: true,
  });

  console.log(`🎉 시딩 완료! 총 ${result.count}개 기업 데이터가 새로 반영되었습니다.`);
}

main()
  .catch((e) => {
    console.error("❌ 시딩 실패:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });