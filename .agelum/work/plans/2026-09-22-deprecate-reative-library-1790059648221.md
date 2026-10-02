# Deprecate `@agelum/backend` (reactive library)

## Certainty assessment

**Level: Medium-High**

Every direct usage of `@agelum/backend` listed in the task file was located and read in full (router, db, all five function modules, both wallet hook files, both providers.tsx files, both trpc routes, the SSE routes). The repo is already mid-migration: `apps/wallet` has a nearly-complete parallel REST implementation (routes under `apps/wallet/src/app/api/**` backed by `apps/wallet/src/lib/api/*.ts`, all reading from the new `@repo/db` SQLite package) that duplicates most of what `packages/backend`'s reactive router does for wallet, but the wallet **hooks** (`use-queries.ts`) were never switched over to it — they still call `useReactive(...)`. `apps/admin` has no such parallel layer at all and depends entirely on the reactive router's tRPC surface (`trpc.admin.properties.create.useMutation()` etc. in `apps/admin/src/components/pages/properties-page.tsx:274-275`).

What lowers certainty from "High": two mutation code paths were confirmed to be stubs that predate this task and were never real even under the reactive library (`createPosition` in `apps/wallet/src/lib/api/positions.ts:23-26` always returns `{ok: true}` without touching the DB; `apps/wallet/src/hooks/use-queries.ts:81-101`'s `useCreatePosition`/`useClosePosition` just `console.warn`). The plan below preserves this existing (non-)behavior rather than inventing new trading logic, since implementing real position-matching is out of scope for a library-deprecation task — but that judgment call, and the bigger architectural question below, is why this isn't "High".

## Ambiguity assessment

**Level: Low**

The task file frames this as "swap reactive-tRPC for plain tRPC or REST." Investigation surfaced a structural fork not resolved by the task file itself — the choice of database backend for `apps/admin`, the target shape of admin's router (plain tRPC vs. REST), and the fate of the `packages/backend` workspace package. These were raised with the user directly and resolved:

1. **Database**: consolidate everything on `@repo/db` (SQLite/libSQL) — `packages/backend`'s Postgres connection and schema are retired. **Confirmed by user.**
2. **Admin router shape**: plain, non-reactive tRPC router preserving today's procedure tree (`trpc.namespace.action.useQuery/useMutation()` call sites in `apps/admin` keep working; only provider/client wiring changes). **Confirmed by user.**
3. **`packages/backend` package**: deleted outright; its router logic moves into `apps/admin/src/server/router.ts` since admin is the only remaining consumer once wallet drops it. **Confirmed by user.**

No other open decisions remain — the steps below are directly executable.

---

## Confirmed target architecture (assumed by the steps below)

- **Consolidate on `@repo/db`** (SQLite/libSQL) as the only database. `packages/backend`'s own Postgres connection and schema are retired. Rationale: this is the direction the most recent commits (`41ada70`, `698398c`) already moved wallet in; `@repo/db`'s schema (`packages/db/src/schema.ts:22-277`) is a strict superset of what admin's functions need (`projects`, `units`, `marketTokens`, `transactions`, `balances`) except for a persisted market-series/history table, which admin doesn't use anyway (only wallet's `market.series.get` used it, and wallet's REST replacement `apps/wallet/src/lib/api/market-series.ts` already generates it synthetically instead of reading a table — a pre-existing behavior, not something this task changes).
- **`apps/wallet`** finishes the REST migration already in progress: hooks call REST endpoints via `fetch` + React Query, no tRPC client, no reactive provider.
- **`apps/admin`** gets a **plain (non-reactive) tRPC router**, rebuilt against `@repo/db`, preserving today's procedure names/tree so `apps/admin/src/hooks/use-admin-queries.ts` and the direct `trpc.*` calls in `properties-page.tsx` need no call-site rewrites — only the provider/client wiring changes.
- **`packages/backend`** is retired as a workspace package; its router becomes `apps/admin/src/server/router.ts` (admin's only remaining consumer). This avoids maintaining an indirection layer for a single consumer.

---

## Phase 1 — Finish the wallet migration off `@agelum/backend`

### 1.1 Rewrite `apps/wallet/src/hooks/use-queries.ts` to use REST + React Query

Every read hook currently calls `useReactive(...)` from `@agelum/backend/client` (`apps/wallet/src/hooks/use-queries.ts:3,11-77`). `apps/wallet/src/lib/api-client.ts` already exports a fully-implemented `fetch`-based function for every one of these reads (`getMarketTokens`, `getMarketSeries`, `getMarketOrderBook`, `getWalletBalances`, `getWalletHoldings`, `getWalletPositions`, `getTransactions`, `getProjects`, `getProjectById`, `getProjectUnits`, `getProjectStories`, `getProjectStages`, `getProjectPurchaseOptions`, `getDashboardProjects` — see `apps/wallet/src/lib/api-client.ts:74-338`). Replace each hook body with a `useQuery` call against the matching `api-client.ts` function, keyed by procedure name + args, e.g.:

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMarketTokens, getMarketSeries, getMarketOrderBook,
  getWalletBalances, getWalletHoldings, getWalletPositions,
  getTransactions, getProjects, getProjectById, getProjectUnits,
  getProjectStories, getProjectStages, getProjectPurchaseOptions,
  getDashboardProjects, createPosition, closePosition,
} from "@/lib/api-client";

export function useMarketTokens() {
  return useQuery({ queryKey: ["market", "tokens"], queryFn: getMarketTokens });
}

export function useMarketToken(symbol: string) {
  const { data: tokens, ...rest } = useMarketTokens();
  const token = tokens?.find((t) => t.symbol === symbol);
  return { data: token, ...rest };
}

export function useMarketOrderBook(symbol: string) {
  return useQuery({ queryKey: ["market", "orderbook", symbol], queryFn: () => getMarketOrderBook(symbol) });
}

export function useMarketSeries(symbol: string, timeframe: "all" | "30d" | "7d" | "24h", points = 30) {
  return useQuery({ queryKey: ["market", "series", symbol, timeframe], queryFn: () => getMarketSeries(symbol, timeframe, points) });
}

export function useWalletBalances() {
  return useQuery({ queryKey: ["wallet", "balances"], queryFn: getWalletBalances });
}

export function useWalletHoldings() {
  return useQuery({ queryKey: ["wallet", "holdings"], queryFn: getWalletHoldings });
}

export function useWalletPositions() {
  return useQuery({ queryKey: ["wallet", "positions"], queryFn: getWalletPositions });
}

export function useTransactions() {
  return useQuery({ queryKey: ["transactions"], queryFn: getTransactions });
}

export function useProjects() {
  return useQuery({ queryKey: ["projects"], queryFn: getProjects });
}

export function useProject(id: string) {
  return useQuery({ queryKey: ["projects", id], queryFn: () => getProjectById(id) });
}

export function useProjectStories(projectId: string) {
  return useQuery({ queryKey: ["projects", projectId, "stories"], queryFn: () => getProjectStories(projectId) });
}

export function useProjectStages(projectId: string) {
  return useQuery({ queryKey: ["projects", projectId, "stages"], queryFn: () => getProjectStages(projectId) });
}

export function useProjectPurchaseOptions(projectId: string) {
  return useQuery({ queryKey: ["projects", projectId, "purchaseOptions"], queryFn: () => getProjectPurchaseOptions(projectId) });
}

export function useProjectUnits(projectId: string) {
  return useQuery({ queryKey: ["projects", projectId, "units"], queryFn: () => getProjectUnits(projectId) });
}

export function useDashboardProjects() {
  return useQuery({ queryKey: ["dashboard", "projects"], queryFn: getDashboardProjects });
}
```

Notes on fidelity to current behavior:
- `useMarketOrderBook`/`useMarketSeries`/`useProject` etc. previously took reactive "dependencies" that auto-invalidated via SSE when the underlying table changed. Plain React Query has no equivalent push channel; matching that exactly would require polling or a new invalidation mechanism, which is out of scope (no SSE/websocket replacement is implied by "deprecate the reactive library" — the task explicitly wants something *simpler*). Callers get the existing `staleTime: 60_000` / manual refetch behavior already configured in `apps/wallet/src/components/providers.tsx:29-39`.
- `useMarketToken(symbol)` keep as a client-side derive over `useMarketTokens()` (same as the current implementation at `apps/wallet/src/hooks/use-queries.ts:15-19`), since there's no REST endpoint for a single token by symbol.

Leave `useKycApplication`/`useSubmitKyc` (`apps/wallet/src/hooks/use-queries.ts:105-119`) untouched — they already use plain `useQuery`/`useMutation` and don't touch `@agelum/backend`.

### 1.2 Wire up the two mutations instead of leaving them stubbed

Replace the stub bodies at `apps/wallet/src/hooks/use-queries.ts:81-101`:

```ts
export function useCreatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPosition, // from "@/lib/api-client"
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet", "positions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "holdings"] });
    },
  });
}

export function useClosePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: closePosition, // from "@/lib/api-client"
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wallet", "positions"] }),
  });
}
```

This wires the hooks to the REST functions that already exist (`apps/wallet/src/lib/api-client.ts:187-233`), rather than leaving `console.warn` stubs. It does **not** fix the underlying stub at `apps/wallet/src/lib/api/positions.ts:23-26` (server-side `createPosition` still doesn't write to the DB) — that's a pre-existing gap unrelated to the reactive library and out of scope here. Flag it in the summary but don't silently "fix" trading logic that was never specified.

### 1.3 Delete the dead duplicate hook file

`apps/wallet/src/hooks/use-reactive-queries.ts` has zero importers anywhere in the repo (confirmed by search) and duplicates `use-queries.ts` with slightly different signatures. Delete the file outright rather than porting it.

### 1.4 Strip the reactive provider out of `apps/wallet/src/components/providers.tsx`

Current file (`apps/wallet/src/components/providers.tsx:1-71`) wraps children in `TrpcReactiveProvider` and builds a `trpcClient` that's now unused once 1.1 lands. New version:

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { SplashScreen } from "./splash-screen";
import { AppSessionProvider } from "@/lib/session";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <AppSessionProvider>
      <QueryClientProvider client={queryClient}>
        <SplashScreen>{children}</SplashScreen>
      </QueryClientProvider>
    </AppSessionProvider>
  );
}
```

Drop the `reactiveRelations` object (`apps/wallet/src/components/providers.tsx:13-26`), the `trpcClient` `useState` (`:41-53`), the `organizationId` constant (`:56`), and the `TrpcReactiveProvider`/`createTRPCClient`/`httpBatchLink`/`AppRouter`/`getApiUrl`/`getNativeAccessToken` imports that become unused (`:5-10`). Keep `getApiUrl` exported from `api-client.ts` regardless — it's still used by every REST call in that file.

### 1.5 Delete now-dead wallet files

- `apps/wallet/src/app/api/trpc/[trpc]/route.ts` — only existed to serve the reactive router (`import { appRouter } from '@repo/backend'`, `apps/wallet/src/app/api/trpc/[trpc]/route.ts:1-16`). No client calls it after 1.4.
- `apps/wallet/src/app/api/events/route.ts` — wraps `createSSEStream` from `@agelum/backend` (`:1,11`), only consumed by `TrpcReactiveProvider`'s internal SSE client, which is gone after 1.4.
- `apps/wallet/src/app/api/events/ack/route.ts` — wraps `acknowledgeEvent` from `@agelum/backend`, same reasoning.
- `apps/wallet/src/lib/trpc.ts` — `createTRPCReact<AppRouter>()` with **zero importers** anywhere in `apps/wallet/src` (confirmed by search); dead leftover, delete.

### 1.6 Drop the dependency

Remove `"@agelum/backend": "^0.1.0"` from `apps/wallet/package.json:17` (it's the only remaining reason wallet needs it once 1.1-1.5 land). Leave `@repo/backend`, `@trpc/*` deps alone only if Phase 2 still needs them for admin from a shared package — otherwise (per the recommended default of folding the router into `apps/admin`) also remove `@repo/backend` (no longer referenced) and, if nothing else in wallet uses raw `@trpc/client`/`@trpc/react-query`/`@trpc/server`, remove those three too. Re-check with a repo-wide grep for `@trpc/` and `@repo/backend` inside `apps/wallet/src` before removing — don't remove a dependency still imported somewhere not enumerated above.

---

## Phase 2 — Replace the reactive router for `apps/admin` (confirmed: plain tRPC, router moved into `apps/admin`)

### 2.1 Create `apps/admin/src/server/db.ts`

Mirror `apps/wallet/src/lib/db.ts:1-6` exactly — a `getDb()` singleton wrapping `createDb()` from `@repo/db`:

```ts
import { createDb, type Db } from "@repo/db";

const globalForDb = globalThis as unknown as { db?: Db };

export function getDb(): Db {
  return (globalForDb.db ??= createDb());
}
```

### 2.2 Create `apps/admin/src/server/router.ts` — a plain tRPC router replacing `packages/backend/src/router.ts`

Use vanilla `initTRPC` from `@trpc/server` (already a dependency of `apps/admin/package.json`) instead of `createReactiveRouter` (`packages/backend/src/router.ts:1,10`). Reconstruct the exact procedure tree the reactive router synthesized from each function's dotted `name` field, so `apps/admin/src/hooks/use-admin-queries.ts:6-27` and `apps/admin/src/components/pages/properties-page.tsx:274-275` keep working unchanged:

```ts
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import { projects, units, marketTokens, transactions, balances } from "@repo/db";
import { getDb } from "./db";

const t = initTRPC.create();
const router = t.router;
const publicProcedure = t.procedure;

const adminRouter = router({
  dashboard: router({
    stats: publicProcedure.input(z.object({})).query(async () => {
      const db = getDb();
      const [liquidity] = await db.select({ total: sql<number>`COALESCE(SUM(${balances.available}), 0)` }).from(balances);
      const [marketCap] = await db.select({ total: sql<number>`COALESCE(SUM(${marketTokens.marketCapUsd}), 0)` }).from(marketTokens);
      const [projectCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(projects);
      const [txnCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(transactions);
      const [mostValuable] = await db
        .select({ id: projects.id, title: projects.title, value: sql<number>`COALESCE(SUM(${marketTokens.marketCapUsd}), 0)` })
        .from(projects).leftJoin(marketTokens, eq(projects.id, marketTokens.projectId))
        .groupBy(projects.id, projects.title)
        .orderBy(desc(sql`COALESCE(SUM(${marketTokens.marketCapUsd}), 0)`)).limit(1);
      const [highestRoi] = await db
        .select({ id: projects.id, title: projects.title, roi: projects.roiPct })
        .from(projects).orderBy(desc(projects.roiPct)).limit(1);
      return {
        totalLiquidity: liquidity?.total ?? 0,
        totalTokenMarketCap: marketCap?.total ?? 0,
        totalProperties: Number(projectCount?.count ?? 0),
        totalTransactions: Number(txnCount?.count ?? 0),
        mostValuableProperty: mostValuable ?? null,
        highestRoiProperty: highestRoi ?? null,
      };
    }),
  }),
  properties: router({
    statistics: publicProcedure.input(z.object({})).query(async () => {
      const db = getDb();
      return db
        .select({
          projectId: projects.id, projectTitle: projects.title,
          totalValue: sql<number>`COALESCE(SUM(${marketTokens.marketCapUsd}), 0)`,
          tokenCount: sql<number>`COUNT(${marketTokens.id})`,
        })
        .from(projects).leftJoin(marketTokens, eq(projects.id, marketTokens.projectId))
        .groupBy(projects.id, projects.title)
        .orderBy(desc(sql`COALESCE(SUM(${marketTokens.marketCapUsd}), 0)`));
    }),
    create: publicProcedure.input(z.object({
      id: z.string(), title: z.string(), location: z.string(), image: z.string(),
      status: z.enum(["PRE_SALE", "IN_CONSTRUCTION", "COMPLETED"]),
      roiPct: z.number(), progressPct: z.number(),
      priceRangeUsd: z.string().optional(), fixedRentPct: z.number().optional(),
      tokensTotal: z.number().optional(), launchDate: z.string().optional(), nextLaunchDate: z.string().optional(),
    })).mutation(async ({ input }) => {
      const [created] = await getDb().insert(projects).values(input).returning();
      return created;
    }),
    update: publicProcedure.input(z.object({
      id: z.string(), title: z.string().optional(), location: z.string().optional(), image: z.string().optional(),
      status: z.enum(["PRE_SALE", "IN_CONSTRUCTION", "COMPLETED"]).optional(),
      roiPct: z.number().optional(), progressPct: z.number().optional(),
      priceRangeUsd: z.string().optional(), fixedRentPct: z.number().optional(),
      tokensTotal: z.number().optional(), launchDate: z.string().optional(), nextLaunchDate: z.string().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      const [updated] = await getDb().update(projects).set(updateData).where(eq(projects.id, id)).returning();
      return updated;
    }),
  }),
  units: router({
    create: publicProcedure.input(z.object({
      id: z.string(), projectId: z.string(), unitCode: z.string(), title: z.string(), type: z.string(), floor: z.string(),
      areaM2: z.number().optional(), area: z.string().optional(), bedrooms: z.number().optional(), bathrooms: z.number().optional(),
      floorPlanImage: z.string().optional(), tokenSymbol: z.string().optional(), tokenName: z.string().optional(),
      isTokenized: z.boolean().default(false),
      investmentType: z.enum(["fixed_rent", "appreciation", "construction", "full_property"]).optional(),
      status: z.string(), price: z.string(), orientation: z.string().optional(), totalTokens: z.number().optional(),
    })).mutation(async ({ input }) => {
      const [created] = await getDb().insert(units).values(input).returning();
      return created;
    }),
    update: publicProcedure.input(z.object({
      id: z.string(), unitCode: z.string().optional(), title: z.string().optional(), type: z.string().optional(), floor: z.string().optional(),
      areaM2: z.number().optional(), area: z.string().optional(), bedrooms: z.number().optional(), bathrooms: z.number().optional(),
      floorPlanImage: z.string().optional(), tokenSymbol: z.string().optional(), tokenName: z.string().optional(),
      isTokenized: z.boolean().optional(),
      investmentType: z.enum(["fixed_rent", "appreciation", "construction", "full_property"]).optional(),
      status: z.string().optional(), price: z.string().optional(), orientation: z.string().optional(), totalTokens: z.number().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      const [updated] = await getDb().update(units).set(updateData).where(eq(units.id, id)).returning();
      return updated;
    }),
  }),
  transactions: router({
    getAll: publicProcedure.input(z.object({
      type: z.enum(["DEPOSIT", "WITHDRAWAL", "BUY", "SELL", "DIVIDEND"]).optional(),
      status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
      userId: z.string().optional(),
      limit: z.number().optional().default(100),
    })).query(async ({ input }) => {
      const conditions = [
        input.type ? eq(transactions.type, input.type) : undefined,
        input.status ? eq(transactions.status, input.status) : undefined,
        input.userId ? eq(transactions.userId, input.userId) : undefined,
      ].filter(Boolean);
      const db = getDb();
      const query = conditions.length ? db.select().from(transactions).where(and(...conditions)) : db.select().from(transactions);
      return query.orderBy(desc(transactions.createdAt)).limit(input.limit);
    }),
  }),
});

export const appRouter = router({
  admin: adminRouter,
  projects: router({
    getAll: publicProcedure.input(z.object({ status: z.enum(["PRE_SALE", "IN_CONSTRUCTION", "COMPLETED"]).optional() })).query(({ input }) =>
      input.status
        ? getDb().query.projects.findMany({ where: (p, { eq }) => eq(p.status, input.status!) })
        : getDb().query.projects.findMany()
    ),
  }),
});

export type AppRouter = typeof appRouter;
```

This is a direct field-for-field, name-for-name port of `packages/backend/src/functions/admin.ts:6-293` and the `projects.getAll` query referenced by `apps/admin/src/hooks/use-admin-queries.ts:12`, retargeted from `db.db._.schema!`-style dynamic table lookup (a reactive-library idiom, `packages/backend/src/functions/admin.ts:11,82,111,158,200,242,279`) to direct imports from `@repo/db`. Field name differences to account for while porting:
- Postgres `wallet_balance`/`walletBalances` → SQLite `balances` (`packages/db/src/schema.ts:192-200`).
- Postgres `project_unit`/`projectUnits` → SQLite `units` (`packages/db/src/schema.ts:102-130`).
- `progressPct`/`roiPct` are `real` in both schemas — no cast needed.
- `createdAt`/`updatedAt` are handled automatically by `@repo/db`'s `$defaultFn` (see `packages/db/src/schema.ts:22-23` pattern) — don't set them manually the way `packages/backend/src/functions/admin.ts:173-174,207,246-247,286-287` does with `new Date()`, since `@repo/db`'s `projects`/`units` tables don't even define `createdAt`/`updatedAt` columns (`packages/db/src/schema.ts:86-100,102-130`). Drop those fields from the insert/update payloads entirely rather than porting them.

Only add `admin.units.create`/`admin.units.update` to the tree if 2.2 is implemented faithfully — confirmed unused by any current admin page (`use-admin-queries.ts` and `properties-page.tsx` don't call them), but keep them since deleting reachable API surface isn't part of "deprecate the reactive library."

### 2.3 Rewrite `apps/admin/src/app/api/trpc/[trpc]/route.ts`

Current (`apps/admin/src/app/api/trpc/[trpc]/route.ts:1-13`) imports `appRouter` from `@repo/backend`. Point it at the new local router instead:

```ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/router";

const handler = (req: Request) =>
  fetchRequestHandler({ endpoint: "/api/trpc", req, router: appRouter, createContext: () => ({}) });

export { handler as GET, handler as POST };
```

### 2.4 Rewrite `apps/admin/src/lib/trpc.ts`

Point the `AppRouter` type import at the new local router instead of `@repo/backend` (`apps/admin/src/lib/trpc.ts:2`):

```ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/router";

export const trpc = createTRPCReact<AppRouter>();
```

### 2.5 Rewrite `apps/admin/src/components/providers.tsx`

Current file (`apps/admin/src/components/providers.tsx:1-65`) wraps children in `TrpcReactiveProvider`. Since 2.2-2.4 give admin a real (non-reactive) tRPC router, use the standard `trpc.Provider` pattern instead:

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { trpc } from "@/lib/trpc";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false } },
  }));

  const [trpcClient] = useState(() =>
    trpc.createClient({ links: [httpBatchLink({ url: "/api/trpc" })] })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

Drop the `reactiveRelations` object (`apps/admin/src/components/providers.tsx:8-21`) and the `organizationId` constant (`:26`) entirely — there's no invalidation-by-relation concept in plain tRPC/React Query; callers rely on `staleTime` and explicit `queryClient.invalidateQueries(...)` after mutations (see 2.6).

Note: this switches admin's tRPC wiring from the ad-hoc `createTRPCClient` your codebase built manually (`apps/admin/src/components/providers.tsx:41-46`, previously fed into `TrpcReactiveProvider`) to the idiomatic `trpc.createClient(...)` + `trpc.Provider` pairing that `createTRPCReact()` expects. This is what actually makes `trpc.admin.properties.create.useMutation()` (`apps/admin/src/components/pages/properties-page.tsx:274`) resolve correctly against a real query-client context — worth double-checking this was even working correctly before, since `TrpcReactiveProvider` is not the standard context `createTRPCReact()` hooks read from.

### 2.6 Add cache invalidation to `apps/admin/src/components/pages/properties-page.tsx:274-275`

The reactive library used to auto-invalidate `useAllProjects`'s `projects.getAll` query when `admin.properties.create`/`update` fired, via the `dependencies: ['project']` declarations on the reactive functions (`packages/backend/src/functions/admin.ts:156,198`) plus the relation graph in `packages/backend/src/db/index.ts:16-17`. Plain tRPC + React Query has no automatic equivalent. Add explicit invalidation where those mutations are used, e.g.:

```ts
const utils = trpc.useUtils();
const createMutation = trpc.admin.properties.create.useMutation({
  onSuccess: () => utils.projects.getAll.invalidate(),
});
const updateMutation = trpc.admin.properties.update.useMutation({
  onSuccess: () => utils.projects.getAll.invalidate(),
});
```
(Read the surrounding code in `properties-page.tsx` around lines 270-290 before editing — the exact current `onSuccess`/error-handling shape wasn't dumped in this plan and should be preserved, only the invalidation added.)

### 2.7 Delete `packages/backend`

Once `apps/admin` no longer imports from `@repo/backend` (after 2.2-2.5) and `apps/wallet` no longer does either (after Phase 1), delete the package directory `packages/backend/` entirely (`package.json`, `src/router.ts`, `src/db/`, `src/functions/`). Remove `"@repo/backend": "workspace:*"` from `apps/wallet/package.json:17`-area and `apps/admin/package.json`'s dependency list, and remove any pnpm-workspace references that only existed for it (none expected beyond the standard `packages/*` glob in `pnpm-workspace.yaml:2`).

### 2.8 Add `@repo/db` to admin's dependencies and transpile config

`apps/admin/package.json` currently has no `@repo/db` entry — add `"@repo/db": "workspace:*"` alongside the existing `@repo/ui` line. `apps/admin/next.config.ts:6` currently only transpiles `["@repo/ui"]` — add `"@repo/db"` to that array (mirroring `apps/wallet/next.config.ts:6`, which already lists `@repo/db`).

### 2.9 Environment variables

Admin's new `getDb()` (2.1) reads `process.env.DATABASE_URL` / `DATABASE_AUTH_TOKEN` the same way wallet's does (`packages/db/src/client.ts:8-9`). Confirm `apps/admin`'s `.env`/deployment config sets these to point at the **same** database wallet uses (this is the whole point of consolidating — admin and wallet must read the same data). `.env.example` (root, already modified in this branch per git status) is the place these are documented; add an admin-specific note only if admin's dev script needs a distinct example beyond what wallet already documents.

---

## Phase 3 — Final sweep

### 3.1 Dependency cleanup

- Confirm no remaining reference to `@agelum/backend` anywhere: `grep -r "@agelum/backend" apps packages --include="*.ts" --include="*.tsx" --include="package.json"` should return nothing.
- Remove the now-fully-unused `@agelum/backend` entry from pnpm's lockfile by running `pnpm install` after all `package.json` edits land (regenerates `pnpm-lock.yaml`; do not hand-edit the lockfile).
- Double check `apps/wallet/package.json` and `apps/admin/package.json` still declare every `@trpc/*` package they concretely import after the rewrites (wallet likely drops all three `@trpc/*` deps per 1.6; admin keeps all three since 2.2-2.5 still use `@trpc/server`, `@trpc/client`, `@trpc/react-query`).

### 3.2 Confirm no orphaned imports

Re-grep for `createReactiveRouter`, `createReactiveDb`, `defineReactiveFunction`, `useReactive`, `TrpcReactiveProvider`, `createSSEStream`, `acknowledgeEvent` across `apps/` and `packages/` — every hit should be gone once Phases 1-2 are complete.

### 3.3 Consumers of the wallet hooks that don't import `@agelum/backend` directly

These files import from `apps/wallet/src/hooks/use-queries.ts` and don't need code changes themselves (the hook signatures in 1.1/1.2 are kept identical to today's), but should be spot-checked once Phase 1 lands since they're the actual UI surfaces exercising every hook:
`apps/wallet/src/components/desktop-top-nav.tsx`, `desktop-token-tabs.tsx`, `pages/withdraw-page.tsx`, `pages/dashboard-page.tsx`, `pages/project-units-page.tsx`, `pages/project-detail-page.tsx`, `pages/exchange-page.tsx`, `pages/invest-page.tsx`, `pages/exchange-detail-page.tsx`, `pages/assets-page.tsx`, plus `pages/kyc-onboarding-page.tsx` and `kyc/kyc-wizard.tsx` (found during this investigation, not listed in the task file, but they do import `use-queries.ts`).
