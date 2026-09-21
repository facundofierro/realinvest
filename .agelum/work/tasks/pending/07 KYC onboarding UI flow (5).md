---
created: 2026-09-21T12:30:00.000Z
epic: alpha-version
priority: '07'
storyPoints: 5
title: KYC onboarding UI flow
type: task
workflowStatus: pending
---

# KYC onboarding UI flow

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Build the KYC onboarding flow in the wallet app using the KYC port (`@repo/providers-kyc`): steps for personal identity data, document upload (ID front/back, selfie, proof of address – stored via the mock), beneficial owner declaration, PEP/sanctions declaration; then a status screen for pending/approved/rejected with retry on rejection. Add API routes that call the port. The flow must be responsive (mobile-first) and reuse `packages/ui` components. Copy in Spanish/English consistent with the existing screens.

## Related Source Code
- [ ] apps/wallet/src/components/pages/dashboard-page.tsx:1
- [ ] apps/wallet/src/components/bottom-nav.tsx:1
- [ ] apps/wallet/src/components/desktop-top-nav.tsx:1
- [ ] apps/wallet/src/app/(dashboard)/layout.tsx:1
- [ ] apps/wallet/src/lib/api-client.ts:1
- [ ] apps/wallet/src/hooks/use-queries.ts:1
- [ ] packages/ui/src:1

## Acceptance Criteria
- [ ] Users can complete onboarding and submit documents
- [ ] Status screen shows pending/approved/rejected with next actions
- [ ] KYC data and status are persisted for the user
- [ ] Works at mobile and desktop widths