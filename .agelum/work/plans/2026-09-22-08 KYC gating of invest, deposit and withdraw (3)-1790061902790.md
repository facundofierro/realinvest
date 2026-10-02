# Plan: KYC gating of invest, deposit and withdraw

## Certainty assessment

**Level: Medium-High**

The relevant subsystems were located precisely and read in full: the KYC status source of truth (`users.kycStatus` in `@repo/db`, kept in sync by the mock KYC provider), the auth/session plumbing (NextAuth JWT session + native-app bearer tokens, both of which embed a `kycStatus` claim that can go stale), the existing "blocked feature dialog" pattern to model the new dialog on, and every current entry point for invest/trade/deposit/withdraw. The mechanism for gating (a shared server-side guard called from API routes, plus a shared client hook/dialog) is straightforward to build with the existing tools (Drizzle, Zod, NextAuth, `@repo/providers-kyc`, `@repo/ui` Dialog primitives) and closely mirrors patterns already in the codebase (`apps/wallet/src/lib/api-auth.ts`, `apps/wallet/src/app/(dashboard)/layout.tsx`, `apps/wallet/src/components/desktop-top-nav.tsx`).

What keeps this from "High": the money-moving actions this task is supposed to gate are, today, almost entirely non-functional UI stubs (see "Important context discovered during research" below) — there is no real backend mutation to gate for deposit and withdraw, and trade/invest's `onConfirm` handlers are literally `console.log(...)`. This means part of the work is deciding *how much* real plumbing to add purely so there is something server-side to return a 403 from and something client-side to intercept, and that scope decision changes the size and shape of the diff materially. That decision is captured explicitly in the Ambiguity assessment and should be confirmed before implementation starts.

## Ambiguity assessment

**Level: Low**

The KYC *status* mechanics are unambiguous (single source of truth, one provider). The features being gated are mostly unwired mockups, which initially raised real scope questions; those have been resolved with the user and are recorded below. No open product decisions remain that would change the shape of the implementation.

### Resolved scope decisions

1. **Deposit and withdraw get minimal real server endpoints**, not UI-only gating. Deposit becomes a `GET` endpoint (so there's a real request to 403), and withdraw becomes a `POST` endpoint that also inserts a `PENDING` `transactions` row — matching the mock-backend fidelity used elsewhere in the app, without building real Fireblocks/ledger logic (explicitly out of scope per the task's project context).
2. **Invest and trade share a single server gate**: `POST /api/wallet/positions`. Investing in a unit navigates into the same exchange/trade flow (`apps/wallet/src/components/unit-details-dialog.tsx:209-228`), so there is no separate "invest" endpoint to gate independently.
3. **The three trade `onConfirm` stubs get wired to the real endpoint** as part of this task (not left as `console.log`), so gating actually has an effect end-to-end rather than only blocking dialogs that, once confirmed, did nothing anyway. This expands Phase 2 to include implementing real position creation (see below), not just adding a KYC check to an existing handler.
4. **The `@agelum/backend` / `packages/backend` reactive stack stays out of scope.** The repo is mid-migration: `apps/wallet/src/hooks/use-queries.ts` (uncommitted) now imports `useReactive` from `@agelum/backend/client`, but no provider for it is mounted in `apps/wallet/src/components/providers.tsx`, and `packages/backend`'s database is a *separate* Postgres schema with no `users`/`kyc` concept at all. This plan builds gating entirely on the existing, working stack (NextAuth + `@repo/db` SQLite + REST routes under `apps/wallet/src/app/api`) and does not touch `packages/backend` or the `useReactive` hooks.

### Note on repurposing `POST /api/wallet/positions`

Today this route's handler reads `{ positionId }` from the body and calls a stub `createPosition(positionId)` that just echoes it back (`apps/wallet/src/lib/api/positions.ts:23-26`) — despite the function name, this is dead scaffolding: nothing in the current UI calls it. The client-side `closePosition()` (`apps/wallet/src/lib/api-client.ts:213-233`) also POSTs `{ positionId }` to this same route, but the hook that's actually wired into the UI, `useClosePosition()` (`apps/wallet/src/hooks/use-queries.ts:92-101`), is itself a `console.warn` no-op that never calls `closePosition()` — so no working code path depends on the route's current `{ positionId }` body shape today. It is safe to change this route to accept a real create-position payload without breaking any currently-functioning feature. Closing positions is unaffected (still fully disconnected) and stays out of scope for this task.

---

## Important context discovered during research

- **KYC status source of truth**: `users.kycStatus` column, `packages/db/src/schema.ts:28` (type `KycStatus = "none" | "pending" | "approved" | "rejected"`, `packages/providers-kyc/src/types.ts:1`). It is written by the mock KYC provider on submit and lazily on read-triggered auto-approval:
  - `packages/providers-kyc/src/mock/mock-kyc-provider.ts:33-44` (`resolvePending`, flips `pending` → `approved` after `autoDecideAt` elapses, called from `getApplication`)
  - `packages/providers-kyc/src/mock/mock-kyc-provider.ts:60-87` (`submitApplication`, writes `users.kycStatus` immediately based on instant-decision rules or leaves `pending`)
  - **This means `getKycProvider().getStatus(userId)` (`packages/providers-kyc/src/port.ts:4`) is the only way to get an up-to-date status** — a raw `SELECT kycStatus FROM users` could return a stale `pending` for a user whose auto-approval window has already elapsed but hasn't been read since. The gate must call through the provider, not query the column directly.
- **Session claims are stale by design and must not be trusted for authorization**:
  - NextAuth JWT: `apps/wallet/src/auth.ts:36-50` only refreshes `token.kycStatus` on sign-in or when `trigger === "update"` (i.e. an explicit `session.update()` call from the client) — nothing in the codebase currently calls that after a KYC status change.
  - Native app bearer token: `apps/wallet/src/lib/native-auth.ts:29,38-42` embeds `kycStatus` in a signed token at issuance (`signAccessToken`), independently stale.
  - Both `requireUser()` paths (`apps/wallet/src/lib/api-auth.ts:10-23`) return an object with `.id` — the plan's server guard uses that `.id` to re-check live status via the provider, sidestepping both staleness sources.
  - Client-side, `apps/wallet/src/hooks/use-current-user.ts` exposes `session.user.kycStatus` (used today only for display in `apps/wallet/src/components/desktop-top-nav.tsx:37-38,207`) — this plan does **not** use it for gating decisions; it uses `useKycApplication()` (`apps/wallet/src/hooks/use-queries.ts:105-111`, which already polls every 3s while `pending`) instead, which reads live from `GET /api/kyc`.
- **Existing "blocked feature dialog" (commit `3605f0b`, since evolved)**: `apps/wallet/src/components/desktop-top-nav.tsx:171-200`. This is a generic "coming soon" dialog (Exchange/Proyectos nav links), not KYC-specific — it doesn't reference KYC status at all. It's a good structural/visual pattern to reuse (the `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle`/`DialogDescription`/`DialogFooter` composition from `@repo/ui/components/ui/dialog`), but its copy and trigger logic are unrelated to KYC and should not be repurposed as-is. The same file's *account* dialog (`desktop-top-nav.tsx:202-214`) already shows KYC status and a "complete/retry verification" link — that's the closer precedent for copy/CTA style.
- **Money-moving actions are currently non-functional stubs** (confirmed by reading every call site):
  - Invest entry: `apps/wallet/src/components/unit-details-dialog.tsx:209-228` ("INVERTIR" button) — calls an optional `onInvest` prop or navigates to `/exchange/{symbol}`.
  - Trade entry points (3 duplicated implementations, all opening the same `TradeDialog`):
    - `apps/wallet/src/components/pages/exchange-detail-page.tsx:507-544` (Buy/Sell buttons) → `TradeDialog` at `:547-581`, `onConfirm` at `:573-580` is `console.log(...)` only.
    - `apps/wallet/src/components/desktop-token-tabs.tsx:625-655` (Buy/Sell buttons) + `:706-711` (`onInvest` wiring for the unit-details dialog) → `TradeDialog` at `:669-723`, `onConfirm` at `:716-723` is `console.log(...)` only.
    - `apps/wallet/src/components/pages/assets-page.tsx:589` (entry) → its own inline trade `Dialog` (not the shared `TradeDialog` component) with a confirm button at `:727-740` whose `onClick` just closes the dialog.
  - `apps/wallet/src/components/exchange/trade-dialog.tsx:52-72` (props) and `:279-300` (confirm button, `onConfirm` prop) — purely presentational, no backend call itself.
  - `POST /api/wallet/positions` (`apps/wallet/src/app/api/wallet/positions/route.ts:14-31`) is the one real REST endpoint shaped like a trade/invest mutation, guarded today only by `requireUser()`. Its handler, `createPosition` (`apps/wallet/src/lib/api/positions.ts:23-26`), is an explicit stub: `// In a real app, this would create a position in the database`. Nothing in the current UI actually calls it (the client function of the same name in `apps/wallet/src/lib/api-client.ts:187-211` is unused by any trade/invest call site).
  - Deposit: `apps/wallet/src/components/pages/deposit-page.tsx` has no form and no submit handler; it's a static display of a hardcoded address (`:52`) and a QR icon placeholder.
  - Withdraw: `apps/wallet/src/components/pages/withdraw-page.tsx:45` — "Solicitar Retiro" `Button` has no `onClick`.
- **Reusable UI pieces**:
  - `apps/wallet/src/components/unit-details-actions.tsx` already supports a `disabled` prop per action (`:14`, applied at `:69`) — useful if/when we want to grey out the "INVERTIR" action itself rather than only intercepting the click.
  - `apps/wallet/src/lib/kyc-copy.ts` already has localized (es/en) status strings (`status.pending`, `status.approved`, `status.rejectedPrefix`) via `apps/wallet/src/components/kyc/kyc-locale-context.tsx`'s `useKycCopy()` — the new blocked-dialog copy should extend this file rather than hardcode new strings inline, for consistency with the rest of the KYC UI.
  - `apps/wallet/src/app/(dashboard)/layout.tsx:1-21` shows the existing pattern for server-side, session-based access control (fetch `auth()`, `redirect()` if missing) — informative precedent, though this plan uses a dialog rather than a redirect (per the task's explicit "blocked-feature dialog" requirement).

---

## Design

### Server-side gate

New file: `apps/wallet/src/lib/kyc-guard.ts`

```ts
import { NextResponse } from "next/server";
import { getKycProvider } from "@/lib/kyc";
import type { KycStatus } from "@repo/providers-kyc";

export type KycBlockedStatus = Exclude<KycStatus, "approved">; // "none" | "pending" | "rejected"

export function kycBlockedResponse(status: KycBlockedStatus, rejectionReason?: string | null) {
  return NextResponse.json(
    { error: "kyc_required", status, rejectionReason: rejectionReason ?? null },
    { status: 403 },
  );
}

/** Returns null if the user is KYC-approved, otherwise the blocking status. Always re-checks live status via the provider (never trusts session/token claims). */
export async function checkKycApproved(userId: string): Promise<KycBlockedStatus | null> {
  const status = await getKycProvider().getStatus(userId);
  return status === "approved" ? null : status;
}
```

Usage in a route:

```ts
const user = await requireUser();
if (!user) return unauthorizedResponse();
const blocked = await checkKycApproved(user.id);
if (blocked) return kycBlockedResponse(blocked);
```

Response shape `{ error: "kyc_required", status, rejectionReason }` is the "machine-readable reason" the acceptance criteria call for; `status` maps 1:1 to `KycStatus` so the client can reuse the same copy table it already uses for the KYC onboarding screens.

### Client-side gate

New hook: `apps/wallet/src/hooks/use-kyc-gate.ts`

```ts
"use client";

import { useState } from "react";
import { useKycApplication } from "@/hooks/use-queries";

export function useKycGate() {
  const { data: application, isLoading } = useKycApplication();
  const status = application?.status ?? "none";
  const isApproved = status === "approved";
  const [blockedDialogOpen, setBlockedDialogOpen] = useState(false);

  function guard(action: () => void) {
    if (isApproved) {
      action();
      return;
    }
    setBlockedDialogOpen(true);
  }

  return {
    status,
    isApproved,
    isLoading,
    rejectionReason: application?.rejectionReason ?? null,
    blockedDialogOpen,
    setBlockedDialogOpen,
    guard,
  };
}
```

`isLoading` is exposed so call sites can decide whether to block-by-default while the KYC application hasn't loaded yet (recommended: treat `isLoading` as blocked too, i.e. don't allow the action to fire before we know the status — the `guard` function above already does this implicitly since `isApproved` is `false` while `application` is `undefined`).

New component: `apps/wallet/src/components/kyc/kyc-blocked-dialog.tsx`

- Props: `{ open: boolean; onOpenChange: (open: boolean) => void; status: "none" | "pending" | "rejected"; rejectionReason?: string | null }`.
- Structure: same `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle`/`DialogDescription`/`DialogFooter` composition as `apps/wallet/src/components/desktop-top-nav.tsx:171-200`.
- Copy: sourced from a new `blocked` section added to `apps/wallet/src/lib/kyc-copy.ts` (both `es` and `en`), e.g.:
  - `none`: title "Verificación requerida" / description "Necesitás completar tu verificación de identidad antes de poder invertir, depositar o retirar." / CTA "Completar verificación" → `Link href="/kyc"`.
  - `pending`: title "Verificación en revisión" / description reusing `copy.status.pending` / CTA "Ver estado" → `Link href="/kyc"`.
  - `rejected`: title "Verificación rechazada" / description `${copy.status.rejectedPrefix} ${rejectionReason ?? ""}` / CTA `copy.status.retry` → `Link href="/kyc"`.
- Read locale via the existing `useKycCopy()` context (`apps/wallet/src/components/kyc/kyc-locale-context.tsx`) so the dialog matches whatever locale the onboarding flow is using.

---

## Phase 1 — Shared gate infrastructure

1. Create `apps/wallet/src/lib/kyc-guard.ts` as specified above (`checkKycApproved`, `kycBlockedResponse`, exported `KycBlockedStatus` type).
2. Extend `apps/wallet/src/lib/kyc-copy.ts` with a `blocked` section (title/description/action per status, `es` + `en`), following the existing object shape in that file.
3. Create `apps/wallet/src/hooks/use-kyc-gate.ts` as specified above.
4. Create `apps/wallet/src/components/kyc/kyc-blocked-dialog.tsx` as specified above, consuming `kycCopy.blocked` via `useKycCopy()`.
5. No changes to `apps/wallet/src/hooks/use-queries.ts` beyond what's already there — `useKycApplication` (lines 105-111) already exists and already polls while pending; the new gate hook composes it rather than duplicating fetch logic.

## Phase 2 — Gate invest & trade, and wire position creation for real

This phase both adds the KYC gate and implements real position creation, since the trade dialogs' `onConfirm` handlers must call something real for the gate to have any observable effect (see "Note on repurposing `POST /api/wallet/positions`" above).

### 2a. Real position creation

1. Rewrite `apps/wallet/src/lib/api/positions.ts`'s `createPosition` to take a real payload and insert into `positions` (`packages/db/src/schema.ts:202-215`):
   ```ts
   import { marketTokens, positions } from "@repo/db";
   import { eq } from "drizzle-orm";
   import { getCurrentUserId } from "@/lib/current-user";
   import { getDb } from "@/lib/db";

   export interface CreatePositionInput {
     tokenSymbol: string;
     side: "BUY" | "SELL";
     orderType: "MARKET" | "LIMIT";
     totalAmount: number;
     orderPriceUsd?: number;
   }

   export async function createPosition(input: CreatePositionInput) {
     const userId = await getCurrentUserId();
     const [token] = await getDb().select().from(marketTokens).where(eq(marketTokens.symbol, input.tokenSymbol));
     if (!token) throw new Error(`Unknown token symbol: ${input.tokenSymbol}`);

     const orderPriceUsd = input.orderType === "LIMIT" ? (input.orderPriceUsd ?? token.priceUsd) : token.priceUsd;

     const [row] = await getDb().insert(positions).values({
       userId,
       tokenId: token.id,
       side: input.side,
       totalAmount: input.totalAmount,
       orderPriceUsd,
       openedMarketPriceUsd: token.priceUsd,
       status: "OPEN",
     }).returning();
     return row;
   }
   ```
   This intentionally does **not** touch `balances` (no deduction/locking of USDT) — full trading-balance correctness is out of scope for a KYC-gating task; it only needs to be real enough that gating it has an observable effect. Note this as a known simplification if it surfaces in review.
2. `apps/wallet/src/lib/api-client.ts`'s existing `createPosition` client function (`:187-211`) already POSTs the matching `{ tokenSymbol, side, orderType, totalAmount, orderPriceUsd }` shape to `/api/wallet/positions` — no change needed there.
3. Replace the stub `useCreatePosition()` in `apps/wallet/src/hooks/use-queries.ts` (`:81-90`) with a real mutation, mirroring `useSubmitKyc` (`:113-119`):
   ```ts
   export function useCreatePosition() {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: createPosition, // from "@/lib/api-client"
       onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wallet", "positions"] }),
     });
   }
   ```
   (Confirm/align the invalidated query key with whatever key `useWalletPositions`/`getWalletPositions` actually uses once this hook is touched — it currently goes through the same `useReactive`-migration ambiguity as the rest of the read hooks in this file; if `useWalletPositions` is still on the broken `useReactive` path when this lands, invalidate via `router.refresh()` or a manual refetch instead, and flag that inconsistency rather than silently depending on a hook that may not be wired to a provider yet.)

### 2b. Server-side KYC gate

4. In `apps/wallet/src/app/api/wallet/positions/route.ts`, change `POST` to: capture the user, parse the new payload with Zod, apply the KYC gate, then call the real `createPosition`:
   ```ts
   const createPositionSchema = z.object({
     tokenSymbol: z.string().min(1),
     side: z.enum(["BUY", "SELL"]),
     orderType: z.enum(["MARKET", "LIMIT"]),
     totalAmount: z.number().positive(),
     orderPriceUsd: z.number().positive().optional(),
   });

   export async function POST(request: Request) {
     const user = await requireUser();
     if (!user) return unauthorizedResponse();
     const blocked = await checkKycApproved(user.id);
     if (blocked) return kycBlockedResponse(blocked);
     const parsed = createPositionSchema.safeParse(await request.json().catch(() => null));
     if (!parsed.success) {
       return NextResponse.json({ error: "Invalid position request", issues: parsed.error.issues }, { status: 400 });
     }
     return NextResponse.json({ position: await createPosition(parsed.data) });
   }
   ```
   `GET` (unchanged) stays open to any authenticated user — viewing positions isn't a money-moving action.

### 2c. Client-side gate + wiring (three call sites, same pattern at each)

5. `apps/wallet/src/components/pages/exchange-detail-page.tsx:507-544` — wrap the SELL (`:510-516`) and BUY (`:528-534`) `onClick` handlers with `useKycGate().guard(...)` so the dialog only opens for approved users; render `<KycBlockedDialog>` alongside the existing `<TradeDialog>` (`:547`). Replace the `onConfirm` stub (`:573-580`) with a call to `useCreatePosition().mutateAsync({ tokenSymbol: token.symbol, side: tradeType, orderType, totalAmount: Number(amount), orderPriceUsd: orderType === "LIMIT" ? Number(limitPriceInput) : undefined })`, closing the dialog on success.
6. `apps/wallet/src/components/desktop-token-tabs.tsx:625-655` (BUY/SELL entry buttons) and `:706-711` (`onInvest` handler passed to the unit-details dialog) — same guard treatment on both (both call `setIsTradeDialogOpen(true)`, so gating both covers the "INVERTIR" flow too); same `onConfirm` rewiring (`:716-723`).
7. `apps/wallet/src/components/pages/assets-page.tsx:589` (entry point) — same guard treatment; same rewiring of its inline confirm button (`:727-740`).
8. Since the server route now enforces the gate independently, the client-side guard at the "open dialog" step is a UX nicety (avoid showing a dialog that will just fail on confirm) — the authoritative enforcement is the 403 from step 4.

## Phase 3 — Gate withdraw

This phase adds the minimum real plumbing needed to have a server request to gate, matching the fidelity of the rest of the mock backend (no real ledger/custody integration).

Server:
1. New file `apps/wallet/src/lib/api/withdraw.ts`:
   ```ts
   import { transactions } from "@repo/db";
   import { getCurrentUserId } from "@/lib/current-user";
   import { getDb } from "@/lib/db";

   export async function createWithdrawal(input: { amount: number; address: string }) {
     const userId = await getCurrentUserId();
     const [row] = await getDb().insert(transactions).values({
       userId,
       type: "WITHDRAWAL",
       status: "PENDING",
       amount: input.amount,
       currencyCode: "USDT",
       description: `Withdrawal to ${input.address}`,
       metadata: { address: input.address },
     }).returning();
     return row;
   }
   ```
   (Table shape: `packages/db/src/schema.ts:217-228`.)
2. Export it from `apps/wallet/src/lib/api/index.ts` alongside the other transaction exports.
3. New file `apps/wallet/src/app/api/wallet/withdraw/route.ts`, modeled on `apps/wallet/src/app/api/kyc/route.ts`:
   ```ts
   import { NextResponse } from "next/server";
   import { z } from "zod";
   import { createWithdrawal } from "@/lib/api";
   import { requireUser, unauthorizedResponse } from "@/lib/api-auth";
   import { checkKycApproved, kycBlockedResponse } from "@/lib/kyc-guard";

   export const runtime = "nodejs";
   export const dynamic = "force-dynamic";

   const withdrawSchema = z.object({
     amount: z.number().positive(),
     address: z.string().min(1),
   });

   export async function POST(request: Request) {
     const user = await requireUser();
     if (!user) return unauthorizedResponse();
     const blocked = await checkKycApproved(user.id);
     if (blocked) return kycBlockedResponse(blocked);
     const parsed = withdrawSchema.safeParse(await request.json().catch(() => null));
     if (!parsed.success) {
       return NextResponse.json({ error: "Invalid withdrawal request", issues: parsed.error.issues }, { status: 400 });
     }
     return NextResponse.json({ transaction: await createWithdrawal(parsed.data) });
   }
   ```

Client:
4. Add `createWithdrawal` to `apps/wallet/src/lib/api-client.ts` (mirrors `submitKyc` at `:363-371`), POSTing to `/api/wallet/withdraw`.
5. Add a `useCreateWithdrawal()` mutation hook to `apps/wallet/src/hooks/use-queries.ts`, mirroring `useSubmitKyc` (`:113-119`) — plain `useMutation` from `@tanstack/react-query`, not the broken `useReactive` pattern used elsewhere in that file.
6. In `apps/wallet/src/components/pages/withdraw-page.tsx`:
   - Wire the amount/address `Input`s (currently uncontrolled, `:35` and `:42`) to local state.
   - Wrap the "Solicitar Retiro" button's new `onClick` (`:45`) with `useKycGate().guard(...)`, calling `useCreateWithdrawal().mutateAsync({ amount, address })` inside the guarded action.
   - Render `<KycBlockedDialog>` in the page.

## Phase 4 — Gate deposit

Deposit has no request today (the address is a hardcoded string). To have a real server 403 path:

Server:
1. New file `apps/wallet/src/app/api/wallet/deposit/route.ts`:
   ```ts
   import { NextResponse } from "next/server";
   import { requireUser, unauthorizedResponse } from "@/lib/api-auth";
   import { checkKycApproved, kycBlockedResponse } from "@/lib/kyc-guard";

   export const runtime = "nodejs";
   export const dynamic = "force-dynamic";

   export async function GET() {
     const user = await requireUser();
     if (!user) return unauthorizedResponse();
     const blocked = await checkKycApproved(user.id);
     if (blocked) return kycBlockedResponse(blocked);
     // Simulated custody provider is out of scope; keep the current placeholder address.
     return NextResponse.json({ address: "T9yD14Nj9...j129jd", network: "TRC20" });
   }
   ```

Client:
2. Add `getDepositAddress()` to `apps/wallet/src/lib/api-client.ts` (GET `/api/wallet/deposit`).
3. Add a `useDepositAddress()` query hook to `apps/wallet/src/hooks/use-queries.ts` (plain `useQuery`, same style as `useKycApplication`).
4. Convert `apps/wallet/src/components/pages/deposit-page.tsx` to a client component (`"use client"`) that calls `useDepositAddress()`:
   - While the query is loading, show existing skeleton/placeholder.
   - On a `kyc_required` error response, render `<KycBlockedDialog>` (open by default, `onOpenChange` navigating back via the existing back `Link`) in place of the deposit card.
   - On success, render the existing card using the fetched `address` instead of the hardcoded string at `:52`.

---

## Open items to confirm before implementation

These map to the numbered points in the Ambiguity assessment above and should be resolved via the clarifying questions that follow this plan:
1. Is inventing `GET /api/wallet/deposit` and `POST /api/wallet/withdraw` (with minimal real persistence for withdraw) the right scope, or should this task stay UI-only and leave "API routes return 403" unmet for deposit/withdraw until a later task builds those features for real?
2. Is treating `POST /api/wallet/positions` as the single gate point for both invest and trade correct, or should invest get its own distinct server check?
3. Confirm the `@agelum/backend`/`packages/backend` stack is correctly understood as out of scope / not yet wired up, so this plan is right to build entirely on `@repo/db` + REST routes.
4. Should the existing `onConfirm` stubs (`console.log`) in the three trade call sites be left alone, or wired to call the now-gated `POST /api/wallet/positions` as part of this task?
