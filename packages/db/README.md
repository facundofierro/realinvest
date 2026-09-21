# @repo/db

Drizzle ORM + SQLite (libSQL) persistence layer for RealInvest. Owns the schema, migrations, and the seed pipeline that loads the wallet app's sample-data JSON fixtures into the database.

## Layout

| Path | Purpose |
|---|---|
| `src/schema.ts` | Drizzle table definitions + relations (source of truth for the schema) |
| `src/client.ts` | `createDb()` factory (reads `DATABASE_URL` / `DATABASE_AUTH_TOKEN`) |
| `src/seed.ts` | Seed script: loads all fixtures from `apps/wallet/src/sample-data/` |
| `src/types.ts` | Inferred row types (`Project`, `NewUnit`, ...) + enum-ish unions |
| `drizzle/` | Committed SQL migrations + `meta/` journal (append-only ledger) |
| `drizzle.config.ts` | drizzle-kit config (dialect `sqlite`, out `./drizzle`) |

## Environment

- `DATABASE_URL` — defaults to `file:./wallet.db`, resolved against this package's directory → `packages/db/wallet.db` (gitignored). Apps consume the same file by pointing their own `DATABASE_URL` at it (the wallet app uses `apps/wallet/.env.local` with `DATABASE_URL=file:../db/wallet.db`).
- `DATABASE_AUTH_TOKEN` — only needed for remote Turso URLs; omit for local files.

Both variables are declared in `turbo.json` `globalEnv`, so turbo tasks see them.

## Commands

From the repo root (via turbo):

| Command | What it does |
|---|---|
| `pnpm db:generate` | Generate a SQL migration from `src/schema.ts` changes into `drizzle/` |
| `pnpm db:migrate` | Apply all committed migrations to the database |
| `pnpm db:seed` | Migrate, then seed fixtures (see below) |
| `pnpm db:setup` | Alias of `db:seed` — the one-liner for a fresh clone |

From `packages/db` directly: the same `pnpm db:generate` / `db:migrate` / `db:seed` scripts run drizzle-kit / tsx without turbo.

## Core migration workflow

1. Edit `src/schema.ts`.
2. Run `pnpm db:generate`.
3. Review the generated SQL in `drizzle/` (column types, nullability, indexes).
4. Commit `src/schema.ts`, the new `drizzle/*.sql` file, and `drizzle/meta/_journal.json` **together** — they are one logical change.
5. Run `pnpm db:migrate` to apply.

## Fork workflow

RealInvest deployments are expected to fork this repo and evolve their schema independently. The migration history is built for that:

- The `drizzle/` journal (`drizzle/meta/_journal.json`) is an **append-only ledger**. Never edit, rename, reorder, or delete an already-applied migration, and never regenerate history. Corrections happen through *new* migrations.
- A deployment fork consumes the core migrations untouched and appends its own after them: change `src/schema.ts` locally, run `pnpm db:generate`, and you get a new numbered migration appended to the journal. This is the normal, supported path for fork-specific tables and columns.
- If both core and the fork added migrations before a merge, the fork renumbers **its own** files only — never core's — so fork migrations always sort after core's, and updates `drizzle/meta/_journal.json` accordingly. Drizzle applies migrations in journal order, so renumbering the fork's entries keeps the combined history linear.
- If a fork's journal ever diverges irreconcilably from core, the fork owns its migration history from that point on and stops tracking upstream migrations. This is an explicit, documented break — the fork should record it in its own notes.
- Prefer additive, reversible changes (new table, new nullable column) over modifying core tables in place. Additive changes keep core migrations mergeable into forks; in-place rewrites (renames, type changes, drops) do not, and force the divergence path above.

## Seeding

`pnpm db:seed` (or `pnpm db:setup` from a fresh clone) resets the database to the exact state of the fixtures in `apps/wallet/src/sample-data/`:

- **Destructive by design**: inside a single transaction it deletes every row from the seed-owned tables (FK-reverse order) and reinserts the fixtures. Any data you created is lost. This is fine for alpha; do not run it against a database with real users.
- Creates the **demo user** (`demo-user` / `demo@realinvest.local`) solely for local fixtures. The wallet uses the authenticated Google user as its identity; new Google users start with no copied demo data.
- Loads all 12 fixtures. Reconciliation rules applied (see `src/seed.ts` for the exact transforms):
  - **Unified projects**: `dashboardProjects.json` merges into `projects`; `isFeatured = true` marks the dashboard's three projects. Where the dashboard and catalog conflict (`barrio-el-ceibo`), the catalog (`projects.json`) wins.
  - **Synthesized projects**: the 4 projects referenced by `marketTokens.json` but absent from `projects.json` get minimal rows derived from the token's `projectTitle`.
  - **Synthesized market tokens**: the 3 tokens referenced by `walletHoldings.json` but absent from `marketTokens.json` get rows derived from the holding data.
  - **Stages**: the flat stage list is attached to `torre-libertador-8000` (the only project with units).
  - Denormalized display fields (e.g. `tokenSymbol` on holdings, `projectTitle` on tokens) are dropped; queries join them back.

Known post-alpha cleanup candidates: per-project stories (currently one shared `project_stories` table, mirroring today's API behavior), numeric price normalization for `units.price`, and richer data for the 4 synthesized market projects.
