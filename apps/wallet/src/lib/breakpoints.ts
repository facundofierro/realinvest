/**
 * Responsive breakpoint scheme for the wallet app (single source of truth).
 * See docs/plan/responsive-breakpoints.md.
 *
 * | Name    | Min width    | Navigation                | Overlays        |
 * |---------|--------------|---------------------------|-----------------|
 * | mobile  | 0            | bottom nav                | bottom sheet    |
 * | tablet  | md  (768px)  | bottom nav                | centered dialog |
 * | laptop  | lg  (1024px) | top nav                   | centered dialog |
 * | desktop | xl  (1280px) | top nav                   | centered dialog |
 *
 * Tailwind class names must be literal, so they cannot be generated from
 * these constants. Layout/nav visibility uses the `lg:` variant
 * (NAV_SWITCH_BREAKPOINT) and overlays use `md:` (OVERLAY_SWITCH_BREAKPOINT).
 * JS consumers (behavior that must differ, e.g. which overlay mounts) use
 * `useMediaQuery(minWidthQuery(...))` from the same constants.
 *
 * Short height: viewports at most SHORT_VIEWPORT_MAX_HEIGHT tall (landscape
 * phones, small desktop windows) get the `short:` Tailwind variant (defined
 * in app/globals.css): compact bottom nav, full-height sheets, smaller headers.
 *
 * Supported minimums: web 320x480, landscape phone 667x375, Tauri window
 * 800x600 (tauri.conf.json minWidth/minHeight).
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export const NAV_SWITCH_BREAKPOINT: Breakpoint = "lg";
export const OVERLAY_SWITCH_BREAKPOINT: Breakpoint = "md";

/** Max viewport height (px) for the `short:` variant. */
export const SHORT_VIEWPORT_MAX_HEIGHT = 480;

export function minWidthQuery(bp: Breakpoint) {
  return `(min-width: ${BREAKPOINTS[bp]}px)`;
}
