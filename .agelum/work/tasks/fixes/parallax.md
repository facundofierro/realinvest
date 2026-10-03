---
created: 2026-10-02T21:09:24.833Z
plan: .agelum/work/plans/2026-10-03-parallax-1791016344315.md
status: planned
type: task
workflowStatus: fixes
---

# parallax

Add a parallax effect to the landing page (`apps/landing`).

## Parallax ideas

1. **Hero layered depth (dashboard card vs. phone vs. background gradient)**
   The hero already stacks `DashboardCard`, the floating `HeroPhone` and a radial-gradient background. Move each at a different scroll speed (e.g. background slowest, dashboard card ~0.9x, phone ~1.15x) so the phone appears to float in front of the dashboard as the user scrolls out of the hero.

2. **Skyline rising in the final CTA**
   In the dark `FinalCta` band, translate the `Skyline` illustration upward (and/or scale slightly) as the section scrolls into view so the buildings "rise" behind/under the demo form. Optionally split the skyline into 2-3 layers (far/mid/near buildings) moving at different rates.

3. **Section illustrations drifting vs. text columns**
   In the two-column sections (`Problem`, `Inventory`, `BuyerPortal`, `InvestorExperience`, `LaunchDay`, `KnowYourBuyers`), keep the text static and apply a small vertical offset (±20-40px) to the illustration (`ProblemBeforeAfter`, `BuildingStatus`, `PortalPhone`, `InvestorAppMock`, `LaunchTimeline`, `BuyersReactivation`) based on its position in the viewport. Gives a subtle sense of depth without hurting readability.

4. **Floating decorative shapes / tinted background blobs between sections**
   Add soft purple blurred blobs, coins (`CryptoCoin`) or grid dots as absolutely-positioned decorations in section backgrounds (e.g. `Section` tone `ground`/`white`/`dark`) that move at a different rate than the content, plus a gentle mouse-/scroll-based tilt on the `CryptoCoin` in `Payments`. Creates continuity across section boundaries.

Common constraints for whichever ideas are chosen: respect `prefers-reduced-motion` (already handled in `globals.css`), disable or reduce on mobile/small screens, animate only `transform` (no layout thrash), and use a lightweight approach (CSS `animation-timeline: scroll()`/`view()` with fallback, or a small `IntersectionObserver` + `requestAnimationFrame` client component) — no parallax library is currently installed in `apps/landing/package.json`.

## Related source code

- `apps/landing/src/app/page.tsx:27-54` — page composition; order of all sections inside `<main>`
- `apps/landing/src/app/globals.css:9-14` — `scroll-behavior: smooth` and reduced-motion override
- `apps/landing/src/app/globals.css:144-198` — existing keyframes (`fadeInUp`, `fadeInOut`, `kenBurns`) and reduced-motion rules; place for new parallax CSS
- `apps/landing/src/components/section.tsx:15-44` — `Section` wrapper (tones, padding, container); candidate for background decoration layers
- `apps/landing/src/components/sections/hero.tsx:60-89` — `Hero` (radial-gradient background at line 62, `DashboardCard` at line 83, `HeroPhone` at line 84)
- `apps/landing/src/components/illustrations/hero-phone.tsx` — hero floating phone
- `apps/landing/src/components/sections/final-cta.tsx:7-38` — `FinalCta`; `Skyline` at line 33
- `apps/landing/src/components/illustrations/skyline.tsx:1` — `Skyline` SVG
- `apps/landing/src/components/sections/problem.tsx:19` — `ProblemBeforeAfter` usage
- `apps/landing/src/components/sections/inventory.tsx:22` — `BuildingStatus` usage
- `apps/landing/src/components/sections/buyer-portal.tsx:3` — `PortalPhone` usage
- `apps/landing/src/components/sections/investor-experience.tsx:3-4` — `InvestorAppMock` / `TrustLoop` usage
- `apps/landing/src/components/sections/launch-day.tsx:3` — `LaunchTimeline` usage
- `apps/landing/src/components/sections/know-your-buyers.tsx:1` — `BuyersReactivation` usage
- `apps/landing/src/components/sections/payments.tsx:41` — `CryptoCoin` usage
- `apps/landing/src/components/illustrations/` — all illustration components
- `apps/landing/public/images/` — raster assets (e.g. `final-cta-skyline.webp`, `inventory-building.webp`, `launch-day.webp`) usable as parallax layers
- `apps/landing/package.json:17-19` — dependencies (`next` 16.1.1, `react` 19.2.3; no animation/parallax lib)