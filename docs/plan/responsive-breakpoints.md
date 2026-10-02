# Responsive breakpoints (wallet)

Source of truth: `apps/wallet/src/lib/breakpoints.ts`.

| Name | Min width | Navigation | Overlays |
|---|---|---|---|
| mobile | 0 | bottom nav | bottom sheet |
| tablet | `md` 768px | bottom nav | centered dialog |
| laptop | `lg` 1024px | top nav | centered dialog |
| desktop | `xl` 1280px | top nav | centered dialog |

## Rules
- **Width-based, never orientation-based.** Nav visibility is pure CSS: `DesktopTopNav` is `hidden lg:flex`, `BottomNav` is `lg:hidden`; both always mount, so first paint has no hydration flicker. Tailwind classes must be literal; use only `lg:` for nav and `md:` for overlays.
- **JS media queries** (`useMediaQuery`, `useIsNavDesktop`, `useIsOverlayDialog` in `hooks/use-media-query.ts`) only for behavior that must differ (e.g. which overlay mounts, page layout variants). Server snapshot is `false` (mobile).
- **Overlays:** use `ResponsiveOverlay` (`components/responsive-overlay.tsx`) — sheet below `md`, dialog from `md`. Use `size="sm" | "md"` instead of ad-hoc max-widths. Both modes share **one Radix Dialog root** (`DialogContent layout="bottom" | "center" | "fullscreen"` in `@repo/ui`) and only swap classes, so resizing across `md` never remounts overlay children (local state, focus and scroll survive). Don't build overlays that swap component trees at a breakpoint.
- **Overlay height:** every `DialogContent` layout is capped to the viewport (`center`: `100dvh-2rem`, sheet: `90dvh`, `100dvh` when short) and scrolls internally. Pin primary actions with `ResponsiveOverlayFooter sticky` (or a `sticky bottom-0 bg-background` wrapper) so they stay reachable on short screens and with the keyboard open. `viewport.interactiveWidget = "resizes-content"` makes Android shrink `dvh` with the keyboard.
- **Nav items:** shared in `components/nav/nav-items.ts`; active state uses `isNavActive` (prefix on segment boundary) and `aria-current="page"`.
- **Short height:** `short:` Tailwind variant = `(max-height: 480px)` (`app/globals.css`, `SHORT_VIEWPORT_MAX_HEIGHT` in `lib/breakpoints.ts`). Used for landscape phones and small windows: compact bottom nav (`--bottom-nav-h` drops to 3.5rem, labels become sr-only), full-height sheets, smaller overlay headers, and the expanded unit view scrolls as a whole.
- **Safe area:** `viewport.viewportFit = "cover"` in `app/layout.tsx`; bottom nav uses `pb-safe` plus left/right `env(safe-area-inset-*)` padding for landscape notches (sheets and the expanded unit view too); `<main>` clears the nav with `pb-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] lg:pb-0`. Pages must not add their own nav clearance.
- **Heights:** inside the shell use `h-full`/`min-h-full`; outside it use `dvh`. Never `100vh`/`h-screen`.
- The bottom nav hides on the `story-active` window event; the top nav has no equivalent.

## Supported minimum sizes
| Target | Minimum |
|---|---|
| Web (portrait) | 320×480 |
| Phone landscape | 667×375 (uses `short:`) |
| Tauri desktop window | 800×600 — `minWidth`/`minHeight` in `native/wallet/tauri/src-tauri/tauri.conf.json`; kept on purpose, so a desktop window always gets the tablet layout (bottom nav + centered dialogs) at minimum and the top nav from 1024px. |

Capacitor needs no config change: split-view tablets resize the webview, which goes through the same width/height breakpoints and the single-root overlays.

## Adding a page
Render inside the dashboard layout, avoid fixed viewport heights and nav padding, and use `ResponsiveOverlay` for dialogs.

## Audit checklist

Per-screen status: [responsive-audit-checklist.md](./responsive-audit-checklist.md).
