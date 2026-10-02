---
created: 2026-09-25T15:28:07.661Z
plan: .agelum/work/plans/2026-10-02-playwrite-test-1790962327523.md
status: done
summary: .agelum/work/summaries/2026-10-02-playwrite-test-1790962446260.md
type: task
workflowStatus: done
---

# playwright test

Add basic Playwright tests that navigate through all the main menus and submenus of the web applications just to check that all the pages are rendering without errors.

## Scope

Two Next.js web apps to cover:

- **Admin app** (`apps/admin`, port `8001`)
  Dashboard layout: `apps/admin/src/app/(dashboard)/layout.tsx:1`
- **Wallet app** (`apps/wallet`)
  Dashboard layout: `apps/wallet/src/app/(dashboard)/layout.tsx:1`

## Pages to navigate

### Admin app (`apps/admin`)

- `/` — dashboard home: `apps/admin/src/app/(dashboard)/page.tsx:1`
- `/properties` — `apps/admin/src/app/(dashboard)/properties/page.tsx:1`
- `/chat` — `apps/admin/src/app/(dashboard)/chat/page.tsx:1`
- `/activity` — `apps/admin/src/app/(dashboard)/activity/page.tsx:1`

### Wallet app (`apps/wallet`)

- `/` — dashboard home: `apps/wallet/src/app/(dashboard)/page.tsx:1`
- `/assets` — `apps/wallet/src/app/(dashboard)/assets/page.tsx:1`
- `/chat` — `apps/wallet/src/app/(dashboard)/chat/page.tsx:1`
- `/deposit` — `apps/wallet/src/app/(dashboard)/deposit/page.tsx:1`
- `/exchange` — `apps/wallet/src/app/(dashboard)/exchange/page.tsx:1`
- `/exchange/:symbol` — `apps/wallet/src/app/(dashboard)/exchange/[symbol]/page.tsx:1`
- `/invest` — `apps/wallet/src/app/(dashboard)/invest/page.tsx:1`
- `/kyc` — `apps/wallet/src/app/(dashboard)/kyc/page.tsx:1`
- `/tokenization` — `apps/wallet/src/app/(dashboard)/tokenization/page.tsx:1`
- `/withdraw` — `apps/wallet/src/app/(dashboard)/withdraw/page.tsx:1`
- `/project/:id` — `apps/wallet/src/app/(dashboard)/project/[id]/page.tsx:1`
- `/project/:id/units` — `apps/wallet/src/app/(dashboard)/project/[id]/units/page.tsx:1`

## Plan

1. Add `@playwright/test` and Playwright config as a workspace-level (or per-app) dev dependency.
2. Create a Playwright config (`playwright.config.ts`) with two projects — one for `admin` (baseURL `http://localhost:8001`) and one for `wallet` (baseURL `http://localhost:<wallet-port>`).
3. Add a `tests/` folder at the workspace root (or per-app) containing spec files such as:
   - `tests/admin.spec.ts` — visits each admin route above and asserts the page loads with no console/page errors.
   - `tests/wallet.spec.ts` — visits each wallet route above (using placeholder ids/symbols like `1` / `BTC`) and asserts the page loads with no console/page errors.
4. Each spec should:
   - Listen for `pageerror` and `console` errors and fail the test if any are emitted.
   - Wait for `networkidle` and assert a body element is visible.
   - For protected pages (wallet dashboard layout enforces auth at `apps/wallet/src/app/(dashboard)/layout.tsx:10`), provide a stub login or skip with a clear note if auth mocking is not in scope.
5. Wire up `pnpm test` (via `turbo run test`) or a dedicated `e2e` script so the suite runs against the dev servers.

## Acceptance criteria

- A new runner can `pnpm exec playwright test` and visit every route above without throwing page or console errors.
- Tests fail (with a readable error) when a route renders an exception or a non-2xx response.