# Next Unicorn

  <img src="./frontend/public/brand/logo-blackbg.png" alt="View My Startup 로고" width="480" />

스타트업 정보 조회, 기업 비교 및 순위 분석, 모의 가상 투자 기능을 제공하는 웹 서비스입니다.

---

## 1. 프로젝트 개요 & 서비스 아키텍처

### 주요 기능 및 화면
- **전체 기업 목록 (`/companies`)**: 기업 정보 검색, 정렬(누적 투자금, 매출액, 고용 인원), 페이지네이션
- **기업 상세 (`/companies/:companyId`)**: 기업 상세 정보 및 가상 투자 내역 조회, 가상 투자 등록/수정/삭제 모달
- **기업 비교 및 내 기업 순위 (`/compare`)**: 기준 기업(내 기업)과 비교 기업 선택, 실시간 지표 비교, 매출액/고용 인원 기준 순위 및 인접 기업 조회
- **비교 현황 (`/compare/status`)**: 기업별 내 기업 선택 횟수 및 비교 기업 선택 횟수 집계 현황
- **투자 현황 (`/investments`)**: 기업별 가상 투자 합계와 실제 누적 투자 금액 비교 및 순위 조회

### 서비스 아키텍처

Netlify(프론트엔드), Render Web Service(백엔드 API), Render PostgreSQL(데이터베이스)로 구성된 배포 환경 아키텍처입니다.

```mermaid
flowchart LR
    subgraph Frontend ["Frontend (Netlify)"]
        SPA["React SPA (Vite)"]
    end

    subgraph Backend ["Backend (Render)"]
        API["Express 5 REST API"]
        Prisma["Prisma 7 ORM"]
        API --> Prisma
    end

    subgraph Database ["Database (Render)"]
        DB[("PostgreSQL 18")]
    end

    SPA -- "HTTPS REST API (JSON)" --> API
    Prisma -- "@prisma/adapter-pg" --> DB
```

---

## 2. 기술 스택

| 구분 | 기술 | 용도 |
| --- | --- | --- |
| 패키지 관리 | npm (Workspaces) | 프론트엔드·백엔드 모노레포 의존성 및 스크립트 관리 |
| 언어·런타임 | JavaScript, Node.js 24 | ES 모듈(`import`/`export`) 기반 풀스택 개발 |
| 프론트엔드 | Vite, React 19, React Router, axios | 화면 UI 구성, 클라이언트 라우팅, 비동기 API 통신 |
| 백엔드 | Express 5 | RESTful HTTP API 서버 구현 |
| ORM | Prisma 7, `@prisma/adapter-pg`, `pg` | PostgreSQL 스키마 모델링, 마이그레이션 및 쿼리 매핑 |
| 데이터베이스 | PostgreSQL 18 | 개발 및 운영 데이터 저장소 |
| 가상화 | Docker, Docker Compose | 로컬 개발 환경 통일 (Node.js, PostgreSQL 컨테이너화) |
| 보안·통신 | bcrypt, cors | 가상 투자 비밀번호 단방향 해싱, 교차 출처 리소스 공유 제어 |
| 프론트엔드 배포 | Netlify | Vite 빌드 산출물 정적 호스팅 및 SPA 라우팅 |
| 서버·DB 배포 | Render | Express Web Service 및 관리형 PostgreSQL 운영 |

> [!NOTE]
> README 기술 표에 없는 패키지는 사용하기 전에 팀의 사전 협의를 거칩니다.

---

## 3. 폴더 구조

프로젝트는 기능 단위 응집도를 높이기 위해 프론트엔드와 백엔드 모두 **기능 중심(Feature-based) 폴더 구조**를 사용합니다.

```text
ViewMyStartup-app/
├── backend/                       # 백엔드 패키지
│   ├── prisma/
│   │   ├── migrations/            # 데이터베이스 마이그레이션 이력
│   │   └── schema.prisma          # Prisma 스키마 정의
│   ├── src/
│   │   ├── config/                # 환경 변수 및 실행 설정
│   │   ├── lib/                   # 외부 도구 클라이언트 (Prisma Client 등)
│   │   ├── middleware/           # 공통 Express 미들웨어 (에러 핸들러 등)
│   │   ├── utils/                 # 공통 유틸리티
│   │   ├── features/              # 기능별 3계층 아키텍처 모듈
│   │   │   ├── companies/         # 기업 관련 (routes, controller, service, repository)
│   │   │   ├── comparisons/       # 비교 관련 (routes, controller, service, repository)
│   │   │   └── investments/       # 투자 관련 (routes, controller, service, repository)
│   │   ├── app.js                 # Express 앱 및 라우터 조합
│   │   └── server.js              # 서버 진입점 및 포트 리스닝
│   ├── Dockerfile
│   └── package.json
├── frontend/                      # 프론트엔드 패키지
│   ├── public/
│   │   └── _redirects             # Netlify SPA 클라이언트 라우팅 리디렉션
│   ├── src/
│   │   ├── api/                   # axios 인스턴스 및 공통 통신 설정
│   │   ├── components/            # 전역 공유 공통 컴포넌트
│   │   ├── hooks/                 # 전역 공유 커스텀 훅
│   │   ├── utils/                 # 전역 공통 헬퍼 함수
│   │   ├── features/              # 기능별 컴포넌트, 훅, 비즈니스 로직
│   │   │   ├── companies/         # 기업 목록 및 상세 컴포넌트/로직
│   │   │   ├── comparisons/       # 기업 비교 및 순위 컴포넌트/로직
│   │   │   └── investments/       # 가상 투자 및 현황 컴포넌트/로직
│   │   ├── pages/                 # React Router 페이지 컴포넌트
│   │   ├── App.jsx                # 라우트 설정 및 루트 컴포넌트
│   │   └── main.jsx               # 프론트엔드 진입점
│   ├── Dockerfile
│   └── package.json
├── docs/                          # 프로젝트 문서 및 명세 (brief, PLAN, ADR, API, DATABASE, issues)
├── compose.yaml                   # 로컬 개발용 Docker Compose 설정
├── render.yaml                    # Render Blueprint 배포 설정
├── netlify.toml                   # Netlify 빌드 및 배포 설정
└── package.json                   # 루트 워크스페이스 설정
```

---

## 4. 환경 변수 설명

로컬 실행 전 각 패키지의 `.env.example` 파일을 복사하여 `.env` 파일을 생성해야 합니다. (`.env`는 보안상 저장소에 커밋하지 않습니다.)

### Backend (`backend/.env`)

| 환경 변수 | 설명 | 개발 기본값 | 배포 환경 설정 |
| --- | --- | --- | --- |
| `DATABASE_URL` | PostgreSQL 18 연결 URL | `postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME` | Render 대시보드의 내부 DB 연결 문자열 |
| `CLIENT_ORIGIN` | API 호출을 허용할 프론트엔드 Origin (끝 슬래시 제외) | `http://localhost:5173` | Netlify에 배포된 서비스 도메인 (예: `https://view-my-startup.netlify.app`) |
| `PORT` | 백엔드 서버 포트 (선택 사항) | `3000` | Render 기본 포트 자동 주입 |

### Frontend (`frontend/.env`)

| 환경 변수 | 설명 | 개발 기본값 | 배포 환경 설정 |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | 백엔드 API 기본 주소 (`/api` 포함, 끝 슬래시 제외) | `http://localhost:3000/api` | Render 배포 API 주소 (예: `https://view-my-startup.onrender.com/api`) |

---

## 5. 로컬 실행 가이드라인

### 사전 요구사항
- Node.js 24 이상
- npm 10 이상
- Docker 및 Docker Compose (Docker로 실행 시) 또는 로컬 PostgreSQL 18

의존성 패키지를 저장소 루트에서 한 번에 설치합니다.

```bash
npm install
```

---

### 방법 1. Docker Compose로 실행 (권장)

호스트에 별도의 Node.js나 PostgreSQL을 개별 설정하지 않고 일관된 컨테이너 환경에서 실행할 수 있습니다.

1. **서비스 빌드 및 컨테이너 시작**
   ```bash
   docker compose up --build
   ```

2. **데이터베이스 마이그레이션 적용 (최초 실행 시 또는 스키마 변경 시)**  
   새 터미널 창을 열고 아래 명령을 실행합니다.
   ```bash
   docker compose exec backend npm run prisma:migrate --workspace backend -- --name init
   ```

3. **초기 시드 데이터 삽입 (선택)**  
   12개 카테고리와 1,000개 모의 스타트업 기업 데이터를 데이터베이스에 생성합니다.
   ```bash
   docker compose exec backend node backend/prisma/seed.js
   ```

4. **컨테이너 종료**
   ```bash
   docker compose down
   ```
   > [!WARNING]
   > DB 데이터까지 완전히 초기화해야 할 때만 `docker compose down --volumes`를 사용합니다.

---

### 방법 2. 로컬 환경에서 직접 실행

1. **환경 변수 파일 생성**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
   `backend/.env` 파일의 `DATABASE_URL`에 본인 로컬 PostgreSQL 18 접속 정보를 입력합니다.

2. **Prisma Client 생성 및 마이그레이션 적용**
   ```bash
   npm run prisma:generate --workspace backend
   npm run prisma:migrate --workspace backend -- --name init
   ```

3. **초기 시드 데이터 삽입 (선택)**  
   12개 카테고리와 1,000개 모의 스타트업 기업 데이터를 데이터베이스에 생성합니다.
   ```bash
   node --env-file=backend/.env backend/prisma/seed.js
   ```

4. **개발 서버 실행**
   서로 다른 터미널에서 각각 실행합니다.
   ```bash
   # 터미널 1: 백엔드 API 서버 (포트 3000)
   npm run dev:backend
   ```
   ```bash
   # 터미널 2: 프론트엔드 개발 서버 (포트 5173)
   npm run dev:frontend
   ```

---

### 로컬 접속 주소 및 주요 스크립트

- **프론트엔드 웹 화면**: `http://localhost:5173`
- **백엔드 헬스체크 API**: `http://localhost:3000/api/health`
- **PostgreSQL 로컬 포트**: `localhost:5432`

| 명령 | 설명 |
| --- | --- |
| `npm run dev:backend` | 백엔드 개발 서버 실행 (`--watch` 모드) |
| `npm run dev:frontend` | 프론트엔드 Vite 개발 서버 실행 |
| `npm run build:frontend` | 프론트엔드 프로덕션 빌드 |
| `npm run prisma:generate --workspace backend` | Prisma Client 코드 재생성 |
| `npm run prisma:migrate --workspace backend` | 로컬 개발 DB 마이그레이션 적용 및 스키마 반영 |
| `node --env-file=backend/.env backend/prisma/seed.js` | 12개 카테고리 및 1,000개 스타트업 초기 시드 데이터 삽입 |
| `npm run prisma:deploy --workspace backend` | 프로덕션 환경에 마이그레이션 적용 |

---

## 6. 배포

### Render (백엔드 및 데이터베이스)
- 저장소 루트의 `render.yaml` Blueprint를 통해 PostgreSQL 데이터베이스와 Web Service를 한 번에 생성합니다.
- `CLIENT_ORIGIN` 환경 변수에 Netlify 배포 도메인을 설정합니다.
- 운영 DB에는 저장소에 포함된 마이그레이션 파일만 배포 시점에 적용합니다.
- 배포 완료 후 `GET /api/health` 요청으로 `200 OK` 응답 상태를 확인합니다.

### Netlify (프론트엔드)
- GitHub 저장소 연결 시 루트의 `netlify.toml` 설정에 따라 자동으로 빌드됩니다.
- `VITE_API_BASE_URL` 환경 변수에 Render API 주소(뒤에 `/api` 포함)를 설정합니다.
- `frontend/public/_redirects` 설정이 브라우저 새로고침 및 React Router의 클라이언트 사이드 라우팅을 지원합니다.

---

## 7. 명세 및 관련 문서 바로가기

| 문서 | 설명 |
| --- | --- |
| [PLAN.md](docs/PLAN.md) | 기능 목록, 화면과 URL 매핑, 개발 범위 및 우선순위 (Must/Should/Could/Won't) |
| [ADR.md](docs/ADR.md) | 아키텍처 및 핵심 기술적 의사결정 기록 (비즈니스 룰, 인증 방식, 데이터 타입 등) |
| [DATABASE.md](docs/DATABASE.md) | 데이터베이스 설계 원칙, ERD, 테이블 및 인덱스 명세 |
| [API.md](docs/API.md) | 백엔드 HTTP REST API 규격서 (요청/응답 포맷, 유효성 검증, 에러 응답) |
| [api.http](api.http) | VS Code REST Client 등에서 즉시 테스트 가능한 API 호출 예시 모음 |
| [issues.md](docs/issues.md) | 단위 기능별 이슈 명세 및 완료 기준 (DoD) |
| [AGENTS.md](AGENTS.md) | AI 및 팀 작업 방식과 기능별 코드 배치·공유 원칙 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 브랜치 전략, 커밋 메시지 규칙, PR 및 협업 컨벤션 |


