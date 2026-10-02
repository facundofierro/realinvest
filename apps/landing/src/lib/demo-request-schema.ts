import { z } from "zod";

export const projectCounts = ["1", "2-3", "4+"] as const;

export const interestOptions = [
  "Plataforma de ventas",
  "Lanzamientos por etapas",
  "Pagos con cripto",
  "3D y multimedia",
  "Marketing, CRM y agentes de IA",
] as const;

const optionalText = (max: number) =>
  z.string().trim().max(max, "El texto es demasiado largo.").optional();

export const demoRequestSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "Ingresá tu nombre y apellido.")
    .max(120, "El nombre es demasiado largo."),
  empresa: z
    .string()
    .trim()
    .min(1, "Ingresá el nombre de tu empresa o desarrolladora.")
    .max(160, "El nombre es demasiado largo."),
  cargo: optionalText(120),
  email: z
    .string()
    .trim()
    .min(1, "Ingresá tu email.")
    .max(200, "El email es demasiado largo.")
    .pipe(z.email("Ingresá un email válido.")),
  telefono: optionalText(40),
  pais: z
    .string()
    .trim()
    .min(1, "Ingresá tu país.")
    .max(80, "El texto es demasiado largo."),
  ciudad: optionalText(80),
  // "" is the unselected state of the <select>.
  proyectos: z
    .union([z.enum(projectCounts), z.literal("")], "Elegí una opción válida.")
    .optional(),
  intereses: z
    .array(z.enum(interestOptions, "Elegí una opción válida."))
    .max(interestOptions.length)
    .optional(),
  comentarios: optionalText(2000),
  /** Honeypot: humans leave it empty; the API silently drops filled submissions. */
  website: z.string().max(200).optional(),
});

export type DemoRequestInput = z.infer<typeof demoRequestSchema>;
