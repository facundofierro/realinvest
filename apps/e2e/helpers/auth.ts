import { expect, type APIRequestContext } from "@playwright/test";

const HINT =
  "Start the wallet dev server with E2E_AUTH_BYPASS=1 (playwright.config.ts does this when it starts the server).";

/**
 * Signs in through the env-gated "e2e" Credentials provider
 * (apps/wallet/src/auth.ts). `userId` is "demo-user" or an "e2e-*" id, which the
 * wallet creates on demand. `request` may be `page.request` (shares cookies with
 * the page's context) or a standalone APIRequestContext.
 */
export async function loginAs(request: APIRequestContext, userId = "demo-user") {
  const csrfRes = await request.get("/api/auth/csrf");
  if (!csrfRes.ok()) throw new Error(`GET /api/auth/csrf -> ${csrfRes.status()}. ${HINT}`);
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  const loginRes = await request.post("/api/auth/callback/e2e", {
    form: { csrfToken, userId, callbackUrl: "/" },
    maxRedirects: 0,
  });
  if (loginRes.status() >= 400) {
    throw new Error(`POST /api/auth/callback/e2e -> ${loginRes.status()}. ${HINT}`);
  }

  const session = await getSession(request);
  if (session?.user?.id !== userId) {
    throw new Error(`E2E login for ${userId} did not produce a session. ${HINT}`);
  }
  return session;
}

type Session = { user?: { id?: string; name?: string; email?: string; kycStatus?: string } } | null;

export async function getSession(request: APIRequestContext): Promise<Session> {
  const res = await request.get("/api/auth/session");
  expect(res.ok()).toBe(true);
  return (await res.json()) as Session;
}

/** A unique "e2e-*" user id accepted by the wallet's e2e login. */
export function newUserId(label: string) {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20);
  const rand = Math.random().toString(36).slice(2, 8);
  return `e2e-${slug}-${Date.now().toString(36)}-${rand}`;
}
