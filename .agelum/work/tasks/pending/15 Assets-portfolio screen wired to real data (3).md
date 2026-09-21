---
created: 2026-09-21T12:30:00.000Z
epic: alpha-version
priority: 15
storyPoints: 3
title: Assets/portfolio screen wired to real data
type: task
workflowStatus: pending
---

# Assets/portfolio screen wired to real data

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Ensure the assets screen shows real, per-user holdings, balances, positions and transaction history from the DB with correct totals (portfolio value, P&L), loading/empty/error states, and updates after invest/trade/deposit/withdraw actions.

## Related Source Code
- [ ] apps/wallet/src/components/pages/assets-page.tsx:1
- [ ] apps/wallet/src/components/pages/dashboard-page.tsx:1
- [ ] apps/wallet/src/app/(dashboard)/assets/page.tsx:1
- [ ] apps/wallet/src/hooks/use-queries.ts:41
- [ ] apps/wallet/src/app/api/wallet/holdings/route.ts:1
- [ ] apps/wallet/src/app/api/transactions/route.ts:1

## Acceptance Criteria
- [ ] Assets and dashboard show DB-backed data with correct totals
- [ ] Empty, loading and error states are handled
- [ ] Data refreshes after investment/trade/deposit/withdraw actions