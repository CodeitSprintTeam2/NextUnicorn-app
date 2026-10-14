# SDD ledger — plan: docs/superpowers/plans/2026-10-13-view-my-startup-frontend-rebuild.md

Ruling: User explicitly asked for local-only work and no Git or branches, so execute in the current local checkout without worktree setup, status/diff/log commands, commits, or remote operations.

Ruling: The frontend package has no test framework and the repository disallows new dependencies; use Node's built-in `node:test` for pure API/data/validation/selection helpers and browser/manual review for React interaction and visual behavior.

Task 1 Ruling: Add `frontend/src/utils/amount.js`, `validation.js`, and `comparison.js` to hold pure contract-sensitive behavior. Keeping these separate makes precision, validation, and selection limits testable with Node's built-in runner without adding a package.

Task 1 RED: `frontend/tests/domain.test.js` ran with Node's built-in test runner; all 3 tests failed on the expected missing exports (`formatKoreanAmount`, `isValidAmount`, `canSubmitComparison`).

Pre-flight: Task 1 produces API wrappers, feedback states, modal, pagination, and header consumed by Tasks 2–4; task 2 produces the investment dialogs and form consumed by Task 3; task 2 and task 4 consume the shared table/search controls. Keep these interfaces stable before page work.

## Progress

- Task 1: complete — `node --test frontend/tests/domain.test.js`: 3 passed, 0 failed; `npm run build:frontend`: exit 0.
- Task 2: complete — company list/detail pages, investment create/update/delete dialogs, API wrappers, responsive table and form components implemented. Browser confirmed the detail route and company selection dialog render; API success behavior is not verifiable because the backend is not running.
- Task 3: complete — comparison selection, limits, result sorting, ranking, and investment entry implemented. Browser confirmed selection route and dialog; API-backed result behavior is not verifiable because the backend is not running.
- Task 4: complete — comparison status and investment status pages implemented with documented query parameters, sorting, pagination, empty/error/unavailable states, and mobile cards. Browser confirmed both route headings and error states render.
- Task 5: complete with backend limitation — `npm run build:frontend` passed; `node --test frontend/tests/domain.test.js` passed 3/3. Browser manually checked `/companies`, `/companies/1`, `/compare` and its selection modal, `/compare/status`, and `/investments`. The browser showed the expected network failure because no API server was running. Responsive behavior was reviewed through breakpoint styles; desktop browser capture was visually inspected. Feature API success states, CRUD submissions, and mobile viewport rendering still need verification when the documented backend endpoints are available.

Final review: `Modal` close handling now keeps its latest callback in a ref so parent rerenders do not prematurely clean up the open-dialog effect or restore focus. Local Vite server stopped after review. No Git commands, branch changes, commits, or remote operations were made.
