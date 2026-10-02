# Plan: Responsive — landscape and small-window edge cases

Task: `.agelum/work/tasks/pending/18 Responsive: landscape and small-window edge cases (3).md`
Builds on tasks 16 (shell/breakpoints/overlays) and 17 (screen pass; touches many of the same page files — coordinate, don't revert its edits).

## Certainty assessment
**Level: Medium-High**

The relevant code is located and small: `ResponsiveOverlay`, `UnitDetailsSheet`, `TradeDialog`, the `@repo/ui` Dialog/Sheet primitives, the bottom nav and the Tauri config. The main defects are visible in the source: the centered `DialogContent` has no height cap or scroll, the Dialog/Sheet swap remounts overlay children, and the bottom nav takes a fixed ~6rem of height. The visual findings still need confirmation in a browser at 320×480, 667×375 and a short desktop window, because task 16 noted the shell was never browser-checked. The Tauri part is trivial: `minWidth`/`minHeight` are already set (800×600), so the only question is the value (see Ambiguity).

## Ambiguity assessment
**Level: Low**

The human resolved the open decisions:
1. Tauri minimum window size: keep the existing 800×600 (`tauri.conf.json:15-16`) and document it. No config value change is needed; Phase 4 is documentation only.
2. Dialog↔Sheet swap: use a single Radix Dialog root and restyle it (bottom sheet vs centered) so children never remount (Phase 1.5 is the chosen approach, not the fallback).

What remains uncertain is which clipping defects reproduce in a browser, which the implementer confirms while working.

## Path corrections to the task's "Related Source Code"
- `apps/wallet/src/hooks/use-is-desktop.ts` does not exist. The hooks are `apps/wallet/src/hooks/use-media-query.ts:7-35` (`useMediaQuery`, `useIsNavDesktop`, `useIsOverlayDialog`) and `apps/wallet/src/lib/breakpoints.ts:1-34`.
- `native/wallet/tauri/src-tauri` → the config file is `native/wallet/tauri/src-tauri/tauri.conf.json` (window at `:15-24`).
- `apps/wallet/src/components/unit-details-dialog.tsx` is the content builder. It wraps `UnitDetailsSheet` (`:224`, closes at `:387`) and holds `isExpanded`/`activeTab` state (`:49-52`). It is used only by `pages/project-units-page.tsx:5`.
- The task's list omits other overlays that also need the short-height pass:
  - `components/responsive-overlay.tsx`
  - `components/invest-confirm-dialog.tsx:92`
  - `components/kyc/kyc-blocked-dialog.tsx`
  - `components/account-overlay.tsx`
  - the raw `Dialog` in `pages/withdraw-page.tsx:8,48` (confirm dialog)
  - `components/exchange/trade-dialog.tsx`

## Root causes / observations
1. **Centered Dialog cannot scroll.** `packages/ui/src/components/ui/dialog.tsx:41` — `DialogContent` is `fixed top-[50%] translate-y-[-50%] grid … p-6` with no `max-h` or `overflow`. When the window height is shorter than the content (e.g. 768×400 or a landscape tablet in split-view), the top and bottom, including the action buttons, are clipped and unreachable. `ResponsiveOverlay`'s dialog branch (`responsive-overlay.tsx:42-48`) passes no height cap either.
2. **Sheet height.** `responsive-overlay.tsx:57` caps the sheet at `max-h-[90dvh] overflow-y-auto`. That is fine at 375 tall, but the footer is not sticky, so actions scroll off. `TradeDialog` (`exchange/trade-dialog.tsx:78,85`) is a raw centered `Dialog` at all widths, with `max-h-[85dvh]` on an inner div while `DialogContent` has `overflow-hidden` — at 320×480 plus a keyboard this clips the footer. The `85dvh` must be paired with an iOS-keyboard-safe strategy.
3. **Expanded unit view.** `unit-details-sheet.tsx:116-120` uses `h-dvh max-h-dvh p-0` for expanded mode, with children `flex-1 overflow-hidden min-h-0` (`:104-106`). The content inside is `overflow-hidden`, so in landscape 667×375 the tab content (floor plan, etc. in `unit-details-dialog.tsx`) is clipped, not scrollable. The header has `min-h-[100px]` (`:67`), which takes 27% of a 375px viewport.
4. **State loss on resize across breakpoints.**
   - `ResponsiveOverlay` (`:40-65`) and `UnitDetailsSheet` (`:123-160`) return different component trees (Dialog vs Sheet) at `md`, so React unmounts and remounts all children. Local state inside overlay children is lost (e.g. `InvestConfirmDialog` is safe only because its `step`/`tokenAmount` live in the parent-level component at `:32-35`; any child-owned input, scroll position or focus is lost).
   - `useMediaQuery`'s server snapshot is `false` (`use-media-query.ts:23`), so the first client render is always "mobile"; resizing or hydration flickers the overlay type.
   - `TradeDialog` and `UnitDetailsDialog` keep `isExpanded`/`activeTab` in the component above the swap, so those survive; verify nothing else is held in the swapped subtree.
   - Main shell: `dashboard-layout-client.tsx:20` swaps `BottomNav` / `DesktopTopNav` via CSS (`lg:hidden`, `bottom-nav.tsx:49`), so no remount there. Pages that branch with JS (`useIsNavDesktop` — grep for it; `assets-page.tsx` desktop split vs mobile branch) remount their subtree on crossing 1024 and lose local state (selected asset, filters, scroll).
5. **Bottom nav in short viewports.** `bottom-nav.tsx:109` has `h-16` plus a `w-36 h-36` center button (`:145-148`) plus `--bottom-nav-h: 6rem` (`app/globals.css:14`). At 375px tall (landscape) it eats ~25% of the screen and `<main>` bottom padding (`dashboard-layout-client.tsx:20`) grows with it. A `max-w-md` container (`:52`) is fine for widths. The `story-active` event (`:21-40`) already hides the nav; there is no height-based rule.
6. **Viewport meta.** `app/layout.tsx:21-25` has `viewportFit: "cover"` but no `interactiveWidget`; keyboard behaviour on Android differs from iOS. Safe-area insets are handled only vertically in places (`pb-safe`). Landscape notches need left/right inset padding (`env(safe-area-inset-left/right)`).

## Phase 1 — Fix the primitives (applies to all overlays)
1. `packages/ui/src/components/ui/dialog.tsx:41` (`DialogContent`): add `max-h-[calc(100dvh-2rem)] overflow-y-auto` (use `dvh`, with `vh` as fallback via a prior class if desired). Check that the close button (`:44+`, absolute positioned) remains reachable; if it scrolls away, make it `sticky` or keep the scroll on an inner wrapper. Check consumers that already set `overflow-hidden` (`exchange/trade-dialog.tsx:78`) and resolve the conflict (child classes win via `cn`).
2. `packages/ui/src/components/ui/sheet.tsx:34-40` (bottom variant): add `max-h-[100dvh]` default and `overflow-y-auto` so every consumer, not only `ResponsiveOverlay`, is bounded. Keep `ResponsiveOverlay`'s `90dvh` override.
3. `responsive-overlay.tsx:42-48`: on the dialog side add `max-h-[calc(100dvh-2rem)] overflow-y-auto`. For the sheet, add a landscape rule: `landscape:max-h-[100dvh] landscape:rounded-none` for short heights (Tailwind 4 `landscape:` variant, or an arbitrary `[@media(max-height:480px)]:` variant), and left/right safe-area padding (`pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]`).
4. Make footers reachable: in `ResponsiveOverlayFooter` (`responsive-overlay.tsx:76-78`) add optional sticky behaviour (`sticky bottom-0 bg-background`) so primary actions stay visible while the body scrolls.
5. **Preserve state across the Dialog↔Sheet swap.** Preferred approach: render a single Radix `Dialog` root and switch only the *content classes* (bottom-anchored sheet vs centered) based on `useIsOverlayDialog()`, so children are never unmounted. Implement it in `ResponsiveOverlay` (`:40-65`) using `Dialog`/`DialogContent` with variant classes (bottom: `inset-x-0 bottom-0 top-auto translate-x-0 translate-y-0 rounded-t-3xl`; md+: current centered classes) and drop the `Sheet` branch. Apply the same to `unit-details-sheet.tsx:123-160`. If that is too invasive, fallback: lift all child-owned state into the parent (document which). Check animations (`slide-in-from-bottom` vs zoom) are acceptable.
6. `use-media-query.ts:20-24`: replace the `() => false` server snapshot concern only if hydration flicker is visible; otherwise leave it.

## Phase 2 — Per-component fixes
- `components/unit-details-sheet.tsx`
  - `:67` reduce header `min-h-[100px]` to `min-h-0` below `[@media(max-height:480px)]`.
  - `:104-106` the expanded children wrapper: change `overflow-hidden` to `overflow-y-auto` (or make the inner tab panels scroll in `unit-details-dialog.tsx` — find the expanded content around `:224-387`) so floor-plan/details can scroll at 375px tall.
  - `:116-120`: expanded mode already uses `h-dvh`; add safe-area insets (`pt-[env(safe-area-inset-top)]`) and left/right insets for landscape notches.
  - `:154` non-expanded sheet `max-h-[90dvh]` → keep; ensure `actions` (`:109` wrapper `shrink-0 mt-auto`) stays visible (sticky).
- `components/unit-details-dialog.tsx`: confirm `useState` at `:49-52` is above the `SheetCtx` swap (it is). Check long tab content (`:224-387`) wraps within `min-w-0` at 320px; no fixed widths.
- `components/exchange/trade-dialog.tsx:74-85`: migrate to `ResponsiveOverlay` (it uses `size`/`className`; keep `max-w-[440px]` and `rounded-[32px]` for md+) or at least replace `overflow-hidden` + inner `max-h-[85dvh]` with a single scroll container and a sticky action footer (`:290-305` area). Verify the amount input remains visible with the on-screen keyboard (`interactiveWidget: "resizes-content"` in viewport, see below).
- `components/invest-confirm-dialog.tsx:92-116`, `kyc/kyc-blocked-dialog.tsx`, `account-overlay.tsx`: already use `ResponsiveOverlay`; confirm they pick up Phase 1 fixes, remove any inner `max-h`/`overflow-hidden` that fights them.
- `pages/withdraw-page.tsx:8,48`: migrate the confirm `Dialog` to `ResponsiveOverlay` (long single-line JSX — minimal edit; touch only the dialog block).
- `components/bottom-nav.tsx`
  - Add a short-viewport variant: when `(max-height: 480px)` and `lg:hidden` applies, shrink `h-16` → `h-12`, center button `w-36 h-36`/`w-32 h-24` → ~`w-20 h-16`, and hide labels. Define a CSS custom property override in `app/globals.css` (`@media (max-height: 480px) { :root { --bottom-nav-h: 3.5rem } }` next to `--bottom-nav-h: 6rem` at `:14`) so `<main>` padding in `dashboard-layout-client.tsx:20` follows automatically.
  - Add left/right safe-area padding on the `<nav>` (`:109`).
- `app/layout.tsx:21-25`: add `interactiveWidget: "resizes-content"` to `viewport` (supported in Next's `Viewport` type).
- `app/globals.css`: add a small `@custom-variant short (@media (max-height: 480px))` (Tailwind 4) so components can use `short:` classes instead of repeating the arbitrary query; document it in `lib/breakpoints.ts` header table (add a "short height" row, e.g. `export const SHORT_VIEWPORT_MAX_HEIGHT = 480`).
- Min-width audit at 320px: with 320 wide, check `bottom-nav.tsx:52` (`max-w-md w-full`), dashboard/invest grids (`grid-cols-2`), and header rows for `min-w-0`/`truncate`. Only fix what overflows; task 17 owns the general screen pass.

## Phase 3 — State preservation across breakpoints (pages)
1. `grep -rn "useIsNavDesktop\|useMediaQuery" apps/wallet/src` and list every place where a JS media query swaps subtrees (`assets-page.tsx`, `exchange-page.tsx` desktop pane at `:141,342-350`, `desktop-top-nav.tsx`).
2. For each, prefer CSS (`hidden lg:block` / `lg:hidden`) over conditional rendering where the two branches can share state, or lift the state (selected symbol, filters, tab) into the parent / URL search params so remount does not lose it.
3. Confirm the charts (`exchange/charts.tsx`, `hooks/use-element-size.ts`) rescale on resize without resetting the selected timeframe/view (state in `exchange-detail-page.tsx`).

## Phase 4 — Tauri minimum window size
1. File: `native/wallet/tauri/src-tauri/tauri.conf.json:15-24` (`app.windows[0]`) — `minWidth: 800`, `minHeight: 600` already exist. Apply the decision from the Ambiguity section: keep (and add a comment-free JSON; document the rationale in `.agelum/doc/docs/plan/wallet-multiplatform.md` or `responsive-breakpoints.md`), or lower to ~480×500 if the compact layouts must be reachable on desktop.
2. If lowered: make sure the web layout is usable at that minimum (Phases 1-2) and that the initial `width/height` (1200×800) remain.
3. Document the rule in `.agelum/doc/docs/plan/responsive-breakpoints.md`: supported minimum sizes (web 320×480, landscape phone 667×375, Tauri min), the `short:` variant, and the one-root overlay approach.
4. Capacitor (`native/wallet/capacitor/capacitor.config.ts`) needs no change (iOS `scrollEnabled: false`); note split-view tablets resize the webview and are covered by the Phase 1-3 resize handling.

## Risks / notes
- Changing `packages/ui` Dialog/Sheet defaults affects every consumer, including the admin/other apps; grep `@repo/ui/components/ui/dialog` and `sheet` across `apps/*` and check none depend on unbounded height.
- The Phase 1.5 single-root approach changes enter/exit animations; keep the existing animation classes where possible.
- The working tree has many uncommitted wallet edits (tasks 16/17, auth); don't revert them, and keep edits minimal in the long single-line files (`withdraw-page.tsx`, `deposit-page.tsx`).
- Browser verification (Chrome tools, `resize_window`) at 320×480, 667×375, 375×667, 768×400, 1024×600 is how the implementer should confirm each item; formal testing is handled separately.
