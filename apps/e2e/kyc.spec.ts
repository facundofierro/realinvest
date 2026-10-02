import { test, expect } from "./fixtures";
import { setUsdtBalance } from "./helpers/db";
import {
  APPROVE_FILES,
  DEFAULT_IDENTITY,
  KYC_COPY,
  expectSessionKyc,
  fillKycWizard,
  rejectKyc,
  submitPendingKyc,
  waitForSessionKyc,
} from "./helpers/kyc";

const DASHBOARD_KYC_BANNER = "Completá tu verificación de identidad";

test.describe("KYC onboarding", () => {
  test("instant approval unlocks the app", async ({ freshUser: { page } }) => {
    await page.goto("/");
    await expect(page.getByText(DASHBOARD_KYC_BANNER)).toBeVisible();

    await page.goto("/kyc");
    const updated = waitForSessionKyc(page, "approved");
    await fillKycWizard(page, { fileNames: APPROVE_FILES });
    await expect(page.getByText(KYC_COPY.approved)).toBeVisible();
    await updated;
    await expectSessionKyc(page, "approved");

    await page.getByRole("link", { name: "Ir al inicio" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(DASHBOARD_KYC_BANNER)).toHaveCount(0);
  });

  test("self-declared PEP is rejected and can retry with prefilled identity", async ({ freshUser: { page } }) => {
    await page.goto("/kyc");
    const updated = waitForSessionKyc(page, "rejected");
    await fillKycWizard(page, { pep: true });
    await expect(page.getByText("Simulated rejection: applicant self-declared as PEP")).toBeVisible();
    await updated;
    await expectSessionKyc(page, "rejected");

    await page.getByRole("button", { name: KYC_COPY.retry }).click();
    await expect(page.getByLabel("Nombre completo")).toHaveValue(DEFAULT_IDENTITY.fullName);
    await expect(page.getByLabel("Número de documento")).toHaveValue(DEFAULT_IDENTITY.documentNumber);
  });

  test("document named 'reject' is rejected", async ({ freshUser: { page } }) => {
    await page.goto("/kyc");
    await fillKycWizard(page, { fileNames: ["reject-id.png", "id-back.png", "selfie.png", "address.png"] });
    await expect(page.getByText(KYC_COPY.rejectedPrefix)).toBeVisible();
    await expect(page.getByText(/document name matched "reject" \(reject-id\.png\)/)).toBeVisible();
  });

  test("document named 'sanction' is rejected by screening", async ({ freshUser: { page } }) => {
    await page.goto("/kyc");
    await fillKycWizard(page, { fileNames: ["id-front.png", "sanction-list.png", "selfie.png", "address.png"] });
    await expect(page.getByText(/screening placeholder triggered by document "sanction-list\.png"/)).toBeVisible();
  });

  test("wizard blocks Siguiente until required fields and documents are set", async ({ freshUser: { page } }) => {
    await page.goto("/kyc");
    await page.getByRole("button", { name: KYC_COPY.next }).click();
    // Still on step 0: the identity inputs remain and validation messages appear.
    await expect(page.getByLabel("Nombre completo")).toBeVisible();
    await expect(page.locator(".text-destructive").first()).toBeVisible();
  });

  test("pending application auto-approves", async ({ freshUser: { page } }) => {
    // Mock auto-approves 15 s after submit; the page polls every 3 s (decision D5).
    test.setTimeout(90_000);
    await submitPendingKyc(page);
    await expectSessionKyc(page, "pending");
    const approved = waitForSessionKyc(page, "approved", 30_000);
    await expect(page.getByText(KYC_COPY.approved)).toBeVisible({ timeout: 30_000 });
    await approved;
    await expectSessionKyc(page, "approved");
  });
});

test.describe("KYC gates", () => {
  test("deposit is blocked without KYC (UI and API)", async ({ freshUser: { page } }) => {
    const api = await page.request.get("/api/wallet/deposit");
    expect(api.status()).toBe(403);
    expect(await api.json()).toMatchObject({ error: "kyc_required", status: "none" });

    await page.goto("/deposit");
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(KYC_COPY.blocked.none)).toBeVisible();
    await dialog.getByRole("link", { name: "Completar verificación" }).click();
    await expect(page).toHaveURL(/\/kyc$/);
  });

  test("deposit is blocked while KYC is pending", async ({ freshUser: { page } }) => {
    await submitPendingKyc(page);
    await page.goto("/deposit");
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(KYC_COPY.blocked.pending)).toBeVisible();
    await expect(dialog.getByText(KYC_COPY.pending)).toBeVisible();
  });

  test("deposit is blocked with the rejection reason after rejection", async ({ freshUser: { page } }) => {
    await rejectKyc(page);
    await page.goto("/deposit");
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(KYC_COPY.blocked.rejected)).toBeVisible();
    await expect(dialog.getByText(/document name matched "reject"/)).toBeVisible();
  });

  test("withdraw is blocked without KYC even with a balance", async ({ freshUser: { page, userId } }) => {
    await setUsdtBalance(userId, 50);
    await page.goto("/withdraw");
    await expect(page.getByText("Disponible: $50.00")).toBeVisible();
    await page.getByLabel("Monto a retirar").fill("10");
    await page.getByLabel("Dirección de destino (TRC20)").fill("TXYZabcdefghijkl123456");
    await page.getByRole("button", { name: "Solicitar Retiro" }).click();
    await expect(page.getByRole("dialog").getByText(KYC_COPY.blocked.none)).toBeVisible();

    const api = await page.request.post("/api/wallet/withdraw", {
      data: { amount: 10, address: "TXYZabcdefghijkl123456" },
    });
    expect(api.status()).toBe(403);
  });
});
