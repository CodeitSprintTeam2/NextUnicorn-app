<h1>Next Unicorn</h1>
   <div align="center">
  <img src="./frontend/public/brand/readmelogo.png" alt="View My Startup 로고" width="480" />
  <p>스타트업 정보 조회, 기업 비교 및 순위 분석, 모의 가상 투자 기능을 제공하는 웹 서비스입니다.</p>
</div>

---

## 목차

- [프로젝트 소개](#프로젝트-소개)
- [Quick Start](#quick-start)
- [기술 스택과 서비스 아키텍처](#기술-스택과-서비스-아키텍처)
  - [기술 스택](#기술-스택)
  - [서비스 아키텍처](#서비스-아키텍처)
  - [데이터 모델](#데이터-모델)
- [로컬 실행 가이드라인](#로컬-실행-가이드라인)
- [환경 변수](#환경-변수)
- [배포](#배포)
- [폴더 구조](#폴더-구조)
- [문서](#문서)

---

## 프로젝트 소개

### 실제 서비스

- **프론트엔드 서비스**: [https://nextunicorn.netlify.app](https://nextunicorn.netlify.app)
- **백엔드 헬스체크**: [https://nextunicorn-app.onrender.com/api/health](https://nextunicorn-app.onrender.com/api/health)

### 주요 기능 및 화면

<div>
  <h4>전체 기업 목록</h4>
  <img src="./frontend/public/brand/companies.png" alt="전체 기업 목록 페이지" width="900" />
  <p>기업 검색·정렬·페이지네이션과 기업 상세 및 가상 투자 내역을 확인합니다.</p>

  <br />

  <h4>나의 기업 비교</h4>
  <img src="./frontend/public/brand/compare.png" alt="나의 기업 비교 페이지" width="900" />
  <p>기준 기업과 최대 5개 기업을 비교하고 매출액·고용 인원 기준 순위를 확인합니다.</p>
</div>

---

## Quick Start

Docker Compose를 사용해 서비스를 빠르게 실행할 수 있습니다.

1. **서비스 빌드 및 컨테이너 시작**
   ```bash
   docker compose up --build
   ```

2. **데이터베이스 마이그레이션 적용**
   ```bash
   docker compose exec backend npm run prisma:deploy --workspace backend
   ```

3. **초기 시드 데이터 삽입 (선택)**
   ```bash
   docker compose exec backend node backend/prisma/seed.js
   ```

- **프론트엔드 웹 화면**: `http://localhost:5173`
- **백엔드 헬스체크 API**: `http://localhost:3000/api/health`

자세한 실행 방법은 [로컬 실행 가이드라인](#로컬-실행-가이드라인)을 참고합니다.

---

## 기술 스택과 서비스 아키텍처

### 기술 스택

#### Frontend

![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?style=flat-square&logo=javascript&logoColor=000000)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=000000)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=ffffff)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=reactrouter&logoColor=ffffff)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=ffffff)

#### Backend

![Node.js](https://img.shields.io/badge/Node.js-24-5FA04E?style=flat-square&logo=nodedotjs&logoColor=ffffff)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=ffffff)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=ffffff)

#### Database & Infrastructure

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=flat-square&logo=postgresql&logoColor=ffffff)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=ffffff)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=ffffff)
![Render](https://img.shields.io/badge/Render-000000?style=flat-square&logo=render&logoColor=ffffff)

#### Package Manager

![npm](https://img.shields.io/badge/npm-Workspaces-CB3837?style=flat-square&logo=npm&logoColor=ffffff)

### 서비스 아키텍처

모노레포에서 프론트엔드와 백엔드를 함께 개발하며, 프론트엔드는 Netlify에, 백엔드는 Render에 독립적으로 빌드·배포합니다.

```mermaid
flowchart LR
    subgraph Development ["Development (Monorepo)"]
        Repo["Git Repository"]
        Frontend["frontend/<br/>React + Vite"]
        Backend["backend/<br/>Express + Prisma"]
        Repo --> Frontend
        Repo --> Backend
    end

    subgraph Deployment ["Independent Deployment"]
        Netlify["Netlify<br/>React SPA"]
        RenderAPI["Render Web Service<br/>REST API"]
        Database[("Render PostgreSQL")]
    end

    Frontend -- "Vite Build & Deploy" --> Netlify
    Backend -- "Build & Deploy" --> RenderAPI
    RenderAPI -- "Prisma" --> Database

    User["User Browser"] --> Netlify
    Netlify -- "HTTPS / JSON" --> RenderAPI
```

### 데이터 모델

README에는 핵심 엔티티의 관계만 표시하며, 컬럼과 제약 조건은 [데이터베이스 설계 문서](docs/DATABASE.md)에서 관리합니다.

```mermaid
erDiagram
    CATEGORY ||--o{ COMPANY : classifies
    COMPANY ||--o{ INVESTMENT : receives
    COMPANY ||--o{ COMPARISON : selected_as_my_company
    COMPARISON ||--|{ COMPARISON_TARGET : contains_1_to_5
    COMPANY ||--o{ COMPARISON_TARGET : selected_as_target
```

---

## 로컬 실행 가이드라인

### 사전 요구사항

- **Docker Compose 실행:** Docker 및 Docker Compose
- **로컬 환경에서 직접 실행:** Node.js 24 이상, npm 10 이상, PostgreSQL 18

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
   docker compose exec backend npm run prisma:deploy --workspace backend
   ```

3. **초기 시드 데이터 삽입 (선택)**  
   12개 카테고리와 1,000개 모의 스타트업 기업 데이터를 데이터베이스에 생성합니다.
   ```bash
   docker compose exec backend node backend/prisma/seed.js
   ```

---

### 방법 2. 로컬 환경에서 직접 실행

의존성 패키지를 저장소 루트에서 한 번에 설치합니다.

```bash
npm install
```

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

## 환경 변수

### Backend (`backend/.env`)

| 환경 변수 | 설명 | 개발 기본값 | 배포 환경 설정 |
| --- | --- | --- | --- |
| `DATABASE_URL` | PostgreSQL 18 연결 URL | `postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME` | Render 대시보드의 내부 DB 연결 문자열 |
| `CLIENT_ORIGIN` | API 호출을 허용할 프론트엔드 Origin (끝 슬래시 제외) | `http://localhost:5173` | Netlify에 배포된 서비스 도메인 (예: `https://nextunicorn.netlify.app`) |
| `PORT` | 백엔드 서버 포트 (선택 사항) | `3000` | Render 기본 포트 자동 주입 |

### Frontend (`frontend/.env`)

| 환경 변수 | 설명 | 개발 기본값 | 배포 환경 설정 |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | 백엔드 API 기본 주소 (`/api` 포함, 끝 슬래시 제외) | `http://localhost:3000/api` | Render 배포 API 주소 (예: `https://nextunicorn-app.onrender.com/api`) |

---

## 배포

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

## 폴더 구조

프로젝트는 기능 단위 응집도를 높이기 위해 프론트엔드와 백엔드 모두 **기능 중심(Feature-based) 폴더 구조**를 사용합니다.

<details>
<summary><strong>폴더 구조 펼쳐보기</strong></summary>

```text
ViewMyStartup-app/
├── backend/                       # 백엔드 패키지
│   ├── generated/                 # Prisma Client 생성 코드
│   ├── prisma/
│   │   ├── migrations/            # 데이터베이스 마이그레이션 이력
│   │   ├── schema.prisma          # Prisma 스키마 정의
│   │   └── seed.js                # 초기 시드 데이터 생성
│   ├── src/
│   │   ├── config/                # 환경 변수 및 실행 설정
│   │   ├── errors/                # 공통 애플리케이션 오류 정의
│   │   ├── features/              # 기능별 3계층 아키텍처 모듈
│   │   │   ├── companies/         # 기업 목록 및 상세 기능
│   │   │   ├── comparisons/       # 기업 비교 및 순위 기능
│   │   │   └── investments/       # 가상 투자 및 투자 현황 기능
│   │   ├── lib/                   # 외부 도구 클라이언트
│   │   ├── middleware/            # 공통 Express 미들웨어
│   │   ├── serializers/           # API 응답 직렬화
│   │   ├── app.js                 # Express 앱 및 라우터 조합
│   │   └── server.js              # 서버 진입점 및 포트 리스닝
│   ├── tests/                     # 백엔드 테스트 코드
│   ├── Dockerfile                 # 백엔드 컨테이너 이미지 설정
│   ├── package.json               # 백엔드 패키지 및 스크립트
│   └── prisma.config.js           # Prisma CLI 설정
├── frontend/                      # 프론트엔드 패키지
│   ├── public/
│   │   ├── brand/                 # README 및 서비스 브랜드 이미지
│   │   └── _redirects             # Netlify SPA 라우팅 리디렉션
│   ├── src/
│   │   ├── api/                   # API 클라이언트 및 공통 통신 설정
│   │   ├── components/            # 전역 공유 컴포넌트
│   │   ├── features/              # 기능별 컴포넌트와 비즈니스 로직
│   │   ├── hooks/                 # 전역 공유 커스텀 훅
│   │   ├── pages/                 # React Router 페이지 컴포넌트
│   │   ├── styles/                # 공통 스타일 및 디자인 토큰
│   │   ├── utils/                 # 전역 공통 헬퍼 함수
│   │   ├── App.jsx                # 라우트 설정 및 루트 컴포넌트
│   │   ├── App.module.css         # 루트 컴포넌트 스타일
│   │   ├── main.jsx               # 프론트엔드 진입점
│   │   └── styles.css             # 전역 스타일
│   ├── tests/                     # 프론트엔드 테스트 코드
│   ├── Dockerfile                 # 프론트엔드 컨테이너 이미지 설정
│   ├── index.html                 # Vite HTML 진입점
│   ├── package.json               # 프론트엔드 패키지 및 스크립트
│   └── vite.config.js             # Vite 개발·빌드 설정
├── docs/                          # 프로젝트 문서 및 명세
├── api.http                       # API 요청 및 수동 검증 예시
├── compose.yaml                   # 로컬 개발용 Docker Compose 설정
├── netlify.toml                   # Netlify 빌드 및 배포 설정
├── render.yaml                    # Render Blueprint 배포 설정
└── package.json                   # npm 워크스페이스 설정
```

</details>

---

## 문서

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
