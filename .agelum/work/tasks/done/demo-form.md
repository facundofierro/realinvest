---
created: 2026-10-03T07:43:43.257Z
status: done
summary: .agelum/work/summaries/2026-10-03-demo-form-1791013612524.md
type: task
workflowStatus: done
---

# demo form

In the demo form, change the combo box ("Cantidad de proyectos" native `<select>`) to use the shadcn component, and add "Tokenización" to the interest checkboxes.

## Related source code

- `apps/landing/src/components/sections/demo-form.tsx:145-160` — native `<select id="demo-proyectos">` to replace with the shadcn Select
- `apps/landing/src/components/sections/demo-form.tsx:165-180` — interest checkboxes rendered from `demoForm.interestOptions`
- `apps/landing/src/content/es.ts:347-380` — `demoForm` copy: `fields`, `projectOptions` (line 360), `interestOptions` (line 365)
- `apps/landing/src/lib/demo-request-schema.ts:3` — `projectCounts` enum (validated by the `proyectos` field, line 43)
- `apps/landing/src/lib/demo-request-schema.ts:5-11` — `interestOptions` list; must include "Tokenización" (validated at line 46, so it must match the copy in `es.ts`)
- `apps/landing/src/lib/submit-demo-request.ts` — client submit of the form
- `apps/landing/src/app/api/demo-request/route.ts` — API route consuming the schema
- `packages/ui/src/components/ui/select.tsx` — existing shadcn Select in the shared UI package
- `apps/landing/src/content/es.ts:4` — header comment states "no tokenization/marketplace/founders content" (copy rule to revisit when adding "Tokenización")