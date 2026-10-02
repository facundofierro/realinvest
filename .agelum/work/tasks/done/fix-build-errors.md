---
created: 2026-10-02T13:00:43.553Z
status: done
summary: .agelum/work/summaries/2026-10-02-fix-build-errors-1790946149711.md
type: task
workflowStatus: done
---

# fix build errors


## Related source code

- `apps/wallet/src/components/pages/login-page.tsx:84` — the `"use client"` directive appears after component code, causing the Turbopack build error. Move it to the top of the file.
- `apps/wallet/src/app/(auth)/login/page.tsx` — imports the affected login page as a Server Component (per the build import trace).

## Possible reasons

- The `"use client"` directive was added or left at the end of the file instead of at the beginning, before other expressions.