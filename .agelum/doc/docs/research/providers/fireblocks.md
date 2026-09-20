# Custodia cripto, KYC y tokenización inmobiliaria en Paraguay con Fireblocks + Hedera

> **Propósito.** Diseño de referencia para una plataforma paraguaya que custodia activos digitales y emite participaciones tokenizadas vinculadas a inmuebles. Documento técnico-operativo, no asesoramiento legal, tributario ni de valores. Antes de lanzar, validar la estructura societaria, la oferta y los contratos con abogados paraguayos especializados y confirmar por escrito el criterio vigente de SEPRELAD, CNV y BCP.

## 1. Punto de partida regulatorio: qué significa ser PSAV/PSV

En Paraguay la denominación utilizada por la norma es **PSAV** (*Proveedor de Servicios de Activos Virtuales*; a veces se escribe PSV). La Resolución SEPRELAD N.º 314/2021 alcanza a personas físicas y jurídicas constituidas o domiciliadas en el país que hagan, entre otras actividades, intercambio, transferencia, almacenamiento o administración de activos virtuales y servicios financieros relacionados. Los trata como **Sujetos Obligados** para prevención de LA/FT/FP. La inscripción se realiza en SIRO/SEPRELAD como sector “Activos Virtuales”.

Esto no debe presentarse al mercado como una “licencia financiera”, aprobación de productos o aval estatal: la consulta pública de SEPRELAD advierte expresamente que figurar activo en el registro no acredita por sí mismo el cumplimiento de políticas LA/FT/FP. La tokenización inmobiliaria también puede activar regulación civil, registral, contractual, tributaria y, según cómo se comercialice el derecho económico, regulación de mercado de valores. La cadena **no sustituye** escritura, título, inscripción registral ni la documentación que haga oponible el derecho subyacente.

Marco mínimo a confirmar en la fecha de lanzamiento:

- [Resolución 314/2021 de SEPRELAD](https://www.seprelad.gov.py/userfiles/files/resoluciones/314-21-activos-virtuales.pdf): sistema integral de prevención LA/FT, basado en riesgos, para PSAV.
- [Ley 1015/97](https://www.bacn.gov.py/leyes-paraguayas/988/ley-n-1015-): identificación, registros, control interno y reporte de operaciones sospechosas; junto con sus modificatorias y reglamentación aplicable.
- [SIRO: preinscripción](https://www.seprelad.gov.py/siro/soprovisorio/solicitudso.xhtml) y [guía sector Activos Virtuales](https://www.seprelad.gov.py/?page_id=1743): canal operativo de inscripción; conservar acuse, datos de oficial de cumplimiento y renovaciones.
- [consulta pública de sujetos obligados](https://www.seprelad.gov.py/siro/consultaExterna/consultaExternaSoAe.xhtml): verificar que la entidad y el RUC figuren activos.

### Paquete de cumplimiento antes del primer cliente

1. Constituir la entidad local, definir actividad/RUC, inscribirla como PSAV ante SEPRELAD y designar oficial de cumplimiento con independencia y recursos.
2. Aprobar por directorio: manual LA/FT/FP, matriz de riesgos, aceptación/rechazo de clientes, PEP/sanciones, monitoreo, investigación y ROS, conservación de evidencias, capacitación, auditoría y plan de continuidad/incidentes.
3. Implementar debida diligencia basada en riesgo: identificación y validación de persona física/jurídica, beneficiario final, propósito/naturaleza de la relación, origen de fondos y patrimonio cuando corresponda, PEP, listas de sanciones y monitoreo continuo.
4. Configurar inmovilización/bloqueo y escalamiento de alertas; no revelar a cliente ni terceros una investigación o ROS. La normativa aplicable exige comunicar operaciones sospechosas independientemente de su monto.
5. Separar contablemente fondos/activos de clientes, tesorería propia y vehículos de cada inmueble; conciliar diariamente libro interno, Fireblocks y red Hedera.

## 2. Modelo jurídico-operativo del activo inmobiliario

No emitir un token que prometa, de forma ambigua, “propiedad directa del inmueble”. Para cada proyecto crear una estructura documentada y elegir explícitamente qué representa el token:

| Opción | Subyacente / derecho del inversor | Consecuencia práctica |
| --- | --- | --- |
| SPV por inmueble | Acción, cuota o derecho económico sobre una sociedad que posee el inmueble | Normalmente la ruta más ordenada para fraccionar; revisar si es oferta de valor negociable. |
| Fideicomiso | Derecho/participación económica de beneficiario | Requiere contrato fiduciario y gobierno del fiduciario. |
| Crédito/nota | Derecho de cobro respaldado por proyecto | Puede asemejarse a valor de deuda; requiere análisis CNV. |
| NFT de evidencia | Referencia única a expediente, certificado o unidad | No transfiere dominio por sí solo; útil como capa documental, no como sustituto registral. |

Por inmueble, el *data room* debe contener: título y certificado registral, avalúo, due diligence del inmueble, gravámenes, contrato SPV/fideicomiso, reglas de distribución, riesgos, política de valuación, restricciones de transferencia, derechos de voto, eventos de liquidación/recompra y el documento que vincula jurídicamente token ↔ derecho. Guardar los documentos fuera de cadena cifrados; publicar en cadena solamente hashes, identificadores no personales y versiones.

**Regla de oro:** no vender, prometer rentabilidad ni permitir negociación secundaria hasta que el asesor local determine la clasificación regulatoria concreta y las aprobaciones/divulgaciones requeridas. El registro PSAV cubre obligaciones ALA/CFT; no resuelve por sí solo la oferta de participaciones inmobiliarias.

## 3. Arquitectura propuesta

```text
Web / back office
       │
API propia ── Identity/KYC + screening ── expediente cifrado / auditoría
       │              │                         │
       │              └── estado de elegibilidad │
       │                                         ▼
       ├── PostgreSQL (ledger interno, órdenes, saldos, casos)
       ├── Fireblocks (MPC, políticas, aprobación, llaves, monitoreo)
       │              │
       │              └── cuenta operativa / tesorería ── Hedera
       │                                                │
       └── Servicio de emisión y compliance ── HTS / ATS ── token RWA
```

Responsabilidades:

- **Aplicación propia:** fuente de verdad para cliente, KYC, derecho contractual, idempotencia, órdenes y reportes regulatorios. Nunca usar la cadena como base de datos de PII ni como único libro contable.
- **Proveedor KYC/AML y analítica on-chain:** verifica documento/vida, PEP/sanciones, beneficiario final y riesgo de dirección. Fireblocks aporta custodia/orquestación; no sustituye el programa de cumplimiento ni la decisión del oficial.
- **Fireblocks:** capa MPC de llaves y flujos aprobados. Usar Vault Accounts institucionales para tesorería, emisión y reservas; no exponer llaves privadas a la aplicación.
- **Hedera:** capa de liquidación y registro de token. HTS ofrece KYC, freeze, supply y otras llaves nativas; ATS agrega estándares y controles de valores tokenizados cuando el análisis jurídico lo justifique.

## 4. Fireblocks: configuración y APIs necesarias

### 4.1 Diseño de cuentas y políticas

Crear Vault Accounts independientes, por ejemplo: `TREASURY`, `ISSUER-PROPERTY-<id>`, `CLIENT-OMNIBUS` (si la custodia es ómnibus y está jurídicamente documentada), `FEES`, y `RECOVERY`. Asociar `customerRefId` pseudónimo —no nombre, documento ni datos sensibles— para facilitar trazabilidad sin publicar PII.

En la consola de Fireblocks definir antes de producción:

- grupos de usuarios y roles: iniciador, aprobador de cumplimiento, aprobador financiero y firmante; aplicar cuatro ojos para emisión, transferencias y cambios de direcciones;
- política por activo/red/destino/monto/horario: permitir sólo HBAR y el token autorizado, destinos conocidos, límites por transacción y aprobación reforzada para `MINT`, `BURN`, `CONTRACT_CALL` y direcciones externas;
- listas blancas de wallets/contratos, alertas y webhooks; prohibir al backend acceso administrativo;
- ambiente sandbox/testnet, API user de mínimo privilegio, secreto/JWT de firma en HSM o gestor de secretos, rotación y registros inmutables;
- procedimiento de emergencia: congelamiento de token/Hedera, suspensión de políticas salientes, investigación, preservación de evidencia y escalamiento al oficial de cumplimiento.

Fireblocks documenta que su API REST es la base de los SDKs; los Vault Accounts se crean con `POST /vault/accounts` y las transacciones pasan por la API de creación con permisos y políticas del workspace. Referencias: [API reference](https://api-reference.fireblocks.com/), [capacidades y operaciones](https://fireblocks.readme.io/docs/capabilities).

### 4.2 Contrato interno de integración

La aplicación no debe llamar Fireblocks desde el navegador. Un servicio de custodia interno debe validar autorización/KYC/AML, registrar la orden y recién entonces solicitar la operación. Todo comando debe llevar `correlationId`, `idempotencyKey`, actor, motivo de negocio, expediente de compliance y versión de política.

| Caso de uso | Fireblocks / red | Controles previos |
| --- | --- | --- |
| Alta de cuenta de proyecto | `POST /vault/accounts` | aprobación de producto + referencia pseudónima del SPV. |
| Habilitar HBAR/token y dirección depósito | gestión de asset de vault / dirección | sólo red Hedera prevista; conciliar dirección y proyecto. |
| Consultar saldo/dirección | Vault/asset endpoints | lectura desde backend; mostrar saldo disponible y pendiente separadamente. |
| Alta de destino | wallets/direcciones externas o contract wallet | verificación de propiedad, screening de dirección, cuatro ojos. |
| Transferir HBAR/token | `POST /transactions` con `TRANSFER` | KYC vigente, wallet asociada, screening, límites, saldo y política Fireblocks. |
| Ejecutar función de contrato | `POST /transactions` con `CONTRACT_CALL` | ABI allowlist, selector/método, simulación y aprobación reforzada. |
| Firmar/mint/burn HTS | transacción Hedera soportada o `CONTRACT_CALL` a wrapper aprobado | sólo llave de emisión; supply cap y resolución corporativa. |
| Seguimiento | webhooks + consulta de transacción | verificar firma/autenticidad de webhook e idempotencia por evento. |

Implementar una máquina de estados propia: `draft → compliance_review → approved → submitted → fireblocks_pending → confirmed | rejected | failed → reconciled`. El estado de Fireblocks o de Hedera no equivale a que el inversor sea elegible; una transferencia sólo se habilita si ambas condiciones son verdaderas.

Ejemplo conceptual (TypeScript; nombres exactos se validan contra la versión del SDK contratada):

```ts
async function requestTransfer(command: TransferCommand) {
  await assertCustomerEligible(command.customerId);  // KYC + screening + restricciones
  await assertWalletOwnership(command.destination);
  const order = await ledger.createIdempotentOrder(command);

  const tx = await fireblocks.transactions.createTransaction({
    transactionRequest: {
      assetId: command.assetId,
      source: { type: "VAULT_ACCOUNT", id: command.sourceVaultId },
      destination: { type: "ONE_TIME_ADDRESS", oneTimeAddress: { address: command.destination } },
      amount: command.amount,
      operation: "TRANSFER",
      note: `order:${order.id}`,
      externalTxId: order.id,
    },
  });
  return ledger.markSubmitted(order.id, tx.id);
}
```

No marcar una venta como liquidada al enviar el request: procesar callbacks, consultar el estado final y reconciliar con el mirror node/SDK de Hedera. Validar el modelo de autenticación, operaciones Hedera disponibles y `assetId` exacto con el soporte/documentación de Fireblocks antes de codificar.

### 4.3 Cuadro operativo: qué debemos soportar y quién lo ejecuta

La siguiente matriz separa la **decisión de negocio y cumplimiento** (siempre nuestra) de la ejecución técnica. Fireblocks firma/coordina operaciones de custodia, pero no decide por nosotros si un cliente debe ser aceptado, si una oferta es legal o si una transacción es sospechosa.

| Operación a soportar | Disparador e interfaz | Ejecutor técnico principal | Cómo se realiza | Sistemas que deben registrar / validar | Resultado y control obligatorio |
| --- | --- | --- | --- | --- | --- |
| Alta de inversor | Portal: `POST /customers` | Nuestra API + BD | Crear expediente y estado inicial `pending_kyc`; generar ID interno pseudónimo | BD de clientes, auditoría y consentimiento | Nunca crear wallet elegible ni vender token antes de aprobación KYC. |
| Verificación KYC/empresa/UBO | Portal/back office: `POST /kyc-submissions` | Proveedor KYC **o** equipo propio | Enviar evidencia cifrada a proveedor vía API/webhook, o revisar con proceso interno; guardar decisión y evidencia | KYC, screening PEP/sanciones, BD, caso de compliance | La decisión final es del oficial/reglas de la entidad; vencimiento y reevaluación obligatorios. |
| Vincular wallet del cliente | Portal: `POST /wallets` | Nuestra API + blockchain | Solicitar firma de mensaje con la wallet, verificar firma y ejecutar KYT/screening de dirección | BD de wallets, proveedor KYT, log de prueba | La dirección queda `pending` hasta revisión; no confiar en una dirección escrita por el usuario. |
| Crear cuenta de custodia institucional | Back office aprobado | Fireblocks API | `POST /vault/accounts`; nombre no sensible y `customerRefId` pseudónimo | Fireblocks, BD de mapeo vault–SPV/cliente, auditoría | Requiere rol/política Fireblocks; no exponer `vaultAccountId` directamente al frontend. |
| Generar dirección de depósito / habilitar activo | Back office o flujo de onboarding | Fireblocks API | Agregar el asset Hedera/obtener dirección de la Vault Account según capacidades de la cuenta | Fireblocks, BD de direcciones, conciliación | Verificar red Hedera y activo antes de mostrar la dirección. |
| Crear SPV y expediente del inmueble | Back office legal | Nuestra organización + asesores | Crear proyecto y checklist; adjuntar documentos cifrados y hashes/versiones | BD de proyectos, data room, aprobaciones societarias | Es proceso jurídico/registral fuera de Fireblocks y blockchain. |
| Crear token de inmueble | Solicitud de emisión con doble aprobación | Hedera HTS/ATS; firma mediante Fireblocks si la integración/operación contratada lo permite | Construir `TokenCreateTransaction` o desplegar/configurar ATS; firmar con llaves autorizadas; esperar receipt | Hedera, Fireblocks, BD de token, acta de emisión, data room | Registrar `tokenId`, supply/cap, llaves, hash documental y aprobadores; probar primero en testnet. |
| Asociar cuenta Hedera al token | Portal o back office | Cliente (autocustodia) o custodio, en Hedera | Ejecutar asociación del token desde la cuenta correspondiente | Hedera y BD | Confirmar receipt; sin asociación la transferencia puede fallar. |
| Conceder/revocar KYC on-chain | Sólo después de decisión interna | Hedera HTS, firmado por llave KYC custodiada | `TokenGrantKycTransaction` / revocación correspondiente | Motor de elegibilidad, Hedera, auditoría | Debe existir vínculo verificable a caso KYC vigente; no enviar PII a cadena. |
| Congelar/descongelar cuenta | Alerta, vencimiento, orden válida o incidente | Hedera HTS, firmado por llave `freezeKey` | `TokenFreezeTransaction` / `TokenUnfreezeTransaction` | Caso compliance, Hedera, Fireblocks si firma, bitácora | Doble aprobación y causal documentada; notificación al cliente sólo según política legal. |
| Pausar/reanudar token | Incidente sistémico/regulatorio | Hedera HTS, firmado por `pauseKey` | `TokenPauseTransaction` / `TokenUnpauseTransaction` | Gestión de incidentes, Hedera, auditoría | Acción de emergencia de multisig; no reemplaza freeze individual. |
| Suscripción / compra primaria | Portal: `POST /subscriptions` | Nuestra API orquestadora; pago y Hedera/Fireblocks | Reservar unidades, validar pago y elegibilidad; transferir desde treasury al inversor o anotar custodia ómnibus | Órdenes, pagos, KYC/KYT, Fireblocks, Hedera, ledger | Atomicidad lógica: reservar → cobrar/confirmar → transferir → conciliar; compensar errores. |
| Transferencia o retiro de token | Portal: `POST /transfers` | Nuestra API + Fireblocks + Hedera | Validar origen/destino y crear transacción Fireblocks `TRANSFER` o transacción Hedera aprobada | KYC de ambos lados, KYT, Fireblocks Policy, Hedera, ledger | El webhook/receipt confirma, pero sólo conciliación final marca `settled`. |
| Mint adicional | Back office, excepcional | Hedera HTS + Fireblocks | `TokenMintTransaction`, si existe `supplyKey` y no excede `maxSupply` | Aprobación societaria, cap, Hedera, auditoría | Normalmente deshabilitar para emisión inmobiliaria de supply fijo; si se permite, publicar reglas. |
| Burn / rescate / liquidación | Back office + flujo contractual | Hedera HTS + Fireblocks | Transferir al treasury y `TokenBurnTransaction`, o usar mecanismo ATS autorizado | Contrato, KYC, evento de liquidación, ledger, Hedera | No quemar unilateralmente salvo facultad contractual y revisión legal explícita. |
| Distribuir alquiler/dividendos | Back office de pagos | Nuestra plataforma + banco/rail de pagos; blockchain opcional | Calcular posiciones en fecha de corte, aprobar archivo de pago y registrar comprobantes | Libro de tenedores, impuestos, pagos, auditoría | La cadena prueba tenencia, no sustituye cálculo, retenciones ni obligación de pago. |
| Monitorear depósitos/movimientos | Evento on-chain o webhook | Fireblocks webhooks + indexador/mirror node + KYT | Recibir webhook, verificar autenticidad, consultar estado y riesgo de dirección | Cola de eventos, KYT, Fireblocks, Hedera, casos | Webhooks pueden repetirse o llegar fuera de orden: usar ID de evento, idempotencia y reconciliación. |
| Reportes, ROS y auditoría | Alertas/cierres periódicos | Oficial de cumplimiento + nuestra plataforma | Investigar, conservar evidencia, emitir reportes por canales requeridos | Case management, registros inmutables, SIRO/SEPRELAD según corresponda | Un tercero puede operar parte del flujo, pero responsabilidad y decisión regulatoria permanecen en el PSAV. |
| Conciliación diaria | Job interno | Nuestra plataforma | Comparar órdenes y saldos internos vs Fireblocks vs Hedera; resolver diferencias | Ledger, Fireblocks API, mirror node/SDK, tickets | Bloquear operaciones afectadas hasta resolver diferencias materiales. |

**Secuencia estándar de una transferencia.** `UI → nuestra API → motor KYC/KYT/políticas → orden idempotente en BD → solicitud Fireblocks o transacción Hedera → aprobación de política/MPC → webhook Fireblocks + receipt Hedera → conciliación en BD → actualización UI`. La interfaz sólo muestra el resultado; ninguna operación de blockchain debe originarse directamente desde el navegador.

Fireblocks exige que las solicitudes API estén firmadas criptográficamente y ofrece SDKs, Vault Accounts y webhooks para recibir cambios de estado. Usar Webhooks V2, verificar el origen de cada mensaje y reconsultar la operación antes de mutar el ledger. Referencias: [quickstart de autenticación](https://fireblocks.readme.io/docs/quickstart), [API Reference](https://api-reference.fireblocks.com/) y [webhooks de Fireblocks](https://developers.fireblocks.com/reference/exchange-fiat-account-webhooks).

## 5. KYC/AML: flujo ejecutable

### 5.0 ¿KYC propio o contratar un servicio?

**Ambas opciones son posibles**, y una solución híbrida suele ser la opción más segura para una primera operación: contratar un proveedor especializado para captura documental, prueba de vida, OCR, validaciones y screening; mantener internamente la política de riesgo, las decisiones de aceptación/EDD, monitoreo de comportamiento, investigación, ROS y la relación con SEPRELAD.

La Resolución 314/2021 indica que el sistema de prevención debe abarcar a toda la entidad **incluso cuando delega la ejecución de procesos en intermediarios**. Por ello, tercerizar KYC no traslada la responsabilidad del PSAV ni permite delegar ciegamente la decisión al proveedor. El contrato debe prever auditoría, nivel de servicio, ubicación y protección de datos, subcontratistas, notificación de incidentes, conservación/exportación de expedientes, pruebas de precisión, derecho de terminación y continuidad/migración.

| Modelo | Qué hacemos nosotros | Qué puede hacer un proveedor | Cuándo conviene | Riesgos/condiciones |
| --- | --- | --- | --- | --- |
| KYC propio | Formularios, validación documental/manual, listas, casos, evidencias y decisión | Ninguno o sólo fuentes de datos | Volumen bajo y equipo de compliance con experiencia local | Mayor carga operativa, fraude documental y mantenimiento de reglas/listas; necesita controles, capacitación y auditoría fuertes. |
| KYC tercerizado | Política de aceptación, configuración, QA, decisión final, EDD/ROS y registro | OCR, liveness, verificación documental, screening PEP/sanciones, alertas y API/webhooks | Lanzamiento rápido y necesidad de cobertura técnica/antifraude | Validar cobertura real de documentos/empresas paraguayas, calidad, privacidad, dependencia y exportación de datos. |
| Híbrido recomendado | Orquestación, reglas de riesgo, revisión humana, UBO/EDD, KYT, decisión y reportes | Identidad/liveness/documento y screening inicial/continuo | Custodia y tokenización inmobiliaria: mayor riesgo, personas/empresas y montos relevantes | Diseñar cola de excepciones y pruebas periódicas; no automatizar aprobación de casos de alto riesgo sin control humano. |

Al evaluar un proveedor, exigir una prueba con documentos paraguayos y casos de personas jurídicas/UBO antes de contratar. Confirmar: cobertura de cédula/pasaporte y prueba de vida, PEP/sanciones y actualización de listas, fuentes y tasa de falsos positivos, controles de privacidad y transferencia internacional, APIs/webhooks, SLA, retención/borrado, auditorías/certificaciones, exportación de datos y soporte para investigaciones. Un proveedor de KYC (identidad) no sustituye un proveedor de **KYT** (riesgo de direcciones y transacciones blockchain); ambos alimentan la misma decisión de compliance.

Integración recomendada del proveedor KYC:

```text
Nuestra API crea caso ──► proveedor KYC (link/SDK de captura)
       │                            │
       │                       webhook firmado
       ▼                            ▼
BD: evidence reference, hash,       resultado técnico: documento/liveness/screening
estado y vencimiento                         │
       └──── motor de riesgo + revisión del oficial ───► approved / EDD / rejected
                                                        │
                                                        └── sólo approved: grant KYC on-chain y permitir orden
```

No almacenar imágenes/documentos en Fireblocks ni en Hedera. Mantenerlos cifrados en un repositorio de evidencias con acceso mínimo; en la blockchain publicar, si hace falta, únicamente un hash de versión documental que no permita reconstruir datos personales.

### 5.1 Datos y decisión

Para una persona física: identidad, prueba documental y de vida, domicilio, nacionalidad/residencia, ocupación, perfil transaccional, origen de fondos, PEP, sanciones/listas y wallet(s) declaradas. Para una jurídica: existencia, representantes, estructura/control y beneficiarios finales, actividad, fondos y autorizaciones. Recabar sólo lo necesario, cifrarlo, aplicar retención definida por asesoría local y limitar acceso por rol.

La decisión de elegibilidad no es un booleano único. Mantener, como mínimo: `identity_verified`, `ubo_verified`, `sanctions_clear`, `pep_reviewed`, `source_of_funds_approved`, `wallet_ownership_verified`, `risk_rating`, `kyc_expires_at`, `suspended` y `case_id`. Un cambio de PEP/sanciones, vencimiento, alerta on-chain o documentación contradictoria debe bloquear órdenes y abrir caso.

### 5.2 Orquestación

1. Crear cliente y expediente; obtener consentimiento y aceptar términos/riesgos.
2. Verificar identidad y, para empresas, UBO/representación; ejecutar PEP/sanciones y evaluación de país/riesgo.
3. Vincular wallet mediante firma de mensaje o microverificación; aplicar análisis on-chain antes de permitir depósito/retiro.
4. Oficial de cumplimiento o reglas aprobadas decide `approved`, `enhanced_due_diligence`, `rejected` o `suspended`.
5. Si se aprueba, asociar la cuenta Hedera y conceder elegibilidad del token. Registrar quién decidió, cuándo, fuentes, evidencia y vencimiento.
6. En cada suscripción, transferencia, rescate o pago: volver a evaluar reglas, screening y perfil. Investigar alertas; presentar ROS por el canal aplicable cuando corresponda y sin *tipping-off*.

Para custodiar para clientes, elegir y documentar uno de dos modelos:

- **Custodia institucional/ómnibus:** Fireblocks controla llaves de vault; el ledger interno asigna beneficiarios y el contrato define segregación, retiros, insolvencia, llaves y reconciliación. Requiere controles reforzados.
- **Wallet individual/autocustodia:** el inversor controla su wallet y se habilita sólo si pasa KYC y controles de contrato/token. Fireblocks mantiene tesorería/emisión. Es más claro técnicamente pero no elimina obligaciones PSAV si la plataforma administra transferencias/custodia.

## 6. Crear el token inmobiliario en Hedera

### 6.1 Elegir la capa de token

**HTS nativo** es apropiado para un token fungible con controles simples: token por SPV/inmueble, supply máximo fijo, asociación de cuentas, KYC, congelamiento/pausa y transferencia con liquidación rápida. Hedera expone estas capacidades de cumplimiento de forma nativa. Ver [Hedera Token Service](https://hedera.com/service/token-service/) y la [documentación de tokenización](https://docs.hedera.com/hedera/core-concepts/tokens).

**Asset Tokenization Studio (ATS)** debe evaluarse si el instrumento es un valor o se necesitan identidades verificables, listas de control, particiones, force transfer/redeem, clearing y roles de emisor/controlador. ATS documenta soporte para ERC-1400/ERC-3643 y exige KYC para las operaciones configuradas; no reemplaza la determinación jurídica local. Ver [operaciones de ATS](https://docs.tokenization-studio.hedera.com/ats/user-guides/token-operations/).

Para la primera emisión, preferir HTS con transferencias **permissioned** y sin mercado secundario abierto. Introducir ATS/contrato de restricciones sólo después de una revisión legal y auditoría de seguridad.

### 6.2 Parámetros recomendados: 1 token por SPV/inmueble

Ejemplo: `EDIF-A-2026` representa una fracción económica definida en los documentos de `SPV-Edificio-A`, no metros cuadrados ni dominio registral directo.

| Parámetro HTS | Recomendación |
| --- | --- |
| Tipo | `FUNGIBLE_COMMON`; NFT sólo para certificados/evidencia, no para participaciones fraccionadas. |
| Decimales | 0 si cada unidad es indivisible; 2–6 sólo si contrato y UX soportan fracciones. |
| Treasury | Vault de emisión del SPV, separado de tesorería general. |
| `initialSupply` / `maxSupply` | supply total igual a las unidades autorizadas; `maxSupply` inmutable y documentado. |
| `adminKey` | multisig/MPC con aprobación corporativa; cambiar llaves sólo bajo procedimiento formal. |
| `supplyKey` | usar sólo si habrá emisión autorizada; para oferta fija, emitir total y bloquear/mantener control según consejo jurídico. |
| `kycKey` | indispensable para requerir KYC por cuenta antes de participación. |
| `freezeKey` | habilitar para suspensión individual; definir causal, debido proceso contractual y logs. |
| `pauseKey` | habilitar para evento sistémico/regulatorio; aprobación múltiple. |
| `wipeKey` | evitar salvo que el contrato, análisis legal y política de recuperación lo justifiquen de manera explícita. |
| `feeScheduleKey` | evitar comisiones discrecionales; si se usa, divulgar fórmula, tope y gobernanza. |

Diagrama de emisión:

```text
SPV + expediente legal aprobado
          │
          ├─ define unidades, cap, derechos y llaves con multisig
          ▼
Crear token HTS / desplegar ATS ──► registrar token ID y hash documental
          │
          ▼
KYC inversor ──► vincular cuenta Hedera ──► grant KYC / allowlist
          │                                      │
          └── falla o vence ──► no asociar / freeze / revisar caso
                                                 │
                                                 ▼
Suscripción aprobada ──► transferencia desde treasury ──► conciliación + certificado
```

Pseudocódigo de la creación HTS (ejecutar en testnet primero; custodiar las llaves en Fireblocks y no en variables de entorno):

```ts
const tx = await new TokenCreateTransaction()
  .setTokenName("Edificio A Participaciones 2026")
  .setTokenSymbol("EDIFA26")
  .setTokenType(TokenType.FungibleCommon)
  .setDecimals(0)
  .setTreasuryAccountId(issuerAccountId)
  .setInitialSupply(10_000)
  .setSupplyType(TokenSupplyType.Finite)
  .setMaxSupply(10_000)
  .setAdminKey(adminMultisigPublicKey)
  .setSupplyKey(supplyPublicKey)
  .setKycKey(kycPublicKey)
  .setFreezeKey(freezePublicKey)
  .setPauseKey(pausePublicKey)
  .freezeWith(client);

// La firma y envío deben pasar por el flujo MPC/política aprobado.
const receipt = await (await tx.execute(client)).getReceipt(client);
const tokenId = receipt.tokenId;
```

La habilitación posterior de un inversor requiere, como mínimo: creación/vinculación de cuenta Hedera, asociación al token cuando aplique, `TokenGrantKycTransaction` ejecutada por el rol/llave autorizado y comprobación de que la cuenta no esté congelada. Antes de cada transferencia, el servicio debe validar en el ledger interno **y** en cadena: KYC vigente, cuenta asociada, no congelada, allowlist/regla de país, límites de posición y estado de oferta.

## 7. Interfaces de producto

### Portal de inversor

- alta, consentimiento y estado de KYC; nunca exponer motivo sensible de un ROS;
- oferta: SPV, documento legal, riesgo, unidades, precio, restricciones, token ID, calendario y estado de suscripción;
- vinculación de wallet y firma de prueba; mostrar red Hedera y advertir que no enviar a otra red;
- cartera: unidades, coste, distribuciones, estado de transferencia y documentos; retiro/transferencia sólo a wallet aprobada;
- soporte, recuperación y canales de reclamo.

### Back office de cumplimiento y operaciones

- cola de KYC/EDD, alertas on-chain, PEP/sanciones, revisiones y evidencia;
- vista de cliente/UBO/wallet con separación de permisos; exportación de auditoría;
- emisión y distribución con vista previa de supply, token ID, contratos y aprobadores Fireblocks;
- controles de freeze/pause con doble aprobación y fundamento; ningún botón irreversible sin revisión;
- reconciliación tres vías: orden/ledger interno ↔ transacción Fireblocks ↔ transaction ID y balance Hedera.

## 8. APIs propias mínimas

```text
POST /v1/customers                         crea expediente
POST /v1/customers/{id}/kyc-submissions     inicia/actualiza KYC
POST /v1/customers/{id}/wallets             vincula wallet y prueba de control
GET  /v1/customers/{id}/eligibility          estado y vencimiento (sin detalles confidenciales)
POST /v1/properties                         crea proyecto/SPV y checklist legal
POST /v1/properties/{id}/tokens             solicitud de emisión, no emisión automática
POST /v1/offers/{id}/subscriptions          reserva/suscripción sujeta a compliance
POST /v1/transfers                          solicita transferencia/retiro
POST /v1/webhooks/fireblocks                recibe eventos autenticados
POST /v1/webhooks/kyc                       recibe decisión del proveedor
GET  /v1/reconciliations/daily              diferencias y excepciones
```

Separar comandos de consultas, requerir autenticación fuerte, autorización por rol, `Idempotency-Key`, límites de velocidad y bitácora de auditoría *append-only*. No aceptar de frontend `vaultAccountId`, cantidad, destino o token como fuente de verdad sin verificar que pertenezcan a la orden aprobada.

## 8.1 Mercado secundario: compra y venta de tokens entre usuarios

La tabla anterior cubría una **transferencia/retiro permissioned**, pero no describía un mercado secundario completo. La compraventa entre usuarios puede incorporarse como operación separada, siempre que la estructura jurídica y regulatoria del token, la plataforma y la intermediación haya sido revisada antes de habilitarla. No abrir un mercado libre P2P ni permitir transferencias a cualquier wallet por defecto.

La versión inicial más controlable es un **tablón de órdenes interno con liquidación administrada**: comprador y vendedor envían órdenes, la plataforma verifica elegibilidad de ambos, reserva activos y fondos, hace *matching*, instruye la liquidación y reconcilia. Fireblocks no opera el mercado ni determina quién puede negociar: protege las llaves y aplica políticas a la transferencia que nuestra plataforma ya aprobó.

| Operación secundaria | Actor que inicia | Ejecución técnica | Condición para avanzar | Estado final esperado |
| --- | --- | --- | --- | --- |
| Publicar orden de venta | Vendedor | Portal → `POST /orders/sell` → backend/ledger | KYC vigente, tokens disponibles, wallet/custodia aprobada y sin freeze | `open` con unidades reservadas; los tokens no pueden venderse dos veces. |
| Publicar orden de compra | Comprador | Portal → `POST /orders/buy` → backend/ledger | KYC vigente, perfil/límites aprobados y fondos disponibles o preautorizados | `open` con fondos reservados o instrucción de pago pendiente. |
| Revalidar cumplimiento | Sistema + oficial cuando aplique | Motor KYC/KYT, screening de direcciones, reglas de país/posición y alertas | Ambos lados siguen elegibles al momento del match | `eligible` o `blocked`; la orden bloqueada no se liquida. |
| Hacer matching | Motor de órdenes interno | BD transaccional; precio, cantidad, prioridad y reglas de mercado documentadas | Órdenes compatibles y reservas activas | `matched`; crear `tradeId` idempotente y bloquear cambios. |
| Confirmar fondos | Banco/rail de pago o activo de liquidación | Callback autenticado y conciliación de pago | Importe exacto, origen aceptable y ventana temporal vigente | `funded`; si expira, liberar reservas con auditoría. |
| Entregar token | Backend → Fireblocks → Hedera | Crear transferencia autorizada desde vault/cuenta de vendedor o escrow a cuenta del comprador | Trade `matched + funded`, KYC on-chain válido, cuenta asociada y no congelada | `token_delivered` después de webhook Fireblocks y receipt Hedera. |
| Pagar al vendedor | Backend → banco/rail de pago | Instrucción de pago posterior a entrega, o mecanismo DvP/escrow validado | Entrega confirmada y sin alerta de excepción | `settled`; actualizar ambos saldos y comprobantes. |
| Gestionar fallo/reverso | Operaciones y cumplimiento | Máquina de estados; no reintentar ciegamente | Error de red, vencimiento, rechazo, alerta o divergencia de conciliación | `failed` / `cancelled` / `under_review`; liberar o inmovilizar según caso y contrato. |

### Secuencia de una operación secundaria

```text
Vendedor crea orden ─┐
                     ├─► KYC/KYT y reglas de ambos ► reservas de token/fondos ► matching
Comprador crea orden ┘                                                    │
                                                                          ▼
                         pago confirmado ◄── rail de pago ◄── instrucción de cobro
                                                                          │
                                                                          ▼
                     Fireblocks Policy/MPC ► Hedera transfer ► receipt + webhook
                                                                          │
                                                                          ▼
                              conciliación ledger ► pago al vendedor ► settled
```

**Modelo de custodia y entrega.** En custodia ómnibus, el ledger reserva la posición del vendedor y Fireblocks ejecuta el movimiento de la cuenta controlada; el contrato debe explicar la segregación y el derecho del cliente. En autocustodia, la plataforma debe comprobar que la wallet del vendedor controla el token y que la wallet del comprador está asociada, permitida y con KYC vigente. Para una primera versión, evitar *smart contracts* propios de escrow hasta contar con diseño legal y auditoría independiente; un flujo con reserva interna, aprobación Fireblocks y transferencias HTS permissioned reduce superficie técnica pero no elimina riesgo de contraparte/operación.

El diagrama específico está en [operations-secondary-market.html](./operations-secondary-market.html). Los demás grupos operativos están en [operations-onboarding-compliance.html](./operations-onboarding-compliance.html) y [operations-issuance-custody.html](./operations-issuance-custody.html).

## 9. Controles, pruebas y salida a producción

1. **Legal y producto:** opinión sobre vehículo y oferta, contratos tokenizados, tratamiento tributario, privacidad y reglas de transferencia; resolución de directorio por cada emisión.
2. **Cumplimiento:** inscripción PSAV activa, oficial y manuales, pruebas de onboarding/EDD/ROS, reportes y conservación de registros.
3. **Seguridad:** revisión de políticas Fireblocks, MFA, gestión de secretos, pentest, revisión independiente de contratos/ATS si se usan, pruebas de recuperación y respuesta a incidente.
4. **Pruebas técnicas:** Hedera testnet, vault de sandbox, unitarias de estados, webhooks repetidos/fuera de orden, simulación de freeze/pause, reintentos idempotentes y reconciliación.
5. **Piloto limitado:** pocos inversores, sin secondary market, límites bajos y conciliación diaria con aprobación humana.
6. **Producción:** monitoreo 24/7 de movimientos, SLAs, revisión periódica de KYC, auditoría, evaluación anual de riesgo y revisión regulatoria antes de expandir activos, países o funcionalidades.

## 10. Fuentes técnicas y regulatorias

- SEPRELAD, [Resolución 314/2021](https://www.seprelad.gov.py/userfiles/files/resoluciones/314-21-activos-virtuales.pdf) y [consulta de sujetos obligados](https://www.seprelad.gov.py/siro/consultaExterna/consultaExternaSoAe.xhtml).
- Biblioteca y Archivo Central del Congreso, [Ley 1015/97](https://www.bacn.gov.py/leyes-paraguayas/988/ley-n-1015-).
- Fireblocks, [API Reference](https://api-reference.fireblocks.com/) y [guía de capacidades](https://fireblocks.readme.io/docs/capabilities).
- Hedera, [Hedera Token Service](https://hedera.com/service/token-service/) y [operaciones de Asset Tokenization Studio](https://docs.tokenization-studio.hedera.com/ats/user-guides/token-operations/).

**Fecha de investigación:** 20 de septiembre de 2026. La regulación, procesos de registro y APIs evolucionan; confirmar vigencia y requisitos directamente con las autoridades, proveedores y asesores antes de depender de este documento.
