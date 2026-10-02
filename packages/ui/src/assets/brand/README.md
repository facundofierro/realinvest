# Vest brand assets

Static versions of the Vest logo for anything that cannot use the React
component (`@repo/ui/components/brand/vest-logo`): the landing site, emails,
social images, native app icons.

| File | Use |
| --- | --- |
| `vest-logo.svg` | Full lockup with "REAL ESTATE", on light backgrounds |
| `vest-logo-white.svg` | Full lockup, on dark or brand backgrounds |
| `vest-wordmark.svg` | Lockup without the subtitle, on light |
| `vest-wordmark-white.svg` | Lockup without the subtitle, on dark |
| `vest-mark.svg` | The V alone, on light |
| `vest-mark-white.svg` | The V alone, on dark |
| `vest-app-icon.svg` | Rounded gradient tile with the white V; source for favicons and app icons |

Import from another workspace package with
`@repo/ui/assets/brand/vest-logo.svg`, or copy the file into that app's
`public/` folder.

Colours: light `#E879F9`, mid `#A21CAF`, deep `#5B1187`. Icon tile gradient
`#7A1FA8` to `#3B1259`.

Lettering is Geist Bold and SemiBold (SIL Open Font License), converted to
outlines, so no font needs to be loaded.

Favicons (`apps/*/src/app/favicon.ico`) and the Tauri icons
(`native/wallet/tauri/src-tauri/icons/`) are rendered from
`vest-app-icon.svg`. The macOS icons use the same tile inset by about 10% per
side.
