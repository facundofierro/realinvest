# Deprecate reactive library — summary

## Completed work

- Replaced wallet `useReactive` hooks with REST-backed React Query hooks, including position mutation wiring and cache invalidation.
- Removed wallet's reactive tRPC provider, tRPC/SSE routes, unused tRPC client, and duplicate reactive hook file.
- Added a local plain tRPC admin router backed by `@repo/db`, preserving the existing `admin.*` and `projects.getAll` procedure tree.
- Rewired admin's route handler, client type, provider, and property mutation invalidation for standard tRPC + React Query.
- Retired the `packages/backend` workspace package and removed reactive/backend dependencies from wallet and admin.
- Added the required admin database/transpilation dependencies and regenerated `pnpm-lock.yaml`.

## Verification

- `pnpm exec tsc --noEmit -p apps/admin/tsconfig.json`
- `pnpm exec tsc --noEmit -p apps/wallet/tsconfig.json`
- `git diff --check`
- Confirmed no active `@agelum/backend` or `@repo/backend` references remain under `apps/` or `packages/`.

## Known limitation preserved intentionally

`apps/wallet/src/lib/api/positions.ts` still has the pre-existing server-side position-creation stub. This task only connected the client hook to the existing REST endpoint; it does not introduce unspecified trading/position-matching behavior.
