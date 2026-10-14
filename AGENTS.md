# AGENTS.md

이 저장소에서 일하는 AI 코딩 도구를 위한 안내다.

## 프로젝트

- 부트캠프 수강생 4명이 만드는 「View My Startup」이다. 2026-10-15에 핵심 흐름을 시연하고 2026-10-21에 기능을 완성한다.
- 화면은 Netlify, 서버는 Render, 배포 DB는 Render PostgreSQL 18에 둔다. 개발자는 각자의 로컬 PostgreSQL 18을 사용한다.
- 주제 설명서는 `brief.md`에 있고, 이 파일은 고치지 않는다.
- 명세는 `README.md`(기술·실행·배포), `PLAN.md`(기능·화면·범위), `ADR.md`(결정 기록), `API.md`(요청·응답 계약), `api.http`(예시 요청), `backend/prisma/schema.prisma`(테이블), `issues.md`(이슈와 완료 기준)다.
- 코드와 명세가 다르면 명세를 따른다.

## 기술

- 패키지 관리자는 npm을 사용한다.
- 서버는 `backend` 폴더에 둔다. Node 24·Express 5·Prisma 7·PostgreSQL 18이고 ES 모듈(`import`/`export`)만 쓴다.
- DB 테이블과 컬럼 이름은 snake_case로 작성하고, Prisma 모델과 코드 필드는 camelCase를 유지한다. Prisma 스키마에서 `@@map`과 `@map`으로 매핑한다.
- 비밀번호 해시는 `bcrypt`, CORS는 Express의 `cors` 패키지로 처리한다.
- 화면은 `frontend` 폴더에 둔다. Vite·React·React Router·axios이고 JavaScript로 쓴다.
- 화면은 `VITE_API_BASE_URL`, 서버는 `DATABASE_URL`과 `CLIENT_ORIGIN` 환경 변수를 사용한다.
- README 기술 표에 없는 패키지는 쓰기 전에 먼저 묻는다.
- API 실패 코드와 문구는 아래 실패 목록을 따른다.

## 폴더 구조 및 작성 원칙

프론트엔드와 백엔드는 기능별 코드를 한곳에서 찾을 수 있도록 기능 중심 구조를 사용한다. 아래 구조는 기능을 구현할 때 따를 권장 위치이며, 사용하지 않는 파일이나 폴더를 미리 만들지 않는다.

### 프론트엔드

```text
frontend/src/
├── api/
│   └── client.js
├── components/
├── hooks/
├── utils/
├── features/
│   ├── companies/
│   ├── comparisons/
│   └── investments/
├── pages/
├── App.jsx
└── main.jsx
```

- `api`에는 axios 인스턴스처럼 모든 기능에서 공유하는 API 설정을 둔다.
- `components`, `hooks`, `utils`에는 둘 이상의 기능에서 실제로 함께 사용하는 코드만 둔다.
- `features`에는 기업, 비교, 투자처럼 기능별 UI와 API 호출, 훅, 비즈니스 로직을 모은다.
- `pages`에는 React Router의 주소와 직접 연결되는 페이지 컴포넌트를 둔다. 페이지는 필요한 기능을 조합하고 세부 로직은 해당 `features` 폴더에 둔다.
- 기능 폴더는 처음에는 파일을 펼쳐 둔 flat 구조로 시작한다. 기능 내부의 컴포넌트가 많아질 때만 해당 기능 아래에 `components` 같은 하위 폴더를 만든다.
- 프로젝트는 JavaScript를 사용하므로 일반 코드는 `.js`, JSX를 포함한 코드는 `.jsx`로 작성한다. TypeScript 타입 파일은 만들지 않는다.

### 백엔드

```text
backend/src/
├── config/
│   └── env.js
├── lib/
│   └── prisma.js
├── middlewares/
├── utils/
├── features/
│   ├── companies/
│   │   ├── companies.routes.js
│   │   ├── companies.controller.js
│   │   ├── companies.service.js
│   │   ├── companies.repository.js
│   │   └── index.js
│   ├── comparisons/
│   └── investments/
├── app.js
└── server.js
```

- `config`에는 환경 변수처럼 실행 환경에 관한 설정을 둔다.
- `lib`에는 Prisma Client처럼 여러 기능에서 공유하는 외부 도구의 초기화 코드를 둔다.
- `middlewares`와 `utils`에는 둘 이상의 기능에서 실제로 공유하는 Express 미들웨어와 유틸리티만 둔다.
- `features`에는 API를 기업, 비교, 투자 기능 단위로 나누어 관련 코드를 모은다.
- `routes`는 주소와 HTTP 메서드를 연결하고, `controller`는 요청을 받아 응답을 만든다.
- `service`는 입력 검증과 비즈니스 규칙을 처리하고, `repository`는 Prisma를 통한 DB 접근을 담당한다.
- `app.js`는 공통 미들웨어와 기능별 라우터를 조립하고, `server.js`는 서버 실행과 정상 종료를 담당한다.
- 각 기능은 필요한 역할의 파일만 만든다. 로직이 단순한데도 `controller`, `service`, `repository`를 형식적으로 모두 만들지 않는다.

### 공통 원칙

- 한 기능에서만 사용하는 코드는 전역 공통 폴더로 옮기지 않고 해당 기능 폴더에 둔다.
- 둘 이상의 기능에서 같은 역할로 사용되는 것이 확인됐을 때만 공통 폴더로 이동한다.
- 다른 기능의 내부 구현을 직접 참조하지 않는다. 기능 사이에 공유해야 하는 인터페이스가 생기면 각 기능의 `index.js`에서 필요한 항목만 공개한다.
- 로그인·회원가입과 새로고침 후 선택 상태 복원은 이번 프로젝트 범위에 포함하지 않는다. 폴더 구조 예시에도 범위 밖 기능을 추가하지 않는다.
- 폴더 구조 때문에 API의 요청·응답 필드, 실패 문구 또는 데이터베이스 계약을 변경하지 않는다.

## 실행 환경과 CORS 명세

| 환경 | 프론트엔드 API 주소 | 서버가 허용할 Origin |
| --- | --- | --- |
| 개발 | `frontend/.env`의 `VITE_API_BASE_URL=http://localhost:3000/api` | `backend/.env`의 `CLIENT_ORIGIN=http://localhost:5173` |
| 배포 | Netlify 환경 변수의 `VITE_API_BASE_URL=https://RENDER_HOST/api` | Render 환경 변수의 `CLIENT_ORIGIN=https://NETLIFY_HOST` |

- Express는 `cors` 미들웨어에서 현재 환경의 `CLIENT_ORIGIN` 한 주소만 허용한다.
- `Access-Control-Allow-Origin: *`는 사용하지 않는다.
- 쿠키나 세션 인증을 사용하지 않으므로 credential 요청을 허용하지 않는다.
- 허용 메서드는 `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`다.
- 허용 요청 헤더는 `Content-Type`이다.
- preflight `OPTIONS` 요청은 `cors` 미들웨어가 처리한다.
- 실제 Netlify·Render 주소와 비밀정보는 저장소에 기록하지 않는다.

## 데이터베이스 환경 및 시드·마이그레이션 명세

| 환경 | 데이터베이스 | 연결 정보 | 용도 |
| --- | --- | --- | --- |
| 개발 | 개발자별 로컬 PostgreSQL | `backend/.env`의 `DATABASE_URL` | 개발, 개발용 데이터 확인 |
| 배포 | Render PostgreSQL | Render 환경 변수의 `DATABASE_URL` | 배포 서비스의 운영 데이터 |

- 개발 환경과 배포 환경은 같은 Prisma 스키마와 마이그레이션 파일을 사용한다.
- 로컬 `.env`와 Render 환경 변수의 `DATABASE_URL`은 서로 다른 데이터베이스를 가리켜야 한다.
- `.env`는 저장소에 커밋하지 않고 `backend/.env.example`에는 변수 이름과 형식만 제공한다.
- 로컬 DB의 데이터를 배포 DB로 직접 복사하지 않는다.
- 로컬 DB에는 기능 확인을 위한 개발용 데이터를 넣을 수 있다.
- 배포 DB에는 서비스에 필요한 카테고리와 기업 초기 데이터만 시드한다. 개발용 가상 투자와 비교 이력은 시드하지 않는다.
- 개발 환경에서는 새 마이그레이션 생성과 로컬 DB 초기화를 허용한다.
- 배포 환경에서는 저장소에 포함된 마이그레이션만 적용하며 마이그레이션 생성이나 DB 초기화를 하지 않는다.
- 이 프로젝트는 개발 환경과 배포 환경만 사용하며 스테이징 환경은 두지 않는다.

## 공통 정렬 및 순위 규칙

- `sortBy`를 생략하면 엔드포인트별 기본 정렬을 사용한다.
- `sortBy` 없이 `order`만 전달하면 `400 INVALID_QUERY`를 반환한다.
- 기업을 정렬하는 API에서 기본 기준이나 `sortBy` 값이 같으면 `company.id` 오름차순을 최종 기준으로 사용한다.
- 순위는 `order`와 관계없이 기준값이 큰 기업부터 계산한다.
- 기준값이 같은 기업에는 같은 순위를 부여하고, 다음 순위는 동점 기업 수만큼 건너뛴다. 예를 들어 두 기업이 공동 1위이면 다음 기업은 3위다.
- `company.id`는 동점 기업의 표시 순서만 결정하며 공동 순위를 나누지 않는다.
- `order`는 응답의 표시 순서만 바꾸며 이미 계산된 순위에는 영향을 주지 않는다.

## API 실패 목록

| HTTP 상태 | 코드 | 고정 문구 |
| --- | --- | --- |
| `400` | `INVALID_QUERY` | 쿼리 값이 올바르지 않습니다. |
| `400` | `INVALID_PATH_PARAMETER` | 경로 매개변수가 올바르지 않습니다. |
| `400` | `VALIDATION_ERROR` | 요청 값이 올바르지 않습니다. |
| `401` | `INVALID_PASSWORD` | 비밀번호가 일치하지 않습니다. |
| `404` | `COMPANY_NOT_FOUND` | 기업을 찾을 수 없습니다. |
| `404` | `INVESTMENT_NOT_FOUND` | 투자 내역을 찾을 수 없습니다. |
| `409` | `CONFLICT` | 현재 데이터 상태와 요청이 충돌합니다. |
| `500` | `INTERNAL_SERVER_ERROR` | 서버 오류가 발생했습니다. |

서버는 같은 실패 코드에 항상 위 문구를 사용한다. 필드별 검증 이유가 필요하면 API 계약에 따라 `details`를 추가한다.

## 일하는 방식

- 이슈를 맡으면 코드를 쓰기 전에 계획부터 보여준다. 바꿀 파일과 순서, 파일마다 할 일을 적고, 「진행해주세요」를 들은 뒤에 코드를 쓴다.
- 명세가 정하지 않은 것은 추측하지 말고 계획에 질문으로 적는다.
- 명세 파일은 고쳐달라는 말을 듣기 전에는 고치지 않는다. 명세를 바꿔야 할 것 같으면 먼저 묻는다.
- 명세를 고칠 때 결정 기록의 이유와 「다시 볼 때」는 사람이 말한 것만 적는다. 말하지 않았으면 비워두고 묻는다.
- 터미널 명령은 직접 실행하지 않는다. 패키지 설치, 프로젝트 만들기, 데이터베이스 켜기처럼 터미널에서 칠 명령은 사람이 칠 수 있게 순서대로 적는다.

## 하지 않는 것

- 요청과 응답의 필드 이름을 계약과 다르게 쓰거나, 계약에 없는 필드를 더하지 않는다.
- 실패 문구를 실패 목록과 다르게 쓰지 않는다.
- PLAN.md 범위에서 「이번엔 안 함」에 있는 기능은 만들지 않는다.
- .env 파일을 열거나 출력하지 않는다.

## 끝나면 알려줄 것

- 바꾼 파일 목록
- 사람이 칠 명령(순서대로)
- 확인에 쓸 api.http 요청과 그 요청이 받아야 할 상태 코드, 또는 화면에서 확인할 것
