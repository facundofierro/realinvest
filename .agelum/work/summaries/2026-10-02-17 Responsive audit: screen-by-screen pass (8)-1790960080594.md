# Summary: Responsive audit — screen-by-screen pass

Static (code-level) pass implemented in `apps/wallet`. **Not verified in a browser** (no dev session/auth run); every checklist cell is marked ⏳ for visual confirmation. `tsc --noEmit` passes.

## Changes
- Typography: `text-[9px]` → `text-[11px]`; `text-[10px]` → `11px` except lines with `uppercase` (invest, project detail/units, assets, exchange list/detail, unit-details, exchange/*). SVG chart label fontSize 10 → 11.
- Viewport units: `h-screen`/`min-h-screen` → `h-full`/`min-h-full` in dashboard, project detail/units, assets, exchange, exchange detail; login and require-session → `min-h-dvh`; tokenization sticky sections → `h-dvh`. Removed `pb-40` on project units.
- Width caps: dashboard `max-w-7xl`, deposit/withdraw `max-w-xl`, chat `max-w-3xl`.
- Tap targets: chat icon buttons 40px; project detail and exchange action buttons `h-10 md:h-9`.
- Project detail: hero `h-[280px] sm:h-[360px] lg:h-[420px]`; expandable `max-h-[900px]`.
- Charts: new `hooks/use-element-size.ts`; `LineChart`/`CandlesChart` now size the SVG to its container instead of stretching a 320×200 viewBox.
- Docs: `docs/plan/responsive-audit-checklist.md`, linked from `responsive-breakpoints.md`.

## Not done / deferred
- Browser verification at 375/768/1280/1920 and overflow-snippet checks.
- Exchange detail width cap (full-bleed dark gradient; `-mx-4` chart wrapper left as is).
- Withdraw confirm dialog still uses raw `Dialog`, not `ResponsiveOverlay`.
- Tokenization hero overflow at 1024–1100, scroll-video parent detection, project-detail 3-col stat grid at <400px, assets split pane at 1024, KYC pass, `text-micro` utility (literals used instead).
