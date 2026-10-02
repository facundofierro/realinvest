---
created: 2026-10-02T13:54:29.664Z
plan: .agelum/work/plans/2026-10-02-reload-1790950371001.md
status: done
summary: .agelum/work/summaries/2026-10-02-reload-1790950642945.md
type: task
workflowStatus: done
---

# reload

## Issue

The wallet application is continuously reloading (full page reload) approximately every one second.

## Requirements

- The wallet must behave as a single page application (SPA). Switching between pages must NOT trigger server-side rendering of a new document or a full page reload.
- If something needs to be polled/fetched, it must be done via network requests (e.g. `fetch` / react-query) and update state in place — never by reloading the page.

## Related source code

### Hard navigations / redirects (SPA violations and loop candidates)

- `apps/wallet/src/lib/api-client.ts:38-40` — custom `fetch` wrapper calls `window.location.assign("/login")` on any 401 response. This is a full page reload triggered by background API calls.
- `apps/wallet/src/app/(dashboard)/layout.tsx:10-14` — server component calls `auth()` and `redirect("/login")` when there is no session (server-rendered gate on every dashboard page load).
- `apps/wallet/src/app/(auth)/login/page.tsx:10-12` — server component `redirect("/")` when `auth()` returns a user. Combined with the layout redirect above, this can ping-pong `/` ↔ `/login`.
- `apps/wallet/src/components/require-session.tsx:7-12` — client-side guard: `router.replace("/login")` when session status becomes `"unauthenticated"` (line 10).
- `apps/wallet/src/lib/session/web-session.ts:11-12` — `signIn`/`signOut` use next-auth redirects (full-page navigations).

### Polling that can repeatedly trigger the 401 reload

- `apps/wallet/src/hooks/use-queries.ts:60-66` — `useWalletBalances` with `refetchInterval: 3000` (line 64).
- `apps/wallet/src/hooks/use-queries.ts:82-84` — `useTransactions` with `refetchInterval: 3000` (line 83).
- `apps/wallet/src/hooks/use-queries.ts:198-205` — `useKycApplication` refetches every 3000ms while status is `"pending"` (lines 202-203).
- `apps/wallet/src/components/pages/tokenization-page.tsx:152-164` — `setInterval` every 2200ms (UI-only, hero label rotation).
- `apps/wallet/src/components/project/stories-section.tsx:95-110` — `setInterval` every 50ms (UI-only, story progress).

### Auth sources producing the 401 / session state

- `apps/wallet/src/lib/api-auth.ts:6-23` — `unauthorizedResponse()` (lines 6-8) and `requireUser()` (lines 10-23) used by all `/api/*` routes.
- `apps/wallet/src/app/api/auth/native/refresh/route.ts:8` — returns 401 when the refresh token is invalid/expired.
- `apps/wallet/src/auth.ts:29-59` — NextAuth config (JWT strategy, Drizzle adapter); the source of `auth()` used by both server redirects and API auth.

### Session providers (status flapping)

- `apps/wallet/src/lib/session/index.tsx:9-16` — provider switch between web (`SessionProvider`) and native.
- `apps/wallet/src/lib/session/web-session.ts:6-14` — wraps next-auth `useSession`; status feeds `RequireSession`.
- `apps/wallet/src/lib/session/native-session.tsx:58-105` — native session: `clear()` sets `"unauthenticated"` (line 63), `refresh()` on 401 (lines 64-75), initial storage load effect (line 78), refresh timer (line 79).

### Perceived reload (splash overlay on every fetch)

- `apps/wallet/src/components/splash-screen.tsx:12-30` — full-screen splash shown while ANY react-query query is fetching (`useIsFetching`, lines 12-20); with 3s polling this can look like the app keeps reloading.

## Possible reasons

1. **401 redirect loop (most likely):** a polled query (balances/transactions every 3s) returns 401 → `window.location.assign("/login")` full reload (`api-client.ts:38-40`) → login page server-side sees a valid cookie and `redirect("/")` (`login/page.tsx:10-12`) → dashboard layout re-evaluates `auth()` and redirects back to `/login` (`(dashboard)/layout.tsx:12-14`). Inconsistent auth state between requests (valid-looking cookie but rejected JWT/session) makes this loop continuously; the ~1s cadence matches redirect round-trips, not any timer in the code.
2. **Session status flapping:** next-auth `useSession` intermittently reports `"unauthenticated"` (e.g. unstable DB behind the Drizzle adapter, or session fetch failing), so `RequireSession` (`require-session.tsx:10`) keeps issuing `router.replace("/login")`, and the login page pushes back to `/`.
3. **Hard navigation instead of SPA re-auth:** any 401 — even from a background poll — nukes the whole page via `window.location.assign` instead of doing a fetch-based token refresh/sign-in flow in place, so a single expired session converts polling into repeated full reloads.
4. **Native session restore loop:** expired access token + failing refresh calls `clear()` (`native-session.tsx:63`) → status `"unauthenticated"` → redirect to `/login`; but on each full reload the stored session is re-read and the cycle repeats (`native-session.tsx:78`).
5. **Splash screen flashing (perceived reload):** `SplashScreen` (`splash-screen.tsx:19-30`) covers the app with a full-screen black loader on every refetch; with the 3s polling intervals the app may appear to reload continuously even without an actual document reload.