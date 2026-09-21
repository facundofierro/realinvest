---
created: 2026-09-21T12:30:00.000Z
epic: alpha-version
priority: '06'
storyPoints: 3
title: Define KYC provider port and packages/providers-kyc
type: task
workflowStatus: pending
---

# Define KYC provider port and packages/providers-kyc

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Create `packages/providers-kyc` containing a provider-agnostic, jurisdiction-agnostic KYC port (TypeScript interface + types) and a simulated adapter. Requirements mirror the SEPRELAD-driven needs from the Paraguay research: identity verification, document upload, beneficial owner declaration, PEP/sanctions screening placeholders. Verification states: `pending`, `approved`, `rejected` (plus `none`/not started). The mock adapter persists status in the DB (`kycStatus` on users) and can be driven deterministically (e.g., auto-approve after N seconds, or by test document names) so demos and tests are predictable.

## Related Source Code
- [ ] .agelum/doc/docs/research/providers/operations-onboarding-compliance.visual-check.json:1
- [ ] .agelum/doc/docs/plan/status-2026-sep.md:1
- [ ] packages/db (new):1
- [ ] pnpm-workspace.yaml:1

## Acceptance Criteria
- [ ] `@repo/providers-kyc` package exists with port + types + mock adapter
- [ ] States pending/approved/rejected are modeled and persisted
- [ ] Port contains no provider- or jurisdiction-specific types
- [ ] Mock behavior is deterministic and documented
- [ ] Unit tests cover state transitions