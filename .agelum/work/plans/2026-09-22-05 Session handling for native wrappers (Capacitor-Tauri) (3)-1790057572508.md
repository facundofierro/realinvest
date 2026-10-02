# Plan: Session handling for native wrappers (Capacitor/Tauri)

Task: `.agelum/work/tasks/pending/05 Session handling for native wrappers (Capacitor-Tauri) (3).md`

## Certainty assessment

**Level: Medium-High**

The problem is fully located, not a guess. Research confirms:

- Web auth is Auth.js v5 (`next-auth@beta`) with a JWT session strategy, Google-only provider, Drizzle adapter, and a `signIn()` **server action** embedded directly in the shared `LoginPage` component (`apps/wallet/src/components/pages/login-page.tsx:20-23`). Route protection is a server-side `auth()` check in `apps/wallet/src/app/(dashboard)/layout.tsx:1-19` and in `apps/wallet/src/app/(auth)/login/page.tsx:1-18`.
- `native/wallet/nextjs` (the app actually bundled into Capacitor and Tauri — see `native/wallet/capacitor/capacitor.config.ts:6` `webDir: '../nextjs/out'` and `native/wallet/tauri/src-tauri/tauri.conf.json:6` `frontendDist: "../../nextjs/out"`) is a **static export** (`output: "export"` in `native/wallet/nextjs/next.config.ts:4`). Static export has no Next.js server, no API routes, no server actions, no cookies-with-server-verification. This is why NextAuth's cookie/server-action model cannot work there as-is.
- Confirmed via `native/wallet/nextjs/package.json`: it does not depend on `next-auth`, `@capacitor/*`, or any `@tauri-apps/plugin-*` package. Its `tsconfig.json:6` resolves `@/*` to `../../../apps/wallet/src/*` as a fallback, which is how the shared `LoginPage`'s `import { signIn } from "@/auth"` currently resolves at all when bundled into the native app — but a server action has no server to run in that bundle, so this either fails to build or fails at runtime today.
- Confirmed no groundwork exists yet for deep linking or secure storage: `native/wallet/capacitor/ios/App/App/Info.plist` has no `CFBundleURLTypes`; `native/wallet/capacitor/android/app/src/main/AndroidManifest.xml:11-21` has no custom-scheme `intent-filter`; `native/wallet/tauri/src-tauri/capabilities/default.json` only grants `core:default`; `native/wallet/tauri/src-tauri/Cargo.toml` has no deep-link/shell/stronghold plugins. This is a greenfield build, not a bug fix.
- `apps/wallet/src/lib/api-client.ts:20-58` already has a `NEXT_PUBLIC_API_URL`-aware `getApiUrl()` helper and a 401→`/login` redirect, built specifically for the native case — this is the intended integration point for attaching a bearer token.
- Note a pre-existing type mismatch worth fixing while touching this code: `LoginPage`'s props (`apps/wallet/src/components/pages/login-page.tsx:14-17`) require `callbackUrl: string` (non-optional), but `native/wallet/nextjs/src/app/(auth)/login/page.tsx:1-6` renders `<LoginPage />` with no props at all.
- The `sessions` table (`packages/db/src/schema.ts:49-57`) exists only to satisfy the Drizzle adapter's type shape and is unused at runtime (JWT strategy). It is not a session store we should try to reuse for native bearer sessions — a purpose-built table is clearer (see Phase 1).

Residual uncertainty (implementation-time, not architectural): the exact npm/crate package names for Capacitor secure storage and the Tauri encrypted-store plugin should be verified for current maintenance/compatibility with Capacitor 6 / Tauri 2.9 at install time — this is deliberate (see Ambiguity below), not a gap in the plan.

## Ambiguity assessment

**Level: Low**

The overall architecture is not ambiguous: the task text itself names the two halves of the only workable pattern for a static-export webview app ("system browser + deep link" and "token-based session" — these are the same pattern, not alternatives), which is also the industry-standard OAuth-for-native-apps flow (RFC 8252). Given the codebase's current state (no server in the native bundle, cookies from a `capacitor://`/`tauri://` origin are unreliable cross-origin to the real API host), an embedded-webview OAuth flow was explicitly avoided in favor of system-browser + deep link + HTTPS token exchange + secure on-device storage.

The three open decisions identified in the first pass of this plan were put to the human and resolved:

1. **Token lifetime/refresh** — resolved as short-lived access token + rotating refresh token (not a single long-lived JWT). Reflected in the Architecture decision and Phase 1/3/4 below.
2. **Secure storage plugin choice** — resolved as "research exact packages at implementation time" (the plan states the requirement — Keychain/Keystore-backed on Capacitor, Stronghold on Tauri — without pinning package names now).
3. **Adjacent tRPC gaps** (`userId: 'default-user'` hardcode, relative `/api/trpc` URL) — resolved as in-scope; both are fixed in Phase 1/3.

No further open decisions block implementation.

## Current state (research findings)

| Area | Location | Notes |
|---|---|---|
| Web NextAuth config | `apps/wallet/src/auth.ts:1-59` | JWT strategy (line 32), Google provider only (line 31), Drizzle adapter (lines 9-27), `jwt`/`session` callbacks embed `kycStatus` in the token (lines 36-57). Must stay unchanged for web. |
| Web login route | `apps/wallet/src/app/(auth)/login/page.tsx:1-18` | Server component; redirects if already authed (line 10-12); passes `callbackUrl`/`error` to `LoginPage`. |
| Shared login UI | `apps/wallet/src/components/pages/login-page.tsx:1-86` | Server component; `continueWithGoogle` server action (lines 20-23) calls `signIn("google", …)` directly from `@/auth`. This is the piece that must become platform-aware. |
| Web dashboard guard | `apps/wallet/src/app/(dashboard)/layout.tsx:1-19` | Server-side `auth()` + `redirect("/login")`. Unchanged for web; native needs an equivalent client-side guard. |
| Providers/session wiring | `apps/wallet/src/components/providers.tsx:1-66` | `SessionProvider` from `next-auth/react` (line 54) — polls a relative `/api/auth/session`, which doesn't exist in native. `trpcClient` uses a **hardcoded relative** `url: "/api/trpc"` (line 44) — also broken for native (doesn't even use the existing `NEXT_PUBLIC_API_URL` pattern). Both need to become platform-aware. |
| API client helper | `apps/wallet/src/lib/api-client.ts:1-58` | `API_BASE` from `NEXT_PUBLIC_API_URL` (line 20), `getApiUrl()` (lines 26-44) already resolves absolute URLs for native. `fetch` wrapper (lines 17-24) redirects to `/login` on 401 but sends no `Authorization` header and no `credentials` option. |
| API auth guard | `apps/wallet/src/lib/api-auth.ts:1-16` | `requireUser()` only checks the cookie session via `auth()`. Needs a bearer-token branch. |
| DB schema | `packages/db/src/schema.ts:22-57` | `users` (line 22, `kycStatus` line 28), `accounts` (line 31), `sessions` (line 49, unused at runtime). New table goes near line 57. Schema aggregate at line 226 (`packages/db/src/schema.ts:226`). |
| DB package exports | `packages/db/src/index.ts:1-3`, `packages/db/src/types.ts:1-30` | Re-exports schema/types; new table's inferred types go here. |
| Package export surface | `apps/wallet/src/index.ts:1-22` | `Providers`, `LoginPage`, `BottomNav` are exported for native reuse; new session hooks/components must be exported here too. |
| Native app root layout | `native/wallet/nextjs/src/app/layout.tsx:1-31` | Wraps children in `Providers` from `"wallet"` — no auth-specific code today. |
| Native dashboard layout | `native/wallet/nextjs/src/app/(dashboard)/layout.tsx:1-15` | No auth guard at all currently — anyone can hit dashboard routes offline-first with no session. |
| Native login route | `native/wallet/nextjs/src/app/(auth)/login/page.tsx:1-6` | Renders `<LoginPage />` with **no props** — type mismatch against `LoginPage`'s required `callbackUrl` prop (see Certainty). |
| Native app config | `native/wallet/nextjs/next.config.ts:1-17`, `native/wallet/nextjs/package.json` | `output: "export"` (line 4), `transpilePackages: ["@repo/ui", "wallet"]` (line 6). No `next-auth`, no Capacitor/Tauri JS deps yet. |
| Native tsconfig | `native/wallet/nextjs/tsconfig.json:1-16` | `@/*` maps to `./src/*` then falls back to `../../../apps/wallet/src/*` (line 6) — this is how shared server-only code like `@/auth` currently leaks into the native bundle. |
| Capacitor config | `native/wallet/capacitor/capacitor.config.ts:1-29` | Existing custom scheme `RealInvestWallet` for iOS (line 8) — reusable as the OAuth deep-link scheme. `appId: 'com.realinvest.wallet'` (line 5). |
| Capacitor deps | `native/wallet/capacitor/package.json` | Only `@capacitor/core`, `@capacitor/android`, `@capacitor/ios`. No `@capacitor/browser`, `@capacitor/app`, or secure-storage plugin. |
| iOS URL scheme | `native/wallet/capacitor/ios/App/App/Info.plist` | No `CFBundleURLTypes` block — needs to be added for the custom scheme to be catchable. |
| iOS URL open handling | `native/wallet/capacitor/ios/App/App/AppDelegate.swift:36-40` | Already proxies `application(_:open:options:)` to `ApplicationDelegateProxy.shared`, i.e. Capacitor's `App` plugin will receive `appUrlOpen` events once added — **no native Swift change needed**, only the plugin + Info.plist entry. |
| Android manifest | `native/wallet/capacitor/android/app/src/main/AndroidManifest.xml:11-21` | `MainActivity` has only the launcher `intent-filter`. Needs a second `intent-filter` with `android:scheme="realinvestwallet"` (Android custom schemes are lowercased) and `BROWSABLE`/`DEFAULT` categories. |
| Tauri config | `native/wallet/tauri/src-tauri/tauri.conf.json:1-33` | No `plugins` block yet for deep-link/shell/stronghold. |
| Tauri capabilities | `native/wallet/tauri/src-tauri/capabilities/default.json:1-11` | Only `core:default`. New plugin permissions must be added here. |
| Tauri Rust deps | `native/wallet/tauri/src-tauri/Cargo.toml:1-19`, `native/wallet/tauri/src-tauri/src/lib.rs:1-13` | Minimal — only `tauri-plugin-log`. Plugin registration happens in `.setup()` in `lib.rs`. |
| Tauri JS deps | `native/wallet/tauri/package.json` | Only `@tauri-apps/cli`. Needs `@tauri-apps/plugin-*` JS bindings matching whatever Rust plugins are added. |
| Env vars | `turbo.json:3-15` (`globalEnv`), `.env.example` (root) | `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST` already global. `NEXT_PUBLIC_API_URL` is **not** in `globalEnv` and not documented anywhere, despite already being load-bearing for native (`api-client.ts:20`). |
| Google OAuth task (dependency, done) | `.agelum/work/tasks/done/04 Google OAuth authentication (Auth.js) (5).md` | Confirms JWT strategy and DB adapter are the finished baseline this task builds on. |

## Architecture decision (for both Capacitor and Tauri)

**System-browser + deep-link + HTTPS token exchange, RFC 8252-style:**

1. Native app taps "Continue with Google" → opens the **system browser** (not an embedded webview) at a new server route `${API_BASE}/api/auth/native/start?redirect_uri=<scheme>://auth-callback&state=<random>`.
2. That route runs on the existing web server (`apps/wallet`, `output: "standalone"`, unchanged), validates `redirect_uri` against a small allow-list, stashes `{redirect_uri, state}` in a short-lived signed cookie, and calls the existing `signIn("google", { redirectTo: "/api/auth/native/complete" })` — i.e. it rides the exact same Google OAuth flow the web already uses. No changes to `apps/wallet/src/auth.ts` or the Google Cloud OAuth client are required, because the redirect URI Google sees is still the real HTTPS domain.
3. On success, a new server route `/api/auth/native/complete` reads the now-authenticated cookie session, mints a single-use, short-TTL exchange code tied to the user id, and 302-redirects the system browser to `<scheme>://auth-callback?code=...&state=...`.
4. The OS hands that URL to the installed app (Capacitor `App` plugin `appUrlOpen`; Tauri deep-link plugin `onOpenUrl`).
5. The native app immediately calls `POST ${API_BASE}/api/auth/native/token` with `{code, state}` over a normal HTTPS fetch (not through the browser, so the code is never logged in browser history) and receives **two tokens** + a plain user profile snapshot: a short-lived **access token** (signed JWT, `AUTH_SECRET`-signed, embeds `sub`, `kycStatus`, `exp` ~15 minutes) and a longer-lived, single-use **refresh token** (opaque random string, server-tracked, ~30 days).
6. The app stores both tokens in OS-backed secure storage (Keychain/Keystore-fronted plugin on Capacitor, `tauri-plugin-stronghold` on Tauri) and holds the access token in memory in the new native session context.
7. All subsequent API/tRPC calls from native attach `Authorization: Bearer <accessToken>`; `requireUser()` on the server accepts either that header or the existing cookie session.
8. Before the access token expires (or reactively on a `401`), the native session context calls `POST /api/auth/native/refresh` with the current refresh token. The server validates it against the DB-tracked session, **rotates** it (issues a new refresh token, marks the old one consumed, chains them for reuse/theft detection), and returns a new access token + new refresh token. If a refresh token is presented that's already been consumed, the server treats it as a compromise signal and revokes the entire session chain, forcing a full re-sign-in.
9. Sign-out on native calls `POST /api/auth/native/revoke` with the current refresh token (server marks it revoked) and then clears secure storage + in-memory state — unlike a stateless-JWT-only design, sign-out now has a real server-side effect, which is what makes the shorter access-token lifetime meaningful (a stolen access token dies within ~15 minutes even without sign-out; a stolen refresh token can be revoked immediately if noticed).

This keeps web 100% unchanged (still cookie + server action) and adds a parallel, platform-detected path for native, unified behind one `useAppSession()`-shaped hook so shared screens (`LoginPage`, dashboard layout) don't fork on platform beyond calling that hook.

Platform detection is **runtime**, not build-time, because Capacitor and Tauri both consume the exact same `native/wallet/nextjs/out` static bundle (`capacitor.config.ts:6`, `tauri.conf.json:6`): check `Capacitor.isNativePlatform()` first, then `typeof window !== "undefined" && "__TAURI_INTERNALS__" in window`, else treat as web.

## Implementation steps

### Phase 1 — Backend: native token-exchange endpoints + DB table

1. `packages/db/src/schema.ts` — after the `sessions` table (line 57), add two new tables:
   ```ts
   export const nativeAuthCodes = sqliteTable(
     "native_auth_codes",
     {
       code: text("code").primaryKey(),
       userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
       redirectUri: text("redirect_uri").notNull(),
       expires: integer("expires", { mode: "timestamp" }).notNull(),
       consumedAt: integer("consumed_at", { mode: "timestamp" }),
     },
     (table) => [index("native_auth_codes_user_id_idx").on(table.userId)],
   );

   export const nativeRefreshTokens = sqliteTable(
     "native_refresh_tokens",
     {
       id: text("id").primaryKey(), // opaque random token, the value the client holds
       userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
       rotatedFromId: text("rotated_from_id"), // previous token in the chain, for reuse detection
       expires: integer("expires", { mode: "timestamp" }).notNull(),
       consumedAt: integer("consumed_at", { mode: "timestamp" }), // set when rotated or revoked
       createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
     },
     (table) => [index("native_refresh_tokens_user_id_idx").on(table.userId)],
   );
   ```
   Add both tables to the `schema` aggregate at `packages/db/src/schema.ts:226`. Add inferred types (`NativeAuthCode`/`NewNativeAuthCode`, `NativeRefreshToken`/`NewNativeRefreshToken`) in `packages/db/src/types.ts` next to the existing `Account`/`NewAccount` types. Run the package's `db:generate` task (per `turbo.json` `db:generate` task def) to produce the migration; do not hand-edit SQL.
2. New file `apps/wallet/src/lib/native-auth.ts`:
   - `ALLOWED_NATIVE_REDIRECT_URIS`: a hardcoded allow-list, e.g. `["realinvestwallet://auth-callback"]` (reuses the existing iOS scheme from `native/wallet/capacitor/capacitor.config.ts:8`, lowercased for Android compatibility — confirm/align the actual scheme chosen in Phase 2 across iOS/Android/Tauri so this list, the manifests, and the deep-link plugin configs all agree).
   - `signAccessToken(user: { id: string; kycStatus: KycStatus })`: signs a JWT with `AUTH_SECRET` (reuse `@auth/core/jwt`'s `encode`, matching the algorithm/secret NextAuth already uses, or `jose` directly if simpler — either way the important constraint is it must be independently verifiable without depending on NextAuth's cookie-parsing code path) with a **~15-minute** expiry.
   - `verifyAccessToken(token: string)`: inverse, returns `{ id, kycStatus }` or `null`.
   - `issueRefreshToken(userId: string, rotatedFromId?: string)`: inserts a `nativeRefreshTokens` row (random id via `crypto.randomUUID()`, ~30-day expiry, `rotatedFromId` set when this call is a rotation) and returns the new opaque token id.
   - `rotateRefreshToken(presentedId: string)`: looks up the row; if missing → reject; if `consumedAt` is already set → **reuse detected**, revoke every row in that chain (walk `rotatedFromId` links, or simpler: revoke all of the user's active refresh tokens) and reject; otherwise mark `consumedAt`, call `issueRefreshToken(userId, presentedId)`, and return the new token id + the user.
   - `revokeRefreshToken(presentedId: string)`: marks the row `consumedAt` (used by sign-out).
3. New route `apps/wallet/src/app/api/auth/native/start/route.ts`: `GET`, validates `redirect_uri` query param against `ALLOWED_NATIVE_REDIRECT_URIS`, then calls `signIn("google", { redirectTo: "/api/auth/native/complete?redirect_uri=...&state=..." })` from `@/auth` (same import as `apps/wallet/src/lib/api-auth.ts:1`), passing `redirect_uri`/`state` through as query params on the post-auth target rather than a separate cookie.
4. New route `apps/wallet/src/app/api/auth/native/complete/route.ts`: `GET`, re-validates `redirect_uri` against the allow-list (defense in depth), calls `auth()` to get the just-established cookie session, generates a random opaque code (`crypto.randomUUID()`), inserts a `nativeAuthCodes` row with a 2-minute expiry, and issues a 302 redirect to `${redirect_uri}?code=${code}&state=${state}`.
5. New route `apps/wallet/src/app/api/auth/native/token/route.ts`: `POST`, body `{ code, state }` (the DB row's `redirectUri` + single-use + short TTL is the CSRF/replay defense; no separate `state` store needed), looks up the `nativeAuthCodes` row, rejects if missing/expired/already consumed, marks `consumedAt`, loads the user (kycStatus included), calls `signAccessToken(user)` and `issueRefreshToken(user.id)`, returns `{ accessToken, refreshToken, user: { id, name, email, image, kycStatus } }`.
6. New route `apps/wallet/src/app/api/auth/native/refresh/route.ts`: `POST`, body `{ refreshToken }`, calls `rotateRefreshToken(refreshToken)`; on success loads the current user (kycStatus may have changed since original sign-in — this refresh is also how native picks up KYC status changes without a full re-auth), returns a fresh `{ accessToken, refreshToken, user }`; on reuse-detected/invalid, returns 401 so the client forces a full re-sign-in.
7. New route `apps/wallet/src/app/api/auth/native/revoke/route.ts`: `POST`, body `{ refreshToken }`, calls `revokeRefreshToken(refreshToken)`, returns 204. Used by native sign-out.
8. `apps/wallet/src/lib/api-auth.ts:8-16` — extend `requireUser()`:
   ```ts
   export async function requireUser() {
     const authHeader = /* read from a passed-in Request or use next/headers */;
     if (authHeader?.startsWith("Bearer ")) {
       const claims = verifyAccessToken(authHeader.slice(7));
       if (claims) return claims;
     }
     const session = await auth();
     return session?.user?.id ? session.user : null;
   }
   ```
   Since `requireUser()` currently takes no arguments and is called from route handlers (e.g. `apps/wallet/src/app/api/wallet/holdings/route.ts`), switch it to accept the incoming `Request` (or read via `next/headers`'s `headers()` in the route-handler context, which is valid in Next.js route handlers) so it can inspect `Authorization`. Update every call site under `apps/wallet/src/app/api/**/route.ts` (13 route files per the current-state table) accordingly if the signature changes.
9. `apps/wallet/src/app/api/trpc/[trpc]/route.ts:1-16` — the tRPC context currently hardcodes `userId: 'default-user'` (line 10, already a `TODO`); wire it through the same bearer/cookie resolution as `requireUser()` so native tRPC calls (once Phase 3 fixes the client URL) are authenticated too. This is adjacent pre-existing tech debt surfaced by this task's own "Related Source Code" list including `providers.tsx`, confirmed in-scope with the human; keep the change minimal (auth resolution only, not a general tRPC context redesign).
10. `turbo.json:3-15` — add `NEXT_PUBLIC_API_URL` to `globalEnv` (it's already functionally required by `apps/wallet/src/lib/api-client.ts:20` for native builds but undocumented/uncached by Turbo). Add it to root `.env.example` with a comment that it's only needed for native builds pointing at a deployed API host.

### Phase 2 — Native shell plumbing (deep link registration)

11. Decide and fix the final custom URL scheme across all three shells — reuse `realinvestwallet` (lowercase, since Android is case-sensitive/lowercase-only for scheme matching) derived from the existing iOS `scheme: "RealInvestWallet"` in `native/wallet/capacitor/capacitor.config.ts:8`. Update `native/wallet/capacitor/capacitor.config.ts` only if the casing needs normalizing.
12. `native/wallet/capacitor/package.json` — add `@capacitor/app` (for `appUrlOpen` deep-link events) and `@capacitor/browser` (to open the system browser via `Browser.open({ url })` instead of an in-app webview) as dependencies.
13. `native/wallet/capacitor/ios/App/App/Info.plist` — add a `CFBundleURLTypes` array registering the `realinvestwallet` scheme (insert near the other top-level keys, e.g. after `CFBundleIdentifier`):
    ```xml
    <key>CFBundleURLTypes</key>
    <array>
      <dict>
        <key>CFBundleURLSchemes</key>
        <array><string>realinvestwallet</string></array>
      </dict>
    </array>
    ```
    No change needed to `AppDelegate.swift` — it already proxies URL opens to Capacitor at lines 36-40.
14. `native/wallet/capacitor/android/app/src/main/AndroidManifest.xml:11-21` — add a second `<intent-filter>` on `MainActivity` (after the existing launcher one, before the closing `</activity>` at line 21):
    ```xml
    <intent-filter>
      <action android:name="android.intent.action.VIEW" />
      <category android:name="android.intent.category.DEFAULT" />
      <category android:name="android.intent.category.BROWSABLE" />
      <data android:scheme="realinvestwallet" android:host="auth-callback" />
    </intent-filter>
    ```
15. `native/wallet/tauri/src-tauri/Cargo.toml:14-19` — add `tauri-plugin-deep-link` (custom-scheme registration + `onOpenUrl` events), `tauri-plugin-opener` or `tauri-plugin-shell` (to open the system browser), and `tauri-plugin-stronghold` (encrypted secure storage) to `[dependencies]`. `native/wallet/tauri/package.json` — add the matching `@tauri-apps/plugin-deep-link`, `@tauri-apps/plugin-opener` (or `-shell`), and `@tauri-apps/plugin-stronghold` JS packages.
16. `native/wallet/tauri/src-tauri/src/lib.rs:1-13` — register the new plugins in the `tauri::Builder::default()` chain (`.plugin(tauri_plugin_deep_link::init())`, `.plugin(tauri_plugin_opener::init())`, `.plugin(tauri_plugin_stronghold::Builder::new(...).build())`), alongside the existing conditional `tauri_plugin_log` registration.
17. `native/wallet/tauri/src-tauri/tauri.conf.json:1-33` — add a `plugins.deep-link` config block registering `realinvestwallet` as the desktop-registered scheme (Tauri v2's deep-link plugin supports this without needing OS-level manifest edits, unlike mobile).
18. `native/wallet/tauri/src-tauri/capabilities/default.json:1-11` — extend `permissions` to include the new plugins' permission identifiers (e.g. `deep-link:default`, `opener:default`, `stronghold:default`), matching whatever the installed plugin versions document as their default permission set.

### Phase 3 — Shared session abstraction (web + native, unified hook surface)

19. New directory `apps/wallet/src/lib/session/` (exported from `apps/wallet/src/index.ts` alongside the existing `Providers`/`LoginPage` exports at lines 15/17):
    - `platform.ts`: `getPlatform(): "web" | "capacitor" | "tauri"` using the runtime checks described in the Architecture Decision section (`Capacitor.isNativePlatform()`, then `"__TAURI_INTERNALS__" in window`, else `"web"`). Guard all Capacitor/Tauri imports behind dynamic `import()` inside the platform branches so the web bundle (`apps/wallet`, real Next server) doesn't ship native-only JS unnecessarily.
    - `types.ts`: a shared `AppSession` shape — `{ user: { id, name, email, image, kycStatus } | null, status: "loading" | "authenticated" | "unauthenticated" }` — matching what `next-auth/react`'s `useSession()` already returns so existing consumers don't need to change their read side.
    - `web-session.ts`: thin wrapper around `next-auth/react`'s `useSession`/`signIn`/`signOut`, adapted to the shared `AppSession` shape (should be nearly pass-through, since NextAuth already returns this shape).
    - `native-session.ts`: a React context (`NativeSessionProvider`, `useNativeSession`) that on mount reads the stored `{ accessToken, refreshToken }` pair from secure storage (Capacitor: the Keychain/Keystore-backed plugin chosen at implementation time — package TBD, see Certainty/Ambiguity; Tauri: Stronghold), verifies the access token isn't expired client-side (cheap check; if expired, immediately calls the refresh flow below before setting state), sets `AppSession` state, and exposes:
      - `signIn()`: opens the system browser at `${API_BASE}/api/auth/native/start?redirect_uri=realinvestwallet://auth-callback&state=<random>` (Capacitor `Browser.open`, Tauri opener plugin), registers a one-time deep-link listener (`App.addListener('appUrlOpen', ...)` / Tauri's `onOpenUrl`) that parses `code`/`state`, POSTs to `/api/auth/native/token`, stores the returned `{accessToken, refreshToken}` pair, updates state.
      - `refresh()`: POSTs the stored refresh token to `/api/auth/native/refresh`, stores the rotated `{accessToken, refreshToken}` pair on success, or clears storage and sets `status: "unauthenticated"` on a 401 (reuse-detected/expired — forces `signIn()` again). Scheduled proactively a short margin before the access token's `exp` (e.g. via `setTimeout`, reset on each successful refresh), and also called reactively as a one-time retry when any API/tRPC call returns 401 (wire this through the same accessor `providers.tsx`/`api-client.ts` use in steps 20-21, to avoid a second parallel expiry-tracking mechanism).
      - `signOut()`: POSTs the stored refresh token to `/api/auth/native/revoke`, then clears secure storage + in-memory state regardless of whether the revoke call succeeds (best-effort — local sign-out must not be blocked by a network failure).
    - `use-app-session.ts`: `useAppSession()` — calls `getPlatform()` once (memoized) and delegates to `web-session.ts` or `native-session.ts` accordingly. This is the single hook shared components should call.
20. `apps/wallet/src/components/providers.tsx`:
    - Replace the unconditional `<SessionProvider>` (line 54) with a new `<AppSessionProvider>` (from `lib/session`) that internally renders `next-auth/react`'s `SessionProvider` on web or `NativeSessionProvider` on native, based on `getPlatform()`.
    - Fix the `trpcClient` (lines 40-48): replace the hardcoded `url: "/api/trpc"` (line 44) with `getApiUrl("/api/trpc")` from `apps/wallet/src/lib/api-client.ts`, and add a `headers()` function to `httpBatchLink` that reads the current access token (via a small non-hook accessor exported from `native-session.ts`, since `httpBatchLink`'s `headers` runs outside React) and sets `Authorization: Bearer <accessToken>` when present.
21. `apps/wallet/src/lib/api-client.ts`:
    - Extend the `fetch` wrapper (lines 17-24) to attach `Authorization: Bearer <accessToken>` when a native token is available (same accessor as step 20), and on a `401` response, trigger the native session's `refresh()` once and retry the request before falling through to the existing `/login` redirect. Set `credentials: "omit"` explicitly for the bearer path (cookies aren't relevant cross-origin from a native shell) versus leaving the existing default browser cookie behavior unchanged for web, to satisfy "web behavior must remain unchanged".
22. `apps/wallet/src/components/pages/login-page.tsx`:
    - Make `callbackUrl`/`error` props optional (fixing the pre-existing native type mismatch noted in Certainty).
    - Replace the direct `import { signIn } from "@/auth"` + server action (lines 1-23) with a client-side button that calls `useAppSession().signIn()` from the new abstraction. This requires converting the interactive part of `LoginPage` to a client component (`"use client"`), or splitting it into a server shell (keeping the visual/card markup) plus a small client `SignInButton` island that calls the hook — prefer the split to avoid forcing the whole page client-side on web (where the server action + server component is currently working fine and should stay lean).
    - On web, `useAppSession().signIn()` from `web-session.ts` should still ultimately invoke the same `signIn("google", { redirectTo: callbackUrl })` server action path so web behavior is byte-for-byte unchanged; on native it triggers the system-browser flow from step 19.
23. `apps/wallet/src/app/(auth)/login/page.tsx` — no change required (web-only file, already correct); confirm `native/wallet/nextjs/src/app/(auth)/login/page.tsx:1-6` now compiles cleanly against the now-optional `LoginPage` props.
24. New shared component `apps/wallet/src/components/require-session.tsx` (exported from `apps/wallet/src/index.ts`): a client component that calls `useAppSession()`, renders a loading state while `status === "loading"`, renders `children` when `status === "authenticated"`, and otherwise redirects to `/login` via `next/navigation`'s `useRouter().replace(...)` (client-side, works in a static export). This is the native equivalent of the server-side guard in `apps/wallet/src/app/(dashboard)/layout.tsx:1-19`, but is written once and usable by both — on web it will simply be a fast no-op pass-through immediately after the server guard already redirected, so it's safe to add there too for consistency, though not required since the server guard already covers web.
25. `native/wallet/nextjs/src/app/(dashboard)/layout.tsx:1-15` — wrap `{children}` (and `<BottomNav />`, or just the content area) in `<RequireSession>` imported from `"wallet"`.
26. `native/wallet/nextjs/package.json` — `next-auth` is **not** needed here (native never imports `@/auth` directly once step 22's split is done); instead add `@capacitor/core`, `@capacitor/app`, `@capacitor/browser` (needed because `native/wallet/nextjs/out` is the bundle both shells load, per the Architecture Decision's runtime-detection rationale) and the equivalent `@tauri-apps/plugin-*` JS packages from Phase 2 step 15.

### Phase 4 — Sign-out UI, secure storage finalization, and required documentation

27. Locate the existing web sign-out entry point (per the done Google OAuth task's plan, an "Cuenta"/account item in `BottomNav` — verify current location with `grep -n "signOut" apps/wallet/src/components/bottom-nav.tsx apps/wallet/src/components/desktop-top-nav.tsx` before editing) and route it through `useAppSession().signOut()` instead of calling `next-auth/react`'s `signOut` directly, so the same control works on native.
28. Research and pin the secure-storage packages (deferred per the Ambiguity resolution): a maintained, Capacitor-6-compatible Keychain/Keystore-backed plugin for iOS/Android, and confirm `tauri-plugin-stronghold` (or an equivalent OS-keyring plugin) is compatible with the installed Tauri 2.9.x. Add the chosen package(s) to `native/wallet/capacitor/package.json` / `native/wallet/tauri/src-tauri/Cargo.toml` + `native/wallet/tauri/package.json`, then finalize the storage calls in `native-session.ts` (step 19) using the real API. Both paths must handle "storage unavailable/locked" by falling back to `status: "unauthenticated"` rather than throwing.
29. Write the required flow documentation (Acceptance Criteria: "Documented session/OAuth flow for Capacitor and Tauri", "Known limitations are listed in the doc"). New file `docs/plan/wallet-native-auth.md` covering: the sequence diagram/steps from the Architecture Decision section above (specialized per Capacitor vs. Tauri where the deep-link/storage mechanics differ), the access/refresh token lifetimes and rotation-reuse-detection behavior, the new env vars, the allow-listed redirect URIs, and an explicit **Known limitations** section: refresh-token theft detection is chain-revocation only (no per-device session list/UI for the user to review or revoke individual devices), no biometric re-lock of the stored token in this pass, native sign-in requires leaving the app to the system browser (by design, not a bug), and store-release packaging/signing is out of scope per the task description.
30. Cross-link this new doc from `docs/plan/wallet-multiplatform.md`'s "Challenges & Solutions" or "Future Considerations" section (around `docs/plan/wallet-multiplatform.md:236-296`), since that document currently has no mention of auth at all.
