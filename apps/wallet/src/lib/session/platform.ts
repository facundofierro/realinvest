export type AppPlatform = "web" | "capacitor" | "tauri";

export function getPlatform(): AppPlatform {
  if (typeof window === "undefined") return "web";
  if ("__TAURI_INTERNALS__" in window) return "tauri";
  const capacitor = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  if (capacitor?.isNativePlatform?.() || window.location.protocol === "capacitor:") return "capacitor";
  return "web";
}
