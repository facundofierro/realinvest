import { demoRequests } from "@repo/db";
import { getDb } from "@/lib/db";
import type { DemoRequestInput } from "@/lib/demo-request-schema";

/** Persists a validated demo request in the shared `demo_requests` table. */
export async function submitDemoRequest(data: DemoRequestInput) {
  await getDb()
    .insert(demoRequests)
    .values({
      name: data.nombre,
      company: data.empresa,
      role: data.cargo || null,
      email: data.email.toLowerCase(),
      phone: data.telefono || null,
      country: data.pais,
      city: data.ciudad || null,
      projectCount: data.proyectos || null,
      interests: data.intereses ?? [],
      comments: data.comentarios || null,
    });
}
