---
created: 2026-09-21T12:30:00.000Z
epic: alpha-version
priority: '08'
storyPoints: 3
title: KYC gating of invest, deposit and withdraw
type: task
workflowStatus: pending
---

# KYC gating of invest, deposit and withdraw

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Gate money-moving features on KYC status, as in production: users with status other than `approved` cannot invest, trade, deposit or withdraw. Enforce on the server (API routes return 403 with a machine-readable reason) and in the UI (blocked-feature dialog that explains the state — pending vs. rejected vs. not started — and links to onboarding). There is already a recent "blocked feature dialog" from the wallet commit `3605f0b`; reuse or extend it.

## Related Source Code
- [ ] apps/wallet/src/components/pages/invest-page.tsx:1
- [ ] apps/wallet/src/components/pages/deposit-page.tsx:15
- [ ] apps/wallet/src/components/pages/withdraw-page.tsx:12
- [ ] apps/wallet/src/components/exchange/trade-dialog.tsx:281
- [ ] apps/wallet/src/components/unit-details-actions.tsx:74
- [ ] apps/wallet/src/hooks/use-queries.ts:126

## Acceptance Criteria
- [ ] Unapproved users are blocked in UI and API for invest/trade/deposit/withdraw
- [ ] Blocked dialog shows the correct message per status
- [ ] Approved users are unaffected
- [ ] Server-side tests cover the 403 path