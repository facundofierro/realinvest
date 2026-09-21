---
created: 2026-09-21T12:30:00.000Z
epic: alpha-version
priority: 19
storyPoints: 5
title: Extract packages/domain
type: task
workflowStatus: pending
---

# Extract packages/domain

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Extract the business logic (formatting, pricing/supply math, portfolio/P&L calculations, order matching, purchase validation) out of the wallet app and API routes into `packages/domain` (`@repo/domain`), pure and framework-agnostic, provider- and jurisdiction-agnostic, with unit tests. Do this after invest/exchange logic exists so boundaries are clear. Update the app to consume it.

## Related Source Code
- [ ] apps/wallet/src/lib/format.ts:1
- [ ] apps/wallet/src/types/wallet.ts:1
- [ ] apps/wallet/src/components/exchange/trade-dialog.tsx:1
- [ ] apps/wallet/src/components/pages/assets-page.tsx:1
- [ ] apps/wallet/src/app/api:1
- [ ] pnpm-workspace.yaml:1

## Acceptance Criteria
- [ ] `@repo/domain` exists with pure logic and unit tests
- [ ] Wallet app and API routes import logic from it, no duplicates remain
- [ ] No dependency on Next.js, DB or provider code