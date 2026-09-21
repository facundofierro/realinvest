---
color: green
created: 2026-09-21T12:16:26.115Z
summary: .agelum/work/summaries/2026-09-21-alpha-version-1789993110425.md
type: epic
workflowStatus: doing
---

# alpha version

Take the wallet application from the current UI mock-up stage (sample JSON data, no auth, no persistence, no providers) to a fully functional alpha: real database persistence, Google OAuth authentication, simulated KYC and crypto custody (Fireblocks mock) providers, an end-to-end investment loop, responsive polish across all screen sizes, and a code organization that supports multi-tenant deployments at deploy time.

Plan reference: `doc/docs/plan/status-2026-sep.md`

## Goals

- Replace the mock data layer with real persistence (Drizzle ORM + SQLite) seeded from the existing sample data.
- Real user identity via Google OAuth, linked to the database and KYC status.
- Simulated KYC provider gating investment/deposit features (pending/approved/rejected states).
- Simulated crypto custody provider (Fireblocks mock) implementing the custody provider port: vault accounts, wallets, balances, transfers, deposit addresses, USDT on/off-ramp flows.
- Connected invest/exchange/assets screens: buy tokens, secondary market trades, portfolio updates.
- Responsive audit across mobile, tablet, laptop, and desktop breakpoints with consistent navigation patterns.
- Utility package boundaries (`packages/domain`, `packages/providers-custody`, `packages/providers-kyc`, `packages/db`) so future forked deployments can plug different real providers.
- Remove Ripio leftovers (`dev:ripio-mock` script, `RIPIO_MOCK_DATA_DIR` references) — Fireblocks is the chosen custody provider.

## Work Items

### 1. Database (Drizzle ORM + SQLite)

Add a `db` package (or app-level module) with Drizzle schema for: users/sessions, projects, units, stages, purchase options, holdings, balances, positions, transactions, market tokens, order books. Replace the JSON sample-data API routes with real queries seeded from the existing sample data. Include a migration strategy so future deployment forks can evolve their schema independently.

Unblocks everything that needs real state (auth, KYC status, transactions).

### 2. Google OAuth authentication

Replace the mock email/password login with Google OAuth (e.g. NextAuth/Auth.js or equivalent). Session management across web and native wrappers (Capacitor/Tauri) per the multiplatform strategy (`docs/plan/wallet-multiplatform.md`). User record linked to the database schema and to the KYC status.

### 3. Simulated KYC provider

Mock KYC onboarding flow (document upload, verification states: pending/approved/rejected) mirroring the SEPRELAD-driven requirements from the Paraguay research (identity, beneficial owner, PEP/sanctions screening placeholders). Verification status must gate investment/deposit features, as it would in production.

### 4. Simulated crypto custody provider (Fireblocks mock)

Create a `@repo/fireblocks-mock` package with a simulated API mirroring Fireblocks concepts (vault accounts, wallets, balances, transfers, deposit addresses) based on the operations research in `doc/docs/research/providers/`. Covers wallets, balances, deposits/withdrawals, and stablecoin (USDT) on/off-ramp flows. Implements the custody provider port so the same screens can later run against the real Fireblocks API without UI changes.

### 5. Responsive audit

Systematic pass over every screen (landing, login, dashboard, invest, project details, assets, exchange, deposit, withdraw, tokenization, chat) for mobile, tablet, laptop, and desktop breakpoints. Consistent navigation patterns (bottom nav vs. top nav) and dialogs/sheets behavior per form factor. Landscape/small-window edge cases for the future Tauri desktop build. Can run in parallel with items 1–4.

### 6. End-to-end investment loop

Connect invest/exchange/asset screens to the database and simulated providers: buy tokens, secondary market trades, portfolio updates reflected in holdings, balances, positions, and transactions.

### 7. Packaging for multi-tenant forks

Progressive extraction of utility packages as boundaries become clear: `packages/domain` (business logic), `packages/providers-custody` (interface + mock + future real adapters), `packages/providers-kyc`, `packages/db` (Drizzle schema/migrations). Keep adapter interfaces provider-agnostic and jurisdiction-agnostic so each fork can plug different real providers. Document what is "core shareable" vs. "deployment-specific".

## Out of Scope

- Real blockchain issuance and smart contracts (ERC-3643/Hedera decision per research).
- Real Fireblocks integration (deferred until the mock-based stack is complete and the PSAV registration legal track advances).
- Native app store releases (Capacitor/Tauri).
- Runtime multi-tenancy (single deployment serving multiple tenants) — tenancy is resolved per deployment.
- Paraguay launch legal track (PSAV/fideicomiso/SIV validation) — runs in parallel, mostly non-code.