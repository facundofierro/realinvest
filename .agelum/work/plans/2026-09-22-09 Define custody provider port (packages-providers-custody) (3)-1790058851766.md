# Plan: Define custody provider port (packages/providers-custody)

Task: `.agelum/work/tasks/pending/09 Define custody provider port (packages-providers-custody) (3).md`

## Certainty assessment

**Level: High**

This is a greenfield, additive package with no integration risk (pure TypeScript interfaces, types, error classes and a test-kit function — no network calls, no external SDK, no database migration). The shape to build is well-grounded in three independent sources that all agree:

- The sibling package `packages/providers-kyc` (built by task 06, plan `.agelum/work/plans/2026-09-22-06 Define KYC provider port and packages-providers-kyc (3)-1790057544926.md`) is the direct structural template for scaffolding (`package.json`, `tsconfig.json`, `eslint.config.mjs`) — `packages/providers-kyc/package.json:1-27`, `packages/providers-kyc/tsconfig.json:1-11`, `packages/providers-kyc/eslint.config.mjs:1-4`.
- `.agelum/doc/docs/research/providers/fireblocks.md` §4.2–4.3 (lines 81–149) gives a concrete, table-driven list of the exact operations a custody port must expose (vault accounts, asset/wallet enablement, balances, deposit addresses, transfers with `TRANSFER`/idempotency semantics, and a secondary-market/ramp-adjacent flow), which maps cleanly onto the task's acceptance criteria.
- `.agelum/doc/docs/plan/status-2026-sep.md:96-106` (§3.6) independently confirms the package boundary (`packages/providers-custody`) and that it is "interface + mock + future real adapters" at the *boundary* level, while task 10 (`.agelum/work/tasks/pending/10 Implement @repo-fireblocks-mock package (8).md:17`) confirms the **Fireblocks-flavored, DB-persisted** mock is explicitly a separate, later deliverable — so this task's own acceptance criterion "No real-provider-specific code in the package" is unambiguous: this package ships the port + types + errors + conformance kit only.

Two residual, low-severity risks to verify while implementing (not blocking):
1. `packages/providers-kyc` was built without any test runner in the repo, and none exists anywhere in this monorepo today (verified: no `vitest`/`jest` in any `package.json`, confirmed again for this task). This task's acceptance criterion "Reusable conformance tests are exported" is the **first** thing in the repo that structurally requires a test runner as a real dependency (not a deferred "write tests later" item — the exported conformance function itself must be expressed in some test-runner's vocabulary, e.g. `describe`/`it`/`expect`, for `packages/fireblocks-mock` (task 10) to consume it in its own test files). Vitest is confirmed for this (see Ambiguity assessment below).
2. Balance/amount fields are modeled as decimal strings (not `number`), to avoid float-precision bugs in transfer/balance arithmetic — this deviates from `@repo/db`'s existing `real(...)` (float) columns for `balances.available`/`positions.orderPriceUsd` etc. (`packages/db/src/schema.ts:192-200`). This package does not depend on `@repo/db` at all (by design — see below), so there is no type-compatibility issue now, but whoever wires a future DB-backed adapter (task 10) will need to convert between the port's string amounts and the DB's `real` columns. This is a reasonable, common practice for money-like values and does not block this task.

## Ambiguity assessment

**Level: Low**

The *what* (package boundary, acceptance-criteria buckets) was clear and triple-confirmed from the start. The *how* had four real forks; all four have now been resolved with the user (asked via `AskUserQuestion` after the first draft of this plan, per the planning instructions), so no open decisions remain that would change the shape of the code below:

1. **Test runner for the exported conformance suite** → **Vitest**. Confirmed. (First test-runner dependency in this monorepo — see the "No test runner in repo" row below.)
2. **Generic in-memory reference adapter, self-testing the conformance kit** → **Include it**, kept internal (not part of the public `exports` map).
3. **How the conformance suite seeds a funded balance for happy-path transfer/ramp tests** → **Optional test hooks** (`fund`, `settle`); tests needing them are skipped (not failed) when a provider factory doesn't supply them.
4. **Port width vs. the research doc's Hedera/HTS token-layer operations** → **Broaden it now.** The user chose to include on-chain eligibility grant/revoke, account freeze/unfreeze, asset pause/unpause, and mint/burn directly in `CustodyProvider`, beyond the acceptance criteria's literal four buckets. This plan has been updated accordingly (Phases 2–6 below now include these methods, types, and errors), kept provider-agnostic (no Fireblocks/Hedera-specific naming — e.g. "eligibility" instead of "on-chain KYC grant", no `kycKey`/`freezeKey`/`pauseKey` vocabulary) so it still satisfies "No real-provider-specific code in the package."

One second-order consequence of resolving #4: it made the funding side of #3 partially redundant for *treasury-style* seeding, because `mintAsset` is now a real, port-level way to create balance. I did **not** use it to replace the `fund` hook, because real custody providers typically restrict minting to a single authorized treasury/issuer vault account (per `fireblocks.md:223` — `treasuryAccountId`), so a conformance test that mints into an arbitrary vault account to "seed" it is not portable to a real adapter. `mintAsset`/`burnAsset` therefore get their own dedicated conformance tests (exercising mint/burn as first-class operations), while `hooks.fund` remains the generic, adapter-supplied seeding mechanism for the transfer/ramp happy-path tests. This reasoning is recorded here so it isn't re-litigated during implementation.

## Current state (research findings)

| Area | Location | Notes |
|---|---|---|
| Workspace glob | `pnpm-workspace.yaml:1-3` | `packages/*` already matches a new `packages/providers-custody` dir — no workspace config change needed. |
| Structural template | `packages/providers-kyc/package.json:1-27`, `tsconfig.json:1-11`, `eslint.config.mjs:1-4` | Copy shape exactly, minus the `@repo/db`/`drizzle-orm` dependency (this package has none) and plus `vitest` as a devDependency. |
| Port template (style) | `packages/providers-kyc/src/port.ts:1-7`, `src/types.ts:1-56`, `src/index.ts:1-4` | Same "types.ts + port.ts + index.ts re-export" file layout; `KycProvider`'s port is a flat interface of async methods — mirror that style for `CustodyProvider`. Note: `providers-kyc` has **no** `errors.ts` and **no** conformance kit — this task adds both, which are new patterns in this repo, not precedent to copy verbatim. |
| No test runner in repo | repo-wide `package.json` search (re-verified for this task: `grep` for `vitest`/`jest` across `packages/*/package.json` and `apps/*/package.json` returns nothing) | Confirms ambiguity point 1 above — adding a test runner is a real, first-of-its-kind infra decision for this task, not a copy-paste. |
| Operations to cover — vault accounts | `.agelum/doc/docs/research/providers/fireblocks.md:69,79,87,132` | `POST /vault/accounts`, pseudonymous `customerRefId`, no PII in vault account names. |
| Operations to cover — assets/wallets & deposit addresses | `fireblocks.md:88-90,133` | "Habilitar HBAR/token y dirección depósito"; addresses are scoped to a vault account + asset; verify address/network before showing to user (UX concern, not port concern). |
| Operations to cover — balances | `fireblocks.md:89` | "mostrar saldo disponible y pendiente separadamente" — confirms the port needs `available` and `pending` (not just a single number) — matches the `Balance` shape below. |
| Operations to cover — transfers | `fireblocks.md:91-96,101-121,141` | `POST /transactions` with `TRANSFER`, `source`/`destination` (`VAULT_ACCOUNT` or `ONE_TIME_ADDRESS`), `correlationId`/`idempotencyKey`/`externalTxId`, and an explicit internal state machine `draft → compliance_review → approved → submitted → fireblocks_pending → confirmed \| rejected \| failed → reconciled`. Task 10 (`.agelum/work/tasks/pending/10 ...md:17`) narrows the **port-level** status lifecycle to `SUBMITTED→CONFIRMING→COMPLETED/FAILED` — this task's `TransferStatus` type must match that exact vocabulary since task 10 has to implement against it. |
| Operations to cover — on/off-ramp | `fireblocks.md:140,144,146` (subscription/settlement rows) and `.agelum/doc/docs/research/providers/payments.md:29` ("Off-ramp establecoins... conecta con el vertical crypto de los agregadores") | Fiat↔USDT bridge is a distinct concept from a crypto-to-crypto transfer: it has a fiat leg (currency, amount, payment reference/rail) and a crypto leg (asset, amount) tied together by direction (`ON_RAMP`/`OFF_RAMP`). |
| Idempotency requirement | `fireblocks.md:83,151` | "Todo comando debe llevar `correlationId`, `idempotencyKey`..."; "Webhooks pueden repetirse o llegar fuera de orden: usar ID de evento, idempotencia". The port's `createTransfer`/`createRampRequest` inputs must require an `idempotencyKey`, and a conformance test must assert that replaying the same key returns the original record rather than creating a duplicate. |
| Token-layer operations (broadened scope, per user decision) | `fireblocks.md:135-139,142-143,209-232,275` | HTS-style `kycKey` (grant/revoke on-chain eligibility before an account can transact), `freezeKey` (per-account freeze), `pauseKey` (system-wide pause), `supplyKey` (mint, only if oversupply is permitted; for a fixed-supply real-estate token this is normally disabled — but the *port* still models it generically so an adapter that supports it can implement it), `treasuryAccountId` (mint/burn targets a designated treasury vault account in real deployments — informs why the conformance suite doesn't use mint as a generic test-funding shortcut; see Ambiguity assessment). Modeled generically (no `kycKey`/`freezeKey`/`pauseKey`/`supplyKey` names in the port itself) as `grantEligibility`/`revokeEligibility`, `freezeAccount`/`unfreezeAccount`, `pauseAsset`/`unpauseAsset`, `mintAsset`/`burnAsset`. |
| Package boundary confirmation | `.agelum/doc/docs/plan/status-2026-sep.md:71,96-106` | "`packages/providers-custody` (interface + mock + future real adapters)"; "Keep adapter interfaces provider-agnostic so each fork can plug different real providers." |
| Downstream consumer #1 (real mock) | `.agelum/work/tasks/pending/10 Implement @repo-fireblocks-mock package (8).md:17,20,27` | `@repo/fireblocks-mock` (separate package, **not** inside `packages/providers-custody`) implements this port, persists via `@repo/db`, and "Must pass the port's conformance suite" — confirms the conformance kit must be importable from outside this package. |
| Downstream consumer #2 (ramp UI) | `.agelum/work/tasks/pending/11 USDT on-off-ramp simulated flows (5).md` (file exists in `pending/`, not yet read in depth — only its existence/title is used here to confirm ramp requests are a real, separate downstream feature) | Confirms on/off-ramp is a first-class, separately-UI'd flow, reinforcing that it needs its own request/status type rather than being folded into `Transfer`. |
| Stale task references | Task file `09 ...md:21-23` points at `.agelum/doc/docs/research/providers/*.visual-check.json` — these files are **deleted** in the working tree (`git status` shows `D` for all of them) and have been superseded by `.agelum/doc/docs/research/providers/fireblocks.md` and `payments.md` (present on disk, last touched per `git log` in commit `2f08d1d` and earlier). Use the `.md` files, not the stale JSON paths, as the research source. | |
| Currency/asset precedent | `packages/db/src/types.ts:26` (`CurrencyCode = "USDT"`) | Intentionally **not** reused here — the port needs to represent more than the app's current single stablecoin (e.g. `HBAR` for network fees per `fireblocks.md:209-232`, plus fiat currency codes for ramp requests), so `AssetId` is modeled as an open `string`, not a closed union imported from `@repo/db` (this package must not depend on `@repo/db` at all — see acceptance criteria "No real-provider-specific code," which by extension also means no app/db-specific coupling). |

## Implementation steps

### Phase 1 — Scaffold `packages/providers-custody`

1. Create `packages/providers-custody/package.json`:
   ```json
   {
     "name": "@repo/providers-custody",
     "version": "0.0.0",
     "private": true,
     "exports": {
       ".": "./src/index.ts",
       "./conformance": "./src/conformance/index.ts"
     },
     "scripts": {
       "lint": "eslint . --max-warnings 0",
       "check-types": "tsc --noEmit",
       "test": "vitest run"
     },
     "devDependencies": {
       "@repo/eslint-config": "workspace:*",
       "@repo/typescript-config": "workspace:*",
       "@types/node": "^22.15.3",
       "eslint": "^9.19.1",
       "typescript": "5.9.2",
       "vitest": "^3.0.0"
     }
   }
   ```
   No runtime `dependencies` at all — this package has zero dependency on `@repo/db`, `drizzle-orm`, or any other workspace package, unlike `providers-kyc`. Run `pnpm --filter @repo/providers-custody add -D vitest` (or add it by hand and `pnpm install`) rather than hand-typing a version, so the lockfile picks a real current release; update the `^3.0.0` placeholder above to whatever gets resolved.

2. Create `packages/providers-custody/tsconfig.json` (identical shape to `packages/providers-kyc/tsconfig.json:1-11`):
   ```json
   {
     "extends": "@repo/typescript-config/base.json",
     "compilerOptions": {
       "outDir": "dist",
       "rootDir": ".",
       "types": ["node"]
     },
     "include": ["src"],
     "exclude": ["node_modules", "dist"]
   }
   ```

3. Create `packages/providers-custody/eslint.config.mjs` (identical to `packages/providers-kyc/eslint.config.mjs:1-4`):
   ```js
   import { config } from "@repo/eslint-config/base";

   /** @type {import("eslint").Linter.Config[]} */
   export default config;
   ```

4. Create `packages/providers-custody/vitest.config.ts`:
   ```ts
   import { defineConfig } from "vitest/config";

   export default defineConfig({
     test: { environment: "node" },
   });
   ```

5. Run `pnpm install` at the repo root so the new workspace package is linked.

6. Add a `test` task to `turbo.json` (root, alongside the existing `lint`/`check-types` tasks at `turbo.json:16-22`):
   ```json
   "test": {
     "dependsOn": ["^build"]
   }
   ```
   and add `"test": "turbo run test"` to the root `package.json` scripts block (`package.json:4-14`), next to the existing `"lint"`/`"check-types"` entries. (If Q1's answer changes the test runner, adjust these two steps accordingly — e.g. drop the `turbo.json`/`vitest.config.ts` steps entirely if a framework-agnostic harness is chosen instead.)

### Phase 2 — Types (`src/types.ts`)

7. Create `packages/providers-custody/src/types.ts`. Keep every field provider-agnostic (no Fireblocks/Hedera field names like `vaultAccountId` naming conventions borrowed verbatim from their SDK, no HTS key names) and amount-safe (decimal strings, not floats):

   ```ts
   export type AssetId = string;

   export interface VaultAccount {
     id: string;
     name: string;
     customerRefId: string | null;
     createdAt: string; // ISO 8601
   }

   export interface CreateVaultAccountInput {
     name: string;
     customerRefId?: string | null;
   }

   export interface Balance {
     vaultAccountId: string;
     assetId: AssetId;
     total: string;     // decimal string
     available: string; // decimal string, <= total
     pending: string;   // decimal string, inbound/outbound amounts not yet settled
   }

   export interface DepositAddress {
     id: string;
     vaultAccountId: string;
     assetId: AssetId;
     address: string;
     tag: string | null; // e.g. memo/destination-tag networks
     createdAt: string;
   }

   export type TransferDestination =
     | { type: "VAULT_ACCOUNT"; vaultAccountId: string }
     | { type: "ONE_TIME_ADDRESS"; address: string; tag?: string | null };

   export type TransferDirection = "internal" | "external";
   export type TransferStatus = "SUBMITTED" | "CONFIRMING" | "COMPLETED" | "FAILED";

   export interface CreateTransferInput {
     assetId: AssetId;
     amount: string;
     sourceVaultAccountId: string;
     destination: TransferDestination;
     idempotencyKey: string;
     note?: string | null;
     externalTxId?: string | null;
   }

   export interface Transfer {
     id: string;
     assetId: AssetId;
     amount: string;
     sourceVaultAccountId: string;
     destination: TransferDestination;
     direction: TransferDirection; // "internal" iff destination.type === "VAULT_ACCOUNT"
     status: TransferStatus;
     note: string | null;
     externalTxId: string | null;
     idempotencyKey: string;
     failureReason: string | null;
     createdAt: string;
     updatedAt: string;
   }

   export type RampDirection = "ON_RAMP" | "OFF_RAMP"; // ON_RAMP: fiat in -> asset credited; OFF_RAMP: asset debited -> fiat paid out
   export type RampStatus =
     | "PENDING"
     | "FUNDS_RECEIVED"
     | "PROCESSING"
     | "COMPLETED"
     | "FAILED"
     | "CANCELLED";

   export interface CreateRampRequestInput {
     vaultAccountId: string;
     direction: RampDirection;
     fiatCurrency: string; // ISO 4217, e.g. "PYG", "USD"
     fiatAmount: string;
     assetId: AssetId; // e.g. "USDT"
     assetAmount: string;
     idempotencyKey: string;
     paymentReference?: string | null;
   }

   export interface RampRequest {
     id: string;
     vaultAccountId: string;
     direction: RampDirection;
     fiatCurrency: string;
     fiatAmount: string;
     assetId: AssetId;
     assetAmount: string;
     status: RampStatus;
     paymentReference: string | null;
     idempotencyKey: string;
     failureReason: string | null;
     createdAt: string;
     updatedAt: string;
   }

   // --- Token administration (broadened scope) ---
   // Generic equivalents of Fireblocks/Hedera concepts (kycKey, freezeKey,
   // pauseKey, supplyKey) — deliberately not named after that vocabulary so
   // no real-provider-specific naming leaks into the port.

   export interface EligibilityState {
     vaultAccountId: string;
     assetId: AssetId;
     eligible: boolean; // defaults to true when an asset is enabled; explicit revoke required to gate transfers
     updatedAt: string;
   }

   export interface AccountFreezeState {
     vaultAccountId: string;
     assetId: AssetId;
     frozen: boolean; // defaults to false
     reason: string | null;
     updatedAt: string;
   }

   export interface AssetPauseState {
     assetId: AssetId;
     paused: boolean; // defaults to false
     reason: string | null;
     updatedAt: string;
   }

   export interface MintBurnInput {
     vaultAccountId: string;
     assetId: AssetId;
     amount: string;
     idempotencyKey: string;
     note?: string | null;
   }

   export type MintBurnType = "MINT" | "BURN";

   export interface MintBurnResult {
     id: string;
     type: MintBurnType;
     vaultAccountId: string;
     assetId: AssetId;
     amount: string;
     idempotencyKey: string;
     createdAt: string;
   }
   ```

### Phase 3 — Error model (`src/errors.ts`)

8. Create `packages/providers-custody/src/errors.ts` — a base error class carrying a discriminant `code`, plus one subclass per failure mode any adapter (mock or real) can hit:

   ```ts
   export type CustodyErrorCode =
     | "VAULT_ACCOUNT_NOT_FOUND"
     | "ASSET_NOT_ENABLED"
     | "INSUFFICIENT_BALANCE"
     | "INVALID_DESTINATION"
     | "TRANSFER_NOT_FOUND"
     | "RAMP_REQUEST_NOT_FOUND"
     | "UNSUPPORTED_ASSET"
     | "VALIDATION_ERROR"
     | "ACCOUNT_FROZEN"
     | "ASSET_PAUSED"
     | "NOT_ELIGIBLE";

   export class CustodyProviderError extends Error {
     readonly code: CustodyErrorCode;

     constructor(code: CustodyErrorCode, message: string, options?: ErrorOptions) {
       super(message, options);
       this.name = new.target.name;
       this.code = code;
     }
   }

   export class VaultAccountNotFoundError extends CustodyProviderError {
     constructor(vaultAccountId: string) {
       super("VAULT_ACCOUNT_NOT_FOUND", `Vault account not found: ${vaultAccountId}`);
     }
   }

   export class AssetNotEnabledError extends CustodyProviderError {
     constructor(vaultAccountId: string, assetId: string) {
       super("ASSET_NOT_ENABLED", `Asset ${assetId} is not enabled on vault account ${vaultAccountId}`);
     }
   }

   export class InsufficientBalanceError extends CustodyProviderError {
     constructor(vaultAccountId: string, assetId: string, requested: string, available: string) {
       super(
         "INSUFFICIENT_BALANCE",
         `Insufficient ${assetId} balance on vault account ${vaultAccountId}: requested ${requested}, available ${available}`,
       );
     }
   }

   export class InvalidDestinationError extends CustodyProviderError {
     constructor(message: string) {
       super("INVALID_DESTINATION", message);
     }
   }

   export class TransferNotFoundError extends CustodyProviderError {
     constructor(transferId: string) {
       super("TRANSFER_NOT_FOUND", `Transfer not found: ${transferId}`);
     }
   }

   export class RampRequestNotFoundError extends CustodyProviderError {
     constructor(rampRequestId: string) {
       super("RAMP_REQUEST_NOT_FOUND", `Ramp request not found: ${rampRequestId}`);
     }
   }

   export class UnsupportedAssetError extends CustodyProviderError {
     constructor(assetId: string) {
       super("UNSUPPORTED_ASSET", `Unsupported asset: ${assetId}`);
     }
   }

   export class CustodyValidationError extends CustodyProviderError {
     constructor(message: string) {
       super("VALIDATION_ERROR", message);
     }
   }

   export class AccountFrozenError extends CustodyProviderError {
     constructor(vaultAccountId: string, assetId: string) {
       super("ACCOUNT_FROZEN", `Vault account ${vaultAccountId} is frozen for asset ${assetId}`);
     }
   }

   export class AssetPausedError extends CustodyProviderError {
     constructor(assetId: string) {
       super("ASSET_PAUSED", `Asset ${assetId} is paused`);
     }
   }

   export class NotEligibleError extends CustodyProviderError {
     constructor(vaultAccountId: string, assetId: string) {
       super("NOT_ELIGIBLE", `Vault account ${vaultAccountId} is not eligible to transact in ${assetId}`);
     }
   }
   ```

### Phase 4 — Port (`src/port.ts`)

9. Create `packages/providers-custody/src/port.ts`:

   ```ts
   import type {
     AccountFreezeState,
     AssetId,
     AssetPauseState,
     Balance,
     CreateRampRequestInput,
     CreateTransferInput,
     CreateVaultAccountInput,
     DepositAddress,
     EligibilityState,
     MintBurnInput,
     MintBurnResult,
     RampRequest,
     Transfer,
     VaultAccount,
   } from "./types";

   export interface CustodyProvider {
     // Vault accounts
     createVaultAccount(input: CreateVaultAccountInput): Promise<VaultAccount>;
     getVaultAccount(vaultAccountId: string): Promise<VaultAccount | null>;
     listVaultAccounts(): Promise<VaultAccount[]>;

     // Wallets / assets
     enableAsset(vaultAccountId: string, assetId: AssetId): Promise<void>;
     listEnabledAssets(vaultAccountId: string): Promise<AssetId[]>;

     // Balances
     getBalance(vaultAccountId: string, assetId: AssetId): Promise<Balance>;
     listBalances(vaultAccountId: string): Promise<Balance[]>;

     // Deposit addresses
     createDepositAddress(vaultAccountId: string, assetId: AssetId): Promise<DepositAddress>;
     listDepositAddresses(vaultAccountId: string, assetId: AssetId): Promise<DepositAddress[]>;

     // Transfers
     createTransfer(input: CreateTransferInput): Promise<Transfer>;
     getTransfer(transferId: string): Promise<Transfer | null>;
     listTransfers(filter?: { vaultAccountId?: string }): Promise<Transfer[]>;

     // Fiat/USDT on/off-ramp
     createRampRequest(input: CreateRampRequestInput): Promise<RampRequest>;
     getRampRequest(rampRequestId: string): Promise<RampRequest | null>;
     listRampRequests(filter?: { vaultAccountId?: string }): Promise<RampRequest[]>;

     // On-chain eligibility (generic equivalent of an HTS-style "grant/revoke KYC" flag per account + asset)
     grantEligibility(vaultAccountId: string, assetId: AssetId): Promise<EligibilityState>;
     revokeEligibility(vaultAccountId: string, assetId: AssetId): Promise<EligibilityState>;
     getEligibility(vaultAccountId: string, assetId: AssetId): Promise<EligibilityState>;

     // Freeze / unfreeze a single vault account for an asset
     freezeAccount(vaultAccountId: string, assetId: AssetId, reason?: string | null): Promise<AccountFreezeState>;
     unfreezeAccount(vaultAccountId: string, assetId: AssetId): Promise<AccountFreezeState>;

     // Pause / unpause an asset system-wide
     pauseAsset(assetId: AssetId, reason?: string | null): Promise<AssetPauseState>;
     unpauseAsset(assetId: AssetId): Promise<AssetPauseState>;

     // Mint / burn supply
     mintAsset(input: MintBurnInput): Promise<MintBurnResult>;
     burnAsset(input: MintBurnInput): Promise<MintBurnResult>;
   }
   ```

   Method-level contract notes (for whoever implements an adapter against this port — record these in the README, Phase 6):
   - `getVaultAccount`/`getTransfer`/`getRampRequest` return `null` for unknown ids (not a thrown error) — only *operations on* an unknown id (e.g. transferring from a vault account that doesn't exist) throw `VaultAccountNotFoundError`.
   - `getBalance`/`listBalances`/`createDepositAddress`/`listDepositAddresses` throw `AssetNotEnabledError` if `enableAsset` was never called for that vault account + asset pair.
   - `createTransfer` and `createRampRequest` must be idempotent on `idempotencyKey`: calling twice with the same key and equivalent input returns the original record rather than creating a second one.
   - `createTransfer` throws `InsufficientBalanceError` when `amount` exceeds the source vault account's `available` balance for that asset — this must be checkable without any funding capability (a fresh vault account has zero balance), so it does not depend on ambiguity-point-3's hooks.
   - `enableAsset` initializes `EligibilityState.eligible = true` and `AccountFreezeState.frozen = false` for that vault account + asset pair (opt-out compliance model: eligible/unfrozen by default, must be explicitly revoked/frozen) — this keeps the Phase 5 transfer tests written before the port was broadened valid without modification.
   - `pauseAsset`/`unpauseAsset` state is per-asset, not per-vault-account (`AssetPauseState` has no `vaultAccountId`).
   - `createTransfer` validates in this order and throws the first applicable error: (1) source vault account exists → `VaultAccountNotFoundError`; (2) source has the asset enabled → `AssetNotEnabledError`; (3) asset is not paused → `AssetPausedError`; (4) source account is not frozen for the asset → `AccountFrozenError`; (5) source is eligible → `NotEligibleError`; (6) if `destination.type === "VAULT_ACCOUNT"`, that destination vault account exists, has the asset enabled, and is not frozen/is eligible (same three checks, destination-scoped) → the matching error; (7) `amount` does not exceed source `available` balance → `InsufficientBalanceError`. This fixed order makes conformance-test assertions deterministic across adapters.
   - `mintAsset`/`burnAsset` throw `AssetPausedError` if the asset is paused, and (for `burnAsset`) `InsufficientBalanceError` if `amount` exceeds the vault account's `available` balance. Neither method depends on eligibility/freeze state (minting/burning is an issuer-side operation on supply, not a transfer to/from a counterparty).

### Phase 5 — Conformance test kit (`src/conformance/index.ts`)

10. Create `packages/providers-custody/src/conformance/index.ts`, exported via the package's `./conformance` subpath (step 1). It takes a provider factory and optional simulation hooks, and registers a Vitest `describe` block:

    ```ts
    import { beforeEach, describe, expect, it } from "vitest";
    import {
      AccountFrozenError,
      AssetNotEnabledError,
      AssetPausedError,
      InsufficientBalanceError,
      NotEligibleError,
      VaultAccountNotFoundError,
    } from "../errors";
    import type { CustodyProvider } from "../port";

    export interface CustodyConformanceHooks {
      /**
       * Credits `amount` of `assetId` onto `vaultAccountId` outside the normal
       * transfer/ramp flow, simulating an inbound deposit for test setup.
       * Only a simulated adapter can implement this; omit it to skip the
       * happy-path tests that need a funded balance.
       */
      fund?: (vaultAccountId: string, assetId: string, amount: string) => Promise<void>;
      /**
       * Advances the provider's simulated clock/queue so pending transfers or
       * ramp requests resolve to a terminal status. Omit if the adapter
       * resolves synchronously, or to skip lifecycle-completion assertions.
       */
      settle?: () => Promise<void>;
    }

    const ASSET = "USDT";

    export function runCustodyProviderConformanceSuite(
      createProvider: () => CustodyProvider | Promise<CustodyProvider>,
      hooks: CustodyConformanceHooks = {},
    ) {
      describe("CustodyProvider conformance", () => {
        let provider: CustodyProvider;

        beforeEach(async () => {
          provider = await createProvider();
        });

        describe("vault accounts", () => {
          it("creates and retrieves a vault account", async () => {
            const created = await provider.createVaultAccount({ name: "Treasury" });
            expect(created.id).toBeTruthy();
            const fetched = await provider.getVaultAccount(created.id);
            expect(fetched).toEqual(created);
          });

          it("returns null for an unknown vault account", async () => {
            expect(await provider.getVaultAccount("does-not-exist")).toBeNull();
          });

          it("lists created vault accounts", async () => {
            const created = await provider.createVaultAccount({ name: "Treasury" });
            const list = await provider.listVaultAccounts();
            expect(list.map((v) => v.id)).toContain(created.id);
          });
        });

        describe("wallets / assets", () => {
          it("throws AssetNotEnabledError before an asset is enabled", async () => {
            const vault = await provider.createVaultAccount({ name: "Treasury" });
            await expect(provider.getBalance(vault.id, ASSET)).rejects.toThrow(AssetNotEnabledError);
          });

          it("enables an asset and starts at a zero balance", async () => {
            const vault = await provider.createVaultAccount({ name: "Treasury" });
            await provider.enableAsset(vault.id, ASSET);
            expect(await provider.listEnabledAssets(vault.id)).toContain(ASSET);
            const balance = await provider.getBalance(vault.id, ASSET);
            expect(balance).toMatchObject({ total: "0", available: "0", pending: "0" });
          });
        });

        describe("deposit addresses", () => {
          it("creates and lists a deposit address scoped to vault + asset", async () => {
            const vault = await provider.createVaultAccount({ name: "Treasury" });
            await provider.enableAsset(vault.id, ASSET);
            const address = await provider.createDepositAddress(vault.id, ASSET);
            expect(address.address).toBeTruthy();
            const list = await provider.listDepositAddresses(vault.id, ASSET);
            expect(list.map((a) => a.id)).toContain(address.id);
          });
        });

        describe("transfers", () => {
          it("rejects a transfer from an unknown vault account", async () => {
            await expect(
              provider.createTransfer({
                assetId: ASSET,
                amount: "1",
                sourceVaultAccountId: "does-not-exist",
                destination: { type: "ONE_TIME_ADDRESS", address: "0xabc" },
                idempotencyKey: "idem-1",
              }),
            ).rejects.toThrow(VaultAccountNotFoundError);
          });

          it("rejects a transfer exceeding available balance (works at zero balance)", async () => {
            const vault = await provider.createVaultAccount({ name: "Treasury" });
            await provider.enableAsset(vault.id, ASSET);
            await expect(
              provider.createTransfer({
                assetId: ASSET,
                amount: "1",
                sourceVaultAccountId: vault.id,
                destination: { type: "ONE_TIME_ADDRESS", address: "0xabc" },
                idempotencyKey: "idem-2",
              }),
            ).rejects.toThrow(InsufficientBalanceError);
          });

          it.skipIf(!hooks.fund)(
            "moves funds and reaches a terminal status for a funded internal transfer",
            async () => {
              const source = await provider.createVaultAccount({ name: "Treasury" });
              const destination = await provider.createVaultAccount({ name: "Client" });
              await provider.enableAsset(source.id, ASSET);
              await provider.enableAsset(destination.id, ASSET);
              await hooks.fund!(source.id, ASSET, "100");

              const transfer = await provider.createTransfer({
                assetId: ASSET,
                amount: "40",
                sourceVaultAccountId: source.id,
                destination: { type: "VAULT_ACCOUNT", vaultAccountId: destination.id },
                idempotencyKey: "idem-3",
              });
              expect(transfer.direction).toBe("internal");
              expect(["SUBMITTED", "CONFIRMING", "COMPLETED"]).toContain(transfer.status);

              if (hooks.settle) await hooks.settle();

              const finalTransfer = await provider.getTransfer(transfer.id);
              expect(finalTransfer?.status).toBe("COMPLETED");
              expect((await provider.getBalance(destination.id, ASSET)).available).toBe("40");
            },
          );

          it.skipIf(!hooks.fund)(
            "is idempotent on idempotencyKey",
            async () => {
              const source = await provider.createVaultAccount({ name: "Treasury" });
              await provider.enableAsset(source.id, ASSET);
              await hooks.fund!(source.id, ASSET, "10");
              const input = {
                assetId: ASSET,
                amount: "5",
                sourceVaultAccountId: source.id,
                destination: { type: "ONE_TIME_ADDRESS" as const, address: "0xabc" },
                idempotencyKey: "idem-4",
              };
              const first = await provider.createTransfer(input);
              const second = await provider.createTransfer(input);
              expect(second.id).toBe(first.id);
            },
          );
        });

        describe("on/off-ramp", () => {
          it("creates a ramp request in a pending-like status", async () => {
            const vault = await provider.createVaultAccount({ name: "Treasury" });
            await provider.enableAsset(vault.id, ASSET);
            const request = await provider.createRampRequest({
              vaultAccountId: vault.id,
              direction: "ON_RAMP",
              fiatCurrency: "USD",
              fiatAmount: "100",
              assetId: ASSET,
              assetAmount: "100",
              idempotencyKey: "idem-ramp-1",
            });
            expect(request.status).toBe("PENDING");
            expect(await provider.getRampRequest(request.id)).toEqual(request);
          });

          it.skipIf(!hooks.settle)("resolves an on-ramp request to a terminal status", async () => {
            const vault = await provider.createVaultAccount({ name: "Treasury" });
            await provider.enableAsset(vault.id, ASSET);
            const request = await provider.createRampRequest({
              vaultAccountId: vault.id,
              direction: "ON_RAMP",
              fiatCurrency: "USD",
              fiatAmount: "50",
              assetId: ASSET,
              assetAmount: "50",
              idempotencyKey: "idem-ramp-2",
            });
            await hooks.settle!();
            const resolved = await provider.getRampRequest(request.id);
            expect(resolved?.status).toBe("COMPLETED");
          });
        });

        describe("token administration", () => {
          it("mints supply into a vault account, increasing its balance", async () => {
            const vault = await provider.createVaultAccount({ name: "Treasury" });
            await provider.enableAsset(vault.id, ASSET);
            const minted = await provider.mintAsset({
              vaultAccountId: vault.id,
              assetId: ASSET,
              amount: "1000",
              idempotencyKey: "idem-mint-1",
            });
            expect(minted.type).toBe("MINT");
            expect((await provider.getBalance(vault.id, ASSET)).available).toBe("1000");
          });

          it("burns supply from a vault account, decreasing its balance", async () => {
            const vault = await provider.createVaultAccount({ name: "Treasury" });
            await provider.enableAsset(vault.id, ASSET);
            await provider.mintAsset({
              vaultAccountId: vault.id,
              assetId: ASSET,
              amount: "1000",
              idempotencyKey: "idem-mint-2",
            });
            await provider.burnAsset({
              vaultAccountId: vault.id,
              assetId: ASSET,
              amount: "400",
              idempotencyKey: "idem-burn-1",
            });
            expect((await provider.getBalance(vault.id, ASSET)).available).toBe("600");
          });

          it("rejects mint/burn when the asset is paused", async () => {
            const vault = await provider.createVaultAccount({ name: "Treasury" });
            await provider.enableAsset(vault.id, ASSET);
            await provider.pauseAsset(ASSET, "system incident");
            await expect(
              provider.mintAsset({ vaultAccountId: vault.id, assetId: ASSET, amount: "1", idempotencyKey: "idem-mint-3" }),
            ).rejects.toThrow(AssetPausedError);
            await provider.unpauseAsset(ASSET);
            await expect(
              provider.mintAsset({ vaultAccountId: vault.id, assetId: ASSET, amount: "1", idempotencyKey: "idem-mint-4" }),
            ).resolves.toBeTruthy();
          });

          it("rejects a transfer while the source account is frozen for that asset (zero-balance friendly)", async () => {
            const vault = await provider.createVaultAccount({ name: "Treasury" });
            await provider.enableAsset(vault.id, ASSET);
            await provider.freezeAccount(vault.id, ASSET, "compliance hold");
            await expect(
              provider.createTransfer({
                assetId: ASSET,
                amount: "1",
                sourceVaultAccountId: vault.id,
                destination: { type: "ONE_TIME_ADDRESS", address: "0xabc" },
                idempotencyKey: "idem-frozen-1",
              }),
            ).rejects.toThrow(AccountFrozenError);
            await provider.unfreezeAccount(vault.id, ASSET);
            await expect(
              provider.createTransfer({
                assetId: ASSET,
                amount: "1",
                sourceVaultAccountId: vault.id,
                destination: { type: "ONE_TIME_ADDRESS", address: "0xabc" },
                idempotencyKey: "idem-frozen-2",
              }),
            ).rejects.toThrow(InsufficientBalanceError); // unfrozen, so it now fails on balance instead
          });

          it("rejects an internal transfer to an ineligible destination (zero-balance friendly)", async () => {
            const source = await provider.createVaultAccount({ name: "Treasury" });
            const destination = await provider.createVaultAccount({ name: "Client" });
            await provider.enableAsset(source.id, ASSET);
            await provider.enableAsset(destination.id, ASSET);
            await provider.revokeEligibility(destination.id, ASSET);
            await expect(
              provider.createTransfer({
                assetId: ASSET,
                amount: "1",
                sourceVaultAccountId: source.id,
                destination: { type: "VAULT_ACCOUNT", vaultAccountId: destination.id },
                idempotencyKey: "idem-elig-1",
              }),
            ).rejects.toThrow(NotEligibleError);
          });
        });
      });
    }
    ```

    This is deliberately exhaustive over the port's surface (every method is exercised at least once) while keeping the zero-balance-friendly tests unconditional (so they run against *any* adapter, including a real Fireblocks sandbox adapter later) and gating only the funded happy-path tests behind the optional hooks.

### Phase 6 — Public exports, self-test, and documentation

11. Create `packages/providers-custody/src/testing/in-memory-provider.ts` — a small, fully generic (not Fireblocks-named) in-memory reference adapter used only to self-test the conformance kit in this package. Not part of the public `exports` map (internal to `src/`, imported only by the test file in step 12). Implement `CustodyProvider` with `Map`-backed state:
    - Vault accounts, enabled-assets sets, balances, deposit addresses, transfers, ramp requests, eligibility state, freeze state, and per-asset pause state all keyed by generated ids (`crypto.randomUUID()`) or by `${vaultAccountId}:${assetId}` composite keys where the port scopes state that way.
    - `enableAsset` seeds `EligibilityState.eligible = true` and `AccountFreezeState.frozen = false` for that vault account + asset pair, and a zero `Balance`.
    - `createTransfer`/`createRampRequest` check an internal `Map<idempotencyKey, id>` first and return the existing record if the key was already used; `createTransfer` runs the validation order from step 9's contract notes (not-found → not-enabled → paused → frozen → not-eligible → destination checks → insufficient balance).
    - New transfers/ramp requests start `SUBMITTED`/`PENDING` and are pushed onto an internal "pending" queue instead of resolving immediately.
    - `mintAsset`/`burnAsset` directly adjust `total`/`available` balance (checking `AssetPausedError`/`InsufficientBalanceError` per step 9) and resolve synchronously — no pending-queue involvement, since real supply changes are issuer-authorized and don't need a simulated confirmation delay in this reference adapter.
    - `grantEligibility`/`revokeEligibility`, `freezeAccount`/`unfreezeAccount`, `pauseAsset`/`unpauseAsset` are direct, synchronous state flips returning the updated state object.
    - Export a factory `createInMemoryCustodyProvider()` returning `{ provider: CustodyProvider; fund: CustodyConformanceHooks["fund"]; settle: CustodyConformanceHooks["settle"] }` — `fund` directly increments a vault account's `available`/`total` balance for an asset without going through mint (it's a test-only shortcut, distinct from the real `mintAsset` operation — see Ambiguity assessment for why both exist); `settle` drains the pending queue, applying balance movements for transfers (debit source, credit destination if `VAULT_ACCOUNT`) and marking both transfers and ramp requests `COMPLETED`.

12. Create `packages/providers-custody/src/conformance/conformance.test.ts` — the self-test that proves the exported kit works before task 10 depends on it:
    ```ts
    import { createInMemoryCustodyProvider } from "../testing/in-memory-provider";
    import { runCustodyProviderConformanceSuite } from "./index";

    let current: ReturnType<typeof createInMemoryCustodyProvider>;

    runCustodyProviderConformanceSuite(
      () => {
        current = createInMemoryCustodyProvider();
        return current.provider;
      },
      {
        fund: (...args) => current.fund(...args),
        settle: () => current.settle(),
      },
    );
    ```
    The hooks close over `current`, which is reassigned by the factory on every `beforeEach` inside the suite — since Vitest always calls `createProvider()` before the test body that uses `hooks.fund`/`hooks.settle` runs, `current` is correctly bound by the time either hook fires.

13. Create `packages/providers-custody/src/index.ts`:
    ```ts
    export * from "./types";
    export * from "./errors";
    export type { CustodyProvider } from "./port";
    ```
    (The in-memory testing adapter is intentionally **not** re-exported here — see step 11.)

14. Create `packages/providers-custody/README.md` documenting:
    - The `CustodyProvider` port's method groups (vault accounts, wallets/assets, balances, deposit addresses, transfers, on/off-ramp, and token administration — eligibility, freeze/unfreeze, pause/unpause, mint/burn) and the contract notes from step 9, including the fixed `createTransfer` validation order.
    - The error model (`CustodyProviderError` base + `code` discriminant + the specific subclasses from step 8).
    - How to consume the conformance kit from another package (the exact pattern task 10 needs):
      ```ts
      import { runCustodyProviderConformanceSuite } from "@repo/providers-custody/conformance";
      import { createFireblocksMockProvider } from "../src/provider";

      runCustodyProviderConformanceSuite(
        () => createFireblocksMockProvider(/* ... */),
        { fund: /* ... */, settle: /* ... */ }, // only if the mock supports simulated funding/settlement
      );
      ```
    - Explicitly state: no `@repo/db` dependency, no Fireblocks-specific naming, no `apps/wallet` wiring — this package is the port only; the Fireblocks-flavored, DB-persisted mock is `@repo/fireblocks-mock` (task 10).

## Explicitly out of scope for this task

- The Fireblocks-flavored, `@repo/db`-persisted mock adapter (`@repo/fireblocks-mock`) — task 10. This task's in-memory reference adapter (Phase 6, step 11) is generic and internal-only; it is not a substitute for task 10's deliverable.
- Any `apps/wallet` wiring (API routes, UI, deposit/withdraw pages) — task 10/11 territory.
- Real Fireblocks/Hedera SDK integration — explicitly deferred repo-wide per `status-2026-sep.md` §5. The token-administration methods added to the port (eligibility, freeze/pause, mint/burn) are still pure interface/types — no HTS/Fireblocks SDK code, keys, or vocabulary.
