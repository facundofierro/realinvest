# Status Audit — September 2026

Audit of the current state of the Real Invest application and the general plan of what is pending to reach a fully functional product.

## 1. Executive Summary

The project is at the **UI mock-up stage**. The wallet application (`apps/wallet`) implements the complete screen flow (landing, login, dashboard, invest, project details, exchange, assets, deposit, withdraw, tokenization, chat) backed only by sample JSON data served through local API routes. There is **no real authentication, no database, no external provider integration, and no business logic beyond the UI**. The first target market is **Paraguay**, and the legal/technical research for that market is already documented in the research folder.

The core pending work is: responsive polish for all screen sizes, a simulated crypto custody provider, a simulated KYC provider, persistence with Drizzle + SQLite, Google OAuth authentication, and a code organization that supports **multi-tenant deployments at deploy time** (shared code isolated in utility packages so future deployments can fork the base implementation).

## 2. Current Status (What Exists Today)

### 2.1 Repository / Infrastructure

- Turborepo + pnpm monorepo with:
  - `apps/wallet` — main Next.js 16 / React 19 application (Tailwind CSS v4).
  - `apps/test` — playground app.
  - `packages/ui` — shared UI kit (shadcn/ui + Radix components, brand logos).
  - `packages/eslint-config`, `packages/typescript-config` — shared tooling configs.
  - `native/wallet/capacitor` (iOS) and `native/wallet/tauri` (desktop) — native wrappers, scaffolding level.
- Multiplatform strategy documented in `docs/plan/wallet-multiplatform.md` and `docs/plan/wallet-multiplatform-implementation.md` (single codebase, static export, Capacitor for mobile, Tauri for desktop).
- App specification documented in `docs/plan/wallet-app.md`.

### 2.2 Application UI (Mock-ups Complete)

All screens exist as UI mock-ups in `apps/wallet`:

- **Landing** (`src/app/page.old.tsx`) with scroll-video section and project showcase assets.
- **Login** (`(auth)/login`) — email/password form, purely visual; no session management.
- **Dashboard** (`(dashboard)/page.tsx`) — total balance, quick actions (deposit/withdraw), featured projects, recent activity.
- **Invest / marketplace** (`(dashboard)/invest`) — project discovery with filters by status, search, project cards.
- **Project details** (`(dashboard)/project/[id]` and `project/[id]/units`) — stats, stories, unit selection, unit details dialog/sheet.
- **Assets / portfolio** (`(dashboard)/assets`) — holdings list with market value vs. cost basis.
- **Exchange / secondary market** (`(dashboard)/exchange`, `exchange/[symbol]`) — token list, charts, market stats, order book, trade dialog.
- **Deposit / Withdraw** (`(dashboard)/deposit`, `(dashboard)/withdraw`).
- **Tokenization** (`(dashboard)/tokenization`) and **Chat** (`(dashboard)/chat`).
- Responsive scaffolding exists (bottom nav for mobile, desktop top nav, `use-is-desktop` hook), but coverage across all screen sizes is incomplete (see §3.1).

### 2.3 Data Layer (Mock Only)

- All data comes from `apps/wallet/src/sample-data/*.json` (projects, units, stages, stories, purchase options, holdings, balances, positions, transactions, market tokens, order books).
- Local API routes (`src/app/api/**`) read those JSON files and serve them to the client via `src/lib/api/*` hooks. There is **no real persistence**.

### 2.4 Provider Integrations (None)

- No crypto custody provider integration. A `dev:ripio-mock` script exists in the root `package.json` referencing a `@repo/ripio-mock` package, but the package **does not exist yet**; the script is a leftover from an earlier idea and will be replaced by a Fireblocks-oriented mock (see §3.2).
- No KYC provider (real or simulated).

### 2.5 Research (Complete for First Market: Paraguay)

The research folder (`doc/docs/research/`) contains the regulatory and technical basis for the Paraguay-first implementation:

- `paraguay.md` — legal framework: Ley 7572/2025 (Mercado de Valores, DLT/security tokens), SIV/BCP as regulator, Ley 921/96 (fideicomiso), SEPRELAD AML/KYC (Res. 314/2021), DNIT tax reporting.
- `paraguay-psav-registro-y-wallets.md` — PSAV registry at SEPRELAD (46 entities), white-label custody options, model of local PSAV license + foreign custody technology (X4T/Fireblocks pattern).
- `paraguay-tokenizacion-tecnica.md` — blockchain/WaaS architecture comparison (EVM L2 + ERC-3643 recommended, Hedera as alternative; hybrid self-custody + custodial stablecoin leg).
- `paraguay-requisitos-legales-y-proyectos.md` — custody obligations under Ley 7572/2025 (Cavapy), self-custody gray zone, known tokenization projects in Paraguay.
- `paraguay-fideicomiso-vs-argentina.md` — trust structure comparison, licensed fiduciary requirements (BCP).
- `providers/` — Fireblocks operations research: architecture, issuance/custody flows, onboarding/compliance (KYC), secondary market operations.

## 3. Pending Work (General Plan)

### 3.1 UI / UX

- **[ ] Responsive audit for all screen sizes.** Current mock-ups were designed mobile-first with some desktop adaptations (top nav, token tabs, exchange views). Needed:
  - Systematic pass over every screen for mobile, tablet, laptop, and desktop breakpoints.
  - Consistent navigation patterns (bottom nav vs. top nav) and dialogs/sheets behavior per form factor.
  - Landscape/small-window edge cases for the future Tauri desktop build.

### 3.2 Simulated Providers

- **Provider decision: Fireblocks.** For the Paraguay deployment the custody provider is **Fireblocks** (the model already validated locally by X4T — local PSAV license + foreign custody technology — per `paraguay-psav-registro-y-wallets.md`). Ripio is **discarded** as a provider option; the existing `dev:ripio-mock` script and `RIPIO_MOCK_DATA_DIR` references in the root `package.json`/`turbo.json` are leftovers and must be removed or renamed.
- **[ ] Simulated crypto custody provider — Fireblocks mock** (e.g. `@repo/fireblocks-mock` package):
  - Simulated API mirroring Fireblocks concepts (vault accounts, wallets, balances, transfers, deposit addresses) based on the operations research in `research/providers/fireblocks-operations-architecture` and `research/providers/operations-issuance-custody`.
  - Covers wallets, balances, deposits/withdrawals, and stablecoin (USDT) on/off-ramp flows.
  - Implements the custody provider port so the same screens can later run against the real Fireblocks API without UI changes.
- **[ ] Simulated KYC provider**:
  - Mock KYC onboarding flow (document upload, verification states: pending/approved/rejected) mirroring the SEPRELAD-driven requirements described in the Paraguay research (identity, beneficial owner, PEP/sanctions screening placeholders).
  - Verification status must gate investment/deposit features, as it would in production.

### 3.3 Persistence

- **[ ] Database with Drizzle ORM + SQLite**:
  - Add a `db` package (or app-level module) with Drizzle schema for: users/sessions, projects, units, stages, purchase options, holdings, balances, positions, transactions, market tokens, order books.
  - Replace the JSON sample-data API routes with real queries seeded from the existing sample data.
  - Migration strategy so future deployments (forks) can evolve their schema independently.

### 3.4 Authentication

- **[ ] Google OAuth authentication**:
  - Replace the mock email/password login with Google OAuth (e.g. NextAuth/Auth.js or equivalent).
  - Session management across web and native wrappers (Capacitor/Tauri) per the multiplatform strategy.
  - User record linked to the database schema (§3.3) and to the KYC status from §3.2.

### 3.5 Paraguay-First Implementation

- Use the research documents in `doc/docs/research/` as the reference for the Paraguay deployment:
  - Regulatory shape: PSAV registration (SEPRELAD), fideicomiso structure (Ley 921/96), SIV/BCP constraints for tokenized securities (Ley 7572/2025), DNIT reporting.
  - Technical custody model: local license + external custody technology (WaaS), hybrid self-custody for illiquid real estate tokens + custodial stablecoin leg (see `paraguay-tokenizacion-tecnica.md`).
  - These are mostly organizational/legal constraints for launch; the engineering implication is that provider interfaces (custody, KYC, payments) must be pluggable and jurisdiction-agnostic.

### 3.6 Multi-Tenant at Deploy Time / Code Organization

- **Strategy**: multi-tenancy is resolved **at deploy time, not at runtime**. Future deployments may be forks of this codebase with unknown personalizations (branding, flows, regulatory specifics).
- **Design rule**: extract code that is likely to be shared across future forked versions into **utility packages** under `packages/*` (domain logic, provider clients/ports, formatting, DB schema utilities, shared UI), keeping app-specific composition in `apps/*`.
- Concrete pending actions:
  - Define package boundaries: e.g. `packages/domain` (business logic), `packages/providers-custody` (interface + mock + future real adapters), `packages/providers-kyc`, `packages/db` (Drizzle schema/migrations).
  - Keep adapter interfaces provider-agnostic so each fork can plug different real providers.
  - Document what is considered "core shareable" vs. "deployment-specific" as the product matures.

## 4. Suggested Order of Work

1. **Database (Drizzle + SQLite)** — unblocks everything that needs real state (auth, KYC status, transactions).
2. **Google OAuth** — real user identity wired to the database.
3. **Simulated KYC provider** — onboarding/compliance flow gated by verification status.
4. **Simulated crypto custody provider (Fireblocks mock)** — deposit/withdraw/balance flows over the provider port, persisted in the DB.
5. **Responsive audit** — can run in parallel; polish all screens for every form factor.
6. **End-to-end investment loop** — connect invest/exchange/asset screens to DB + simulated providers (buy tokens, secondary market trades, portfolio updates).
7. **Packaging for multi-tenant forks** — progressive extraction of utility packages as boundaries become clear.
8. **Paraguay launch track (parallel, mostly non-code)** — PSAV/fideicomiso/legal validation using the research docs, selection of real custody/KYC providers.

## 5. Out of Scope / Deferred

- Real blockchain issuance and smart contracts (ERC-3643/Hedera decision per research) — after the simulated stack is complete and the legal track advances.
- Real Fireblocks integration — **Fireblocks is the chosen custody provider for Paraguay**; the real integration is deferred until the mock-based stack is complete and the legal track (PSAV registration) advances.
- Native app store releases (Capacitor/Tauri) — after the web app is functional and responsive.
- Runtime multi-tenancy (single deployment serving multiple tenants) — explicitly not the model; tenancy is resolved per deployment.
