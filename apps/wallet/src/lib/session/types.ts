import type { KycStatus } from "@repo/db";

export type AppSessionUser = { id: string; name: string; email: string; image: string | null; kycStatus: KycStatus };
export type AppSession = { user: AppSessionUser | null; status: "loading" | "authenticated" | "unauthenticated" };
export type AppSessionContextValue = AppSession & { signIn: (callbackUrl?: string) => Promise<void>; signOut: () => Promise<void> };
