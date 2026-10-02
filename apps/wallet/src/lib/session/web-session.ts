"use client";

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from "next-auth/react";
import type { AppSessionContextValue, AppSessionUser } from "./types";

export function useWebSession(): AppSessionContextValue {
  const { data, status } = useSession();
  return {
    user: (data?.user as AppSessionUser | undefined) ?? null,
    status,
    signIn: async (callbackUrl = "/") => { await nextAuthSignIn("google", { redirectTo: callbackUrl }); },
    signOut: async () => { await nextAuthSignOut({ redirectTo: "/login" }); },
  };
}
