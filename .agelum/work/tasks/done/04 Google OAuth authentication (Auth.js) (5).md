---
created: 2026-09-21T12:30:00.000Z
epic: alpha-version
plan: .agelum/work/plans/2026-09-21-04 Google OAuth authentication (Auth.js) (5)-1790027369241.md
priority: '04'
status: done
storyPoints: 5
summary: .agelum/work/summaries/2026-09-21-04 Google OAuth authentication (Auth.js) (5)-1790027740696.md
title: Google OAuth authentication (Auth.js)
type: task
workflowStatus: done
---

# Google OAuth authentication (Auth.js)

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Replace the mock email/password login with Google OAuth using Auth.js (NextAuth) or an equivalent, with the DB adapter from `@repo/db` (users, sessions, accounts). Protect all `(dashboard)` routes and API routes (redirect unauthenticated users to `/login`), add sign-out, and expose the current user (id, name, email, image, kycStatus) to the client. The login screen must keep its visual design but use a "Continue with Google" button. Document required env vars (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`) and add them to `turbo.json` globalEnv/`.env.example`.

## Related Source Code
- [ ] apps/wallet/src/components/pages/login-page.tsx:51
- [ ] apps/wallet/src/app/(auth)/login/page.tsx:1
- [ ] apps/wallet/src/app/(dashboard)/layout.tsx:1
- [ ] apps/wallet/src/components/dashboard-layout-client.tsx:1
- [ ] apps/wallet/src/components/providers.tsx:1
- [ ] apps/wallet/package.json:13
- [ ] turbo.json:3

## Acceptance Criteria
- [ ] Google sign-in works end to end and creates/links a user row in the DB
- [ ] Unauthenticated access to dashboard pages and API routes is rejected/redirected
- [ ] Sign-out works from the app shell
- [ ] User's KYC status is available in the session/client
- [ ] Env vars are documented