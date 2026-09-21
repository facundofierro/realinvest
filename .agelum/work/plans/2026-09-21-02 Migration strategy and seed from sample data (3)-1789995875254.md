# Plan: Migration strategy and seed from sample data (packages/db)

Task file: `.agelum/work/tasks/pending/02 Migration strategy and seed from sample data (3).md`

## Certainty assessment

**Level: High**

This is greenfield tooling work with no bug-hunting involved. The dependency (task 01, "Create packages/db") is already implemented and verified on disk: `packages/db/src/schema.ts:1-218` defines all 13 tables (users, accounts, sessions, projects, units, stages, purchaseOptions, marketTokens, holdings, balances, positions, transactions, orderBookLevels) plus relations; `packages/db/drizzle.config.ts:1-10` is pre-configured (`dialect: "sqlite"`, `out: "./drizzle"`); `drizzle-kit@0.31.11`, `drizzle-orm@0.44.7` and `@libsql/client@0.15.15` are installed (`packages/db/package.json:14-25`). All 12 sample JSON fixtures have been read and mapped table-by-table; every fixture↔schema mismatch is precisely located (see mapping table below). `turbo.json:4-11` already declares `DATABASE_URL`/`DATABASE_AUTH_TOKEN` in `globalEnv`. All data-reconciliation decisions were confirmed with the user on 2026-09-21 (see decisions table); no guesses remain. One minor technical risk: `drizzle-kit migrate` CLI behavior with libsql `file:` URLs; a programmatic fallback (`drizzle-orm/libsql/migrator`) is documented in Phase 2.

## Ambiguity assessment

**Level: Low**

The mechanical parts (drizzle-kit generate/migrate scripts, seed script structure, turbo/root wiring, README fork-workflow docs) were fully determined from the start. The open data-reconciliation decisions were all resolved directly with the user on 2026-09-21:

1. **Dashboard dataset conflict** → **unify into `projects`** with a new `isFeatured` column; `barrio-el-ceibo` keeps the `projects.json` values (catalog wins; only the dashboard card for that project renders different numbers post-task-03).
2. **Market tokens → 4 missing projects** → **synthesize 4 minimal `projects` rows** from `projectTitle`.
3. **Holdings → 3 dangling tokenIds** → **synthesize 3 `market_tokens` rows** from the holding data.
4. **Minor defaults confirmed**: stages → `torre-libertador-8000`; demo user `demo-user`; seed = transactional full reset; single baseline migration.

Task 03 (`.agelum/work/tasks/pending/03 Replace JSON sample-data API routes with DB queries (5).md:41`) requires *every* API route — including `/api/dashboard/projects` and `/api/projects/[id]/stories` — to read from the DB with JSON files kept "only as seed inputs", which is why `projectStories.json` must land in a new table and `dashboardProjects.json` must merge into `projects` in this task. No open decisions remain; implementation can start directly from the phases below.

## Context

- RealInvest alpha: replace the JSON mock data layer with Drizzle + SQLite persistence. This task adds the migration tooling, the seed pipeline, and documents the fork workflow. Schema foundation: task 01, already merged (see `packages/db/src/schema.ts`).
- The wallet app reads fixtures through `apps/wallet/src/lib/sample-data.ts:8-12` (`readSampleJson`); 15 call sites in `apps/wallet/src/lib/api/*` (enumerated in the mapping table). Task 03 will delete those and query `@repo/db` instead.
- User-scoped tables (`holdings`, `balances`, `positions`, `transactions`) require a `userId` FK; there is no auth yet (task 04), so the seed must create a demo user.
- Migration files will be committed: `packages/db/.gitignore:1-5` ignores `dist/` and `*.db*` but not `drizzle/` — already correct.
- Reference: `.agelum/doc/docs/plan/status-2026-sep.md:82-85` (§3.3 Persistence, "Migration strategy so future deployments (forks) can evolve their schema independently") and `:101-108` (§3.6 deploy-time multi-tenancy).

## Fixture → table mapping (all 12 fixtures)

| Fixture (rows) | Target table | Transform / gotchas |
|---|---|---|
| `projects.json` (3) | `projects` | Verbatim; camelCase → snake_case columns. Ids: `torre-libertador-8000`, `barrio-el-ceibo`, `complex-office-jr`. |
| `projectUnits.json` (80) | `units` | Verbatim; all 80 units belong to `torre-libertador-8000` (FK clean, verified). `price` stays formatted string (`"$220,000"`, matches `schema.ts:88` text column). |
| `projectStages.json` (2) | `stages` | **Needs `projectId`** — fixture is a flat list with none; `stages.projectId` is NOT NULL FK (`schema.ts:108`). Default: assign both to `torre-libertador-8000` (only project with units; stages feed the project-detail page). |
| `projectPurchaseOptions.json` (4) | `purchase_options` | Verbatim; `key` PK (`"token_launch"` etc.). |
| `projectStories.json` (4) | `project_stories` (**new table**) | No table exists; route `apps/wallet/src/app/api/projects/[id]/stories/route.ts` returns the same list for every project → no `projectId` column needed (mirror current behavior; per-project association is a future fork-style migration). |
| `dashboardProjects.json` (3) | `projects` (unified, per D1) | Merged into the canonical `projects` table: insert the 2 dashboard-only rows (`residencial-las-heras`, `oficinas-madero`) with status mapping `"PRE-VENTA"→PRE_SALE`, `"EN CONSTRUCCION"→IN_CONSTRUCTION`, `"COMPLETADO"→COMPLETED` and field aliases `roi→roiPct`, `progress→progressPct`, `priceRange→priceRangeUsd`, `fixedRent→fixedRentPct`; `barrio-el-ceibo` keeps its `projects.json` values (conflict resolved: catalog wins); new `isFeatured=true` on the dashboard's 3 ids, `false` elsewhere. Task 03 re-derives the dashboard shape (Spanish labels + field aliases) from the unified rows. Route: `apps/wallet/src/lib/api/dashboard-projects.ts:15-17`. |
| `marketTokens.json` (4) | `market_tokens` | `projectId` → 4 synthesized project rows (D2); `unitId` values (`"522"` etc.) match no unit ids → store `null` (column nullable, `schema.ts:135`); drop `projectTitle` (denormalized; joined in task 03) and `isFavorite` (per-user, omitted by design). |
| `walletHoldings.json` (3) | `holdings` | `tokenId` → 3 synthesized `market_tokens` rows (D3); drop denormalized `unitCode/tokenSymbol/projectTitle/location/marketPriceUsd/changePct`. `createdAt` not in fixture → DB default. |
| `walletBalances.json` (1) | `balances` | User-scoped → demo user; verbatim USDT 0/0 row. |
| `walletPositions.json` (3) | `positions` | `tokenId` values `token-1/3/4` all exist in `marketTokens.json` — clean. `openedAt` ISO string → `new Date(iso)`; drop `tokenSymbol`/`marketPriceUsd`. |
| `transactions.json` (5) | `transactions` | Flatten nested `amount: {currencyCode, amount}` → `amount` + `currencyCode` columns (`schema.ts:189-190`); `createdAt` ISO → Date; `metadata` object → json-mode column. |
| `marketOrderBooks.json` (4 books × 12 levels) | `order_book_levels` | Keyed by symbol (`"VEX-ALAMOS-B3-522"` etc.) → resolve symbol→`market_tokens.id` (all 4 symbols exist); `asks`/`bids` arrays → rows with `side` `"ask"`/`"bid"`. |

## Key decisions

| # | Decision | Status |
|---|---|---|
| D1 | `dashboardProjects.json` → **unify into `projects`**: add `isFeatured` column (`integer { mode: "boolean" } notNull default false`, same pattern as `units.isTokenized` at `schema.ts:85`); seed a 9-row union (3 canonical + 2 dashboard-derived + 4 token-synthesized); `barrio-el-ceibo` conflict resolved in favor of `projects.json`; task 03 maps the status enum back to Spanish labels and aliases fields for the dashboard response | **Resolved** (user-confirmed 2026-09-21) |
| D2 | `marketTokens.json` missing projects: synthesize 4 minimal `projects` rows (title from `projectTitle`; `location "N/A"`, `image "/projects/header-tower.png"`, `status "IN_CONSTRUCTION"`, `roiPct` from token, `progressPct 0`, `isFeatured false`) | **Resolved** (user-confirmed 2026-09-21) |
| D3 | `walletHoldings.json` dangling tokenIds: synthesize 3 `market_tokens` rows (id = fixture tokenId, symbol = fixture tokenSymbol, projectId from id prefix — all 3 prefixes are exactly the 3 `projects.json` ids; holding-1 additionally links `unitId` to the real unit `torre-libertador-8000-12a`; `priceUsd = marketPriceUsd`, `marketCapUsd = tokens × price`, `changeAllPct = changePct`, other changes 0, `liveSince "seed"`) | **Resolved** (user-confirmed 2026-09-21) |
| D4 | Stages `projectId` → `torre-libertador-8000` | **Resolved** (user-confirmed 2026-09-21) |
| D5 | Demo user: fixed id `"demo-user"`, name `"Demo User"`, email `demo@realinvest.local`; all user-scoped fixtures attach to it; task 03 reads it until auth lands (task 04) | **Resolved** (user-confirmed 2026-09-21) |
| D6 | Seed idempotency = transactional **wipe + reinsert**: delete all rows from the 14 seed-owned tables in FK-reverse order inside one transaction, then insert fixtures with explicit ids. Deterministic, re-runnable, resets DB to fixture state. Destructive by design (alpha; README documents it) | **Resolved** (user-confirmed 2026-09-21) |
| D7 | Baseline migration: generate a **single** initial migration (`0000_*.sql`) *after* the schema additions from this task (no split 0000/0001 history — cleaner baseline for forks; the append-only workflow is what matters, not a demo of evolution) | **Resolved** (user-confirmed 2026-09-21) |
| D8 | DB file location: default `file:./wallet.db` resolved against `packages/db` (drizzle-kit + seed run with package CWD via turbo) → `packages/db/wallet.db`, gitignored by `packages/db/.gitignore:2`. README documents that apps consume it via their own `DATABASE_URL` (task 03: `apps/wallet/.env.local` with `DATABASE_URL=file:../db/wallet.db`) | Decided (task-01 config already sets this default) |
| D9 | Seed script runtime: `tsx` (added as explicit devDependency of `@repo/db`; it already exists transitively via drizzle-kit but pnpm requires direct declaration) | Decided |
| D10 | Script wiring: package scripts `db:generate`/`db:migrate`/`db:seed` in `packages/db/package.json:10-13`; turbo tasks in `turbo.json:12-28` (`db:seed` `dependsOn: ["db:migrate"]`, both `cache: false`); root `package.json:4-11` gets `db:generate`/`db:migrate`/`db:seed`/`db:setup` (setup = `turbo run db:seed`, i.e. migrate then seed). "Single command on a fresh DB" = `pnpm db:migrate` applies all committed migrations; `pnpm db:setup` = migrate + seed | Decided |

## Phase 1 — Schema additions (only what the fixtures demand)

1. `packages/db/src/schema.ts` — two additions (mirroring existing style):
   - `projects` table (`schema.ts:59-72`): add `isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false)` (boolean-column pattern at `schema.ts:85`).
   - New `projectStories` table (pattern of `stages` at `schema.ts:104-117`): `id integer PK autoincrement`, `title text notNull`, `image text notNull`, `color text notNull` (fixture `projectStories.json:2-7` uses numeric ids 1-4). No `projectId` — the route `apps/wallet/src/app/api/projects/[id]/stories/route.ts` returns the same list for every project; per-project association is a future fork-style migration.
   - Add `projectStories` to the `schema` export object (`schema.ts:218`). No new relations (standalone lookup).
2. `packages/db/src/types.ts` — add `ProjectStory`/`NewProjectStory` inferred types (pattern at `types.ts:26-51`). `Project`/`NewProject` pick up `isFeatured` automatically via `$inferSelect`/`$inferInsert`.
3. Generate the baseline migration (Phase 2 scripts must exist first — do the `pnpm install` + script edits, then run): `pnpm db:generate` → `drizzle/0000_init.sql` + `drizzle/meta/`. Verify the SQL contains all 14 tables.

## Phase 2 — Migration scripts in packages/db

1. `packages/db/package.json:10-13` — replace scripts block with:
   ```json
   "scripts": {
     "lint": "eslint . --max-warnings 0",
     "check-types": "tsc --noEmit",
     "db:generate": "drizzle-kit generate",
     "db:migrate": "drizzle-kit migrate",
     "db:seed": "tsx src/seed.ts"
   }
   ```
2. Add `"tsx": "^4.21.0"` to `devDependencies`; run `pnpm install` from repo root.
3. Fallback if `drizzle-kit migrate` mishandles libsql `file:` URLs (unlikely; dialect sqlite + file URL is the documented path for drizzle-kit 0.31): switch `db:migrate` to `tsx src/migrate.ts` using the programmatic migrator — `import { migrate } from "drizzle-orm/libsql/migrator"` applied to `createDb()` from `src/client.ts:7-12` with `migrationsFolder: "./drizzle"`.

## Phase 3 — Seed script (`packages/db/src/seed.ts`)

Structure (single file, ~250 lines, no external deps beyond `@repo/db` + node:fs/path):

1. **Fixture loading**: `SAMPLE_DATA_DIR = path.resolve(import.meta.dirname, "../../../apps/wallet/src/sample-data")` (src/ → packages/db → repo root). Small typed `readFixture<T>(name)` helper (plain `readFile` + `JSON.parse`; do not import from `apps/wallet` — package boundary stays clean).
2. **Transforms** (pure functions, one per fixture pair, per the mapping table):
   - `mapProjects` — builds the 9-row union: 3 canonical rows from `projects.json` verbatim (camel→snake) + 2 dashboard-derived rows (`residencial-las-heras`, `oficinas-madero`: status ES→EN mapping `"PRE-VENTA"→PRE_SALE`, `"EN CONSTRUCCION"→IN_CONSTRUCTION`, `"COMPLETADO"→COMPLETED`, `roi→roiPct`, `progress→progressPct`, `priceRange→priceRangeUsd`, `fixedRent→fixedRentPct`; `barrio-el-ceibo` from the dashboard set is skipped — the canonical row wins) + `isFeatured=true` on the dashboard's 3 ids (`barrio-el-ceibo`, `residencial-las-heras`, `oficinas-madero`) + `synthesizeMarketProjects` (D2: 4 rows from `projectTitle`, `isFeatured false`).
   - `mapUnits` — verbatim 80 rows, camel→snake.
   - `mapStages(projectId)` — inject D4 project id; keep explicit integer ids 1, 2.
   - `mapPurchaseOptions`, `mapStories` — verbatim.
   - `mapMarketTokens` — fixture 4 rows (drop `projectTitle`/`isFavorite`, null `unitId`) + `synthesizeHoldingTokens` (D3: 3 rows from holdings data; symbol collision check against fixture symbols).
   - `mapOrderBooks(tokens)` — symbol→id lookup; fail loudly (`throw`) on unknown symbol rather than silently skipping levels.
   - `mapHoldings(userId)`, `mapBalances(userId)`, `mapPositions(userId)` — drop denormalized display fields; ISO→Date.
   - `mapTransactions(userId)` — flatten `amount`, ISO→Date, `metadata` passthrough.
3. **Idempotent load**: one `db.transaction(...)`:
   - `PRAGMA foreign_keys = ON` (defensive; libsql default is on but don't rely on it).
   - DELETE in FK-reverse order: `order_book_levels`, `transactions`, `positions`, `holdings`, `balances`, `sessions`, `accounts`, `users`, `purchase_options`, `project_stories`, `stages`, `market_tokens`, `units`, `projects`.
   - INSERT in FK order: `users` (demo user, D5) → `projects` (9-row union) → `units` → `stages` → `purchase_options` → `project_stories` → `market_tokens` (4 + 3 synthesized) → `balances` → `holdings` → `positions` → `transactions` → `order_book_levels`. All with explicit ids from fixtures (except autoincrement `order_book_levels`, which gets fresh autoincrement ids; optionally reset `sqlite_sequence` for fully stable ids).
   - Log per-table counts to stdout; exit non-zero on any failure (transaction rolls back).
4. Use `createDb()` from `./client` (env-driven, `packages/db/src/client.ts:7-12`) so seeding targets whatever `DATABASE_URL` points at.

## Phase 4 — Turbo + root wiring

1. `turbo.json:12-28` — add tasks:
   ```json
   "db:generate": {
     "inputs": ["src/schema.ts", "drizzle.config.ts", "drizzle/**"],
     "outputs": ["drizzle/**"]
   },
   "db:migrate": { "cache": false, "inputs": ["drizzle/**", "drizzle.config.ts", "src/schema.ts"] },
   "db:seed": { "cache": false, "dependsOn": ["db:migrate"], "inputs": ["src/seed.ts", "../../apps/wallet/src/sample-data/**"] }
   ```
   (`db:generate` is cacheable — pure function of schema; migrate/seed mutate state → `cache: false`. `db:seed` dependsOn `db:migrate` gives the one-command chain.)
2. Root `package.json:4-11` — add:
   ```json
   "db:generate": "turbo run db:generate",
   "db:migrate": "turbo run db:migrate",
   "db:seed": "turbo run db:seed",
   "db:setup": "turbo run db:seed"
   ```
   (`db:setup` reads as migrate+seed via the turbo dependency; remove it if considered redundant.)
3. Env passthrough already works: `DATABASE_URL`/`DATABASE_AUTH_TOKEN` are in `turbo.json:4-11` `globalEnv` and turbo 2.x passes the parent environment through by default.

## Phase 5 — `packages/db/README.md` (fork workflow documentation)

Required sections:

1. **Overview & layout**: `src/schema.ts`, `src/client.ts`, `src/seed.ts`, `drizzle/` (committed migrations), `drizzle.config.ts`.
2. **Environment**: `DATABASE_URL` (default `file:./wallet.db` → resolves to `packages/db/wallet.db`, gitignored); `DATABASE_AUTH_TOKEN` for remote Turso. How apps point at the same file (task 03 sets `apps/wallet/.env.local`).
3. **Commands**: `pnpm db:generate` / `db:migrate` / `db:seed` / `db:setup` from repo root (and the raw drizzle-kit commands from the package dir).
4. **Core migration workflow**: edit `src/schema.ts` → `pnpm db:generate` → review generated SQL → commit schema + migration + `drizzle/meta/_journal.json` together → `pnpm db:migrate`.
5. **Fork workflow** (the acceptance-critical section — "fork-specific migrations appended after core ones, no editing of applied core migrations"):
   - The `drizzle/` journal is an append-only ledger. Never edit, rename, reorder, or delete an already-applied migration; never regenerate history.
   - A deployment fork consumes core migrations untouched and adds its own *after* them: change `src/schema.ts` locally, run `db:generate`, get a new numbered migration that appends to the journal.
   - If both core and fork added migrations before a merge, the fork renumbers **its own** files (never core's) so fork migrations always sort after core's, updating `drizzle/meta/_journal.json` accordingly; drizzle applies by journal order.
   - If a fork's journal diverges irreconcilably, the fork owns its migration history from that point and stops tracking upstream migrations (explicitly documented break).
   - Forks must not modify core tables in place when a reversible additive change (new table, new nullable column) achieves the goal — additive changes keep core migrations mergeable.
6. **Seeding**: what `db:seed` does (transactional wipe + reload of all 12 fixtures from `apps/wallet/src/sample-data/`), the demo user, the reconciliation rules applied (D1–D5 with pointers to `src/seed.ts`, including the unified-projects merge and `isFeatured` semantics), and a warning that it resets the DB to fixture state.

## Acceptance criteria mapping

| Criterion | Covered by |
|---|---|
| Migrations generated and applied by a single command on a fresh DB | Phases 1-2 (`drizzle/0000_*.sql` committed; `pnpm db:migrate` applies all; `pnpm db:setup` = migrate+seed) |
| Seed script is idempotent and loads every sample JSON fixture | Phase 3 (all 12 fixtures mapped; transactional wipe+reinsert) |
| Migration/fork workflow documented in `packages/db/README.md` | Phase 5 §4-5 |
| Scripts wired through turbo and root package.json | Phase 4 |

## Notes for downstream tasks

- **Task 03**: joins replace denormalized display fields (dropped per mapping table); the dashboard route queries `projects` where `isFeatured = true` and re-derives the `DashboardProject` response shape (status enum → Spanish labels `PRE_SALE→"PRE-VENTA"`, `IN_CONSTRUCTION→"EN CONSTRUCCION"`, `COMPLETED→"COMPLETADO"`; field aliases `roiPct→roi`, `progressPct→progress`, `priceRangeUsd→priceRange`, `fixedRentPct→fixedRent`) — the dashboard card for `barrio-el-ceibo` will show the catalog numbers (roi 10.8, progress 62) instead of the old mock's (18/85), per D1; `project_stories` routes straight to its table; user-scoped queries use the `demo-user` until task 04; app connects via `apps/wallet/.env.local` `DATABASE_URL=file:../db/wallet.db`.
- **Task 04**: keep or drop the demo user; `kycStatus` lives on `users` (`schema.ts:28`).
- Post-alpha cleanup candidates (documented in README, not implemented): per-project stories, numeric price normalization for `units.price`, richer data for the 4 synthesized market projects.
