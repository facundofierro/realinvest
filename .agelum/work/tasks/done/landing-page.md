---
created: 2026-10-02T17:30:55.948Z
plan: .agelum/work/plans/2026-10-02-landing-page-1790965388238.md
status: done
summary: .agelum/work/summaries/2026-10-02-landing-page-1790972657800.md
type: task
workflowStatus: done
---

# landing page

## User instructions

Create the landing page as described in `/Users/facundofierro/git/realinvest/.agelum/doc/docs/plan/landing-copy-2026-oct.md`.

The copy doc defines a B2B landing for real estate developers (Spanish, voseo): Meta/SEO (L15–21), navigation (L24–31), sections 1–14 (Hero L35–47, El problema L51–63, Día de lanzamiento L67–93, Inventario y reservas L97–109, Portal del comprador L113–131, Pagos L135–154, Verificación de compradores L158–169, Servicios L173–209, Tokenización L213–231, Marketplace futuro L235–247, Socios fundadores L251–267, Cómo funciona y precios L271–286, FAQ L290–322, CTA final L326–335), demo form (L339–363) and footer (L367–375). Bracketed `[notas]` are internal notes and must not be published.

This is a **feature task**: the landing page does not exist yet and must be implemented from the copy doc.

**Decision:** the new landing page will be a **new app in this monorepo** (e.g. `apps/landing`), not a route inside `apps/wallet`.

## Related source code

### Repo structure (Turborepo + pnpm monorepo)

- `apps/wallet` — main Next.js 16 (App Router) app, port 47310; contains the only landing-style code today (use as style/structure reference)
- `apps/admin` — internal admin dashboard (not marketing)
- `apps/test` — brand/logo playground (not marketing)
- `packages/ui` — shared shadcn components + Vest brand logos
- `native/wallet/nextjs` — mirror of the wallet app, no landing/tokenization route
- `package.json`, `pnpm-workspace.yaml`, `turbo.json` — workspace config needed to scaffold the new app

### Landing-style page already implemented (reference for style/structure)

- `apps/wallet/src/components/pages/tokenization-page.tsx:1-585` — full landing-style page: hero (L220–296), financing-structure section (L298–430), 4-step process scroll section (L433–534), scroll-video section mount (L536–544), smart contracts section (L546–563), final CTA (L566–582)
- `apps/wallet/src/components/scroll-video-section.tsx:1-231` — scroll-driven crossfading "video" section with fading titles (L121–228)
- `apps/wallet/public/landing/` — landing assets (`pattern-grid.svg`, `building1–4.png`, `tokenization-process.png`, `v1.mp4`, `v2.mp4`, etc.)
- `apps/wallet/public/cnv-logo.png` — image used by the tokenization page (L397)

### Navigation / brand components

- `apps/wallet/src/components/desktop-top-nav.tsx:28-186` — desktop top nav with Vest logo (L47–53) and main links (L55–112)
- `apps/wallet/src/components/bottom-nav.tsx:18-205` — mobile bottom nav with center VestLogo link (L139–152)
- `apps/wallet/src/components/nav/nav-items.ts:17-33` — nav config constants incl. `TOKENIZATION_ITEM` (L19)
- `packages/ui/src/components/brand/vest-real-state.tsx:1-97` — "Vest Real State" wordmark brand component
- `packages/ui/src/components/brand/vest-logo.tsx:1-116` — SVG "Vest" logo

### SEO / metadata

- `apps/wallet/src/app/layout.tsx:16-19` — the only `metadata` export in the repo (`title: "Real Invest Wallet"`); no OG images, robots.txt or sitemap.xml exist anywhere — the new app must define its own metadata from the copy doc's Meta/SEO section (L15–21)

### Styles / animations

- `apps/wallet/src/app/globals.css:136-185` — landing animations: `animate-fade-in-up` (L136–149), `animate-fade-in-out` (L151–172), `animate-ken-burns` (L174–185); `animate-float` comes from `tailwindcss-animate` (plugin at L4) — reusable ideas for the new app's globals.css

### Copy / plan documents (source of truth)

- `.agelum/doc/docs/plan/landing-copy-2026-oct.md` — complete approved landing copy (sections listed above)
- `.agelum/doc/docs/plan/plan-2026-oct.md:192-216` — plan §9 "Landing page: qué incluir"; next steps L249–257

## Gaps / notes for implementation

- No FAQ, pricing, demo form, or footer components exist in code — they exist only as copy in `landing-copy-2026-oct.md` (§12, §13, form, footer)
- The implemented `/tokenization` page conflicts with the new copy guidance (copy doc L213–229: tokenización must be presented as "evaluación a pedido", never as available today)
- `/tokenization` is behind auth (`apps/wallet/src/proxy.ts:1-23`) and inside the dashboard shell; the new landing app is fully public — no auth middleware should be carried over
- Scaffold the new app (e.g. `apps/landing`) as a standalone Next.js app in the workspace: own `package.json`, port, `globals.css`, and root `page.tsx`; reuse `packages/ui` brand components where appropriate