# Plan: Responsive audit — navigation and app shell

Task: `.agelum/work/tasks/pending/16 Responsive audit: navigation and app shell (5).md`

## Certainty assessment

**Level: Medium-High**

Every defect below was located by reading the exact lines, so the *what* is not a hypothesis. The implementation work (a single breakpoint module, a CSS-first shell, a shared nav config, a responsive dialog/sheet primitive) is conventional React/Tailwind 4 work with no backend or provider dependencies. Confidence is not "High" because (a) the breakpoint *criterion* is a product decision that changes behaviour on phones in landscape (see Ambiguity), (b) the shell is coupled to `SplashScreen` in a way that currently masks hydration flicker (so the "no flicker" acceptance criterion cannot be verified by reading alone), and (c) several pages hardcode `100vh`/`h-screen` inside the `h-dvh` shell, so shell-height changes can ripple into pages owned by tasks 17/18.

## Ambiguity assessment

**Level: Low**

The task is clear about *what* to audit and deliver, and the three product decisions that were open have been confirmed by the user (2026-09-23):

1. **[DECISION 1 — confirmed] Switch criterion: width ≥ 1024px (`lg`)**, CSS-first, single layout breakpoint for both nav and dialog/sheet. Phones in landscape (e.g. 844×390) keep the bottom nav; the low-height case is handed to task 18.
2. **[DECISION 2 — confirmed] Shared nav config, drop `blocked`.** Remove the stale "Disponible en marzo de 2026" popup, make the desktop USDT balance link to `/assets`, keep Tokenización desktop-only.
3. **[DECISION 3 — confirmed] Rebuild `UnitDetailsSheet` on Radix** (focus trap, Esc, aria, scroll lock), wrapped by the responsive dialog/sheet component.

Remaining judgment calls are low-risk and documented inline: the optional `SplashScreen` change (2.4), and sequencing the overlay migration in 4.3 last for files owned by tasks 13/14/15 to avoid merge conflicts. No further clarification is needed before implementing.

## Current state (research findings)

| Area | Location | Finding |
|---|---|---|
| Breakpoint detection | `apps/wallet/src/hooks/use-is-desktop.ts:5-18` | `useSyncExternalStore` on `resize`; snapshot is `window.innerWidth > window.innerHeight` (orientation, not width). Server snapshot `false`. Not a shared constant; only consumers are `dashboard-layout-client.tsx:13`, `pages/exchange-page.tsx:134`, `pages/assets-page.tsx:74`. |
| App shell | `apps/wallet/src/components/dashboard-layout-client.tsx:13-40` | `isDesktop ? <DesktopTopNav/> : null` and `!isDesktop && <BottomNav/>` — JS-only switching. Container `h-dvh overflow-hidden`; content wrapper adds `pt-16` (64px) on desktop, `main` adds `pb-24` (96px) on mobile. |
| Header/padding mismatch | `desktop-top-nav.tsx:71` (`h-14` = 56px) vs `dashboard-layout-client.tsx:26` (`pt-16` = 64px) | 8px dead gap under the desktop header. Pages hardcode either number: `pages/chat-page.tsx:50` `h-[calc(100vh-64px)]`, `pages/tokenization-page.tsx:218` `min-h-[calc(100vh-3.5rem)]`, and `sticky top-[62px]` in `pages/project-detail-page.tsx:299`. No single source of truth for nav heights. |
| Hydration/flicker | `apps/wallet/src/components/splash-screen.tsx:10-27`, `components/providers.tsx:24` | The tree only renders after `isMounted` (client) so `useIsDesktop` never renders with its `false` server snapshot *today* — flicker is hidden by the splash. But `SplashScreen` also swaps the whole tree for the splash whenever `useIsFetching() > 0` (line 19-20), unmounting the shell (and resetting page state) on every refetch. Any change that removes the splash would immediately expose a nav flash. Root cause of the acceptance criterion risk: the shell depends on JS to pick a nav. |
| Safe area | `bottom-nav.tsx:90` uses `pb-safe`; no `@utility pb-safe` / plugin exists (`globals.css` has none; Tailwind 4.1.18 has no such core utility) → **no-op**. `app/layout.tsx:1-32` exports no `viewport` (no `viewportFit: "cover"`), so `env(safe-area-inset-*)` is 0 on iOS anyway. Only `unit-details-sheet.tsx:53` uses `env(safe-area-inset-bottom)` (and thus also inert). Top inset (notch / native wrappers) is not handled anywhere. |
| Bottom nav width | `bottom-nav.tsx:90` | `max-w-md` (448px) centered with `left-1/2 -translate-x-1/2`: on a 768px tablet it is a narrow floating bar while the page beneath is full width. SVG background is a fixed `viewBox="0 -20 375 120"` with `preserveAspectRatio="none"` (lines 96-99) — stretches oddly when wider than 375. |
| Active state | `bottom-nav.tsx:53-54`, `desktop-top-nav.tsx:47-48` | `isActive = pathname === path` (exact). Detail routes (`/exchange/[symbol]`, `/project/[id]`, `/assets?...`) never highlight their parent tab. "Cuenta" can never be active. Home logo link `/` has no active state. |
| **Bug: Cuenta tab dead on mobile** | `bottom-nav.tsx:56-87, 151-171, 207-231` | The `#account` special-case (opens the dialog via `setAccountOpen(true)`) exists only inside the **left** items map (line 157), but `#account` is in `rightNavItems` (line 81), whose map (207-231) renders a plain `<Link href="#account">`. The account dialog (234-253, sign-out, KYC link) is unreachable from mobile. |
| Nav parity | `bottom-nav.tsx:56-87` vs `desktop-top-nav.tsx:50-67, 141-165` | Mobile: Proyectos, Exchange, Chat, Wallet, Cuenta. Desktop: Proyectos*, Exchange*, Tokenización, Chat icon, USDT balance (not a link — no route to `/assets`), account button. `*blocked: true` (lines 55, 61) → opens "Disponible en marzo de 2026" dialog (171-199) — stale (today is Sept 2026) and contradicts mobile. |
| Duplicated account dialog | `bottom-nav.tsx:234-253`, `desktop-top-nav.tsx:202-219` | Two near-identical copies (KYC status, KYC CTA, sign out) with duplicated `kycAction` string logic (`bottom-nav.tsx:29`, `desktop-top-nav.tsx:39`). |
| "story-active" event | `bottom-nav.tsx:34-51`, dispatched from `components/project/stories-section.tsx:45-75`, also listened in `pages/project-detail-page.tsx:161-170` | Window `CustomEvent` hides the bottom nav during fullscreen stories (`fixed inset-0 z-[9999]`, stories-section.tsx:165). Works, but is an untyped global channel; desktop nav ignores it (header z-50 sits under the z-9999 overlay so that is fine). |
| Dialog vs sheet per form factor | see table below | Inconsistent: only the exchange/assets *unit details* switch by `isDesktop`; every other overlay is a centered Radix `Dialog` at all sizes; `project-units-page` shows the sheet on desktop too. |
| `UnitDetailsSheet` | `apps/wallet/src/components/unit-details-sheet.tsx:34-145` | Not Radix: plain `fixed inset-0 z-100` div; no focus trap, no Esc, no `role="dialog"`/`aria-modal`, no scroll lock. `env(safe-area-inset-bottom)` only in collapsed mode (line 53). Expanded mode is a full-screen page (`top-0 p-0`, 56-58). Naming is misleading: `unit-details-dialog.tsx:15,224` (`UnitDetailsDialog`) actually renders the sheet. |
| Z-index stack | `packages/ui/src/components/ui/dialog.tsx:22` overlay `z-[100]`, content `z-[110]`; `packages/ui/src/components/ui/sheet.tsx:24,34` overlay/content `z-50`; navs `z-50` (`bottom-nav.tsx:90`, `desktop-top-nav.tsx:71`); custom sheet `z-100`/`z-110` (`unit-details-sheet.tsx:41,73`); page headers `sticky/fixed z-50` (`exchange-detail-page.tsx:432`, `project-detail-page.tsx:217`, `assets-page.tsx:364`). The Radix `Sheet` primitive would sit at the *same* z-index as the nav → must be raised before use. |
| Shell-relative viewport units | `pages/dashboard-page.tsx:91,104`, `exchange-page.tsx:425`, `exchange-detail-page.tsx:377,395`, `project-units-page.tsx:153,163,329`, `project-detail-page.tsx:196,206`, `kyc-onboarding-page.tsx:18`, `chat-page.tsx:50`, `assets-page.tsx:206`, `require-session.tsx:11` | `h-screen`/`min-h-screen`/`100vh` inside a `h-dvh` scroll container. On mobile browsers `100vh` > `dvh` (URL bar) → overscroll/clipped bottoms. **Screen-by-screen fixes belong to task 17**; this task only provides the shell variables and fixes the two pages that are pure shell arithmetic (chat, tokenization). |
| Existing breakpoint usage | Tailwind defaults (`sm`/`md`/`lg`) used across pages (e.g. `invest-page.tsx:165,213` `sm:grid-cols-4`, `lg:grid-cols-3`; `stories-section.tsx:269,339` `md:`/`lg:`); no `@theme` breakpoint overrides in `apps/wallet/src/app/globals.css:1-179`. |
| UI package exports | `packages/ui/package.json:5-10` | Exposes `components/ui/*`, `components/brand/*`, `lib/*`, `globals.css`. `hooks` are not exported → shared hooks live in `apps/wallet/src/hooks` (or add an export if the primitive goes into `packages/ui`). |
| Ancillary overlays | `pages/exchange-page.tsx:466-622` (`Dialog`, max-w-[420px]), `pages/assets-page.tsx:579-726` (trade dialog), `pages/project-units-page.tsx:617-740` (contact dialog), `components/exchange/trade-dialog.tsx:74-306`, `components/invest-confirm-dialog.tsx:92-118`, `components/kyc/kyc-blocked-dialog.tsx:17-22`, `pages/withdraw-page.tsx:47`, plus the two nav dialogs | All centered Radix `Dialog`, several re-declaring `w-[calc(100%-2rem)] max-w-[440px] rounded-[32px]`. |

### Possible reasons for the reported problems (root causes)
- Orientation heuristic (`innerWidth > innerHeight`) was a quick "mobile vs desktop" proxy; it fails for landscape phones, portrait monitors, split-screen windows and Tauri/Capacitor wrappers.
- Nav switching in JS + SSR snapshot `false` = first paint can only be "mobile"; masked by the splash.
- Two navs evolved independently (different files, different item lists, different dialogs), hence divergent active-state logic, items, and the missed `#account` branch.
- `pb-safe` was copied from a plugin/utility that is not installed; `viewport-fit=cover` never enabled.
- Nav heights (56/64/96px) are magic numbers repeated per page.

## Target breakpoint scheme (proposed — depends on DECISION 1)

| Name | Range | Nav | Overlays (dialog-like) |
|---|---|---|---|
| mobile | < 640 (`sm`) | bottom nav, full width | bottom sheet |
| tablet | 640–1023 (`sm`–`lg`) | bottom nav, full width | bottom sheet (capped width `max-w-xl`, centered) |
| laptop | 1024–1279 (`lg`–`xl`) | top nav | centered dialog |
| desktop | ≥ 1280 (`xl`) | top nav (wider container) | centered dialog |

There is exactly **one** "layout switch" breakpoint: `lg` (1024). `sm`/`xl` remain purely Tailwind density tweaks inside pages. Values stay Tailwind's defaults so existing `sm:/md:/lg:` classes across pages remain valid.

## Implementation steps

### Phase 1 — Single source of truth for breakpoints and shell metrics

1.1 Create `apps/wallet/src/lib/breakpoints.ts`:
```ts
export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const;
export const DESKTOP_BREAKPOINT = BREAKPOINTS.lg; // nav + overlay switch
export const DESKTOP_MEDIA_QUERY = `(min-width: ${DESKTOP_BREAKPOINT}px)`;
```
Add a header comment documenting the table above (this is the "documented breakpoint scheme" acceptance criterion) and cross-reference that Tailwind's default `--breakpoint-*` values must match (Tailwind can't import TS). Optionally make them explicit and grep-able in `apps/wallet/src/app/globals.css` inside `@theme { --breakpoint-sm: 40rem; --breakpoint-md: 48rem; --breakpoint-lg: 64rem; --breakpoint-xl: 80rem; }` (identical to defaults, so no visual change) with a comment pointing at `breakpoints.ts`.

1.2 Add `apps/wallet/src/hooks/use-media-query.ts`: `useSyncExternalStore` over `window.matchMedia(query)` with `addEventListener("change")` (replaces the `resize` listener — fires only on threshold cross, not every pixel). `getServerSnapshot` returns a caller-provided `defaultValue` (default `false`).

1.3 Rewrite `apps/wallet/src/hooks/use-is-desktop.ts:5` to `return useMediaQuery(DESKTOP_MEDIA_QUERY)`. Keep the export name so `exchange-page.tsx:8,134` and `assets-page.tsx:23,74` keep working with no change. Add a doc comment: "JS-only branches (behaviour, not layout). Use CSS `lg:` classes for layout."

1.4 Shell metrics in `apps/wallet/src/app/globals.css`: add to `:root`
```css
--app-top-nav-h: 3.5rem;        /* desktop header, was h-14 */
--app-bottom-nav-h: 4rem;       /* mobile bar, was h-16 */
--safe-top: env(safe-area-inset-top, 0px);
--safe-bottom: env(safe-area-inset-bottom, 0px);
```
and define the missing utilities with Tailwind 4 `@utility`: `pt-safe`, `pb-safe`, `h-app-content` (`height: calc(100dvh - var(--nav-offset))` where `--nav-offset` is top-nav-h at `lg`, bottom-nav-h + safe-bottom below `lg`). This makes the existing `pb-safe` class in `bottom-nav.tsx:90` real.

1.5 In `apps/wallet/src/app/layout.tsx` (after the `metadata` export, line ~19) add:
```ts
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };
```
(import `Viewport` from `next`). Required for `env(safe-area-inset-*)` to be non-zero on iOS/Capacitor.

### Phase 2 — CSS-first app shell (no JS-dependent nav, no flicker)

2.1 `apps/wallet/src/components/dashboard-layout-client.tsx`: remove `useIsDesktop`. Render both navs always and let CSS choose:
```tsx
<div className="flex h-dvh overflow-hidden bg-muted/5">
  <div className="hidden lg:block"><DesktopTopNav /></div>   // or put hidden lg:flex on the header itself
  <div className="flex-1 min-w-0 flex flex-col lg:pt-[var(--app-top-nav-h)]">
    <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-[calc(var(--app-bottom-nav-h)+var(--safe-bottom)+0.5rem)] lg:pb-0">{children}</main>
    <div className="lg:hidden"><BottomNav /></div>
  </div>
</div>
```
Notes: fixes the 56 vs 64px mismatch (uses one variable), removes `transition-all duration-300` on the root/wrapper (it animates layout when the nav toggles — a source of visible "jump"), and keeps a top safe-area inset via `pt-safe` on the mobile branch if the app renders content under the status bar (native wrappers, `viewportFit: cover`). `DesktopTopNav` calls `useWalletBalances()` (`desktop-top-nav.tsx:42`), so rendering it on mobile triggers an extra balances query; that key is already fetched by other pages so it is deduped — verify no extra network cost, otherwise gate the balance widget with `useIsDesktop()` internally.

2.2 `bottom-nav.tsx:90`: change container to full width on all mobile/tablet sizes: drop `max-w-md left-1/2 -translate-x-1/2`, use `inset-x-0 bottom-0`. Keep the centre "notch" logo; to avoid stretching the fixed 375-wide SVG (lines 96-99), constrain the inner bar to `mx-auto max-w-xl` and let the background SVG live inside that inner wrapper (so the curve geometry is unchanged on tablets and the bar visually spans the width with a matching solid background outside the SVG: add `bg-white/95` + top border on the outer element). Use `pb-safe` (now real) and keep `h-16` via `h-[var(--app-bottom-nav-h)]` on the `<nav>` (line 149).

2.3 Chat page `apps/wallet/src/components/pages/chat-page.tsx:50`: replace `h-[calc(100vh-64px)]` with `h-full`/`h-app-content` so it follows the shell. `apps/wallet/src/components/pages/tokenization-page.tsx:218`: replace `min-h-[calc(100vh-3.5rem)]` with `min-h-[calc(100dvh-var(--app-top-nav-h))]`. `project-detail-page.tsx:299` `top-[62px]` → leave, flag to task 17 (it is relative to an in-page header, not the shell). Do **not** touch other `h-screen`/`min-h-screen` spots — task 17.

2.4 `SplashScreen` (`splash-screen.tsx:19-20`): out of strict scope, but since the shell no longer depends on mount state, change `isLoading` from `!isMounted || isFetching > 0` to only the initial-load case (e.g. `!isMounted || (isFetching > 0 && !hasRenderedOnce)`) using a `useRef` flag, so refetches stop unmounting the whole shell/nav. If this is judged too invasive, leave it and record it as a follow-up in the task notes (it is a pre-existing issue that also resets page state on each fetch).

### Phase 3 — One nav config, unified active state, fixed Cuenta tab

3.1 Create `apps/wallet/src/components/nav/nav-config.ts`: typed array `{ id, href, label, icon, match: "exact" | "prefix" | string[], surfaces: ("bottom"|"top")[] , kind: "link" | "account" }` containing: Proyectos `/invest` (also matches `/project/*`), Exchange `/exchange` (prefix, matches `/exchange/[symbol]`), Chat `/chat`, Wallet `/assets` (also `/deposit`, `/withdraw`), Cuenta (`kind: "account"`), Tokenización `/tokenization` (top only, per DECISION 2). Export `isNavActive(pathname, item)`.

3.2 Create `apps/wallet/src/components/nav/account-dialog.tsx` (+ hook or props `open/onOpenChange`) consolidating the duplicated account dialogs (`bottom-nav.tsx:234-253`, `desktop-top-nav.tsx:202-219`) and the duplicated `kycAction` copy (`bottom-nav.tsx:29`, `desktop-top-nav.tsx:39`). Uses the responsive overlay from Phase 4 (sheet on mobile, dialog on desktop). Include the avatar block from the mobile version and the green "Verificación aprobada." from the desktop version.

3.3 `bottom-nav.tsx`: build left/right groups by slicing the config filtered to `surfaces.includes("bottom")` (left = first 2, right = rest) and render **one** item component that handles both `kind: "link"` and `kind: "account"`. This fixes the dead `#account` link (lines 81, 207-231). Active state uses `isNavActive`. Give the account tab an "active" look while its sheet is open. Add `aria-current="page"` on active links and `aria-label` on the centre logo link (`bottom-nav.tsx:~186`).

3.4 `desktop-top-nav.tsx`: render links from the same config (`surfaces` includes "top"); remove `blocked: true` and the "Disponible en marzo de 2026" dialog (lines 55, 61, 110-124, 171-199) per DECISION 2 (if the user wants it kept, keep it but drive it from a `blocked` field in the config so both navs behave the same). Make the USDT balance (lines 150-157) a `Link` to `/assets` with the Wallet icon so the wallet is reachable. Replace hardcoded `#5B1187`/`#3B2146` with `text-primary` where equal in intent only if visually identical; otherwise leave (styling is not part of this task). Add `aria-current`.

3.5 Story-active channel: extract the string + listener into `apps/wallet/src/lib/story-events.ts` (`STORY_ACTIVE_EVENT`, `dispatchStoryActive(bool)`, `useStoryActive()` hook) and use it in `bottom-nav.tsx:34-51`, `stories-section.tsx:45-75` and `project-detail-page.tsx:161-170`. Behavior unchanged; removes three copies of an untyped magic string.

### Phase 4 — Consistent dialog vs sheet per form factor

4.1 Create `apps/wallet/src/components/responsive-dialog.tsx` (app-level; no package export change needed) exporting `ResponsiveDialog`, `ResponsiveDialogContent`, `ResponsiveDialogHeader`, `ResponsiveDialogTitle`, `ResponsiveDialogDescription`, `ResponsiveDialogFooter`. It uses `useIsDesktop()` **only to choose the primitive**: `Dialog`/`DialogContent` (`@repo/ui/components/ui/dialog`, `dialog.tsx:34-58`) at ≥ lg, `Sheet`/`SheetContent side="bottom"` (`@repo/ui/components/ui/sheet.tsx`) below. Because both Radix primitives share the same context shape (`@radix-ui/react-dialog`), titles/descriptions can be passed through unchanged. Bottom variant classes: `rounded-t-[28px] max-h-[90dvh] overflow-y-auto pb-[calc(1rem+var(--safe-bottom))] mx-auto w-full max-w-xl`.

4.2 `packages/ui/src/components/ui/sheet.tsx:24,34`: raise overlay to `z-[100]` and content to `z-[110]` (same as Dialog, `dialog.tsx:22,32`) so sheets stack above both navs (z-50) and page sticky headers (z-50). Add `backdrop-blur-sm` to match the dialog overlay. Check no other consumer of `Sheet` relies on z-50 (`grep -rn "ui/sheet"` first — none found in `apps/wallet` today).

4.3 Migrate overlays to `ResponsiveDialog` (mechanical: swap imports, keep content):
- `components/nav/account-dialog.tsx` (new, Phase 3)
- `components/exchange/trade-dialog.tsx:74-306` — remove the `data-[state=open]:[--tw-enter-translate-*]` overrides (lines 78) that exist only to defeat the Dialog's centered animation
- `components/invest-confirm-dialog.tsx:92-118`
- `components/kyc/kyc-blocked-dialog.tsx:17-22`
- `pages/withdraw-page.tsx:47` (confirm dialog)
- `pages/exchange-page.tsx:466-622`, `pages/assets-page.tsx:579-726`, `pages/project-units-page.tsx:617-740` (page-local dialogs). Coordinate with tasks 13/14/15, which edit these files (`assets-page.tsx` is task 15's territory; `exchange-page.tsx`/`trade-dialog.tsx` task 14; `invest-confirm-dialog.tsx`/`project-units-page.tsx` task 13). To avoid merge conflicts, do the primitives + the four nav/kyc/withdraw dialogs first, and migrate the task-13/14/15 files last as a pure import/tag swap (or leave them centered dialogs until those tasks land and note it in the task).
- The `Dialog` "Disponible en marzo" popup is removed in 3.4.

4.4 Unit details (DECISION 3, recommended path): rebuild `apps/wallet/src/components/unit-details-sheet.tsx:34-145` on Radix (`Sheet`/`Dialog` primitives) while preserving its props (`isOpen`, `onClose`, `isExpanded`, …) and visuals: collapsed = bottom card with `pb-[calc(1rem+var(--safe-bottom))]`; expanded = full-screen (`inset-0`) with `pt-[calc(1.5rem+var(--safe-top))]`. This gives focus trap, Esc, `aria-modal`, scroll lock for free. Add `role`/title wiring via a visually hidden `DialogTitle` (title prop already available). Fallback (cheaper): keep the custom div, add `role="dialog" aria-modal="true"`, an Esc listener and body scroll lock.

4.5 Make desktop/mobile switching for unit details consistent: currently `exchange-page.tsx:1158-1166` and `assets-page.tsx:562-570` guard with `!isDesktop && …` while `project-units-page.tsx:592` always shows the sheet (desktop included). Decide once: below `lg` → `UnitDetailsSheet`; at ≥ lg → centered `ResponsiveDialog`-style card (reuse the same body content) — implement by letting `UnitDetailsSheet` render through `ResponsiveDialog` so callers no longer need `!isDesktop &&` guards, and drop those guards (leave `exchange-page.tsx:142-144` "close details when switching to desktop" since it still applies to the inline desktop panel). Rename `UnitDetailsDialog` → `UnitDetails` only if cheap (3 import sites: `exchange-page.tsx:3`, `assets-page.tsx:25`, `project-units-page.tsx:5`); otherwise leave the name and add a comment.

### Phase 5 — Documentation and cleanup

5.1 Add `apps/wallet/docs/responsive.md` (or a section in `docs/plan/wallet-multiplatform.md`) documenting: breakpoint table, "layout in CSS, behavior in `useIsDesktop`" rule, shell CSS variables, safe-area utilities, nav config, responsive overlay usage, z-index ladder (nav 50 → page sticky 50 → overlay 100 → content 110 → stories 9999 → splash 9999).
5.2 Grep for stragglers and confirm no remaining `innerWidth`/`resize`-based detection: `grep -rn "innerWidth\|innerHeight" apps/wallet/src`.
5.3 Update the task's acceptance checklist items when done.

## Files to change (summary)

| File | Change |
|---|---|
| `apps/wallet/src/lib/breakpoints.ts` | new |
| `apps/wallet/src/hooks/use-media-query.ts` | new |
| `apps/wallet/src/hooks/use-is-desktop.ts:5` | rewrite on matchMedia + constant |
| `apps/wallet/src/app/globals.css` | `@theme` breakpoints, shell vars, `@utility pb-safe/pt-safe/h-app-content` |
| `apps/wallet/src/app/layout.tsx` | `viewport` export with `viewportFit: "cover"` |
| `apps/wallet/src/components/dashboard-layout-client.tsx:13-40` | CSS-first shell |
| `apps/wallet/src/components/bottom-nav.tsx:23-253` | shared config, full width, fix Cuenta, safe area |
| `apps/wallet/src/components/desktop-top-nav.tsx:26-221` | shared config, remove `blocked`, wallet link |
| `apps/wallet/src/components/nav/{nav-config.ts,account-dialog.tsx}` | new |
| `apps/wallet/src/lib/story-events.ts` | new; used by `bottom-nav.tsx`, `stories-section.tsx`, `project-detail-page.tsx` |
| `apps/wallet/src/components/responsive-dialog.tsx` | new |
| `packages/ui/src/components/ui/sheet.tsx:24,34` | z-index + blur |
| `apps/wallet/src/components/unit-details-sheet.tsx`, `unit-details-dialog.tsx` | Radix rebuild / responsive switch |
| dialogs listed in 4.3 | swap to `ResponsiveDialog` |
| `apps/wallet/src/components/pages/chat-page.tsx:50`, `tokenization-page.tsx:218` | use shell variables |
| `apps/wallet/src/components/splash-screen.tsx:19-20` | (optional) only gate initial load |

## Out of scope / hand-offs
- Per-screen layout fixes and `h-screen`/`100vh` cleanup in pages → task 17.
- Landscape phone and tiny-window handling (bottom nav height vs. short viewports, `dvh` behavior) → task 18. Note: if DECISION 1 = width-based, landscape phones move from top nav to bottom nav, which is exactly what task 18 must polish.
- Native wrapper status-bar/notch specifics beyond providing `--safe-top/--safe-bottom` and `viewportFit: cover` → `docs/plan/wallet-multiplatform.md`.
- No testing steps included (handled separately).
