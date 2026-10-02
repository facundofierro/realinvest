import { kycApplications, type Db, users } from "@repo/db";
import { eq } from "drizzle-orm";
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
    if (row.status !== "pending" || !row.autoDecideAt || now() < row.autoDecideAt) return row;

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
    return toApplication(await resolvePending(row));
  }

  return {
    async getStatus(userId) {
      const application = await getApplication(userId);
      return application?.status ?? "none";
    },

    getApplication,

    async submitApplication(userId, input: KycSubmissionInput) {
      const submittedAt = now();
      const decision = resolveInstantDecision(input, submittedAt);
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
