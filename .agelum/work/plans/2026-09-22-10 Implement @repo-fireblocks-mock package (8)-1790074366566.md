# Plan: Implement `@repo/fireblocks-mock`

Task: `/Users/facundofierro/git/realinvest/.agelum/work/tasks/pending/10 Implement @repo-fireblocks-mock package (8).md`

## Certainty assessment
**Level: Medium-High**

The repo already gives us most of the contract and package direction. The custody port, shared types, error model, and reusable conformance suite already exist in `packages/providers-custody/src/port.ts:3-28`, `packages/providers-custody/src/types.ts:3-21`, `packages/providers-custody/src/errors.ts:1-17`, and `packages/providers-custody/src/conformance/index.ts:5-105`. There is also a working in-memory reference adapter that captures the validation order and lifecycle baseline the DB-backed mock should preserve (`packages/providers-custody/src/testing/in-memory-provider.ts:29-82`). The custody README is explicit that the Fireblocks-flavored persistent mock belongs in a separate package rather than inside the generic port package (`packages/providers-custody/README.md:18-33`).

The remaining delivery risk is mostly implementation volume, not conceptual uncertainty. The task says state must persist in `@repo/db` and mentions balances/transactions, but the current app-facing `balances` and `transactions` tables are user-summary tables and do not naturally represent vault accounts, asset enablement, deposit addresses, idempotent custody transfers, or lifecycle scheduling (`packages/db/src/schema.ts:192-228`). That ambiguity has now been resolved in favor of new custody-native tables as source of truth, which makes the path coherent but still leaves a meaningful amount of schema, repository, and lifecycle work to build.

## Ambiguity assessment
**Level: Low**

The core implementation path is now clear. The remaining storage question has been resolved: use new custody-native tables in `@repo/db` as the Fireblocks mock source of truth, and do not add immediate projection into the existing wallet `balances` / `transactions` tables in this task. With that decision made, the package boundary, persistence direction, lifecycle approach, and cleanup scope are all specific enough to implement directly without guessing.

## Repo context and evidence

- The task requires a Fireblocks-oriented mock package with persisted vault accounts, wallets/deposit addresses, balances, transfers, lifecycle simulation, deterministic failure/latency controls, and README documentation (`.agelum/work/tasks/pending/10 Implement @repo-fireblocks-mock package (8).md:15-27`).
- Fireblocks is the chosen custody provider for this repo (`.agelum/doc/docs/plan/status-2026-sep.md:69-76`).
- The custody provider contract is broader than the task summary alone: besides vaults, balances, deposit addresses, and transfers, the implementation must also support ramp requests, eligibility, freeze/unfreeze, asset pause/unpause, and mint/burn (`packages/providers-custody/src/port.ts:3-28`, `packages/providers-custody/src/types.ts:12-21`).
- The conformance suite currently verifies vault lifecycle, asset enablement, deposit addresses, transfer idempotency, asynchronous settlement hooks, ramp support, and token-administration rules (`packages/providers-custody/src/conformance/index.ts:23-104`).
- The in-memory provider is the current behavioral reference and already encodes the validation order and default state model the DB-backed version should preserve (`packages/providers-custody/src/testing/in-memory-provider.ts:37-82`).
- `@repo/db` already exposes `Db` and schema exports that a new workspace package can depend on without reaching into app code (`packages/db/src/index.ts:1-3`, `packages/db/src/client.ts:5-11`).
- The KYC provider package shows the repo's preferred pattern for a deterministic DB-backed mock: a factory that depends on `Db`, stores provider state in dedicated tables, and resolves time-based transitions lazily on reads instead of relying on background timers (`packages/providers-kyc/src/mock/mock-kyc-provider.ts:7-89`, `packages/providers-kyc/README.md:15-25`).
- App-facing wallet flows are still simplified today: deposit returns a hard-coded address, wallet balances read the user-summary `balances` table, and withdraw just inserts a summary `transactions` row (`apps/wallet/src/app/api/wallet/deposit/route.ts:8-13`, `apps/wallet/src/lib/api/wallet.ts:7-12`, `apps/wallet/src/lib/api/withdraw.ts:5-11`, `apps/wallet/src/lib/api-client.ts:213-230`).
- Fireblocks research emphasizes backend-controlled orchestration, vault accounts, pseudonymous account references, idempotent commands, internal state machines, and webhook-style status updates rather than browser-originated blockchain actions (`.agelum/doc/docs/research/providers/fireblocks.md:79-96`, `.agelum/doc/docs/research/providers/fireblocks.md:121-151`).
- One task pointer is stale: the task references `.agelum/doc/docs/research/providers/fireblocks-operations-architecture.visual-check.json`, but the actual checked-in artifact is `.agelum/diagrams/fireblocks-operations-architecture.visual-check.json`.

## Possible root causes for the missing package

1. The generic custody abstraction was defined first, but only an in-memory reference adapter exists so far (`packages/providers-custody/src/testing/in-memory-provider.ts:29-82`).
2. The current DB schema was built around wallet UI summaries, not custody-provider internals, so core mock concepts still have nowhere natural to persist (`packages/db/src/schema.ts:192-261`).
3. Wallet deposit/withdraw behavior is still app-local and stubbed, so no provider-backed custody flow has been wired through yet (`apps/wallet/src/app/api/wallet/deposit/route.ts:8-13`, `apps/wallet/src/lib/api/withdraw.ts:5-11`).

## Recommended approach

Implement a new workspace package at `packages/fireblocks-mock` named `@repo/fireblocks-mock`, keeping `packages/providers-custody` provider-agnostic. Model the adapter as a Fireblocks-flavored implementation of the generic `CustodyProvider` port, backed by `@repo/db`, with persisted lifecycle metadata so transfer and ramp state can advance deterministically across process restarts. Reuse the in-memory provider's validation rules and the KYC package's lazy, DB-backed time-resolution pattern.

The provider's source of truth should live in new custody-native tables only. This task should not add immediate projection into the existing wallet `balances` / `transactions` tables; later wallet-integration work can read custody state directly or add a mapper/projection service when that integration task is tackled.

## Phase 1 - Create the workspace package

1. Add `packages/fireblocks-mock/package.json` for `@repo/fireblocks-mock`, following sibling package conventions from `packages/providers-custody/package.json:1-21`, `packages/providers-kyc/package.json:1-22`, and `packages/db/package.json:1-30`.
2. Add package scaffolding files:
   - `packages/fireblocks-mock/tsconfig.json`
   - `packages/fireblocks-mock/eslint.config.mjs`
   - `packages/fireblocks-mock/src/index.ts`
   - `packages/fireblocks-mock/README.md`
3. Keep the public API factory-based, centered on a package entry such as:
   - `createFireblocksMock(db: Db, options?: FireblocksMockOptions): CustodyProvider`
   - optionally a second export that exposes deterministic controls for demos and conformance harnesses.
4. Keep dependencies small: `@repo/db`, `@repo/providers-custody`, and `drizzle-orm` if repository code uses Drizzle helpers directly.

## Phase 2 - Extend `@repo/db` for custody persistence

1. Add custody-native tables to `packages/db/src/schema.ts` for at least:
   - vault accounts
   - enabled assets per vault
   - balances per `(vaultAccountId, assetId)`
   - deposit addresses
   - transfers with direction, destination details, idempotency key, status, failure reason, timestamps, and lifecycle scheduling metadata
   - ramp requests with direction, amounts, idempotency key, status, failure reason, timestamps, and scheduling metadata
   - eligibility state
   - freeze state
   - asset pause state
   - optional operation-control tables or columns for deterministic forced outcomes / delays
   Related contract sources: `packages/providers-custody/src/types.ts:3-21`, `packages/providers-custody/src/testing/in-memory-provider.ts:31-35`, `.agelum/doc/docs/research/providers/fireblocks.md:83-96`.
2. Do not try to squeeze vault-native concepts into the existing app `balances` and `transactions` tables without confirmation. Those tables are keyed by `userId` and represent wallet summaries, not custody source-of-truth entities (`packages/db/src/schema.ts:192-228`).
3. Export the new schema and inferred row types through:
   - `packages/db/src/schema.ts`
   - `packages/db/src/types.ts`
   - `packages/db/src/index.ts`
4. Add a new append-only Drizzle migration under `packages/db/drizzle/` and update `packages/db/drizzle/meta/_journal.json`, following the workflow documented in `packages/db/README.md:36-53`.

## Phase 3 - Build the adapter internals

1. Organize implementation modules under `packages/fireblocks-mock/src/`, for example:
   - `fireblocks-mock-provider.ts`
   - `repository.ts`
   - `lifecycle.ts`
   - `math.ts`
   - `controls.ts`
   - `mappers.ts`
2. Separate concerns clearly:
   - repository layer: Drizzle reads/writes and row mapping
   - domain rules: validation order, idempotency, state defaults, balance math
   - lifecycle layer: due-status advancement for transfers and ramps
   - controls layer: deterministic clocks, delays, and forced failures
3. Reuse the in-memory provider's behavioral baseline:
   - vault existence and asset enablement gates (`packages/providers-custody/src/testing/in-memory-provider.ts:37-38`)
   - pause/freeze/eligibility checks before movement (`packages/providers-custody/src/testing/in-memory-provider.ts:39-43`)
   - idempotent transfer/ramp creation (`packages/providers-custody/src/testing/in-memory-provider.ts:62-75`)
   - positive-amount and insufficient-balance checks (`packages/providers-custody/src/testing/in-memory-provider.ts:66-68`, `packages/providers-custody/src/testing/in-memory-provider.ts:79-80`)
4. Keep amount arithmetic decimal-string-safe instead of relying on `real(...)` math. The in-memory provider already contains reusable parsing/formatting helpers that can be copied or adapted into an internal utility (`packages/providers-custody/src/testing/in-memory-provider.ts:10-27`).

## Phase 4 - Implement deterministic simulation controls

1. Define explicit options on `FireblocksMockOptions`, for example:
   - `now?: () => Date`
   - `transferConfirmingDelayMs?: number`
   - `transferCompletionDelayMs?: number`
   - `rampCompletionDelayMs?: number`
   - `defaultTransferOutcome?: "COMPLETED" | "FAILED"`
   - `defaultRampOutcome?: "COMPLETED" | "FAILED"`
   - targeted overrides keyed by idempotency key or operation id if needed
2. Persist due-at timestamps and intended outcomes in the DB so lifecycle progression survives restarts.
3. Advance pending operations lazily whenever any read or write entrypoint touches them, following the same broad pattern used in `packages/providers-kyc/src/mock/mock-kyc-provider.ts:33-50`.
4. Model transfers with the required observable progression:
   - create as `SUBMITTED`
   - advance to `CONFIRMING`
   - finish as `COMPLETED` or `FAILED`
5. Keep ramp simulation compatible with the current port and conformance suite. Even if the first cut uses `PENDING -> COMPLETED/FAILED`, the schema should allow richer ramp statuses later because the type system already supports them (`packages/providers-custody/src/types.ts:12-15`).

## Phase 5 - Implement the full `CustodyProvider` surface

1. Vault accounts:
   - `createVaultAccount`
   - `getVaultAccount`
   - `listVaultAccounts`
   Include `customerRefId` because Fireblocks research calls for pseudonymous backend mapping rather than exposing raw business identifiers (`.agelum/doc/docs/research/providers/fireblocks.md:83-88`, `.agelum/doc/docs/research/providers/fireblocks.md:132-133`).
2. Asset enablement and balances:
   - `enableAsset`
   - `listEnabledAssets`
   - `getBalance`
   - `listBalances`
   Initialize enabled assets at zero and seed default eligibility/freeze state like the reference adapter does (`packages/providers-custody/src/testing/in-memory-provider.ts:56-59`).
3. Deposit addresses:
   - `createDepositAddress`
   - `listDepositAddresses`
   Generate stable stored mock addresses so the same address list survives restarts.
4. Transfers:
   - `createTransfer`
   - `getTransfer`
   - `listTransfers`
   Enforce validation order from the port contract and reference adapter before persisting lifecycle state (`packages/providers-custody/README.md:7-16`, `packages/providers-custody/src/testing/in-memory-provider.ts:62-72`).
5. Ramp requests:
   - `createRampRequest`
   - `getRampRequest`
   - `listRampRequests`
   This is required by the current contract and conformance suite even though the task description focuses more on transfers (`packages/providers-custody/src/conformance/index.ts:69-84`).
6. Token administration:
   - `grantEligibility` / `revokeEligibility` / `getEligibility`
   - `freezeAccount` / `unfreezeAccount`
   - `pauseAsset` / `unpauseAsset`
   - `mintAsset` / `burnAsset`
   These methods are part of the current `CustodyProvider` and must be implemented for conformance (`packages/providers-custody/src/port.ts:19-27`, `packages/providers-custody/src/conformance/index.ts:86-104`).

## Phase 6 - Decide and implement the projection boundary

1. Keep custody-native tables as source of truth and leave the existing wallet summary tables untouched in this task.
2. Document that later wallet-integration work should either:
   - read custody tables directly through a service layer, or
   - add a projection/mapping step into app-facing `balances` / `transactions` if the current UI still depends on those tables.
3. Avoid coupling the new provider to the current wallet summary schema now, because that schema is still app-shaped and not custody-shaped (`packages/db/src/schema.ts:192-228`, `apps/wallet/src/lib/api/wallet.ts:7-12`, `apps/wallet/src/lib/api/withdraw.ts:5-11`).
4. Keep this projection concern out of the generic custody port; it belongs in later app wiring, not in the core provider contract.

## Phase 7 - Add conformance coverage for the new adapter

1. Add package-local tests that register `runCustodyProviderConformanceSuite(...)` against the DB-backed Fireblocks mock, using deterministic hooks for funding and lifecycle settlement where needed (`packages/providers-custody/src/conformance/index.ts:5-105`).
2. Provide test helpers for:
   - creating isolated DB instances
   - seeding vault assets and balances
   - advancing time or lifecycle deterministically
3. Ensure the mock's public factory shape makes the conformance harness straightforward rather than relying on private module internals.

## Phase 8 - Document the package

1. The stale Ripio mock script and environment configuration were removed in task 12; do not reintroduce provider-specific root scripts or sample-data overrides while scaffolding this package.
2. Add a Fireblocks-oriented root development script only if the committed package actually exposes a dev server.
3. In `packages/fireblocks-mock/README.md`, document:
   - package purpose and relation to `@repo/providers-custody`
   - DB migration dependency
   - factory usage
   - deterministic simulation options
   - restart-safe lifecycle behavior
   - whether wallet summary projection is included or intentionally deferred

## File-by-file implementation checklist

- `packages/fireblocks-mock/package.json`
- `packages/fireblocks-mock/tsconfig.json`
- `packages/fireblocks-mock/eslint.config.mjs`
- `packages/fireblocks-mock/src/index.ts`
- `packages/fireblocks-mock/src/fireblocks-mock-provider.ts`
- `packages/fireblocks-mock/src/repository.ts`
- `packages/fireblocks-mock/src/lifecycle.ts`
- `packages/fireblocks-mock/src/math.ts`
- `packages/fireblocks-mock/src/controls.ts`
- `packages/fireblocks-mock/src/mappers.ts`
- `packages/fireblocks-mock/README.md`
- `packages/db/src/schema.ts`
- `packages/db/src/types.ts`
- `packages/db/src/index.ts`
- `packages/db/drizzle/*.sql`
- `packages/db/drizzle/meta/_journal.json`

## Confirmed decisions

1. The Fireblocks mock should use new custody-native tables in `@repo/db` as its source of truth.
2. This task should not add immediate projection into the existing wallet `balances` / `transactions` tables.
3. Wallet summary projection or direct wallet consumption of custody state belongs to later wallet-integration work.
