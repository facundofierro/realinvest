---
workflowStatus: pending
---

---
title: Responsive: landscape and small-window edge cases
created: 2026-09-21T12:30:00.000Z
type: task
state: pending
priority: 18
storyPoints: 3
epic: alpha-version
---

# Responsive: landscape and small-window edge cases

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Handle landscape phones and small/resized desktop windows relevant to the future Tauri desktop build: minimum window size, short viewport heights (dialogs/sheets scroll, no clipped actions), split-view tablets, and dynamic resize without state loss. Provide a minimum window size setting for Tauri config.

## Related Source Code
- [ ] native/wallet/tauri/src-tauri:1
- [ ] apps/wallet/src/components/unit-details-dialog.tsx:1
- [ ] apps/wallet/src/components/unit-details-sheet.tsx:1
- [ ] apps/wallet/src/components/exchange/trade-dialog.tsx:1
- [ ] apps/wallet/src/hooks/use-is-desktop.ts:5
- [ ] apps/wallet/src/components/bottom-nav.tsx:1

## Acceptance Criteria
- [ ] Dialogs and sheets remain fully usable at 320x480 and landscape 667x375
- [ ] Resizing across breakpoints doesn't lose state
- [ ] Tauri minimum window size configured