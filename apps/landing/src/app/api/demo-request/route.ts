import { NextResponse } from "next/server";
import { z } from "zod";
import { demoRequestSchema } from "@/lib/demo-request-schema";
import { submitDemoRequest } from "@/lib/submit-demo-request";

export const runtime = "nodejs";

// Best-effort per-IP throttle (in-memory, per server instance).
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

function isThrottled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5_000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isThrottled(ip)) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas solicitudes. Probá de nuevo en un minuto." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Solicitud inválida." },
      { status: 400 },
    );
  }

  const parsed = demoRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Revisá los datos del formulario.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  // Honeypot filled: pretend success without storing anything.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  try {
    await submitDemoRequest(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[landing] demo request failed", error);
    return NextResponse.json(
      { ok: false, error: "No pudimos registrar tu solicitud." },
      { status: 500 },
    );
  }
}
