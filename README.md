# View My Startup

## 기술

| 구분 | 기술 | 용도 |
| --- | --- | --- |
| 패키지 관리 | npm | 프론트엔드·백엔드 의존성 및 스크립트 관리 |
| 언어·모듈 | JavaScript, ES 모듈 | `import`/`export` 방식으로 코드 작성 |
| 프론트엔드 | Vite, React, React Router, axios | 화면 구성, 클라이언트 라우팅, API 요청 |
| 백엔드 | Node.js 24, Express 5 | HTTP API 서버 |
| ORM | Prisma 7, `@prisma/adapter-pg`, `pg` | PostgreSQL 스키마, 마이그레이션, 쿼리와 드라이버 연결 |
| 데이터베이스 | PostgreSQL 18 | 개발·배포 데이터 저장 |
| 로컬 개발 환경 | Docker, Docker Compose | Node.js·PostgreSQL 버전과 실행 환경 통일 |
| 비밀번호 | bcrypt | 가상 투자 비밀번호 해시 및 비교 |
| CORS | cors | 허용된 프론트엔드 Origin의 API 요청 처리 |
| 프론트엔드 배포 | Netlify | Vite 빌드 결과 배포 |
| 서버·DB 배포 | Render, Render PostgreSQL | Express 서버와 배포 DB 운영 |

README 기술 표에 없는 패키지는 사용하기 전에 팀의 합의를 받는다.

## 폴더 구조

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

## 로컬 실행

Node.js 24와 로컬 PostgreSQL 18을 준비한 뒤 저장소 최상위에서 의존성을 설치한다.

```bash
npm install
```

`backend/.env.example`과 `frontend/.env.example`을 복사해 각 폴더에 `.env`를 만들고 실제 로컬 값을 입력한다. `.env`는 저장소에 커밋하지 않는다.

Prisma Client를 생성하고 로컬 DB에 마이그레이션을 적용한다.

```bash
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend -- --name init
```

서로 다른 터미널에서 서버와 화면을 실행한다.

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

- 프론트엔드: `http://localhost:5173`
- 상태 확인 API: `http://localhost:3000/api/health`

### Docker로 실행

Docker를 사용하면 호스트에 Node.js 24와 PostgreSQL 18을 각각 설치하지 않아도 같은 개발 환경을 사용할 수 있다. Docker는 로컬 개발에만 사용하며 Netlify·Render 배포 방식은 변경하지 않는다.

저장소 최상위에서 이미지 빌드와 전체 서비스를 실행한다.

```bash
docker compose up --build
```

처음 실행했거나 스키마가 변경되었다면 다른 터미널에서 개발 DB 마이그레이션을 적용한다.

```bash
docker compose exec backend npm run prisma:migrate --workspace backend -- --name init
```

- 프론트엔드: `http://localhost:5173`
- 상태 확인 API: `http://localhost:3000/api/health`
- PostgreSQL: `localhost:5432`
- Docker 내부에서 백엔드는 `db:5432`로 PostgreSQL에 연결한다.
- 소스 코드는 컨테이너에 마운트되므로 변경사항이 개발 서버에 반영된다.
- DB 데이터는 `postgres_data` 볼륨에 저장되어 컨테이너를 다시 시작해도 유지된다.

서비스를 종료한다.

```bash
docker compose down
```

DB 데이터까지 초기화해야 할 때만 다음 명령을 사용한다. 이 명령은 로컬 Docker DB 데이터를 삭제한다.

```bash
docker compose down --volumes
```

## 배포

### Render

- 저장소 루트의 `render.yaml` Blueprint로 PostgreSQL과 Web Service를 만든다.
- `CLIENT_ORIGIN`에는 실제 Netlify 주소를 입력한다.
- 운영 DB에는 저장소에 포함된 마이그레이션만 `npm run prisma:deploy --workspace backend`로 적용한다.
- 배포 후 `/api/health`가 `200 OK`인지 확인한다.

### Netlify

- GitHub 저장소를 연결하면 루트의 `netlify.toml` 설정으로 프론트엔드를 빌드한다.
- `VITE_API_BASE_URL`에는 실제 Render 주소 뒤에 `/api`를 붙여 입력한다.
- `frontend/public/_redirects`가 React Router 주소의 직접 접근과 새로고침을 처리한다.

## 실행 환경과 CORS

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

## 기능 및 계획 명세

자세한 기능 목록, 화면과 주소, 범위와 우선순위는 [PLAN.md](PLAN.md)를 참고한다.


## 결정 기록

자세한 결정 기록은 [ADR.md](ADR.md)를 참고한다.


## 공통 정렬 및 순위 규칙

- `sortBy`를 생략하면 엔드포인트별 기본 정렬을 사용한다.
- `sortBy` 없이 `order`만 전달하면 `400 INVALID_QUERY`를 반환한다.
- 기업을 정렬하는 API에서 기본 기준이나 `sortBy` 값이 같으면 `company.id` 오름차순을 최종 기준으로 사용한다.
- 순위는 `order`와 관계없이 기준값이 큰 기업부터 계산한다.
- 기준값이 같은 기업에는 같은 순위를 부여하고, 다음 순위는 동점 기업 수만큼 건너뛴다. 예를 들어 두 기업이 공동 1위이면 다음 기업은 3위다.
- `company.id`는 동점 기업의 표시 순서만 결정하며 공동 순위를 나누지 않는다.
- `order`는 응답의 표시 순서만 바꾸며 이미 계산된 순위에는 영향을 주지 않는다.

## 데이터베이스 환경

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
