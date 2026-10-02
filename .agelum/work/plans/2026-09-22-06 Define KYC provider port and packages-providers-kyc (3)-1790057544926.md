# Plan: Define KYC provider port and packages/providers-kyc

Task: `.agelum/work/tasks/pending/06 Define KYC provider port and packages-providers-kyc (3).md`

## Certainty assessment

**Level: High**

This is an additive, self-contained change: a new workspace package plus one new (additive) table in the already-established `packages/db` Drizzle schema. There is no external API integration risk (the adapter is a pure simulation) and every structural choice below mirrors an existing, working pattern already in the repo:

- Package scaffolding (`package.json`, `tsconfig.json`, `eslint.config.mjs`) copies `packages/db` verbatim (`packages/db/package.json:1-27`, `packages/db/tsconfig.json:1-11`, `packages/db/eslint.config.mjs:1-4`) — this is the only non-React internal package besides `db` itself, so it's the correct template.
- `users.kycStatus` already exists (`packages/db/src/schema.ts:28`, default `"none"`) and is already read by `apps/wallet/src/auth.ts:36-48` into the session/JWT and displayed in `apps/wallet/src/components/bottom-nav.tsx:241`. This task must keep writing to that exact column so the existing auth/session wiring keeps working unchanged.
- JSON columns follow the existing `transactions.metadata` precedent (`packages/db/src/schema.ts:198`, `text(..., { mode: "json" }).$type<Record<string, unknown>>()`), so no new Drizzle patterns are introduced.
- The migration workflow (schema edit → `db:generate` → review SQL → `db:migrate`) is documented and additive-change-friendly (`packages/db/README.md:36-52`), and a new table is exactly the kind of change it recommends over in-place edits.

Residual, low-severity risks (verify while implementing, not blocking the plan):
1. TypeScript will not automatically consider a named interface (e.g. `KycDocument[]`) assignable to a `Record<string, unknown>[]` column type without an explicit cast in some strictness configurations — the plan calls for explicit `as unknown as ...` casts at the persistence boundary to avoid this entirely rather than relying on structural inference.
2. `drizzle-orm@^0.44.7` (the version pinned in `packages/db/package.json:16`) is assumed to support `.onConflictDoUpdate().returning()` on the libsql/SQLite driver — this is a stable, long-available Drizzle feature, so risk is minimal.

## Ambiguity assessment

**Level: Low**

The task text explicitly says the deterministic mock policy is an example ("e.g., auto-approve after N seconds, or by test document names"), not a spec — so the exact timer length and magic-filename conventions are implementation latitude, not an open product decision. I resolved the one real architectural fork (whether to persist full application data — identity, documents, beneficial owners, screening — or just the status enum) by cross-checking the two tasks that consume this package:
- Task 07 (`.agelum/work/tasks/pending/07 KYC onboarding UI flow (5).md:17,31`) requires document upload "stored via the mock" and "KYC data and status are persisted for the user" — this settles it: full application data must be persisted, not just the status.
- Task 08 (`.agelum/work/tasks/pending/08 KYC gating of invest, deposit and withdraw (3).md`) reads KYC state purely via `session.user.kycStatus` (i.e. the existing `users.kycStatus` column via NextAuth), not through this package directly — confirming `users.kycStatus` must remain the single source of truth column that this package keeps in sync.

Explicitly out of scope for this task (belongs to tasks 07/08, not this one): any `apps/wallet` API routes, UI, or `auth.ts` changes. This plan only creates the package.

One deferred item, noted but not blocking: the acceptance criterion "Unit tests cover state transitions" is **not** detailed in this plan per the planning instructions (testing is handled separately). Note for whoever picks that up: there is currently no test runner anywhere in the monorepo (checked every `package.json`, no `vitest`/`jest` dependency exists), so introducing one (vitest is the natural fit for a plain TS package with no framework coupling) is a prerequisite for that acceptance criterion, not something already in place.

## Current state (research findings)

| Area | Location | Notes |
|---|---|---|
| Workspace glob | `pnpm-workspace.yaml:1-3` | `packages/*` already matches a new `packages/providers-kyc` dir — no workspace config change needed. |
| Existing packages | `packages/db`, `packages/ui`, `packages/backend`, `packages/eslint-config`, `packages/typescript-config` | `packages/backend` is an older/unrelated Postgres+tRPC package (different `@agelum/backend` stack) — not a template to follow; `packages/db` is. |
| `users` table | `packages/db/src/schema.ts:22-29` | Already has `kycStatus` (`KycStatus`, default `"none"`). Do not rename or restructure this column. |
| `KycStatus` type | `packages/db/src/types.ts:18` | `"pending" \| "approved" \| "rejected" \| "none"`. Keep the new package's own `KycStatus` union string-identical so assignments to `users.kycStatus` type-check without casts. |
| Schema aggregate | `packages/db/src/schema.ts:226` | The `schema` export object must be extended with the new table + its relations. |
| Relations pattern | `packages/db/src/schema.ts:213-224` | One `relations(...)` block per table; `usersRelations` (line 213) needs a `kycApplications: many(kycApplications)` entry added. |
| JSON column precedent | `packages/db/src/schema.ts:198` | `transactions.metadata` — same pattern to reuse for identity/documents/beneficialOwners/screening columns. |
| DB client | `packages/db/src/client.ts:1-12` | `createDb(databaseUrl?)` → `Db` type. The mock adapter takes a `Db` instance as a constructor argument (dependency injection), it must not create its own connection. |
| DB package exports | `packages/db/src/index.ts:1-4` | Re-exports `./schema`, `./types`, and `{ createDb, Db }` — new table/types will be picked up automatically by `export *`. |
| DB migration docs | `packages/db/README.md:36-52` | Exact commands and the "additive changes only" fork-safety rule this new table must follow. |
| Existing consumer of `kycStatus` | `apps/wallet/src/auth.ts:36-48`, `apps/wallet/src/types/next-auth.d.ts:1-16` | Reads `users.kycStatus` straight into the session; do not change this file in this task. |
| Existing consumer of `kycStatus` (UI) | `apps/wallet/src/components/bottom-nav.tsx:241` | Displays `user?.kycStatus`; unaffected by this task. |
| Downstream task: onboarding UI | `.agelum/work/tasks/pending/07 KYC onboarding UI flow (5).md:17` | Confirms required fields: identity, ID front/back + selfie + proof of address documents, beneficial owner declaration, PEP/sanctions declaration, status screen with retry-on-rejection (i.e. resubmission must be supported — upsert, not insert-only). |
| Downstream task: gating | `.agelum/work/tasks/pending/08 KYC gating of invest, deposit and withdraw (3).md:17` | Confirms gating reads `users.kycStatus` via the session, not this package's API directly. |
| Product/status context | `.agelum/doc/docs/plan/status-2026-sep.md:76-77,106` | "Mock KYC onboarding flow (document upload, verification states: pending/approved/rejected) mirroring the SEPRELAD-driven requirements... (identity, beneficial owner, PEP/sanctions screening placeholders)"; package boundary explicitly named `packages/providers-kyc`. |
| Legal/domain context | `.agelum/doc/docs/research/paraguay.md:32-33,49` | SEPRELAD Res. 314/2021 — identity verification (KYC), source-of-funds/AML, suspicious-activity reporting are the drivers for the port's fields. No jurisdiction-specific types belong in the port itself (per acceptance criteria) — these are just the motivating requirements. |
| Architecture reference (stale path, content recovered via git history) | `.agelum/doc/docs/research/providers/operations-onboarding-compliance.json` (deleted from working tree, still in git history — `git show HEAD:.agelum/doc/docs/research/providers/operations-onboarding-compliance.json`) | Confirms: KYC/KYT can be internal or a provider, PII/documents stay off-chain, decision states include `pending_kyc`, and only an "approved" compliance decision should propagate an on-chain/custody-provider KYC grant. This validates keeping `KycApplication` data (PII) inside `packages/db`, never touching custody-provider adapters. |
| No test runner exists | repo-wide `package.json` search | No `vitest`/`jest` anywhere yet; relevant only to the (deferred) "unit tests" acceptance criterion, not to this plan's steps. |

## Implementation steps

### Phase 1 — Extend `packages/db` with the KYC application table

1. In `packages/db/src/schema.ts`, add a new table after `orderBookLevels` (around line 211), following the existing style (same imports already present: `index`, `integer`, `sqliteTable`, `text`, `uniqueIndex`; `KycStatus` is already imported at the top from `./types`):

   ```ts
   export const kycApplications = sqliteTable(
     "kyc_applications",
     {
       id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
       userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
       status: text("status").$type<KycStatus>().notNull().default("none"),
       identity: text("identity", { mode: "json" }).$type<Record<string, unknown>>(),
       documents: text("documents", { mode: "json" }).$type<Record<string, unknown>[]>(),
       beneficialOwners: text("beneficial_owners", { mode: "json" }).$type<Record<string, unknown>[]>(),
       screening: text("screening", { mode: "json" }).$type<Record<string, unknown>>(),
       rejectionReason: text("rejection_reason"),
       submittedAt: integer("submitted_at", { mode: "timestamp" }),
       decidedAt: integer("decided_at", { mode: "timestamp" }),
       autoDecideAt: integer("auto_decide_at", { mode: "timestamp" }),
       createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
       updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
     },
     (table) => [
       uniqueIndex("kyc_applications_user_id_unique").on(table.userId),
       index("kyc_applications_status_idx").on(table.status),
     ],
   );
   ```

   One row per user (enforced by the unique index); resubmission after rejection is an upsert on `userId`, not a new row — this matches task 07's "retry on rejection" requirement.

2. Add the relation next to the other `relations(...)` blocks (near line 224):

   ```ts
   export const kycApplicationsRelations = relations(kycApplications, ({ one }) => ({
     user: one(users, { fields: [kycApplications.userId], references: [users.id] }),
   }));
   ```

   And add `kycApplications: many(kycApplications)` to the existing `usersRelations` block (`packages/db/src/schema.ts:213`).

3. Add `kycApplications` and `kycApplicationsRelations` to the aggregate `schema` export object (`packages/db/src/schema.ts:226`).

4. In `packages/db/src/types.ts`, add near the other inferred types (after `OrderBookLevel`/`NewOrderBookLevel`, line 53-54), importing `kycApplications` in the existing import block from `./schema` (line 1-16):

   ```ts
   export type KycApplicationRow = typeof kycApplications.$inferSelect;
   export type NewKycApplicationRow = typeof kycApplications.$inferInsert;
   ```

5. Generate and apply the migration from `packages/db`:
   ```
   cd packages/db
   pnpm db:generate
   ```
   Review the generated `drizzle/0001_*.sql` (new `kyc_applications` table, FK to `users`, indexes) and the updated `drizzle/meta/_journal.json`, then:
   ```
   pnpm db:migrate
   ```
   Commit the schema/types changes together with the new migration file and journal update, per `packages/db/README.md:41` ("one logical change").

### Phase 2 — Scaffold `packages/providers-kyc`

6. Create `packages/providers-kyc/package.json`, copying the shape of `packages/db/package.json:1-27`:
   ```json
   {
     "name": "@repo/providers-kyc",
     "version": "0.0.0",
     "private": true,
     "exports": {
       ".": "./src/index.ts"
     },
     "scripts": {
       "lint": "eslint . --max-warnings 0",
       "check-types": "tsc --noEmit"
     },
     "dependencies": {
       "@repo/db": "workspace:*",
       "drizzle-orm": "^0.44.7"
     },
     "devDependencies": {
       "@repo/eslint-config": "workspace:*",
       "@repo/typescript-config": "workspace:*",
       "@types/node": "^22.15.3",
       "eslint": "^9.19.1",
       "typescript": "5.9.2"
     }
   }
   ```
   (`drizzle-orm` is a direct dependency here because the mock adapter imports `eq` from it directly, not just through `@repo/db`.)

7. Create `packages/providers-kyc/tsconfig.json`, identical in shape to `packages/db/tsconfig.json:1-11`:
   ```json
   {
     "extends": "@repo/typescript-config/base.json",
     "compilerOptions": {
       "outDir": "dist",
       "rootDir": ".",
       "types": ["node"]
     },
     "include": ["src"],
     "exclude": ["node_modules", "dist"]
   }
   ```

8. Create `packages/providers-kyc/eslint.config.mjs`, identical to `packages/db/eslint.config.mjs`:
   ```js
   import { config } from "@repo/eslint-config/base";

   /** @type {import("eslint").Linter.Config[]} */
   export default config;
   ```

9. Run `pnpm install` at the repo root so the new workspace package is linked.

### Phase 3 — Port and types (`packages/providers-kyc/src/types.ts`, `src/port.ts`)

10. Create `packages/providers-kyc/src/types.ts`. Keep this file provider-agnostic and jurisdiction-agnostic (per acceptance criteria): no Fireblocks/Hedera-specific fields, no SEPRELAD-specific field names — only generic identity/document/beneficial-owner/screening shapes that any jurisdiction's KYC flow needs:

    ```ts
    export type KycStatus = "none" | "pending" | "approved" | "rejected";

    export type KycDocumentType =
      | "government_id"
      | "proof_of_address"
      | "selfie"
      | "beneficial_owner_declaration"
      | "other";

    export interface KycDocument {
      type: KycDocumentType;
      fileName: string;
      uploadedAt: string; // ISO 8601
    }

    export interface KycIdentity {
      fullName: string;
      dateOfBirth: string; // ISO date (YYYY-MM-DD)
      nationality: string;
      documentType: string;
      documentNumber: string;
      address?: string;
    }

    export interface BeneficialOwnerDeclaration {
      fullName: string;
      documentNumber: string;
      ownershipPercentage: number;
      isPoliticallyExposed: boolean;
    }

    export interface ScreeningResult {
      pepMatch: boolean;
      sanctionsMatch: boolean;
      checkedAt: string; // ISO 8601
    }

    export interface KycSubmissionInput {
      identity: KycIdentity;
      documents: KycDocument[];
      beneficialOwners?: BeneficialOwnerDeclaration[];
    }

    export interface KycApplication {
      id: string;
      userId: string;
      status: KycStatus;
      identity: KycIdentity;
      documents: KycDocument[];
      beneficialOwners: BeneficialOwnerDeclaration[];
      screening: ScreeningResult | null;
      rejectionReason: string | null;
      submittedAt: string; // ISO 8601
      decidedAt: string | null; // ISO 8601
    }
    ```

    Note: this `KycStatus` is intentionally a separate, string-identical declaration from `@repo/db`'s `KycStatus` (`packages/db/src/types.ts:18`) rather than a re-export — it keeps the port importable without a hard dependency on `@repo/db` (only the mock *adapter*, not the port/types, should depend on persistence).

11. Create `packages/providers-kyc/src/port.ts`:
    ```ts
    import type { KycApplication, KycStatus, KycSubmissionInput } from "./types";

    export interface KycProvider {
      getStatus(userId: string): Promise<KycStatus>;
      getApplication(userId: string): Promise<KycApplication | null>;
      submitApplication(userId: string, input: KycSubmissionInput): Promise<KycApplication>;
    }
    ```

### Phase 4 — Deterministic mock adapter (`packages/providers-kyc/src/mock/*`)

12. Create `packages/providers-kyc/src/mock/rules.ts` — the deterministic decision engine, isolated from persistence so it stays trivially testable:

    ```ts
    import type { KycDocument, KycStatus, ScreeningResult } from "../types";

    export interface MockDecision {
      status: Extract<KycStatus, "approved" | "rejected">;
      rejectionReason: string | null;
      screening: ScreeningResult | null;
    }

    const SCREENING_PATTERN = /(pep|sanction)/i;
    const REJECT_PATTERN = /reject/i;
    const APPROVE_PATTERN = /approve/i;

    export function resolveInstantDecision(documents: KycDocument[], now: Date): MockDecision | null {
      const flagged = documents.find((doc) => SCREENING_PATTERN.test(doc.fileName));
      if (flagged) {
        return {
          status: "rejected",
          rejectionReason: `Simulated rejection: screening placeholder triggered by document "${flagged.fileName}"`,
          screening: {
            pepMatch: /pep/i.test(flagged.fileName),
            sanctionsMatch: /sanction/i.test(flagged.fileName),
            checkedAt: now.toISOString(),
          },
        };
      }
      const rejected = documents.find((doc) => REJECT_PATTERN.test(doc.fileName));
      if (rejected) {
        return {
          status: "rejected",
          rejectionReason: `Simulated rejection: document name matched "reject" (${rejected.fileName})`,
          screening: null,
        };
      }
      const approved = documents.find((doc) => APPROVE_PATTERN.test(doc.fileName));
      if (approved) {
        return { status: "approved", rejectionReason: null, screening: null };
      }
      return null;
    }
    ```

13. Create `packages/providers-kyc/src/mock/mock-kyc-provider.ts` — the `KycProvider` implementation backed by `@repo/db`:

    ```ts
    import { eq } from "drizzle-orm";
    import { kycApplications, users, type Db } from "@repo/db";
    import type { KycProvider } from "../port";
    import type { KycApplication, KycStatus, KycSubmissionInput } from "../types";
    import { resolveInstantDecision } from "./rules";

    export interface MockKycProviderOptions {
      autoApproveAfterMs?: number;
      now?: () => Date;
    }

    const DEFAULT_AUTO_APPROVE_MS = 15_000;

    export function createMockKycProvider(db: Db, options: MockKycProviderOptions = {}): KycProvider {
      const autoApproveAfterMs = options.autoApproveAfterMs ?? DEFAULT_AUTO_APPROVE_MS;
      const now = options.now ?? (() => new Date());

      function toApplication(row: typeof kycApplications.$inferSelect): KycApplication {
        return {
          id: row.id,
          userId: row.userId,
          status: row.status,
          identity: (row.identity ?? {}) as unknown as KycApplication["identity"],
          documents: (row.documents ?? []) as unknown as KycApplication["documents"],
          beneficialOwners: (row.beneficialOwners ?? []) as unknown as KycApplication["beneficialOwners"],
          screening: (row.screening ?? null) as unknown as KycApplication["screening"],
          rejectionReason: row.rejectionReason,
          submittedAt: (row.submittedAt ?? row.createdAt).toISOString(),
          decidedAt: row.decidedAt ? row.decidedAt.toISOString() : null,
        };
      }

      async function resolvePending(row: typeof kycApplications.$inferSelect) {
        if (row.status !== "pending" || !row.autoDecideAt || now() < row.autoDecideAt) {
          return row;
        }
        const decidedAt = now();
        const [updated] = await db
          .update(kycApplications)
          .set({ status: "approved", decidedAt, updatedAt: decidedAt })
          .where(eq(kycApplications.id, row.id))
          .returning();
        await db.update(users).set({ kycStatus: "approved" }).where(eq(users.id, row.userId));
        return updated!;
      }

      async function getApplication(userId: string): Promise<KycApplication | null> {
        const [row] = await db.select().from(kycApplications).where(eq(kycApplications.userId, userId));
        if (!row) return null;
        const resolved = await resolvePending(row);
        return toApplication(resolved);
      }

      return {
        async getStatus(userId) {
          const application = await getApplication(userId);
          return application?.status ?? "none";
        },

        getApplication,

        async submitApplication(userId, input: KycSubmissionInput) {
          const submittedAt = now();
          const decision = resolveInstantDecision(input.documents, submittedAt);
          const status: KycStatus = decision?.status ?? "pending";

          const values = {
            userId,
            status,
            identity: input.identity as unknown as Record<string, unknown>,
            documents: input.documents as unknown as Record<string, unknown>[],
            beneficialOwners: (input.beneficialOwners ?? []) as unknown as Record<string, unknown>[],
            screening: (decision?.screening ?? null) as unknown as Record<string, unknown> | null,
            rejectionReason: decision?.rejectionReason ?? null,
            submittedAt,
            decidedAt: decision ? submittedAt : null,
            autoDecideAt: decision ? null : new Date(submittedAt.getTime() + autoApproveAfterMs),
            updatedAt: submittedAt,
          };

          const [row] = await db
            .insert(kycApplications)
            .values(values)
            .onConflictDoUpdate({ target: kycApplications.userId, set: values })
            .returning();

          await db.update(users).set({ kycStatus: status }).where(eq(users.id, userId));

          return toApplication(row!);
        },
      };
    }
    ```

    Key design points to preserve:
    - **Lazy timer resolution**: no background timers/cron. `pending → approved` transitions are computed on the next `getApplication`/`getStatus` call by comparing `now()` to the stored `autoDecideAt`. This is what makes the "auto-approve after N seconds" behavior deterministic and unit-testable (inject `now` and `autoApproveAfterMs`) without real waiting or fake timers.
    - **Resubmission is an upsert** (`onConflictDoUpdate` on the unique `userId` index), so a rejected user can resubmit and get a fresh `pending` state — required by task 07's "retry on rejection".
    - **`users.kycStatus` is written on every transition** (submit, and lazy auto-resolve), keeping the existing `auth.ts`/session/UI consumers correct without any changes to those files.

### Phase 5 — Public exports and documentation

14. Create `packages/providers-kyc/src/index.ts`:
    ```ts
    export * from "./types";
    export type { KycProvider } from "./port";
    export { createMockKycProvider, type MockKycProviderOptions } from "./mock/mock-kyc-provider";
    ```

15. Create `packages/providers-kyc/README.md` documenting (per acceptance criteria, "Mock behavior is deterministic and documented"):
    - The `KycProvider` port shape and the three methods.
    - The persistence model: one row per user in `kyc_applications` (`packages/db`), status mirrored onto `users.kyc_status`.
    - The deterministic mock rules, stated as an exact, literal convention for demos/tests:
      - Any submitted document whose `fileName` matches `/pep|sanction/i` → immediate `rejected`, with `screening.pepMatch`/`screening.sanctionsMatch` set from which keyword matched.
      - Else any document matching `/reject/i` → immediate `rejected`.
      - Else any document matching `/approve/i` → immediate `approved`.
      - Otherwise → `pending`, auto-resolving to `approved` once `autoApproveAfterMs` (default 15000ms, configurable via `createMockKycProvider(db, { autoApproveAfterMs })`) has elapsed since submission, evaluated lazily on the next status/application read (not a background timer).
    - How to inject a fake clock (`now: () => Date`) for deterministic testing.
    - Explicitly note this package intentionally has no `apps/wallet` wiring — that belongs to tasks 07/08.

## Explicitly out of scope for this task

- Any changes under `apps/wallet` (API routes, UI, `auth.ts`) — covered by tasks 07 and 08.
- Selecting/installing a test framework and writing the unit tests for the acceptance criterion "Unit tests cover state transitions" — per the planning instructions, testing is handled in a separate pass. Flag for that pass: no test runner exists in this monorepo yet.
- Real document storage (file bytes/blob storage) — the mock only stores document metadata (`type`, `fileName`, `uploadedAt`), matching task 07's "stored via the mock" wording.
