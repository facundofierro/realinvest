# Summary: Migration strategy and seed from sample data (packages/db)

Plan: `.agelum/work/plans/2026-09-21-02 Migration strategy and seed from sample data (3)-1789995875254.md`
Certainty assessment: High / Ambiguity assessment: Low — no clarifying questions were required; implementation followed the plan directly.

## What was implemented

### Phase 1 — Schema additions (`packages/db/src/schema.ts`, `src/types.ts`)
- `projects.isFeatured`: `integer("is_featured", { mode: "boolean" }).notNull().default(false)` (D1 — dashboard/catalog unification).
- New `project_stories` table (`id` autoincrement PK, `title`, `image`, `color` — all notNull), no `projectId` (mirrors the current API behavior of one shared story list). Added to the `schema` export; no new relations.
- `types.ts`: added `ProjectStory` / `NewProjectStory`; `Project`/`NewProject` pick up `isFeatured` automatically.

### Phase 2 — Migration tooling (`packages/db/package.json`)
- Scripts: `db:generate` (drizzle-kit generate), `db:migrate` (drizzle-kit migrate), `db:seed` (tsx src/seed.ts); lint/check-types unchanged.
- Added `tsx@^4.21.0` as an explicit devDependency; `pnpm install` run.
- `drizzle-kit migrate` was verified to work with libsql `file:` URLs — the plan's programmatic-migrator fallback was **not** needed.

### Baseline migration (D7)
- Single initial migration `packages/db/drizzle/0000_low_shooting_star.sql` + `drizzle/meta/` (journal + snapshot), containing all 14 tables. Verified via `CREATE TABLE` count and applied to a fresh DB.

### Phase 3 — Seed script (`packages/db/src/seed.ts`, ~450 lines)
- Loads all 12 fixtures from `apps/wallet/src/sample-data/` via a typed `readFixture<T>` helper (plain fs read + JSON.parse; no import from the app — package boundary intact).
- Pure transform functions per the plan's mapping table: `mapProjects` (9-row union: 3 canonical + 2 dashboard-derived with ES→EN status mapping and field aliases, `barrio-el-ceibo` conflict resolved in favor of the catalog, `isFeatured` on the dashboard's 3 ids + 4 token-synthesized projects per D2), `mapUnits`, `mapStages` (D4: injected `torre-libertador-8000`), `mapPurchaseOptions`, `mapStories`, `mapMarketTokens` (drops `projectTitle`/`isFavorite`, nulls `unitId`) + `synthesizeHoldingTokens` (D3: 3 tokens with symbol-collision check, prefix-derived projectIds, `holding-1` linked to the real unit `torre-libertador-8000-12a`, `marketCapUsd = tokens × price`), `mapHoldings`/`mapBalances`/`mapPositions`/`mapTransactions` (D5: demo user; drops denormalized display fields; ISO→Date; flattened nested `amount`; json-mode `metadata`), `mapOrderBooks` (symbol→token-id resolution, throws on unknown symbol).
- Transactional wipe + reinsert (D6): `PRAGMA foreign_keys = ON` (best-effort), DELETE from 14 tables in FK-reverse order, `sqlite_sequence` reset for stable autoincrement ids, INSERT in FK order with explicit fixture ids. Per-table counts logged; non-zero exit + rollback on failure (verified: a constraint failure mid-run rolled back cleanly).
- Uses `createDb()` from `src/client.ts` (env-driven `DATABASE_URL`).

### Phase 4 — Turbo + root wiring
- `turbo.json`: new `db:generate` (cacheable, outputs `drizzle/**`), `db:migrate` (`cache: false`), `db:seed` (`cache: false`, `dependsOn: ["db:migrate"]`) tasks.
- Root `package.json`: `db:generate` / `db:migrate` / `db:seed` / `db:setup` scripts (`db:setup` = migrate + seed via the turbo dependency).
- Verified end-to-end on a fresh DB: `rm packages/db/wallet.db && pnpm db:setup` from the repo root applies the baseline migration and seeds.

### Phase 5 — `packages/db/README.md`
Required sections: layout, environment (`DATABASE_URL` default/`DATABASE_AUTH_TOKEN`, how apps point at `packages/db/wallet.db`), commands, core migration workflow (schema → generate → review → commit schema+migration+journal together → migrate), fork workflow (append-only journal, fork migrations appended after core, fork renumbers only its own files, irreconcilable-divergence break, prefer additive changes), and seeding (transactional wipe semantics, demo user, D1–D5 reconciliation rules, destructive-reset warning).

## Deviations from the plan

1. **`units.tokenSymbol` made nullable** (schema.ts). The plan's mapping table said units load "verbatim", but the 20 non-tokenized `full_property` units (floors 6–10) have no `tokenSymbol` and the column was NOT NULL — first seed run failed with `SQLITE_CONSTRAINT_NOTNULL` and rolled back. Per the plan's own Phase-1 principle ("only what the fixtures demand"), the column was relaxed to nullable and the pre-commit baseline migration regenerated (still a single `0000_*.sql`, per D7). This is the only fixture↔schema mismatch beyond those the plan had already catalogued.
2. **`__dirname` instead of `import.meta.dirname`** in `src/seed.ts` to locate the fixtures dir. The package's `.ts` files resolve as CommonJS under `module: NodeNext` (no `"type": "module"`), so `import.meta` is a compile error (TS1470). Behavior is identical; resolved path is the same.

## Verification

- `pnpm db:seed` run twice → identical per-table counts and deterministic `order_book_levels` ids (1–48): users 1, projects 9 (3 featured), units 80, stages 2 (project_id = `torre-libertador-8000`), purchase_options 4, project_stories 4, market_tokens 7 (4 fixture + 3 synthesized), balances 1, holdings 3, positions 3, transactions 5, order_book_levels 48.
- Spot-checked DB state via sqlite3: status mappings (`residencial-las-heras`→IN_CONSTRUCTION, `oficinas-madero`→COMPLETED), `barrio-el-ceibo` keeps catalog values, synthesized tokens' derived fields, flattened transactions with json metadata, demo user row.
- `pnpm lint` and `pnpm check-types` pass repo-wide (`@repo/db` with 0 warnings; remaining wallet warnings are pre-existing in untouched files).
- `pnpm db:generate` re-run through turbo detects no changes (no spurious migrations).

## Acceptance criteria

| Criterion | Status |
|---|---|
| Migrations generated and applied by a single command on a fresh DB | Done — `pnpm db:migrate` (single command); `pnpm db:setup` = migrate + seed; verified on fresh `wallet.db` |
| Seed script is idempotent and loads every sample JSON fixture | Done — all 12 fixtures, transactional wipe + reinsert, verified re-runnable |
| Migration/fork workflow documented in `packages/db/README.md` | Done — core workflow + append-only fork workflow sections |
| Scripts wired through turbo and root package.json | Done — `db:generate`/`db:migrate`/`db:seed`/`db:setup` at root, turbo tasks with cache/dependsOn semantics |

## Notes for downstream tasks

- Task 03: dashboard queries `projects` where `isFeatured = true` and re-derives the Spanish labels/field aliases; `project_stories` routes to its table; user-scoped queries use `demo-user`; app connects via `apps/wallet/.env.local` with `DATABASE_URL=file:../db/wallet.db`.
- Task 04: `kycStatus` lives on `users`; decide whether to keep the demo user.
- `packages/db/wallet.db` is a local dev artifact (gitignored); migrations and fixtures are the committed source of truth.
