# Plan: Implement `@repo/fireblocks-mock`

Task: `/Users/facundofierro/git/realinvest/.agelum/work/tasks/pending/10 Implement @repo-fireblocks-mock package (8).md`

## Certainty assessment

**Level: Medium-High**

The package boundary, provider contract, and most of the implementation shape are clear. The repo already contains the provider-agnostic custody port in `packages/providers-custody/src/port.ts:3-28`, the associated domain types in `packages/providers-custody/src/types.ts:1-21`, the reusable conformance suite in `packages/providers-custody/src/conformance/index.ts:5-105`, and an in-memory reference adapter in `packages/providers-custody/src/testing/in-memory-provider.ts:29-82`. The custody package README explicitly says the Fireblocks-flavored, database-persisted mock belongs in a separate `@repo/fireblocks-mock` package rather than inside `packages/providers-custody` (`packages/providers-custody/README.md:18-33`). The broader project docs confirm Fireblocks is the chosen simulated custody direction (`.agelum/doc/docs/plan/status-2026-sep.md:69-76`).

The main delivery risk is the amount of additive work, not uncertainty about direction. The current database schema is user-wallet oriented, with `balances` keyed by `(userId, currencyCode)` and `transactions` keyed by `userId`, which does not naturally represent vault accounts, enabled assets, deposit addresses, transfer destinations, idempotency keys, transfer lifecycle timestamps, or custody admin state (`packages/db/src/schema.ts:192-228`). That gap is now resolved at the planning level by using new custody-specific tables in `@repo/db`, which keeps the implementation path coherent but still leaves a fair amount of schema, lifecycle, and adapter code to build.

## Ambiguity assessment

**Level: Low**

The only meaningful open decision was the persistence model inside `@repo/db`, and that is now resolved: use new custody-specific tables as the Fireblocks mock source of truth, while treating the existing app-facing `balances` and `transactions` tables as projections or later read models. With that choice made, the package location, provider surface, lifecycle behavior, and required schema direction are all clear enough to implement directly from the steps below.

## Current state and constraints

- The task explicitly requires a new Fireblocks-style mock package with persistent vault accounts, balances, transfers, deposit addresses, deterministic latency/failure controls, and conformance-suite compliance (`.agelum/work/tasks/pending/10 Implement @repo-fireblocks-mock package (8).md:15-27`).
- The custody port surface is already defined and broader than the task summary alone: besides vaults, balances, deposit addresses, and transfers, the provider must also support ramp requests plus eligibility, freeze, pause, mint, and burn operations (`packages/providers-custody/src/port.ts:3-28`, `packages/providers-custody/src/types.ts:12-21`).
- The conformance suite currently asserts vault creation, asset enabling, deposit-address creation, transfer idempotency and lifecycle completion, ramp creation/settlement, and token-administration behavior (`packages/providers-custody/src/conformance/index.ts:23-104`). The mock package must satisfy this contract rather than a narrower Fireblocks-only subset.
- The in-memory reference implementation already shows the business rules and validation order the DB-backed adapter should preserve: enabled assets gate balances/addresses, transfers are idempotent, transfers start `SUBMITTED`, pending operations are settled later, and pause/freeze/eligibility constraints block movement (`packages/providers-custody/src/testing/in-memory-provider.ts:37-82`).
- `@repo/db` currently exposes a `createDb()` factory and shared schema package entrypoint, so a new mock package can depend on `Db` and schema exports without reaching into app code (`packages/db/src/index.ts:1-3`, `packages/db/src/client.ts:5-11`).
- The existing KYC mock provides a useful local pattern for a deterministic, DB-backed provider that resolves time-based state lazily on reads instead of relying on a background worker (`packages/providers-kyc/src/mock/mock-kyc-provider.ts:7-89`, `packages/providers-kyc/README.md:15-27`).
- Wallet deposit and withdraw routes are still stubbed and app-facing today: deposit returns a hard-coded address, wallet balances read only the user-level `balances` table, and withdrawals merely insert a `transactions` row (`apps/wallet/src/app/api/wallet/deposit/route.ts:8-14`, `apps/wallet/src/lib/api/wallet.ts:7-12`, `apps/wallet/src/lib/api/withdraw.ts:5-11`, `apps/wallet/src/lib/api-client.ts:145-230`). That means this task can stay package-scoped, but it should avoid painting future wallet wiring into a corner.
- Fireblocks research emphasizes vault accounts, pseudonymous `customerRefId`, backend-owned transfer orchestration, idempotency, status progression, and persisted internal state machines rather than browser-originated blockchain actions (`.agelum/doc/docs/research/providers/fireblocks.md:67-96`, `.agelum/doc/docs/research/providers/fireblocks.md:101-121`, `.agelum/doc/docs/research/providers/fireblocks.md:149-151`).
- One task reference is stale: the task points at `.agelum/doc/docs/research/providers/fireblocks-operations-architecture.visual-check.json`, but the actual current diagram artifact is under `.agelum/diagrams/fireblocks-operations-architecture.visual-check.json:1-22`. The implementation plan should follow the present repo paths, not the stale task pointer.

## Likely gaps / root causes behind the missing package

1. The custody abstraction was created first, but only the in-memory reference adapter exists today; there is no persistent adapter yet (`packages/providers-custody/src/testing/in-memory-provider.ts:29-82`).
2. The database schema was built for wallet UI state, not custody-provider internals, so key concepts required by the port have nowhere to persist yet (`packages/db/src/schema.ts:192-228`).
3. The current wallet API still uses hard-coded deposit behavior and simplified transaction recording, which means no real custody provider has been wired end-to-end yet (`apps/wallet/src/app/api/wallet/deposit/route.ts:8-14`, `apps/wallet/src/lib/api/withdraw.ts:5-11`).

## Recommended implementation approach

Create a standalone `packages/fireblocks-mock` workspace package named `@repo/fireblocks-mock`. Keep `packages/providers-custody` provider-agnostic and unchanged except for any tiny export or documentation touch-ups that are truly needed. Persist custody-native state inside `@repo/db` with new tables designed around vault accounts and lifecycle-bearing operations, and treat the existing wallet `balances` and `transactions` tables as downstream app projections rather than as the provider’s source of truth.

## Phase 1 — Scaffold the new package

1. Create `packages/fireblocks-mock/package.json` as a workspace package with:
   - name `@repo/fireblocks-mock`
   - runtime deps on `@repo/db`, `@repo/providers-custody`, and `drizzle-orm` only if needed directly by the adapter
   - standard scripts matching sibling packages (`lint`, `check-types`)
   - exports for the main factory and any explicitly supported test helpers
   Related references:
   - `packages/providers-custody/package.json:1-21`
   - `packages/providers-kyc/package.json` style can be reused as the closest sibling pattern
   - `pnpm-workspace.yaml:1-2`

2. Add package scaffolding files:
   - `packages/fireblocks-mock/tsconfig.json`
   - `packages/fireblocks-mock/eslint.config.mjs`
   - `packages/fireblocks-mock/README.md`
   - `packages/fireblocks-mock/src/index.ts`

3. Keep the public API small and factory-based. The main entry should look conceptually like:
   - `createFireblocksMock(db: Db, options?: FireblocksMockOptions): CustodyProvider`
   - optionally `createFireblocksMockWithControls(...)` if deterministic demo/test controls need an explicit side channel

## Phase 2 — Extend `@repo/db` for custody-native persistence

1. Add new schema tables in `packages/db/src/schema.ts` for the provider’s source-of-truth state. At minimum the schema needs persisted representations for:
   - vault accounts
   - enabled assets per vault account
   - balances per `(vaultAccountId, assetId)`
   - deposit addresses per `(vaultAccountId, assetId)`
   - transfers with destination details, idempotency key, failure reason, current status, and timestamps
   - ramp requests with direction, fiat amounts, asset amounts, idempotency key, and timestamps
   - eligibility state per `(vaultAccountId, assetId)`
   - freeze state per `(vaultAccountId, assetId)`
   - pause state per `assetId`
   - optional lifecycle scheduling metadata such as `nextStatusAt`, `completeAfterMs`, or persisted simulation directives
   Related constraints come from:
   - `packages/providers-custody/src/types.ts:3-21`
   - `packages/providers-custody/src/testing/in-memory-provider.ts:31-35`
   - `.agelum/doc/docs/research/providers/fireblocks.md:67-96`

2. Prefer additive custody-specific tables rather than overloading the existing app tables. This is the confirmed direction:
   - current `balances` table is keyed by `(userId, currencyCode)` and only stores available/locked numeric values (`packages/db/src/schema.ts:192-200`)
   - current `transactions` table stores app transaction summaries rather than custody-transfer internals (`packages/db/src/schema.ts:217-228`)
   - neither table stores vault account IDs, deposit addresses, transfer destinations, idempotency keys, or lifecycle timestamps

3. Export the new tables and inferred row types from:
   - `packages/db/src/schema.ts`
   - `packages/db/src/types.ts`
   - `packages/db/src/index.ts`

4. Generate and commit a new Drizzle migration under `packages/db/drizzle/` plus `meta/_journal.json`, following the existing migration workflow described in `packages/db/README.md:36-53`.

## Phase 3 — Design the adapter internals around persisted lifecycle state

1. Implement the adapter in a dedicated module tree, for example:
   - `packages/fireblocks-mock/src/fireblocks-mock-provider.ts`
   - `packages/fireblocks-mock/src/repository.ts`
   - `packages/fireblocks-mock/src/lifecycle.ts`
   - `packages/fireblocks-mock/src/controls.ts`
   - `packages/fireblocks-mock/src/mappers.ts`

2. Separate three concerns clearly:
   - repository layer: reads/writes Drizzle rows
   - domain rules: validations, balance math, idempotency handling, transfer/ramp state transitions
   - control layer: deterministic delays, forced failures, clock injection, and optional manual settling

3. Reuse the in-memory provider’s business invariants as the behavioral baseline:
   - `requireVault` / `requireAsset` semantics (`packages/providers-custody/src/testing/in-memory-provider.ts:37-38`)
   - active-state checks for pauses, freezes, and eligibility (`packages/providers-custody/src/testing/in-memory-provider.ts:39-43`)
   - idempotent transfer/ramp creation keyed by `idempotencyKey` (`packages/providers-custody/src/testing/in-memory-provider.ts:63-69`, `73-75`)
   - positive amount checks and insufficient-balance checks (`packages/providers-custody/src/testing/in-memory-provider.ts:66-68`, `80`)

4. Keep all amount arithmetic string-safe. Do not route custody calculations through floating `real(...)` columns without controlled conversion. The in-memory reference adapter already includes decimal-string helpers that can either be reused or ported into a shared internal utility (`packages/providers-custody/src/testing/in-memory-provider.ts:10-27`).

## Phase 4 — Implement deterministic simulation controls

1. Model controls as explicit options, for example:
   - `now?: () => Date`
   - `transferConfirmingDelayMs?: number`
   - `transferCompletionDelayMs?: number`
   - `rampCompletionDelayMs?: number`
   - `failureMode?: "none" | "next-transfer" | "all-transfers" | ...`
   - `forcedTransferOutcomes?: Record<string, "FAILED" | "COMPLETED">`
   - `forcedRampOutcomes?: Record<string, "FAILED" | "COMPLETED">`

2. Persist lifecycle scheduling data instead of relying on in-memory timers. A restart-safe mock should resolve pending state by reading persisted timestamps and due outcomes, then advancing operations when any read/write entrypoint touches them. The KYC mock shows the same lazy-resolution pattern on reads (`packages/providers-kyc/src/mock/mock-kyc-provider.ts:33-50`).

3. Use a two-step transfer lifecycle that matches the task wording:
   - creation writes `SUBMITTED`
   - first due transition moves to `CONFIRMING`
   - second due transition moves to `COMPLETED` or `FAILED`
   Store both the current status and the due-at timestamps so behavior is deterministic across process restarts.

4. Do the same for ramp requests if the implementation chooses to expose intermediate states beyond `PENDING` and `COMPLETED`. The port permits `FUNDS_RECEIVED` and `PROCESSING` states (`packages/providers-custody/src/types.ts:12-15`), so the DB shape should allow that richer progression even if the first cut keeps ramp simulation simpler than transfers.

## Phase 5 — Implement the `CustodyProvider` methods against the DB

1. Vault accounts:
   - `createVaultAccount`
   - `getVaultAccount`
   - `listVaultAccounts`
   Persist pseudonymous `customerRefId` support, matching Fireblocks research guidance (`.agelum/doc/docs/research/providers/fireblocks.md:69-70`).

2. Asset enablement and balances:
   - `enableAsset`
   - `listEnabledAssets`
   - `getBalance`
   - `listBalances`
   Initialize enabled assets at zero balance and default admin states, consistent with the port contract and in-memory baseline (`packages/providers-custody/README.md:9-16`, `packages/providers-custody/src/testing/in-memory-provider.ts:56-59`).

3. Deposit addresses:
   - `createDepositAddress`
   - `listDepositAddresses`
   Generate deterministic-but-unique mock addresses and store them per vault/asset. The task explicitly requires persistence across restarts (`.agelum/work/tasks/pending/10 Implement @repo-fireblocks-mock package (8).md:15-27`).

4. Transfers:
   - `createTransfer`
   - `getTransfer`
   - `listTransfers`
   On create, validate source/destination state, enforce idempotency, persist the transfer row, and stage lifecycle metadata. On reads/list calls, resolve any due transitions before returning data.

5. Ramp requests:
   - `createRampRequest`
   - `getRampRequest`
   - `listRampRequests`
   Even though the task description emphasizes transfers more than ramps, conformance requires ramp support (`packages/providers-custody/src/conformance/index.ts:69-84`).

6. Token-administration methods:
   - `grantEligibility` / `revokeEligibility` / `getEligibility`
   - `freezeAccount` / `unfreezeAccount`
   - `pauseAsset` / `unpauseAsset`
   - `mintAsset` / `burnAsset`
   These are part of the current port and conformance suite, so the Fireblocks mock is incomplete without them (`packages/providers-custody/src/port.ts:19-27`, `packages/providers-custody/src/conformance/index.ts:86-104`).

## Phase 6 — Decide how app-facing wallet summaries stay consistent

1. Keep the custody tables as source of truth, then choose one of these projection strategies:
   - synchronous projection: every custody mutation also updates app-facing `balances` / `transactions`
   - read-model projection: wallet routes later query custody tables directly or through a mapper

2. The cleaner long-term path is to avoid coupling the provider to current wallet UI tables too tightly, because:
   - wallet balances today are user-level, not vault-level (`apps/wallet/src/lib/api/wallet.ts:7-12`)
   - deposit returns a hard-coded address and withdraw only inserts a summary row, so wallet integration is not yet stable enough to define provider storage (`apps/wallet/src/app/api/wallet/deposit/route.ts:8-14`, `apps/wallet/src/lib/api/withdraw.ts:5-11`)

3. If the human wants immediate compatibility with existing wallet routes, add a small mapper layer that can derive or synchronize the user-level summaries from custody state without flattening the custody schema itself.

## Phase 7 — Confirm integration touchpoints

1. The stale Ripio mock script and environment configuration were removed in task 12; do not reintroduce a provider-specific root script or sample-data override while scaffolding this package.
2. Add a Fireblocks-oriented root development script only if the committed package actually exposes a dev server.
3. Update documentation only for real package behavior and supported configuration.

## Phase 8 — Document the package for downstream implementers

1. In `packages/fireblocks-mock/README.md`, document:
   - package purpose and relation to `@repo/providers-custody`
   - required DB migrations
   - factory usage
   - deterministic simulation options
   - persistence model and restart behavior
   - what is intentionally Fireblocks-flavored versus what stays generic because of the custody port boundary

2. Cross-reference the port package README so future maintainers understand the split:
   - `packages/providers-custody/README.md:18-33`

## File-by-file implementation checklist

- `packages/fireblocks-mock/package.json` — new workspace package manifest
- `packages/fireblocks-mock/tsconfig.json` — TS config
- `packages/fireblocks-mock/eslint.config.mjs` — lint config
- `packages/fireblocks-mock/src/index.ts` — public exports
- `packages/fireblocks-mock/src/*` — provider implementation, repositories, lifecycle helpers, mappers, controls
- `packages/fireblocks-mock/README.md` — package documentation
- `packages/db/src/schema.ts` — add custody-native tables
- `packages/db/src/types.ts` — export new inferred row types
- `packages/db/src/index.ts` — re-export schema/types as needed
- `packages/db/drizzle/*.sql` and `packages/db/drizzle/meta/_journal.json` — append migration history

## Suggested order of work

1. Scaffold `packages/fireblocks-mock`.
2. Add custody-native DB tables and migration.
3. Implement repository and lifecycle helpers.
4. Implement all `CustodyProvider` methods against the DB.
5. Add deterministic simulation controls and wire them into persisted lifecycle resolution.
6. Update package documentation for the implemented behavior.
