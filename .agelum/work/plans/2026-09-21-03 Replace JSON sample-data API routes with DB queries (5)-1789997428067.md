# Plan: Replace JSON sample-data API routes with DB queries (apps/wallet)

Task file: `.agelum/work/tasks/pending/03 Replace JSON sample-data API routes with DB queries (5).md`

## Certainty assessment

**Level: High**

This is a mechanical data-source swap, not bug-hunting, and every code location is verified:

- All 14 route files under `apps/wallet/src/app/api/**` are thin wrappers that call server functions in `apps/wallet/src/lib/api/*` (barrel: `apps/wallet/src/lib/api/index.ts:1-23`). Only those 15 lib files import `readSampleJson` from `apps/wallet/src/lib/sample-data.ts:8-12` (verified by grep — no other usages outside `README.md` prose).
- The target schema is fully implemented and read: `packages/db/src/schema.ts` (14 tables incl. `isFeatured` at line 72 and `projectStories` at line 130 — the task-02 Phase-1 additions are already applied) with inferred types in `packages/db/src/types.ts:27-54` and a `createDb()` factory in `packages/db/src/client.ts:7-12`.
- The seed side-effect contract is known from the user-confirmed task-02 plan (`.agelum/work/plans/2026-09-21-02 Migration strategy and seed from sample data (3)-1789995875254.md`): 9-row unified `projects`, 7-row `market_tokens` (4 fixture + 3 synthesized for holdings FKs), demo user `demo-user`, denormalized display fields dropped and re-derived via joins.
- All 12 fixtures were read; response types (`apps/wallet/src/types/wallet.ts`) and client consumers (`apps/wallet/src/lib/api-client.ts`, `apps/wallet/src/hooks/use-queries.ts`, screens like `assets-page.tsx:72-104`, `exchange-page.tsx:225-231`) were inspected to pin exact response shapes.

One sequencing fact, not a risk to the plan's correctness: task 02 (migrations + seed) is `doing`/planned but **not yet implemented on disk** (no `packages/db/src/seed.ts`, no `drizzle/` folder, no `db:*` scripts in `packages/db/package.json:10-13`). This task cannot be runtime-verified until task 02 lands; the code can be written against the existing schema in parallel.

## Ambiguity assessment

**Level: Low**

The mechanical part (rewrite 15 lib functions to Drizzle queries, delete `sample-data.ts`, add `@repo/db` dep + singleton + env) was fully determined from the start. The remaining open decisions (catalog 9-vs-3 rows, exchange tokens 7-vs-4, `isFavorite` handling, stages scoping, minor orderings) were put to the user on 2026-09-21, who resolved them all with a blanket direction:

> "All is demo data, so no need to respect the sample data that we already had — you can modify all the data to better represent real scenarios."

Consequences, applied throughout this plan:

1. **Data-content parity is explicitly relaxed** (the user overrides the "screens render the same seeded data" acceptance criterion for *content*). Response **shapes/types stay byte-compatible** with `@/types/wallet` so the UI keeps working.
2. **`/api/projects` returns all rows** (the 9-row unified table; no `isListed`/discriminator column needed) — a 9-project catalog is a richer, more realistic demo than 3. Stub rows get realistic values via seed enrichment (see coordination notes).
3. **`/api/market/tokens` returns all 7 tokens** — the user's holding tokens being tradeable/listed in the exchange is realistic.
4. **`isFavorite: false`** constant in the mapper (no per-user favorites storage; favorites view empty until a real feature exists).
5. **Stages filter by `projectId`** (correct semantics); barrio-el-ceibo / complex-office-jr may get their own stages via seed enrichment instead of sharing torre's.
6. **Orderings are sane and deterministic** rather than fixture-order-preserving: transactions `createdAt DESC`, holdings by id, positions by `openedAt`, etc.

No open decisions remain; implementation can start directly from the phases below (after the task-02 prerequisite lands).

## Context

- RealInvest alpha epic: the wallet app is a UI mock reading JSON fixtures; this task moves all reads to Drizzle/SQLite via `@repo/db`, keeping response shapes byte-compatible so `lib/api-client.ts` / `hooks/use-queries.ts` / screens keep working unchanged.
- Architecture keeps the existing layering: routes (`app/api/**/route.ts`) → server lib (`src/lib/api/*`) → DB. Routes stay unchanged wherever lib signatures are preserved; only lib internals switch from `readSampleJson` to Drizzle queries.
- User scoping: no auth until task 04; per task-02 decision D5 all user-scoped tables are seeded under `demo-user`. This task introduces a single `getCurrentUserId()` switch point.
- JSON files in `apps/wallet/src/sample-data/` stay on disk as seed inputs for task 02; only the runtime reader is deleted.

## Current state → target map

All routes already declare `runtime = "nodejs"` and `dynamic = "force-dynamic"` (required for libsql) — no route-level changes needed except stages (pass `[id]`).

| Route | Server lib (line) | Today | Target query |
|---|---|---|---|
| GET `/api/projects` | `lib/api/projects.ts:4-6` | read `projects.json` | `select` from `projects` (**all rows** — user-relaxed parity), explicit columns, `ORDER BY launchDate DESC` (SQLite sorts NULLs last on DESC) |
| GET `/api/projects/[id]` | `lib/api/project-by-id.ts:4-14` | read + find by id, numeric-index fallback | `where(eq(projects.id, id))` — numeric fallback dropped (no in-app numeric links; all links use slug ids via `project-card.tsx:40`, `invest-page.tsx:217`) |
| GET `/api/projects/[id]/units` | `lib/api/project-units.ts:4-32` | read + filter + numeric fallback | `where(eq(units.projectId, projectId))`, `ORDER BY rowid` (insertion order; `unitCode`/`floor` are text so lexical sort breaks numeric floors) |
| GET `/api/projects/[id]/stages` | `lib/api/project-stages.ts:13-15` | read all (ignores id) | signature gains `projectId`; `where(eq(stages.projectId, projectId))`, `ORDER BY id` — correct scoping (user-confirmed; seed enrichment may add per-project stages) |
| GET `/api/projects/[id]/stories` | `lib/api/project-stories.ts:10-12` | read all | `select` from `project_stories`, `ORDER BY id` (global by design — no `projectId` column, matches task-02 decision) |
| GET `/api/projects/[id]/purchase-options` | `lib/api/project-purchase-options.ts:21-27` | read all | `select` from `purchase_options`, `ORDER BY rowid` (fixture order: token_launch, fixed_rent, full_property, construction_tokens) |
| GET `/api/dashboard/projects` | `lib/api/dashboard-projects.ts:15-17` | read `dashboardProjects.json` | `where(eq(projects.isFeatured, true))`, map EN→ES status (`PRE_SALE→"PRE-VENTA"`, `IN_CONSTRUCTION→"EN CONSTRUCCION"`, `COMPLETED→"COMPLETADO"`) + aliases (`roiPct→roi`, `progressPct→progress`, `priceRangeUsd→priceRange`, `fixedRentPct→fixedRent`) per task-02 notes |
| GET `/api/wallet/balances` | `lib/api/wallet.ts:4-6` | read `walletBalances.json` | `where(eq(balances.userId, getCurrentUserId()))` |
| GET `/api/wallet/holdings` | `lib/api/holdings.ts:4-6` | read `walletHoldings.json` | join `holdings`→`market_tokens`→`projects`, left-join `units` via `market_tokens.unitId`; rebuild `tokenSymbol`←`token.symbol`, `projectTitle`←`project.title`, `location`←`project.location`, `marketPriceUsd`←`token.priceUsd`, `changePct`←`token.changeAllPct` (task-02 D3 stores fixture `changePct` there), `unitCode`←`units.unitCode` else parse 3rd symbol segment else undefined; `where(eq(holdings.userId, …))`, `ORDER BY holdings.id` |
| GET `/api/wallet/positions` | `lib/api/positions.ts:4-6` | read `walletPositions.json` | join `positions`→`market_tokens`; rebuild `tokenSymbol`←`token.symbol`, `marketPriceUsd`←`token.priceUsd`, `openedAt`→`toISOString()`; `where(userId)`, `ORDER BY openedAt` |
| POST `/api/wallet/positions` | `lib/api/positions.ts:8-11` | stub `{ ok: true, positionId }` | **unchanged** — reads no JSON; real create/close is task 14 (secondary market) |
| GET `/api/transactions` | `lib/api/transactions.ts:4-6` | read `transactions.json` | `where(eq(transactions.userId, …))`, rebuild nested `amount: { currencyCode, amount }` from flat columns, `createdAt`→`toISOString()`, `metadata` passthrough (json-mode column); `ORDER BY createdAt DESC` (newest-first, realistic history) |
| GET `/api/market/tokens` | `lib/api/market.ts:4-11` | read `marketTokens.json` | join `market_tokens`→`projects` for `projectTitle`; **all rows** (user-relaxed parity); `isFavorite: false` constant; `ORDER BY id` |
| GET `/api/market/orderbook` | `lib/api/orderbook.ts:22-45` | read `marketOrderBooks.json`, fallback `makeDepth` | token by symbol → `where(eq(orderBookLevels.tokenId, …))`; asks `ORDER BY price ASC`, bids `ORDER BY price DESC` (matches fixture ordering); if no levels → keep existing `makeDepth(token.priceUsd)` synthetic fallback (needed for the 3 synthesized symbols and future tokens) |
| GET `/api/market/series` | `lib/api/market-series.ts:55-71` | read tokens JSON, compute `makeSeries` | token by symbol from DB (throw `"Token not found"` → route maps to 404); `makeSeries`/`getChangePct` stay as-is (series is computed, never stored) |

## Key decisions

| # | Decision | Status |
|---|---|---|
| D1 | Routes keep calling `lib/api/*`; only lib internals change to Drizzle (routes unchanged except stages passing `[id]`) | Decided (minimal diff, layering preserved) |
| D2 | Numeric-id fallback in `project-by-id.ts` / `project-units.ts` dropped — no in-app callers use numeric ids | Decided |
| D3 | DB singleton `apps/wallet/src/lib/db.ts` using `createDb()` cached on `globalThis` (dev hot-reload safe), not per-request clients | Decided |
| D4 | `getCurrentUserId()` helper returning `"demo-user"` — single switch point for task 04 (Google OAuth) | Decided (per task-02 D5) |
| D5 | Explicit column selects in `projects` queries so `isFeatured` (and future internal columns) never leak into responses | Decided |
| D6 | `apps/wallet/.env.local` with `DATABASE_URL=file:../db/wallet.db` (per task-02 D8); file is gitignored (`.gitignore` covers `.env*`) | Decided |
| D7 | `@repo/db` added to `apps/wallet/package.json` deps + `transpilePackages` in `apps/wallet/next.config.ts:6` (raw-TS package, same pattern as `@repo/ui`) | Decided |
| D8 | No discriminator columns (`isListed` etc.): `/api/projects` and `/api/market/tokens` return **all** rows; data-content parity relaxed by user (2026-09-21: "all is demo data… modify to better represent real scenarios"), response *shapes* stay type-compatible | **Resolved** (user direction) |
| D9 | `isFavorite: false` constant in token mapper (no per-user favorites storage until a real feature) | **Resolved** (user direction) |
| D10 | Stages scoped by `projectId`; transactions `ORDER BY createdAt DESC`; holdings `unitCode` = unit-join → symbol-parse fallback → undefined | **Resolved** (user direction) |

## Phase 0 — Prerequisites (external to this task)

1. Task 02 must land first: `packages/db/src/seed.ts`, `drizzle/` baseline migration, `db:*` scripts (its plan is user-confirmed; implementation pending).
2. No schema amendments are required by this task.

### Seed enrichment notes for task 02 (per user direction 2026-09-21)

The user explicitly allowed diverging from the fixtures to "better represent real scenarios". Since the seed lives in task 02 (still unimplemented), fold these realism tweaks into its seed transforms — none of them block this task's queries:

- **4 token-synthesized projects** (Los Álamos T1, Horizonte T2, Vivero BSAS, Casas Lomas): replace stub values with realistic ones — proper locations (e.g. "Vicente López, BA", "Belgrano, BA", …), plausible `progressPct`/`roiPct`, `priceRangeUsd`, `launchDate` — instead of `location "N/A"`, `progressPct 0`.
- **Stages**: optionally give barrio-el-ceibo and complex-office-jr their own stage rows (with stages now correctly scoped per project, only torre-libertador-8000 would otherwise show any).
- Ordering fields benefit from enrichment: `/api/projects` sorts by `launchDate DESC`, so stubs with NULL dates sort last.

## Phase 1 — Wallet app wiring

1. `apps/wallet/package.json:16-26` — add `"@repo/db": "workspace:*"` to `dependencies`; run `pnpm install` from repo root.
2. `apps/wallet/next.config.ts:6` — `transpilePackages: ["@repo/ui", "@repo/db"]`.
3. New `apps/wallet/src/lib/db.ts` — singleton:
   ```ts
   import { createDb, type Db } from "@repo/db";

   const globalForDb = globalThis as unknown as { db?: Db };

   export function getDb(): Db {
     return (globalForDb.db ??= createDb());
   }
   ```
4. New `apps/wallet/src/lib/current-user.ts`:
   ```ts
   // Single switch point for auth (task 04 replaces this with the session user)
   export const DEMO_USER_ID = "demo-user";
   export function getCurrentUserId(): string {
     return DEMO_USER_ID;
   }
   ```
5. New `apps/wallet/.env.local` — `DATABASE_URL=file:../db/wallet.db` (resolves relative to `apps/wallet`; the DB file lives at `packages/db/wallet.db` per task-02 D8).

## Phase 2 — Rewrite `lib/api/*` to Drizzle (per file)

All files import `getDb()` from `@/lib/db`, tables from `@repo/db`, and keep returning the existing `@/types/wallet` types so routes and `api-client.ts` are untouched.

1. **`projects.ts`** — explicit column select (`id, title, location, image, status, roiPct, progressPct, priceRangeUsd, fixedRentPct, tokensTotal, launchDate, nextLaunchDate`; no `isFeatured`), all rows, `orderBy(desc(projects.launchDate))` (D5/D8).
2. **`project-by-id.ts`** — `where(eq(projects.id, id))` `.limit(1)`; drop numeric fallback; same explicit column select.
3. **`project-units.ts`** — `where(eq(units.projectId, projectId))`, `orderBy(sql\`rowid\`)`; drop numeric indirection. Row columns map 1:1 onto `ProjectUnit` (`apps/wallet/src/types/wallet.ts:34-58`).
4. **`project-stages.ts`** — signature `getProjectStages(projectId: string)`; `where(eq(stages.projectId, projectId))`, `orderBy(stages.id)`; keep local `ProjectStage` interface (matches `types/wallet.ts:170-178`). Update the route (`app/api/projects/[id]/stages/route.ts:13`) to pass `id`.
5. **`project-stories.ts`** — select all from `projectStories`, `orderBy(projectStories.id)` (global list by design).
6. **`project-purchase-options.ts`** — select all from `purchaseOptions`, `orderBy(sql\`rowid\`)` (fixture order is not key-alphabetical).
7. **`dashboard-projects.ts`** — `where(eq(projects.isFeatured, true))` + status/alias mapping (see table above); keep the local `DashboardProject` interface (`dashboard-projects.ts:3-13`) as the return type. Ordering: pick a deterministic column (e.g. `id`) — note the 2nd/3rd cards may swap vs. fixture (cosmetic).
8. **`wallet.ts`** — `select` from `balances` `where(eq(balances.userId, getCurrentUserId()))`; columns map 1:1 to `WalletBalance`.
9. **`holdings.ts`** — 4-table join (holdings ⋈ market_tokens ⋈ projects, left-join units on `market_tokens.unitId`), `where(eq(holdings.userId, …))`, `orderBy(holdings.id)`; rebuild denormalized fields per the map table; `unitCode`: `units.unitCode` if the join hits, else 3rd segment of `token.symbol`, else undefined (D10).
10. **`positions.ts`** — GET: join `positions`⋈`market_tokens`, `where(userId)`, `orderBy(positions.openedAt)`; `openedAt: row.openedAt.toISOString()`. POST stub stays untouched (task 14 owns real create/close).
11. **`transactions.ts`** — `where(eq(transactions.userId, …))`, `orderBy(desc(transactions.createdAt))` (newest-first, D10); map `amount: { currencyCode: row.currencyCode, amount: row.amount }`, `createdAt: row.createdAt.toISOString()`, `metadata` passthrough.
12. **`market.ts`** — `getMarketTokens()`: join `market_tokens`⋈`projects` selecting token columns + `projects.title as projectTitle`; all rows (D8); `isFavorite: false` constant (D9); `orderBy(marketTokens.id)`. `getMarketTokenBySymbol(symbol)` becomes a single `where(eq(marketTokens.symbol, symbol))` `.limit(1)` query (same mapper).
13. **`market-series.ts`** — replace the JSON read with `getMarketTokenBySymbol` (DB); `getChangePct`/`makeSeries` unchanged; keep throwing `"Token not found"` (route `app/api/market/series/route.ts:43` maps it to 404).
14. **`orderbook.ts`** — remove dynamic `import("@/lib/sample-data")`; token via `getMarketTokenBySymbol`; if token missing throw `"Token not found"`; query `orderBookLevels` by `tokenId`, split by side, asks ASC / bids DESC; empty result → keep `makeDepth(token.priceUsd)` fallback (`orderbook.ts:3-20`).

## Phase 3 — Remove the JSON reader

1. Delete `apps/wallet/src/lib/sample-data.ts` (both `readSampleJson` and `getSampleDataDir` — grep confirms zero remaining importers after Phase 2).
2. Keep `apps/wallet/src/sample-data/*.json` untouched (seed inputs for task 02).
3. Optional: update `apps/wallet/README.md:56` comment ("Mock data…" → "Seed fixtures consumed by `packages/db` seed").

## Phase 4 — Completion gates

- `pnpm check-types` and `pnpm build` pass from repo root; `pnpm lint` clean.
- Acceptance-criteria sweep: no route/lib file reads JSON; `readSampleJson`/`getSampleDataDir` gone; user-scoped endpoints (`balances`, `holdings`, `positions`, `transactions`) all filter by `getCurrentUserId()`.

## Acceptance criteria mapping

| Criterion | Covered by |
|---|---|
| All API routes read from the database, none read JSON files | Phase 2 (all 15 lib files), Phase 3 (reader deleted) |
| Response shapes unchanged; screens render the same seeded data | Shapes kept type-compatible via per-endpoint mappers (Phase 2); *content* parity relaxed by user (D8–D10) — screens render realistic seeded data instead |
| `readSampleJson`/`getSampleDataDir` removed or unused | Phase 3 |
| User scoping on holdings/balances/positions/transactions | `getCurrentUserId()` (Phase 1.4) used in Phase 2.8–2.11 |
| Build and type-check pass | Phase 4 |
