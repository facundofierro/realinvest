# Plan: USDT on/off-ramp simulated flows

Task: `/Users/facundofierro/git/realinvest/.agelum/work/tasks/pending/11 USDT on-off-ramp simulated flows (5).md`

## Certainty assessment

**Level: Medium-High**

The wallet-side scope is well located. The current Deposit and Withdraw screens, their API routes, the read models that drive balances and history, the existing KYC gate, and the custody-provider boundary are all present and readable: deposit is a hard-coded address behind a KYC-gated `GET /api/wallet/deposit` (`apps/wallet/src/components/pages/deposit-page.tsx:20-87`, `apps/wallet/src/app/api/wallet/deposit/route.ts:8-13`), withdraw is a minimal form that posts directly to a transaction insert with no fee model, confirmation step, or lifecycle handling (`apps/wallet/src/components/pages/withdraw-page.tsx:14-60`, `apps/wallet/src/app/api/wallet/withdraw/route.ts:10-19`, `apps/wallet/src/lib/api/withdraw.ts:5-11`), and the rest of the app still renders wallet state from the app-level `balances` and `transactions` tables (`apps/wallet/src/lib/api/wallet.ts:7-12`, `apps/wallet/src/lib/api/transactions.ts:7-16`, `apps/wallet/src/components/pages/dashboard-page.tsx:63-75,190-240`, `apps/wallet/src/components/pages/exchange-page.tsx:278-296,521-589`).

The main reason this is not `High` is that the upstream custody adapter this task should integrate with is only planned, not yet present: the provider port exists (`packages/providers-custody/src/port.ts:3-28`, `packages/providers-custody/src/types.ts:3-21`), but `@repo/fireblocks-mock` does not yet exist in the workspace, and task 10 is the planned place for that implementation (`.agelum/work/tasks/pending/10 Implement @repo-fireblocks-mock package (8).md:17-33`). That means the wallet flow plan can be precise about the integration seam and projection strategy, but the exact calls used to simulate inbound deposits and transfer lifecycle progression depend on how task 10 exposes its mock controls.

## Ambiguity assessment

**Level: Low**

The architectural direction is clear, and the only user-visible product decisions that could have changed the route/UI shape have now been resolved with the human. There is no remaining ambiguity large enough to block implementation planning.

### Resolved decisions

1. **Deposit simulation trigger**: show a visible `Simular deposito` button on the Deposit screen.
2. **Withdrawal fee model**: use a flat `1 USDT` fee in the mock flow.
3. **Withdrawal balance timing**: deduct/reserve available USDT immediately on submission, while the transfer/transaction status progresses asynchronously.

## Current state and implementation constraints

- The task itself requires both wallet screens to become functional, KYC-gated, and transaction-backed (`.agelum/work/tasks/pending/11 USDT on-off-ramp simulated flows (5).md:18-34`).
- The repo-wide alpha plan already places deposit/withdraw/balance flows on top of the simulated Fireblocks mock, not bespoke wallet-only logic (`.agelum/doc/docs/plan/status-2026-sep.md:71-75,112-117`).
- The custody port already models the concepts this task needs:
  - deposit addresses via `createDepositAddress` / `listDepositAddresses` (`packages/providers-custody/src/port.ts:11-12`, `packages/providers-custody/src/types.ts:6`)
  - external withdrawals via `createTransfer` to `ONE_TIME_ADDRESS` with lifecycle statuses `SUBMITTED | CONFIRMING | COMPLETED | FAILED` (`packages/providers-custody/src/port.ts:13-15`, `packages/providers-custody/src/types.ts:7-11`)
  - fiat/stablecoin ramp requests via `createRampRequest` (`packages/providers-custody/src/port.ts:16-18`, `packages/providers-custody/src/types.ts:12-15`)
  - typed failure modes such as insufficient balance and disabled assets (`packages/providers-custody/src/errors.ts:1-17`)
- The in-memory reference adapter shows the intended behavioral baseline for transfers and simulated settlement: idempotency, balance checks, and lazy settlement hooks (`packages/providers-custody/src/testing/in-memory-provider.ts:62-82`).
- The Fireblocks research explicitly says the browser must not originate blockchain actions directly, the backend should own the order/state machine, and `vaultAccountId` should never be exposed to the frontend (`.agelum/doc/docs/research/providers/fireblocks.md:132-145,149-151,311-326`).
- The current wallet read model is still app-level:
  - balances are read only from `balances(userId, currencyCode)` (`packages/db/src/schema.ts:192-200`, `apps/wallet/src/lib/api/wallet.ts:7-12`)
  - transactions are read only from `transactions(userId, ...)` (`packages/db/src/schema.ts:217-228`, `apps/wallet/src/lib/api/transactions.ts:7-16`)
  - dashboard and exchange history UIs already depend on those tables, so this task should keep them current even if custody-native tables become the source of truth underneath (`apps/wallet/src/components/pages/dashboard-page.tsx:63-75,190-240`, `apps/wallet/src/components/pages/exchange-page.tsx:278-296,521-589`)
- There is a pre-existing auth inconsistency to avoid copying:
  - API routes authenticate with `requireUser()` and support both session auth and native bearer tokens (`apps/wallet/src/lib/api-auth.ts:10-22`)
  - lower-level wallet helpers like `getCurrentUserId()` only read the web session (`apps/wallet/src/lib/current-user.ts:10-17`)
  - both `createPosition()` and `createWithdrawal()` currently rely on `getCurrentUserId()` internally (`apps/wallet/src/lib/api/positions.ts:31-41`, `apps/wallet/src/lib/api/withdraw.ts:5-11`)
  - for new custody orchestration helpers, pass `userId` from the route layer or introduce a route-safe helper rather than depending on session-only lookups.

## Likely root causes of the missing behavior

1. The wallet deposit flow was only partially upgraded during the KYC-gating task: the route now enforces KYC, but it still returns a literal string address and no persisted custody state (`apps/wallet/src/app/api/wallet/deposit/route.ts:8-13`, `apps/wallet/src/components/pages/deposit-page.tsx:22-27`).
2. The withdraw flow was upgraded only to the minimum needed for KYC enforcement: it inserts a pending transaction row, but it does not validate against fees or post-fee balance, does not create a custody transfer, does not update balances, and does not progress transaction status (`apps/wallet/src/app/api/wallet/withdraw/route.ts:10-19`, `apps/wallet/src/lib/api/withdraw.ts:5-11`).
3. The app has no custody-provider accessor or user-to-vault-account mapping yet. By contrast, the KYC provider already has a singleton app-level accessor at `apps/wallet/src/lib/kyc.ts:1-7`.
4. The wallet UI still uses generic client errors for both flows, so it cannot distinguish KYC blocks, validation errors, insufficient funds, or custody lifecycle states (`apps/wallet/src/lib/api-client.ts:213-230`).
5. The current balance/history views are projections over app tables rather than live custody reads, so a custody-backed implementation must either synchronize those tables or replace the read model. Replacing the read model is broader than this task; synchronized projections are the smaller change.

## Recommended implementation approach

Implement this task as a wallet-side integration over the custody port, with app-level balance/transaction projections preserved for compatibility. In practice:

1. Add a wallet-local custody service accessor and user-vault bootstrap helper.
2. Expand the deposit route from "hard-coded address" into "resolve user vault + ensure USDT enabled + ensure deposit address exists + return QR payload".
3. Add a simulated inbound-deposit command path for the wallet, backed by the mock provider controls from task 10, and project the resulting custody event into `balances` + `transactions`.
4. Replace the direct withdrawal DB insert with a custody transfer orchestration path that validates amount + fee, creates a provider transfer to `ONE_TIME_ADDRESS`, records a `WITHDRAWAL` transaction, and updates the user balance projection.
5. Resolve pending custody operations lazily on wallet reads, following the same pattern the mock KYC provider uses for time-based state (`packages/providers-kyc/src/mock/mock-kyc-provider.ts:33-50`), so demo state progresses without a background worker.

This keeps the frontend/provider boundary clean, avoids exposing vault IDs to the client, and lets the existing dashboard/history UIs continue to work without a parallel read-model rewrite.

## Implementation phases

### Phase 1 — Add the wallet-side custody integration seam

1. Create a wallet-level custody accessor, mirroring the KYC pattern in `apps/wallet/src/lib/kyc.ts:1-7`.
   - Suggested file: `apps/wallet/src/lib/custody.ts`
   - Responsibility: instantiate and cache the mock custody provider once task 10 lands, likely from `@repo/fireblocks-mock`.
   - Keep the app code dependent on the provider interface, not on mock-only internals except where task-10 simulation controls must be invoked.

2. Create a wallet-level user-vault bootstrap/orchestration module.
   - Suggested file: `apps/wallet/src/lib/api/custody-wallet.ts`
   - Responsibilities:
     - resolve the authenticated user’s custody account using `customerRefId = userId` or the custody table added by task 10
     - lazily create the vault account if missing
     - ensure `USDT` is enabled on that vault (`packages/providers-custody/src/port.ts:7-10`)
     - lazily ensure at least one deposit address exists (`packages/providers-custody/src/port.ts:11-12`)
   - Pass `userId` into these helpers from the route layer rather than calling `getCurrentUserId()` internally, to preserve native-token compatibility (`apps/wallet/src/lib/api-auth.ts:10-22`, `apps/wallet/src/lib/current-user.ts:10-17`).

3. Define wallet-facing projection helpers in the same module or a sibling file.
   - Responsibilities:
     - upsert `balances.available` / `balances.locked` rows for `USDT` (`packages/db/src/schema.ts:192-200`)
     - insert or update `transactions` rows representing deposit/withdrawal lifecycle (`packages/db/src/schema.ts:217-228`)
     - store enough transaction metadata to reconnect history rows to custody records (`metadata.transferId`, `metadata.rampRequestId`, `metadata.destinationAddress`, `metadata.network`, etc.)

### Phase 2 — Replace the deposit stub with a custody-backed deposit screen

1. Expand `GET /api/wallet/deposit`.
   - Current stub: `apps/wallet/src/app/api/wallet/deposit/route.ts:8-13`
   - New responsibilities:
     - authenticate with `requireUser()`
     - keep the existing KYC gate (`apps/wallet/src/lib/kyc-guard.ts:7-17`)
     - resolve the user vault and deposit address through the new custody helpers
     - return a richer payload, e.g.:
       - `address`
       - `network`
       - `qrValue` or `qrPayload`
       - optionally `assetId` / `instructions`

2. Update the deposit client API and query hook to consume the richer response.
   - `apps/wallet/src/lib/api-client.ts:221-230`
   - `apps/wallet/src/hooks/use-queries.ts:158-160`
   - Keep the KYC-specific 403 parsing already in place, but add room for typed custody/validation errors if the route starts returning them.

3. Upgrade the deposit page UI from placeholder state to real display.
   - Current page: `apps/wallet/src/components/pages/deposit-page.tsx:20-87`
   - Replace the `QrCode` icon placeholder with a real QR rendering component or generated image value sourced from the API payload.
   - Wire the copy button to the actual address.
   - Show network/asset details from the server payload instead of embedding `"TRC20"` in multiple places.

4. Add the simulated inbound-deposit command path.
   - Recommended route: `POST /api/wallet/deposit`
   - Why same route: keeps deposit-address read and deposit-simulation mutation grouped under one domain endpoint.
   - Triggered by a visible `Simular deposito` CTA on the page.
   - Suggested request payload: either empty (if using a fixed demo amount) or `{ amount: number }` if the product should allow choosing a simulated amount.
   - Server responsibilities:
     - authenticate + KYC gate
     - resolve the user vault and deposit address
     - call the mock-provider simulation hook introduced by task 10 to enqueue an inbound USDT credit
     - create/update a `DEPOSIT` transaction row in `PENDING`
     - return the projected transaction snapshot for optimistic UI updates

5. Add lazy pending-resolution for inbound deposits.
   - Follow the KYC mock’s pattern of resolving due pending work on reads (`packages/providers-kyc/src/mock/mock-kyc-provider.ts:33-50`).
   - On reads such as `GET /api/wallet/deposit`, `GET /api/wallet/balances`, and `GET /api/transactions`, call a shared `syncPendingCustodyState(userId)` helper before reading projections.
   - On deposit completion:
     - mark the related custody record as confirmed/completed
     - increase `balances.available` for `USDT`
     - transition the matching `transactions` row from `PENDING` to `COMPLETED`

### Phase 3 — Replace the withdrawal stub with a custody-backed off-ramp flow

1. Introduce a dedicated withdrawal orchestration helper.
   - Replace the current direct insert in `apps/wallet/src/lib/api/withdraw.ts:5-11`
   - Responsibilities:
     - accept `userId`, `amount`, and `address`
     - apply the confirmed flat `1 USDT` fee server-side
     - validate requested amount, fee, and post-fee available balance against the user’s projected `USDT` balance
     - resolve the user vault and ensure `USDT` is enabled
     - call `createTransfer()` with destination `{ type: "ONE_TIME_ADDRESS", address }` (`packages/providers-custody/src/types.ts:7-11`)
     - insert a `WITHDRAWAL` transaction row in `PENDING`
     - deduct/reserve the total debit (`amount + 1 USDT fee`) from available balance immediately on submission

2. Expand the withdraw route’s validation and response shape.
   - Current route: `apps/wallet/src/app/api/wallet/withdraw/route.ts:10-19`
   - Replace the minimal schema with one that is explicit about:
     - `amount`
     - `address`
     - fee omitted from the client, since the server owns the flat `1 USDT` calculation
   - Return machine-readable errors for:
     - invalid amount/address
     - insufficient balance after fees
     - custody-port failures such as `ASSET_NOT_ENABLED` or `INSUFFICIENT_BALANCE` (`packages/providers-custody/src/errors.ts:1-17`)
   - Preserve the existing KYC 403 contract.

3. Upgrade the withdrawal client API and mutation handling.
   - Current client function: `apps/wallet/src/lib/api-client.ts:213-218`
   - Change it from a generic `"Failed to create withdrawal"` throw to structured error parsing, similar to `getDepositAddress()` (`apps/wallet/src/lib/api-client.ts:221-230`).
   - Update `useCreateWithdrawal()` in `apps/wallet/src/hooks/use-queries.ts:150-156` to invalidate both `["transactions"]` and `["wallet", "balances"]`, since this flow changes both.

4. Expand the withdraw page UI to cover the missing acceptance criteria.
   - Current page gaps: no fee display, no confirmation step, no field-level validation, no status UI (`apps/wallet/src/components/pages/withdraw-page.tsx:14-60`)
   - Add:
     - computed fee row
     - net amount / total debit summary
     - disabled submit state when amount/address is invalid or funds are insufficient
     - confirmation dialog/sheet before final submission
     - post-submit status card or banner showing `PENDING`, `CONFIRMING`, `COMPLETED`, or `FAILED`
   - Keep `useKycGate()` as the pre-submit UX gate (`apps/wallet/src/hooks/use-kyc-gate.ts:6-17`), while the route remains the authoritative guard.

5. Add lazy pending-resolution for outbound transfers.
   - The same shared `syncPendingCustodyState(userId)` helper should:
     - ask the provider for transfer status updates
     - project `PENDING`/`CONFIRMING`/`COMPLETED`/`FAILED` into the app `transactions` row
     - leave the balance reserved/deducted consistently with the confirmed strategy
   - This sync should run before `GET /api/wallet/balances` and `GET /api/transactions`, so history and totals converge automatically.

### Phase 4 — Keep the existing wallet read model consistent

1. Preserve `GET /api/wallet/balances` as the app’s compatibility endpoint.
   - Current route: `apps/wallet/src/app/api/wallet/balances/route.ts:8-11`
   - Current reader: `apps/wallet/src/lib/api/wallet.ts:7-12`
   - Add a pre-read sync step so the route first resolves pending custody operations for the current user, then returns the existing `balances` projection.

2. Preserve `GET /api/transactions` as the shared history feed.
   - Current route: `apps/wallet/src/app/api/transactions/route.ts:8-11`
   - Current reader: `apps/wallet/src/lib/api/transactions.ts:7-16`
   - Add the same pre-read sync step before reading the transaction rows.
   - Make sure deposit and withdrawal metadata are rich enough for current and future UI:
     - destination address for withdrawals
     - network
     - related custody transfer/ramp IDs
     - optional fee amount

3. Confirm the dashboard and exchange screens require no route-shape changes.
   - Dashboard recent activity already displays the latest three transactions (`apps/wallet/src/components/pages/dashboard-page.tsx:190-240`)
   - Exchange order details filter transactions by `metadata.positionId`; this task should not break that filter (`apps/wallet/src/components/pages/exchange-page.tsx:278-296`)
   - Deposit/withdraw transactions should simply start appearing in the same shared history list.

### Phase 5 — File-by-file implementation checklist

- `apps/wallet/src/lib/custody.ts` — new custody provider accessor for the app
- `apps/wallet/src/lib/api/custody-wallet.ts` — new user-vault bootstrap, projection, and pending-sync helpers
- `apps/wallet/src/app/api/wallet/deposit/route.ts` — replace hard-coded address with custody-backed `GET`; add deposit simulation `POST`
- `apps/wallet/src/app/api/wallet/withdraw/route.ts` — replace minimal route behavior with validation + custody transfer orchestration
- `apps/wallet/src/app/api/wallet/balances/route.ts` — sync pending custody state before reading projections
- `apps/wallet/src/app/api/transactions/route.ts` — sync pending custody state before returning history
- `apps/wallet/src/lib/api/withdraw.ts` — replace direct transaction insert with custody-backed withdrawal orchestration
- `apps/wallet/src/lib/api-client.ts` — richer deposit/withdraw client response and error parsing
- `apps/wallet/src/hooks/use-queries.ts` — add/adjust deposit simulation mutation; expand withdrawal invalidation to include balances
- `apps/wallet/src/components/pages/deposit-page.tsx` — real address/QR UI, copy interaction, and deposit simulation/status UX
- `apps/wallet/src/components/pages/withdraw-page.tsx` — fee display, validation, confirmation, and status UX
- `apps/wallet/src/lib/current-user.ts` or new helper near `api-auth.ts` — only if needed to eliminate session-only assumptions in lower-level helpers

## Suggested order of work

1. Land or confirm the task-10 custody provider implementation and its mock-control surface.
2. Add the app-level custody accessor and user-vault bootstrap helpers.
3. Convert the deposit route/page to real custody-backed address retrieval.
4. Add the simulated inbound deposit command and projection sync.
5. Convert withdrawal orchestration from direct DB insert to custody transfer + projection.
6. Add withdrawal UI affordances: fee, confirmation, status, and typed errors.
7. Add the shared pending-custody sync to balances and transactions routes so the rest of the wallet updates naturally.
