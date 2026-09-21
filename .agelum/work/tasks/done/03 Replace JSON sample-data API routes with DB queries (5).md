---
created: 2026-09-21T12:30:00.000Z
epic: alpha-version
plan: .agelum/work/plans/2026-09-21-03 Replace JSON sample-data API routes with DB queries (5)-1790026729022.md
priority: '03'
status: done
storyPoints: 5
summary: .agelum/work/summaries/2026-09-21-03 Replace JSON sample-data API routes with DB queries (5)-1790026817458.md
title: Replace JSON sample-data API routes with DB queries
type: task
workflowStatus: done
---

# Replace JSON sample-data API routes with DB queries

**Project context:** RealInvest is a real-estate tokenization platform. The wallet app (`apps/wallet`, Next.js 16, React 19, TanStack Query, Tailwind 4, shared UI in `packages/ui`) is currently a UI mock-up: it reads sample JSON from `apps/wallet/src/sample-data/` through API routes, has no auth, no persistence and no providers. The "alpha version" goal is a fully functional alpha: Drizzle ORM + SQLite persistence, Google OAuth, simulated KYC provider, simulated Fireblocks custody provider (Fireblocks is the chosen custody provider; Ripio is discarded), an end-to-end investment loop, responsive polish, and package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers. Tenancy is resolved per deployment (no runtime multi-tenancy). Real blockchain issuance, real Fireblocks integration and native store releases are out of scope. Reference docs: `.agelum/doc/docs/plan/status-2026-sep.md`, `docs/plan/wallet-multiplatform.md`, `.agelum/doc/docs/research/providers/` (Fireblocks/operations research).

## Task

Replace every Next.js API route that reads sample JSON (via `readSampleJson` in `lib/sample-data.ts`) with real Drizzle queries against `@repo/db`. Keep response shapes identical so `lib/api-client.ts` and `hooks/use-queries.ts` keep working. Remove the JSON fallback/`getSampleDataDir` logic once nothing uses it. Keep the JSON files only as seed inputs. Depends on tasks for DB schema and seed.

## Related Source Code
- [ ] apps/wallet/src/lib/sample-data.ts:4
- [ ] apps/wallet/src/lib/api-client.ts:1
- [ ] apps/wallet/src/hooks/use-queries.ts:7
- [ ] apps/wallet/src/app/api/projects/route.ts:1
- [ ] apps/wallet/src/app/api/projects/[id]/route.ts:1
- [ ] apps/wallet/src/app/api/projects/[id]/units/route.ts:1
- [ ] apps/wallet/src/app/api/projects/[id]/stages/route.ts:1
- [ ] apps/wallet/src/app/api/projects/[id]/stories/route.ts:1
- [ ] apps/wallet/src/app/api/projects/[id]/purchase-options/route.ts:1
- [ ] apps/wallet/src/app/api/dashboard/projects/route.ts:1
- [ ] apps/wallet/src/app/api/wallet/holdings/route.ts:1
- [ ] apps/wallet/src/app/api/wallet/balances/route.ts:1
- [ ] apps/wallet/src/app/api/wallet/positions/route.ts:1
- [ ] apps/wallet/src/app/api/transactions/route.ts:1
- [ ] apps/wallet/src/app/api/market/tokens/route.ts:1
- [ ] apps/wallet/src/app/api/market/orderbook/route.ts:1
- [ ] apps/wallet/src/app/api/market/series/route.ts:1
- [ ] apps/wallet/src/lib/api:1
- [ ] apps/wallet/package.json:1

## Acceptance Criteria
- [ ] All API routes read from the database, none read JSON files
- [ ] Response shapes are unchanged; existing screens render the same seeded data
- [ ] `readSampleJson`/`getSampleDataDir` are removed or unused
- [ ] Data endpoints are scoped to the current user where applicable (holdings, balances, positions, transactions)
- [ ] Build and type-check pass