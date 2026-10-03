---
created: 2026-10-03T07:56:09.565Z
status: done
summary: .agelum/work/summaries/2026-10-03-images-to-videos-1791014389975.md
type: task
workflowStatus: doing
---

# images to videos

We want to generate videos from the images in these cards:

1. The card at the right of the section "Conocé a tus compradores" (image `buyers-reactivation.webp`).
2. The "3D y multimedia" card in the Servicios section (image `service-3d.webp`).

Use the fal agent (`genmedia`, image-to-video; default `fal-ai/veo3`) to generate the videos from these source images, then replace the static images in the cards with the videos.

## Related source code

- `apps/landing/src/components/sections/know-your-buyers.tsx:35-48`: right-hand card; `<Image src="/images/buyers-reactivation.webp">` (line 41-48) is the image to turn into a video.
- `apps/landing/src/components/sections/know-your-buyers.tsx:14-16`: `KnowYourBuyers` component.
- `apps/landing/src/content/es.ts:187-224`: `knowYourBuyers` content ("Conocé a tus compradores", eyebrow at line 188).
- `apps/landing/src/components/sections/services.tsx:14-17`: `"3d"` entry in the `images` map (`/images/service-3d.webp`).
- `apps/landing/src/components/sections/services.tsx:34-52`: card rendering loop, where `<Image>` (lines 38-45) renders each card image.
- `apps/landing/src/content/es.ts:259-262`: `"3d"` card content (title "3D y multimedia").
- `apps/landing/public/images/buyers-reactivation.webp`: source image for card 1.
- `apps/landing/public/images/service-3d.webp`: source image for card 2.