# View My Startup Frontend Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the placeholder frontend into the Figma-matched, API-backed View My Startup interface without changing the backend or misrepresenting unavailable data.

**Architecture:** Keep the existing Vite/React Router app and axios client. Add contract-specific API modules, shared responsive components/design tokens, and five route-level pages with focused styles. Render an explicit unavailable state when the current health-only backend lacks a documented feature endpoint.

**Tech Stack:** JavaScript ES modules, React 19, React Router 7, axios, Vite 7, CSS.

**Spec:** `docs/superpowers/specs/2026-10-13-view-my-startup-frontend-rebuild.md`

## Global Constraints

- Use only React, React Router, axios, and Vite already in the frontend dependency list.
- Keep JavaScript/ES modules; do not introduce TypeScript or new packages.
- Do not change backend, Prisma, database, README, API.md, issues.md, or existing project specifications.
- Use documented `API.md` request/response shapes and `VITE_API_BASE_URL`.
- API responses are live data; do not present CSV or fixture values as live data.
- Keep the `/compare` selection transient; refresh clears it.
- Keep actual investment distinct from virtual investment, which sums active entries.
- Do not run Git operations or change branch/remote state.

## Review Focus

- A missing endpoint may return an HTML/default 404; distinguish it from contract JSON errors such as `COMPANY_NOT_FOUND` and show an unavailable state.
- Amount inputs and renderers must preserve decimal-string values through PostgreSQL BIGINT max without JavaScript number precision loss.
- Search or sort changes reset pagination, and page controls follow response metadata including zero-result pages.
- Comparison completion must reject empty, duplicate, self, and more-than-five selections and submit once while pending.
- Empty API data, API failure, and unimplemented endpoint states must remain visibly distinct.

---

### Task 1: Design system, API helpers, and shared shell

**Files:**
- Create: `frontend/src/styles/tokens.css`
- Create: `frontend/src/styles/base.css`
- Create: `frontend/src/api/errors.js`
- Create: `frontend/src/api/companies.js`
- Create: `frontend/src/api/comparisons.js`
- Create: `frontend/src/api/investments.js`
- Create: `frontend/src/components/SiteHeader.jsx`
- Create: `frontend/src/components/SiteHeader.css`
- Create: `frontend/src/components/CompanyMark.jsx`
- Create: `frontend/src/components/CompanyMark.css`
- Create: `frontend/src/components/FeedbackState.jsx`
- Create: `frontend/src/components/FeedbackState.css`
- Create: `frontend/src/components/Pagination.jsx`
- Create: `frontend/src/components/Pagination.css`
- Create: `frontend/src/components/Modal.jsx`
- Create: `frontend/src/components/Modal.css`
- Modify: `frontend/src/main.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- `listCompanies(params)`, `getCompany(companyId)`, `listCompanyInvestments(companyId, params)` call the documented company endpoints and return `response.data`.
- `submitComparison(payload)`, `getCompanyRanking(companyId, params)`, `getComparisonStatus(params)` call the documented comparison endpoints.
- `getInvestmentStatus(params)`, `createInvestment(payload)`, `updateInvestment(investmentId, payload)`, `deleteInvestment(investmentId, password)` call the documented investment endpoints.
- `classifyApiError(error)` returns `{ kind, code, message }`, where `kind` is `contract`, `unavailable`, or `network`.
- `FeedbackState` accepts `state`, `message`, and optional `onRetry`; `Pagination` accepts `page`, `totalPages`, and `onChange`.

- [ ] Add design tokens from the supplied color and font resources; load or reference the supplied Pretendard assets where available.
- [ ] Add the shared dark base styles, responsive centered content shell, and header links for `/companies`, `/compare`, `/compare/status`, and `/investments`.
- [ ] Add API wrappers using only the existing axios client; pass query parameters through unchanged and preserve API decimal strings.
- [ ] Classify contract JSON errors separately from a missing/non-contract route and network failures.
- [ ] Add reusable company mark fallback, loading/empty/error/unavailable view, metadata-driven pagination, and accessible modal shell with Escape and focus handling.
- [ ] Wire `App.jsx` to the five route components, retaining the `/companies` fallback for unknown paths.
- [ ] Verify the shared shell builds and that the missing feature endpoints resolve to the unavailable state rather than fabricated success data.

### Task 2: Company list, detail, and virtual investment dialogs

**Files:**
- Create: `frontend/src/pages/CompaniesPage.jsx`
- Create: `frontend/src/pages/CompaniesPage.css`
- Create: `frontend/src/pages/CompanyDetailPage.jsx`
- Create: `frontend/src/pages/CompanyDetailPage.css`
- Create: `frontend/src/components/CompanyDataTable.jsx`
- Create: `frontend/src/components/CompanyDataTable.css`
- Create: `frontend/src/components/SearchSortBar.jsx`
- Create: `frontend/src/components/SearchSortBar.css`
- Create: `frontend/src/components/InvestmentForm.jsx`
- Create: `frontend/src/components/InvestmentForm.css`
- Create: `frontend/src/components/InvestmentDialogs.jsx`
- Create: `frontend/src/components/InvestmentDialogs.css`

**Interfaces:**
- `CompanyDataTable` accepts rows, columns, a row-link callback, and a compact card layout for narrow viewports.
- `SearchSortBar` accepts search value, sort options/value, order, and callbacks; changing a filter resets the owning page to 1.
- `InvestmentForm` accepts mode (`create` or `update`), initial values, submit/cancel callbacks, and a pending/error state. `InvestmentDialogs` supplies create, update, and delete flows through the API modules.

- [ ] Implement `/companies` search, sort by actual investment/revenue/employees, response-driven pagination, row navigation, and loading/empty/error/unavailable states.
- [ ] Implement `/companies/:companyId` company summary, description, actual/virtual investment, revenue and employee metrics, and paginated active investment list.
- [ ] Implement create, edit, and delete dialogs using the documented payloads and Korean API error messages; keep inputs on recoverable errors and disable repeat submissions while pending.
- [ ] Validate name (1–20), amount (positive integer string through BIGINT max), comment (1–200), password (4–20), and password confirmation before submission.
- [ ] Match the corresponding Figma desktop/tablet/mobile layouts, including row action dropdown, confirmation/error popups, and empty investment state.
- [ ] Manually verify search, sort, pagination, detail navigation, each dialog's validation/cancel/close/error behavior, and the explicit unavailable state against the current backend.

### Task 3: Comparison selection, results, and rankings

**Files:**
- Create: `frontend/src/pages/ComparePage.jsx`
- Create: `frontend/src/pages/ComparePage.css`
- Create: `frontend/src/components/CompanySelectionDialog.jsx`
- Create: `frontend/src/components/CompanySelectionDialog.css`
- Create: `frontend/src/components/ComparisonResults.jsx`
- Create: `frontend/src/components/ComparisonResults.css`
- Create: `frontend/src/components/RankingResults.jsx`
- Create: `frontend/src/components/RankingResults.css`

**Interfaces:**
- `ComparePage` owns transient state for `myCompany`, `compareCompanies`, `recentMyCompanies`, and the current step; it clears naturally on refresh.
- `CompanySelectionDialog` accepts mode (`my-company` or `compare-companies`), selected IDs, company-page query state, and selection callbacks.
- `ComparisonResults` accepts the returned own company and comparison companies plus sort key/order; sorting is client-side and does not submit another comparison.
- `RankingResults` accepts the ranking response and requested ranking dimension/order.

- [ ] Implement own-company selection and recent selection history capped at five within the current page session.
- [ ] Implement comparison selection with search/pagination, 1–5 distinct companies, self/duplicate rejection, individual removal, and clear-all.
- [ ] Implement selection completion with a confirmation step, validation, pending lock, exactly one `POST /api/comparisons` request, and no count increments from re-sorting results.
- [ ] Render comparison result and revenue/employee nearby ranking sections from API responses; allow client-side result sorting by actual investment, revenue, and employees.
- [ ] Connect the result investment action to the existing create-investment dialog, fixed to the selected own company.
- [ ] Match all Figma selection/result/modal states and manually verify selection constraints, reset-on-refresh, pending duplicate-click prevention, client sorting, ranking controls, and missing endpoint handling.

### Task 4: Comparison status and investment status pages

**Files:**
- Create: `frontend/src/pages/ComparisonStatusPage.jsx`
- Create: `frontend/src/pages/ComparisonStatusPage.css`
- Create: `frontend/src/pages/InvestmentsPage.jsx`
- Create: `frontend/src/pages/InvestmentsPage.css`

**Interfaces:**
- Both pages use `SearchSortBar`, `CompanyDataTable`, `Pagination`, `FeedbackState`, and the matching API wrapper.
- `ComparisonStatusPage` displays `myCompanySelections` and `comparisonSelections` with the two documented sort keys.
- `InvestmentsPage` displays rank, virtual investment, and actual investment with documented sort keys and server metadata.

- [ ] Implement `/compare/status` sort and pagination using `GET /api/comparison-status`.
- [ ] Implement `/investments` sort and pagination using `GET /api/investment-status`; preserve rank values as returned, including ties.
- [ ] Match empty states, responsive compact rows/cards, and sort dropdowns to the supplied PDFs.
- [ ] Manually verify sorting, pagination, rank display, empty/error/unavailable states, and navigation from the shared header.

### Task 5: Responsive and interaction review; build

**Files:**
- Modify: shared and page CSS created in Tasks 1–4
- Modify: route/page/components only to correct issues found during review

- [ ] Compare each route and dialog against its Figma PDF at the supplied desktop, tablet, and mobile frame widths; correct spacing, typography, color, table/card reflow, and modal sizing.
- [ ] Review keyboard operation, dialog focus/escape behavior, labels, focus visibility, busy/disabled states, and overflow at 320px width.
- [ ] Start the frontend and manually walk every button/input/modal interaction, including success-path payload behavior where an API becomes available and unavailable/error behavior with the current health-only backend.
- [ ] Run `npm run build:frontend` from the repository root and resolve any build errors.
- [ ] Summarize changed frontend files, note that feature endpoints remain a backend dependency, and provide the build/manual review results.
