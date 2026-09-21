---
workflowStatus: pending
---

---
title: Responsive audit: screen-by-screen pass
created: 2026-09-21T12:30:00.000Z
type: task
state: pending
priority: 17
storyPoints: 8
epic: alpha-version
---

# Responsive audit: screen-by-screen pass

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Systematically review and fix every screen at mobile (~375px), tablet (~768px), laptop (~1280px) and desktop (~1920px): landing, login, dashboard, invest, project details, project units, assets, exchange (list and detail), deposit, withdraw, tokenization and chat. Fix overflow, truncation, tap targets, table/chart sizing and spacing. Record a checklist of screens x breakpoints. Can run in parallel with backend tasks.

## Related Source Code
- [ ] apps/wallet/src/components/pages/login-page.tsx:1
- [ ] apps/wallet/src/components/pages/dashboard-page.tsx:1
- [ ] apps/wallet/src/components/pages/invest-page.tsx:1
- [ ] apps/wallet/src/components/pages/project-detail-page.tsx:1
- [ ] apps/wallet/src/components/pages/project-units-page.tsx:1
- [ ] apps/wallet/src/components/pages/assets-page.tsx:1
- [ ] apps/wallet/src/components/pages/exchange-page.tsx:1
- [ ] apps/wallet/src/components/pages/exchange-detail-page.tsx:1
- [ ] apps/wallet/src/components/pages/deposit-page.tsx:1
- [ ] apps/wallet/src/components/pages/withdraw-page.tsx:1
- [ ] apps/wallet/src/components/pages/tokenization-page.tsx:1
- [ ] apps/wallet/src/components/pages/chat-page.tsx:1
- [ ] apps/wallet/src/components/scroll-video-section.tsx:1
- [ ] apps/wallet/src/components/exchange/charts.tsx:1

## Acceptance Criteria
- [ ] Every listed screen is verified at the four breakpoints with no horizontal overflow or clipped content
- [ ] Tap targets and typography are usable on mobile
- [ ] Checklist of screens x breakpoints is recorded in the PR or docs