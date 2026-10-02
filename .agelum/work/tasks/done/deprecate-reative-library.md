---
created: 2026-09-22T06:42:35.150Z
plan: .agelum/work/plans/2026-09-22-deprecate-reative-library-1790059648221.md
status: done
summary: .agelum/work/summaries/2026-09-22-deprecate-reative-library-1790061912663.md
type: task
workflowStatus: done
---

# deprecate reative library

We are using our own reactive library (`@agelum/backend`, published upstream as `@drizzle/reactive` — a zero-config reactive layer combining Drizzle + tRPC + React Query with SSE-based cache invalidation) for data fetching/subscriptions. It is an external package pulled from the registry into `node_modules`, not vendored as workspace source. We want to replace it with a simpler, well-known approach — either tRPC directly or a plain REST API.

## Related source code

Dependency declarations:
- `packages/backend/package.json:20` — `"@agelum/backend": "^0.1.0"`
- `apps/wallet/package.json:17` — `"@agelum/backend": "^0.1.0"`
- `apps/admin/package.json` — does **not** declare `@agelum/backend`, yet `apps/admin/src/components/providers.tsx` imports from it directly; it only resolves because pnpm hoists it via `@repo/backend`. Needs a real dependency (or full removal) either way.

Direct usages of `@agelum/backend` (the reactive library):
- `packages/backend/src/router.ts:1` — `import { createReactiveRouter } from '@agelum/backend'`
- `packages/backend/src/router.ts:10` — `export const appRouter = createReactiveRouter({ db })`
- `packages/backend/src/db/index.ts:1` — `import { createReactiveDb } from '@agelum/backend'`
- `packages/backend/src/db/index.ts:14` — `export const db = createReactiveDb(drizzleDb, {...})`
- `packages/backend/src/functions/wallet.ts:1` — `import { defineReactiveFunction } from '@agelum/backend'` (used at lines 5, 25, 39)
- `packages/backend/src/functions/projects.ts:1` — `import { defineReactiveFunction } from '@agelum/backend'` (used at lines 6, 26, 40, 50, 65, 79, 93)
- `packages/backend/src/functions/admin.ts:1` — `import { defineReactiveFunction } from '@agelum/backend'` (used at lines 6, 77, 101, 140, 182, 217, 255)
- `packages/backend/src/functions/transactions.ts:1` — `import { defineReactiveFunction } from '@agelum/backend'` (used at lines 6, 37)
- `packages/backend/src/functions/market.ts:1` — `import { defineReactiveFunction } from '@agelum/backend'` (used at lines 5, 32, 69)
- `apps/wallet/src/app/api/events/route.ts:1` — `import { createSSEStream } from '@agelum/backend'`
- `apps/wallet/src/app/api/events/ack/route.ts:1` — `import { acknowledgeEvent } from '@agelum/backend'`
- `apps/wallet/src/components/providers.tsx:5` — `import { TrpcReactiveProvider } from "@agelum/backend/client"` (used at JSX lines 61/67)
- `apps/admin/src/components/providers.tsx:5` — `import { TrpcReactiveProvider } from "@agelum/backend/client"` (used at JSX lines 53/59)
- `apps/wallet/src/hooks/use-queries.ts:3` — `import { useReactive } from "@agelum/backend/client"` (used at lines 9, 13, 19, 27, 32, 36, 40, 44, 49, 53, 57, 61, 65, 69)
- `apps/wallet/src/hooks/use-reactive-queries.ts:1` — `import { useReactive } from '@agelum/backend/client'` (used at lines 7, 11, 15, 19, 23, 27, 31, 36, 40, 44, 49, 53, 57, 66)

Note: `use-queries.ts` and `use-reactive-queries.ts` appear to be near-duplicates (same procedure names/hooks) — likely leftovers from a previous refactor. Worth consolidating into a single hook file as part of this migration rather than porting both.

Consumers of the wrapper hooks above (will need updating once the hooks' internals are swapped out, but do not import `@agelum/backend` directly):
- `apps/wallet/src/components/desktop-top-nav.tsx`
- `apps/wallet/src/components/desktop-token-tabs.tsx`
- `apps/wallet/src/components/pages/withdraw-page.tsx`
- `apps/wallet/src/components/pages/dashboard-page.tsx`
- `apps/wallet/src/components/pages/project-units-page.tsx`
- `apps/wallet/src/components/pages/project-detail-page.tsx`
- `apps/wallet/src/components/pages/exchange-page.tsx`
- `apps/wallet/src/components/pages/invest-page.tsx`
- `apps/wallet/src/components/pages/exchange-detail-page.tsx`
- `apps/wallet/src/components/pages/assets-page.tsx`