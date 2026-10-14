# View My Startup API

## 개요

| 항목 | 값 |
| --- | --- |
| 기본 경로 | `/api` |
| 요청·응답 형식 | `application/json` |
| 날짜 형식 | ISO 8601 문자열 |
| 금액 형식 | 원 단위의 음수가 아닌 10진수 JSON `string` |
| 인증 | 사용하지 않음 |

금액 문자열은 숫자로만 구성하고, 입력 금액은 PostgreSQL `BIGINT` 최댓값인 `9223372036854775807` 이하만 허용한다. 비밀번호는 투자 등록·수정·삭제 요청에서만 받고 응답에는 포함하지 않는다.

`actualInvestment`는 시드 데이터로 저장한 기업의 실제 누적 투자 금액이다. `virtualInvestment`는 `Company`에 저장하지 않고 해당 기업의 `deletedAt`이 `null`인 `Investment.amount`를 합산해 반환하며, 활성 가상 투자 내역이 없으면 `0`이다.

## 공통 계약

### 목록 요청

| 쿼리 | 형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `page` | 1 이상의 정수 | `1` | 조회할 페이지 |
| `limit` | 1~100의 정수 | `10` | 페이지당 항목 수 |
| `search` | 문자열 | 없음 | 기업명 부분 일치 검색 |
| `sortBy` | 엔드포인트별 허용값 | 없음 | 정렬 기준 |
| `order` | `asc` 또는 `desc` | 엔드포인트별 기본값 | 정렬 방향. `sortBy`와 함께 사용하며, `sortBy` 없이 전달하면 `400 INVALID_QUERY`를 반환한다. |

기업을 정렬하는 API에서 기본 기준이나 `sortBy` 값이 같으면 `company.id` 오름차순을 최종 기준으로 사용한다. 이 기준은 페이지네이션 순서를 안정적으로 만들기 위한 것이며 공동 순위를 나누지 않는다.

### 단건 성공 응답

```json
{
  "data": {}
}
```

### 목록 성공 응답

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 실패 응답

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "요청 값이 올바르지 않습니다.",
    "details": [
      {
        "field": "amount",
        "reason": "1 이상 9223372036854775807 이하의 정수 문자열이어야 합니다."
      }
    ]
  }
}
```

`details`는 필드별 설명이 필요할 때만 포함한다.

실패 응답의 `message`는 아래 「실패 코드 목록」에 정의된 고정 문구를 사용한다. 서버는 같은 실패 코드에 항상 같은 문구를 반환한다. 필드별 검증 이유가 필요하면 `details`를 추가한다.

## 데이터 모양

### CompanySummary

```json
{
  "id": 1,
  "name": "코드잇",
  "description": "온라인 코딩 교육 스타트업",
  "category": "교육",
  "actualInvestment": "5000000000",
  "revenue": "1200000000",
  "employees": 80
}
```

### Investment

```json
{
  "id": 101,
  "companyId": 1,
  "investorName": "김투자",
  "amount": "1000000",
  "comment": "성장 가능성이 높아 보여요.",
  "createdAt": "2026-10-08T04:00:00.000Z",
  "updatedAt": "2026-10-08T04:00:00.000Z"
}
```

### 입력 검증

| 필드 | 규칙 |
| --- | --- |
| `investorName` | 앞뒤 공백 제거 후 1~20자 |
| `amount` | `1` 이상 `9223372036854775807` 이하의 정수 문자열 |
| `comment` | 앞뒤 공백 제거 후 1~200자 |
| `password` | 4~20자 |
| `passwordConfirm` | `password`와 일치해야 함 |

## 상태 확인

### 서버 상태 확인

`GET /api/health`

서버가 요청을 처리할 수 있는지 확인한다. DB 연결 상태는 이 응답에 포함하지 않는다.

#### 성공 `200 OK`

```json
{
  "data": {
    "status": "ok"
  }
}
```

#### 실패

| 상태 | 코드 | 조건 |
| --- | --- | --- |
| `500` | `INTERNAL_SERVER_ERROR` | 서버 내부에서 예상하지 못한 오류가 발생함 |

## 기업

### 전체 기업 목록 조회

`GET /api/companies`

기업 목록을 검색·정렬·페이지네이션하여 반환한다. `sortBy`를 생략하면 `id` 오름차순으로 정렬한다. `sortBy`를 지정하고 `order`를 생략하면 내림차순을 사용한다.

#### Query

| 이름 | 필수 | 허용값 |
| --- | --- | --- |
| `page` | 아니요 | 1 이상의 정수 |
| `limit` | 아니요 | 1~100의 정수 |
| `search` | 아니요 | 기업명 검색어 |
| `sortBy` | 아니요 | `actualInvestment`, `revenue`, `employees` |
| `order` | 아니요 | `asc`, `desc` (`sortBy` 지정 시 기본값 `desc`) |

#### 성공 `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "name": "코드잇",
      "description": "온라인 코딩 교육 스타트업",
      "category": "교육",
      "actualInvestment": "5000000000",
      "revenue": "1200000000",
      "employees": 80
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### 실패

| 상태 | 코드 | 조건 |
| --- | --- | --- |
| `400` | `INVALID_QUERY` | 페이지나 정렬 조건이 허용 범위를 벗어남 |

### 기업 상세 조회

`GET /api/companies/:companyId`

기업 정보와 실제 누적 투자 금액, 가상 투자 합계를 반환한다. 투자 목록은 별도 엔드포인트에서 조회한다.

#### 성공 `200 OK`

```json
{
  "data": {
    "id": 1,
    "name": "코드잇",
    "description": "온라인 코딩 교육 스타트업",
    "category": "교육",
    "actualInvestment": "5000000000",
    "virtualInvestment": "1500000",
    "revenue": "1200000000",
    "employees": 80
  }
}
```

#### 실패

| 상태 | 코드 | 조건 |
| --- | --- | --- |
| `400` | `INVALID_PATH_PARAMETER` | `companyId` 형식이 올바르지 않음 |
| `404` | `COMPANY_NOT_FOUND` | 기업이 존재하지 않음 |

### 기업의 가상 투자 목록 조회

`GET /api/companies/:companyId/investments`

해당 기업이 받은 가상 투자 중 `deletedAt`이 `null`인 내역만 최신 등록순으로 페이지네이션하여 반환한다. `createdAt`이 같으면 `id` 내림차순으로 순서를 정한다. soft delete된 투자는 `data`, `meta.total`, `meta.totalPages` 계산에서 제외한다.

#### Query

| 이름 | 필수 | 허용값 |
| --- | --- | --- |
| `page` | 아니요 | 1 이상의 정수 |
| `limit` | 아니요 | 1~100의 정수 |

#### 성공 `200 OK`

```json
{
  "data": [
    {
      "id": 101,
      "companyId": 1,
      "investorName": "김투자",
      "amount": "1000000",
      "comment": "성장 가능성이 높아 보여요.",
      "createdAt": "2026-10-08T04:00:00.000Z",
      "updatedAt": "2026-10-08T04:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### 실패

| 상태 | 코드 | 조건 |
| --- | --- | --- |
| `400` | `INVALID_PATH_PARAMETER` | `companyId` 형식이 올바르지 않음 |
| `400` | `INVALID_QUERY` | 페이지 조건이 허용 범위를 벗어남 |
| `404` | `COMPANY_NOT_FOUND` | 기업이 존재하지 않음 |

## 기업 비교

### 선택 완료 및 비교 결과 조회

`POST /api/comparisons`

내 기업과 비교 기업의 선택 횟수를 각각 한 번 누적하고 비교 결과를 반환한다. 같은 요청을 다시 보내면 선택 횟수도 다시 누적되므로 선택 완료 시 한 번만 요청한다.

#### 요청

```json
{
  "myCompanyId": 1,
  "compareCompanyIds": [2, 3]
}
```

| 필드 | 규칙 |
| --- | --- |
| `myCompanyId` | 존재하는 기업 ID |
| `compareCompanyIds` | 서로 다른 기업 ID 1~5개 |
| 기업 중복 | `myCompanyId`를 비교 기업에 포함할 수 없음 |

#### 성공 `200 OK`

```json
{
  "data": {
    "myCompany": {
      "id": 1,
      "name": "코드잇",
      "description": "온라인 코딩 교육 스타트업",
      "category": "교육",
      "actualInvestment": "5000000000",
      "revenue": "1200000000",
      "employees": 80
    },
    "compareCompanies": [
      {
        "id": 2,
        "name": "테크스타트",
        "description": "기업용 협업 도구 스타트업",
        "category": "SaaS",
        "actualInvestment": "3000000000",
        "revenue": "900000000",
        "employees": 55
      }
    ]
  }
}
```

비교 결과 정렬은 최대 6개 기업을 받은 뒤 클라이언트에서 처리한다. 따라서 정렬할 때 선택 횟수가 다시 증가하지 않는다.

#### 실패

| 상태 | 코드 | 조건 |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | 비교 기업 수, 중복 또는 ID 형식이 올바르지 않음 |
| `404` | `COMPANY_NOT_FOUND` | 요청한 기업 중 하나 이상이 존재하지 않음 |

### 내 기업 순위 조회

`GET /api/rankings/companies/:companyId`

내 기업과 순위가 근접한 기업을 합쳐 최대 5개 반환한다. 첫째 또는 마지막 순위에 가까운 경우 가능한 반대 방향 기업을 더 포함해 최대 5개를 채운다.

순위는 `order`와 관계없이 선택한 기준값이 큰 기업부터 계산한다. 기준값이 같은 기업에는 같은 순위를 부여하고 다음 순위는 동점 기업 수만큼 건너뛴다. `company.id` 오름차순은 동점 기업의 표시 순서만 결정한다. `order`는 응답 배열의 표시 순서만 바꾸며 순위 값에는 영향을 주지 않는다.

#### Query

| 이름 | 필수 | 허용값 |
| --- | --- | --- |
| `sortBy` | 예 | `revenue`, `employees` |
| `order` | 아니요 | `asc`, `desc` (기본값 `desc`) |

#### 성공 `200 OK`

```json
{
  "data": {
    "companyId": 1,
    "rank": 3,
    "sortBy": "revenue",
    "order": "desc",
    "companies": [
      {
        "rank": 2,
        "company": {
          "id": 2,
          "name": "테크스타트",
          "description": "기업용 협업 도구 스타트업",
          "category": "SaaS",
          "actualInvestment": "3000000000",
          "revenue": "1500000000",
          "employees": 55
        }
      },
      {
        "rank": 3,
        "company": {
          "id": 1,
          "name": "코드잇",
          "description": "온라인 코딩 교육 스타트업",
          "category": "교육",
          "actualInvestment": "5000000000",
          "revenue": "1200000000",
          "employees": 80
        }
      }
    ]
  }
}
```

#### 실패

| 상태 | 코드 | 조건 |
| --- | --- | --- |
| `400` | `INVALID_QUERY` | 순위 기준이나 정렬 방향이 올바르지 않음 |
| `404` | `COMPANY_NOT_FOUND` | 기업이 존재하지 않음 |

### 비교 현황 조회

`GET /api/comparison-status`

`sortBy`를 생략하면 `company.id` 오름차순으로 정렬한다. `sortBy`를 지정하고 `order`를 생략하면 내림차순을 사용한다. 선택 횟수가 같으면 `company.id` 오름차순을 최종 기준으로 사용한다.

#### Query

| 이름 | 필수 | 허용값 |
| --- | --- | --- |
| `page` | 아니요 | 1 이상의 정수 |
| `limit` | 아니요 | 1~100의 정수 |
| `sortBy` | 아니요 | `myCompanySelections`, `comparisonSelections` |
| `order` | 아니요 | `asc`, `desc` |

#### 성공 `200 OK`

```json
{
  "data": [
    {
      "company": {
        "id": 1,
        "name": "코드잇",
        "description": "온라인 코딩 교육 스타트업",
        "category": "교육",
        "actualInvestment": "5000000000",
        "revenue": "1200000000",
        "employees": 80
      },
      "myCompanySelections": 12,
      "comparisonSelections": 30
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### 실패

| 상태 | 코드 | 조건 |
| --- | --- | --- |
| `400` | `INVALID_QUERY` | 페이지나 정렬 조건이 올바르지 않음 |

## 가상 투자

### 가상 투자 등록

`POST /api/investments`

#### 요청

```json
{
  "companyId": 1,
  "investorName": "김투자",
  "amount": "1000000",
  "comment": "성장 가능성이 높아 보여요.",
  "password": "1234",
  "passwordConfirm": "1234"
}
```

비밀번호는 bcrypt로 해시한 값만 저장한다.

#### 성공 `201 Created`

```json
{
  "data": {
    "id": 101,
    "companyId": 1,
    "investorName": "김투자",
    "amount": "1000000",
    "comment": "성장 가능성이 높아 보여요.",
    "createdAt": "2026-10-08T04:00:00.000Z",
    "updatedAt": "2026-10-08T04:00:00.000Z"
  }
}
```

#### 실패

| 상태 | 코드 | 조건 |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | 입력값이 검증 규칙을 통과하지 못함 |
| `404` | `COMPANY_NOT_FOUND` | 투자할 기업이 존재하지 않음 |

### 가상 투자 수정

`PATCH /api/investments/:investmentId`

수정할 필드와 기존 비밀번호를 보낸다. `investorName`, `amount`, `comment` 중 하나 이상이 필요하며 비밀번호 자체는 변경하지 않는다.

#### 요청

```json
{
  "investorName": "김투자",
  "amount": "1500000",
  "comment": "수정한 투자 코멘트입니다.",
  "password": "1234"
}
```

#### 성공 `200 OK`

```json
{
  "data": {
    "id": 101,
    "companyId": 1,
    "investorName": "김투자",
    "amount": "1500000",
    "comment": "수정한 투자 코멘트입니다.",
    "createdAt": "2026-10-08T04:00:00.000Z",
    "updatedAt": "2026-10-08T05:00:00.000Z"
  }
}
```

#### 실패

| 상태 | 코드 | 조건 |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | 수정할 필드가 없거나 입력값이 올바르지 않음 |
| `401` | `INVALID_PASSWORD` | 비밀번호가 일치하지 않음 |
| `404` | `INVESTMENT_NOT_FOUND` | 투자 내역이 존재하지 않거나 이미 삭제됨 |

### 가상 투자 삭제

`DELETE /api/investments/:investmentId`

행과 원본 내용은 물리적으로 삭제하지 않고 `deletedAt`에 삭제 시각을 기록한다. 삭제된 투자는 목록, 페이지네이션 전체 개수, `virtualInvestment`, 수정 및 삭제 대상에서 제외하며 `actualInvestment`에는 영향을 주지 않는다.

#### 요청

```json
{
  "password": "1234"
}
```

#### 성공 `204 No Content`

응답 본문을 보내지 않는다.

#### 실패

| 상태 | 코드 | 조건 |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | 비밀번호가 누락되었거나 형식이 올바르지 않음 |
| `401` | `INVALID_PASSWORD` | 비밀번호가 일치하지 않음 |
| `404` | `INVESTMENT_NOT_FOUND` | 투자 내역이 존재하지 않거나 이미 삭제됨 |

## 투자 현황

### 전체 기업 투자 현황 조회

`GET /api/investment-status`

`rank`는 선택한 `sortBy` 기준의 전체 기업 순위다. `sortBy`를 생략하면 `virtualInvestment` 내림차순을 사용한다. 투자 금액이 같으면 `company.id` 오름차순으로 표시한다.

순위는 `order`와 관계없이 투자 금액이 큰 기업부터 계산한다. 금액이 같은 기업에는 같은 순위를 부여하고 다음 순위는 동점 기업 수만큼 건너뛴다. `order`는 응답 배열의 표시 순서만 바꾸며 순위 값에는 영향을 주지 않는다.

#### Query

| 이름 | 필수 | 허용값 |
| --- | --- | --- |
| `page` | 아니요 | 1 이상의 정수 |
| `limit` | 아니요 | 1~100의 정수 |
| `sortBy` | 아니요 | `virtualInvestment`, `actualInvestment` (기본값 `virtualInvestment`) |
| `order` | 아니요 | `asc`, `desc` |

#### 성공 `200 OK`

```json
{
  "data": [
    {
      "rank": 1,
      "company": {
        "id": 1,
        "name": "코드잇",
        "description": "온라인 코딩 교육 스타트업",
        "category": "교육"
      },
      "virtualInvestment": "1500000",
      "actualInvestment": "5000000000"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### 실패

| 상태 | 코드 | 조건 |
| --- | --- | --- |
| `400` | `INVALID_QUERY` | 페이지나 정렬 조건이 올바르지 않음 |

## 실패 코드 목록

| HTTP 상태 | 코드 | 고정 문구 | 의미 |
| --- | --- | --- | --- |
| `400` | `INVALID_QUERY` | 쿼리 값이 올바르지 않습니다. | 쿼리 값이 허용 범위를 벗어남 |
| `400` | `INVALID_PATH_PARAMETER` | 경로 매개변수가 올바르지 않습니다. | 경로 매개변수 형식이 올바르지 않음 |
| `400` | `VALIDATION_ERROR` | 요청 값이 올바르지 않습니다. | 요청 본문이 입력 검증을 통과하지 못함 |
| `401` | `INVALID_PASSWORD` | 비밀번호가 일치하지 않습니다. | 투자 수정·삭제 비밀번호가 일치하지 않음 |
| `404` | `COMPANY_NOT_FOUND` | 기업을 찾을 수 없습니다. | 기업이 존재하지 않음 |
| `404` | `INVESTMENT_NOT_FOUND` | 투자 내역을 찾을 수 없습니다. | 가상 투자 내역이 존재하지 않거나 이미 삭제됨 |
| `409` | `CONFLICT` | 현재 데이터 상태와 요청이 충돌합니다. | 현재 데이터 상태와 요청이 충돌함 |
| `500` | `INTERNAL_SERVER_ERROR` | 서버 오류가 발생했습니다. | 서버 내부에서 예상하지 못한 오류가 발생함 |
