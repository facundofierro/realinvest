import type { KycStatus, KycSubmissionInput, ScreeningResult } from "../types";

export interface MockDecision {
  status: Extract<KycStatus, "approved" | "rejected">;
  rejectionReason: string | null;
  screening: ScreeningResult | null;
}

const SCREENING_PATTERN = /(pep|sanction)/i;
const REJECT_PATTERN = /reject/i;
const APPROVE_PATTERN = /approve/i;

export function resolveInstantDecision(input: KycSubmissionInput, now: Date): MockDecision | null {
  if (input.identity.isPoliticallyExposed || input.identity.isSanctioned) {
    return {
      status: "rejected",
      rejectionReason: "Simulated rejection: applicant self-declared as PEP or sanctioned",
      screening: {
        pepMatch: input.identity.isPoliticallyExposed,
        sanctionsMatch: input.identity.isSanctioned,
        checkedAt: now.toISOString(),
      },
    };
  }

  const { documents } = input;
  const flagged = documents.find((document) => SCREENING_PATTERN.test(document.fileName));
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

  const rejected = documents.find((document) => REJECT_PATTERN.test(document.fileName));
  if (rejected) {
    return {
      status: "rejected",
      rejectionReason: `Simulated rejection: document name matched "reject" (${rejected.fileName})`,
      screening: null,
    };
  }

  const approved = documents.find((document) => APPROVE_PATTERN.test(document.fileName));
  if (approved) return { status: "approved", rejectionReason: null, screening: null };

  return null;
}
