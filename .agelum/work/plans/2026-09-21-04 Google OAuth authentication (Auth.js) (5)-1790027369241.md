# Plan: Google OAuth authentication (Auth.js)

Task: `.agelum/work/tasks/pending/04 Google OAuth authentication (Auth.js) (5).md`

## Certainty assessment

**Level: Medium-High**

The codebase is small and well understood. `@repo/db` already has `users`, `accounts`, `sessions` tables with an Auth.js-shaped layout (`packages/db/src/schema.ts:19-53`). There is already a single switch point for identity (`apps/wallet/src/lib/current-user.ts:1-5`), used by every user-scoped query. Risks:

1. **Adapter/schema column-key mismatch.** `@auth/drizzle-adapter` reads/writes the `accounts` table using snake_case *property keys* (`refresh_token`, `access_token`, `expires_at`, `token_type`, `id_token`, `session_state`). The schema declares camelCase keys (`refreshToken`, `accessToken`, …) at `packages/db/src/schema.ts:31-41`. Using the adapter as-is will fail or drop tokens on account linking. Fix: either rename the TS property keys (DB column names stay identical, so no SQL migration needed) or write a small custom adapter. Needs verification against the installed adapter version.
2. Auth.js v5 is still tagged `next-auth@beta`; behavior with Next 16.1.1 (`proxy.ts` replaces `middleware.ts`) must be verified at install time.
3. `users.name` is `notNull` (`schema.ts:16`); Google normally supplies a name but the adapter may insert `null`. Needs a fallback (e.g. derive from the email).
4. The DB is libsql (`packages/db/src/client.ts`), while the drizzle adapter's SQLite path is typed for `drizzle-orm/sqlite-core` generic — libsql is supported, but the schema must be passed with table objects named `usersTable/accountsTable/sessionsTable/verificationTokensTable` (`verificationTokens` is optional for OAuth-only).

## Ambiguity assessment

**Level: Low**

The requirement is clear and the open decisions were resolved with the user:

- **Session strategy: JWT** (stateless cookie; the `sessions` table stays in the schema but is unused; friendlier to native wrappers in task 05). The Drizzle adapter is still used to persist `users` and `accounts` on Google sign-in.
- **Mobile sign-out: an "Cuenta" item in `BottomNav`** with user info and "Cerrar sesión".
- **New users start empty** (no demo fixtures copied); `demo-user` stays untouched for seed/dev.
- Auth.js v5 (`next-auth@beta`) is assumed.

Only implementation-time verifications remain (adapter column keys, Next 16 `proxy.ts` behavior), listed under Certainty.

## Current state (research findings)

| Area | Location | Notes |
|---|---|---|
| Login UI | `apps/wallet/src/components/pages/login-page.tsx:15-104` | Static email/password form, no handlers. Card/visual design must be kept; replace inputs (lines 37-70), the register link (71-81) with a "Continuar con Google" button. Server component with no `"use client"`. |
| Login route | `apps/wallet/src/app/(auth)/login/page.tsx:1-5` | Renders `LoginPage`. |
| Dashboard layout | `apps/wallet/src/app/(dashboard)/layout.tsx:1-14` | Server component wrapping `DashboardLayoutClient`; ideal place for a server-side `auth()` guard. |
| App shell | `apps/wallet/src/components/dashboard-layout-client.tsx:1-42` | Client; renders `DesktopTopNav` / `BottomNav`. |
| Desktop nav | `apps/wallet/src/components/desktop-top-nav.tsx:154-162` | "Iniciar Sesión" link to `/login`; replace with user menu + sign-out. Also `/register` link at 188. |
| Bottom nav | `apps/wallet/src/components/bottom-nav.tsx:18-190` | Mobile nav, items `/invest`, `/exchange`, `/chat`, `/assets`. |
| Providers | `apps/wallet/src/components/providers.tsx:1-30` | `QueryClientProvider` + `SplashScreen`; add `SessionProvider`. Root layout `apps/wallet/src/app/layout.tsx:19-34`. |
| Identity switch | `apps/wallet/src/lib/current-user.ts:1-5` | `getCurrentUserId()` synchronous, returns `demo-user`. Callers: `lib/api/wallet.ts:10`, `positions.ts:15`, `holdings.ts:16`, `transactions.ts:9`. |
| DB access | `apps/wallet/src/lib/db.ts:1-7` | `getDb()` singleton libsql/drizzle. |
| DB schema | `packages/db/src/schema.ts:19-53`, `226` | `users` (kycStatus default `none`, `types.ts:18`), `accounts`, `sessions`; no `verification_tokens`. `schema` aggregate at 226. |
| DB migration | `packages/db/drizzle/0000_low_shooting_star.sql` | Existing initial migration. |
| API routes | `apps/wallet/src/app/api/**/route.ts` | ~13 GET/POST route handlers, none authenticated. Client fetch layer `apps/wallet/src/lib/api-client.ts` throws on `!res.ok`. |
| Env | `apps/wallet/.env.local` (gitignored, `DATABASE_URL` only); `turbo.json:4-11` `globalEnv`; no `.env.example` anywhere. |
| Seed | `packages/db/src/seed.ts`, README `packages/db/README.md:59` | Demo user `demo-user`/`demo@realinvest.local`. |

## Implementation steps

### Phase 1 — Dependencies and DB adapter compatibility

1. Add to `apps/wallet/package.json` (dependencies, near line 13): `next-auth@beta` (Auth.js v5) and `@auth/drizzle-adapter`. Run `pnpm install` at repo root so `pnpm-lock.yaml` updates.
2. Inspect the installed `@auth/drizzle-adapter` SQLite implementation (`node_modules/@auth/drizzle-adapter/lib/sqlite.js`) to confirm expected property keys on the `accounts` table.
3. In `packages/db/src/schema.ts:31-41`, rename the `accounts` TS property keys to the snake_case keys the adapter expects (`refresh_token`, `access_token`, `expires_at`, `token_type`, `id_token`, `session_state`), keeping the SQL column names unchanged. Grep for other usages of the camelCase names (`packages/db/src/seed.ts`, `apps/wallet/src/lib/api/*`) and update. Because the SQL column names don't change, no new migration should be generated; run `pnpm --filter @repo/db db:generate` to confirm it reports "no changes".
   - Fallback if the adapter also demands other shapes: write a small custom `Adapter` in `packages/db/src/auth-adapter.ts` and export from `packages/db/src/index.ts`.
4. Optionally add a `verificationTokens` table only if the adapter requires it at type level; if so, add it to the schema + `schema` aggregate (line 226) and generate a migration (`db:generate`). Otherwise omit (OAuth-only).
5. Export a helper from `@repo/db` (or from `apps/wallet/src/lib/db.ts`) exposing the table objects the adapter needs: `{ usersTable: users, accountsTable: accounts, sessionsTable: sessions }`.

### Phase 2 — Auth.js configuration

6. Create `apps/wallet/src/auth.ts`:
   - `NextAuth({ adapter: DrizzleAdapter(getDb(), { usersTable, accountsTable, sessionsTable }), providers: [Google], session: { strategy: "jwt" }, pages: { signIn: "/login" }, trustHost: true, callbacks })`.
   - Google provider reads `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` automatically (v5 env inference); `AUTH_SECRET` is picked up automatically.
   - `callbacks.jwt`: on sign-in (`user` present) set `token.id = user.id` and `token.kycStatus` from the `users` row (`getDb().select({kycStatus}).from(users).where(eq(users.id, id))`, since the adapter's `user` may not include it); re-read `kycStatus` from the DB when `trigger === "update"` so the KYC tasks (06-08) can refresh it via `useSession().update()`.
   - `callbacks.session`: copy `token.id`, `token.kycStatus` (plus `name`, `email`, `picture`→`image`) onto `session.user`.
   - With JWT the adapter's `createSession`/`getSessionAndUser` are never called; the `sessions` table is unused but left in the schema.
   - Ensure a non-null `name` fallback (e.g. in a `createUser` wrapper around the adapter, or `events.createUser`/adapter override) since `users.name` is `notNull` (`schema.ts:16`).
   - `allowDangerousEmailAccountLinking` should stay **off** (default) — Google is the only provider.
7. Create `apps/wallet/src/types/next-auth.d.ts` augmenting `Session["user"]` with `id: string` and `kycStatus: KycStatus` (import `KycStatus` from `@repo/db`, `packages/db/src/types.ts:18`).
8. Create the route handler `apps/wallet/src/app/api/auth/[...nextauth]/route.ts`: `export const { GET, POST } = handlers;` with `export const runtime = "nodejs"` (libsql needs Node).

### Phase 3 — Route protection

9. Create `apps/wallet/src/proxy.ts` (Next 16 replacement for `middleware.ts`; confirm from `node_modules/next/dist/docs` or the Next 16 docs at implementation time). With JWT sessions the token can be verified without a DB hit: use `auth` from `apps/wallet/src/auth.ts` (or `getToken`) to check the session and redirect page requests to `/login?callbackUrl=…`, returning `401 JSON` for `/api/*` (except `/api/auth/*`). Matcher: exclude `/login`, `/api/auth`, `_next`, static assets, favicon, `public` files.
   - This is only an optimistic gate; the authoritative check is server-side (steps 10-11).
10. `apps/wallet/src/app/(dashboard)/layout.tsx`: make it `async`, call `auth()`; if there is no session, `redirect("/login")`. Pass the session to `Providers`/`SessionProvider` if needed.
11. Update `apps/wallet/src/lib/current-user.ts`: make `getCurrentUserId()` async, resolving `(await auth())?.user?.id` and throwing a typed `UnauthorizedError` when absent. Remove `DEMO_USER_ID` usage. Update the four callers (`lib/api/wallet.ts:10`, `positions.ts:15`, `holdings.ts:16`, `transactions.ts:9`) to `await` it.
12. Add a small helper `apps/wallet/src/lib/api-auth.ts` — `requireUser()` — and call it (or catch `UnauthorizedError`) in **every** `apps/wallet/src/app/api/**/route.ts` handler (routes listed in Current state) returning `NextResponse.json({ error: "Unauthorized" }, { status: 401 })`. Public catalog endpoints are also protected per the task ("all API routes"), except `/api/auth/*`.
13. `apps/wallet/src/lib/api-client.ts`: on a `401` response, redirect the browser to `/login` (single small wrapper around `fetch`, used by all functions, instead of touching each call site).
14. If an authenticated user hits `/login`, redirect to `/` (server check in `apps/wallet/src/app/(auth)/login/page.tsx:3-5`, making it `async` and calling `auth()`).

### Phase 4 — UI

15. `apps/wallet/src/components/pages/login-page.tsx`: keep the outer container, decorations, header card and footer (lines 17-36, 83-101). Replace the form body (37-81) with one full-width `Button` ("Continuar con Google", Google "G" SVG inline, since `lucide-react` has no brand icon). Wire it with a server action form: `<form action={async () => { "use server"; await signIn("google", { redirectTo: callbackUrl }) }}>` (extract into a small client/server component if the page must stay a server component). Show an error message when `?error=` is present. Remove unused `Input`, `Label` imports and the dead `/forgot-password` and `/register` links.
16. `apps/wallet/src/components/providers.tsx:8-29`: wrap children in `SessionProvider` from `next-auth/react` (use `useSession` on the client).
17. Create `apps/wallet/src/hooks/use-current-user.ts` exposing `{ user, status }` from `useSession()` — this is the "expose current user (id, name, email, image, kycStatus) to the client" requirement.
18. `apps/wallet/src/components/desktop-top-nav.tsx:154-162`: replace the "Iniciar Sesión" link with a user menu (avatar/name from `useCurrentUser`, dropdown or button with "Cerrar sesión" calling `signOut({ redirectTo: "/login" })`). Also remove/redirect the `/register` link in the dialog (line 188) to `/login`.
19. Mobile sign-out: add a "Cuenta" item to `apps/wallet/src/components/bottom-nav.tsx` (nav items around lines 48-66) that opens a sheet/dialog (reuse `@repo/ui` Dialog, as used in `desktop-top-nav.tsx`) showing avatar, name, email, KYC status and a "Cerrar sesión" button calling `signOut({ redirectTo: "/login" })`.

### Phase 5 — Env vars and docs

20. `turbo.json:3-11`: add `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST` to `globalEnv`.
21. Create `.env.example` at the repo root (and/or `apps/wallet/.env.example`) with `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `AUTH_SECRET` (generate with `npx auth secret` / `openssl rand -base64 32`), `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`. Confirm `.gitignore` doesn't ignore `.env.example` (only `.env`, `.env.local`, … are listed).
22. Document setup in `apps/wallet/README.md`: create a Google Cloud OAuth client (Web), authorized redirect URI `http://localhost:8000/api/auth/callback/google` (dev port from `apps/wallet/package.json:6`) and the production equivalent, and the env vars.
23. Update `packages/db/README.md:59` — the demo user is no longer the identity used by the app; real users are created on first Google sign-in.

## Files touched / created (summary)

- New: `apps/wallet/src/auth.ts`, `apps/wallet/src/proxy.ts`, `apps/wallet/src/app/api/auth/[...nextauth]/route.ts`, `apps/wallet/src/types/next-auth.d.ts`, `apps/wallet/src/hooks/use-current-user.ts`, `apps/wallet/src/lib/api-auth.ts`, `.env.example`
- Modified: `apps/wallet/package.json`, `packages/db/src/schema.ts` (+ `seed.ts` if it uses account keys), `apps/wallet/src/lib/current-user.ts`, `apps/wallet/src/lib/api/{wallet,positions,holdings,transactions}.ts`, all `apps/wallet/src/app/api/**/route.ts`, `apps/wallet/src/lib/api-client.ts`, `(dashboard)/layout.tsx`, `(auth)/login/page.tsx`, `login-page.tsx`, `providers.tsx`, `desktop-top-nav.tsx`, `bottom-nav.tsx`, `turbo.json`, READMEs.
- Note: the working tree already has uncommitted changes from task 03 in `apps/wallet/src/lib/api/*`; build on top of them, don't revert.
