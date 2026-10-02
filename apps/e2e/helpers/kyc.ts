import { expect, type Page } from "@playwright/test";
import { getSession } from "./auth";

// Spanish copy from apps/wallet/src/lib/kyc-copy.ts (the default KYC locale).
export const KYC_COPY = {
  next: "Siguiente",
  submit: "Enviar verificación",
  noBeneficialOwner: "No tengo un beneficiario final distinto de mí mismo",
  pending: "Tu verificación está en revisión.",
  approved: "¡Verificación aprobada!",
  rejectedPrefix: "Tu verificación fue rechazada:",
  retry: "Reintentar verificación",
  blocked: {
    none: "Verificación requerida",
    pending: "Verificación en revisión",
    rejected: "Verificación rechazada",
  },
} as const;

export const NEUTRAL_FILES = ["id-front.png", "id-back.png", "selfie.png", "address.png"] as const;
export const APPROVE_FILES = ["approve-id-front.png", "id-back.png", "selfie.png", "address.png"] as const;

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

export type KycIdentity = {
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  documentNumber: string;
};

export const DEFAULT_IDENTITY: KycIdentity = {
  fullName: "Ana E2E Tester",
  dateOfBirth: "1990-05-17",
  nationality: "Argentina",
  documentNumber: "30123456",
};

/**
 * Walks the 5-step KYC wizard on /kyc and submits it. Outcomes follow the mock
 * rules (packages/providers-kyc/src/mock/rules.ts): file names with "approve" /
 * "reject" / "pep" / "sanction" decide instantly; anything else stays pending.
 */
export async function fillKycWizard(
  page: Page,
  {
    fileNames = NEUTRAL_FILES,
    pep = false,
    sanctioned = false,
    identity = DEFAULT_IDENTITY,
  }: {
    fileNames?: readonly string[];
    pep?: boolean;
    sanctioned?: boolean;
    identity?: KycIdentity;
  } = {},
) {
  const next = page.getByRole("button", { name: KYC_COPY.next });

  // Step 0: identity.
  await page.getByLabel("Nombre completo").fill(identity.fullName);
  await page.getByLabel("Fecha de nacimiento").fill(identity.dateOfBirth);
  await page.getByLabel("Nacionalidad").fill(identity.nationality);
  await page.getByLabel("Número de documento").fill(identity.documentNumber);
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "DNI" }).click();
  await next.click();

  // Step 1: four documents (the inputs are sr-only; setInputFiles works on hidden inputs).
  const inputs = page.locator('input[type="file"]');
  await expect(inputs).toHaveCount(4);
  for (const [i, name] of fileNames.entries()) {
    await inputs.nth(i).setInputFiles({ name, mimeType: "image/png", buffer: PNG });
  }
  for (const name of fileNames) await expect(page.getByText(name, { exact: true })).toBeVisible();
  await next.click();

  // Step 2: beneficial owner ("none" is pre-checked for a first submission).
  await expect(page.getByText(KYC_COPY.noBeneficialOwner)).toBeVisible();
  await next.click();

  // Step 3: PEP / sanctions. Checkbox order: [pep yes, pep no, sanctions yes, sanctions no].
  const boxes = page.getByRole("checkbox");
  await expect(boxes).toHaveCount(4);
  await boxes.nth(pep ? 0 : 1).click();
  await boxes.nth(sanctioned ? 2 : 3).click();
  await next.click();

  // Step 4: review lists the selected files, then submit.
  for (const name of fileNames) await expect(page.getByText(new RegExp(name.replace(".", "\\.")))).toBeVisible();
  await page.getByRole("button", { name: KYC_COPY.submit }).click();
}

/**
 * Resolves when the page's own session update (kyc-onboarding-page.tsx calls
 * useSession().update({}) once the application status differs) returns
 * `status`. Start it before the action that triggers it. Do not poll
 * /api/auth/session from the test while that update is in flight: a concurrent
 * GET re-issues the old JWT cookie and can overwrite the updated one.
 */
export function waitForSessionKyc(page: Page, status: string, timeout = 15_000) {
  return page.waitForResponse(
    async (res) =>
      res.url().endsWith("/api/auth/session") &&
      res.request().method() === "POST" &&
      ((await res.json().catch(() => null)) as { user?: { kycStatus?: string } } | null)?.user
        ?.kycStatus === status,
    { timeout },
  );
}

/** Checks the stored session; call only after waitForSessionKyc has resolved. */
export async function expectSessionKyc(page: Page, status: string) {
  expect((await getSession(page.request))?.user?.kycStatus).toBe(status);
}

/** Submits a KYC application that the mock approves instantly. */
export async function approveKyc(page: Page) {
  await page.goto("/kyc");
  const updated = waitForSessionKyc(page, "approved");
  await fillKycWizard(page, { fileNames: APPROVE_FILES });
  await expect(page.getByText(KYC_COPY.approved)).toBeVisible();
  await updated;
}

/** Submits a KYC application that stays pending (auto-approves after 15 s). */
export async function submitPendingKyc(page: Page) {
  await page.goto("/kyc");
  const updated = waitForSessionKyc(page, "pending");
  await fillKycWizard(page);
  await expect(page.getByText(KYC_COPY.pending)).toBeVisible();
  await updated;
}

/** Submits a KYC application that the mock rejects instantly. */
export async function rejectKyc(page: Page) {
  await page.goto("/kyc");
  const updated = waitForSessionKyc(page, "rejected");
  await fillKycWizard(page, { fileNames: ["reject-id-front.png", "id-back.png", "selfie.png", "address.png"] });
  await expect(page.getByText(KYC_COPY.rejectedPrefix)).toBeVisible();
  await updated;
}
