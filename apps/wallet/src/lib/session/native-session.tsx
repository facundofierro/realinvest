"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getApiUrl } from "@/lib/api-client";
import { getPlatform } from "./platform";
import type { AppSessionContextValue, AppSessionUser } from "./types";

type StoredSession = { accessToken: string; refreshToken: string; user: AppSessionUser };
const STORAGE_KEY = "native-session-v1";
let accessToken: string | null = null;
let refreshHandler: (() => Promise<boolean>) | null = null;

export const getNativeAccessToken = () => accessToken;
export async function refreshNativeAccessToken() { return refreshHandler?.() ?? false; }

async function readStoredSession(): Promise<StoredSession | null> {
  try {
    if (getPlatform() === "capacitor") {
      const { SecureStorage } = await import("@aparajita/capacitor-secure-storage");
      const value = await SecureStorage.get(STORAGE_KEY);
      return typeof value === "string" ? JSON.parse(value) as StoredSession : null;
    }
    if (getPlatform() === "tauri") {
      const [{ Stronghold }, { appDataDir }] = await Promise.all([import("@tauri-apps/plugin-stronghold"), import("@tauri-apps/api/path")]);
      const stronghold = await Stronghold.load(`${await appDataDir()}/realinvest.hold`, "realinvest-wallet-v1");
      let client;
      try { client = await stronghold.loadClient("session"); } catch { client = await stronghold.createClient("session"); }
      const data = await client.getStore().get(STORAGE_KEY);
      return data ? JSON.parse(new TextDecoder().decode(data)) as StoredSession : null;
    }
  } catch { /* Locked or unavailable storage is an unauthenticated state. */ }
  return null;
}

async function writeStoredSession(session: StoredSession | null) {
  if (getPlatform() === "capacitor") {
    const { SecureStorage } = await import("@aparajita/capacitor-secure-storage");
    if (session) await SecureStorage.set(STORAGE_KEY, JSON.stringify(session)); else await SecureStorage.remove(STORAGE_KEY);
    return;
  }
  if (getPlatform() === "tauri") {
    const [{ Stronghold }, { appDataDir }] = await Promise.all([import("@tauri-apps/plugin-stronghold"), import("@tauri-apps/api/path")]);
    const stronghold = await Stronghold.load(`${await appDataDir()}/realinvest.hold`, "realinvest-wallet-v1");
    let client;
    try { client = await stronghold.loadClient("session"); } catch { client = await stronghold.createClient("session"); }
    const store = client.getStore();
    if (session) await store.insert(STORAGE_KEY, Array.from(new TextEncoder().encode(JSON.stringify(session)))); else await store.remove(STORAGE_KEY);
    await stronghold.save();
  }
}

function accessTokenExpiresSoon(token: string) {
  try { const encoded = token.split(".")[1]; if (!encoded) return true; const payload = JSON.parse(atob(encoded.replace(/-/g, "+").replace(/_/g, "/"))); return !payload.exp || payload.exp * 1000 < Date.now() + 60_000; } catch { return true; }
}

const NativeSessionContext = createContext<AppSessionContextValue | null>(null);

export function NativeSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const refreshPromise = useRef<Promise<boolean> | null>(null);

  const clear = useCallback(async () => { accessToken = null; setSession(null); setStatus("unauthenticated"); try { await writeStoredSession(null); } catch {} }, []);
  const refresh = useCallback(async () => {
    if (refreshPromise.current) return refreshPromise.current;
    refreshPromise.current = (async () => {
      const current = session ?? await readStoredSession();
      if (!current) { await clear(); return false; }
      const response = await globalThis.fetch(getApiUrl("/api/auth/native/refresh"), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "omit", body: JSON.stringify({ refreshToken: current.refreshToken }) });
      if (!response.ok) { await clear(); return false; }
      const next = await response.json() as StoredSession;
      accessToken = next.accessToken; setSession(next); setStatus("authenticated"); await writeStoredSession(next); return true;
    })().finally(() => { refreshPromise.current = null; });
    return refreshPromise.current;
  }, [clear, session]);

  useEffect(() => { refreshHandler = refresh; return () => { refreshHandler = null; }; }, [refresh]);
  useEffect(() => { void (async () => { const saved = await readStoredSession(); if (!saved) { setStatus("unauthenticated"); return; } accessToken = saved.accessToken; setSession(saved); setStatus("authenticated"); if (accessTokenExpiresSoon(saved.accessToken)) await refresh(); })(); }, [refresh]);
  useEffect(() => { if (!session) return; const timeout = window.setTimeout(() => void refresh(), Math.max(1_000, 14 * 60 * 1000)); return () => window.clearTimeout(timeout); }, [refresh, session]);

  const signIn = useCallback(async () => {
    const state = crypto.randomUUID();
    const start = new URL(getApiUrl("/api/auth/native/start"));
    start.searchParams.set("redirect_uri", "realinvestwallet://auth-callback"); start.searchParams.set("state", state);
    const complete = async (value: string) => {
      const url = new URL(value); if (url.protocol !== "realinvestwallet:" || url.host !== "auth-callback" || url.searchParams.get("state") !== state) return;
      const code = url.searchParams.get("code"); if (!code) return;
      const response = await globalThis.fetch(getApiUrl("/api/auth/native/token"), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "omit", body: JSON.stringify({ code, state }) });
      if (!response.ok) { await clear(); return; }
      const next = await response.json() as StoredSession; accessToken = next.accessToken; setSession(next); setStatus("authenticated"); await writeStoredSession(next);
    };
    if (getPlatform() === "capacitor") {
      const [{ App }, { Browser }] = await Promise.all([import("@capacitor/app"), import("@capacitor/browser")]);
      await App.addListener("appUrlOpen", ({ url }) => { void complete(url); }); await Browser.open({ url: start.toString() });
    } else {
      const [{ onOpenUrl }, { openUrl }] = await Promise.all([import("@tauri-apps/plugin-deep-link"), import("@tauri-apps/plugin-opener")]);
      await onOpenUrl((urls) => urls.forEach((url) => void complete(url))); await openUrl(start.toString());
    }
  }, [clear]);
  const signOut = useCallback(async () => { const current = session; if (current) { try { await globalThis.fetch(getApiUrl("/api/auth/native/revoke"), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "omit", body: JSON.stringify({ refreshToken: current.refreshToken }) }); } catch {} } await clear(); }, [clear, session]);
  const value = useMemo(() => ({ user: session?.user ?? null, status, signIn, signOut }), [session, status, signIn, signOut]);
  return <NativeSessionContext.Provider value={value}>{children}</NativeSessionContext.Provider>;
}

export function useNativeSession() { const session = useContext(NativeSessionContext); if (!session) throw new Error("NativeSessionProvider is required"); return session; }
