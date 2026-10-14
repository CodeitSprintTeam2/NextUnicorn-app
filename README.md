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

기능 중심의 폴더 구조 및 세부 코드 작성 원칙은 [AGENTS.md](AGENTS.md)를 참고한다.

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

## 실행 환경

| 환경 | 프론트엔드 API 주소 | 서버가 허용할 Origin |
| --- | --- | --- |
| 개발 | `frontend/.env`의 `VITE_API_BASE_URL=http://localhost:3000/api` | `backend/.env`의 `CLIENT_ORIGIN=http://localhost:5173` |
| 배포 | Netlify 환경 변수의 `VITE_API_BASE_URL=https://RENDER_HOST/api` | Render 환경 변수의 `CLIENT_ORIGIN=https://NETLIFY_HOST` |

- 실제 Netlify·Render 주소와 비밀정보는 저장소에 기록하지 않는다.
- 세부 CORS 정책 및 미들웨어 규칙은 [AGENTS.md](AGENTS.md)를 참고한다.

## 데이터베이스 환경

| 환경 | 데이터베이스 | 연결 정보 | 용도 |
| --- | --- | --- | --- |
| 개발 | 개발자별 로컬 PostgreSQL | `backend/.env`의 `DATABASE_URL` | 개발, 개발용 데이터 확인 |
| 배포 | Render PostgreSQL | Render 환경 변수의 `DATABASE_URL` | 배포 서비스의 운영 데이터 |

- 실제 연결 정보와 비밀정보는 저장소에 기록하지 않는다.
- 세부 데이터베이스 환경 규칙과 마이그레이션·시드 명세는 [AGENTS.md](AGENTS.md)를 참고한다.

## 명세 및 관련 문서

- 기능 목록, 화면과 주소, 개발 범위 및 우선순위: [PLAN.md](PLAN.md)
- 아키텍처 및 설계 결정 기록: [ADR.md](ADR.md)
- HTTP API 계약 (요청/응답 규격): [API.md](API.md)
- API 예시 요청: [api.http](api.http)
- AI 개발 규칙, 폴더 구조, 공통 정책 및 실패 목록: [AGENTS.md](AGENTS.md)
