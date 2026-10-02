# Plan: Assets/portfolio screen wired to real data

Task: `.agelum/work/tasks/pending/15 Assets-portfolio screen wired to real data (3).md`

## Certainty assessment

**Level: High**

This is not a bug hunt — it's a gap-closing task, and the gap has been located precisely by reading every file in the data path end-to-end. The key finding that shapes this whole plan: **the backend/data layer for holdings, balances, transactions and positions is already fully DB-backed** (Drizzle + SQLite via `@repo/db`), not sample-JSON as the stale `status-2026-sep.md` audit still claims. Verified directly:
- `apps/wallet/src/lib/api/holdings.ts:7-24`, `apps/wallet/src/lib/api/wallet.ts:6-10`, `apps/wallet/src/lib/api/transactions.ts:6-14`, `apps/wallet/src/lib/api/positions.ts:7-21`, `apps/wallet/src/lib/api/market.ts:29-40` all query `@repo/db` tables directly, scoped to `getCurrentUserId()` / `requireUser()`.
- `apps/wallet/src/sample-data/*.json` still exists on disk but `grep -rl "sample-data" apps/wallet/src` returns **zero** matches — nothing imports it anymore. Dead leftover files, not an active data source.
- Cost basis is correctly tracked and weighted-averaged on purchase (`apps/wallet/src/lib/api/invest.ts:126-134`, `holdings.costBasisPriceUsd`), which is exactly what's needed for a real P&L calculation.
- Query invalidation for invest/deposit/withdraw is already wired correctly in `apps/wallet/src/hooks/use-queries.ts:164-191` (verified against every mutation's actual DB side effects).

So the real remaining work is narrower and more precisely scoped than the task's framing suggests: it's front-end presentation work on `assets-page.tsx` and `dashboard-page.tsx` — adding loading/empty/error states (currently absent), computing real totals/P&L (currently hardcoded), and replacing fabricated per-token detail data with real lookups. Every specific defect below was found by reading the exact line, not inferred.

The one place this plan deliberately does *not* go deep — real settlement of BUY/SELL trades placed from the assets-page trade dialog (`createPosition`) — is confirmed out of scope by cross-referencing the sibling plan `.agelum/work/plans/2026-09-23-14 Secondary market: exchange trades and order books (8)-1790162455842.md`, which explicitly earmarks `apps/wallet/src/components/pages/assets-page.tsx:58,735` as "task 15's territory for UI... not edited here" and owns the `createPosition` matching/settlement engine and the `useCreatePosition` invalidation fix itself. Task 14 is currently `.agelum/work/tasks/doing/`, i.e. in progress but not done — this plan does not depend on it landing first.

## Ambiguity assessment

**Level: Low**

The task's acceptance criteria map cleanly onto concrete, verifiable code gaps (see "Current state" table). The one decision that could have forked the plan's size significantly — whether trade settlement belongs in this task — is resolved with direct evidence (task 14's plan text, above), not a guess. Two small judgment calls remain, both low-risk and documented inline rather than requiring a stop-the-world question:

1. **Dashboard "+12.5% este mes" / assets-page "+12.5% último mes" badges** are static fake copy with no backing data (no portfolio-history/snapshot table exists in the schema to compute a real *monthly* delta). This plan replaces them with a real **unrealized P&L** figure (`current value − cost basis`, since inception) computed from `holdings.costBasisPriceUsd`, and relabels the copy to match (e.g. "P&L no realizado" instead of "último mes"). This is the only data-backed "portfolio performance" number the schema supports today; inventing a fake monthly figure would repeat the exact defect this task exists to fix.
2. **`UnitDetailsDialog`'s own internal hardcoded content** (fallback title "Torre Libertador 8000", "Nuñez, BA", "55 M²", "Norte" orientation, boilerplate paragraph) is left untouched. That component is shared with the invest/project-detail flow, is not in this task's "Related Source Code" list, and fixing it is a separate, cross-cutting change. This plan only fixes what *feeds into* it from the assets page (passing the real `MarketToken` instead of a fabricated one) — see Phase 2's explicit scope note.

Both are stated as decisions with rationale, not left open — no user clarification needed before implementing.

## Current state (research findings)

| Area | Location | Notes |
|---|---|---|
| Holdings query (real, correct) | `apps/wallet/src/lib/api/holdings.ts:7-24` | Joins `holdings → marketTokens → projects`, left-joins `units`. Returns `tokens`, `marketPriceUsd`, `costBasisPriceUsd`, `changePct`, `location`. Already correct; no changes needed. |
| Balances / transactions / positions queries (real, correct) | `apps/wallet/src/lib/api/wallet.ts:6-10`, `transactions.ts:6-14`, `positions.ts:7-21` | All DB-backed, scoped per user. No changes needed. |
| Market tokens query (real, correct) | `apps/wallet/src/lib/api/market.ts:29-40` | Returns full `MarketToken` shape incl. `tokensAvailable`, `roiPct`, `buyPriceUsd`, `sellPriceUsd`, `change24hPct/7dPct/30dPct/changeAllPct`, `liveSince`. This is the data source Phase 2 uses to replace fabricated values. |
| Async settlement reconciler (already wired into every relevant GET) | `apps/wallet/src/lib/api/custody-wallet.ts:174-206` (`syncPendingCustodyState`) | Called at the top of `holdings/route.ts:12`, `balances/route.ts:12`, `transactions/route.ts:12`, `positions/route.ts` — confirms PENDING → COMPLETED transitions (deposit/withdraw/purchase) are reflected before every read. No changes needed. |
| Client-side mutation invalidation (already correct for invest/deposit/withdraw) | `apps/wallet/src/hooks/use-queries.ts:164-176` (`useInvestPurchase`), `:153-162` (`useCreateWithdrawal`), `:182-191` (`useSimulateDeposit`) | Invalidates the right query keys for each flow already. One gap found and fixed in Phase 4 (missing `["market","tokens"]` invalidation on purchase — needed only because of Phase 2's new dependency on that query). |
| `assets-page.tsx` — no loading/empty/error states | `apps/wallet/src/components/pages/assets-page.tsx:61-68` | `useWalletHoldings()` etc. destructured with only `data`, defaulted to `[]`. A slow network or a genuine fetch error renders identically to "user owns nothing" — silently wrong, not just unpolished. |
| `assets-page.tsx` — fake total P&L badge | `assets-page.tsx:190-197` (desktop), `:370-378` (mobile) | Hardcoded `+12.5%` / "Último mes" / "último mes", completely disconnected from `totalValue` or cost basis. |
| `assets-page.tsx` — fabricated per-token detail data | `assets-page.tsx:301-330` (`DesktopTokenTabs` token prop), `:552-589` (`UnitDetailsDialog` data prop) | Hardcodes `tokensAvailable: 1250`, `marketCapUsd: 520000`, `projectId: "1"`, `change24hPct: 0.5`, `change7dPct: 2.1`, `change30dPct: 5.4`, `changeAllPct: 12.4`, `roiPct: 12.4`, `liveSince: "6 meses"`, `isFavorite: true`, and derives `buyPriceUsd`/`sellPriceUsd` from the holding's own market price instead of the token's real buy/sell spread. Both components accept a `MarketToken` object directly (`desktop-token-tabs.tsx:118-123` `DesktopTokenTabsProps.token: MarketToken`; `unit-details-dialog.tsx:30-40` `UnitDetailsDialogProps.data: MarketToken | ProjectUnit | null`) — the fix is to look up and pass the real one instead of fabricating fields. |
| `assets-page.tsx` — `myTokens` derivation | `assets-page.tsx:77-109` | Maps `holdings` + `positions` only; doesn't join `marketTokens`, which Phase 2 needs. `value` (line 93-95) and `change` (line 101-103) are correct/reusable as-is. |
| `dashboard-page.tsx` — hardcoded user name | `apps/wallet/src/components/pages/dashboard-page.tsx:100-101` | `"Hola, Facundo"` literal, despite `useCurrentUser()` already imported and used for the KYC banner (line 124) — the real name is available and simply unused here. |
| `dashboard-page.tsx` — fake trend badge | `dashboard-page.tsx:141-144` | Hardcoded `+12.5% este mes`, same defect as assets-page. |
| `dashboard-page.tsx` — no error state | `dashboard-page.tsx:77-93` | Combines `isLoading` from projects/balances/holdings into one spinner gate, but no query's `isError` is read at all — a fetch failure silently renders the page with all-zero/empty data instead of surfacing the failure. |
| `dashboard-page.tsx` — empty "Actividad Reciente" | `dashboard-page.tsx:190-242` | `transactions.slice(0,3).map(...)` on an empty array renders an empty `<div className="space-y-3">` under the section heading with no message — looks broken for a genuinely new user, not "no activity yet". |
| Session user shape (name available) | `apps/wallet/src/types/next-auth.d.ts:4-11`, `apps/wallet/src/hooks/use-current-user.ts:5-9` | `session.user` extends `DefaultSession["user"]` (`name`, `email`, `image`) plus `id`, `kycStatus`. `user?.name` is safe to read. |
| Reusable UI primitives already in the design system | `packages/ui/src/components/ui/skeleton.tsx` | `<Skeleton className="animate-pulse rounded-md bg-muted" />` — use for loading placeholders instead of inventing new markup. |
| Existing full-page spinner convention (reuse verbatim) | `dashboard-page.tsx:82-92`, `exchange-page.tsx:423-433` | Identical markup in both places already: `<div className="flex justify-center items-center h-screen">...border-4 border-primary/20 animate-spin border-t-primary...<p>Loading...</p></div>`. Phase 1 reuses this exact pattern for `assets-page.tsx` (which currently has none), so the loading UX is consistent app-wide, not a new bespoke design. |
| No existing "error" or "empty state" UI convention anywhere in the app | (searched `packages/ui/src`, `deposit-page.tsx`, `withdraw-page.tsx`, `exchange-page.tsx`) | Only inline mutation-error text exists (e.g. `deposit-page.tsx:35`, `withdraw-page.tsx:43`, `<p className="text-xs text-destructive">{error.message}</p>`). Phase 1/3 introduce a small, consistent card-based pattern for query-level empty/error states (not mutation errors), used identically on both pages. |
| Scope boundary: secondary-market trade settlement | `.agelum/work/plans/2026-09-23-14 Secondary market: exchange trades and order books (8)-1790162455842.md` (Current state table, row "Third call site, out of scope for UI") | Confirms `createPosition` (assets-page trade dialog) has no economic effect yet (`apps/wallet/src/lib/api/positions.ts:31-42` just inserts an `OPEN` position row — no balance/holdings change) **by design**, pending task 14. This plan does not touch `positions.ts`, the `/api/wallet/positions` route, or `useCreatePosition`'s invalidation list. |

## Implementation steps

### Phase 1 — `assets-page.tsx`: loading / empty / error states + real totals & P&L

**1.1 — Read query status, not just `data`.**
In `apps/wallet/src/components/pages/assets-page.tsx:61-68`, change:
```ts
const { data: holdings = [] } = useWalletHoldings();
const { data: balances = [] } = useWalletBalances();
const { data: positions = [] } = useWalletPositions();
const { data: marketTokens = [] } = useMarketTokens();
```
to also destructure `isLoading` and `isError`/`error` (plus `refetch`) from each of the four hooks. Combine into:
```ts
const isLoading = isHoldingsLoading || isBalancesLoading || isPositionsLoading || isMarketTokensLoading;
const isError = isHoldingsError || isBalancesError || isPositionsError || isMarketTokensError;
```
(`useMarketTokens` from `apps/wallet/src/hooks/use-queries.ts:31-33` is added to the join because Phase 2 needs it.)

**1.2 — Add a combined P&L calculation.**
Create `apps/wallet/src/lib/portfolio.ts` (new file — small, shared by this page and `dashboard-page.tsx` in Phase 3, avoids duplicating the same formula twice):
```ts
import type { Holding } from "@/types/wallet";

export interface PortfolioTotals {
  totalValue: number;
  totalCostBasis: number;
  pnlAbs: number;
  pnlPct: number;
}

export function computeHoldingsTotals(holdings: Holding[]): PortfolioTotals {
  let totalValue = 0;
  let totalCostBasis = 0;
  for (const h of holdings) {
    totalValue += h.tokens * h.marketPriceUsd;
    totalCostBasis += h.tokens * (h.costBasisPriceUsd ?? h.marketPriceUsd);
  }
  const pnlAbs = totalValue - totalCostBasis;
  const pnlPct = totalCostBasis > 0 ? (pnlAbs / totalCostBasis) * 100 : 0;
  return { totalValue, totalCostBasis, pnlAbs, pnlPct };
}
```
Holdings with no `costBasisPriceUsd` (shouldn't normally happen — `invest.ts:127` always sets it on insert — but the DB column is nullable) fall back to their own market price, i.e. contribute `0` to P&L rather than skewing the total.

**1.3 — Replace `totalValue` derivation and the fake P&L badges.**
In `assets-page.tsx:119-124`, replace the `totalValue` `useMemo` with:
```ts
const portfolioTotals = useMemo(() => computeHoldingsTotals(holdings), [holdings]);
const totalValue = portfolioTotals.totalValue;
```
Then in both badge locations:
- Desktop, `assets-page.tsx:190-197`: replace the hardcoded `+12.5%` / "Último mes" block with `portfolioTotals.pnlPct` (sign-prefixed, `.toFixed(1)`) and relabel to "P&L no realizado" (see Ambiguity assessment #1). Use the same green/red convention already used for `asset.change` (`text-brand-green` when `>= 0`; needs a `text-destructive`-or-similar negative-case class since today's markup assumes always-positive).
- Mobile, `assets-page.tsx:370-378`: same change, same relabel.

**1.4 — Loading state.**
Immediately after the hook calls (before the `myTokens`/`portfolioTotals` memos, which are safe to compute on empty arrays), add an early return reusing the exact spinner markup from `dashboard-page.tsx:82-92`:
```tsx
if (isLoading) {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-4 rounded-full border-4 border-primary/20 animate-spin border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
```
Placed before the `isDesktop ? (...) : (...)` branch at line 176, so it applies to both layouts uniformly.

**1.5 — Error state.**
Add, right after the loading check:
```tsx
if (isError) {
  return (
    <div className="flex justify-center items-center h-screen p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="font-black uppercase text-sm mb-2">No pudimos cargar tus activos</h3>
        <p className="text-sm text-muted-foreground mb-4">Revisá tu conexión e intentá de nuevo.</p>
        <Button onClick={() => { refetchHoldings(); refetchBalances(); refetchPositions(); refetchMarketTokens(); }}>
          Reintentar
        </Button>
      </div>
    </div>
  );
}
```
Add `AlertTriangle` to the `lucide-react` import list at `assets-page.tsx:44-52`.

**1.6 — Empty state (user owns zero holdings).**
This is not a full-page state (the user still has USDT liquidity/deposit/withdraw actions to see), so it replaces only the token-list area in each layout:
- Desktop: inside the scrollable list at `assets-page.tsx:235-294`, after the "Liquidez USDT" card, if `myTokens.length === 0` render a placeholder card (reuse the existing "Análisis de Portafolio" empty-panel visual style already present at `:333-349` as the pattern to follow — icon in a rounded tile, bold uppercase heading, muted paragraph) with copy like "Todavía no tenés tokens" + a `Link href="/invest"` CTA ("Explorar proyectos"), *instead of* mapping over `myTokens`.
- Mobile: same condition wrapping the `myTokens.map(...)` block at `assets-page.tsx:465-537`.

### Phase 2 — `assets-page.tsx`: wire real per-token market data into the detail views

**2.1 — Extend `myTokens` to carry the matching real `MarketToken`.**
In `assets-page.tsx:77-109`, change the `useMemo` to also resolve `marketTokens.find((mt) => mt.id === holding.tokenId)` per holding (join key confirmed by `holdings.ts:10` selecting `tokenId: holdings.tokenId` and `market.ts` returning `MarketToken.id` from `marketTokens.id` — same column). Add `marketTokens` to the dependency array. Store the result as `marketToken: MarketToken | undefined` on each entry; keep all existing fields (`value`, `change`, `orderPrice`, etc.) as they are — only additive.

**2.2 — Replace the `DesktopTokenTabs` invocation.**
At `assets-page.tsx:301-330`, replace the fabricated object literal with:
```tsx
{selectedToken.marketToken && (
  <DesktopTokenTabs token={selectedToken.marketToken} />
)}
```
removing the entire hand-built `{ id, symbol, projectTitle, priceUsd, tokensAvailable: 1250, marketCapUsd: 520000, projectId: "1", change24hPct: 0.5, ... }` block. If `selectedToken.marketToken` is ever undefined (shouldn't happen given the FK constraint, but the two queries can theoretically resolve at slightly different times before `isLoading` settles both), fall back to the existing "Análisis de Portafolio" empty panel rather than rendering with `undefined`.

**2.3 — Replace the `UnitDetailsDialog` `data` prop.**
At `assets-page.tsx:552-589`, replace the fabricated object with `selectedToken?.marketToken ?? null`. This removes the duplicated hardcoded fields (`tokensAvailable: 1250`, `marketCapUsd: 520000`, `change24hPct: 0.5`, etc.) and the dead `.replace(/,/g, "")` calls on `selectedToken.marketPrice` (a plain `String(number)` that can never contain a comma — harmless but pointless, removed as part of deleting this block rather than as a separate cleanup pass).

**2.4 — Explicit non-goal.**
Do not modify `unit-details-dialog.tsx` or `desktop-token-tabs.tsx` internals. Their own hardcoded placeholder content (project description paragraph, "55 M²", "Norte", "Nuñez, BA", fallback title) is pre-existing, shared across other flows (project detail, invest), and out of this task's file list — see Ambiguity assessment #2.

### Phase 3 — `dashboard-page.tsx`: real greeting, real P&L, error state, empty state

**3.1 — Real user name.**
At `dashboard-page.tsx:100-101`, replace `"Hola, Facundo"` with `` `Hola, ${user?.name?.split(" ")[0] ?? "Inversor"}` ``. `user` is already destructured from `useCurrentUser()` at line 45.

**3.2 — Real P&L instead of the fake trend line.**
Import `computeHoldingsTotals` from `apps/wallet/src/lib/portfolio.ts` (Phase 1.2). Replace the `totalBalance` `useMemo` at `dashboard-page.tsx:63-75` with one that also returns the P&L figure (reuse `computeHoldingsTotals(holdings)` for the holdings portion, add `cash` separately since P&L only applies to invested holdings, not USDT balance). Replace the hardcoded `+12.5% este mes` block at `dashboard-page.tsx:141-144` with the computed `pnlPct`, sign-prefixed, relabeled (drop "este mes" — see Ambiguity assessment #1), matching the same green/red convention change made in Phase 1.3.

**3.3 — Error state.**
Destructure `isError` from each of the four hooks at `dashboard-page.tsx:46-61` (`useDashboardProjects`, `useWalletBalances`, `useWalletHoldings`, `useTransactions`), combine into `isError`, and add an error branch before the `isLoading` check at `dashboard-page.tsx:82-93`, reusing the same error-card pattern introduced in Phase 1.5 (extract it as a small local component or duplicate the ~10 lines — given there are only two call sites, a shared component in `apps/wallet/src/components/` is warranted if it stays this small; otherwise duplication is acceptable per this codebase's existing style of near-identical inline blocks like the loading spinner).

**3.4 — Empty "Actividad Reciente".**
At `dashboard-page.tsx:190-242`, wrap the `transactions.slice(0,3).map(...)` with a conditional: when `transactions.length === 0`, render a single muted line (e.g. "Todavía no tenés movimientos") instead of an empty `<div>`.

### Phase 4 — Verify and close the one real invalidation gap

**4.1 — Add `["market","tokens"]` invalidation to `useInvestPurchase`.**
Phase 2 makes the assets-page detail views depend on `useMarketTokens()` staying fresh. `applyPurchaseEffects` (`apps/wallet/src/lib/api/invest.ts:99-142`) can insert a brand-new `marketTokens` row (lines 111-120, when a unit's first-ever purchase creates its token) or update `tokensAvailable` on an existing one (lines 121-124) — neither is currently invalidated client-side. In `apps/wallet/src/hooks/use-queries.ts:164-176`, add `queryClient.invalidateQueries({ queryKey: ["market", "tokens"] });` alongside the existing invalidations in `useInvestPurchase`'s `onSuccess`. This is the only `use-queries.ts` change in this plan — `useCreatePosition` (lines 133-142) is intentionally left as-is (task 14's responsibility, see scope boundary above).

**4.2 — No other invalidation changes needed.**
`useCreateWithdrawal` (`:153-162`) and `useSimulateDeposit` (`:182-191`) already invalidate `["transactions"]` and `["wallet","balances"]`, which is everything those flows touch server-side (`custody-wallet.ts:60-118`) — confirmed by reading `createCustodyWithdrawal`/`simulateDeposit`, neither of which touches `holdings` or `marketTokens`. `useWalletBalances` and `useTransactions` additionally poll every 3s (`use-queries.ts:64`, `:83`) as a belt-and-suspenders freshness mechanism for the async PENDING→COMPLETED settlement path (`syncPendingCustodyState`) — no changes needed there either.
