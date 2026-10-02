import type { BrowserContext, Route } from "@playwright/test";

// 1x1 transparent PNG.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';

const png = (route: Route) => route.fulfill({ status: 200, contentType: "image/png", body: PNG });

const STUBS: { host: string; fulfill: (route: Route) => Promise<void> }[] = [
  { host: "api.qrserver.com", fulfill: png },
  { host: "images.unsplash.com", fulfill: png },
  { host: "github.com", fulfill: png },
  {
    host: "grainy-gradients.vercel.app",
    fulfill: (route) => route.fulfill({ status: 200, contentType: "image/svg+xml", body: SVG }),
  },
];

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export type NetworkLog = {
  /** Stubbed requests per host, e.g. hits["api.qrserver.com"]. */
  hits: Record<string, string[]>;
  /** Requests to unknown third-party hosts; aborted. Fixtures assert this stays empty. */
  escaped: string[];
};

/**
 * Serves every known third-party asset (QR codes, Unsplash, decorative SVGs,
 * avatars) from fixtures and aborts any other non-local request, so tests never
 * depend on the internet.
 */
export async function stubThirdParty(context: BrowserContext): Promise<NetworkLog> {
  const log: NetworkLog = { hits: {}, escaped: [] };

  await context.route(
    (url) => url.protocol.startsWith("http") && !LOCAL_HOSTS.has(url.hostname),
    async (route) => {
      const url = new URL(route.request().url());
      const stub = STUBS.find((s) => s.host === url.hostname);
      if (!stub) {
        log.escaped.push(url.href);
        return route.abort("blockedbyclient");
      }
      (log.hits[stub.host] ??= []).push(url.href);
      return stub.fulfill(route);
    },
  );

  return log;
}
