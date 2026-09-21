---
created: 2026-09-21T12:30:00.000Z
epic: alpha-version
plan: .agelum/work/plans/2026-09-21-02 Migration strategy and seed from sample data (3)-1789995875254.md
priority: '02'
status: done
storyPoints: 3
summary: .agelum/work/summaries/2026-09-21-02 Migration strategy and seed from sample data (3)-1789997411482.md
title: Migration strategy and seed from sample data
type: task
workflowStatus: done
---

# Migration strategy and seed from sample data

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

In `packages/db`, set up drizzle-kit migrations (generate + migrate scripts) so future deployment forks can evolve their schema independently (document the recommended fork workflow: fork-specific migrations appended after core ones, no editing of applied core migrations). Write an idempotent seed script that loads all existing sample JSON fixtures from `apps/wallet/src/sample-data/` into the database. Wire `db:generate`, `db:migrate`, `db:seed` scripts through turbo and the root package.json. Depends on the schema from task "Create packages/db".

## Related Source Code
- [ ] packages/db (new):1
- [ ] package.json:5
- [ ] turbo.json:1
- [ ] apps/wallet/src/lib/sample-data.ts:1
- [ ] apps/wallet/src/sample-data/dashboardProjects.json:1
- [ ] apps/wallet/src/sample-data/projectStages.json:1
- [ ] apps/wallet/src/sample-data/projectStories.json:1
- [ ] apps/wallet/src/sample-data/projectPurchaseOptions.json:1

## Acceptance Criteria
- [ ] Migrations are generated and applied by a single command on a fresh DB
- [ ] Seed script is idempotent and loads every sample JSON fixture
- [ ] Migration/fork workflow is documented in `packages/db/README.md`
- [ ] Scripts are wired through turbo and root package.json