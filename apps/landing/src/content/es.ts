/**
 * Landing copy (es, voseo), as shown in design C.
 * Source: .agelum/doc/docs/plan/landing-copy-2026-oct.md + the landing plan.
 * Rules: no yield/return promises, no tokenization/marketplace/founders content,
 * "comprador" in general ("inversor" only in the investor-experience section).
 */

export const meta = {
  title: "Real Invest — Plataforma de ventas para desarrolladoras inmobiliarias",
  description:
    "Gestioná unidades, reservas y seguimiento de compradores en una plataforma con tu marca. Organizá la preventa de tus proyectos y agendá una demo.",
  ogTitle: "Gestioná la venta de tus proyectos en un solo lugar",
  ogDescription:
    "Inventario, reservas y un portal para tus compradores, con tu marca. Agendá una demo.",
} as const;

export const sampleDataLabel = "Datos de ejemplo";

export const nav = {
  links: [
    { label: "Producto", href: "#producto" },
    { label: "Lanzamientos", href: "#lanzamientos" },
    { label: "Servicios", href: "#servicios" },
    { label: "Cómo funciona", href: "#como-funciona" },
    { label: "Contacto", href: "#demo" },
  ],
  cta: { label: "Agendar demo", href: "#demo" },
} as const;

export const hero = {
  eyebrow: "Plataforma de ventas para desarrolladoras",
  title: "Gestioná la venta de tus proyectos en un solo lugar",
  subtitle:
    "Centralizá unidades, reservas y seguimiento de compradores. Vendé de forma directa o por etapas y compartí el avance de obra desde una plataforma con tu marca.",
  primaryCta: { label: "Agendar demo", href: "#demo" },
  secondaryCta: {
    label: "Ver cómo funciona un lanzamiento",
    href: "#lanzamientos",
  },
  support: [
    "Implementación acompañada",
    "Tu marca y tu dominio",
    "Venta directa o por etapas",
  ],
} as const;

export const problem = {
  eyebrow: "El problema",
  title: "Tu equipo necesita información clara para vender",
  text: "Cuando la disponibilidad, las reservas y el seguimiento se reparten entre planillas y mensajes, coordinar la venta lleva más tiempo. El equipo pierde visibilidad y los compradores necesitan consultar por cada novedad.",
  items: [
    {
      title: "Disponibilidad poco clara",
      text: "Nadie sabe con certeza qué unidad está libre, reservada o vendida.",
    },
    {
      title: "Demanda invisible",
      text: "Lanzás sin saber cuántos compradores reales hay detrás de cada tipología.",
    },
    {
      title: "Compradores sin información",
      text: "Pagos, cuotas, documentos y avance de obra quedan dispersos o no llegan.",
    },
    {
      title: "Ventas que se estiran",
      text: "Sin un momento claro de decisión, la preventa avanza despacio.",
    },
  ],
  illustration: { before: "Hoy", after: "Con Real Invest" },
} as const;

export const inventory = {
  eyebrow: "Inventario y reservas",
  title: "Tu inventario, siempre actualizado",
  text: "Cada unidad con su plano, metraje, dormitorios, orientación, precio y estado. Tu equipo, tus corredores y tus compradores consultan la disponibilidad según los permisos de cada perfil.",
  points: [
    "Estados claros: disponible, reservada, vendida, próximamente.",
    "Planos y fichas de cada unidad.",
    "Planes de pago en cuotas, atados a los hitos de obra.",
    "Reservas con vencimiento y seguimiento de cada corredor.",
  ],
  statuses: [
    { key: "available", label: "Disponible" },
    { key: "reserved", label: "Reservada" },
    { key: "sold", label: "Vendida" },
    { key: "upcoming", label: "Próximamente" },
  ],
} as const;

export const buyerPortal = {
  eyebrow: "Seguimiento después de la reserva",
  title: "La información de cada compra, en un solo lugar",
  text: "Dale a cada comprador un espacio para consultar su compra y las novedades que publique tu equipo. Centralizá documentos, pagos y avances de obra en un portal con tu marca.",
  points: [
    {
      key: "progress",
      title: "Avance de obra",
      text: "fotos, videos y novedades del proyecto.",
    },
    {
      key: "payments",
      title: "Pagos y cuotas",
      text: "cronograma, próximos vencimientos y comprobantes.",
    },
    {
      key: "documents",
      title: "Documentos",
      text: "contratos, recibos y permisos en un solo lugar.",
    },
    {
      key: "ai",
      title: "Asistente con IA",
      text: "consultas sobre la información del proyecto y derivación al equipo cuando sea necesario.",
    },
    {
      key: "notifications",
      title: "Notificaciones",
      text: "cada novedad importante llega sin que tengas que escribir uno por uno.",
    },
  ],
  highlight:
    "Menos información dispersa. Más claridad para tu equipo y tus compradores.",
} as const;

export const investorExperience = {
  eyebrow: "Experiencia del inversor",
  title: "Compradores e inversores que confían, vuelven a elegirte",
  lead: "Además de vender, les das una herramienta para explorar oportunidades, seguir su compra y mantenerse al día. Cuando la información es clara y está siempre a mano, la confianza crece y es más fácil que vuelvan a trabajar con tu desarrolladora.",
  points: [
    {
      title: "Explorar oportunidades",
      text: "Proyectos y unidades disponibles, con su ficha y sus condiciones.",
    },
    {
      title: "Seguir su compra",
      text: "Estado, avance de obra y documentos en un solo lugar.",
    },
    {
      title: "Pagar con claridad",
      text: "Cuotas, vencimientos y comprobantes sin intermediarios de por medio.",
    },
    {
      title: "Información al día",
      text: "Novedades del proyecto y avisos importantes, sin tener que pedirlos.",
    },
  ],
  mock: {
    opportunitiesTitle: "Oportunidades para vos",
    purchaseTitle: "Mi compra · Torre Mirador 8B",
    progressLabel: "Avance de obra",
    progressValue: 62,
    installmentsLabel: "Cuotas",
    installmentsValue: "3 de 12",
    nextInstallmentLabel: "Próxima cuota",
    nextInstallmentValue: "15 nov",
  },
  trustLoop: ["Más claridad", "Más confianza", "Vuelven a elegirte"],
  disclaimer:
    "La información que se muestra en la plataforma es informativa; no constituye una oferta ni garantiza resultados.",
} as const;

export const launch = {
  eyebrow: "Lanzamientos por etapas",
  title: "Convertí tu preventa en un evento",
  text: "Organizá la preventa con fechas de apertura, unidades y condiciones definidas para cada etapa. Los interesados se registran antes del lanzamiento y, al abrirse la etapa, pueden solicitar una reserva según las reglas de tu proyecto.",
  steps: [
    {
      title: "Definí tus etapas",
      text: "Cantidad de unidades, fecha de apertura y precio de cada etapa.",
    },
    {
      title: "Abrí el registro",
      text: "Los interesados completan su perfil y conocen las condiciones de reserva. Si el proyecto requiere un depósito de acceso, informá previamente su importe y las condiciones de devolución.",
    },
    {
      title: "Medí la demanda",
      text: "Antes de lanzar, revisá los registros y las preferencias de los interesados.",
    },
    {
      title: "Lanzá",
      text: "Abrí las reservas en la fecha prevista, con criterios de asignación, plazos y condiciones visibles.",
    },
    {
      title: "Pasá a la siguiente etapa",
      text: "Ajustá la disponibilidad y las condiciones a partir de lo aprendido en la etapa anterior.",
    },
  ],
  benefits: [
    "Fechas y condiciones claras para organizar el seguimiento comercial.",
    "Señales de interés para planificar cada etapa.",
    "Disponibilidad y precios definidos para cada etapa.",
    "Reglas claras y transparentes para todos los compradores.",
  ],
  note: "¿Preferís seguir vendiendo como hoy? También podés usar la plataforma con reserva directa o a través de tus corredores, y sumar los lanzamientos cuando quieras.",
  cta: { label: "Ver una demo de lanzamiento", href: "#demo" },
} as const;

export const knowYourBuyers = {
  eyebrow: "Conocé a tus compradores",
  title: "Sabé quién está interesado, antes de que te escriba",
  lead: "Reuní en un solo lugar la actividad de cada interesado: qué proyectos miró, qué unidades guardó y en qué lanzamientos se registró. Tu equipo detecta a quienes muestran intención de compra, aunque todavía no hayan iniciado el contacto.",
  points: [
    {
      title: "Compradores anteriores",
      text: "Reactivá a quienes ya interactuaron cuando abras un nuevo lanzamiento o proyecto.",
    },
    {
      title: "Señales de interés",
      text: "Unidades vistas o guardadas, registros y consultas por tipología.",
    },
    {
      title: "Historial por persona",
      text: "Reservas, pagos y conversaciones, para retomar el contacto con contexto.",
    },
  ],
  note: "Según los permisos y el consentimiento definidos para tu operación.",
  flow: ["Etapa 1 compradores", "Nuevo lanzamiento", "Etapa 2"],
  activity: [
    {
      name: "Interesada A.",
      detail: "Compró en Etapa 1 · vio 3 unidades de Etapa 2",
      badge: "Comprador anterior",
    },
    {
      name: "Interesado B.",
      detail: "Guardó 2 unidades · sin consulta enviada",
      badge: "Intención alta",
    },
    {
      name: "Interesada C.",
      detail: "Registrada · abrió el plan de pagos",
      badge: "Registrada",
    },
  ],
} as const;

export const payments = {
  eyebrow: "Pagos",
  title: "Conectá los cobros con el seguimiento de cada compra",
  text: "Organizá el seguimiento de reservas, depósitos y cuotas por unidad y comprador. Las opciones de cobro y conciliación se definen según las integraciones disponibles para tu operación.",
  points: [
    { key: "cards", title: "Tarjetas", text: "Crédito y débito, según el procesador disponible." },
    { key: "qr", title: "QR y billeteras", text: "Pagos con QR y billeteras compatibles." },
    { key: "transfer", title: "Transferencias", text: "Transferencias bancarias." },
    {
      key: "abroad",
      title: "Desde el exterior",
      text: "Opciones para compradores del exterior, sujetas a cobertura del proveedor.",
    },
  ],
  crypto: {
    eyebrow: "Pagos con cripto",
    title: "Llegá a compradores con activos digitales.",
    text: "Consultá las opciones de pago con activos digitales a través de proveedores especializados. Los activos aceptados, la moneda de liquidación y la cobertura dependen del país y del proveedor.",
    note: "Servicio provisto a través de procesadores habilitados. Consultá disponibilidad.",
  },
} as const;

export const services = {
  eyebrow: "Servicios",
  title: "Más que software: te acompañamos a vender",
  text: "Además de la plataforma, sumá los servicios que necesites para lanzar y vender mejor.",
  cards: [
    {
      key: "setup",
      title: "Implementación y personalización",
      text: "Configuramos la plataforma con tu marca, cargamos tus proyectos y adaptamos los flujos a tu forma de vender. Trabajamos con vos durante la puesta en marcha.",
    },
    {
      key: "3d",
      title: "3D y multimedia",
      text: "Recorridos y vistas 3D de las unidades, renders y videos para tus lanzamientos. Que tus compradores vean su unidad antes de que exista.",
    },
    {
      key: "crm",
      title: "Marketing, CRM y agentes de IA",
      text: "Conectá tus campañas con la atención comercial: herramientas para organizar contactos y conversaciones, agentes de IA que califican interesados y derivan a tu equipo, y automatizaciones para contenidos y análisis de campañas.",
    },
  ],
  scopeNote:
    "El servicio se cotiza por separado. En la propuesta definimos los canales, las integraciones, los criterios de calificación y las automatizaciones incluidas.",
  cta: { label: "Consultar por servicios", href: "#demo" },
} as const;

export const howItWorks = {
  eyebrow: "Cómo funciona y precios",
  title: "Empezá simple",
  steps: [
    { title: "Demo", text: "Te mostramos la plataforma con un proyecto de ejemplo." },
    {
      title: "Implementación",
      text: "Configuramos tu marca, tus proyectos y tus reglas de venta.",
    },
    { title: "Lanzamiento", text: "Abrís reservas o tu primer día de lanzamiento." },
    { title: "Operación", text: "Acompañamiento, soporte y mejoras continuas." },
  ],
  pricing: {
    title: "Implementación + abono mensual",
    text: "Un costo inicial para poner tu plataforma en marcha y un abono mensual de operación. Los servicios adicionales se cotizan por separado. La propuesta detalla alcance, moneda, impuestos, costos de terceros y soporte incluido.",
  },
  cta: { label: "Pedir una propuesta", href: "#demo" },
} as const;

export const faq = {
  eyebrow: "Preguntas frecuentes",
  title: "Lo que suelen preguntarnos",
  items: [
    {
      q: "¿Tengo que cambiar mi forma de vender?",
      a: "No. Podés usar la plataforma con tu proceso actual (reserva directa o con corredores) y sumar los lanzamientos por etapas cuando quieras.",
    },
    {
      q: "¿Está disponible en mi país?",
      a: "Contanos dónde operás. Confirmamos el alcance de la plataforma, las integraciones, las monedas y los medios de pago disponibles para tu proyecto antes de presentar una propuesta.",
    },
    {
      q: "¿La plataforma lleva mi marca?",
      a: "Sí. Tus compradores ven tu marca y tu dominio.",
    },
    {
      q: "¿Mis compradores pueden pagar con cripto?",
      a: "Depende del país y de los proveedores disponibles. En la demo revisamos si existe una opción compatible con tu operación y qué monedas de liquidación admite.",
    },
    {
      q: "¿De quién son los datos de mis compradores?",
      a: "En la propuesta detallamos las condiciones de uso de los datos, los permisos de acceso y las opciones de exportación.",
    },
    {
      q: "¿Qué incluye el servicio de marketing y CRM?",
      a: "Definimos un alcance para tu operación: seguimiento de contactos y conversaciones, atención por WhatsApp, agentes para calificar interesados y derivarlos al equipo, preparación de contenidos y análisis de campañas. Las integraciones y automatizaciones se detallan en una propuesta separada.",
    },
    {
      q: "¿Los agentes reemplazan a mi equipo comercial?",
      a: "Los agentes apoyan tareas como la calificación inicial, la preparación de contenidos y el análisis de campañas. Tu equipo continúa la atención comercial y define los criterios de derivación y las acciones que requieren revisión.",
    },
    {
      q: "¿Cuánto tiempo lleva la implementación?",
      a: "Depende de la cantidad de proyectos y del nivel de personalización. Lo definimos juntos en la propuesta.",
    },
    {
      q: "¿Funciona en el celular?",
      a: "Sí. Tus compradores pueden usar el portal desde cualquier dispositivo.",
    },
  ],
} as const;

export const finalCta = {
  eyebrow: "Demo",
  title: "Tu próximo lanzamiento puede ser distinto",
  text: "Mostranos tu proyecto y te enseñamos cómo se vería en Real Invest.",
  primaryCta: { label: "Agendar demo", href: "#demo" },
  /** Rendered only when NEXT_PUBLIC_WHATSAPP_URL is set. */
  whatsappCta: { label: "Escribinos por WhatsApp" },
} as const;

export const demoForm = {
  title: "Agendá tu demo",
  fields: {
    name: "Nombre y apellido",
    company: "Empresa / desarrolladora",
    role: "Cargo (opcional)",
    email: "Email",
    phone: "Teléfono / WhatsApp (opcional)",
    projectsPlaceholder: "Seleccioná",
    country: "País",
    city: "Ciudad (opcional)",
    projects: "Cantidad de proyectos",
    interests: "¿Qué te interesa?",
    comments: "Comentarios (opcional)",
  },
  projectOptions: [
    { value: "1", label: "1" },
    { value: "2-3", label: "2–3" },
    { value: "4+", label: "4 o más" },
  ],
  interestOptions: [
    "Plataforma de ventas",
    "Lanzamientos por etapas",
    "Pagos con cripto",
    "3D y multimedia",
    "Marketing, CRM y agentes de IA",
  ],
  submit: "Solicitar demo",
  submitting: "Enviando…",
  success:
    "¡Gracias por tu interés! Recibimos tu solicitud y te contactaremos para coordinar la demo.",
  error: "No pudimos enviar tu solicitud. Probá de nuevo en unos minutos.",
  privacy:
    "Usaremos los datos que nos compartas para responder tu consulta y coordinar la demo.",
  privacyLinkPrefix: "Consultá nuestra",
  privacyLinkLabel: "Política de privacidad",
  successTitle: "Solicitud enviada",
} as const;

export const footer = {
  tagline: "Real Invest — Tecnología para gestionar la venta de proyectos inmobiliarios.",
  links: nav.links,
  legal: {
    terms: "Términos y condiciones",
    privacy: "Política de privacidad",
  },
  disclaimer:
    "La información de este sitio es solo informativa y no constituye una oferta de valores ni asesoramiento financiero, legal o tributario. Los pagos con activos virtuales están sujetos al marco regulatorio aplicable.",
  copyright: "© 2026 Real Invest",
} as const;

/** Env-driven contact placeholders: elements are not rendered when unset. */
export const contactEnv = {
  whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  legalEntity: process.env.NEXT_PUBLIC_LEGAL_ENTITY,
  privacyUrl: process.env.NEXT_PUBLIC_PRIVACY_URL,
  termsUrl: process.env.NEXT_PUBLIC_TERMS_URL,
} as const;
