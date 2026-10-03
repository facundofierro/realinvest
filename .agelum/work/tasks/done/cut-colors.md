---
created: 2026-10-03T09:23:44.327Z
plan: .agelum/work/plans/2026-10-03-cut-colors-1791019570373.md
status: done
summary: .agelum/work/summaries/2026-10-03-cut-colors-1791019739825.md
type: task
workflowStatus: done
---

# cut colors

## User request

Remove the purple gradient so there is no cutting effect between the two colors, the purple and the white.

## Image information

The screenshot shows the landing page at the boundary between the hero and the "EL PROBLEMA" section ("Tu equipo necesita información clara para vender").

- The orange rectangle marked **1** (roughly x 620–1420, y 485–720 in the displayed image) highlights a pink/purple glow. It ends in a hard horizontal line at about y 615, where the hero section ends.
- Above that line the background is tinted purple/pink. Below it, it is the plain off-white page color. That abrupt edge is the "cut" between the two colors.
- Component mapping:
  - The glow is the second blurred blob in the hero `DecorBlobs` (`bottom-[-12%] left-[40%] size-[340px]`). It sits at the bottom of the hero and is clipped by the `overflow-clip` of the `DecorBlobs` container. That clipping produces the straight edge.
  - The faint purple tint at the top right of the screenshot comes from the hero section's own `radial-gradient` background and the first blob.

## Related source code

- `apps/landing/src/components/sections/hero.tsx:88` – hero `<section>` with the purple `bg-[radial-gradient(900px_400px_at_85%_0%,#F3E8FA_0%,rgba(246,244,247,0)_70%)]`.
- `apps/landing/src/components/sections/hero.tsx:89-97` – `<DecorBlobs>` in the hero, including the blob that causes the cut: `bottom-[-12%] left-[40%] size-[340px]` (line 94). The other blob is `right-[6%] top-[14%] size-[420px]` (line 93).
- `apps/landing/src/components/decor-blobs.tsx:11` – blob colors (`#EAD7F5`/60, `#D9B8EE`/40).
- `apps/landing/src/components/decor-blobs.tsx:33` – container with `overflow-clip`, which clips the blob at the section edge.
- `apps/landing/src/components/decor-blobs.tsx:42-45` – blob classes (`blur-3xl`, color, parallax drift).
- `apps/landing/src/app/globals.css:290` and `apps/landing/src/app/globals.css:343-344` – `parallax-drift` animation that moves the blobs.
- `apps/landing/src/app/globals.css:302-305` – `.hero-dot-grid` radial mask (the dots at the right of the hero, not the cause).
- `apps/landing/src/components/sections/problem.tsx` and `apps/landing/src/app/page.tsx:34-35` – the `Problem` section that follows `Hero`, where the plain background begins.

## Possible reasons

- The bottom hero blob extends past the bottom of the hero (`bottom-[-12%]`), and the `DecorBlobs` container clips it with `overflow-clip`. A hard edge appears where the purple glow meets the next section's flat background.
- The hero is `overflow-x-clip` and `isolate`, so its stacking context and clipping stop the glow from fading into the next section.
- The hero background `radial-gradient` ends at the section boundary, and the `Problem` section has no matching tint. This adds to the visible color change.