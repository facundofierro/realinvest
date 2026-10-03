---
created: 2026-10-03T09:14:30.325Z
plan: .agelum/work/plans/2026-10-03-logo-vest-real-state-1791019575869.md
status: done
summary: .agelum/work/summaries/2026-10-03-logo-vest-real-state-1791019746320.md
type: task
workflowStatus: done
---

# logo vest real state

In the header there is a top-left "Vest" logo. Try showing the full logo, with the text "REAL ESTATE" placed below the logo wordmark, since the full brand name is "Vest Real Estate". Evaluate how it looks.

## Related source code

- `apps/landing/src/components/brand-logo.tsx:5-20` – `BrandLogo` wrapper; passes `showSubtitle={false}` (line 14) and a cropped `viewBox="30 79 140 62"` (line 16) that excludes the subtitle area.
- `apps/landing/src/components/site-header.tsx:12` – `BrandLogo` import.
- `apps/landing/src/components/site-header.tsx:21` – header logo (desktop, top-left).
- `apps/landing/src/components/site-header.tsx:58` – logo in the mobile menu.
- `apps/landing/src/components/site-footer.tsx:16` – footer logo (`white`); same component, so it is affected too.
- `packages/ui/src/components/brand/vest-logo.tsx:14-18` – `VestLogoProps` (`showSubtitle`, `forceWhite`).
- `packages/ui/src/components/brand/vest-logo.tsx:27-32` – `WITH_SUBTITLE` paths (includes the `sub` "REAL ESTATE" path at line 31, y ≈ 134–141).
- `packages/ui/src/components/brand/vest-logo.tsx:36-41` – `WITHOUT_SUBTITLE` paths (lockup shifted lower, no subtitle).
- `packages/ui/src/components/brand/vest-logo.tsx:49-51` – selection of paths based on `showSubtitle`.
- `packages/ui/src/components/brand/vest-logo.tsx:61-65` – `aria-label` ("Vest Real Estate" vs "Vest").
- `packages/ui/src/components/brand/vest-logo.tsx:95-100` – conditional render of the subtitle path.
- `packages/ui/src/assets/brand` – static logo files (referenced in the component docblock, lines 9-11).