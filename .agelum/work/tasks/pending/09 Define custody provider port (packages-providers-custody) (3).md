---
created: 2026-09-21T12:30:00.000Z
epic: alpha-version
priority: '09'
storyPoints: 3
title: Define custody provider port (packages/providers-custody)
type: task
workflowStatus: pending
---

# Define custody provider port (packages/providers-custody)

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Create `packages/providers-custody` with the provider-agnostic custody port modeled on Fireblocks concepts: vault accounts, wallets/assets, balances, transfers (internal/external, statuses), deposit addresses, and fiat/USDT on/off-ramp requests. Include types, error model and a conformance test suite that any adapter (mock now, real Fireblocks later) must pass. Read the operations research in `.agelum/doc/docs/research/providers/` to align the operations (issuance/custody, secondary market, onboarding) with port methods.

## Related Source Code
- [ ] .agelum/doc/docs/research/providers/fireblocks-operations-architecture.visual-check.json:1
- [ ] .agelum/doc/docs/research/providers/operations-issuance-custody.visual-check.json:1
- [ ] .agelum/doc/docs/research/providers/operations-secondary-market.visual-check.json:1
- [ ] .agelum/doc/docs/plan/status-2026-sep.md:71
- [ ] pnpm-workspace.yaml:1

## Acceptance Criteria
- [ ] `@repo/providers-custody` package exists with port, types and errors
- [ ] Port covers vault accounts, wallets, balances, transfers, deposit addresses, on/off-ramp
- [ ] Reusable conformance tests are exported
- [ ] No real-provider-specific code in the package