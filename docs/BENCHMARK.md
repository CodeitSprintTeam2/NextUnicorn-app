# PostgreSQL 성능 벤치마크

> **Next Unicorn | 2026.10.21**  
> PostgreSQL 18 · Prisma 7 · 로컬 벤치마크

## 1. 목적

대용량 데이터 환경에서 Next Unicorn의 기업 및 가상투자 조회 성능을 분석하고, 기존 인덱스와 SQL을 활용한 최적화 가능성을 검증합니다.

**주요 측정 대상**

- 기업 목록 검색·정렬·페이지네이션
- 기업별 활성 투자 최신순 조회
- 활성 투자 건수(`COUNT`) 및 합계(`SUM`)
- 복합 인덱스 활용 여부와 실행 계획
- 데이터 분포 및 캐시 상태에 따른 성능 차이

측정에는 `EXPLAIN (ANALYZE, BUFFERS)`, Prisma Query Log, API 응답 시간을 활용했습니다.

## 2. 테스트 환경

### 데이터 구성

| 기업 유형 | 기업 수 | 기업당 투자 수 |
|---|---:|---:|
| 초인기 기업 | 100 | 10,000 |
| 인기 기업 | 9,900 | 400 |
| 일반 기업 | 490,000 | 10 |
| 투자 없는 기업 | 500,000 | 0 |
| **합계** | **1,000,000** | |

별도로 수정·삭제 기능 검증용 투자 1,000건을 생성했습니다.

**최종 데이터 규모**

| 구분 | 건수 |
|---|---:|
| 기업 | 1,000,000 |
| 투자 전체 | 9,861,000 |
| 활성 투자 | 8,382,000 |
| 소프트 삭제 투자 | 1,479,000 |

성능시험용 투자 9,860,000건에는 15%의 소프트 삭제 비율을 적용했습니다. 검증용 투자 1,000건은 모두 활성 상태입니다.

### 시드 데이터 오류 및 수정

초기 시드 로직에서 일반 기업의 투자 10건이 모두 소프트 삭제되는 오류가 발견됐습니다.

기업별 투자 순번을 기준으로 삭제 여부를 계산하는 로직이 잘못되어, 일반 기업의 데이터 분포가 의도와 다르게 생성된 것이 원인이었습니다.

삭제 비율 계산 방식을 수정하고 다음 과정을 진행했습니다.

1. `--validate-only`로 기업 유형별 삭제 비율 검증
2. 투자 데이터 재생성
3. 실제 DB의 전체·활성·삭제 건수 검증
4. `VACUUM (ANALYZE)`로 통계 갱신

**교훈:** 대용량 시드 데이터는 생성 성공 여부뿐 아니라 실제 분포가 의도와 일치하는지도 검증해야 합니다.

---

## 3. 벤치마크 사용 가이드

### 3.1 주의사항

> **반드시 별도의 로컬 PostgreSQL 벤치마크 DB에서만 실행합니다.**

- Render 및 운영 DB에서는 실행하지 않습니다.
- 일반 개발 DB와 벤치마크 DB를 분리합니다.
- `.env.benchmark`와 DB 접속 정보는 Git에 커밋하지 않습니다.
- 시드 재생성은 기존 투자 데이터를 삭제하므로 실행 전 DB 연결 대상을 확인합니다.
- 약 986만 건의 투자를 생성하므로 충분한 디스크 공간을 확보합니다.

### 3.2 환경 설정

`backend/.env.benchmark`에 벤치마크 전용 DB 연결 문자열을 설정합니다.

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/nextunicorn_benchmark"
```

위 계정 정보는 예시이며 실제 연결 정보로 교체해야 합니다.

프로젝트 루트에서 다음 명령을 실행합니다.

```bash
cd backend

set -a
source .env.benchmark
set +a

npx prisma migrate deploy
```

### 3.3 데이터 검증

실제 데이터를 삽입하기 전에 시드 분포를 검증합니다.

```bash
node prisma/benchmark-seed.js --validate-only
```

이 명령은 데이터베이스에 데이터를 추가하거나 삭제하지 않습니다.

**주요 검증 기준**

| 기업 유형 | 전체 투자 | 활성 투자 | 삭제 투자 |
|---|---:|---:|---:|
| 초인기 기업 1개 | 10,000 | 8,500 | 1,500 |
| 인기 기업 1개 | 400 | 340 | 60 |
| 일반 기업 1개 | 10 | 8~9 | 1~2 |

검증용 투자는 별도로 추가되므로 일부 기업의 최종 건수는 위 표보다 1건 많을 수 있습니다.

### 3.4 최초 시드 생성

검증이 완료되면 다음 명령을 실행합니다.

```bash
ALLOW_BENCHMARK_SEED=true node prisma/benchmark-seed.js
```

시드 스크립트에는 다음 보호 장치가 적용되어 있습니다.

- `ALLOW_BENCHMARK_SEED=true` 필수
- `NODE_ENV=production` 실행 차단
- 데이터 분포 검증 실패 시 중단
- 기존 벤치마크 투자 중복 생성 방지
- 5,000건 단위 데이터 삽입

### 3.5 투자 데이터 재생성

기존 기업·카테고리·스키마·인덱스를 유지하면서 투자 데이터만 재생성할 때 사용합니다.

**① 사전 검사**

```bash
ALLOW_BENCHMARK_SEED=true node prisma/benchmark-seed.js \
  --reseed-investments
```

이 명령은 연결 대상과 데이터 건수를 검사한 뒤, 삭제 확인 옵션이 없으므로 실제 데이터 변경 없이 중단됩니다.

사전 검사에서는 로컬 호스트, `nextunicorn_benchmark` DB 이름, 기업 100만 건, 투자 9,861,000건 및 벤치마크 데이터 구성을 확인합니다.

**② 재생성 실행**

사전 검사와 DB 연결 대상을 직접 확인한 뒤에만 실행합니다.

```bash
ALLOW_BENCHMARK_SEED=true node prisma/benchmark-seed.js \
  --reseed-investments \
  --confirm-delete-investments \
  --vacuum-after-reseed
```

재생성 과정에서는 다음 SQL을 사용합니다.

```sql
TRUNCATE TABLE "investments"
RESTART IDENTITY RESTRICT;
```

- 기업 및 카테고리 데이터는 유지합니다.
- 투자 데이터와 해당 시퀀스를 초기화합니다.
- 인덱스 정의와 스키마는 유지합니다.
- `CASCADE`를 사용하지 않아 다른 참조 테이블까지 삭제하지 않습니다.
- 재생성 완료 후 데이터 분포를 검증하고 `VACUUM (ANALYZE)`를 실행합니다.

**주의:** 재생성 중 실패하면 투자 테이블이 일부만 채워진 상태로 남을 수 있습니다. 임의로 안전 검사를 우회하지 말고 현재 DB 상태와 실패 로그를 먼저 확인해야 합니다.

### 3.6 성능 측정 방법

PostgreSQL에서 다음 형식으로 실행 계획을 확인합니다.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, investor_name, amount, created_at
FROM investments
WHERE company_id = 68
  AND deleted_at IS NULL
ORDER BY deleted_at DESC, created_at DESC, id DESC
LIMIT 20 OFFSET 0;
```

**중점 확인 항목**

| 항목 | 확인 목적 |
|---|---|
| `Execution Time` | 실제 SQL 실행 시간 |
| `Planning Time` | 실행 계획 수립 시간 |
| `Index Scan` | 인덱스 활용 여부 |
| `Index Only Scan` | 테이블 접근 최소화 여부 |
| `Sort` | 별도 정렬 발생 여부 |
| `actual rows` | 실제 처리한 행 수 |
| `Buffers: shared hit` | 공유 버퍼 캐시에서 찾은 블록 수 |
| `Buffers: shared read` | 공유 버퍼로 읽어 들인 블록 수 |

동일한 SQL과 조회 조건으로 여러 번 측정하고, 첫 실행과 캐시가 준비된 이후의 실행을 구분합니다.

---

## 4. 벤치마크 분석 결과

### 4.1 기업 목록 페이지네이션

기업 목록 API는 다음과 같이 OFFSET 기반 페이지네이션을 사용합니다.

```js
skip: (page - 1) * limit,
take: limit,
```

깊은 페이지에서는 건너뛸 행 수가 증가하므로 조회 비용이 커질 수 있습니다.

복합 인덱스와 커서 기반 조회 방식의 성능을 비교했으나, 현재 서비스는 페이지 번호 기반 UI와 전체 페이지 수를 제공하고 있습니다.

따라서 **깊은 OFFSET 페이지네이션 개선은 이번 작업 범위에서 제외**했습니다.

향후 데이터 규모와 실제 사용자 패턴을 고려하여 재검토할 예정입니다.

### 4.2 투자 건수 및 합계

**COUNT**

```sql
SELECT COUNT(*)
FROM investments
WHERE company_id = 68
  AND deleted_at IS NULL;
```

- 기존 복합 인덱스를 활용한 `Index Only Scan` 확인
- `Heap Fetches`를 함께 확인하여 실제 테이블 접근이 얼마나 발생했는지 검증

**SUM**

```sql
SELECT COALESCE(SUM(amount), 0)
FROM investments
WHERE company_id = 68
  AND deleted_at IS NULL;
```

- `amount` 값을 읽기 위한 테이블 접근 발생
- 첫 실행과 반복 실행에서 캐시 상태에 따른 시간 차이 확인
- 현재는 추가 집계용 인덱스를 생성하지 않기로 결정

특히 초인기 기업의 `SUM` 조회에서는 첫 실행 약 84.6ms, 캐시가 준비된 반복 실행 약 6~7ms가 관측됐습니다.

따라서 **SQL 실행 시간은 실행 계획뿐 아니라 캐시 상태에도 영향을 받는다**는 점을 확인했습니다.

---

## 5. 투자 목록 정렬 최적화

### 5.1 문제 발견

기존 투자 목록 API는 다음 정렬 조건을 사용했습니다.

```js
orderBy: [
  { createdAt: "desc" },
  { id: "desc" },
],
```

투자 테이블에는 이미 다음 복합 인덱스가 존재했습니다.

```sql
(company_id, deleted_at, created_at)
```

그러나 기존 SQL은 초인기 기업의 활성 투자 8,501건을 조회한 뒤 별도로 정렬하고 있었습니다.

즉, **인덱스를 사용하고 있어도 정렬 최적화까지 이루어지는 것은 아니었습니다.**

### 5.2 개선 방법

정렬 조건에 `deletedAt`을 추가했습니다.

```js
orderBy: [
  { deletedAt: "desc" },
  { createdAt: "desc" },
  { id: "desc" },
],
```

조회 조건이 `deletedAt: null`이기 때문에 모든 반환 행의 `deletedAt` 값은 동일합니다.

따라서 기존 결과 순서를 유지하면서 복합 인덱스의 정렬 순서를 더 효율적으로 활용할 수 있습니다.

### 5.3 성능 비교

**측정 조건:** 초인기 기업 ID 68, 활성 투자 8,501건, 최신 20건 조회

| 항목 | 개선 전 | 개선 후 |
|---|---|---|
| 실행 계획 | Index Scan + Sort | Index Scan Backward + Incremental Sort |
| 인덱스 조회 행 | 8,501건 | 21건 |
| Shared Buffer Hit | 238 | 9 |
| SQL 실행 시간 | 8.274ms | 2.612ms |

**단일 측정 기준 약 3.2배 빠른 실행 결과**를 확인했습니다.

개선 후에는 인덱스에서 21건을 읽고 `Incremental Sort`를 수행해 최종 20건을 반환했습니다.

또한 기존 SQL과 개선 SQL의 반환 ID 및 순서가 동일함을 검증했습니다.

### 5.4 실제 Prisma SQL 검증

Prisma Query Log를 활성화한 상태로 백엔드를 실행합니다.

```bash
BENCHMARK_QUERY_LOG=true npm run dev
```

`BENCHMARK_QUERY_LOG`를 지정하지 않으면 일반 실행에서는 쿼리 로그가 출력되지 않습니다.

Prisma Query Log에서도 다음 정렬 조건이 정상 생성되는 것을 확인했습니다.

```sql
ORDER BY
  "public"."investments"."deleted_at" DESC,
  "public"."investments"."created_at" DESC,
  "public"."investments"."id" DESC
```

실제 Prisma가 조회하는 컬럼 구성을 반영한 추가 실행 계획에서도 다음 결과를 확인했습니다.

```text
Index Scan Backward
  actual rows=21

Incremental Sort
  Presorted Key: deleted_at, created_at

Limit
  actual rows=20

Buffers: shared hit=6
Execution Time: 1.095 ms
```

해당 결과는 최적화된 SQL에 대한 별도 실행 측정이며, 앞선 8.274ms와 직접 비교한 수치는 아닙니다.

---

## 6. Prisma 조회 컬럼 최적화

### 6.1 문제 발견

기존 `findMany()`는 모든 투자 컬럼을 조회하여 API 응답에서 사용하지 않는 다음 데이터까지 가져오고 있었습니다.

- `password_hash`
- `deleted_at`

### 6.2 개선 방법

`serializeInvestment()`에서 실제로 사용하는 7개 필드만 조회하도록 `select`를 추가했습니다.

```js
select: {
  id: true,
  companyId: true,
  investorName: true,
  amount: true,
  comment: true,
  createdAt: true,
  updatedAt: true,
},
```

**개선 결과**

| 항목 | 개선 전 | 개선 후 |
|---|---|---|
| 조회 컬럼 수 | 9개 | 7개 |
| 비밀번호 해시 조회 | 포함 | 제외 |
| 소프트 삭제 필터 | 유지 | 유지 |
| 정렬 조건 | 유지 | 유지 |
| API 응답 구조 | 기존 | 동일 |

`deleted_at`은 `SELECT`에서 제외되더라도 `WHERE`와 `ORDER BY`에서 계속 사용할 수 있습니다.

변경 후 Prisma `findMany()`의 실행 시간은 약 1.37~1.38ms로 관측됐지만, 컬럼 축소만으로 얻은 성능 향상 폭은 별도 비교가 필요합니다.

이번 변경의 핵심 효과는 **불필요한 데이터 조회 감소와 비밀번호 해시 취급 범위 축소**입니다.

---

## 7. API 검증

별도의 자동화 테스트 코드를 작성하지 않고, 기존 `api.http`를 활용해 수동 검증했습니다.

**검증 요청**

```http
### 1페이지
GET {{baseUrl}}/companies/68/investments?page=1&limit=20

### 2페이지
GET {{baseUrl}}/companies/68/investments?page=2&limit=20
```

**검증 결과**

- [x] 두 페이지 모두 정상 응답 및 20건 반환
- [x] 생성일 내림차순 정렬 유지
- [x] 페이지 간 투자 ID 중복 없음
- [x] `total: 8501` 유지
- [x] `totalPages: 426` 유지
- [x] 기존 API 응답 필드 및 데이터 형식 유지
- [x] Prisma SQL에서 `password_hash` 조회 제거 확인

SQL 비교를 통해 개선 전후 첫 페이지의 결과 순서도 동일함을 확인했습니다.

단, 생성일이 같은 투자들의 ID 정렬과 개별 소프트 삭제 행의 제외 여부를 모든 경우에 대해 자동 검증한 것은 아닙니다.

---

## 8. 결론 및 향후 작업

### 최종 개선 사항

1. **정렬 최적화:** 기존 복합 인덱스를 활용하여 투자 목록 조회 시 불필요한 행 탐색과 전체 정렬 감소
2. **컬럼 최적화:** Prisma `select`를 통해 9개 컬럼에서 필요한 7개 컬럼만 조회
3. **동작 유지:** 기존 API 응답과 페이지네이션 결과 유지

### 남은 작업

깊은 OFFSET 페이지네이션 문제는 알려진 성능 한계로 기록하되, 이번 개선 범위에서는 제외합니다.

### 핵심 배움

**인덱스가 존재하고 사용된다고 해서 항상 최적의 실행 계획이 선택되는 것은 아닙니다.**

실제 실행 계획을 분석하고 SQL 정렬 조건을 조정하는 것만으로도 성능을 개선할 수 있었습니다.

또한 벤치마크에서는 실행 시간뿐 아니라 데이터 분포, 캐시 상태, 처리한 행 수, 버퍼 사용량을 함께 살펴봐야 합니다.

무엇보다 **AI가 생성한 시드 로직이나 SQL도 실제 데이터를 통해 검증해야 한다는 점**을 확인했습니다.

> 본 결과는 로컬 벤치마크 환경에서 측정한 값으로, 운영 환경에서도 동일한 성능 개선 폭이 나타난다고 보장할 수 없습니다.
