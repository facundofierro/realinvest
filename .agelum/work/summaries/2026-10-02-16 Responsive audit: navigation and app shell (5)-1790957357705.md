# Summary: Responsive audit — navigation and app shell

## Done (per plan, with the user's resolved decisions)
- **Breakpoints:** new `lib/breakpoints.ts` (table, `NAV_SWITCH_BREAKPOINT=lg`, `OVERLAY_SWITCH_BREAKPOINT=md`, `minWidthQuery`) and `hooks/use-media-query.ts` (`useMediaQuery`, `useIsNavDesktop`, `useIsOverlayDialog`). Removed orientation-based `use-is-desktop.ts`; `exchange-page` and `assets-page` (also importers) now use `useIsNavDesktop`.
- **Shell:** `dashboard-layout-client.tsx` always mounts both navs; CSS (`hidden lg:flex` / `lg:hidden`) chooses. No hydration flicker, removed `transition-all`, top offset fixed to `lg:pt-14` (was 64 vs 56px mismatch).
- **Nav:** shared `components/nav/nav-items.ts` (item sets unchanged per form factor), prefix active matching, `aria-current`. Bottom nav is full-width with an inner `max-w-md`, and hides past the safe area. Brand `#5B1187` kept in the top nav because `--primary` is a different color.
- **Bug fixed along the way:** the "Cuenta" button on the mobile bottom nav was a `#account` link that never opened the dialog; it now opens it.
- **Safe area:** `viewport` with `viewportFit: "cover"`, `@utility pb-safe`, `--bottom-nav-h` in `globals.css`; `<main>` clears the nav using both.
- **Overlays:** new `ResponsiveOverlay` (+ Header/Title/Description/Footer/Close) and a single `AccountOverlay` replacing the two duplicated account dialogs. Launch notice, KYC blocked, invest confirm, and the dialogs in assets/exchange/project-units pages migrated. `UnitDetailsSheet` rebuilt on `packages/ui` Sheet (mobile) / Dialog (md+), keeping the expanded full-screen variant.
- **Viewport units:** `h-screen`/`min-h-screen`/`100vh` replaced with `h-full`/`min-h-full` inside the shell and `dvh` outside; removed duplicate `pb-32` in `invest-page`.
- **Docs:** `docs/plan/responsive-breakpoints.md`.

## Notes / not done
- `trade-dialog.tsx` named in the plan does not exist; the trade dialog lives in `assets-page.tsx` and was migrated there.
- Left `h-screen` in `tokenization-page.tsx` sticky sections (intentional full-viewport sections) and `pb-24`/`pb-40` internal padding in assets/project-units pages; review visually.
- Verification: `tsc --noEmit` passes. ESLint shows 2 pre-existing errors in files I did not touch (`kyc-locale-context.tsx`, `kyc-onboarding-page.tsx`). Not checked in a browser at 375/768/1024/1280 widths — recommended before merging, especially the expanded unit-details dialog (full-screen override on `md+`) and the sheet's animation.
- Existing uncommitted auth/401 changes in `desktop-top-nav.tsx`, `invest-page.tsx` were preserved (balance skeleton kept).
