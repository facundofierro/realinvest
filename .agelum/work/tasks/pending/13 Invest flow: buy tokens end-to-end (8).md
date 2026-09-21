---
workflowStatus: pending
---

---
title: Invest flow: buy tokens end-to-end
created: 2026-09-21T12:30:00.000Z
type: task
state: pending
priority: 13
storyPoints: 8
epic: alpha-version
---

# Invest flow: buy tokens end-to-end

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Connect the invest, project details and units screens to the database and the custody mock so a KYC-approved user can buy tokens of a project unit/stage: choose purchase option and amount, review, confirm; server validates KYC, available supply and balance, debits the USDT balance via the custody port, creates a transaction and updates holdings, positions and remaining supply atomically (DB transaction). Show success/failure states and refresh queries.

## Related Source Code
- [ ] apps/wallet/src/components/pages/invest-page.tsx:1
- [ ] apps/wallet/src/components/pages/project-detail-page.tsx:1
- [ ] apps/wallet/src/components/pages/project-units-page.tsx:1
- [ ] apps/wallet/src/components/unit-details-actions.tsx:74
- [ ] apps/wallet/src/components/unit-details-dialog.tsx:1
- [ ] apps/wallet/src/components/unit-details-sheet.tsx:1
- [ ] apps/wallet/src/hooks/use-queries.ts:126
- [ ] apps/wallet/src/lib/api-client.ts:1
- [ ] apps/wallet/src/app/api/wallet/positions/route.ts:1
- [ ] apps/wallet/src/app/api/projects/[id]/purchase-options/route.ts:1

## Acceptance Criteria
- [ ] Purchase creates a transaction and updates balance, holdings, positions and supply atomically
- [ ] Insufficient balance, sold-out and non-KYC cases return clear errors
- [ ] UI reflects the new state immediately (query invalidation)
- [ ] Server-side tests cover success and failure paths