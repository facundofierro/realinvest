# Cobros y pagos fiat en Paraguay: rails, proveedores y diseño de integración

> **Propósito.** Investigación de proveedores y medios de pago para las corrientes fiat de la plataforma tokenizadora: cobro de suscripciones, pago al desarrollador/SPV, distribución de alquileres y rescates. Documento técnico-operativo, no asesoramiento legal, tributario ni financiero. Complementa a [fireblocks.md](./fireblocks.md) (custodia y flujo token) y debe validarse con los bancos y procesadores locales antes de integrar.

## 1. Corrientes de dinero que debemos soportar

El diseño de referencia (ver [fireblocks.md](./fireblocks.md), secciones 4.3 y 8.1) define cuatro flujos fiat que este documento debe cubrir:

| Flujo | Dirección | Cadencia | Requisito operativo |
| --- | --- | --- | --- |
| Suscripción primaria | inversor → SPV (vía plataforma) | por orden | confirmación idempotente antes de liberar tokens desde treasury. |
| Pago a desarrollador | SPV → desarrollador | por proyecto/etapa | instrucción posterior a entrega documentada; comprobante para el expediente. |
| Distribución de alquiler/dividendos | SPV → inversores | periódica (fecha de corte) | archivo masivo aprobado, retenciones y comprobantes por tenedor. |
| Rescate / liquidación | SPV → inversor | por evento | después de burn/rescate confirmado on-chain. |

Principios ya fijados en la arquitectura: el fiat **nunca** viaja directo inversor → desarrollador; la plataforma intermedia cobro y pago como agente, con fondos segregados contablemente por vehículo (fireblocks.md §1.5); toda orden sigue la secuencia `reservar → cobrar/confirmar → transferir → conciliar`.

## 2. Mapa de rails disponibles en Paraguay

| Rail | Qué resuelve | Alcance | Observaciones |
| --- | --- | --- | --- |
| Tarjetas (adquirencia) | cobros online con tarjeta de crédito/débito | local + internacional vía marcas | requiere alta de comercio; revisar tratamiento de rubro "activos virtuales" (ver §6). |
| Transferencia interbancaria | cobros y pagos de montos altos | local | ventanas horarias y cargos por banco; ideal para suscripciones de monto relevante y payouts. |
| Billeteras / QR interoperable | cobros de bajo monto, alta conversión | local (Zimple, TPago, Panal, billeteras bancarias) | confirmación rápida; útil para fracciones de ticket chico. |
| Débito automático | cobros recurrentes preautorizados | local | sólo si se ofrecen planes de inversión recurrente; requiere mandato del cliente. |
| Red de cobranzas (Infonet Cobranzas) | pago presencial de facturas/órdenes | nacional | alternativa para inversores sin banca; conciliar por boleta/código. |
| Transferencia internacional (SWIFT) | inversores del exterior, USD | cross-border | costo y latencia altos; requiere cuenta en divisa y cumplimiento reforzado de origen de fondos. |
| Agregador emergentes (dLocal y similares) | pay-in/pay-out cross-border con métodos locales | Latam + | unifica tarjeta, transferencia local y billeteras en un solo contrato API. |
| Off-ramp establecoins (futuro) | liquidación cripto→fiat | a evaluar | sólo después de la opinión legal; conecta con el vertical crypto de los agregadores. |

**Nota sobre cámaras de compensación:** las transferencias interbancarias locales se liquidan a través de las cámaras autorizadas por el BCP (p. ej. la Cámara Compensadora Electrónica / ACH). Confirmar con cada banco ventanas de corte, disponibilidad horaria y APIs antes de diseñar la conciliación.

## 3. Proveedores evaluados

### 3.1 Bancard (red local)

Adquirente local con ~40 años de operación y más de 100.000 comercios. Producto relevante para la plataforma:

- **vPOS**: cobros con tarjeta integrados a web/app (checkout hosted o API) con confirmación asincrónica.
- **QR / pagos con billeteras**: acepta Zimple, Panal, Billetera Personal/Visión/PJ y otras marcas del mercado; el QR es el método de mayor crecimiento local.
- **TPago**: cobros por WhatsApp/redes sociales sin sitio web (útil para preventa conversacional).
- **Débito automático**: para suscripciones recurrentes preautorizadas.
- **Infonet Cobranzas**: red presencial de pago de servicios (boca de cobro para inversores sin tarjeta).
- Portal de comercios con reportes y facturación; soporte 24/7.

Consideraciones: contratación como comercio local (RUC, estatuto, cuenta bancaria); las comisiones y plazos de acreditación se negocian por volumen; la confirmación programática de cada venta debe llegar a nuestro backend por reporte o integración (validar webhooks/API disponibles para el producto contratado). Referencia: [bancard.com.py](https://www.bancard.com.py/) y [portal de comercios](https://comercios.bancard.com.py/).

### 3.2 Zimple (billetera conectada al sistema financiero)

Billetera electrónica de Payments Electronic Services (grupo Bancard) interoperable con bancos y financieras (BBVA, Sudameris, Atlas, Regional, Basa, GNB, Visión, Bancop, Interfisa, Fielco, entre otros). Permite giros entre contactos de cualquier telefonía, pago en comercios con QR/POS y retiro en cajeros de la red Infonet. Existente oferta **Zimple Empresas** para cobros corporativos. Caso de uso: cobro ágil de suscripciones pequeñas y distributions de bajo monto. Referencia: [zimple.com.py](https://www.zimple.com.py/).

### 3.3 dLocal (agregador cross-border)

Plataforma de pagos de mercados emergentes con cobertura explícita de Paraguay y vertical de industria cripto/financiera. Productos: **Payins** (tarjetas, transferencias y métodos locales), **Payouts** (pagos masivos en moneda local), **dLocal for Platforms** (cobro y split de fondos entre participantes de una plataforma — relevante si la PSAV opera como marketplace de SPVs), **Defense Suite** (antifraude/chargebacks) e **Invoice Collection**. API única con documentación pública y sandbox ([docs.dlocal.com](https://docs.dlocal.com/)). Caso de uso: inversores extranjeros que pagan con métodos de su país, y payouts a beneficiarios locales sin construir integraciones banco por banco. Verificar: contratación desde la entidad paraguaya, alta de comercio para rubro RWA/activos virtuales, y métodos exactos de payout disponibles hoy en Paraguay. Referencia: [dlocal.com](https://www.dlocal.com/) y [cobertura Paraguay](https://www.dlocal.com/payment-processors-in-latin-america/paraguay-payment-methods-processors-e-commerce-market-dlocal/).

### 3.4 Italpagos y otros agregadores locales

Existen agregadores locales además de Bancard (Italpagos, pasarelas de los propios bancos). El sitio de Italpagos no estuvo accesible durante esta investigación; su oferta (checkout tarjetario, links de pago, conciliación) debe confirmarse directamente. Criterio: cualquier agregador local debe proveer confirmación programática (API/webhook firmado) y archivo de conciliación diario; sin eso no sirve para la secuencia `cobrar → confirmar → transferir`.

### 3.5 Banca corporativa directa

Para payouts (desarrollador, distribuciones, rescates) la vía más robusta es la cuenta corporativa del SPV (o cuenta segregada de la PSAV) en un banco local, operando con:

- transferencias individuales vía banca empresarial web (control interno: doble aprobador);
- **archivos masivos de pagos** (formato de nómina/proveedores del banco) aprobados por back office para distribuciones;
- extracto electrónico diario para la conciliación tres vías (orden ↔ pago ↔ ledger/Hedera);
- cuenta en USD (o cuenta en el exterior del vehículo) para inversores internacionales vía SWIFT.

La banca API pública es limitada en el mercado local; planificar integración por archivos y extractos con tolerancia a proceso batch, salvo que el banco ofrezca host-to-host.

### 3.6 Comparativa resumida

| Proveedor | Pay-in local | Pay-in cross-border | Payout masivo | Confirmación programática | Mejor uso en nuestra plataforma |
| --- | --- | --- | --- | --- | --- |
| Bancard | tarjetas, QR/billeteras, TPago, débito automático | tarjetas internacionales | no (usar banco) | por validar según producto | cobro de suscripciones locales. |
| Zimple | billetera/QR | no | giro a contactos | por validar | tickets chicos, cobros móviles. |
| dLocal | métodos locales vía API | sí (fortaleza) | sí (Payouts) | sí (API + webhooks) | inversores del exterior; payouts estandarizados. |
| Banco corporativo | transferencia | SWIFT/USD | archivo masivo | extracto / host-to-host | payouts, distribuciones, rescates. |
| Infonet Cobranzas | presencial | no | no | reporte de boletas | inversores sin banca/tarjeta. |

## 4. Arquitectura de integración propuesta

Extender el backend existente con un servicio de pagos que abstraiga el proveedor:

```text
Portal ──► API propia (orden idempotente) ──► Proveedor de cobro (vPOS / dLocal / QR)
                        │                              │
                        │                     webhook/callback firmado
                        ▼                              ▼
                 Ledger: payment_intent ──► confirmed ──► liberar transferencia token (Fireblocks)
                        │
                        └──► conciliación diaria: extracto bancario ↔ proveedor ↔ ledger ↔ Hedera
```

Reglas:

1. **Ningún monto, origen ni destino proviene del frontend como fuente de verdad**: el backend recalcula el importe de la orden y verifica que el pago recibido coincida exactamente (importe exacto, origen aceptable y ventana temporal vigente — igual que el flujo `funded` del mercado secundario en fireblocks.md §8.1).
2. **Máquina de estados propia**: `created → pending_provider → confirmed | failed | expired | refunded`; sólo `confirmed` (y conciliado) habilita la entrega de tokens o el pago al beneficiario.
3. **Webhooks verificados**: validar firma/origen, reconsultar la operación por API antes de mutar el ledger, idempotencia por identificador de evento (los callbacks pueden repetirse o llegar desordenados).
4. **Cuentas segregadas**: cobros y saldos operativos en cuentas separadas por vehículo (ideal: la cuenta de cobro pertenece al SPV, no a la PSAV; la PSAV sólo factura su comisión). Ver tratamiento contable en la discusión de fireblocks.md §1.5.
5. **Payouts con cuatro ojos**: todo archivo o instrucción de pago (desarrollador, distribuciones, rescates) requiere aprobación de back office, registro de comprobantes y bloqueo operativo si la conciliación diaria arroja diferencias materiales.
6. **No guardar datos de tarjeta** en nuestros sistemas; el checkout ocurre en página/SDK del proveedor (PCI scope del adquirente).

### Matriz operativa

| Operación | Ejecutor técnico | Controles previos | Resultado esperado |
| --- | --- | --- | --- |
| Cobrar suscripción | vPOS/QR/dLocal según mercado del inversor | orden aprobada por compliance; importe y ventana vigentes | `payment confirmed` idempotente en ledger. |
| Confirmar fondos | webhook + reconsulta + extracto | importe exacto y origen aceptable | orden `funded`; expira → liberar reserva con auditoría. |
| Entregar tokens | Fireblocks → Hedera (treasury → inversor) | pago confirmado y elegibilidad vigente | receipt + webhook conciliados. |
| Pagar desarrollador | transferencia bancaria desde cuenta del SPV | entrega documentada y aprobación dual | comprobante en expediente del proyecto. |
| Distribuir alquileres | archivo masivo del banco | libro de tenedores en fecha de corte, retenciones | comprobantes por inversor en el ledger. |
| Rescatar | banco del SPV → cuenta del inversor | burn/rescate confirmado on-chain | `settled` con trazabilidad completa. |

## 5. Criterios de selección y preguntas a cada proveedor

Checklist para el piloto (mismos criterios que fireblocks.md §5.0 aplicados a pagos):

1. **Prueba local**: procesar en sandbox cédula/RUC, boletas y transferencias reales de Paraguay antes de firmar.
2. **Contrato y fondos**: quién es el mercante de registro, en qué cuenta quedan los fondos, plazos de liquidación, quién asume contracargos y fraude.
3. **Integración**: API + webhooks firmados, sandbox completo, idempotencia, SDKs, límites de tasa, disponibilidad real (SLA) y página de estado.
4. **Conciliación**: archivos/reportes diarios con identificador de transacción cruzable contra nuestro ledger y el extracto bancario.
5. **Payouts**: formato de archivo masivo, cortes horarios, costos por transferencia, tope de montos, manejo de rechazos y reintentos.
6. **Cumplimiento del proveedor**: KYC que ellos aplican al mercante, tratamiento de datos, retención, auditoría y derecho de terminación/exportación.
7. **Costo total**: comisión por transacción, cargo fijo, spread cambiario (cross-border), costos de contracargo y de integración.

## 6. Riesgo de rechazo por rubro "activos virtuales"

Adquirentes y agregadores aplican restricciones a rubros cripto. Nuestra posición correcta es la de **plataforma de inversión inmobiliaria regulada como PSAV** (la cripto es internalidad de liquidación, no el producto vendido), pero debe declararse la actividad tal cual es en el alta de comercio y confirmar por escrito la aceptación del rubro antes de integrar. Mitigaciones: contratar primero el rail bancario (transferencias) que el tarjetario; diversificar entre un adquirente local y un agregador cross-border; mantener la opción de cobro por boleta/red de cobranzas.

## 7. Recomendación inicial

1. **Cobros locales**: alta de comercio en Bancard (vPOS tarjetario + QR/billeteras) para la mayoría de los inversores; transferencia bancaria directa a la cuenta del SPV como método principal para montos grandes (menor comisión, mayor trazabilidad).
2. **Inversores del exterior**: dLocal Payins (o SWIFT a cuenta USD del SPV, según costo y perfil del inversor).
3. **Payouts**: banca corporativa del SPV con archivo masivo y doble aprobación; evaluar dLocal Payouts cuando el volumen de distribuciones lo justifique.
4. **Piloto**: piloto limitado según fireblocks.md §9 (pocos inversores, montos bajos, conciliación diaria manual con aprobación humana de cada payout).

## 8. Fuentes

- [Bancard](https://www.bancard.com.py/) — productos vPOS, QR, TPago, débito automático, Infonet Cobranzas.
- [Zimple](https://www.zimple.com.py/) — billetera, bancos conectados y Zimple Empresas.
- [dLocal](https://www.dlocal.com/) — [Payins](https://www.dlocal.com/our-solution/payins/), [Payouts](https://www.dlocal.com/our-solution/payouts/), [dLocal for Platforms](https://www.dlocal.com/our-solution/dlocal-for-platforms/), [cobertura de Paraguay](https://www.dlocal.com/payment-processors-in-latin-america/paraguay-payment-methods-processors-e-commerce-market-dlocal/), [documentación para desarrolladores](https://docs.dlocal.com/).
- [BCP — Banco Central del Paraguay](https://www.bcp.gov.py/) — sistema nacional de pagos y cámaras de compensación (confirmar normativa aplicable a servicios de pago).
- Diagramas operativos propios: [fireblocks-operations-architecture.html](./fireblocks-operations-architecture.html) y [operations-issuance-custody.html](./operations-issuance-custody.html).

**Fecha de investigación:** 21 de septiembre de 2026. Comisiones, métodos disponibles y requisitos de alta cambian con frecuencia; confirmar vigencia directamente con cada proveedor antes de contratar. Sitios de agregadores locales (Italpagos) no accesibles durante la investigación; pendiente verificación directa.
