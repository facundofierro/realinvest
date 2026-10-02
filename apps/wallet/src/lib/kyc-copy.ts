export type KycLocale = "es" | "en";

export const kycCopy = {
  es: {
    pageTitle: "Verificación de identidad", stepLabels: ["Identidad", "Documentos", "Beneficiario final", "PEP/Sanciones", "Revisión"],
    nav: { back: "Atrás", next: "Siguiente", submit: "Enviar verificación", change: "Cambiar", remove: "Quitar" },
    identity: { fullName: "Nombre completo", dateOfBirth: "Fecha de nacimiento", nationality: "Nacionalidad", documentType: "Tipo de documento", documentNumber: "Número de documento", address: "Domicilio (opcional)" },
    documents: { idFront: "Cédula/DNI (frente)", idBack: "Cédula/DNI (dorso)", selfie: "Selfie con documento", proofOfAddress: "Comprobante de domicilio", select: "Seleccionar archivo", required: "Seleccioná los cuatro documentos para continuar", demoHint: "Modo de prueba: un archivo cuyo nombre incluya \"approve\" o \"reject\" fuerza ese resultado; \"pep\" o \"sanction\" lo rechaza por control de listas. Cualquier otro nombre queda pendiente y se aprueba automáticamente en unos segundos." },
    beneficialOwner: { title: "Beneficiario final", none: "No tengo un beneficiario final distinto de mí mismo", add: "Agregar beneficiario final", remove: "Quitar", fullName: "Nombre completo", documentNumber: "Número de documento", ownershipPercentage: "Porcentaje de participación", isPoliticallyExposed: "Es una Persona Expuesta Políticamente (PEP)" },
    pepSanctions: { pepQuestion: "¿Es usted, o un familiar directo, una Persona Expuesta Políticamente (PEP)?", sanctionsQuestion: "¿Figura usted en listas de sanciones nacionales o internacionales?", yes: "Sí", no: "No" },
    review: { title: "Revisión", documents: "Documentos seleccionados" },
    status: { pending: "Tu verificación está en revisión.", approved: "¡Verificación aprobada!", rejectedPrefix: "Tu verificación fue rechazada:", retry: "Reintentar verificación", goHome: "Ir al inicio", submitted: "Enviada" },
    blocked: {
      none: { title: "Verificación requerida", description: "Necesitás completar tu verificación de identidad antes de poder invertir, depositar o retirar.", action: "Completar verificación" },
      pending: { title: "Verificación en revisión", description: "Tu verificación está en revisión.", action: "Ver estado" },
      rejected: { title: "Verificación rechazada", action: "Reintentar verificación" },
    },
  },
  en: {
    pageTitle: "Identity verification", stepLabels: ["Identity", "Documents", "Beneficial owner", "PEP/Sanctions", "Review"],
    nav: { back: "Back", next: "Next", submit: "Submit verification", change: "Change", remove: "Remove" },
    identity: { fullName: "Full name", dateOfBirth: "Date of birth", nationality: "Nationality", documentType: "Document type", documentNumber: "Document number", address: "Address (optional)" },
    documents: { idFront: "Government ID (front)", idBack: "Government ID (back)", selfie: "Selfie with ID", proofOfAddress: "Proof of address", select: "Select file", required: "Select all four documents to continue", demoHint: "Demo mode: a file name containing \"approve\" or \"reject\" forces that outcome; \"pep\" or \"sanction\" rejects it via screening. Any other name stays pending and auto-approves in a few seconds." },
    beneficialOwner: { title: "Beneficial owner", none: "I have no beneficial owner other than myself", add: "Add beneficial owner", remove: "Remove", fullName: "Full name", documentNumber: "Document number", ownershipPercentage: "Ownership percentage", isPoliticallyExposed: "Is a Politically Exposed Person (PEP)" },
    pepSanctions: { pepQuestion: "Are you, or an immediate family member, a Politically Exposed Person (PEP)?", sanctionsQuestion: "Do you appear on any national or international sanctions list?", yes: "Yes", no: "No" },
    review: { title: "Review", documents: "Selected documents" },
    status: { pending: "Your verification is under review.", approved: "Verification approved!", rejectedPrefix: "Your verification was rejected:", retry: "Retry verification", goHome: "Go home", submitted: "Submitted" },
    blocked: {
      none: { title: "Verification required", description: "Complete your identity verification before you can invest, deposit, or withdraw.", action: "Complete verification" },
      pending: { title: "Verification under review", description: "Your verification is under review.", action: "View status" },
      rejected: { title: "Verification rejected", action: "Retry verification" },
    },
  },
} as const;
