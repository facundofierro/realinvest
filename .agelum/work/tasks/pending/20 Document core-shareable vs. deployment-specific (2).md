---
created: 2026-09-21T12:30:00.000Z
epic: alpha-version
priority: 20
storyPoints: 2
title: Document core-shareable vs. deployment-specific
type: task
workflowStatus: pending
---

# Document core-shareable vs. deployment-specific

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Write a document describing the multi-tenant fork strategy: which packages/modules are "core shareable" (`domain`, `db` core schema, provider ports) versus "deployment-specific" (real provider adapters, jurisdiction rules, branding, env config), how a fork plugs a different KYC/custody provider, and how it evolves its DB schema with migrations. Tenancy is per deployment (no runtime multi-tenancy). Include a package dependency diagram.

## Related Source Code
- [ ] .agelum/doc/docs/plan/status-2026-sep.md:1
- [ ] docs/plan/wallet-multiplatform.md:1
- [ ] packages:1
- [ ] WARP.md:1

## Acceptance Criteria
- [ ] Document added under `docs/plan/` (or `.agelum/doc/docs/plan/`) and linked from WARP.md
- [ ] Core vs. deployment-specific list is complete and matches the actual packages
- [ ] Fork workflow for providers and migrations is described step by step