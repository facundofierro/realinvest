# Summary — Responsive: landscape and small-window edge cases (3)

Plan: `.agelum/work/plans/2026-10-02-18 Responsive: landscape and small-window edge cases (3)-1790962481143.md`
Pre-check: Certainty Medium-High, Ambiguity Low, so implementation went ahead without questions.

## Changes

### Phase 1: primitives
- `packages/ui/src/components/ui/dialog.tsx`: `DialogContent` takes a new `layout` prop: `"center"` (the default, same look as before), `"bottom"` (sheet) or `"fullscreen"`. Every layout is capped to the viewport and scrolls internally. `center` is `max-h-[calc(100dvh-2rem)] overflow-y-auto`, which fixes the clipped, unscrollable centered dialogs on short windows. Additive: the admin consumer is unaffected and its own `max-h-[90vh]` still wins.
- `packages/ui/src/components/ui/sheet.tsx`: the bottom variant is bounded (`max-h-dvh overflow-y-auto`).
- `components/responsive-overlay.tsx`: rewritten to use **one Radix Dialog root**, swapping only layout classes (`center` at md+, `bottom` below md). Resizing across md no longer remounts children. Exported `SHEET_LAYOUT_CLASS`: `90dvh`, left/right safe-area padding, and `short:max-h-dvh short:rounded-none`. Header, Title, Description and Close always use the Dialog components; only their classes differ. `ResponsiveOverlayFooter` gains an opt-in `sticky` prop.
- `components/unit-details-sheet.tsx`: single Dialog root as well. Collapsed state uses `bottom` or `center`, expanded uses `fullscreen`, so toggling `isExpanded` or crossing md keeps the same node. Expanded view:
  - adds top/left/right/bottom safe-area insets.
  - On short viewports the whole view scrolls (`short:h-auto`, children `short:overflow-visible`), and the header shrinks (`short:min-h-0`, smaller gaps and top padding).
  - On tall viewports the original fill-height layout with internally scrolling tab panels is kept.
  - Actions are `sticky bottom-0`.

### Phase 2: per-component
- `components/exchange/trade-dialog.tsx`: migrated to `ResponsiveOverlay` (bottom sheet on mobile, `md:max-w-[440px] md:rounded-[32px]` dialog at md+). Dropped `overflow-hidden` and the inner `max-h-[85dvh]` in favor of a single scroll container, and the confirm button is now a sticky footer with bottom safe-area padding.
- `components/pages/withdraw-page.tsx`: the confirm `Dialog` is replaced by `ResponsiveOverlay` with a sticky footer (single-line JSX edit only).
- `invest-confirm-dialog`, `kyc-blocked-dialog`, `account-overlay`: no change needed; they pick up the Phase 1 fixes.
- `components/bottom-nav.tsx`: `short:` variant with a 48px bar, smaller logo (`w-20`), labels `sr-only`, smaller side gaps, and left/right safe-area padding on the `<nav>`. The inline `style={{top}}` became classes so `short:` can override it.
- `app/globals.css`:
  - adds `@custom-variant short (@media (max-height: 480px))`.
  - adds `@media (max-height: 480px) { :root { --bottom-nav-h: 3.5rem } }`, so `<main>` padding follows automatically.
- `app/layout.tsx`: `viewport.interactiveWidget = "resizes-content"`.
- `lib/breakpoints.ts`: `SHORT_VIEWPORT_MAX_HEIGHT = 480`, plus a header note on the short variant and the supported minimum sizes.

### Phase 3: state across breakpoints
- Overlays: fixed by the single-root approach above (verified in the browser, see below).
- Pages: `assets-page.tsx` and `exchange-page.tsx` hold their selection, tab, timeframe and trade state at page level, above the `useIsNavDesktop` branch, so it survives crossing 1024px. Only scroll position inside the swapped subtree resets. No change made.
- `use-media-query.ts` server snapshot is unchanged: hydration only changes classes now, with no remount.

### Phase 4: Tauri
- `tauri.conf.json` is unchanged; the 800×600 minimum was kept, as decided. Documented in `docs/plan/responsive-breakpoints.md`. That file also gained:
  - a "Supported minimum sizes" table (web 320×480, phone landscape 667×375, Tauri 800×600)
  - the `short:` variant rule
  - the single-root overlay rule and the overlay height/sticky-footer rule
  - the Capacitor split-view note.

## Verification
- `tsc --noEmit` is clean for wallet, `@repo/ui` and admin. ESLint is clean on the changed wallet files.
- Browser check (Chrome, app rendered in same-origin iframes because the window could not be resized):
  - 667×375 and 320×480: compact bottom nav applied (`--bottom-nav-h` 3.5rem, labels hidden).
  - Account overlay at 667×375: bottom sheet, full height, square corners. Resizing the frame to 900 wide with the overlay open switched it to a centered dialog **with the same DOM node** (marker property kept), so there was no remount.
  - Unit details (exchange list) at 667×375: the sheet fits. Expanding ("UNIDAD") kept the same node; content scrolls (scrollHeight 762 > 371) and the actions stay pinned. At 667×700 the original layout is kept (fills the viewport, tab panel scrolls internally).
- **Not verified in the browser:** the trade dialog and the withdraw confirm. The exchange detail page shows "Failed to fetch order book" locally, and the test account's KYC is incomplete, so trading is gated. Type-checked only.

## Notes / follow-ups
- Overlay z-index: sheets now use the dialog stack (`z-[100]`/`z-[110]`) instead of the Sheet's `z-50`, which is still above the bottom nav (`z-50`).
- The close button scrolls with the content in tall centered dialogs. Escape and overlay click still close it.
- Other uncommitted edits from tasks 16/17 in the same files were left as they were.
