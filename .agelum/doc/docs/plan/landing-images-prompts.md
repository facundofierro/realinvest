# Landing images — prompt sheet

Generated 2026-10-02 for `apps/landing` (task `.agelum/work/tasks/fixes/landing-page-images.md`).

- Model: `fal-ai/nano-banana-pro` (genmedia CLI), PNG, resolution 2K (coin 1K). The model returns no seed, so prompts are the reproducible record.
- Rule: generated images never contain text, letters, numbers or logos; all copy stays in HTML (`apps/landing/src/content/es.ts`).
- Post-processing (local scratch dir `.imagegen/`, gitignored): `fit.py` center-crops to the target aspect and encodes WebP q80; the coin is chroma-keyed off a flat `#00FF00` background (`chromakey.py`, unpremultiply + synthetic shadow) into a transparent 336×336 WebP. `final-cta-skyline` was cropped to the central 80%×67% first, removing the baked vignette.
- Output: `apps/landing/public/images/*.webp`; OG/Twitter image: `apps/landing/src/app/{opengraph,twitter}-image.jpg` (1200×630).

| File | Slot | Gen aspect → output | Style |
|---|---|---|---|
| problem-before.webp | Problem, "Hoy" | 4:3 → 960×720 | photoreal |
| problem-after.webp | Problem, "Con Real Invest" | 4:3 → 960×720 | stylised 3D |
| inventory-building.webp | Inventory | 1:1 → 1200×1200 | stylised 3D isometric |
| trust-loop.webp | Investor experience trust loop | 21:9 → 1500×500 | stylised 3D (objects at 1/6, 1/2, 5/6 to align with HTML labels) |
| buyers-reactivation.webp | Know your buyers | 4:3 → 960×720 | stylised 3D |
| payments-coin.webp | Payments, crypto card | 1:1 → 336×336 transparent | stylised 3D, chroma-keyed |
| launch-day.webp | Launch day | 21:9 → 1800×770 | photoreal, people |
| service-setup.webp | Services: setup | 3:2 → 960×640 | photoreal, people |
| service-3d.webp | Services: 3D | 3:2 → 960×640 | photoreal render |
| service-crm.webp | Services: CRM | 3:2 → 960×640 | stylised 3D isometric |
| final-cta-skyline.webp | Final CTA | 21:9 → crop → 1920×800 | photoreal |
| opengraph-image.jpg | OG / Twitter | 16:9 → 1200×630 | photoreal |

Iterations: `trust-loop` v1 had a mirrored floor reflection and bunched objects → v2 forces even spacing + no reflection. `opengraph` v1 had a muddy fog patch → v2 asks for a clean sky gradient. All others accepted on the first pass.

Not generated: the three phone slots use real `apps/wallet` screenshots of the seeded `demo-user` (390×844 @2x, Next dev badge hidden; the user confirmed all data is demo data, so nothing else is hidden), shown in a CSS phone frame (`components/phone-screenshot.tsx`):
- `screenshot-hero.webp`: `/` home, cropped to the top 780×1300 to keep the hero phone's 0.6 aspect.
- `screenshot-portal.webp`: `/project/torre-libertador-8000` (photos, launch, construction phases).
- `screenshot-investor.webp`: `/invest` (opportunities list).

Capture script: `.imagegen/shots.mjs` (copy into `apps/e2e` and run `node .shots.mjs <outdir> <paths...>`; needs the wallet dev server on :47310 and `apps/e2e/.auth/wallet.json`).

## Prompts

### problem-before

```text
Photorealistic photo of a cluttered real-estate sales office desk seen from a slightly elevated three-quarter angle: scattered printed floor plans with blank paper, many colourful sticky notes, a printed spreadsheet stack with blurred unreadable rows, a phone with blank screen buzzing with notifications shown only as soft glowing dots, a coffee mug, pens, a closed binder, a laptop in the background slightly out of focus. Feeling of disorganisation and overload, but tasteful and natural, warm late-afternoon light. Shallow depth of field. Colour grade: muted violet and lilac tones (deep violet #5B1187, soft lilac #EAD7F5, dark aubergine #2A1634) with a subtle warm pink accent (#D6336C), soft diffused light, calm premium feel. Absolutely no text, no letters, no words, no numbers, no logos, no brand names, no watermark, no signage, no labels anywhere in the image; any screens, papers or signs must be blank or abstract. No people.
```

### problem-after

```text
Stylised 3D illustration of perfect organisation: a neat isometric miniature board with a small residential tower model on one side and tidy rows of rounded tiles and cards on the other, each tile a soft colour chip (soft green, amber, light grey, violet) arranged in a clean grid, a few small rounded check-mark tokens, everything aligned and calm. Plain soft lilac background (#EFE3F6) with gentle floor shadow. Style: soft 3D render, matte clay-like materials, rounded friendly forms, gentle studio lighting with soft ambient occlusion, clean minimal composition. Colour grade: muted violet and lilac tones (deep violet #5B1187, soft lilac #EAD7F5, dark aubergine #2A1634) with a subtle warm pink accent (#D6336C), soft diffused light, calm premium feel. Absolutely no text, no letters, no words, no numbers, no logos, no brand names, no watermark, no signage, no labels anywhere in the image; any screens, papers or signs must be blank or abstract.
```

### inventory-building

```text
Stylised 3D isometric illustration of a modern mid-rise residential tower (about 10 floors) with balconies, seen in isometric view and slightly cut-away so each apartment unit reads as a separate rounded block. Each apartment unit's balcony glass/window panel is tinted in one of four status colours, mixed across the facade: soft green (#2E8B57 tinted light), warm amber (#B7791F tinted light), neutral grey, and soft blue (#3B6FD6 tinted light); the facade structure itself is warm off-white and lilac. Small trees and a little landscaped base at the bottom. Plain flat soft lilac background (#F6F4F7), soft contact shadow under the base. Style: soft 3D render, matte clay-like materials, rounded friendly forms, gentle studio lighting with soft ambient occlusion, clean minimal composition. Absolutely no text, no letters, no words, no numbers, no logos, no brand names, no watermark, no signage, no labels anywhere in the image; any screens, papers or signs must be blank or abstract.
```

### trust-loop

```text
Wide panoramic stylised 3D illustration, straight-on front view, of exactly three rounded matte objects standing on an invisible flat floor, placed EVENLY spaced across the width: the first centred at one-sixth of the width, the second exactly at the centre, the third at five-sixths of the width, with wide empty gaps between them. Left object: a soft lilac (#EFE3F6) rounded sphere with a small embossed arrow pointing right. Centre object: a slightly larger deep violet (#5B1187) rounded shield with an embossed check-mark. Right object: a soft lilac (#EFE3F6) sphere with two embossed circular arrows forming a loop. Between the objects, thin soft lilac ribbons with small arrowheads connect left to centre and centre to right. All three objects are vertically centred, same baseline, small relative to the frame (each about one-fifth of the image height), with a soft contact shadow under each. NO reflection, no mirror floor, no glossy surface. Plain flat uniform background colour #F6F4F7 everywhere. Style: soft 3D render, matte clay-like materials, rounded friendly forms, gentle studio lighting with soft ambient occlusion, clean minimal composition. Absolutely no text, no letters, no words, no numbers, no logos, no brand names, no watermark, no signage, no labels anywhere in the image; any screens, papers or signs must be blank or abstract.
```

### buyers-reactivation

```text
Stylised 3D illustration of reactivating dormant contacts: a wide soft funnel shape made of translucent lilac glass; above it many small rounded matte spheres representing people, most of them dull grey and resting, and a handful of them lit up glowing in warm pink and violet, rising and flowing into the funnel; below the funnel a small neat house-shaped token in deep violet. Clean minimal composition, plain flat background colour #FFFFFF with very soft lilac floor gradient, soft shadows. Style: soft 3D render, matte clay-like materials, rounded friendly forms, gentle studio lighting with soft ambient occlusion, clean minimal composition. Colour grade: muted violet and lilac tones (deep violet #5B1187, soft lilac #EAD7F5, dark aubergine #2A1634) with a subtle warm pink accent (#D6336C), soft diffused light, calm premium feel. Absolutely no text, no letters, no words, no numbers, no logos, no brand names, no watermark, no signage, no labels anywhere in the image; any screens, papers or signs must be blank or abstract.
```

### payments-coin

```text
A single thick rounded coin in soft 3D clay-like render, seen at a slight three-quarter angle standing on its edge tilted, coin body in deep violet (#5B1187) with a polished gold rim, its face embossed only with a simple abstract geometric hexagon pattern (no symbols, no letters, no numbers, no currency signs). Render on a SOLID FLAT bright green background (uniform color #00FF00, perfectly flat and uniform everywhere, no gradient, no vignette, no pattern, no checkerboard). The green background is only a flat matte behind the object — it is NOT a light source and must NOT be reflected, tinted, or picked up anywhere in the coin's colour, highlights or reflections; treat the lighting as a neutral white studio. Do NOT add any lens flare, glow, sparkles or radial burst. Do NOT outline the coin with any green stroke. Do NOT draw any shadow. Centered, with generous margin around the coin. Absolutely no text, no letters, no words, no numbers, no logos, no brand names, no watermark, no signage, no labels anywhere in the image; any screens, papers or signs must be blank or abstract.
```

### launch-day

```text
Photorealistic wide-angle photo of an elegant real-estate sales lobby during a project launch event at dusk: a large architectural scale model of a modern residential tower on a white plinth in the foreground-middle, a small crowd of well-dressed adults gathered around it chatting and looking at the model, floor-to-ceiling windows behind showing a city at blue hour with warm lights, warm pendant lights inside, sense of anticipation and excitement. Shot like editorial architectural photography, shallow depth of field. Moody dark tones that blend into a deep aubergine (#2A1634) at the edges. Any people are adults, diverse, natural and candid, not looking at the camera, no close-up faces. Colour grade: muted violet and lilac tones (deep violet #5B1187, soft lilac #EAD7F5, dark aubergine #2A1634) with a subtle warm pink accent (#D6336C), soft diffused light, calm premium feel. Absolutely no text, no letters, no words, no numbers, no logos, no brand names, no watermark, no signage, no labels anywhere in the image; any screens, papers or signs must be blank or abstract.
```

### service-setup

```text
Photorealistic photo of a small team of three adults in a bright modern office meeting room working together around a table with a white architectural scale model of a residential building and laptops with blank screens, one person pointing at the model, seen from a medium distance from behind and the side, natural daylight, plants, candid moment of collaboration and onboarding. Any people are adults, diverse, natural and candid, not looking at the camera, no close-up faces. Colour grade: muted violet and lilac tones (deep violet #5B1187, soft lilac #EAD7F5, dark aubergine #2A1634) with a subtle warm pink accent (#D6336C), soft diffused light, calm premium feel. Absolutely no text, no letters, no words, no numbers, no logos, no brand names, no watermark, no signage, no labels anywhere in the image; any screens, papers or signs must be blank or abstract.
```

### service-3d

```text
Photorealistic architectural visualisation of a modern elegant residential tower of about 12 floors with generous balconies, warm wood soffits, glass and off-white concrete, landscaped garden at the base with trees, captured at golden hour against a soft lilac-pink sky, slight low angle, high-end real estate render quality. Colour grade: muted violet and lilac tones (deep violet #5B1187, soft lilac #EAD7F5, dark aubergine #2A1634) with a subtle warm pink accent (#D6336C), soft diffused light, calm premium feel. Absolutely no text, no letters, no words, no numbers, no logos, no brand names, no watermark, no signage, no labels anywhere in the image; any screens, papers or signs must be blank or abstract. No people.
```

### service-crm

```text
Stylised 3D isometric illustration of a sales pipeline: a row of four rounded matte platforms of increasing height connected by a smooth conveyor ribbon, small rounded spheres representing contacts travelling along it from left to right, changing colour from grey to lilac to violet to warm pink as they advance, the last platform holding a small tidy house token. Plain flat soft lilac background (#F6F4F7), soft shadows. Style: soft 3D render, matte clay-like materials, rounded friendly forms, gentle studio lighting with soft ambient occlusion, clean minimal composition. Absolutely no text, no letters, no words, no numbers, no logos, no brand names, no watermark, no signage, no labels anywhere in the image; any screens, papers or signs must be blank or abstract.
```

### final-cta-skyline

```text
Photorealistic ultra-wide photo of a modern city skyline with several contemporary residential towers at late dusk, seen from a slight elevation, warm window lights beginning to glow, sky graded from soft violet-pink near the horizon to a deep dark aubergine (#2A1634) at the top; the top third of the image and the edges fade smoothly into solid #2A1634 so it blends into a dark web page section. Calm, aspirational, cinematic. Absolutely no text, no letters, no words, no numbers, no logos, no brand names, no watermark, no signage, no labels anywhere in the image; any screens, papers or signs must be blank or abstract. No people.
```

### opengraph

```text
Photorealistic wide architectural photograph at blue-hour dusk: an elegant modern residential tower with curved balconies and warm glowing window lights occupies the right third of the frame, rising out of frame; in front, a calm landscaped plaza with low hedges, stone benches and a shallow reflecting pool with small warm lights. The left two thirds show a clean, smooth sky gradient from soft violet-pink near the horizon to deeper violet (#5B1187) and dark aubergine (#2A1634) at the top-left, with a distant soft city horizon line; no fog, no haze patches, no blur blobs. Premium real-estate photography, crisp and sharp, calm and aspirational. Absolutely no text, no letters, no words, no numbers, no logos, no brand names, no watermark, no signage, no labels anywhere in the image; any screens, papers or signs must be blank or abstract. No people.
```
