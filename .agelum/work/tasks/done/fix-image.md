---
created: 2026-10-02T22:04:48.941Z
status: done
summary: .agelum/work/summaries/2026-10-02-fix-image-1790978782143.md
type: task
workflowStatus: done
---

# fix image

Fix the faded-out edges of the image so the background is transparent, or at least the exact same color as the page background, so the fade looks transparent.

## Image information

- Screenshot of the landing page, section "Lanzamientos por etapas" (title "Convertí tu preventa en un evento"), dark purple band.
- The orange box (marker "1") highlights the event photo (people around a building scale model in a lounge) that sits between the section lead text and the 5 step cards ("Definí tus etapas", "Abrí el registro", "Medí la demanda", "Lanzá", "Pasá a la siguiente etapa").
- Problem: the image's edges fade out to a brownish/maroon tone that does not match the dark purple section background (`#241030`). The result is a visible lighter rounded rectangle with muddy edges instead of a fade that blends seamlessly into the page. The fade should end in transparency (or exactly the section background color).
- Component for marker 1: the `<Image src="/images/launch-day.webp">` in `LaunchDay`.

## Related source code

- `apps/landing/src/components/sections/launch-day.tsx:19-26` – `<Image src="/images/launch-day.webp" ... className="mb-2 hidden h-auto w-full rounded-3xl sm:block" />` (the highlighted element)
- `apps/landing/src/components/sections/launch-day.tsx:11` – `<Section id="lanzamientos" tone="dark">` (section background the image should blend into)
- `apps/landing/public/images/launch-day.webp` – image asset containing the baked-in fade/background
- `apps/landing/src/app/globals.css:119` – `--color-dark-band: #241030` (dark section background color)
- `apps/landing/src/app/globals.css:120` – `--color-dark-card: #331a44`
- `apps/landing/src/components/section.tsx:6` – `toneClasses` (maps `dark` tone to the band color)
- `apps/landing/src/content/es.ts:152-155` – `launch` content (title/text for this section)

## Possible reasons

- The fade in `launch-day.webp` is baked into the pixels and blends to a brown/maroon color rather than `#241030` (or alpha transparency), so it does not match the section background.
- The webp has no alpha channel (opaque edges), so it cannot be transparent over the page background.
- No CSS mask (`mask-image` / gradient overlay) is applied in `launch-day.tsx`, so nothing blends the edges with the page; the `rounded-3xl` class only rounds the corners of the opaque image.
- The image was possibly color-graded or tinted with a different purple/brown than the `dark-band` token.