---
created: 2026-09-21T12:30:00.000Z
epic: alpha-version
priority: 11
storyPoints: 5
title: USDT on/off-ramp simulated flows
type: task
workflowStatus: pending
---

# USDT on/off-ramp simulated flows

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Add simulated stablecoin (USDT) on-ramp and off-ramp flows to the custody mock and connect them to the Deposit and Withdraw screens: show a deposit address/QR, simulate an incoming USDT deposit becoming confirmed and credited to the balance, and a withdrawal to an external address (with amount validation, fee display, confirmation and status). Both must create transaction records. Screens are KYC-gated (see KYC gating task).

## Related Source Code
- [ ] apps/wallet/src/components/pages/deposit-page.tsx:15
- [ ] apps/wallet/src/components/pages/withdraw-page.tsx:12
- [ ] apps/wallet/src/app/(dashboard)/deposit/page.tsx:1
- [ ] apps/wallet/src/app/(dashboard)/withdraw/page.tsx:1
- [ ] apps/wallet/src/lib/api-client.ts:1
- [ ] apps/wallet/src/hooks/use-queries.ts:41
- [ ] apps/wallet/src/app/api/wallet/balances/route.ts:1
- [ ] apps/wallet/src/app/api/transactions/route.ts:1

## Acceptance Criteria
- [ ] Deposit screen shows a deposit address and a simulated deposit credits the balance
- [ ] Withdraw screen validates and submits, balance decreases and transaction status progresses
- [ ] Transactions appear in history
- [ ] Errors and pending states are handled in UI