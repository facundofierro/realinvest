---
created: 2026-10-02T20:14:40.402Z
status: done
summary: .agelum/work/summaries/2026-10-02-logo-1790972209677.md
type: task
workflowStatus: done
---

# logo

Create a new logo for the new domain of the project, **vest-realestate.com**.

## Related source code

Logo component (current brand mark):
- `packages/ui/src/components/brand/vest-logo.tsx:5` — `VestLogoProps` type
- `packages/ui/src/components/brand/vest-logo.tsx:11` — `VestLogo` component

Usages of `VestLogo`:
- `apps/wallet/src/components/bottom-nav.tsx:10` — import
- `apps/wallet/src/components/bottom-nav.tsx:146` — rendered in the bottom nav
- `apps/admin/src/components/admin-bottom-nav.tsx:16` — import
- `apps/admin/src/components/admin-bottom-nav.tsx:170` — rendered in the admin bottom nav
- `apps/test/src/app/page.tsx:2` — import (logo gallery, variants at line 8, rendered at line 88)
- `apps/test/src/app/test/page.tsx:1` — import (variants rendered at lines 16, 24, 31, 38, 78)

Layout related to logo size (nav logo overhang):
- `apps/wallet/src/app/globals.css:16`

Logo / icon image assets to replace:
- `apps/wallet/public/cnv-logo.png`
- `apps/wallet/src/app/favicon.ico`
- `apps/test/src/app/favicon.ico`
- `native/wallet/tauri/src-tauri/icons/` — `icon.png`, `icon.icns`, `icon.ico`, `Square*Logo.png`, `StoreLogo.png`
- `apps/wallet/public/landing/` — check for logo usage on the landing page