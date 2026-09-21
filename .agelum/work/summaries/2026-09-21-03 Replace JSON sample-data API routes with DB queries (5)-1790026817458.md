# Replace JSON sample-data API routes with DB queries

## Completed work

- Added the wallet database singleton, demo current-user switch point, database dependency, transpilation configuration, and local database URL.
- Replaced every JSON-backed wallet server API function with Drizzle queries against `@repo/db`.
- Added response mappers that preserve the existing wallet API shapes, including project/dashboard aliases, token/project joins, holdings, positions, transactions, and order-book sides/order.
- Scoped project stages by route project ID and removed the obsolete `sample-data.ts` runtime reader. JSON fixture files remain as seed inputs.
- Initialized the local SQLite database through `pnpm db:setup`; the seed contains 9 projects, 7 market tokens, balances, holdings, positions, transactions, and 48 order-book levels.

## Validation

- Passed: `pnpm --filter wallet exec tsc --noEmit`.
- Passed: `pnpm --filter wallet lint` with 34 pre-existing warnings and no errors.
- Passed: `git diff --check` and a source scan confirming no `readSampleJson`, `getSampleDataDir`, or `sample-data` references remain under `apps/wallet/src`.
- `pnpm build` initially compiled the wallet successfully and reached TypeScript validation, but subsequent Next build attempts hung in this environment while holding `.next/lock`; the owned build processes were terminated. Direct wallet TypeScript validation passed afterward.
