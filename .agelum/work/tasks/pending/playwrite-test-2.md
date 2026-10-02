---
created: 2026-10-02T19:00:00.000Z
plan: .agelum/work/plans/2026-10-02-playwrite-test-2-1790965585223.md
status: planned
summary: .agelum/work/summaries/2026-10-02-playwrite-test-2-1790972692060.md
type: task
workflowStatus: pending
---

# playwright e2e use-case tests

Previous task (`tasks/done/playwrite-test.md`) added route smoke tests to `apps/e2e` (page renders, no console/page errors, `E2E_AUTH_BYPASS=1` credentials login). This task goes further: full e2e coverage of **all user use cases**, happy paths and error paths, with **all external provider integrations mocked/intercepted** so the suite is deterministic and offline.

## Research findings (what the integrations actually are)

There are no live third-party SDKs in the repo. The "external providers" are:

1. **Custody (Fireblocks)** — already an in-repo deterministic mock wired as the app singleton: `apps/wallet/src/lib/custody.ts:8` → `@repo/fireblocks-mock` (`packages/fireblocks-mock/src/fireblocks-mock-provider.ts`). Deterministic timing: transfers SUBMITTED → CONFIRMING @1s → COMPLETED/FAILED @2s; ramp requests complete @2s; supports forced outcomes by idempotency key (`transferOutcomes`).
2. **KYC** — already an in-repo deterministic mock: `apps/wallet/src/lib/kyc.ts:6` → `@repo/providers-kyc` mock. Decision rules by uploaded filename (`packages/providers-kyc/src/mock/rules.ts:9-52`): `/approve/i` → instant approved; `/pep|sanction/i` or `/reject/i` → instant rejected; otherwise pending, auto-approved after 15s.
3. **Google OAuth (Auth.js)** — bypassed by the existing `E2E_AUTH_BYPASS=1` credentials provider signing in `demo-user` (`apps/wallet/src/auth.ts:15-58`, `apps/e2e/global-setup.ts`).
4. **Client-side third-party hosts** (must be intercepted with Playwright `page.route`): `https://api.qrserver.com/v1/create-qr-code/` (`apps/wallet/src/components/pages/deposit-page.tsx:22`), `images.unsplash.com`, `grainy-gradients.vercel.app/noise.svg`, `github.com/shadcn.png`.
5. **DB** — seeded SQLite via `pnpm db:seed` (`packages/db/src/seed.ts`): `demo-user` (kycStatus `none`), 3 projects, 80 units on `torre-libertador-8000` (21 available+tokenized, e.g. `torre-libertador-8000-3c`), market tokens (e.g. `VEX-ALAMOS-B3-522`), 3 holdings, 3 positions, USDT balance seeded at 0 (deposit simulation is the funding path). Market-maker with 10M USDT auto-seeds on first orderbook/trade hit, so exchange always has liquidity.

## Scope: use cases to cover

### Wallet app (`apps/wallet`, baseURL http://localhost:47310)

**Auth & session**
- Unauthenticated visit to a dashboard route redirects to `/login`.
- Session/account overlay: shows name/email/KYC status and status-specific CTA (`apps/wallet/src/components/account-overlay.tsx`); logout returns to `/login`.

**KYC onboarding (`/kyc`)** — wizard at `apps/wallet/src/components/kyc/kyc-wizard.tsx`
- Happy path: complete the 5 steps (identity, 4 document uploads incl. a file named `approve.png`, beneficial owners, PEP/sanctions no, review) → instant **approved** status screen; session `kycStatus` updates (banner on dashboard disappears).
- Rejection path: submit with PEP=yes (or `reject`-named file) → **rejected** with reason, "Reintentar" returns to wizard.
- Pending path: neutral filenames → pending screen (3s polling) → auto-approved after 15s.
- Blocked gates pre-approval: visiting `/deposit` shows `KycBlockedDialog` (403 `kyc_required`, `apps/wallet/src/app/api/wallet/deposit/route.ts:9-25`); withdraw/trade/assets invest guards (`apps/wallet/src/hooks/use-kyc-gate.ts`).

**Deposit (`/deposit`)** — KYC approved
- Address + network shown; QR image served by the intercepted `api.qrserver.com` stub (assert request was intercepted, not real network).
- Copy button works.
- "Simular depósito de 100 USDT" → success toast, PENDING txn → custody ramp completes @~2s → balance reflects +100 USDT on dashboard/assets (settlement is lazy via `syncPendingCustodyState` on reads — poll, don't sleep blindly).

**Withdraw (`/withdraw`)**
- Validation errors: invalid TRC20 address message; insufficient balance incl. the 1 USDT fee message (`apps/wallet/src/components/pages/withdraw-page.tsx:29-42`).
- Happy path (after deposit): confirm dialog → txn status chip pendiente → confirmando → completado (~2s custody timing).
- KYC-blocked dialog for non-approved user.

**Exchange (`/exchange`, `/exchange/[symbol]`)**
- Token list renders from seeded market tokens; tabs Mercado/Favoritos/Posiciones (incl. empty-favorites state); sorting and timeframe switches.
- Token detail (`VEX-ALAMOS-B3-522`): chart, orderbook stats, best bid/ask; "Token not found" error state for an unknown symbol.
- **Market BUY**: open trade dialog, amount, fill simulation, confirm → position FILLED, holdings/balance updated.
- **LIMIT order**: rests as OPEN position → visible under Posiciones → "Cerrar orden" cancels it (`POST /api/wallet/positions/[id]/cancel`).
- Error paths: SELL without holdings → insufficient-holdings error; amount ≤ 0 disables confirm; insufficient USDT error.
- Positions summary and order-details overlay (Apertura/Orden/Mercado prices) render from seeded positions.

**Invest & primary-market purchase**
- `/invest`: category filters (Todos/Lanzamientos/En obra/Completados) change the list; card links to project.
- Project detail: tabs Etapas/Invertir/Proyecto, stories strip, purchase-option carousel.
- Units page: filters (Propiedad Completa/Tokens Lanzamiento/Renta Fija), unit status badges (Disponible/Vendido/Próximamente/Bloqueado), sold-out disabled.
- **Tokenized purchase happy path** (funded user): unit `torre-libertador-8000-3c` → INVERTIR → stepper → review → processing → success ("Compra completada"), holdings updated.
- Purchase guards: exceeding remaining tokens; insufficient USDT balance; non-tokenized unit shows "Contactar Asesor" form; KYC-blocked gate.
- Note: existing `test.fixme` for `/project/:id/units` (React setState-in-render warning, `apps/e2e/wallet.spec.ts:26-28`) — either fix the app bug or keep the page usable under interaction tests.

**Assets (`/assets`)**
- Portfolio totals and per-token cards from seeded holdings; token tap opens details; inline INVERTIR buy/sell dialog (KYC-gated) submits an order.

**Chat (`/chat`) and Tokenization (`/tokenization`)**
- Chat: send a message, it appends (mock assistant, no backend).
- Tokenization: static page interactions (rotating hero, steps, CTA buttons render).

**Navigation shell**
- Desktop: `/invest` and `/exchange` nav links open the "Disponible en marzo de 2026" launch-notice dialog (`apps/wallet/src/components/nav/nav-items.ts:29-33`); other links navigate.
- Mobile bottom nav already covered by smoke tests; extend only if gaps.

### Admin app (`apps/admin`, baseURL http://localhost:47311, no auth)

- Dashboard: stat cards and Top-5 table render from seeded data.
- Properties: **create** property via `PropertyFormDialog` (required fields, status select) → appears in table; **edit** an existing property → changes persist; empty-state and skeleton states.
- Activity: type/status filters narrow the table; "Limpiar" resets.
- Chat (mock): select conversation, send message appends locally.

## Infrastructure work

1. **Third-party host interception**: helper that `page.route`s `api.qrserver.com` (serve a tiny local PNG/SVG), `images.unsplash.com`, `grainy-gradients.vercel.app`, `github.com/shadcn.png`. Assert no other cross-origin requests escape (fail on unhandled external host requests).
2. **Flow helpers** in `apps/e2e/helpers/`: `approveKyc(page)` (upload `approve.png`, submit wizard, wait for approved session), `fundWallet(page)` (deposit + poll until balance settled), `waitForCustodySettlement` (poll UI/API with timeout > mock delays, no fixed sleeps).
3. **State isolation strategy** (decision for the plan): flows mutate the shared seeded DB (`demo-user` KYC status, balances, positions). Options: re-seed (`pnpm db:seed`) in global setup or between serial describe blocks; single authenticated journey spec ordered KYC → deposit → withdraw → invest → exchange; or a per-run reset script. Must keep the suite deterministic across repeated runs.
4. **Forced-failure coverage**: custody mock supports forced transfer outcomes only at construction time; to e2e a FAILED withdrawal/deposit settlement we may need a dev-only test hook (env-gated route or direct DB tweak) — decide in the plan whether to add one or cover FAILED only at API level.
5. **Spec organization**: domain specs (`kyc.spec.ts`, `deposit-withdraw.spec.ts`, `exchange.spec.ts`, `invest-purchase.spec.ts`, `admin-crud.spec.ts`, …) alongside the existing smoke specs; adjust `testMatch` in `apps/e2e/playwright.config.ts` accordingly. Keep `workers: 1` or serialize mutating suites.
6. **Google OAuth is out of scope** (already bypassed by `E2E_AUTH_BYPASS`); native auth endpoints (`/api/auth/native/*`) are out of scope for this task.

## Acceptance criteria

- Every use case listed above has a Playwright test covering happy path, and the listed error/guard paths.
- No test performs a real network request to a third-party host (qrserver/unsplash/etc. intercepted; a test asserts the interception).
- All provider-driven waits (custody @2s, KYC @15s, pending polling) are handled by polling assertions, not fixed sleeps — suite passes repeatedly (min. 3 consecutive runs) against a seeded DB with a single command (`pnpm e2e`).
- KYC-gated flows are tested both as blocked (non-approved) and allowed (approved) users.
- The existing smoke specs keep passing; the `/deposit` fixme is superseded by the real KYC-blocked + approved deposit tests.
- `apps/e2e/README.md` documents the new helpers, isolation strategy, and how to run the full suite.