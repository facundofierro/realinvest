---
created: 2026-09-21T12:30:00.000Z
epic: alpha-version
priority: 10
storyPoints: 8
title: Implement @repo/fireblocks-mock package
type: task
workflowStatus: pending
---

# Implement @repo/fireblocks-mock package

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Create `@repo/fireblocks-mock` (or `packages/providers-custody/mock`) implementing the custody port with a simulated API mirroring Fireblocks: vault accounts, wallets, balances, transfers with status lifecycle (SUBMITTED→CONFIRMING→COMPLETED/FAILED), deposit addresses. State must persist in `@repo/db` (balances/transactions) so the app behaves consistently across restarts. Provide deterministic simulation controls (delays, forced failures) for demos and tests. Must pass the port's conformance suite. Replaces the never-created `@repo/ripio-mock` idea.

## Related Source Code
- [ ] packages/providers-custody (new):1
- [ ] packages/db (new):1
- [ ] .agelum/doc/docs/research/providers/fireblocks-operations-architecture.visual-check.json:1
- [ ] package.json:7
- [ ] pnpm-workspace.yaml:1

## Acceptance Criteria
- [ ] Mock implements the full custody port and passes conformance tests
- [ ] Vault accounts, wallets, balances, transfers and deposit addresses work and persist
- [ ] Transfer status lifecycle is simulated and observable
- [ ] Failure/latency simulation is configurable
- [ ] Documented in the package README