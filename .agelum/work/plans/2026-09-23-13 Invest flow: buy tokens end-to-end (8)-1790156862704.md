# Plan: Invest flow: buy tokens end-to-end

Task: `.agelum/work/tasks/pending/13 Invest flow: buy tokens end-to-end (8).md`

## Certainty assessment

**Level: High**

This is a greenfield feature (no bug/root-cause to locate). Every mechanical building block it needs already exists and was inspected directly: the DB schema (`packages/db/src/schema.ts`), the custody port + mock (`packages/providers-custody`, `packages/fireblocks-mock`), the KYC guard (`apps/wallet/src/lib/kyc-guard.ts`), and the two complete prior-art flows this design is built by generalizing: `createCustodyWithdrawal` + `syncPendingCustodyState` (`apps/wallet/src/lib/api/custody-wallet.ts`) for the async custody-settlement pattern, and `createPosition` (`apps/wallet/src/lib/api/positions.ts`) for the `positions`/`marketTokens` write shape. The three open design questions this plan originally flagged (settlement model, whether to write a `positions` row, dialog vs. page for the confirm UI) were put to the user via `AskUserQuestion` and are now resolved (see Ambiguity assessment). The plan below is written directly against those answers, with the exact mechanics of the async-settlement extension (which routes call `syncPendingCustodyState`, which client queries poll, how `settleWithdrawal` is generalized) verified against the real files rather than assumed.

## Ambiguity assessment

**Level: Low**

All three open decisions from the first draft of this plan were resolved by the user:

1. **Settlement model → Async `PENDING`, mirroring withdrawals.** The purchase transaction is inserted `PENDING` at request time (balance reserved immediately: `available -= totalCost`, `locked += totalCost`, exactly like `createCustodyWithdrawal`, `custody-wallet.ts:71-105`). The multi-table write the acceptance criteria calls "atomic" (holdings + positions + `units.tokensSold` + `marketTokens`) happens **at settlement time**, inside its own `db.transaction()`, once the mock's simulated transfer reaches `COMPLETED` — reusing and extending the exact `syncPendingCustodyState` reconciliation mechanism that already exists for deposits/withdrawals (`custody-wallet.ts:126-154`), which is already invoked from two polling GET routes (`apps/wallet/src/app/api/wallet/balances/route.ts:9-16`, `apps/wallet/src/app/api/transactions/route.ts:8-14`) and whose corresponding client queries already poll every 3s (`apps/wallet/src/hooks/use-queries.ts:59-65` `useWalletBalances`, `:81-84` `useTransactions`, both `refetchInterval: 3000` per direct inspection). This plan additionally wires the same `syncPendingCustodyState` call into the holdings/positions/project-units GET routes (Phase 1.5 below) so those read models self-heal too, not just balances/transactions.
2. **`positions` row → Yes, `FILLED`.** A primary purchase inserts a `positions` row with `status: "FILLED"`, `filledAmount = totalAmount` (the schema already supports this status value, `packages/db/src/types.ts:34`), at settlement time alongside the holdings/supply updates.
3. **Confirm UI → New two-step dialog**, `invest-confirm-dialog.tsx`, opened from the unit's existing "INVERTIR" button (replacing today's `router.push('/exchange/...')` for tokenized units), not a new route/page.

Residual, non-blocking implementation notes (not open decisions, just things to be aware of while coding — see inline notes in Phase 1 and Phase 4):
- `custody-wallet.ts` and the new `invest.ts` end up importing from each other (vault helpers one way, settlement side-effects the other way). This is a harmless function-level circular import (nothing runs at module-eval time in either file), not a design smell to "fix" with an extra abstraction layer.
- Because unit supply (`units.tokensSold`) is a *shared, cross-user* resource — unlike a single user's own balance — the settlement-time write re-validates sold-out atomically and can still fail (refunding the user) even though the simulated custody transfer itself already "completed." This is intentional and described in Phase 1.4.

## Current state (research findings)

| Area | Location | Notes |
|---|---|---|
| Purchasable unit shape | `packages/db/src/schema.ts:102-130` (`units` table); sample `apps/wallet/src/sample-data/projectUnits.json` | Each tokenized unit has `tokenSymbol`, `totalTokens`, `tokensSold`, `price` (formatted string e.g. `"$220,000"`), `statusRaw` (`"available"` \| `"upcoming"` \| `"sold_out"`). Price-per-token is constant across sampled data: `parse(price) / totalTokens` (e.g. `$220,000 / 2200 = $100`). `stages` (schema.ts:132-145) is an unrelated display grouping (project timeline, no FK to `units`) — ignore it for the write path. |
| No `available` column on `units` | `apps/wallet/src/lib/api/project-units.ts:6-23` | Server never computes remaining supply today — every consumer (`project-units-page.tsx:249-269`, `unit-details-dialog.tsx:86-99`) derives `available = totalTokens - tokensSold` client-side. This feature is the first place that authoritatively decrements `units.tokensSold`. |
| Current "INVERTIR" click behavior (to replace) | `apps/wallet/src/components/pages/project-units-page.tsx`, `onInvest` prop passed to `UnitDetailsDialog` | For tokenized units: `router.push('/exchange/${tokenSymbol}')` (wrong destination — secondary market). For non-tokenized (`full_property`) units: opens the existing "contact advisor" dialog (`project-units-page.tsx:603-726`) — **leave that branch untouched**, different investment type, out of scope. |
| `UnitDetailsDialog` invest wiring | `apps/wallet/src/components/unit-details-dialog.tsx:36-39,179-229` | `onInvest?: (data: MarketToken \| ProjectUnit) => void`; "INVERTIR" action (~L209-228) calls `onInvest(data)` if provided, else falls back to `/exchange/{symbol}`. Also used from `apps/wallet/src/components/pages/assets-page.tsx:543-596` for the **portfolio/secondary-market** flow (opens `TradeDialog`) — do not touch that call site, unrelated screen (task 15). |
| `UnitDetailsSheet` (presentational shell) | `apps/wallet/src/components/unit-details-sheet.tsx:10-22` | Generic `actions`/`children` slots, no stepper built in — the new dialog is a sibling component, not an extension of this shell. |
| `UnitDetailsActions` | `apps/wallet/src/components/unit-details-actions.tsx:7-21,74` | Supports `disabled` per action — use to disable/relabel "INVERTIR" when `statusRaw !== "available"`. |
| Auth + KYC guard (reuse as-is) | `apps/wallet/src/lib/api-auth.ts` (`requireUser()`, `unauthorizedResponse()`); `apps/wallet/src/lib/kyc-guard.ts` (`checkKycApproved(userId)`, `kycBlockedResponse(status)`) | Exact sequence already used by every mutating wallet route, e.g. `apps/wallet/src/app/api/wallet/withdraw/route.ts:16-20`. Reuse verbatim. |
| Custody vault helpers (reuse) | `apps/wallet/src/lib/custody.ts:1-10` (`getCustodyProvider()`); `apps/wallet/src/lib/api/custody-wallet.ts:7-9,24-37` (`USDT_ASSET_ID`, `ensureProjectionBalance` — currently module-private, needs `export` added, `:24`), `getOrCreateCustodyVault` (`:28-37`) | `getOrCreateCustodyVault(userId)` already creates/finds the user's Fireblocks-mock vault account and enables `USDT`. No "platform treasury" vault exists yet — new sibling helper needed (Phase 1.2). |
| Custody transfer semantics (constraint) | `packages/fireblocks-mock/src/fireblocks-mock-provider.ts:85` (`createTransfer`), `:51-60` (`resolveDue`) | `createTransfer` validates against the **Fireblocks-side** vault balance (`fireblocksBalances`), separate from the app's own `balances` table, and only actually moves that vault balance later inside `resolveDue()` once `confirmingAt`/`completionAt` elapse (default ~1-2s, `:20-21`). Plain async call, not participating in any DB transaction. |
| **Hard constraint: never call the custody provider from inside `getDb().transaction()`** | `apps/wallet/src/lib/db.ts:1-7`, `apps/wallet/src/lib/custody.ts:1-10`, `packages/db/src/client.ts:1-12` | `getCustodyProvider()` is bound to the same shared `getDb()` singleton the app uses (both memoized on `globalThis`), backed by `@libsql/client` against a local SQLite file (single writer). Awaiting a custody-provider call from *inside* an open `db.transaction(async (tx) => ...)` risks a self-deadlock (the open transaction holds the write lock while waiting on a nested call that needs that same lock). `createCustodyWithdrawal` avoids this today by never using `db.transaction()` at all. This plan's request-time step (Phase 1.3) stays non-transactional (sequential statements, mirroring withdrawal exactly); the actual atomic multi-table write happens later, at settlement time (Phase 1.4), in its own `db.transaction()`, **after** the custody transfer status is already known — so the constraint is never at risk there either. |
| Insufficient-balance error precedent | `apps/wallet/src/lib/api/custody-wallet.ts:71-79` | App-level balance check throws `CustodyProviderError("INSUFFICIENT_BALANCE", ...)`. This plan uses its own `PurchaseError` type for all app-level purchase validation instead (uniform error vocabulary for this feature — see Phase 1.1), and the route maps both error types to HTTP statuses. |
| Reconciliation entry point (to extend) | `apps/wallet/src/lib/api/custody-wallet.ts:107-154` (`settleWithdrawal`, `syncPendingCustodyState`) | `syncPendingCustodyState(userId)` scans the user's `PENDING` transactions; for rows with `metadata.transferId` it fetches the transfer and calls `settleWithdrawal`, which releases/refunds the `locked` balance based on `transfer.status` and flips the transaction to `COMPLETED`/`FAILED`. This plan adds a sibling `settlePurchase` and dispatches on `row.type` (Phase 1.4). |
| Routes that already call the reconciler | `apps/wallet/src/app/api/wallet/balances/route.ts:9-16`, `apps/wallet/src/app/api/transactions/route.ts:8-14` | Both call `await syncPendingCustodyState(user.id)` before reading. This plan adds the same one-line call to the holdings/positions/project-units GET routes (Phase 1.5) so a purchase settling doesn't require the user to specifically hit balances/transactions first. |
| Client polling that surfaces settlement | `apps/wallet/src/hooks/use-queries.ts:59-65` (`useWalletBalances`, `refetchInterval: 3000`), `:81-84` (`useTransactions`, `refetchInterval: 3000`) | These two already poll every 3s regardless of any mutation — this is *why* the withdrawal/deposit `PENDING → COMPLETED` flip becomes visible without an explicit re-invalidate. The new purchase flow rides the same mechanism. |
| `positions` write precedent | `apps/wallet/src/lib/api/positions.ts:31-42` | Only existing `positions` writer; resolves a `marketTokens` row by symbol first. This plan resolves by `unitId` instead, with get-or-create (see Ambiguity #2 / Phase 1.4). |
| `holdings` read/join precedent | `apps/wallet/src/lib/api/holdings.ts:1-24` | Already joins `holdings.tokenId → marketTokens.id → (projects, units via marketTokens.unitId)` — the read side is already built to display unit-linked holdings once such a `marketTokens` row exists. |
| `transactions` type/shape | `packages/db/src/types.ts:35-36` (`TransactionType` already includes `"BUY"`); `apps/wallet/src/lib/api/transactions.ts:6-14` (read-mapping to reuse for the response) | No schema change needed. |
| Seed/linkage gap (Ambiguity #2 evidence) | `packages/db/src/seed.ts:278-296` (`mapMarketTokens`, all `unitId: null`), `:48` (`HOLDING_UNIT_LINKS`) | No general unit↔marketToken linkage exists yet; get-or-create at settlement time is additive, not a migration. |
| Client hook/invalidation precedent | `apps/wallet/src/hooks/use-queries.ts:132-141` (`useCreatePosition`), `:152-159` (`useCreateWithdrawal`) | `useCreatePosition` invalidates `["wallet","positions"]` + `["wallet","holdings"]`; `useCreateWithdrawal` invalidates `["transactions"]` + `["wallet","balances"]`. The new hook needs the union, plus `["projects", projectId, "units"]`. |
| Client fetch-wrapper precedent | `apps/wallet/src/lib/api-client.ts:224-230` (`createWithdrawal`), `:213-222` (`walletApiError`) | Exact template for the new `purchaseUnitTokens` client function. |
| No existing per-unit purchase route | `apps/wallet/src/app/api/projects/[id]/units/route.ts` (list only) | New nested dynamic route needed: `[id]/units/[unitId]/purchase`. |
| Route file header precedent | `apps/wallet/src/app/api/projects/[id]/stages/route.ts`, `.../purchase-options/route.ts` | `export const runtime = "nodejs"; export const dynamic = "force-dynamic";` on every route — copy verbatim. |
| Price-string parsing (currently client-only) | `apps/wallet/src/components/unit-details-dialog.tsx:53-61` (`parsePriceToNumber`, local to that file); `apps/wallet/src/lib/format.ts:1-23` (no such helper yet) | Needs a shared, server-usable parser — add once to `lib/format.ts`, use both server-side (Phase 1.1) and to de-duplicate the client-side copy (Phase 4, optional cleanup). |
| No toast/snackbar system in the app | repo-wide search for `toast`/`Toaster`/`sonner` under `apps/wallet/src` returns nothing | Purchase submission/settlement feedback must be shown **inline in the dialog**, not via a toast — matches how the rest of the app has no such infra. |

## Implementation steps

### Phase 1 — Server-side purchase domain logic

**1.1 — Add a shared USD-string parser.**
In `apps/wallet/src/lib/format.ts`, add:
```ts
export function parseUsdString(value: string): number {
  const n = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
```
(Optional cleanup, same concern: replace the local `parsePriceToNumber` in `apps/wallet/src/components/unit-details-dialog.tsx:53-61` with an import of this — same logic, currently duplicated.)

**1.2 — Export `ensureProjectionBalance`, add a platform treasury vault helper.**
In `apps/wallet/src/lib/api/custody-wallet.ts`:
- Change `async function ensureProjectionBalance(userId: string)` (`:24`) to `export async function ensureProjectionBalance(userId: string)`.
- Add, next to `getOrCreateCustodyVault` (`:28-37`), reusing the same pattern:
```ts
const TREASURY_CUSTOMER_REF_ID = "platform-treasury";

export async function getOrCreatePlatformTreasuryVault() {
  const provider = getCustodyProvider();
  const vault = (await provider.listVaultAccounts()).find((v) => v.customerRefId === TREASURY_CUSTOMER_REF_ID)
    ?? await provider.createVaultAccount({ name: "Platform Treasury", customerRefId: TREASURY_CUSTOMER_REF_ID });
  if (!(await provider.listEnabledAssets(vault.id)).includes(USDT_ASSET_ID)) {
    await provider.enableAsset(vault.id, USDT_ASSET_ID);
  }
  return vault;
}
```

**1.3 — Create `apps/wallet/src/lib/api/invest.ts`, request-time half (`purchaseUnitTokens`).**
This mirrors `createCustodyWithdrawal` (`custody-wallet.ts:71-105`) almost exactly: validate, call the custody port, reserve the balance (`available -= totalCost`, `locked += totalCost`), insert a `PENDING` transaction, return it. It deliberately does **not** touch `holdings`/`positions`/`units`/`marketTokens` yet — that happens at settlement (1.4).

```ts
import { balances, transactions, units } from "@repo/db";
import { and, eq, sql } from "drizzle-orm";
import { getCustodyProvider } from "@/lib/custody";
import { getDb } from "@/lib/db";
import { parseUsdString } from "@/lib/format";
import { ensureProjectionBalance, getOrCreateCustodyVault, getOrCreatePlatformTreasuryVault, USDT_ASSET_ID } from "./custody-wallet";

export type PurchaseErrorCode = "UNIT_NOT_FOUND" | "NOT_TOKENIZED" | "NOT_AVAILABLE" | "SOLD_OUT" | "INSUFFICIENT_BALANCE";
export class PurchaseError extends Error {
  readonly code: PurchaseErrorCode;
  constructor(code: PurchaseErrorCode, message: string) { super(message); this.name = "PurchaseError"; this.code = code; }
}

export interface PurchaseUnitTokensInput { projectId: string; unitId: string; tokenAmount: number; }

async function loadPurchasableUnit(projectId: string, unitId: string, tokenAmount: number) {
  const [unit] = await getDb().select().from(units).where(and(eq(units.id, unitId), eq(units.projectId, projectId)));
  if (!unit) throw new PurchaseError("UNIT_NOT_FOUND", "Unit not found");
  if (!unit.isTokenized || !unit.tokenSymbol || !unit.totalTokens) throw new PurchaseError("NOT_TOKENIZED", "This unit is not tokenized");
  if (unit.statusRaw !== "available") throw new PurchaseError("NOT_AVAILABLE", "This unit is not currently available for investment");
  if ((unit.tokensSold ?? 0) + tokenAmount > unit.totalTokens) throw new PurchaseError("SOLD_OUT", "Not enough tokens remaining for this unit");
  return unit;
}

export async function purchaseUnitTokens(userId: string, input: PurchaseUnitTokensInput) {
  const unit = await loadPurchasableUnit(input.projectId, input.unitId, input.tokenAmount);
  // unit.totalTokens is guaranteed non-null past loadPurchasableUnit's NOT_TOKENIZED check.
  const pricePerToken = Math.round((parseUsdString(unit.price) / unit.totalTokens!) * 100) / 100;
  const totalCost = Math.round(pricePerToken * input.tokenAmount * 100) / 100;

  await ensureProjectionBalance(userId);
  const [balanceRow] = await getDb().select().from(balances).where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
  if (!balanceRow || balanceRow.available < totalCost) throw new PurchaseError("INSUFFICIENT_BALANCE", "Insufficient USDT balance");

  const provider = getCustodyProvider();
  const userVault = await getOrCreateCustodyVault(userId);
  const treasuryVault = await getOrCreatePlatformTreasuryVault();
  const transfer = await provider.createTransfer({
    assetId: USDT_ASSET_ID, amount: String(totalCost), sourceVaultAccountId: userVault.id,
    destination: { type: "VAULT_ACCOUNT", vaultAccountId: treasuryVault.id },
    idempotencyKey: crypto.randomUUID(), note: `Purchase ${input.tokenAmount} ${unit.tokenSymbol}`,
  });

  // Reserve the whole cost immediately, before the mock transfer settles (mirrors createCustodyWithdrawal, custody-wallet.ts:90-94).
  await getDb().update(balances).set({
    available: sql`${balances.available} - ${totalCost}`,
    locked: sql`${balances.locked} + ${totalCost}`,
  }).where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));

  const [transactionRow] = await getDb().insert(transactions).values({
    userId, type: "BUY", status: "PENDING", amount: totalCost, currencyCode: "USDT",
    description: `Purchase of ${input.tokenAmount} tokens of ${unit.unitCode} (${unit.tokenSymbol})`,
    metadata: {
      transferId: transfer.id, unitId: unit.id, projectId: unit.projectId,
      tokenAmount: input.tokenAmount, pricePerToken, totalDebit: totalCost, custodyStatus: transfer.status,
    },
  }).returning();
  return transactionRow;
}
```

**1.4 — Same file, settlement-time half (`applyPurchaseEffects`).**
This is the "atomic write" the acceptance criteria describes — it just runs at settlement instead of at request time. Append to `invest.ts`:

```ts
import { holdings, marketTokens, positions, projects } from "@repo/db";
// (merge into the import block above)

export interface PurchaseSettlementDetails { unitId: string; tokenAmount: number; pricePerToken: number; }

/**
 * Runs once the simulated custody transfer for a purchase reaches COMPLETED.
 * Can still throw PurchaseError("SOLD_OUT", ...) if unit supply was exhausted by
 * other purchases while this one was pending — the caller (settlePurchase, in
 * custody-wallet.ts) treats that the same as a failed transfer: refund + mark FAILED.
 */
export async function applyPurchaseEffects(userId: string, details: PurchaseSettlementDetails) {
  return getDb().transaction(async (tx) => {
    const [unit] = await tx.select().from(units).where(eq(units.id, details.unitId));
    if (!unit || !unit.totalTokens) throw new PurchaseError("UNIT_NOT_FOUND", "Unit not found");

    const updatedUnits = await tx.update(units)
      .set({ tokensSold: sql`${units.tokensSold} + ${details.tokenAmount}` })
      .where(and(eq(units.id, unit.id), sql`${units.tokensSold} + ${details.tokenAmount} <= ${units.totalTokens}`))
      .returning({ tokensSold: units.tokensSold });
    if (updatedUnits.length === 0) throw new PurchaseError("SOLD_OUT", "Not enough tokens remaining for this unit");
    const newTokensSold = updatedUnits[0].tokensSold!;

    let [marketToken] = await tx.select().from(marketTokens).where(eq(marketTokens.unitId, unit.id));
    if (!marketToken) {
      const [project] = await tx.select().from(projects).where(eq(projects.id, unit.projectId));
      [marketToken] = await tx.insert(marketTokens).values({
        symbol: unit.tokenSymbol!, projectId: unit.projectId, unitId: unit.id,
        priceUsd: details.pricePerToken, marketCapUsd: details.pricePerToken * unit.totalTokens,
        change24hPct: 0, change7dPct: 0, change30dPct: 0, changeAllPct: 0,
        liveSince: new Date().toISOString(), tokensAvailable: unit.totalTokens - newTokensSold,
        roiPct: project?.roiPct ?? null, buyPriceUsd: details.pricePerToken, sellPriceUsd: details.pricePerToken,
      }).returning();
    } else {
      await tx.update(marketTokens).set({ tokensAvailable: unit.totalTokens - newTokensSold }).where(eq(marketTokens.id, marketToken.id));
    }

    await tx.insert(holdings).values({ userId, tokenId: marketToken.id, tokens: details.tokenAmount, costBasisPriceUsd: details.pricePerToken })
      .onConflictDoUpdate({
        target: [holdings.userId, holdings.tokenId],
        set: {
          tokens: sql`${holdings.tokens} + ${details.tokenAmount}`,
          costBasisPriceUsd: sql`((${holdings.tokens} * COALESCE(${holdings.costBasisPriceUsd}, 0)) + (${details.tokenAmount} * ${details.pricePerToken})) / (${holdings.tokens} + ${details.tokenAmount})`,
        },
      });

    await tx.insert(positions).values({
      userId, tokenId: marketToken.id, side: "BUY", totalAmount: details.tokenAmount, filledAmount: details.tokenAmount,
      orderPriceUsd: details.pricePerToken, openedMarketPriceUsd: details.pricePerToken, status: "FILLED",
    });
  });
}
```

**1.5 — Extend `syncPendingCustodyState` to settle purchases, and wire it into three more GET routes.**

In `apps/wallet/src/lib/api/custody-wallet.ts`, add a sibling to `settleWithdrawal` (`:107-124`):
```ts
import { PurchaseError, applyPurchaseEffects } from "./invest"; // add to the top of the file

async function settlePurchase(userId: string, row: typeof transactions.$inferSelect, transfer: Transfer) {
  const details = metadata(row);
  if (details.projected) return;
  const totalDebit = Number(details.totalDebit ?? row.amount);
  if (transfer.status === "COMPLETED") {
    try {
      await applyPurchaseEffects(userId, {
        unitId: details.unitId as string, tokenAmount: details.tokenAmount as number, pricePerToken: details.pricePerToken as number,
      });
      await getDb().update(balances).set({ locked: sql`MAX(0, ${balances.locked} - ${totalDebit})` })
        .where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
      await getDb().update(transactions).set({ status: "COMPLETED", metadata: { ...details, projected: true, custodyStatus: transfer.status } })
        .where(eq(transactions.id, row.id));
    } catch (error) {
      // Unit sold out to someone else while this purchase was pending settlement — refund, same as a failed transfer.
      const failureReason = error instanceof PurchaseError ? error.message : "Settlement failed";
      await getDb().update(balances).set({
        available: sql`${balances.available} + ${totalDebit}`,
        locked: sql`MAX(0, ${balances.locked} - ${totalDebit})`,
      }).where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
      await getDb().update(transactions).set({ status: "FAILED", metadata: { ...details, projected: true, custodyStatus: transfer.status, failureReason } })
        .where(eq(transactions.id, row.id));
    }
  } else if (transfer.status === "FAILED") {
    await getDb().update(balances).set({
      available: sql`${balances.available} + ${totalDebit}`,
      locked: sql`MAX(0, ${balances.locked} - ${totalDebit})`,
    }).where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
    await getDb().update(transactions).set({ status: "FAILED", metadata: { ...details, projected: true, custodyStatus: transfer.status, failureReason: transfer.failureReason } })
      .where(eq(transactions.id, row.id));
  }
}
```

Then change `syncPendingCustodyState`'s existing `else if (details.transferId)` branch (`custody-wallet.ts:144-151`) from unconditionally calling `settleWithdrawal` to dispatching on `row.type`:
```ts
} else if (details.transferId) {
  const transfer = await provider.getTransfer(details.transferId);
  if (transfer) {
    if (row.type === "BUY") await settlePurchase(userId, row, transfer);
    else await settleWithdrawal(userId, row, transfer);
    if (transfer.status !== details.custodyStatus && transfer.status !== "COMPLETED" && transfer.status !== "FAILED") {
      await getDb().update(transactions).set({ metadata: { ...details, custodyStatus: transfer.status } }).where(eq(transactions.id, row.id));
    }
  }
}
```
Also wrap the existing `for (const row of rows) { ... }` loop body (`:131-153`) in a `try { ... } catch { /* one bad row shouldn't block the rest of this user's sync pass */ }` — the loop previously only ever did pure arithmetic updates that couldn't throw; `settlePurchase` can now throw (propagated from a DB error, not the caught `PurchaseError` which `settlePurchase` already handles internally) and a single row's failure should not prevent `balances`/`transactions` from loading at all.

Then add the one-line reconciliation call, matching `balances/route.ts:9-16` and `transactions/route.ts:8-14` exactly, to:
- `apps/wallet/src/app/api/wallet/holdings/route.ts` — change `if (!(await requireUser())) return unauthorizedResponse();` to capture the user (`const user = await requireUser(); if (!user) return unauthorizedResponse();`) and add `await syncPendingCustodyState(user.id);` before `getWalletHoldings()`. Note `getWalletHoldings()` itself resolves its own user internally via `getCurrentUserId()` (`lib/api/holdings.ts:8`) — that's unchanged, this only adds the reconciliation call using the same `user.id` already available from `requireUser()`.
- `apps/wallet/src/app/api/wallet/positions/route.ts` — same change to its `GET` handler (`:10-14`).
- `apps/wallet/src/app/api/projects/[id]/units/route.ts` — same change to its `GET` handler (`:8-16`); `syncPendingCustodyState` here is user-scoped, not project-scoped, so it's still just `await syncPendingCustodyState(user.id);` regardless of which project's units are being listed.

### Phase 2 — API route

Create `apps/wallet/src/app/api/projects/[id]/units/[unitId]/purchase/route.ts`:
```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { purchaseUnitTokens, PurchaseError } from "@/lib/api/invest";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";
import { checkKycApproved, kycBlockedResponse } from "@/lib/kyc-guard";
import { CustodyProviderError } from "@repo/providers-custody";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const purchaseSchema = z.object({ tokenAmount: z.number().int().positive() });

const PURCHASE_ERROR_STATUS: Record<string, number> = {
  UNIT_NOT_FOUND: 404, NOT_TOKENIZED: 400, NOT_AVAILABLE: 409, SOLD_OUT: 409, INSUFFICIENT_BALANCE: 409,
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string; unitId: string }> }) {
  const user = await requireUser();
  if (!user) return unauthorizedResponse();
  const blocked = await checkKycApproved(user.id);
  if (blocked) return kycBlockedResponse(blocked);
  const { id, unitId } = await params;
  const parsed = purchaseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid purchase request", issues: parsed.error.issues }, { status: 400 });
  try {
    const transaction = await purchaseUnitTokens(user.id, { projectId: id, unitId, tokenAmount: parsed.data.tokenAmount });
    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    if (error instanceof PurchaseError) return NextResponse.json({ error: error.message, code: error.code }, { status: PURCHASE_ERROR_STATUS[error.code] ?? 409 });
    if (error instanceof CustodyProviderError) return NextResponse.json({ error: error.message, code: error.code }, { status: error.code === "INSUFFICIENT_BALANCE" ? 409 : 422 });
    throw error;
  }
}
```
The response's `transaction` is the raw DB row (`createdAt` a `Date`, `amount`/`currencyCode` flat — not yet the client `Transaction`/`MoneyAmount` shape from `apps/wallet/src/types/wallet.ts:128-136`). Map it inline before returning, the same way `apps/wallet/src/lib/api/transactions.ts:9-13` does:
```ts
return NextResponse.json({
  transaction: {
    id: transaction.id, type: transaction.type, status: transaction.status, createdAt: transaction.createdAt.toISOString(),
    amount: { currencyCode: transaction.currencyCode, amount: transaction.amount },
    description: transaction.description ?? undefined, metadata: transaction.metadata ?? undefined,
  },
}, { status: 201 });
```

### Phase 3 — Client wiring (api-client + query hook)

**3.1** — In `apps/wallet/src/lib/api-client.ts`, add (next to `createWithdrawal`, `:224-230`, same pattern):
```ts
export async function purchaseUnitTokens(projectId: string, input: { unitId: string; tokenAmount: number }): Promise<Transaction> {
  const res = await fetch(getApiUrl(`/api/projects/${projectId}/units/${input.unitId}/purchase`), {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tokenAmount: input.tokenAmount }),
  });
  if (!res.ok) throw await walletApiError(res, "Purchase failed");
  return (await res.json()).transaction;
}
```

**3.2** — In `apps/wallet/src/hooks/use-queries.ts`, add (next to `useCreatePosition`, `:132-141`; import `purchaseUnitTokens` alongside the other `api-client` imports at the top, `:1-10`):
```ts
export function useInvestPurchase(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { unitId: string; tokenAmount: number }) => purchaseUnitTokens(projectId, input),
    onSuccess: () => {
      // The transaction returned here is still PENDING — these invalidations are correct but
      // will initially refetch unchanged holdings/positions/units. The real update surfaces via
      // useTransactions' 3s polling (already wired to syncPendingCustodyState) — see Phase 4.2.
      queryClient.invalidateQueries({ queryKey: ["wallet", "positions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "holdings"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "balances"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "units"] });
    },
  });
}
```

### Phase 4 — UI: confirm-purchase dialog + wiring

**4.1 — New component** `apps/wallet/src/components/invest-confirm-dialog.tsx`.

Props: `isOpen: boolean; onClose: () => void; unit: ProjectUnit; projectId: string; availableBalance: number;`

Internal state machine — `step: "amount" | "review" | "processing"`:
- **`"amount"`** (default): stepper (+/- and direct numeric input) for `tokenAmount` (default `1`, clamp to `[1, (unit.totalTokens ?? 0) - (unit.tokensSold ?? 0)]`). Derive `pricePerToken = parseUsdString(unit.price) / (unit.totalTokens ?? 1)` (Phase 1.1's shared helper) and `totalCost = tokenAmount * pricePerToken`. Show live `formatPrice(totalCost)`. Disable "Continuar" when `tokenAmount < 1`, exceeds available supply, or `totalCost > availableBalance` — show which limit was hit inline.
- **`"review"`**: summary (unit title/code, token count, price/token via `formatPrice`, total cost, resulting balance = `availableBalance - totalCost`), "Confirmar Compra" button.
- **`"processing"`** (new state, required by the async settlement model from Ambiguity #1): entered right after `useInvestPurchase(projectId).mutateAsync({ unitId: unit.id, tokenAmount })` resolves. Store the returned transaction's `id`. Show "Procesando tu compra..." with a spinner — this is intentionally *not* a final success state, since the transaction is `PENDING` at this point. Use `useTransactions()` (already polling every 3s, `use-queries.ts:81-84`) in a `useEffect`: find the entry matching the stored transaction id; while absent or still `PENDING`, keep showing the spinner; once found with `status === "COMPLETED"`, invalidate `["wallet","holdings"]`, `["wallet","positions"]`, `["projects", projectId, "units"]` (balances/transactions are already fresh from the same poll that revealed the flip) and show a success panel (token count purchased, a "Listo" button that calls `onClose()`); once found with `status === "FAILED"`, show `transaction.metadata?.failureReason` (or a generic message) and a "Cerrar" button.
- A "Cerrar"/close affordance should remain available even while `"processing"` (settlement typically resolves in ~2-4s given the mock's default delays, but the user shouldn't be trapped in the dialog) — closing early is safe: Phase 1.5's routes mean holdings/positions/units self-heal on next natural fetch regardless of whether this dialog is still mounted to observe it.
- On mutation error (request-time failure, e.g. `INSUFFICIENT_BALANCE`/`SOLD_OUT`/`NOT_AVAILABLE`/`NOT_TOKENIZED`/`UNIT_NOT_FOUND` from `error.code`, a `WalletApiError` per `api-client.ts:213`), stay on `"review"` and show an inline error message mapped from the code, with a way to retry or close.
- Reuse `@repo/ui` primitives and Tailwind conventions already used in `apps/wallet/src/components/exchange/trade-dialog.tsx` (amount stepper look) and `unit-details-sheet.tsx` (sheet/dialog chrome) for visual consistency — no new design system needed.

**4.2 — Wire it into the unit CTA.** In `apps/wallet/src/components/pages/project-units-page.tsx`, replace the current `onInvest` handler passed to `UnitDetailsDialog` (currently `router.push('/exchange/${u.tokenSymbol}')` for tokenized units — see "Current state" table above):
```ts
onInvest={(unit) => {
  const u = unit as ProjectUnit;
  if (u.isTokenized && u.tokenSymbol) {
    if (u.statusRaw !== "available") return; // covered by 4.3's disabled state; no-op safety net
    setPurchaseUnit(u);
    setIsPurchaseDialogOpen(true);
    return;
  }
  setIsContactDialogOpen(true); // unchanged, non-tokenized path
}}
```
Add `<InvestConfirmDialog isOpen={isPurchaseDialogOpen} onClose={...} unit={purchaseUnit} projectId={projectId} availableBalance={...} />` alongside the existing `UnitDetailsDialog`/contact-dialog JSX in this file. `availableBalance` comes from `useWalletBalances()` (`use-queries.ts:59-65`) — add that hook call to this page if not already present.

**4.3 — Disable "INVERTIR" for non-purchasable tokenized units.** Where the `actions` array for `UnitDetailsActions` is built (inside `unit-details-dialog.tsx`, `actions` array at lines ~179-229), set `disabled: isMarketToken ? false : (data as ProjectUnit).statusRaw !== "available"` on the "INVERTIR" entry, and optionally adjust its `label` (e.g. `"Próximamente"` for `upcoming`, `"Agotado"` for `sold_out`) — cosmetic, keep simple if time-constrained.

No changes are required to `apps/wallet/src/components/pages/invest-page.tsx` or `apps/wallet/src/components/pages/project-detail-page.tsx` — both are confirmed pure navigation entry points into `project-units-page.tsx` (project cards / "Explorar Unidades" / purchase-option cards) with no unit-level buy CTA of their own; they're listed in the task's "Related Source Code" as context, not as edit targets.
