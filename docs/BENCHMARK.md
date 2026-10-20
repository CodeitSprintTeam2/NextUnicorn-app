# 데이터베이스 성능 벤치마크 가이드

## 목적

이 문서는 PostgreSQL의 인덱스, 정렬, 필터링, 집계 성능을 대용량 데이터로 비교하기 위한 로컬 벤치마크 절차를 설명한다.

주요 측정 대상은 다음과 같다.

- 기업별 활성 가상투자 최신순 조회
- 기업별 활성 가상투자 합계
- 페이지네이션을 위한 활성 투자 개수 조회
- `(companyId, deletedAt, createdAt)` 복합 인덱스 적용 전후 차이
- 데이터가 특정 기업에 집중된 경우와 분산된 경우의 차이

## 주의사항

> 이 벤치마크는 반드시 별도의 로컬 PostgreSQL 데이터베이스에서만 실행한다.

- Render 및 운영 데이터베이스에서 실행하지 않는다.
- 평소 사용하는 개발 DB와 분리된 벤치마크 전용 DB 사용을 권장한다.
- `.env.benchmark`와 실제 연결 문자열을 Git에 커밋하지 않는다.
- 연결 문자열이나 비밀번호를 터미널 출력, 문서, 메신저에 공유하지 않는다.
- 약 1,000만 건의 투자와 인덱스가 생성되므로 충분한 디스크 여유 공간을 확보한다.
- 시드는 중간에 중단될 수 있으므로 실행 전에 다른 작업을 저장한다.
- 벤치마크 시드는 `NODE_ENV=production`에서 실행되지 않는다.

## 데이터 구성

`backend/prisma/benchmark-seed.js`는 다음 데이터를 생성한다.

| 구분 | 규모 | 기업당 투자 수 |
| --- | ---: | ---: |
| 초인기 기업 | 100개 | 10,000건 |
| 인기 기업 | 9,900개 | 400건 |
| 일반 기업 | 490,000개 | 10건 |
| 투자 없는 기업 | 500,000개 | 0건 |
| 성능시험용 투자 | 9,860,000건 | 불균등 분포 |
| 수정·삭제 검증용 투자 | 1,000건 | 개별 bcrypt 해시 |

성능시험용 투자 중 약 15%는 `deletedAt` 값이 있는 삭제 데이터다. 활성 투자 조회 및 합계에는 `deletedAt IS NULL`인 행만 포함한다.

일반 성능시험용 투자에는 정상적인 bcrypt 해시 풀 1,000개를 재사용한다. 수정·삭제 검증용 투자 1,000건은 각각 독립적인 비밀번호와 bcrypt 해시를 사용한다.

## 사전 준비

### 1. 벤치마크 환경 변수

`backend/.env.benchmark`에 벤치마크 전용 로컬 DB의 `DATABASE_URL`을 설정한다.

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/BENCHMARK_DATABASE"
```

위 값은 예시다. 실제 계정 정보는 각 개발자의 로컬 환경에만 저장한다.

### 2. 환경 변수 불러오기

저장소 루트에서 다음 순서로 실행한다.

```bash
cd backend
set -a
source .env.benchmark
set +a
```

환경 변수를 출력해서 확인하지 않는다. 실행 전 각자 `.env.benchmark`가 로컬 벤치마크 DB를 가리키는지 직접 확인한다.

### 3. 마이그레이션 적용

```bash
npx prisma migrate deploy
```

벤치마크 전용 DB에 저장소의 기존 마이그레이션만 적용한다. 새 마이그레이션을 만들지 않는다.

## 시드 실행

```bash
ALLOW_BENCHMARK_SEED=true node prisma/benchmark-seed.js
```

다음 보호 장치가 적용되어 있다.

- `ALLOW_BENCHMARK_SEED=true`가 없으면 실행을 중단한다.
- `NODE_ENV=production`이면 실행을 중단한다.
- 기존 벤치마크 투자 데이터를 발견하면 중복 생성을 막기 위해 실행을 중단한다.
- 기업과 투자는 5,000건 단위로 삽입한다.

시드 실행 중에는 처리된 기업 및 투자 건수가 출력된다. 전체 실행 시간은 개발자의 CPU, 메모리, 디스크 및 PostgreSQL 설정에 따라 달라진다.

## 측정 전 준비

시드 완료 후 PostgreSQL 쿼리 도구에서 통계를 갱신한다.

```sql
ANALYZE;
```

DB 테이블 이름을 확인한다.

```sql
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

인덱스 이름과 정의를 확인한다.

```sql
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

아래 예시의 `companies`, `investments` 및 인덱스 이름이 실제 DB와 다르면 조회 결과에 나온 이름으로 바꾼다.

## 측정 대상 선택

기업 이름은 `Benchmark Company 0000001` 형식으로 생성된다. 다음 세 그룹에서 각각 한 기업을 골라 측정한다.

| 그룹 | 기업 번호 | 예상 투자 수 |
| --- | --- | ---: |
| 초인기 | `0000001`~`0000100` | 10,000건 |
| 인기 | `0000101`~`0010000` | 400건 |
| 일반 | `0010001`~`0500000` | 10건 |

```sql
SELECT id, name
FROM companies
WHERE name IN (
  'Benchmark Company 0000001',
  'Benchmark Company 0000101',
  'Benchmark Company 0010001'
)
ORDER BY name;
```

조회된 실제 기업 ID를 이후 SQL의 `:company_id` 자리에 사용한다. 사용 중인 SQL 도구가 이름 기반 변수를 지원하지 않으면 숫자 ID로 직접 교체한다.

## 인덱스가 있는 상태 측정

### 최신 활성 투자 20건

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM investments
WHERE company_id = :company_id
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20;
```

### 활성 투자 합계

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT COALESCE(SUM(amount), 0)
FROM investments
WHERE company_id = :company_id
  AND deleted_at IS NULL;
```

### 활성 투자 개수

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT COUNT(*)
FROM investments
WHERE company_id = :company_id
  AND deleted_at IS NULL;
```

다음 항목을 기록한다.

- `Planning Time`
- `Execution Time`
- `Index Scan`, `Index Only Scan`, `Bitmap Index Scan`, `Seq Scan` 여부
- `Sort` 발생 여부와 정렬 방식
- `Rows Removed by Filter`
- `Buffers: shared hit`
- `Buffers: shared read`
- 플래너 예상 행 수와 실제 행 수의 차이

## 인덱스가 없는 상태 측정

먼저 투자 테이블에 생성된 인덱스를 확인한다.

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'investments';
```

`(company_id, deleted_at, created_at)` 복합 인덱스의 실제 이름을 찾는다. 기본키 또는 다른 제약조건 인덱스를 제거하면 안 된다.

인덱스를 영구 삭제하지 않도록 하나의 트랜잭션 안에서 비교한다.

```sql
BEGIN;

DROP INDEX 실제_복합_인덱스_이름;

EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM investments
WHERE company_id = :company_id
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20;

ROLLBACK;
```

`ROLLBACK` 후 다음 SQL로 인덱스가 복구되었는지 확인한다.

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'investments';
```

트랜잭션을 지원하지 않거나 자동 커밋을 강제하는 DB 도구에서는 이 방법을 사용하지 않는다.

## 공정한 측정 방법

1. 인덱스 적용·미적용 시 동일한 SQL과 기업 ID를 사용한다.
2. 일반, 인기, 초인기 기업을 각각 측정한다.
3. 각 조건을 최소 5회 실행한다.
4. 첫 실행과 이후 실행을 구분해서 기록한다.
5. 첫 실행은 디스크 읽기, 이후 실행은 캐시 영향을 더 많이 받을 수 있다.
6. 측정 중 다른 대용량 작업과 서버 요청을 최소화한다.
7. 평균값뿐 아니라 최솟값과 최댓값도 기록한다.
8. SQL 자체의 성능은 브라우저 응답 시간이 아니라 `EXPLAIN (ANALYZE, BUFFERS)` 결과로 판단한다.

## 결과 기록표

| 날짜 | 기업 그룹 | 인덱스 | 실행 회차 | Planning Time | Execution Time | Scan 방식 | shared hit | shared read | 비고 |
| --- | --- | --- | ---: | ---: | ---: | --- | ---: | ---: | --- |
|  | 초인기 | 적용 | 1 |  |  |  |  |  | 첫 실행 |
|  | 초인기 | 적용 | 2 |  |  |  |  |  | 캐시 후 |
|  | 초인기 | 미적용 | 1 |  |  |  |  |  | 첫 실행 |
|  | 인기 | 적용 | 1 |  |  |  |  |  |  |
|  | 인기 | 미적용 | 1 |  |  |  |  |  |  |
|  | 일반 | 적용 | 1 |  |  |  |  |  |  |
|  | 일반 | 미적용 | 1 |  |  |  |  |  |  |

결과를 공유할 때는 실행 SQL, 실행 계획 전문, PostgreSQL 버전, 데이터 건수와 컴퓨터 사양을 함께 기록한다.

## 검증용 투자 수정·삭제

검증용 투자자와 비밀번호는 동일한 6자리 번호를 사용한다.

| 순번 | 투자자 이름 | 비밀번호 |
| ---: | --- | --- |
| 1 | `verify-000001` | `benchmark-password-000001` |
| 2 | `verify-000002` | `benchmark-password-000002` |
| 1,000 | `verify-001000` | `benchmark-password-001000` |

이 값은 로컬 기능 검증 전용이며 실제 사용자 계정이나 실제 비밀번호가 아니다.

다음 항목을 화면 또는 `api.http`의 기존 투자 요청 형식으로 확인한다.

- 활성 투자만 목록에 표시되는가
- 최신순 정렬과 페이지네이션이 정상인가
- 삭제된 투자가 가상투자 합계에서 제외되는가
- 올바른 검증용 비밀번호로 수정·삭제할 수 있는가
- 잘못된 비밀번호가 기존 API 계약의 오류로 처리되는가

## 해석 예시

- 인덱스 적용 후 `Seq Scan`이 `Index Scan`으로 바뀌고 읽은 버퍼가 감소했다면 인덱스가 탐색 범위를 효과적으로 줄인 것이다.
- 초인기 기업에서만 실행 시간이 크게 증가한다면 전체 테이블 크기보다 기업별 투자 집중도가 병목일 가능성이 있다.
- 최신 목록 조회에서 별도의 `Sort`가 사라졌다면 복합 인덱스가 필터링과 정렬을 함께 지원한 것이다.
- `SUM(amount)`는 대상 행의 값을 읽어야 하므로 목록 조회보다 인덱스 효과가 제한적일 수 있다.
- 예상 행 수와 실제 행 수가 크게 다르면 `ANALYZE` 실행 여부와 데이터 분포 통계를 확인한다.

## 정리

벤치마크 종료 후에도 Render 또는 운영 DB로 데이터를 복사하지 않는다. 벤치마크 DB 정리가 필요하면 각 개발자가 로컬 전용 DB임을 다시 확인한 후 직접 처리한다.
