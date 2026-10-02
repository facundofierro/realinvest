"use client";

import { SessionProvider } from "next-auth/react";
import { getPlatform } from "./platform";
import { NativeSessionProvider, useNativeSession } from "./native-session";
import { useWebSession } from "./web-session";
import type { AppSessionContextValue } from "./types";

export function AppSessionProvider({ children }: { children: React.ReactNode }) {
  return getPlatform() === "web" ? <SessionProvider>{children}</SessionProvider> : <NativeSessionProvider>{children}</NativeSessionProvider>;
}
export function useAppSession(): AppSessionContextValue {
  // Platform is fixed for the lifetime of a loaded static bundle.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return getPlatform() === "web" ? useWebSession() : useNativeSession();
}
export { getPlatform } from "./platform";
export { getNativeAccessToken, refreshNativeAccessToken } from "./native-session";
export type { AppSession, AppSessionContextValue, AppSessionUser } from "./types";
