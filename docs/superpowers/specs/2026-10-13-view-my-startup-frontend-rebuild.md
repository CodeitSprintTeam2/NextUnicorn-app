# View My Startup Frontend Rebuild

## Goal

Rebuild the existing placeholder client as a maintainable React + Vite frontend that follows the supplied Figma screens and calls only the documented backend API. It covers the five documented routes, their dialogs and empty/error states, and responsive desktop, tablet, and mobile layouts.

## Context and constraints

- The current frontend is the `/companies` server-health placeholder.
- The current backend registers only `GET /api/health`; the feature endpoints described in `API.md` are not implemented yet.
- `README.md`, `API.md`, `issues.md`, Prisma schema/migrations, and backend code are authoritative and must not be changed for this frontend task.
- Use only packages already declared for the frontend: React, React Router, axios, and Vite. Keep JavaScript and the existing ES module style.
- Treat API responses as the source of live company and investment data. Never present local fixture or CSV data as live API data.
- The supplied CSV has a different, much smaller shape than `CompanySummary` and contains historical investment rows; it cannot fill company descriptions, revenue, employee counts, or virtual investment aggregates. Do not merge it into API-backed screens. Keep it as reference input unless a later request defines a clearly labeled CSV-only view.
- The existing HTML is a behavior reference only. Recreate structure from Figma rather than carrying its layout or code forward.
- Do not change Git state, push, create a PR, or merge.

## Design direction

Use the supplied Figma PDFs as the visual source for all screen and component states. The screens use a near-black page (`#131313`), dark surfaces (`#212121`, `#282828`, `#2E2E2E`), gray text/surfaces (`#333333`, `#4B4B4B`, `#747474`, `#D8D8D8`), a warm orange action accent, compact Pretendard typography, rounded dark panels, thin separators, and orange filled pagination/actions. Confirm accent/font resource details against the resource PDFs during implementation rather than inventing a new palette. Use supplied logos, company marks, icons, favicon, and image assets where extractable; retain readable text fallbacks for missing company marks.

The desktop screens use a centered content area and tables; smaller Figma frames reflow company rows and summary metrics into narrow layouts. Preserve information and controls on mobile by using the corresponding compact/card arrangements rather than shrinking desktop tables until unreadable. Modals and dropdowns must stay within the viewport and scroll internally where needed.

## Routes and behaviors

1. `/companies`: search by company name, sort by actual investment/revenue/employees, server pagination, and navigation to detail.
2. `/companies/:companyId`: company summary, actual and virtual investment amounts, revenue, employees, description, paginated active virtual investments, and create/edit/delete dialogs.
3. `/compare`: transient flow for choosing one own company and one to five distinct comparison companies, recent own-company choices (up to five), removable/clearable comparison selections, client-side result sorting, nearby revenue/employee ranking, and investment creation for the own company. Refresh clears selection state as specified by README.
4. `/compare/status`: paginated company selection counts and sorting by own-company or comparison-company selections.
5. `/investments`: paginated whole-company virtual and actual investment status with ranking and sort controls.

Share the header/navigation, company identity, data formatting, search/sort controls, pagination, modal shell, loading/empty/error/unavailable states, and accessible form controls where behavior is identical. Keep page-specific content and CSS grouped by route.

## API and data behavior

- Keep the existing axios client and `VITE_API_BASE_URL`; add endpoint wrappers that follow `API.md` request and response names exactly.
- Implement frontend calls for documented endpoints: company list/detail/investments, comparison submit, rankings, comparison status, investment status, and investment create/update/delete.
- Do not add mock success responses, localStorage persistence, seeded examples, or frontend-only company/investment mutations.
- While endpoints are absent, show a visible, honest unavailable state for the affected data/action; do not claim an operation succeeded. Distinguish contract JSON errors (including `COMPANY_NOT_FOUND`, `INVESTMENT_NOT_FOUND`, `INVALID_PASSWORD`, and `VALIDATION_ERROR`) from an unimplemented/non-contract endpoint response.
- Apply input constraints from `API.md`: investor name 1–20 characters, positive integer amount as a decimal string no greater than PostgreSQL BIGINT max, comment 1–200 characters, password 4–20 characters, and matching confirmation for creation. Send only fields allowed by each endpoint.
- Format large decimal-string amounts without converting them to imprecise JavaScript numbers. Keep API values and labels explicit: actual investment is historical company data; virtual investment is the sum of active virtual entries.
- Search/sort changes reset list pages to 1. Pagination uses response metadata, not assumed page counts.
- Prevent repeat comparison submission while in flight; submit once when the user confirms a valid selection.

## States and accessibility

Every data view handles loading, successful data, empty results, contract errors, and API-unavailable responses. The comparison flow also handles no own-company selection, no comparison selection, duplicate/self selection, and the one-to-five selection limit. Investment dialogs handle field validation, pending submission, success, wrong password, deleted/missing investment, and server failure; keep the dialog open and entered fields intact on recoverable failure.

Dialogs close using visible close/cancel controls and Escape, trap focus while open, and restore focus to their opener. Buttons and inputs have labels, keyboard focus styles, and disabled/busy states. Tables/cards retain heading relationships and readable contrast.

## Frontend structure

Keep `frontend/src/main.jsx` as the application entry and split the app into:

- `api/`: endpoint modules grouped by companies, comparisons/status/ranking, and investments; retain `client.js` as shared axios setup.
- `components/`: shared site header, company mark, data table/card, search/sort controls, pagination, modal, form fields, feedback states, and amount/date formatters.
- `pages/`: one page and page stylesheet for each of the five routes, with route-specific dialogs in focused modules.
- `styles/`: design tokens, base/reset, and shared responsive primitives.
- `public/`: only supplied relevant logo/font/icon/image assets and the existing routing file.

Use existing React Router and CSS; do not introduce dependencies, TypeScript, or backend changes.

## Completion criteria

- All five routes match supplied Figma screen variants, including dialogs, dropdowns, popups, and empty states, at desktop, tablet, and mobile widths.
- Each interaction follows the API contract and fails honestly while its endpoint is unavailable.
- No CSV or local demo data is mistaken for server data.
- `npm run build:frontend` passes. Manually review route navigation, search/sort/pagination, selection limits, modal open/close/validation/error states, and responsive layouts.
- No backend, Prisma, database, existing project specification, or Git changes are part of this task.

## Open implementation detail

Exact responsive breakpoints are not specified in the PDFs. Choose breakpoints from the supplied desktop/tablet/mobile frames and verify transitions at those frame widths during implementation; do not alter the information hierarchy to fit arbitrary device sizes.
