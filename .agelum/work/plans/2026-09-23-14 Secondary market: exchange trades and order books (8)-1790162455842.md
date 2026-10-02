# Plan: Secondary market: exchange trades and order books

Task: `.agelum/work/tasks/pending/14 Secondary market: exchange trades and order books (8).md`

## Certainty assessment

**Level: High**

This is a greenfield feature (no bug/root-cause to locate) built directly on patterns already proven in this codebase. The DB schema (`packages/db/src/schema.ts`), the custody port + Fireblocks mock (`packages/providers-custody`, `packages/fireblocks-mock`), the KYC guard, and — most importantly — the exact async-settlement architecture this plan extends (`purchaseUnitTokens` / `applyPurchaseEffects` / `syncPendingCustodyState` in `apps/wallet/src/lib/api/invest.ts` and `apps/wallet/src/lib/api/custody-wallet.ts`, built for task 13) were all inspected directly. The two genuinely open design forks for this feature — where secondary-market counterparty liquidity comes from, and whether trade cash-legs settle synchronously or via async custody transfer — were put to the user via `AskUserQuestion` and are now resolved (see Ambiguity assessment). Every other design point below (self-trade prevention, MARKET partial-fill semantics, the new `trades` table, the `holdings.lockedTokens` column, dropping the dead `orderBookLevels` table, fixing the pre-existing broken cancel-order wiring) is a direct, low-risk extension of an existing, already-working pattern in this repo, not a novel judgment call — each is called out explicitly below with its rationale so the implementer doesn't need to re-derive it.

## Ambiguity assessment

**Level: Low**

The two decisions that actually fork the design were resolved by the user:

1. **Liquidity model → Synthetic market-maker.** A system pseudo-user (`MARKET_MAKER_USER_ID`) with its own Fireblocks-mock vault, a large seeded USDT balance, large per-token token inventory, and resting BUY/SELL positions (seeded from the same depth formula the old fake `makeDepth()` used) provides permanent counterparty liquidity, mirroring task 13's "Platform Treasury" pattern. Its resting orders "recycle" (reset to `OPEN`/`filledAmount: 0`) instead of terminating when fully filled, so the book never runs dry during a demo/alpha session.
2. **Trade settlement → Async via custody transfer.** Each matched fill's USDT leg moves buyer-vault → seller-vault through `provider.createTransfer` (the same Fireblocks-mock mechanism withdrawals/purchases use), with `PENDING → COMPLETED` transactions reconciled by extending `syncPendingCustodyState`. This keeps the Fireblocks-mock ledger authoritative so a user's later withdrawal is validated against real, consistent vault balances. Token ownership and the order book itself update **synchronously** at match time (see "Current state" table, row "Sync vs. async split") — only the cash leg's mirroring into the Fireblocks-mock ledger is deferred.

Residual implementation decisions below are additive/consistent with existing patterns, not open forks — flagged so the implementer knows they were considered, not overlooked:
- **Self-trade prevention: on.** A user's own resting orders are excluded from matching against their own new order (`ne(positions.userId, userId)` in the match query). Simple, avoids a user "trading with themselves" looking like a real fill, and the market-maker still guarantees liquidity either way.
- **MARKET orders never rest.** If a MARKET order can't be 100% filled by available resting liquidity, it fills as much as it can and the remainder is dropped (status `FILLED` if `filledAmount > 0`, else rejected with `NO_LIQUIDITY` if nothing at all could fill). This is standard exchange behavior and avoids inventing a new `PositionStatus` value.
- **New `trades` table.** The task itself says charts/series "should derive from persisted trades" — `transactions` is a private per-user ledger (deposits/withdrawals/purchases mixed in), unsuitable as a public, token-scoped trade tape. A dedicated `trades` table is the natural fit; not really a fork.
- **`holdings.lockedTokens` column.** `balances` already has an `available`/`locked` split for reserving USDT on open BUY orders; `holdings` has no equivalent, so a resting SELL order can't correctly reserve its offered tokens today. Adding `lockedTokens` (mirroring `balances.locked`) is the direct, minimal fix needed to satisfy the "insufficient holdings ... rejected" acceptance criterion for **resting** sell orders (not just the first one placed).
- **Cancel-order support included.** `apps/wallet/src/components/pages/exchange-page.tsx:298-319,591-618` already wires a full "Cerrar orden" UI to `useClosePosition()` → `closePosition(positionId)`, but the server route it posts to (`apps/wallet/src/app/api/wallet/positions/route.ts:19-30`) only implements order **creation** and would reject a `{positionId}` body with a 400 (pre-existing, currently-dead UI path). Once matching introduces real resting orders, users need a way to pull one back — this plan fixes that wiring (a small, self-contained addition) rather than leaving newly-real functionality unusable behind an already-built button.
- **`orderBookLevels` table is dropped.** It's static, seed-only display data with no link to any real, cancellable order (`apps/wallet/src/lib/api/orderbook.ts:7-24,41-50`) — exactly what this task replaces with a live aggregation over `positions`. Keeping the now-fully-unused table around would be confusing dead schema.

## Current state (research findings)

| Area | Location | Notes |
|---|---|---|
| Trade dialog UI (no changes needed) | `apps/wallet/src/components/exchange/trade-dialog.tsx` | Pure presentational component; already receives `marketSimulation` (client-side preview of expected fills) and calls `onConfirm`. No edits required. |
| Two call sites, identical shape | `apps/wallet/src/components/pages/exchange-detail-page.tsx:142,578`; `apps/wallet/src/components/desktop-token-tabs.tsx:126,722` | Both call `useCreatePosition().mutateAsync({ tokenSymbol, side: tradeType, orderType, totalAmount: Number(amount), orderPriceUsd })`. Since this plan keeps that exact request contract, **no client changes are needed at either call site** — the same request now triggers real matching server-side. |
| Third call site, out of scope for UI | `apps/wallet/src/components/pages/assets-page.tsx:58,735` | Same `createPosition` shape, portfolio screen (task 15's territory for UI). Not edited here, but automatically gets real matching/settlement behavior once the shared route/domain logic changes — worth knowing, not a to-do. |
| Order-book read path (to replace) | `apps/wallet/src/lib/api/orderbook.ts` | `makeDepth()` (`:7-24`) synthesizes fake depth from `token.priceUsd` whenever `orderBookLevels` is empty; `getMarketOrderBook` (`:26-51`) reads `orderBookLevels` first, falling back to `makeDepth`. `orderBookLevels` is currently seeded once from `apps/wallet/src/sample-data/marketOrderBooks.json` (`packages/db/src/seed.ts:371-381,463`) and never touched again — fully disconnected from `positions`. |
| Series read path (to replace) | `apps/wallet/src/lib/api/market-series.ts:43-68` | `makeSeries()` synthesizes a deterministic sine-wave series seeded from the symbol string + a change percentage; no real trade data involved at all today. |
| Order creation (to replace) | `apps/wallet/src/lib/api/positions.ts:23-42` (`createPosition`), `apps/wallet/src/app/api/wallet/positions/route.ts:19-30` | Inserts a bare `OPEN` position with no matching, no balance/holdings check beyond zod shape validation, no order-book effect. This is the mock behavior the whole task replaces. |
| Position read (reuse as-is) | `apps/wallet/src/lib/api/positions.ts:7-21` (`getWalletPositions`) | Already joins to `marketTokens` for `tokenSymbol`/`marketPriceUsd`; no changes needed — new positions inserted by the matching engine use the same shape. |
| Holdings read (reuse as-is, mostly) | `apps/wallet/src/lib/api/holdings.ts:1-24` | Already joins `holdings → marketTokens → projects`. Will also need to select the new `lockedTokens` column if it's ever surfaced in the UI — **not required by this task's acceptance criteria**, so left unselected/unused by the client; the column only matters server-side for validation. |
| Auth + KYC guard (reuse verbatim) | `apps/wallet/src/lib/api-auth.ts` (`requireUser`, `unauthorizedResponse`); `apps/wallet/src/lib/kyc-guard.ts` (`checkKycApproved`, `kycBlockedResponse`) | Exact sequence already used by `apps/wallet/src/app/api/wallet/positions/route.ts:19-23`. No changes to this part of the route. |
| Custody vault helpers (reuse) | `apps/wallet/src/lib/api/custody-wallet.ts:8` (`USDT_ASSET_ID`), `:25-27` (`ensureProjectionBalance`, already exported), `:41-50` (`getOrCreateCustodyVault`, generic over any `userId` — reusable verbatim for the market-maker) | No changes needed to these; reused as-is for the market-maker's vault. |
| Async-settlement pattern to extend | `apps/wallet/src/lib/api/custody-wallet.ts:120-137` (`settleWithdrawal`), `:139-171` (`settlePurchase`), `:174-206` (`syncPendingCustodyState`) | `syncPendingCustodyState(userId)` scans the user's `PENDING` transactions and, for rows with `metadata.transferId`, dispatches on `row.type` (`:195` `if (row.type === "BUY") settlePurchase(...) else settleWithdrawal(...)`). This plan adds a `settleTrade` sibling and changes the dispatch to check `metadata.tradeId` **first** (transactions from this feature are also `type: "BUY"`/`"SELL"`, so they'd otherwise be misrouted into `settlePurchase`/`settleWithdrawal`). |
| Hard constraint (already documented, still applies) | Same file, general pattern | Never call the custody provider (`getCustodyProvider()`) from inside `getDb().transaction()` — single shared SQLite connection, self-deadlock risk. This plan's matching step is a plain `db.transaction()` with **no custody calls inside**; custody transfers are submitted in a loop **after** that transaction commits (see Phase 2). |
| Routes that already call the reconciler | `apps/wallet/src/app/api/wallet/balances/route.ts:9-16`, `apps/wallet/src/app/api/transactions/route.ts:8-14`, `apps/wallet/src/app/api/wallet/positions/route.ts:11-17` (added by task 13), `apps/wallet/src/app/api/wallet/holdings/route.ts`, `apps/wallet/src/app/api/projects/[id]/units/route.ts` | All already call `await syncPendingCustodyState(user.id)` before reading — the new `settleTrade` path rides these same call sites for free. No new wiring needed here. |
| Client polling that surfaces settlement | `apps/wallet/src/hooks/use-queries.ts:60-66` (`useWalletBalances`, `refetchInterval: 3000`), `:82-84` (`useTransactions`, `refetchInterval: 3000`) | Same 3s polling used by task 13's async purchase flow surfaces a trade's seller-side balance credit once its transfer settles (typically ~1-3s later per the mock's default delays) — no new polling needed. |
| Mutation invalidation (needs a small addition) | `apps/wallet/src/hooks/use-queries.ts:133-142` (`useCreatePosition`) | Currently only invalidates `["wallet","positions"]` and `["wallet","holdings"]`. Since order placement now also touches `balances` (reserved immediately) and inserts `transactions` rows (`PENDING`), this plan adds `["wallet","balances"]` and `["transactions"]` invalidations too (Phase 5). |
| Order sizes/prices are integers/floats | `packages/db/src/schema.ts:208-209` (`positions.totalAmount`/`filledAmount` are `integer`), `:209` (`orderPriceUsd` is `real`) | Confirms the matching engine works in whole-token units; no fractional-token fills. |
| `holdings` unique key (needed for get-or-create-on-fill) | `packages/db/src/schema.ts:189` (`uniqueIndex("holdings_user_id_token_id_unique")`) | Reused for `onConflictDoUpdate` when crediting a buyer's holdings during a fill, exactly like `applyPurchaseEffects` does today (`apps/wallet/src/lib/api/invest.ts:192-199`). |
| Custody port primitives to use | `packages/providers-custody/src/port.ts:13` (`createTransfer`), `:26` (`mintAsset`) | `mintAsset` is the right primitive for seeding the market-maker's initial USDT balance (instant, no confirmation delay, unlike `createTransfer`/ramp requests) — see `packages/fireblocks-mock/src/fireblocks-mock-provider.ts:103` (`assetOperation`, idempotent via `idempotencyKey`, guarded against double-minting). |
| `createTransfer` failure mode (bounds the "trade transfer fails" edge case) | `packages/fireblocks-mock/src/fireblocks-mock-provider.ts:85` | Only throws synchronously for insufficient Fireblocks-side balance, bad destination, frozen/paused/ineligible assets, or non-positive amount — all pre-validated by this plan's request-time checks. It can still resolve to `FAILED` asynchronously via `intendedOutcome`/`transferOutcomes` overrides (test-only knobs), which `settleTrade` must handle, but in normal operation this path is not expected to fire. Documented as an accepted alpha-scope limitation (see Phase 2.4) rather than building a full compensating-transaction/saga system. |
| No `packages/domain` yet | `packages/` listing | Task 19 ("Extract packages-domain") is a separate, later task — this plan keeps the new matching/settlement/market-maker logic in `apps/wallet/src/lib/api/*`, consistent with where `invest.ts`/`custody-wallet.ts`/`positions.ts` already live. Do not pre-extract a package here. |

## Implementation steps

### Phase 0 — Schema changes

**0.1 — `packages/db/src/schema.ts`: add `lockedTokens` to `holdings`.**
```ts
export const holdings = sqliteTable(
  "holdings",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenId: text("token_id").notNull().references(() => marketTokens.id),
    tokens: integer("tokens").notNull(),
    lockedTokens: integer("locked_tokens").notNull().default(0), // NEW — mirrors balances.locked, for resting SELL orders
    costBasisPriceUsd: real("cost_basis_price_usd"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("holdings_user_id_token_id_unique").on(table.userId, table.tokenId), index("holdings_user_id_idx").on(table.userId)],
);
```

**0.2 — Add a `trades` table** (right after `orderBookLevels`'s current position in the file, which is removed in 0.3):
```ts
export const trades = sqliteTable(
  "trades",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tokenId: text("token_id").notNull().references(() => marketTokens.id, { onDelete: "cascade" }),
    price: real("price").notNull(),
    amount: integer("amount").notNull(),
    takerSide: text("taker_side").$type<PositionSide>().notNull(),
    buyPositionId: text("buy_position_id").notNull().references(() => positions.id),
    sellPositionId: text("sell_position_id").notNull().references(() => positions.id),
    buyUserId: text("buy_user_id").notNull().references(() => users.id),
    sellUserId: text("sell_user_id").notNull().references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [index("trades_token_id_created_at_idx").on(table.tokenId, table.createdAt)],
);
```
Add `trades` to the `schema` export bag at the bottom of the file (`:309`).

**0.3 — Remove `orderBookLevels`.** Delete the `orderBookLevels` table definition (`packages/db/src/schema.ts:230-238`), its relation (`orderBookLevelsRelations`, `:306`), and its entries in the `schema` bag (`:309`). Remove the now-unused `OrderBookSide` type from `packages/db/src/types.ts:37` and its import in `schema.ts:14`.

**0.4 — `packages/db/src/types.ts`:** remove `OrderBookLevel`/`NewOrderBookLevel` (`:70-71`) and their import (`orderBookLevels` from `:19`); add `Trade`/`NewTrade`:
```ts
export type Trade = typeof trades.$inferSelect;
export type NewTrade = typeof trades.$inferInsert;
```
(add `trades` to the `import type { ... } from "./schema"` block at the top).

**0.5 — `packages/db/src/seed.ts`:** remove all `orderBookLevels` references — the `mapOrderBooks` function (`:371-381`), the `orderBookFixtures` read (`readFixture<OrderBookFixture>("marketOrderBooks.json")`, in the `Promise.all` block), the `orderBookRows` variable and its `tx.delete(orderBookLevels)`/`tx.insert(orderBookLevels)` calls, its `sqlite_sequence` reset entry (`order_book_levels`), and its `counts` array entry. No fixture file needs to be deleted (`marketOrderBooks.json` is no longer read anywhere — leave the file itself; the market-maker's own depth formula does not use it, see Phase 1).

**0.6 — Generate the migration.** Run `pnpm --filter @repo/db db:generate` (drizzle-kit reads `packages/db/drizzle.config.ts`) to produce `packages/db/drizzle/0004_*.sql` from the schema diff (adds `holdings.locked_tokens` with default 0, creates `trades`, drops `order_book_levels`). Do not hand-write the SQL.

### Phase 1 — Market-maker liquidity

**New file `apps/wallet/src/lib/api/market-maker.ts`:**

```ts
import { balances, holdings, positions, users } from "@repo/db";
import { and, eq } from "drizzle-orm";
import { getCustodyProvider } from "@/lib/custody";
import { getDb } from "@/lib/db";
import { getOrCreateCustodyVault, USDT_ASSET_ID } from "./custody-wallet";

export const MARKET_MAKER_USER_ID = "system-market-maker";
const MARKET_MAKER_EMAIL = "market-maker@realinvest.internal";
const MARKET_MAKER_USDT_SEED = "10000000"; // 10M USDT — generous alpha buffer, never expected to run dry in a demo session
const MARKET_MAKER_TOKEN_INVENTORY = 1_000_000; // per token, same rationale

function generateInitialDepth(priceUsd: number): { asks: Array<{ price: number; amount: number }>; bids: Array<{ price: number; amount: number }> } {
  // Same formula as the old client-visible fake depth (apps/wallet/src/lib/api/orderbook.ts:7-24) —
  // kept for visual continuity, now used to seed *real*, cancellable, matchable resting orders.
  const asks = Array.from({ length: 6 }).map((_, i) => ({
    price: Math.round(priceUsd * (1 + (i + 1) * 0.005) * 100) / 100,
    amount: Math.floor((Math.sin(i * 123.45) * 0.5 + 0.5) * 500) + 50,
  })).reverse();
  const bids = Array.from({ length: 6 }).map((_, i) => ({
    price: Math.round(priceUsd * (1 - (i + 1) * 0.005) * 100) / 100,
    amount: Math.floor((Math.cos(i * 123.45) * 0.5 + 0.5) * 500) + 50,
  }));
  return { asks, bids };
}

export async function getOrCreateMarketMaker() {
  await getDb().insert(users).values({ id: MARKET_MAKER_USER_ID, name: "Market Maker", email: MARKET_MAKER_EMAIL }).onConflictDoNothing();
  const vault = await getOrCreateCustodyVault(MARKET_MAKER_USER_ID); // creates vault, enables USDT, ensures the balances projection row
  await getCustodyProvider().mintAsset({
    vaultAccountId: vault.id, assetId: USDT_ASSET_ID, amount: MARKET_MAKER_USDT_SEED,
    idempotencyKey: `market-maker-seed-usdt-${vault.id}`, // idempotent: a repeat call is a no-op past the first mint
  });
  await getDb().update(balances).set({ available: Number(MARKET_MAKER_USDT_SEED) })
    .where(and(eq(balances.userId, MARKET_MAKER_USER_ID), eq(balances.currencyCode, "USDT")));
  return vault;
}

/** Idempotent: seeds this token's market-maker holdings + resting book once, on first use. */
export async function ensureMarketMakerLiquidity(tokenId: string, priceUsd: number) {
  await getOrCreateMarketMaker();
  const [existing] = await getDb().select().from(holdings).where(and(eq(holdings.userId, MARKET_MAKER_USER_ID), eq(holdings.tokenId, tokenId)));
  if (existing) return;
  await getDb().insert(holdings).values({ userId: MARKET_MAKER_USER_ID, tokenId, tokens: MARKET_MAKER_TOKEN_INVENTORY }).onConflictDoNothing();
  const { asks, bids } = generateInitialDepth(priceUsd);
  const rows = [
    ...asks.map((level) => ({ userId: MARKET_MAKER_USER_ID, tokenId, side: "SELL" as const, totalAmount: level.amount, filledAmount: 0, orderPriceUsd: level.price, openedMarketPriceUsd: priceUsd, status: "OPEN" as const })),
    ...bids.map((level) => ({ userId: MARKET_MAKER_USER_ID, tokenId, side: "BUY" as const, totalAmount: level.amount, filledAmount: 0, orderPriceUsd: level.price, openedMarketPriceUsd: priceUsd, status: "OPEN" as const })),
  ];
  await getDb().insert(positions).values(rows);
}
```

Note: `available` is set with a plain number, not `sql\`...\``, because this only ever runs once per process against a freshly-inserted `0`-balance row (from `ensureProjectionBalance` inside `getOrCreateCustodyVault`) — a second call is a no-op since `existing` guards the whole per-token bootstrap, and the vault mint is separately idempotent. A concurrent double-call race on the very first request is a benign, alpha-acceptable edge case (worst case: the balance is set twice to the same value).

### Phase 2 — Matching engine, order placement, cancellation

**New file `apps/wallet/src/lib/api/trading.ts`.**

**2.1 — Error type and input shape:**
```ts
export type TradingErrorCode = "TOKEN_NOT_FOUND" | "INVALID_PRICE" | "INSUFFICIENT_BALANCE" | "INSUFFICIENT_HOLDINGS" | "NO_LIQUIDITY" | "POSITION_NOT_FOUND" | "NOT_CANCELLABLE";
export class TradingError extends Error {
  readonly code: TradingErrorCode;
  constructor(code: TradingErrorCode, message: string) { super(message); this.name = "TradingError"; this.code = code; }
}
export interface PlaceOrderInput { tokenSymbol: string; side: "BUY" | "SELL"; orderType: "MARKET" | "LIMIT"; totalAmount: number; orderPriceUsd?: number; }
interface Fill { counterpartyPositionId: string; counterpartyUserId: string; amount: number; price: number; }
```

**2.2 — `placeOrder(userId, input)` — validation + matching (no custody calls):**
```ts
import { balances, holdings, marketTokens, positions, trades, transactions } from "@repo/db";
import { and, asc, desc, eq, ne, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { ensureMarketMakerLiquidity, MARKET_MAKER_USER_ID } from "./market-maker";

export async function placeOrder(userId: string, input: PlaceOrderInput) {
  const [token] = await getDb().select().from(marketTokens).where(eq(marketTokens.symbol, input.tokenSymbol));
  if (!token) throw new TradingError("TOKEN_NOT_FOUND", "Unknown token symbol");
  if (input.orderType === "LIMIT" && !(input.orderPriceUsd && input.orderPriceUsd > 0)) {
    throw new TradingError("INVALID_PRICE", "Limit orders require a positive price");
  }
  const limitPrice = input.orderType === "LIMIT" ? input.orderPriceUsd! : null;

  await ensureMarketMakerLiquidity(token.id, token.priceUsd);

  if (input.side === "SELL") {
    const [holdingRow] = await getDb().select().from(holdings).where(and(eq(holdings.userId, userId), eq(holdings.tokenId, token.id)));
    const availableTokens = (holdingRow?.tokens ?? 0) - (holdingRow?.lockedTokens ?? 0);
    if (availableTokens < input.totalAmount) throw new TradingError("INSUFFICIENT_HOLDINGS", "Not enough available tokens to place this sell order");
  }

  // Price-time priority walk of the opposite book, excluding the taker's own resting orders (no self-trade).
  const oppositeSide = input.side === "BUY" ? "SELL" : "BUY";
  const resting = await getDb().select().from(positions).where(and(
    eq(positions.tokenId, token.id), eq(positions.side, oppositeSide),
    or(eq(positions.status, "OPEN"), eq(positions.status, "PARTIALLY_FILLED")),
    ne(positions.userId, userId),
  )).orderBy(input.side === "BUY" ? asc(positions.orderPriceUsd) : desc(positions.orderPriceUsd), asc(positions.openedAt));

  let remaining = input.totalAmount;
  const fills: Fill[] = [];
  for (const level of resting) {
    if (remaining <= 0) break;
    if (limitPrice !== null) {
      if (input.side === "BUY" && level.orderPriceUsd > limitPrice) break;
      if (input.side === "SELL" && level.orderPriceUsd < limitPrice) break;
    }
    const levelRemaining = level.totalAmount - level.filledAmount;
    if (levelRemaining <= 0) continue;
    const take = Math.min(remaining, levelRemaining);
    fills.push({ counterpartyPositionId: level.id, counterpartyUserId: level.userId, amount: take, price: level.orderPriceUsd });
    remaining -= take;
  }
  const filledAmount = input.totalAmount - remaining;
  if (input.orderType === "MARKET" && filledAmount === 0) throw new TradingError("NO_LIQUIDITY", "No resting orders available to match this order");

  const totalMatchedCost = Math.round(fills.reduce((sum, f) => sum + f.amount * f.price, 0) * 100) / 100;
  const restingRemainder = input.orderType === "LIMIT" ? remaining : 0; // MARKET never rests — see Ambiguity assessment
  const restingReserve = restingRemainder > 0 ? Math.round(restingRemainder * limitPrice! * 100) / 100 : 0;

  if (input.side === "BUY") {
    const totalReserve = totalMatchedCost + restingReserve;
    const [balanceRow] = await getDb().select().from(balances).where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
    if (!balanceRow || balanceRow.available < totalReserve) throw new TradingError("INSUFFICIENT_BALANCE", "Insufficient USDT balance for this order");
  }

  return applyMatchedOrder(userId, token, input, { limitPrice, filledAmount, fills, totalMatchedCost, restingReserve });
}
```

**2.3 — `applyMatchedOrder` — the atomic write (one `db.transaction()`, no custody calls inside), then the post-commit custody-transfer loop:**
```ts
async function applyMatchedOrder(
  userId: string, token: typeof marketTokens.$inferSelect, input: PlaceOrderInput,
  plan: { limitPrice: number | null; filledAmount: number; fills: Fill[]; totalMatchedCost: number; restingReserve: number },
) {
  const { limitPrice, filledAmount, fills, totalMatchedCost, restingReserve } = plan;

  const { takerPosition, transferTasks } = await getDb().transaction(async (tx) => {
    if (input.side === "BUY") {
      await tx.update(balances).set({
        available: sql`${balances.available} - ${totalMatchedCost + restingReserve}`,
        locked: sql`${balances.locked} + ${totalMatchedCost + restingReserve}`,
      }).where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
    } else {
      await tx.update(holdings).set({ lockedTokens: sql`${holdings.lockedTokens} + ${input.totalAmount}` })
        .where(and(eq(holdings.userId, userId), eq(holdings.tokenId, token.id)));
    }

    const status = input.orderType === "MARKET"
      ? (filledAmount > 0 ? "FILLED" : "CANCELLED")
      : filledAmount === 0 ? "OPEN" : filledAmount === input.totalAmount ? "FILLED" : "PARTIALLY_FILLED";
    const [takerPosition] = await tx.insert(positions).values({
      userId, tokenId: token.id, side: input.side, totalAmount: input.totalAmount, filledAmount,
      orderPriceUsd: limitPrice ?? token.priceUsd, openedMarketPriceUsd: token.priceUsd, status,
    }).returning();

    const transferTasks: Array<{ buyerUserId: string; sellerUserId: string; amount: number; buyTxnId: string; sellTxnId: string }> = [];

    for (const fill of fills) {
      const buyerUserId = input.side === "BUY" ? userId : fill.counterpartyUserId;
      const sellerUserId = input.side === "BUY" ? fill.counterpartyUserId : userId;
      const fillCost = Math.round(fill.amount * fill.price * 100) / 100;

      const [counterparty] = await tx.select().from(positions).where(eq(positions.id, fill.counterpartyPositionId));
      const newCounterpartyFilled = counterparty!.filledAmount + fill.amount;
      const counterpartyDone = newCounterpartyFilled >= counterparty!.totalAmount;
      const isMarketMaker = counterparty!.userId === MARKET_MAKER_USER_ID;
      await tx.update(positions).set({
        // Market-maker resting orders "recycle" instead of terminating — see Ambiguity assessment / Phase 1.
        filledAmount: isMarketMaker && counterpartyDone ? 0 : newCounterpartyFilled,
        status: isMarketMaker ? "OPEN" : (counterpartyDone ? "FILLED" : "PARTIALLY_FILLED"),
      }).where(eq(positions.id, fill.counterpartyPositionId));

      if (counterparty!.side === "BUY") {
        await tx.update(balances).set({ locked: sql`MAX(0, ${balances.locked} - ${fillCost})` })
          .where(and(eq(balances.userId, counterparty!.userId), eq(balances.currencyCode, "USDT")));
      } else {
        await tx.update(holdings).set({ lockedTokens: sql`MAX(0, ${holdings.lockedTokens} - ${fill.amount})` })
          .where(and(eq(holdings.userId, counterparty!.userId), eq(holdings.tokenId, token.id)));
      }

      // Token ownership moves immediately — pure internal ledger fact, no custody dependency.
      await tx.insert(holdings).values({ userId: buyerUserId, tokenId: token.id, tokens: fill.amount, costBasisPriceUsd: fill.price })
        .onConflictDoUpdate({ target: [holdings.userId, holdings.tokenId], set: {
          tokens: sql`${holdings.tokens} + ${fill.amount}`,
          costBasisPriceUsd: sql`((${holdings.tokens} * COALESCE(${holdings.costBasisPriceUsd}, 0)) + (${fill.amount} * ${fill.price})) / (${holdings.tokens} + ${fill.amount})`,
        } });
      await tx.update(holdings).set({
        tokens: sql`${holdings.tokens} - ${fill.amount}`,
        lockedTokens: sql`MAX(0, ${holdings.lockedTokens} - ${fill.amount})`,
      }).where(and(eq(holdings.userId, sellerUserId), eq(holdings.tokenId, token.id)));

      await tx.insert(trades).values({
        tokenId: token.id, price: fill.price, amount: fill.amount, takerSide: input.side,
        buyPositionId: input.side === "BUY" ? takerPosition.id : fill.counterpartyPositionId,
        sellPositionId: input.side === "BUY" ? fill.counterpartyPositionId : takerPosition.id,
        buyUserId, sellUserId: sellerUserId,
      });
      await tx.update(marketTokens).set({ priceUsd: fill.price }).where(eq(marketTokens.id, token.id));

      const tradeId = crypto.randomUUID();
      const [buyTxn] = await tx.insert(transactions).values({
        userId: buyerUserId, type: "BUY", status: "PENDING", amount: fillCost, currencyCode: "USDT",
        description: `Compra ${fill.amount} ${token.symbol} @ ${fill.price}`,
        metadata: { tradeId, tradeRole: "buyer", counterpartyUserId: sellerUserId, tokenId: token.id, amount: fill.amount, price: fill.price, totalUsd: fillCost },
      }).returning();
      const [sellTxn] = await tx.insert(transactions).values({
        userId: sellerUserId, type: "SELL", status: "PENDING", amount: fillCost, currencyCode: "USDT",
        description: `Venta ${fill.amount} ${token.symbol} @ ${fill.price}`,
        metadata: { tradeId, tradeRole: "seller", counterpartyUserId: buyerUserId, tokenId: token.id, amount: fill.amount, price: fill.price, totalUsd: fillCost },
      }).returning();
      transferTasks.push({ buyerUserId, sellerUserId, amount: fillCost, buyTxnId: buyTxn.id, sellTxnId: sellTxn.id });
    }

    return { takerPosition, transferTasks };
  });

  // Outside the transaction (hard constraint): one custody transfer per fill, then patch its id into both legs.
  for (const task of transferTasks) {
    const buyerVault = await getOrCreateCustodyVault(task.buyerUserId);
    const sellerVault = await getOrCreateCustodyVault(task.sellerUserId);
    const transfer = await getCustodyProvider().createTransfer({
      assetId: USDT_ASSET_ID, amount: String(task.amount), sourceVaultAccountId: buyerVault.id,
      destination: { type: "VAULT_ACCOUNT", vaultAccountId: sellerVault.id },
      idempotencyKey: crypto.randomUUID(), note: `Trade settlement ${token.symbol}`,
    });
    for (const txnId of [task.buyTxnId, task.sellTxnId]) {
      const [row] = await getDb().select().from(transactions).where(eq(transactions.id, txnId));
      await getDb().update(transactions).set({ metadata: { ...(row!.metadata as Record<string, unknown>), transferId: transfer.id, custodyStatus: transfer.status } })
        .where(eq(transactions.id, txnId));
    }
  }

  return takerPosition;
}
```
(Add `getCustodyProvider` from `@/lib/custody` and `getOrCreateCustodyVault`, `USDT_ASSET_ID` from `./custody-wallet` to the imports at the top of `trading.ts`.)

**2.4 — `cancelOrder(userId, positionId)`:**
```ts
export async function cancelOrder(userId: string, positionId: string) {
  const [position] = await getDb().select().from(positions).where(and(eq(positions.id, positionId), eq(positions.userId, userId)));
  if (!position) throw new TradingError("POSITION_NOT_FOUND", "Order not found");
  if (position.status !== "OPEN" && position.status !== "PARTIALLY_FILLED") throw new TradingError("NOT_CANCELLABLE", "Order is not open");
  const remaining = position.totalAmount - position.filledAmount;
  await getDb().transaction(async (tx) => {
    await tx.update(positions).set({ status: "CANCELLED" }).where(eq(positions.id, positionId));
    if (position.side === "BUY") {
      const releaseAmount = Math.round(remaining * position.orderPriceUsd * 100) / 100;
      await tx.update(balances).set({
        available: sql`${balances.available} + ${releaseAmount}`,
        locked: sql`MAX(0, ${balances.locked} - ${releaseAmount})`,
      }).where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
    } else {
      await tx.update(holdings).set({ lockedTokens: sql`MAX(0, ${holdings.lockedTokens} - ${remaining})` })
        .where(and(eq(holdings.userId, userId), eq(holdings.tokenId, position.tokenId)));
    }
  });
}
```
No custody call needed — cancelling only releases an internal reservation, nothing ever left custody for the unfilled portion.

### Phase 3 — Extend async settlement (`custody-wallet.ts`)

**3.1 — Add `settleTrade`, next to `settlePurchase` (`apps/wallet/src/lib/api/custody-wallet.ts:139-171`):**
```ts
async function settleTrade(userId: string, row: typeof transactions.$inferSelect, transfer: Transfer) {
  const details = metadata(row);
  if (details.projected) return;
  const totalUsd = Number(details.totalUsd ?? row.amount);
  if (transfer.status === "COMPLETED") {
    if (details.tradeRole === "buyer") {
      // Money already left `available` into `locked` at match time (Phase 2.3) — just release the lock.
      await getDb().update(balances).set({ locked: sql`MAX(0, ${balances.locked} - ${totalUsd})` })
        .where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
    } else {
      // Seller only receives spendable proceeds once the custody transfer actually confirms.
      await ensureProjectionBalance(userId);
      await getDb().update(balances).set({ available: sql`${balances.available} + ${totalUsd}` })
        .where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
    }
    await getDb().update(transactions).set({ status: "COMPLETED", metadata: { ...details, projected: true, custodyStatus: transfer.status } })
      .where(eq(transactions.id, row.id));
  } else if (transfer.status === "FAILED") {
    // Known alpha-scope gap: token/position/order-book effects already committed synchronously at match
    // time (Phase 2.3) and are not rolled back here. In normal operation this branch should not fire —
    // the buyer's balance is validated before matching — see "Current state" table for why.
    if (details.tradeRole === "buyer") {
      await getDb().update(balances).set({
        available: sql`${balances.available} + ${totalUsd}`,
        locked: sql`MAX(0, ${balances.locked} - ${totalUsd})`,
      }).where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
    }
    await getDb().update(transactions).set({ status: "FAILED", metadata: { ...details, projected: true, custodyStatus: transfer.status, failureReason: transfer.failureReason } })
      .where(eq(transactions.id, row.id));
  }
}
```

**3.2 — Update the dispatch in `syncPendingCustodyState` (`:192-200`)** so trade transactions (which are also `type: "BUY"`/`"SELL"`) aren't misrouted into `settlePurchase`/`settleWithdrawal`:
```ts
} else if (details.transferId) {
  const transfer = await provider.getTransfer(details.transferId);
  if (transfer) {
    if (details.tradeId) await settleTrade(userId, row, transfer);
    else if (row.type === "BUY") await settlePurchase(userId, row, transfer);
    else await settleWithdrawal(userId, row, transfer);
    if (transfer.status !== details.custodyStatus && transfer.status !== "COMPLETED" && transfer.status !== "FAILED") {
      await getDb().update(transactions).set({ metadata: { ...details, custodyStatus: transfer.status } }).where(eq(transactions.id, row.id));
    }
  }
}
```
No other change needed — the surrounding `try { ... } catch { ... }` per-row guard (`:178-205`) already isolates one row's failure from the rest of the sync pass.

### Phase 4 — API routes

**4.1 — Rewrite `POST /api/wallet/positions`** (`apps/wallet/src/app/api/wallet/positions/route.ts`) to call `placeOrder` instead of `createPosition`, and map `TradingError`:
```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getWalletPositions } from "@/lib/api";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";
import { checkKycApproved, kycBlockedResponse } from "@/lib/kyc-guard";
import { syncPendingCustodyState } from "@/lib/api/custody-wallet";
import { placeOrder, TradingError } from "@/lib/api/trading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TRADING_ERROR_STATUS: Record<string, number> = {
  TOKEN_NOT_FOUND: 404, INVALID_PRICE: 400, INSUFFICIENT_BALANCE: 409, INSUFFICIENT_HOLDINGS: 409, NO_LIQUIDITY: 409,
};

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorizedResponse();
  await syncPendingCustodyState(user.id);
  const positions = await getWalletPositions();
  return NextResponse.json({ positions });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorizedResponse();
  const blocked = await checkKycApproved(user.id);
  if (blocked) return kycBlockedResponse(blocked);
  const parsed = z.object({
    tokenSymbol: z.string().min(1), side: z.enum(["BUY", "SELL"]), orderType: z.enum(["MARKET", "LIMIT"]),
    totalAmount: z.number().int().positive(), orderPriceUsd: z.number().positive().optional(),
  }).refine((data) => data.orderType !== "LIMIT" || typeof data.orderPriceUsd === "number", { message: "orderPriceUsd is required for LIMIT orders" })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid position request", issues: parsed.error.issues }, { status: 400 });
  try {
    const position = await placeOrder(user.id, parsed.data);
    return NextResponse.json({ position }, { status: 201 });
  } catch (error) {
    if (error instanceof TradingError) return NextResponse.json({ error: error.message, code: error.code }, { status: TRADING_ERROR_STATUS[error.code] ?? 409 });
    throw error;
  }
}
```
Note: `createPosition` import from `@/lib/api` is dropped from this file; `createPosition`/`CreatePositionInput` can be deleted from `apps/wallet/src/lib/api/positions.ts:23-42` and its export in `apps/wallet/src/lib/api/index.ts:9` (keep `getWalletPositions`).

**4.2 — New cancel route** `apps/wallet/src/app/api/wallet/positions/[id]/cancel/route.ts`:
```ts
import { NextResponse } from "next/server";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";
import { cancelOrder, TradingError } from "@/lib/api/trading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CANCEL_ERROR_STATUS: Record<string, number> = { POSITION_NOT_FOUND: 404, NOT_CANCELLABLE: 409 };

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) return unauthorizedResponse();
  const { id } = await params;
  try {
    await cancelOrder(user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof TradingError) return NextResponse.json({ error: error.message, code: error.code }, { status: CANCEL_ERROR_STATUS[error.code] ?? 409 });
    throw error;
  }
}
```

**4.3 — Rewrite `getMarketOrderBook`** (`apps/wallet/src/lib/api/orderbook.ts`) to aggregate real resting `positions` instead of reading `orderBookLevels`/`makeDepth`:
```ts
import type { MarketOrderBook } from "@/types/wallet";
import { positions } from "@repo/db";
import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { ensureMarketMakerLiquidity } from "./market-maker";
import { getMarketTokenBySymbol } from "./market";

export async function getMarketOrderBook(symbol: string): Promise<MarketOrderBook> {
  const token = await getMarketTokenBySymbol(symbol);
  if (!token) throw new Error("Token not found");
  await ensureMarketMakerLiquidity(token.id, token.priceUsd);

  const remaining = sql<number>`SUM(${positions.totalAmount} - ${positions.filledAmount})`.as("amount");
  const openStatus = or(eq(positions.status, "OPEN"), eq(positions.status, "PARTIALLY_FILLED"));
  const [asks, bids] = await Promise.all([
    getDb().select({ price: positions.orderPriceUsd, amount: remaining }).from(positions)
      .where(and(eq(positions.tokenId, token.id), eq(positions.side, "SELL"), openStatus))
      .groupBy(positions.orderPriceUsd).orderBy(asc(positions.orderPriceUsd)),
    getDb().select({ price: positions.orderPriceUsd, amount: remaining }).from(positions)
      .where(and(eq(positions.tokenId, token.id), eq(positions.side, "BUY"), openStatus))
      .groupBy(positions.orderPriceUsd).orderBy(desc(positions.orderPriceUsd)),
  ]);
  return { asks, bids };
}
```
Delete the old `makeDepth` function entirely (superseded by `generateInitialDepth` in `market-maker.ts`, Phase 1).

**4.4 — Rewrite `getMarketSeries`** (`apps/wallet/src/lib/api/market-series.ts`) to derive from `trades`, falling back to the existing synthetic generator only when a token has no trade history yet (task wording: "where feasible"):
```ts
import type { MarketToken } from "@/types/wallet";
import { trades } from "@repo/db";
import { and, asc, eq, gte } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { getMarketTokenBySymbol } from "./market";

type Timeframe = "all" | "30d" | "7d" | "24h";

function getChangePct(token: MarketToken, timeframe: Timeframe): number {
  if (timeframe === "24h") return token.change24hPct;
  if (timeframe === "7d") return token.change7dPct;
  if (timeframe === "30d") return token.change30dPct;
  return token.changeAllPct;
}

function makeSyntheticSeries(seed: string, changePct: number, points: number): number[] {
  // Unchanged from the current implementation (apps/wallet/src/lib/api/market-series.ts:16-41) — kept
  // verbatim as the fallback for tokens with no trade history yet.
  const base = 100;
  const seedSum = seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const drift = changePct / 100;
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / Math.max(1, points - 1);
    const wave = Math.sin((t * 5 + seedSum / 37) * Math.PI * 2) * 0.35 + Math.sin((t * 11 + seedSum / 53) * Math.PI * 2) * 0.2;
    const trend = (t - 0.5) * drift * 2;
    out.push(base * (1 + trend + wave * 0.02));
  }
  return out;
}

function timeframeToSince(timeframe: Timeframe): Date | null {
  const now = Date.now();
  if (timeframe === "24h") return new Date(now - 24 * 60 * 60 * 1000);
  if (timeframe === "7d") return new Date(now - 7 * 24 * 60 * 60 * 1000);
  if (timeframe === "30d") return new Date(now - 30 * 24 * 60 * 60 * 1000);
  return null;
}

/** Buckets a trade tape into `points` evenly-spaced closes, carrying the last known price forward through gaps. */
function bucketTrades(rows: Array<{ price: number; createdAt: Date }>, points: number, seedPrice: number): number[] {
  const start = rows[0]!.createdAt.getTime();
  const end = rows[rows.length - 1]!.createdAt.getTime();
  const span = Math.max(1, end - start);
  const closes = new Array<number>(points).fill(seedPrice);
  let rowIndex = 0;
  let lastClose = rows[0]!.price;
  for (let i = 0; i < points; i++) {
    const bucketEnd = start + (span * (i + 1)) / points;
    while (rowIndex < rows.length && rows[rowIndex]!.createdAt.getTime() <= bucketEnd) {
      lastClose = rows[rowIndex]!.price;
      rowIndex++;
    }
    closes[i] = lastClose;
  }
  return closes;
}

export async function getMarketSeries(symbol: string, timeframe: Timeframe, points: number): Promise<{ series: number[] }> {
  const token = await getMarketTokenBySymbol(symbol);
  if (!token) throw new Error("Token not found");

  const since = timeframeToSince(timeframe);
  const rows = await getDb().select({ price: trades.price, createdAt: trades.createdAt }).from(trades)
    .where(since ? and(eq(trades.tokenId, token.id), gte(trades.createdAt, since)) : eq(trades.tokenId, token.id))
    .orderBy(asc(trades.createdAt));

  if (rows.length === 0) return { series: makeSyntheticSeries(symbol, getChangePct(token, timeframe), points) };
  return { series: bucketTrades(rows, points, token.priceUsd) };
}
```

### Phase 5 — Client wiring

**5.1 — `apps/wallet/src/lib/api-client.ts`:** point `closePosition` at the new dedicated route (replacing its current, broken `{positionId}` POST to the create endpoint, `:256-276`):
```ts
export async function closePosition(positionId: string): Promise<void> {
  const res = await fetch(getApiUrl(`/api/wallet/positions/${positionId}/cancel`), { method: "POST" });
  if (!res.ok) throw await walletApiError(res, "Failed to cancel order");
}
```
Update `createPosition`'s return-value expectation to match the new route's `{ position }` shape at 201 — no change needed, it already reads `data.position` (`:210`).

**5.2 — `apps/wallet/src/hooks/use-queries.ts`:** add the two missing invalidations to `useCreatePosition` (`:133-142`):
```ts
export function useCreatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet", "positions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "holdings"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "balances"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
```
No other client files need changes — `exchange-detail-page.tsx`, `desktop-token-tabs.tsx`, `assets-page.tsx`, `exchange-page.tsx`, `market-stats.tsx`, and `charts.tsx` all already consume `useMarketOrderBook`/`useMarketSeries`/`useWalletPositions`/`useCreatePosition`/`useClosePosition` exactly as needed; they start reflecting real matching, real depth, and real trade-derived charts the moment the server-side routes above change, with no prop/shape changes on the client side.
