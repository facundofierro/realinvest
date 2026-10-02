# Responsive audit checklist (task 17)

Widths: 375 / 768 / 1280 / 1920. Legend: 🔧 = fixed in code (static audit, **not yet browser-verified**), ⏳ = needs visual confirmation, ➖ = no change.

Conventions: text ≥ 11px (10px only on decorative `uppercase` micro-labels); interactive targets ≥ 40px on mobile (`h-10 md:h-9`); never `h-screen`/`min-h-screen` inside the dashboard shell (use `h-full`/`min-h-full`); cap content width on wide screens.

| Screen | 375 | 768 | 1280 | 1920 | Notes |
|---|---|---|---|---|---|
| Login | 🔧⏳ | ⏳ | ⏳ | ⏳ | `min-h-dvh` |
| Dashboard | 🔧⏳ | ⏳ | 🔧⏳ | 🔧⏳ | `max-w-7xl` cap, `h-full` states |
| Invest | 🔧⏳ | ⏳ | ⏳ | ⏳ | micro text → 11px; `overflow-x-hidden` may mask overflow |
| Project detail | 🔧⏳ | ⏳ | ⏳ | ⏳ | responsive hero height, expandable `max-h-[900px]`, 40px actions |
| Project units | 🔧⏳ | ⏳ | ⏳ | ⏳ | removed `pb-40`/`min-h-screen`; 11px filter labels |
| Assets | 🔧⏳ | ⏳ | ⏳ | ⏳ | `h-full`; verify split pane at 1024–1100 |
| Exchange list | 🔧⏳ | ⏳ | ⏳ | ⏳ | 40px buttons, 11px labels |
| Exchange detail + charts | 🔧⏳ | 🔧⏳ | 🔧⏳ | 🔧⏳ | charts now sized via `useElementSize` (no stretching); full-bleed gradient kept, so no width cap |
| Deposit | 🔧⏳ | ⏳ | 🔧⏳ | 🔧⏳ | `max-w-xl` |
| Withdraw | 🔧⏳ | ⏳ | 🔧⏳ | 🔧⏳ | `max-w-xl`; confirm dialog still raw `Dialog` (deferred) |
| Tokenization / scroll video | 🔧⏳ | ⏳ | ⏳ | ⏳ | sticky sections `h-dvh`; hero nowrap at 1024–1100 unverified |
| Chat | 🔧⏳ | ⏳ | 🔧⏳ | 🔧⏳ | `max-w-3xl`, 40px icon buttons |
| KYC onboarding | ⏳ | ⏳ | ⏳ | ⏳ | not touched |
