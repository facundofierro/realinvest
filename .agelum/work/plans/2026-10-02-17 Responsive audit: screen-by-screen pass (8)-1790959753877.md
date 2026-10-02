# Plan: Responsive audit — screen-by-screen pass

Task: `.agelum/work/tasks/pending/17 Responsive audit: screen-by-screen pass (8).md`
Depends on: task 16 (app shell / breakpoints / overlays) — already implemented (see `.agelum/work/summaries/2026-10-02-16 Responsive audit: navigation and app shell (5)-1790957357705.md`).

## Certainty assessment
**Level: Medium**

The scope, the files and the shell conventions are clear (task 16 left `lib/breakpoints.ts`, `hooks/use-media-query.ts`, `ResponsiveOverlay`, `--bottom-nav-h`, `pb-safe`). Static grep already surfaced concrete defects (sub-11px type, `min-w-[400px]` panel, `h-screen` inside the shell, stretched SVG charts, 420px fixed hero). However this is a *visual* audit: overflow/clipping/tap-target problems can only be confirmed by rendering at 375/768/1280/1920, and task 16 itself noted the shell was never browser-checked. So the exact fix list below is a well-grounded hypothesis list; the implementer must confirm each in a browser (Chrome tools / `run` skill) and may find more or fewer issues. Several task-file paths do not exist (see "Path corrections").

## Ambiguity assessment
**Level: Low**

The task is clear and the human resolved the open decisions:
1. Type/tap policy: min 11px text (10px only for decorative uppercase micro-labels), interactive targets ≥ 40px.
2. Checklist recorded in `.agelum/doc/docs/plan/responsive-audit-checklist.md`, linked from `responsive-breakpoints.md`.
3. Scope: fixes only (width caps, grids, overflow); no desktop redesigns.
4. "Landing" = `/login` + `/tokenization` (with scroll video).

Remaining uncertainty is only which defects actually reproduce in a browser, which is covered by Phase 0/3.

## Path corrections to the task's "Related Source Code"
All under `apps/wallet/src/components/`:
- `pages/login-page.tsx` ✔ exists; `pages/dashboard-page.tsx`, `invest-page.tsx`, `project-detail-page.tsx`, `project-units-page.tsx`, `assets-page.tsx`, `exchange-page.tsx`, `exchange-detail-page.tsx`, `deposit-page.tsx`, `withdraw-page.tsx`, `tokenization-page.tsx`, `chat-page.tsx` ✔ exist.
- `scroll-video-section.tsx` ✔ (only used by `pages/tokenization-page.tsx:12,540`).
- `exchange/charts.tsx` ✔; related: `exchange/market-stats.tsx`, `exchange/trade-dialog.tsx`, `exchange/view-selector.tsx` (the trade dialog also exists here, contrary to the task 16 summary note).
- Routes live in `app/(dashboard)/{page,assets,chat,deposit,exchange,exchange/[symbol],invest,kyc,project/[id],project/[id]/units,tokenization,withdraw}` and `app/(auth)/login/page.tsx`. KYC (`pages/kyc-onboarding-page.tsx`) is not in the task list but is a screen users hit; include as a bonus row.

## Conventions to reuse (from task 16)
- Breakpoints: `apps/wallet/src/lib/breakpoints.ts:1-34` (nav switches at `lg` 1024; overlays at `md` 768). 375 → mobile, 768 → tablet (bottom nav + dialog), 1280 → laptop/desktop (top nav), 1920 → wide.
- Shell: `components/dashboard-layout-client.tsx:20` — `<main>` is `flex-1 min-h-0 overflow-y-auto overflow-x-hidden`, bottom padding `calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))` below `lg`. Pages are rendered inside a bounded-height scroll container, so **`h-screen`/`min-h-screen` inside pages is wrong** (use `h-full`/`min-h-full`).
- Overlays: use `components/responsive-overlay.tsx` (sizes at `:30-31`, content at `:57`) for any new/modified dialog.
- Tailwind 4 literal class names; shared UI from `@repo/ui/components/ui/*`.

## Phase 0 — Setup and audit harness
1. Start the wallet dev app (see `apps/wallet/README.md`; local domains via Caddy per memory `local-caddy-proxy`). Log in with Google OAuth test account or whatever dev session exists.
2. Use Chrome tools (`resize_window`, screenshots, `javascript_tool`) at 375×812, 768×1024, 1280×800, 1920×1080. Use this snippet in each state to find horizontal overflow:
   `[...document.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,10)` and also check `main`'s `scrollWidth > clientWidth` (main has `overflow-x-hidden`, so overflow is *clipped silently* — compare each page root's `scrollWidth` vs `clientWidth`, not `document.scrollingElement`).
3. Create `.agelum/doc/docs/plan/responsive-audit-checklist.md` with a table: rows = screens (below), columns = 375 / 768 / 1280 / 1920, cell = ✅ / ⚠️ fixed / ❌ + short note. Fill it as each screen is verified. Link it from `responsive-breakpoints.md`.
4. Optionally add a shared tap-target/typography convention note to `responsive-breakpoints.md` (decision 1).

Screens x states to cover: login; dashboard (loading/error/data); invest (list + filters); project detail (all 3 tabs, gallery); project units (3 filters + unit-details sheet/dialog + expanded); assets (empty / with holdings; mobile vs desktop split; trade dialog); exchange list (+ market tabs); exchange detail (line/candles/book views, trade dialog); deposit; withdraw (+ confirm dialog, history); tokenization (hero, sticky sections, scroll video); chat; KYC onboarding (extra).

## Phase 1 — Cross-cutting fixes (do first, they affect many screens)
1. **Sub-11px typography.** ~190 grep hits of `text-[9px]`/`text-[10px]`, concentrated in `invest-page.tsx:272-396`, `project-detail-page.tsx:251,383,477-642`, `project-units-page.tsx:365-517`, `assets-page.tsx:210-531`, `exchange-page.tsx:363-816`. Apply decision 1: raise `text-[9px]` → `text-[11px]` and keep `text-[10px]` only for decorative uppercase micro-labels (or raise to 11px), and ensure `truncate`/`min-w-0` where raising causes overflow. Prefer introducing a single utility (e.g. `@utility text-micro` in `app/globals.css`) over scattering literals.
2. **Tap targets.** Icon buttons at `h-8 w-8` (`chat-page.tsx:53,65,68`, `dashboard-page.tsx` icons) and action buttons `h-9` (`project-detail-page.tsx:642`, `exchange-page.tsx:674,686`) → ≥ `h-10 w-10` on mobile (`h-10 md:h-9` style if desktop density is desired). Filter/tab chips (`project-units-page.tsx:365-385` h-12 OK but `text-[9px]` with `px-1` truncates labels; `exchange-page.tsx:646-658,797-816` `h-10/h-11 px-1/px-2` at 9px) need enough width: allow wrap (`whitespace-normal leading-tight`), or shorten labels at <400px.
3. **Viewport-height misuse inside shell.** Replace `h-screen`/`min-h-screen` with `h-full`/`min-h-full` in: `dashboard-page.tsx:91,104`, `assets-page.tsx:177,188,204`, `exchange-detail-page.tsx:377,395`, `project-detail-page.tsx:196,206`, `project-units-page.tsx:152,162,328`. These cause double scroll / content hidden behind the bottom nav on mobile. Keep `login-page.tsx:26` (outside shell) but switch to `min-h-dvh`. `tokenization-page.tsx:434,537` sticky `h-screen` sections are intentional but must use `h-full`/`dvh` relative to the scroll container — verify on iOS-like 375×667.
4. **Content width cap on wide screens.** Pages without a container (`dashboard-page.tsx`, `deposit-page.tsx:25`, `withdraw-page.tsx`, `chat-page.tsx`, `exchange-detail-page.tsx`) stretch to 1920. Add `mx-auto w-full max-w-*` (form pages `max-w-xl`, dashboard `max-w-7xl` like `invest-page.tsx:135`).
5. **Images / media**: ensure `next/image` `sizes` set where used; `deposit-page.tsx:26` QR `w-48 h-48` fine on 375.

## Phase 2 — Per-screen work (file:line → expected fix; confirm visually first)
- **Login** `pages/login-page.tsx:26-35`: `min-h-screen` → `min-h-dvh`; blurred decorations are `overflow-hidden` ✔; `max-w-sm` ok. Check Google button tap height, 375×667 landscape-ish vertical fit.
- **Dashboard** `pages/dashboard-page.tsx`: `grid-cols-2` at `:169` — verify cards at 375 don't truncate currency values (use `min-w-0 truncate`/smaller `text-xl` at base); add container cap; error state `h-screen`→`h-full`.
- **Invest** `pages/invest-page.tsx`: grids `:166` (2→4 cols) and `:214` (1/2/3) ok; micro text `:272-396`; verify card overlays/badges at 375 and that `overflow-x-hidden` at `:135` is not hiding a real overflow (the clipping hides bugs — find the culprit, then fix it).
- **Project detail** `pages/project-detail-page.tsx`: hero `h-[420px]` (`:270`) → `h-[280px] sm:h-[360px] lg:h-[420px]`, and cap hero/gallery on 1920 (`max-w-5xl mx-auto`, rounded); thumbnail strip `:309` horizontal scroll ok; `TabsList grid-cols-3 h-14` (`:427`) check label truncation at 375; 3-col stat grid `:498-526` at 9px → wrap/stack to 2 cols < 400px; expandable `max-h-[500px]` (`:321`) may clip content on narrow widths → use `max-h-[800px]` or grid-rows trick.
- **Project units** `pages/project-units-page.tsx`: `pb-40` + `min-h-screen` (`:328`) → `min-h-full`, reduce padding (bottom nav padding is now handled by shell); filters `:358-385` (3 cols at 9px, `px-1`) fix per Phase 1.2; list row `:457-517` truncation with `min-w-0`; add `max-w-3xl mx-auto` for wide screens; unit sheet/dialog (`components/unit-details-sheet.tsx`, `unit-details-dialog.tsx`) check expanded full-screen at 768 and 1280.
- **Assets** `pages/assets-page.tsx`: desktop split `:205-207` uses `w-1/3 min-w-[400px]` — at 1024 this leaves 624px and at 1280 fine, but verify the right pane at 1024–1100; mobile branch (`:563` onward) check pie/portfolio sizes, `pb-24/pb-40` leftovers (shell already pads), `text-[9px]` lines `:314,327`; grid `:388`; dialogs already `ResponsiveOverlay`.
- **Exchange list** `pages/exchange-page.tsx`: root `h-full overflow-hidden` (`:436`) — confirm inner lists scroll at 375×667; stats `grid-cols-3` `:484` with 9px labels; tab triggers `:646-658,797-816` (see Phase 1.2); horizontal chip row `:824` fine; desktop pane (`:141,342-350`) check at 1024/1280/1920 for balance between list and detail.
- **Exchange detail** `pages/exchange-detail-page.tsx`: chart wrapper `-mx-4 w-[calc(100%+2rem)]` (`:484`) assumes parent `p-4` — on `md+` with a max-width container this can overflow/misalign; confirm and replace with a container-relative layout. `h-screen` at `:377,395`. Order book + trade dialog sizing at 375.
- **Charts** `components/exchange/charts.tsx`: both `LineChart` (`:21-22,78-80`) and `CandlesChart` (`:204-205,265-267`) use fixed `viewBox 0 0 320 200` with `preserveAspectRatio="none"`, so at 768–1920 the SVG is stretched horizontally: candle bodies, stroke widths (`:306-307`) and SVG `<text>` labels (`:325-345`, fontSize 10) distort. Fix: measure container width with a `ResizeObserver` hook (new `hooks/use-element-size.ts`) and compute `w`/`h` from it, or keep `preserveAspectRatio="xMidYMid meet"` with `vector-effect="non-scaling-stroke"` and render axis labels as HTML overlays. Order book (`:363+`, widths in `%` at `:401-478`) check row text at 375.
- **Deposit** `pages/deposit-page.tsx:25-31`: long address input is `readOnly` mono — ok; add `max-w-xl mx-auto`; warning box wraps; back button `size="icon"` default 40px ok. Note: whole file is minified onto very long lines; don't reformat beyond touched lines.
- **Withdraw** `pages/withdraw-page.tsx`: same container cap; history list truncation of tx hashes/addresses (`truncate`/`break-all`); confirm dialog is `ResponsiveOverlay`? (it still imports raw `Dialog` at `:8` — migrate to `ResponsiveOverlay` for mobile sheet behaviour, or confirm acceptable).
- **Tokenization / landing** `pages/tokenization-page.tsx`: hero `text-[clamp(...)]` + `lg:whitespace-nowrap` (`:239,242`) can overflow at 1024–1100; decorative `lg:translate-x-10` (`:271`) can cause clipped right edge at 1024; absolutely positioned images `-bottom-6 -right-6` (`:395,418`) check clipping on 375; sticky `h-screen` sections `:434,537`.
- **Scroll video** `components/scroll-video-section.tsx:122`: `aspect-[16/9]` fine; verify the scroll-parent detection (`:30-45`) works now that `<main>` is the scroll container, and that text overlays are readable at 375 (font sizes inside fade sections).
- **Chat** `pages/chat-page.tsx`: input bar must sit above bottom nav (shell pads main, but check chat uses its own fixed/sticky bar); icon buttons `h-8 w-8` → 40px; message bubble `max-w` at 375/1920; add width cap.
- **KYC onboarding** `pages/kyc-onboarding-page.tsx` + `components/kyc/*`: quick pass at all four widths.

## Phase 3 — Verification pass and checklist
1. Re-run the overflow snippet and screenshots for every screen x breakpoint after fixes; update the checklist doc with final status and notes for any ⚠️ deferred item.
2. Run `pnpm --filter wallet exec tsc --noEmit` and lint on touched files (no new errors beyond the 2 pre-existing ones in `kyc-locale-context.tsx`, `kyc-onboarding-page.tsx`).
3. Note in the checklist doc / PR description a link to the doc to satisfy the acceptance criterion "Checklist recorded in PR or docs".

## Risks / notes
- `main` has `overflow-x-hidden` (`dashboard-layout-client.tsx:20`) so overflow bugs are invisible; always inspect element `scrollWidth`.
- Many page files contain very long single-line JSX (deposit/withdraw); make minimal, targeted edits.
- Working tree has many uncommitted wallet changes (auth/401, KYC); preserve them.
- Can run in parallel with backend tasks; avoid touching hooks/API layers.
