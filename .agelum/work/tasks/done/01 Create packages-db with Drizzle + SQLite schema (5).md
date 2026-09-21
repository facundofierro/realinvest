---
created: 2026-09-21T12:30:00.000Z
epic: alpha-version
plan: .agelum/work/plans/2026-09-21-01 Create packages-db with Drizzle + SQLite schema (5)-1789993551649.md
priority: '01'
status: done
storyPoints: 5
summary: .agelum/work/summaries/2026-09-21-01 Create packages-db with Drizzle + SQLite schema (5)-1789994533393.md
title: Create packages/db with Drizzle + SQLite schema
type: task
workflowStatus: done
---

# Create packages/db with Drizzle + SQLite schema

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Create a new workspace package `packages/db` (name `@repo/db`) containing the Drizzle ORM + SQLite schema and a DB client factory. Tables required: users, sessions (and accounts if the auth library needs them), projects, units, stages, purchase options, holdings, balances, positions, transactions, market tokens, order books (levels). Derive column shapes from the existing TypeScript types and sample JSON fixtures. Export the schema, inferred types and a `createDb()` helper. Must be provider- and jurisdiction-agnostic. Include a `kycStatus` field (pending/approved/rejected/none) on users for later tasks.

## Related Source Code
- [ ] packages/ui/package.json:1
- [ ] pnpm-workspace.yaml:1
- [ ] turbo.json:1
- [ ] apps/wallet/src/types/wallet.ts:1
- [ ] apps/wallet/src/sample-data/projects.json:1
- [ ] apps/wallet/src/sample-data/projectUnits.json:1
- [ ] apps/wallet/src/sample-data/walletHoldings.json:1
- [ ] apps/wallet/src/sample-data/walletPositions.json:1
- [ ] apps/wallet/src/sample-data/walletBalances.json:1
- [ ] apps/wallet/src/sample-data/transactions.json:1
- [ ] apps/wallet/src/sample-data/marketTokens.json:1
- [ ] apps/wallet/src/sample-data/marketOrderBooks.json:1

## Acceptance Criteria
- [ ] `packages/db` exists as a pnpm workspace package with its own `package.json`, tsconfig (extending `packages/typescript-config`) and lint config
- [ ] Drizzle schema covers all tables listed above with proper keys, foreign keys and indexes
- [ ] Inferred TS types are exported and consistent with `types/wallet.ts` (or replace it)
- [ ] `createDb()` works with a configurable SQLite file path (env var)
- [ ] `pnpm check-types` passes