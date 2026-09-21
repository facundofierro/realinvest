# Plan: Create packages/db with Drizzle + SQLite schema

Task file: `.agelum/work/tasks/pending/01 Create packages-db with Drizzle + SQLite schema (5).md`

## Certainty assessment

**Level: High**

This is greenfield scaffolding with no bug-hunting or root-cause uncertainty. All inputs have been read and understood: the monorepo layout (`pnpm-workspace.yaml:1-4` already includes `packages/*`), the existing package conventions (`packages/ui/package.json:1-47`, `packages/ui/tsconfig.json:1-14`, `packages/ui/eslint.config.mjs:1-4`), the full domain type surface (`apps/wallet/src/types/wallet.ts:1-196`), all sample JSON fixtures, and the alpha plan (`.agelum/doc/docs/plan/status-2026-sep.md:82-85,110-113`). Downstream constraints are known: task 02 will seed from the sample data, task 03 will replace API routes with DB queries, and task 04 will use these tables through the Auth.js Drizzle adapter (so the users/sessions/accounts shapes are dictated by `@auth/drizzle-adapter`, not invented here). The internal design choices (driver, money format, normalization, favorites) were explicitly confirmed with the user on 2026-09-21 and are recorded in the decisions table below.

## Ambiguity assessment

**Level: Low**

The task itself is clear: which tables to create, what to export, and the acceptance criteria are all explicit. The four open design decisions were resolved directly with the user on 2026-09-21:

1. **SQLite driver**: **`@libsql/client`** (local `file:` SQLite now, native path to Turso/remote later).
2. **Money/price representation**: **`real`** — infers `number`, consistent with `apps/wallet/src/types/wallet.ts:3-6` and all fixtures.
3. **Display fields**: **normalize** — FKs + joins; denormalized display columns (`projectTitle`, `location`, `tokenSymbol`) are not stored.
4. **`isFavorite`** (`apps/wallet/src/types/wallet.ts:73`): **omitted** from the schema for now; can be added as a per-user table later without breakage.

No open decisions remain; implementation can start directly from the phases below.

## Context

- RealInvest alpha: replace JSON mock data with Drizzle ORM + SQLite persistence. This task creates `packages/db` (`@repo/db`) — the foundation that tasks 02 (migrations/seed), 03 (API rewiring), and 04 (Google OAuth) build on.
- Repo: Turborepo + pnpm 9 monorepo. Workspace globs already cover `packages/*` (`pnpm-workspace.yaml:1-4`), so no workspace config change is needed.
- Existing packages are consumed as raw TypeScript (no build step): `packages/ui/package.json:6-11` maps `exports` directly to `./src/*.ts`. `@repo/db` follows the same pattern so Next.js transpiles it.
- Shared configs: `@repo/typescript-config` (use `base.json` — this is a Node-side package, not React) and `@repo/eslint-config` (use the `./base` export, `packages/eslint-config/package.json:7`).
- Root scripts already run `turbo run lint` / `turbo run check-types` across all workspace packages (`package.json:5-10`, `turbo.json:19-22`), so the new package is picked up automatically.
- Status doc reference for this work: `.agelum/doc/docs/plan/status-2026-sep.md:82-85` (§3.3 Persistence) and `:101-108` (§3.6 package boundaries).

## Key design decisions (defaults; confirm before implementing)

| # | Decision | Resolved (user-confirmed 2026-09-21) |
|---|----------|---------|
| D1 | SQLite driver | `@libsql/client` (runtime dep) + `drizzle-orm/libsql`. Local SQLite via `file:` URLs now; remote Turso/replicas possible later with zero schema changes (column definitions live in `drizzle-orm/sqlite-core`). |
| D2 | Money/price columns | SQLite `real` → infers `number`, consistent with `wallet.ts` types and fixtures. Alpha-appropriate; revisit for production forks. |
| D3 | Display fields | Normalize: identity comes from FKs (`userId`, `tokenId`, `projectId`, `unitId`); display fields (`projectTitle`, `location`, `tokenSymbol`, `marketPriceUsd`, `changePct` on holdings; `tokenSymbol` on positions; `projectTitle` on market tokens) are joined/computed in queries (task 03). Schema adds `userId` to user-scoped tables (absent from `wallet.ts` because there is no auth yet). |
| D4 | `isFavorite` | Omitted from `market_tokens` (it is per-user UI state). Task 03 can default it to `false` or a `user_token_favorites` table can be added later without schema breakage. |
| D5 | Env var for DB connection | `DATABASE_URL` (libsql URL: `file:./wallet.db` locally, `libsql://...` for Turso), default `file:./wallet.db`. Optional `DATABASE_AUTH_TOKEN` passed through to the client when set (enables remote Turso with no code change). Both added to `turbo.json` `globalEnv`. |
| D6 | Timestamps | `integer({ mode: "timestamp" })` → infers `Date` (Drizzle-idiomatic); API layer serializes to ISO strings (task 03). Divergence from `wallet.ts` string timestamps is covered by the "or replace it" clause in the acceptance criteria. |
| D7 | Enums | SQLite has no enums: `text` columns + `$type<...>()` unions. Union types are exported from `@repo/db`. |
| D8 | IDs | `text` PKs matching fixture id shapes (slugs like `"torre-libertador-8000"`), `$defaultFn(() => crypto.randomUUID())` for inserts that don't supply one. Exceptions: `stages` and `order_book_levels` use autoincrement `integer` PKs (fixtures use plain numbers, `projectStages.json:3`). |
| D9 | Auth.js tables | `users`/`sessions`/`accounts` follow the canonical `@auth/drizzle-adapter` column shapes so task 04 can pass the schema to the adapter unchanged (plus extra app columns like `kycStatus` on `users`). |

## Target layout

```
packages/db/
  package.json          # @repo/db, exports → ./src/*.ts (raw TS, no build)
  tsconfig.json         # extends @repo/typescript-config/base.json
  eslint.config.mjs     # extends @repo/eslint-config/base
  drizzle.config.ts     # drizzle-kit config (schema location, migrations out dir)
  src/
    schema.ts           # all tables, enums, indexes, relations
    client.ts           # createDb()
    types.ts            # inferred select/insert types + shared unions
    index.ts            # public barrel: re-export schema, types, createDb
```

## Phase 1 — Scaffold the package

1. Create `packages/db/package.json` (model on `packages/ui/package.json:1-47`):
   - `"name": "@repo/db"`, `"version": "0.0.0"`, `"private": true`.
   - `"exports"`: `"." → "./src/index.ts"`, `"./schema" → "./src/schema.ts"`, `"./client" → "./src/client.ts"` (subpaths keep task 04's drizzle adapter and task 02's drizzle-kit imports clean).
   - `"scripts"`: `"lint": "eslint . --max-warnings 0"`, `"check-types": "tsc --noEmit"` (same as `packages/ui/package.json:11-15`).
   - `dependencies`: `drizzle-orm`, `@libsql/client`.
   - `devDependencies`: `@repo/eslint-config` (`workspace:*`), `@repo/typescript-config` (`workspace:*`), `@types/node` (`^22.15.3`, same as `packages/ui/package.json:19`), `drizzle-kit`, `eslint` (`^9.39.1`), `typescript` (`5.9.2`).
   - Install with `pnpm install` (workspace-aware; fetches latest stable drizzle versions) from the repo root.
2. Create `packages/db/tsconfig.json` extending `@repo/typescript-config/base.json` (NodeNext, strict — `packages/typescript-config/base.json:1-19`): `{"extends": "@repo/typescript-config/base.json", "compilerOptions": {"outDir": "dist", "rootDir": ".", "types": ["node"]}, "include": ["src", "drizzle.config.ts"], "exclude": ["node_modules", "dist"]}`.
3. Create `packages/db/eslint.config.mjs`: `import { base as config } from "@repo/eslint-config/base";` — check `packages/eslint-config/base.js` export name first and match it (the `react-internal` pattern is at `packages/ui/eslint.config.mjs:1-4`; this package must NOT use the React config).
4. Create `packages/db/.gitignore` ignoring `dist/`, `*.db`, `*.db-journal`, `*.db-wal`, `*.db-shm`, `drizzle/` if generated migrations should not be committed — decision D-note: migrations WILL be committed per task 02 ("migration strategy so future deployments can evolve independently"), so do NOT ignore `drizzle/`; only ignore build output and SQLite files.

## Phase 2 — Schema (`src/schema.ts`)

One file, imported as `import * as schema`. All tables from `drizzle-orm/sqlite-core` (`sqliteTable`, `text`, `integer`, `real`, `primaryKey`/`uniqueIndex`/`index` as needed). Shared union types exported from `src/types.ts` and applied via `$type<...>()`.

### Shared unions (`src/types.ts` first, referenced by schema)

- `KycStatus = "pending" | "approved" | "rejected" | "none"` (task requirement)
- `ProjectStatus` (`wallet.ts:14-17`): `"PRE_SALE" | "IN_CONSTRUCTION" | "COMPLETED"`
- `PositionSide` (`wallet.ts:93-95`): `"BUY" | "SELL"`
- `PositionStatus` (`wallet.ts:96-100`): `"OPEN" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED"`
- `TransactionType` (`wallet.ts:116-121`): `"DEPOSIT" | "WITHDRAWAL" | "BUY" | "SELL" | "DIVIDEND"`
- `TransactionStatus` (`wallet.ts:123-126`): `"PENDING" | "COMPLETED" | "FAILED"`
- `OrderBookSide = "ask" | "bid"`
- `CurrencyCode = "USDT"` (`wallet.ts:1`)

### `users` (Auth.js adapter shape + `kycStatus`)

| Column | Drizzle | Notes |
|---|---|---|
| id | `text().primaryKey().$defaultFn(crypto.randomUUID)` | |
| name | `text().notNull()` | |
| email | `text().notNull().unique()` | |
| emailVerified | `integer({ mode: "timestamp" })` | nullable |
| image | `text()` | nullable |
| kycStatus | `text().$type<KycStatus>().notNull().default("none")` | task requirement |

### `accounts` (Auth.js adapter shape — task 04 will use it verbatim)

- `userId` `text().notNull()` → FK `users.id`, `onDelete: "cascade"`; indexed.
- `type`, `provider` `text().notNull()`; `providerAccountId` `text().notNull()`.
- Nullable text: `refresh_token`, `access_token`, `token_type`, `scope`, `id_token`, `session_state`.
- `expires_at` nullable `integer`.
- Composite PK `(provider, providerAccountId)`.

### `sessions` (Auth.js adapter shape)

- `sessionToken` `text().primaryKey()`.
- `userId` `text().notNull()` → FK `users.id`, cascade.
- `expires` `integer({ mode: "timestamp" }).notNull()`.

### `projects` — from `Project` (`wallet.ts:19-32`) + `projects.json`

- `id` text PK (slug ids in fixtures, `projects.json:3`).
- `title`, `location`, `image` `text().notNull()`.
- `status` `text().$type<ProjectStatus>().notNull()` (values like `"PRE_SALE"`, `projects.json:7`).
- `roiPct`, `progressPct` — `roiPct` `real` (12.4), `progressPct` `integer` (35).
- Nullable: `priceRangeUsd` text (`"$80k-$150k"` is a display range string), `fixedRentPct` real, `tokensTotal` integer, `launchDate` text, `nextLaunchDate` text (date-only strings, kept as text per fixtures).

### `units` — from `ProjectUnit` (`wallet.ts:34-58`) + `projectUnits.json`

- `id` text PK; `projectId` `text().notNull()` → FK `projects.id`; indexed; `unique(projectId, unitCode)`.
- `unitCode` (`"1A"`), `title`, `type` (`"3 Amb"`), `floor` — `text().notNull()`.
- `tokenSymbol` `text().notNull()`; `tokenName` text nullable.
- `isTokenized` `integer({ mode: "boolean" }).notNull()`.
- `status` `text().notNull()` (display, `"Vendido"`); `statusRaw` text nullable (`"sold_out"`).
- `price` `text().notNull()` — NOTE: fixtures store a formatted string (`"$220,000"`, `projectUnits.json:19`); keep text for now, flag for normalization in a later task.
- Nullable: `areaM2` real, `area` text, `bedrooms` integer, `bathrooms` integer, `floorPlanImage` text, `investmentType` text, `queueOrder` integer, `orientation` text, `totalTokens` integer, `tokensSold` integer, `negotiatedAmount` text.

### `stages` — from `ProjectStage` (`wallet.ts:170-178`) + `projectStages.json`

- `id` `integer().primaryKey({ autoIncrement: true })`.
- `projectId` `text().notNull()` → FK `projects.id`; indexed. **Note:** fixtures have no `projectId` (`projectStages.json` is a flat list used by project detail pages); the column is required by relational sense — task 02's seeding must supply it (flag to task 02).
- `name`, `date` (display string like `"Marzo 2024"`), `status` (`"active" | "upcoming"` — keep as plain text, `$type` optional) — `text().notNull()`.
- `units`, `available` integer notNull; `minPrice` real notNull.

### `purchase_options` — from `ProjectPurchaseOption` (`wallet.ts:180-195`) + `projectPurchaseOptions.json`

- `key` text PK (`"token_launch"`, `projectPurchaseOptions.json:3`).
- All remaining columns text notNull: `title`, `subtitle`, `headerIcon`, `headerIconClassName`, `watermarkIcon`, `cardClassName`, `badgeText`, `badgeClassName`, `valueLabel`, `value`, `actionText`, `getHref`, `actionClassName`, `iconContainerClassName`.
- Rationale: this is presentation config stored in DB because the task explicitly requires the table; schema is verbatim from the fixture shape.

### `market_tokens` — from `MarketToken` (`wallet.ts:60-78`) + `marketTokens.json`

- `id` text PK; `symbol` `text().notNull().unique()`.
- `projectId` `text().notNull()` → FK `projects.id`; indexed. **Note:** fixture `projectId`s (`"los-alamos-t1"`, `marketTokens.json:6`) don't exist in `projects.json` — task 02 seeding must reconcile.
- `unitId` text nullable → FK `units.id` (some tokens may be project-level; fixture values like `"522"` are display slugs — task 02 reconciles).
- `priceUsd`, `marketCapUsd`, `change24hPct`, `change7dPct`, `change30dPct`, `changeAllPct` — `real().notNull()`.
- `liveSince` `text().notNull()` (display string `"6 meses"`).
- Nullable: `tokensAvailable` integer, `roiPct` real, `buyPriceUsd` real, `sellPriceUsd` real.
- Omitted per D4: `isFavorite`; `projectTitle` comes from the projects join (D3).

### `holdings` — from `Holding` (`wallet.ts:80-91`) + `walletHoldings.json`

- `id` text PK.
- `userId` `text().notNull()` → FK `users.id`, cascade; `unique(userId, tokenId)`, index on `userId`.
- `tokenId` `text().notNull()` → FK `market_tokens.id`. **Note:** fixture `tokenId`s are unit ids (`"torre-libertador-8000-12a"`, `walletHoldings.json:4`) — task 02 reconciles.
- `tokens` integer notNull (quantity).
- `costBasisPriceUsd` real nullable.
- `createdAt` `integer({ mode: "timestamp" }).notNull().$defaultFn(() => new Date())`.
- Omitted per D3: `unitCode`, `tokenSymbol`, `projectTitle`, `location`, `marketPriceUsd`, `changePct` (joined/computed in task 03).

### `balances` — from `WalletBalance` (`wallet.ts:8-12`) + `walletBalances.json`

- Composite PK `(userId, currencyCode)`.
- `userId` `text().notNull()` → FK `users.id`, cascade.
- `currencyCode` `text().$type<CurrencyCode>().notNull()`.
- `available`, `locked` `real().notNull().default(0)` (fixture `walletBalances.json:4-5` uses 0).

### `positions` — from `Position` (`wallet.ts:102-114`) + `walletPositions.json`

- `id` text PK.
- `userId` `text().notNull()` → FK `users.id`, cascade; index `(userId, status)`.
- `tokenId` `text().notNull()` → FK `market_tokens.id`; indexed.
- `side` `text().$type<PositionSide>().notNull()`.
- `totalAmount` integer notNull; `filledAmount` `integer().notNull().default(0)`.
- `orderPriceUsd` real notNull; `openedMarketPriceUsd` real nullable.
- `openedAt` `integer({ mode: "timestamp" }).notNull().$defaultFn(() => new Date())`.
- `status` `text().$type<PositionStatus>().notNull().default("OPEN")`.
- Omitted per D3: `tokenSymbol`, `marketPriceUsd` (live value, computed).

### `transactions` — from `Transaction` + `MoneyAmount` (`wallet.ts:3-6,128-136`) + `transactions.json`

- `id` text PK.
- `userId` `text().notNull()` → FK `users.id`, cascade; index `(userId, createdAt)`.
- `type` `text().$type<TransactionType>().notNull()`; `status` `text().$type<TransactionStatus>().notNull()`.
- `createdAt` `integer({ mode: "timestamp" }).notNull().$defaultFn(() => new Date())` (fixture ISO strings → Date on read, `transactions.json:6`).
- `amount` `real().notNull()` + `currencyCode` `text().$type<CurrencyCode>().notNull().default("USDT")` — the nested `MoneyAmount` is flattened into two columns.
- `description` text nullable.
- `metadata` `text({ mode: "json" }).$type<Record<string, unknown>>()` nullable (fixture `transactions.json:23-28`).

### `order_book_levels` — from `OrderBookLevel`/`MarketOrderBook` (`wallet.ts:138-146`) + `marketOrderBooks.json`

- `id` `integer().primaryKey({ autoIncrement: true })`.
- `tokenId` `text().notNull()` → FK `market_tokens.id`, cascade; index `tokenId`.
- `side` `text().$type<OrderBookSide>().notNull()` (fixture keys the book by symbol with `asks`/`bids` arrays, `marketOrderBooks.json:2-19`; `tokenId` FK replaces the symbol key).
- `price` real notNull; `amount` integer notNull.
- `unique(tokenId, side, price)`. Level ordering is derivable (asks ascending / bids descending by price), so no sort column.

### Relations

Add `relations()` declarations for the join paths task 03 will need: `projects ↔ units`, `projects ↔ marketTokens`, `units ↔ marketTokens`, `users ↔ holdings/positions/transactions/balances/accounts/sessions`, `marketTokens ↔ holdings/positions/orderBookLevels`. Export the `schema` object composed of tables + relations (required for `drizzle(db, { schema })` relational queries).

## Phase 3 — Client factory (`src/client.ts`)

```ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export type Db = ReturnType<typeof createDb>;

export function createDb(databaseUrl?: string) {
  const url = databaseUrl ?? process.env.DATABASE_URL ?? "file:./wallet.db";
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  const client = createClient(authToken ? { url, authToken } : { url });
  return drizzle(client, { schema });
}
```

- Env-configurable per acceptance criteria (D5): `DATABASE_URL` accepts `file:` URLs for local SQLite (alpha) and `libsql://` URLs for Turso (future forks), matching the "provider-agnostic, per-deployment" goal. `DATABASE_AUTH_TOKEN` is only forwarded when set, so local dev needs nothing beyond the URL.
- No singleton and no side effects at import time (avoids creating files/connections during `next build`); the app-level singleton belongs to task 03.
- Also add `"DATABASE_URL"` and `"DATABASE_AUTH_TOKEN"` to `globalEnv` in `turbo.json:4-9`.

## Phase 4 — Types and public exports

1. `src/types.ts`: all `$inferSelect`/`$inferInsert` pairs for every table, e.g. `export type User = typeof users.$inferSelect; export type NewUser = typeof users.$inferInsert;` (name them `Project`, `Unit`, `Stage`, `PurchaseOption`, `MarketToken`, `Holding`, `Balance`, `Position`, `Transaction`, `OrderBookLevel`, `Session`, `Account`, `NewXxx` for each), plus the shared unions listed in Phase 2.
2. `src/index.ts`: `export * from "./schema"; export * from "./types"; export { createDb, type Db } from "./client";`.
3. `drizzle.config.ts` at package root:
   ```ts
   import { defineConfig } from "drizzle-kit";
   export default defineConfig({
     dialect: "sqlite",
     schema: "./src/schema.ts",
     out: "./drizzle",
     dbCredentials: { url: process.env.DATABASE_URL ?? "file:./wallet.db" },
   });
   ```
   Generating migrations/seed data is task 02 — this task only ships the config. (`dialect: "sqlite"` with a `file:` URL works for libsql local files; if task 02 targets Turso it can switch `dialect` to `"turso"` without schema changes.)

## Phase 5 — Verification (acceptance-criteria checks, not tests)

1. `pnpm install` from repo root succeeds and links `@repo/db`.
2. `pnpm check-types` passes at root (runs `tsc --noEmit` in the new package via `turbo.json:19-22`).
3. `pnpm lint` passes (new package uses `@repo/eslint-config/base`).

## Notes for downstream tasks (do not implement here)

- Task 02 (seed/migrations): must reconcile fixture inconsistencies flagged above — `stages` need a `projectId`, `marketTokens.projectId`/`unitId` values must map to real `projects`/`units` rows, `holdings.tokenId` values (currently unit ids) must map to `market_tokens` rows, positions reference `token-N` ids that exist in `marketTokens.json`.
- Task 03: joins replace denormalized display fields; timestamps serialize to ISO strings; `isFavorite` defaults to `false`.
- Task 04: pass `@repo/db`'s `users`/`sessions`/`accounts` tables to `@auth/drizzle-adapter`; `kycStatus` travels on `users` and through the session.
