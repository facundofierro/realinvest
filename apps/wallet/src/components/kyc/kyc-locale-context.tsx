"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { kycCopy, type KycLocale } from "@/lib/kyc-copy";

const KycLocaleContext = createContext<{ locale: KycLocale; setLocale: (locale: KycLocale) => void } | null>(null);

export function KycLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<KycLocale>("es");
  useEffect(() => { const value = localStorage.getItem("kyc-locale"); if (value === "es" || value === "en") setLocale(value); }, []);
  const update = (value: KycLocale) => { setLocale(value); localStorage.setItem("kyc-locale", value); };
  return <KycLocaleContext.Provider value={{ locale, setLocale: update }}>{children}</KycLocaleContext.Provider>;
}

export function useKycCopy() {
  const context = useContext(KycLocaleContext);
  if (!context) throw new Error("useKycCopy must be used within KycLocaleProvider");
  return { copy: kycCopy[context.locale], ...context };
}
