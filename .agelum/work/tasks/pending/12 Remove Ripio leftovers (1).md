---
created: 2026-09-21T12:30:00.000Z
epic: alpha-version
priority: 12
storyPoints: 1
title: Remove Ripio leftovers
type: task
workflowStatus: pending
---

# Remove Ripio leftovers

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Fireblocks is the chosen custody provider and Ripio is discarded. Remove the leftover `dev:ripio-mock` script from the root `package.json` (referencing a non-existent `@repo/ripio-mock` package) and the `RIPIO_MOCK_DATA_DIR` env var from `turbo.json` globalEnv, and update docs that mention them (WARP.md, plan docs where appropriate). If a replacement dev script for the Fireblocks mock is needed, add `dev:fireblocks-mock` only once that package exists.

## Related Source Code
- [ ] package.json:7
- [ ] turbo.json:8
- [ ] WARP.md:96
- [ ] WARP.md:109
- [ ] .agelum/doc/docs/plan/status-2026-sep.md:46

## Acceptance Criteria
- [ ] No `ripio`/`RIPIO` references remain in code, scripts or env config (historical notes in research docs may stay)
- [ ] `pnpm build` and `pnpm dev` still work
- [ ] WARP.md environment section updated