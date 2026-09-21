---
workflowStatus: pending
---

---
title: Responsive audit: navigation and app shell
created: 2026-09-21T12:30:00.000Z
type: task
state: pending
priority: 16
storyPoints: 5
epic: alpha-version
---

# Responsive audit: navigation and app shell

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Audit and unify navigation patterns across breakpoints (mobile, tablet, laptop, desktop): bottom nav vs. top nav switch points, safe-area handling, active states, and the behavior of dialogs vs. sheets per form factor (sheet on mobile, dialog on desktop). Define breakpoint constants in one place (currently `use-is-desktop`) and use them consistently. Can run in parallel with the backend tasks.

## Related Source Code
- [ ] apps/wallet/src/components/bottom-nav.tsx:1
- [ ] apps/wallet/src/components/desktop-top-nav.tsx:1
- [ ] apps/wallet/src/components/dashboard-layout-client.tsx:1
- [ ] apps/wallet/src/hooks/use-is-desktop.ts:5
- [ ] apps/wallet/src/components/unit-details-dialog.tsx:1
- [ ] apps/wallet/src/components/unit-details-sheet.tsx:1
- [ ] apps/wallet/src/app/(dashboard)/layout.tsx:1
- [ ] apps/wallet/src/app/globals.css:1

## Acceptance Criteria
- [ ] Documented breakpoint scheme used everywhere
- [ ] Navigation is correct at mobile, tablet, laptop and desktop widths
- [ ] Dialogs/sheets switch consistently per form factor
- [ ] No layout jumps/hydration flicker on breakpoint detection