---
created: 2026-10-02T20:46:26.804Z
plan: .agelum/work/plans/2026-10-02-landing-page-images-1790974316519.md
status: done
summary: .agelum/work/summaries/2026-10-02-landing-page-images-1790975016552.md
type: task
workflowStatus: done
---

# landing page images

Generate good quality images for the landing page (`apps/landing`). Use the `@agent:image` agent (genmedia / fal.ai).

Currently the landing has no raster images (`apps/landing/public/` does not exist). All visuals are hand-drawn inline SVG illustration components, which are the candidates to be replaced or complemented by generated images.

## Related source code

Page composition and sections:
- `apps/landing/src/app/page.tsx:27` – `Home` page, composes all sections
- `apps/landing/src/app/layout.tsx` – metadata / OG image
- `apps/landing/src/content/es.ts` – landing copy (context for image prompts)
- `apps/landing/src/components/brand-logo.tsx` – logo
- `apps/landing/src/components/sections/hero.tsx:60` – `Hero` (uses `HeroPhone`)
- `apps/landing/src/components/sections/problem.tsx:9` – `Problem` (uses `ProblemBeforeAfter`)
- `apps/landing/src/components/sections/how-it-works.tsx:9` – `HowItWorks` (uses `IconTile`)
- `apps/landing/src/components/sections/inventory.tsx:6` – `Inventory` (uses `BuildingStatus`)
- `apps/landing/src/components/sections/buyer-portal.tsx:16` – `BuyerPortal` (uses `PortalPhone`)
- `apps/landing/src/components/sections/investor-experience.tsx:10` – `InvestorExperience` (uses `InvestorAppMock`, `TrustLoop`)
- `apps/landing/src/components/sections/know-your-buyers.tsx:14` – `KnowYourBuyers` (uses `BuyersReactivation`)
- `apps/landing/src/components/sections/payments.tsx:14` – `Payments` (uses `CryptoCoin`)
- `apps/landing/src/components/sections/launch-day.tsx:9` – `LaunchDay` (uses `LaunchTimeline`)
- `apps/landing/src/components/sections/services.tsx:20` – `Services` (uses `ServiceSetup`, `Service3d`, `ServiceCrm`)
- `apps/landing/src/components/sections/final-cta.tsx:7` – `FinalCta` (uses `Skyline`)

Current SVG illustrations (candidates for generated images):
- `apps/landing/src/components/illustrations/hero-phone.tsx:1`
- `apps/landing/src/components/illustrations/problem-before-after.tsx:1`
- `apps/landing/src/components/illustrations/building-status.tsx:7`
- `apps/landing/src/components/illustrations/portal-phone.tsx:1`
- `apps/landing/src/components/illustrations/investor-app-mock.tsx:32`
- `apps/landing/src/components/illustrations/trust-loop.tsx:1`
- `apps/landing/src/components/illustrations/buyers-reactivation.tsx:9`
- `apps/landing/src/components/illustrations/crypto-coin.tsx:1`
- `apps/landing/src/components/illustrations/launch-timeline.tsx:4`
- `apps/landing/src/components/illustrations/services.tsx:5` (`ServiceSetup`), `:24` (`Service3d`), `:41` (`ServiceCrm`)
- `apps/landing/src/components/illustrations/skyline.tsx:1`
- `apps/landing/src/components/illustrations/icons.tsx:116` – icon set (`IconName`, `Icon`, `IconTile`)

Related task / plan docs:
- `.agelum/work/tasks/doing/landing-page.md`
- `.agelum/doc/docs/plan/landing-copy-2026-oct.md`
- `.agelum/work/tasks/pending/logo.md`