# Session handling for native wrappers (Capacitor/Tauri)

## Completed work

- Added native authorization-code and rotating refresh-token database tables,
  inferred types, and generated migration `0002_neat_dagger.sql`.
- Added native OAuth routes for browser start, deep-link completion, token
  exchange, refresh rotation/reuse revocation, and sign-out revocation.
- Added signed 15-minute Bearer access tokens and extended API/tRPC
  authentication to accept them while preserving Auth.js cookie sessions for
  web users.
- Added the shared `useAppSession()` / `AppSessionProvider` abstraction,
  native secure-storage adapters, system-browser OAuth launch, deep-link token
  exchange, proactive/reactive refresh, and a static-export dashboard guard.
- Updated API and tRPC clients to use `NEXT_PUBLIC_API_URL` and native Bearer
  credentials; wired existing sign-out controls through the shared abstraction.
- Registered the `realinvestwallet://auth-callback` deep link in Capacitor
  (iOS/Android) and Tauri, and added the required Capacitor/Tauri plugins.
- Documented the end-to-end flow, lifecycle, configuration, and known
  limitations in `docs/plan/wallet-native-auth.md`, with a cross-link from the
  multiplatform plan.

## Verification

- `pnpm --filter @repo/db db:generate` — passed; generated the native-auth
  migration.
- `pnpm --filter @repo/db check-types` — passed.
- `pnpm exec tsc --noEmit -p native/wallet/nextjs/tsconfig.json` — the new
  native-session imports resolve; remaining errors are pre-existing strict
  typing failures in unrelated wallet screens and backend functions.
- A native Next build was started but an earlier concurrent `next build` held
  `native/wallet/nextjs/.next/lock`, so a clean production build could not be
  completed in this working tree.

## Known limitations retained intentionally

- No user-facing per-device native-session management or biometric re-lock.
- System-browser sign-in is intentional.
- Store signing and release packaging are out of scope.
