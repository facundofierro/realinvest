---
created: 2026-10-02T21:00:00.000Z
type: task
workflowStatus: pending
---

# Follow-ups from the e2e use-case suite

The Playwright suite (`apps/e2e`, see `.agelum/work/summaries/2026-10-02-playwrite-test-2-1790972692060.md`) surfaced these gaps. The tests currently assert the existing behavior, so update the relevant spec when each item lands.

## 1. Exchange favorites are not implemented

- `apps/wallet/src/lib/api/market.ts:13` hardcodes `isFavorite: false`. There is no DB column and no toggle in the UI, so the Favoritos tab is always empty. The seed fixture (`sample-data/marketTokens.json`) has `isFavorite` values, but `seed.ts` ignores them.
- To do: add per-user favorites (a table keyed by `user_id` + `token_id`), an API to toggle them, and a star button on token rows (desktop and mobile layouts in `exchange-page.tsx`). Seed demo-user's favorites from the fixture.
- Tests: in `apps/e2e/exchange.spec.ts`, replace the "Favoritos is empty" assertion with star → listed → un-star.

## 2. The admin does not serve the seeded project images

- Project `image` values are relative paths (`/projects/*.png`) that only exist in `apps/wallet/public`. The admin properties table and dashboard show broken images (404).
- To do: either serve the images from a shared location (a shared package or CDN), or have the admin resolve relative image paths against the wallet origin (e.g. `NEXT_PUBLIC_WALLET_URL`, with `images.remotePatterns` for `next/image`).
- Tests: remove the `IGNORED_RESOURCES` entry in `apps/e2e/helpers/smoke.ts`.

## 3. The wallet chat has no assistant reply

- In `apps/wallet/src/components/pages/chat-page.tsx`, `handleSend` only appends the user's message (comment: "call an AI API here").
- To do: decide on the backend (mock or real assistant) and implement the reply flow, with loading and error states.
- Tests: `apps/e2e/misc.spec.ts` should assert that the assistant reply appears, with the provider mocked.

## 4. Admin chat send is a stub

- In `apps/admin/src/components/pages/chat-page.tsx`, `handleSendMessage` only `console.log`s and clears the input. Conversations are module-level mock data, which also caused the hydration mismatch that was patched with `suppressHydrationWarning`.
- To do: back conversations with real data (or at least local state that appends sent messages), and remove the `Date.now()` mock timestamps.
- Tests: `apps/e2e/admin-crud.spec.ts` should assert that the sent message appears in the thread.

## 5. Session refresh race after the KYC submit (low priority)

- In the browser, a GET `/api/auth/session` that is in flight while `useSession().update({})` POSTs can re-issue the old JWT cookie after the new one, so the `kycStatus` change is lost. This was seen from the test side (see the `apps/e2e/README.md` note). It can also happen in real use if the SessionProvider refetches at the same moment.
- To do: verify whether it reproduces in normal use. If it does, re-run `update({})` when the session `kycStatus` still differs after the update (the current effect does not re-fire), or refresh the JWT on the server when `/api/kyc` changes the status.

## 6. Small cleanups

- `apps/wallet/src/components/pages/kyc-onboarding-page.tsx:16`: lint error `react-hooks/set-state-in-effect` (`setMode` in an effect). Derive the mode from `application` plus a "retrying" flag instead.
- `apps/wallet/src/components/pages/project-units-page.tsx`: unused imports (lint warnings).
- The withdraw page's "Disponible" balance does not refresh after a withdrawal fails and the reserve is released. Invalidate `["wallet","balances"]` when the tracked withdrawal reaches a final state.
- `apps/admin`: `eslint` could not run from the package (module resolution error). Check the admin ESLint config.
- Optional: add `apps/admin/.env.local.example` with `DATABASE_URL=file:../../packages/db/wallet.db`, so a manually started admin reads the shared DB.
