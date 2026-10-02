# Real Invest Landing

The **Landing** application is the public marketing site for the Real Invest platform (Spanish, B2B for real estate developers). It is a single static page plus one API route that stores demo requests.

## 🚀 Getting Started

This project is part of a monorepo managed by **pnpm** and **Turborepo**.

### Development

```bash
# From the root of the monorepo
pnpm dev --filter landing

# Or from this directory
pnpm dev
```

The application runs at `http://localhost:47313` (high port, like the other apps: wallet 47310, admin 47311, test 47312). There is no auth or middleware.

### Local domain (Caddy)

Locally it is also served over HTTPS at `https://local.landing.realinvest.com`, a Caddy reverse proxy to port 47313 created with:

```bash
agelum local-domains add --project-path . --project-name realinvest --title "Landing" --hostname local.landing.realinvest.com --target-port 47313
```

Use `agelum local-domains list` / `reconcile --id <id>` to inspect or repair it.

### Environment variables

Copy `.env.example` to `apps/landing/.env.local` (SQLite is the default database):

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes (for the demo form) | libSQL/SQLite database shared with the wallet, e.g. `file:../../packages/db/wallet.db`. |
| `DATABASE_AUTH_TOKEN` | Remote libSQL only | Auth token for the database. |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical origin used for metadata, `robots.txt` and `sitemap.xml`. Defaults to `http://localhost:47313`. |
| `NEXT_PUBLIC_WHATSAPP_URL` | No | WhatsApp link (final CTA and footer). |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Commercial email shown in the footer. |
| `NEXT_PUBLIC_LEGAL_ENTITY` | No | Legal entity shown next to the copyright. |
| `NEXT_PUBLIC_PRIVACY_URL` | No | Privacy policy link (footer and demo form). |
| `NEXT_PUBLIC_TERMS_URL` | No | Terms and conditions link (footer). |

Every optional element is simply not rendered while its variable is unset.

### Demo requests

The form in the `#demo` section posts to `POST /api/demo-request`, which validates the payload (`src/lib/demo-request-schema.ts`) and inserts a row in the `demo_requests` table of `@repo/db` (`packages/db/src/schema.ts`). Apply the migration (`0005_sweet_sway`, creates `demo_requests`) before using the form; it is idempotent:

```bash
pnpm --filter @repo/db db:migrate
```

Spam protection is a hidden honeypot field plus a best-effort in-memory throttle (5 requests per minute per IP).

## 📁 Project Structure

```text
src/
├── app/                  # Layout, page, robots/sitemap and the demo-request API route
├── content/
│   ├── es.ts             # All page copy (Spanish), one export per section
│   └── flags.ts          # Flags for optional content (e.g. the AI-assistant bullet)
├── components/
│   ├── sections/         # One component per page section, assembled in app/page.tsx
│   ├── illustrations/    # Inline-SVG illustrations and icons (swappable for real screenshots)
│   └── *.tsx             # Header, footer, section wrapper, CTA link, FAQ, badges
└── lib/                  # DB singleton, zod schema and demo-request persistence
```

Copy changes go in `src/content/es.ts`; the editorial source is `.agelum/doc/docs/plan/landing-copy-2026-oct.md`. Illustrative data in the mockups is always labelled "Datos de ejemplo".

## 🧪 Checks

```bash
pnpm --filter landing lint
pnpm --filter landing build
```
