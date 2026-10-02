# Plan: Responsive audit — navigation and app shell

Task: `.agelum/work/tasks/pending/16 Responsive audit: navigation and app shell (5).md`

## Certainty assessment

**Level: Medium-High**

The relevant code is small and fully located: one hook decides the nav mode (`apps/wallet/src/hooks/use-is-desktop.ts:5-20`), one layout consumes it (`apps/wallet/src/components/dashboard-layout-client.tsx:13-36`), and the two navs and two overlay components are self-contained. The root causes of the acceptance-criteria failures are identified from the code, not guessed. Remaining uncertainty is (a) the product decision of which breakpoint values to adopt, and (b) visual behavior at tablet/laptop widths, which has not been run in a browser.

## Ambiguity assessment

**Level: Low**

All open decisions were resolved with the user (see "Resolved decisions" at the end). Original open decisions, now closed:
1. Switch criterion: keep orientation (`innerWidth > innerHeight`) or move to width-based breakpoints (recommended).
2. Breakpoint values, and whether tablet gets the bottom nav, the top nav, or a distinct pattern.
3. Whether the dialog-vs-sheet rule follows the same breakpoint as the nav.
4. How `UnitDetailsSheet` (custom overlay) relates to the `packages/ui` Sheet/Dialog primitives.

Recommended defaults are given for each; confirm before implementation.

## Findings (current state and root causes)

### F1. Nav switch is orientation-based, not width-based
`use-is-desktop.ts:5-20` returns `window.innerWidth > window.innerHeight`. Consequences:
- A phone in landscape, or a tablet in landscape, gets the desktop top nav. A narrow desktop window taller than wide (e.g. 700x900) gets the mobile bottom nav.
- Only a `resize` listener is used; no `orientationchange`/visualViewport handling. Mobile browser URL-bar show/hide changes `innerHeight` and can flip the result near square aspect ratios, causing nav flips while scrolling.
- The name `isDesktop` and the task text ("breakpoint constants in one place") do not match the implementation; there are no breakpoint constants anywhere.

### F2. Hydration flicker / layout jump
- The server snapshot is hard-coded `false` (`use-is-desktop.ts:18`), so SSR and first paint always render the mobile layout (`BottomNav`, `pb-24`). On desktop, the client then swaps to `DesktopTopNav` with `pt-16` after hydration. This is the flicker the acceptance criteria names.
- `dashboard-layout-client.tsx:19,24` adds `transition-all duration-300` to the root and content wrapper, so the swap animates padding visibly instead of snapping.
- JS-only detection cannot be correct on first paint. The fix is to render both navs and switch visibility with CSS media queries (Tailwind breakpoint classes), and keep JS only where behavior (not layout) must differ.

### F3. Safe-area handling is incomplete / likely broken
- `bottom-nav.tsx:90` uses a `pb-safe` class. No `@utility pb-safe` exists in `apps/wallet/src/app/globals.css` (only `@custom-variant` at line 6 and `@theme inline` at line 84), and no plugin was found, so it is likely a no-op. (Verify in the compiled CSS / `packages/ui` styles before changing.)
- `apps/wallet/src/app/layout.tsx:1-34` exports no `viewport` with `viewportFit: "cover"`, so `env(safe-area-inset-*)` evaluates to 0 on iOS regardless. `unit-details-sheet.tsx:53` already uses `env(safe-area-inset-bottom)` and is therefore also ineffective today.
- The main content padding `pb-24` (`dashboard-layout-client.tsx:28`) is a fixed value that does not account for the nav height (h-16 + logo overhang `top:-1.3rem` at `bottom-nav.tsx:~165`) plus safe-area inset.

### F4. Bottom nav width and tablet behavior
- `bottom-nav.tsx:90` caps the bar at `max-w-md` centered via `left-1/2 -translate-x-1/2`. At tablet widths (>448px) it floats as a narrow centered bar while the page content is full-width; the SVG uses `preserveAspectRatio="none"` (`bottom-nav.tsx:~97`), so the bell-curve shape stretches.
- The bottom nav hides on `story-active` events via a window `CustomEvent` (`bottom-nav.tsx:38-52`, dispatched from `components/project/stories-section.tsx:52-69` and `components/pages/project-detail-page.tsx:161-166`). On the desktop top nav there is no equivalent, which is acceptable but should be documented.

### F5. Active-state inconsistencies
- Both navs use exact match `pathname === path` (`bottom-nav.tsx:~56`, `desktop-top-nav.tsx:~55`). Nested routes (e.g. `/exchange/[symbol]`, `/project/...`, `/invest/...`) show no active item.
- Item sets differ: bottom nav = Proyectos, Exchange, Chat, Wallet(/assets), Cuenta; top nav = Proyectos, Exchange, Tokenización, Chat icon, balance, Cuenta. Tokenización is absent on mobile; Wallet (`/assets`) is absent as a link on desktop (only a balance display, not clickable). Top nav marks Proyectos/Exchange `blocked: true` (opens a "Disponible en marzo de 2026" dialog) while bottom nav links them normally. Needs a decision (see Decision 5) or at least documentation.
- Brand color is hard-coded `#5B1187` in top nav instead of `text-primary`.
- Nav item definitions are duplicated between the two components.

### F6. Account dialog duplicated; dialogs vs sheets are inconsistent
- Account dialog is implemented twice: `bottom-nav.tsx:~210-235` and `desktop-top-nav.tsx:~190-215`, both as centered `Dialog` regardless of form factor.
- `UnitDetailsSheet` (`unit-details-sheet.tsx:36-145`) is a hand-rolled fixed overlay (`fixed inset-0 z-100`, bottom-anchored card, no focus trap, no Escape handling, no scroll lock) and is used on **all** form factors by `unit-details-dialog.tsx:224` (despite the "Dialog" file name). It's used from `components/pages/project-units-page.tsx:592`.
- Other overlays use the Radix `Dialog` from `packages/ui` on all form factors with ad-hoc widths: `trade-dialog.tsx:~72` (`w-[calc(100%-2rem)] max-w-[440px]`), `assets-page.tsx:588` (`max-w-md w-[95%]`), `exchange-page.tsx:472` (`max-w-[420px]`), `project-units-page.tsx:623` (`max-w-md`), `invest-confirm-dialog.tsx`, `kyc/kyc-blocked-dialog.tsx`, `desktop-top-nav.tsx` (launch + account).
- `packages/ui/src/components/ui/sheet.tsx` exists (Radix-based) but is unused for this purpose.

### F7. Viewport-height units inconsistent with the shell
- Shell uses `h-dvh overflow-hidden` (`dashboard-layout-client.tsx:19`) but pages use `h-screen`/`min-h-screen`/`calc(100vh-64px)`: `chat-page.tsx:50`, `dashboard-page.tsx:91,104`, `assets-page.tsx:178,189,205`, `project-units-page.tsx:153,163`, `login-page.tsx:26`. On mobile, `100vh` exceeds the visible area and causes overflow/jumps; inside the shell the main scroller already has the right height, so these should be `h-full`/`min-h-full` or `dvh`.
- Only `chat-page.tsx:50` hard-codes `64px`, which matches neither the 56px top nav (`h-14`, `desktop-top-nav.tsx:~124`) nor the bottom nav.
- Top nav is `h-14` (56px) while the layout offsets with `pt-16` (64px) at `dashboard-layout-client.tsx:25` — an 8px mismatch.

## Proposed design (recommended defaults)

**Breakpoint scheme** (width-based, Tailwind-aligned, documented in one place):

| Name | Min width | Navigation | Overlays |
|---|---|---|---|
| mobile | 0 | bottom nav | bottom sheet |
| tablet | `md` 768px | bottom nav (full-width, not capped to `max-w-md`) | centered dialog |
| laptop | `lg` 1024px | top nav | centered dialog |
| desktop | `xl` 1280px | top nav (wider gutters, `max-w-7xl` content) | centered dialog |

Single source of truth: `apps/wallet/src/lib/breakpoints.ts` exporting `BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280 }` (px, matching Tailwind 4 defaults) and `NAV_SWITCH = "lg"`, `OVERLAY_SWITCH = "md"`. Tailwind classes are static (cannot be generated from constants), so the doc comment in this file is the canonical table, and class usage is limited to the `lg:`/`md:` variants named there. JS consumers use `useMediaQuery` built from the same constants.

## Implementation steps

### Phase 1 — Breakpoint source of truth and hook
1. Create `apps/wallet/src/lib/breakpoints.ts` with `BREAKPOINTS`, `NAV_SWITCH_BREAKPOINT`, `OVERLAY_SWITCH_BREAKPOINT`, `minWidthQuery(bp)` helper, and a doc comment holding the table above plus the Tailwind-class mapping rule.
2. Replace `apps/wallet/src/hooks/use-is-desktop.ts` with `apps/wallet/src/hooks/use-media-query.ts`: `useMediaQuery(query)` via `useSyncExternalStore` + `window.matchMedia(query)` (`subscribe` with `addEventListener("change")`, `getSnapshot` = `matches`, `getServerSnapshot` = `false`). Add `useIsNavDesktop()` / `useIsOverlayDialog()` thin wrappers. Remove or re-export `useIsDesktop` and update all importers (only `dashboard-layout-client.tsx:3` currently; re-grep before deleting).
3. Use JS media queries only for behavior that must differ (which overlay component mounts). Layout/nav visibility goes to CSS (Phase 2) to avoid the F2 flicker.

### Phase 2 — App shell without hydration flicker
4. Rewrite `dashboard-layout-client.tsx:13-36`: remove `useIsDesktop`; always render both `<DesktopTopNav />` and `<BottomNav />`; control with classes: `DesktopTopNav` root `hidden lg:flex`, `BottomNav` root `lg:hidden`. Content wrapper `lg:pt-14` (match the real top-nav height; fix the 64 vs 56 mismatch, F7), main `pb-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] lg:pb-0`. Remove `transition-all duration-300` from the shell wrappers (lines 19, 24), keeping only transforms on the bottom nav.
5. Because both navs mount, move data hooks out of the hidden one if it causes duplicate work: `DesktopTopNav` calls `useWalletBalances()` (`desktop-top-nav.tsx:~43`); TanStack Query dedupes by key so this is acceptable, but confirm it doesn't fire an extra request on mobile (same key = shared). Both call `useCurrentUser()`; same reasoning.
6. Extract shared nav config to `apps/wallet/src/components/nav/nav-items.ts` (href, label, icon, `match: "exact" | "prefix"`), consumed by both navs, and an `isNavActive(pathname, item)` helper using prefix matching on segment boundary (`/exchange` active for `/exchange/ABC`). Apply in `bottom-nav.tsx:~56-70` and `desktop-top-nav.tsx:~55-75`. Replace hard-coded `#5B1187` with `text-primary`/`bg-primary` in `desktop-top-nav.tsx` where the token matches (verify token value in `globals.css`).
7. Add `aria-current="page"` to the active link in both navs.

### Phase 3 — Safe area and bottom nav geometry
8. In `apps/wallet/src/app/layout.tsx` add `export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" }` (import `Viewport` from `next`).
9. In `apps/wallet/src/app/globals.css` define `--bottom-nav-h` (nav 4rem + logo overhang) and a `@utility pb-safe { padding-bottom: env(safe-area-inset-bottom); }` (or remove the `pb-safe` usage in favor of an explicit `pb-[env(safe-area-inset-bottom)]`). Also add top inset to the desktop/top header only if the PWA/standalone target requires it (not needed for `lg`+).
10. `bottom-nav.tsx:90`: replace `max-w-md left-1/2 -translate-x-1/2` with full width `inset-x-0` and an inner container `mx-auto max-w-md` (so the bell-curve SVG at `~97-135` keeps a sane aspect ratio at tablet widths while the bar background spans or stays centered per design review). Keep `story-active` hide behavior (`bottom-nav.tsx:38-52`); hide with `translate-y-full` including the safe-area inset so it fully leaves the screen.
11. Make `pb` on `<main>` reference `--bottom-nav-h` so content never sits under the nav on any device.

### Phase 4 — Dialog vs sheet per form factor
12. Create `apps/wallet/src/components/responsive-overlay.tsx` exporting `ResponsiveOverlay` (+ `Header/Title/Description/Footer` re-exports) that renders `Dialog` (from `@repo/ui/components/ui/dialog`) when `useMediaQuery(minWidthQuery(OVERLAY_SWITCH_BREAKPOINT))` is true, else `Sheet side="bottom"` (from `packages/ui/src/components/ui/sheet.tsx`). Server snapshot = mobile (sheet); since overlays are opened by user interaction after hydration, no flicker occurs.
13. Account menu: extract a single `AccountDialog` component (`apps/wallet/src/components/account-overlay.tsx`) using `ResponsiveOverlay`, used by both `bottom-nav.tsx:~210-235` and `desktop-top-nav.tsx:~190-215`; delete the duplicated markup. Lift `kycAction` computation (duplicated at `bottom-nav.tsx:~30` and `desktop-top-nav.tsx:~40`) into it.
14. Launch-notice dialog (`desktop-top-nav.tsx:~165-190`) -> `ResponsiveOverlay` too (it is reachable only at `lg+` today; if Decision 5 unifies blocked items, mobile gains it).
15. Migrate `UnitDetailsSheet` (`unit-details-sheet.tsx:36-145`) so mobile keeps the bottom-card/expand behavior but gains Radix behavior (focus trap, Escape, scroll lock): rebuild on `Sheet side="bottom"` for mobile and `Dialog` for `md+`; keep `isExpanded` full-screen variant (`top-0`) via className. Rename `unit-details-dialog.tsx` -> keep file name to limit churn, but note in the file header that it is the responsive container (renaming optional). Update the `env(safe-area-inset-bottom)` padding at `unit-details-sheet.tsx:53` (works once Phase 3 step 8 is done).
16. Migrate the remaining Radix `Dialog` consumers to `ResponsiveOverlay` where they are form/detail flows: `trade-dialog.tsx:~72` (drop the `data-[state=...]` translate overrides and `rounded-[32px]` on mobile sheet), `invest-confirm-dialog.tsx`, `assets-page.tsx:588`, `exchange-page.tsx:472`, `project-units-page.tsx:623`, `kyc/kyc-blocked-dialog.tsx`. Normalize widths to a small set (`sm` 384px / `md` 448px) via a `size` prop on `ResponsiveOverlay` instead of ad-hoc `max-w-[420px]`/`[440px]`/`w-[95%]`.

### Phase 5 — Viewport units cleanup
17. Replace `h-screen`/`min-h-screen`/`100vh` with `h-full`/`min-h-full` (inside the shell) or `dvh` (outside it, e.g. `login-page.tsx:26`): `chat-page.tsx:50` (`h-[calc(100vh-64px)]` -> `h-full`), `dashboard-page.tsx:91,104`, `assets-page.tsx:178,189,205`, `project-units-page.tsx:153,163`. Confirm each page's parent is a flex/height-bearing container (the `<main>` is `flex-1 min-h-0 overflow-y-auto`, so `h-full` needs `main` to be `flex flex-col` or pages to use `min-h-full`).
18. Check pages that add their own bottom padding for the nav (`invest-page.tsx:135` uses `pb-32`) and remove duplicates now that `<main>` handles nav clearance.

### Phase 6 — Documentation
19. Add `docs/plan/responsive-breakpoints.md` (or a section in `docs/plan/wallet-multiplatform.md`) with the breakpoint table, nav/overlay rules, safe-area rules, and "how to add a page" guidance; link it from the header comment of `lib/breakpoints.ts`. This satisfies "Documented breakpoint scheme used everywhere".

## Files touched (summary)
- New: `apps/wallet/src/lib/breakpoints.ts`, `apps/wallet/src/hooks/use-media-query.ts`, `apps/wallet/src/components/nav/nav-items.ts`, `apps/wallet/src/components/responsive-overlay.tsx`, `apps/wallet/src/components/account-overlay.tsx`, doc file.
- Changed: `use-is-desktop.ts` (removed), `dashboard-layout-client.tsx`, `bottom-nav.tsx`, `desktop-top-nav.tsx`, `unit-details-sheet.tsx`, `unit-details-dialog.tsx`, `app/layout.tsx`, `app/globals.css`, `trade-dialog.tsx`, `invest-confirm-dialog.tsx`, `kyc-blocked-dialog.tsx`, `assets-page.tsx`, `exchange-page.tsx`, `project-units-page.tsx`, `chat-page.tsx`, `dashboard-page.tsx`, `login-page.tsx`, `invest-page.tsx`.

## Cautions
- `bottom-nav.tsx`, `desktop-top-nav.tsx`, `invest-page.tsx`, and other wallet files currently have uncommitted modifications (auth/401 work). Re-read them before editing and keep those changes intact.
- Tailwind 4 requires literal class names; do not build `lg:` classes from the constants at runtime.
- Out of scope: backend/auth tasks, changing which nav items appear per form factor.

## Resolved decisions (confirmed by user)
1. Width-based switching; top nav from `lg` (1024px); tablet (`md`) keeps bottom nav.
2. Overlays: bottom sheet below 768px, centered dialog from `md` up.
3. `UnitDetailsSheet`: rebuild using the shadcn components in `packages/ui` (`sheet.tsx`, `dialog.tsx`), as in Phase 4 step 15. Do not keep the custom overlay.
4. Nav items: share one item config (Phase 2 step 6) but keep the existing differences (Tokenización desktop-only, Wallet mobile-only, "blocked" launch dialog on desktop-only). Do not unify the item sets; only dedupe code, fix prefix active states and add `aria-current`.
