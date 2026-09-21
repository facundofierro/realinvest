---
created: 2026-09-21T12:30:00.000Z
epic: alpha-version
priority: '05'
storyPoints: 3
title: Session handling for native wrappers (Capacitor/Tauri)
type: task
workflowStatus: pending
---

# Session handling for native wrappers (Capacitor/Tauri)

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Make the authentication session strategy work in the native wrappers (Capacitor and Tauri static export builds) following `docs/plan/wallet-multiplatform.md` and `docs/plan/wallet-multiplatform-implementation.md`. Web behavior must remain unchanged. Define how OAuth redirect / token exchange happens in a webview (system browser + deep link, or token-based session) and how the session is stored securely. A working design plus implemented web-side hooks/abstraction is required; actual store releases are out of scope. Depends on the Google OAuth task.

## Related Source Code
- [ ] docs/plan/wallet-multiplatform.md:1
- [ ] docs/plan/wallet-multiplatform-implementation.md:1
- [ ] native/wallet/capacitor/capacitor.config.ts:1
- [ ] native/wallet/nextjs/next.config.ts:1
- [ ] native/wallet/tauri/src-tauri:1
- [ ] apps/wallet/src/components/providers.tsx:1

## Acceptance Criteria
- [ ] Documented session/OAuth flow for Capacitor and Tauri
- [ ] A session abstraction lets the app run on web and native webviews without changing screens
- [ ] Web flow is unaffected
- [ ] Known limitations are listed in the doc