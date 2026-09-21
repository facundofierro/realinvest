# Google OAuth authentication (Auth.js) — implementation summary

Implemented Google OAuth authentication for the wallet with Auth.js v5 and the Drizzle adapter.

## Changes made

- Added `next-auth@beta` and `@auth/drizzle-adapter`, including the lockfile update.
- Updated Auth.js account schema property keys to the adapter-required snake_case names without changing SQL column names; Drizzle confirmed no migration is required.
- Added Auth.js configuration, Google provider, JWT sessions, KYC session claims, non-null user-name fallback, Auth route handler, TypeScript session/JWT augmentation, and Next 16 `proxy.ts` protection.
- Replaced the demo identity switch with session-based identity and protected every non-auth API route both in the proxy and in its route handler.
- Added SessionProvider/current-user hook, Google-only login UI, authenticated-login redirect, desktop account menu, and mobile account/sign-out dialog.
- Added environment-variable declarations and OAuth setup documentation; clarified that the demo user is fixtures-only.

## Verification

- `pnpm --filter @repo/db db:generate` — passed; reported no schema changes or migration.
- `pnpm --filter wallet exec tsc --noEmit` — passed.
- `pnpm --filter wallet build` was started twice but stalled at Next.js's initial optimized-compilation step without diagnostics in this environment. Both build processes were terminated to release the `.next` lock.
