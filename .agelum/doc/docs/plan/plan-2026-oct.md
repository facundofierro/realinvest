# Plan de negocio — octubre 2026

Primer plan comercial de Real Invest. Está escrito para la **primera implementación en Paraguay**, pero la estructura (producto, servicios, monetización, armado societario) está pensada para repetirse en otros países. Tiene tres objetivos:

1. Decidir **qué vendemos ahora** a los primeros desarrolladores en Paraguay y qué va en la landing page.
2. Dejar por escrito **qué queremos ofrecer más adelante** (tokenización, marketplace regional, servicios adicionales) para que la landing y los primeros contratos no lo contradigan.
3. Listar las **decisiones** que tenemos que tomar y las **estrategias** entre las que podemos elegir.

> Estado del producto: ver [status-2026-sep.md](./status-2026-sep.md). Contexto regulatorio de Paraguay: `doc/docs/research/` (PSAV, fideicomiso, Ley 7572/2025, pagos).

---

## 1. Resumen

- **Quién es el cliente:** **desarrolladoras** inmobiliarias que venden unidades en proyectos que todavía están en construcción (*venta en pozo*). En esta etapa, los inversores y compradores son usuarios de la desarrolladora, no clientes directos nuestros.
- **Qué vendemos primero:** una **plataforma de venta en pozo** white-label. Cubre lanzamientos por etapas, reservas, un inventario de unidades con disponibilidad en vivo, un portal del inversor que muestra cómo va cada compra, y pagos. Incluye una implementación única, y personalizamos la plataforma para cada uno de los primeros clientes.
- **Qué vendemos alrededor:** implementación y personalización, vistas 3D y multimedia, marketing y operaciones comerciales con IA (ingeniería de go-to-market) y pagos con cripto.
- **Qué ofrecemos a pedido:** **tokenización inmobiliaria**. Para esto necesitamos una empresa paraguaya registrada como **PSAV** (SEPRELAD), así que la landing la menciona y la vendemos caso por caso.
- **Objetivo de largo plazo:** un **marketplace regional** donde muchas desarrolladoras publiquen sus proyectos e inversores de la región compren. No forma parte de la primera etapa. La landing solo lo presenta como algo futuro.
- **Cómo cobramos al principio:** un **costo de implementación** accesible y un **abono mensual** de operación bajo, más ingresos por transacción donde realmente movemos dinero (pagos, cripto, tokenización).
- **Cómo nos expandimos:** una empresa operadora local en cada país con un socio local (modelo de franquicia, licencia o joint venture), usando el mismo código desplegado por cliente.

---

## 2. Oportunidad: Paraguay primero

- Tenemos **clientes potenciales** en Paraguay y una **demo funcionando** para mostrar (la app wallet: proyectos, etapas, unidades, reservas, portafolio, KYC, depósitos).
- Tenemos un **posible socio local** interesado en vender el producto en Paraguay.
- Paraguay tiene un **marco legal reciente** para valores tokenizados y proveedores de activos virtuales (Ley 7572/2025, registro PSAV en SEPRELAD). La investigación ya está hecha. La tokenización inmobiliaria es legalmente posible allí, pero no es algo que podamos ofrecer desde el primer día.
- Las desarrolladoras paraguayas ya venden *en pozo*, pero mayormente a través de corredores, planillas, WhatsApp y contratos en papel. Los inversores reciben muy poca información después de pagar. **Esa brecha es nuestra puerta de entrada**, y no requiere tokenización.

**Por qué se puede repetir en otros países:** el mismo problema (ventas en pozo con herramientas pobres y poca transparencia para el inversor) existe en toda Latinoamérica. La decisión técnica de resolver el multi-tenancy **en tiempo de despliegue** (un despliegue por cliente o país, paquetes compartidos) encaja con un despliegue país por país. Solo cambian por jurisdicción las capas legal y de pagos. Ver status §3.5 y §3.6.

---

## 3. Visión de producto por etapas

| Etapa | Qué | Quién paga | Requiere |
| --- | --- | --- | --- |
| **1. Plataforma de ventas para desarrolladoras** (ahora) | Plataforma white-label de venta en pozo: etapas, eventos de lanzamiento, reservas, inventario, portal del inversor, pagos fiat | Desarrolladora | Robustecer el producto y un despliegue propio por cliente. No requiere licencia. |
| **2. Servicios de valor agregado** (ahora, en paralelo) | Implementación, 3D/multimedia, marketing y ventas con IA, pagos con cripto | Desarrolladora | Socios (estudio 3D, agencias de marketing), proveedor de pagos cripto |
| **3. Tokenización** (a pedido) | Venta fraccionada o tokenizada de unidades, custodia, mercado secundario | Desarrolladora e inversores (comisiones) | Empresa local, registro PSAV, estructura de fideicomiso, Fireblocks |
| **4. Marketplace regional** (futuro) | Marketplace público multi-desarrolladora, inversores de otros países | Desarrolladoras, inversores, socios | Masa crítica de desarrolladoras en la plataforma, pagos y KYC transfronterizos |

Cada etapa debería **reutilizar las cuentas y los datos de inversores** creados en las etapas anteriores. Así es como el marketplace de la etapa 4 se vuelve posible: un inversor que se registró a través de la desarrolladora A después puede descubrir a la desarrolladora B.

---

## 4. Producto principal: funciones que ayudan a vender a la desarrolladora

Surgen del código actual. "Existe" significa que la pantalla o el modelo de datos ya está en la demo (mayormente simulado). "A construir" significa que hace falta para un cliente real.

### 4.1 Lanzamientos por etapas y día de lanzamiento (el "modelo Dubái")

La plataforma se inspiró en cómo se venden los proyectos en pozo en Dubái:

- El proyecto se libera en **etapas** (`stages`: nombre, fecha, estado activa o próxima, cantidad de unidades, disponibilidad, precio mínimo). El precio sube de una etapa a la siguiente, lo que premia a los primeros compradores y genera urgencia. **Existe** (detalle del proyecto, API de etapas).
- Antes de que se abra una etapa, los inversores interesados pagan un **depósito de acceso**, similar al EOI (expression of interest) de Dubái. Solo quienes lo pagaron pueden participar del lanzamiento.
- El **día del lanzamiento** la etapa se abre a una hora fija. El primer inversor que reserva una unidad obtiene el derecho a comprarla (`queueOrder`, estados de unidad *Disponible / Bloqueado / Vendido / Próximamente*, `launchDate` / `nextLaunchDate` del proyecto). **Existe en parte.** Las unidades, los estados, las fechas de lanzamiento y la acción "Reservar" ya están. Falta construir el acceso condicionado al pago, la cuenta regresiva y la asignación por orden de llegada en tiempo real.
- Si el inversor no compra, el depósito se devuelve o se acredita a la compra. La regla la decide la desarrolladora.

**Por qué le importa a una desarrolladora latinoamericana:** no es su forma habitual de vender. Convierte una preventa lenta, dependiente de corredores, en un **evento**. Le da señales de demanda antes del lanzamiento (cuántos depósitos pagados y para qué tipologías), genera urgencia real y sostiene escalones de precio entre etapas. Es el mensaje más fuerte para la landing. La plataforma también admite la forma actual de vender de la desarrolladora (reserva directa, venta con corredores), así que adoptarla no obliga a cambiar.

### 4.2 Inventario y reservas

- Un **inventario de unidades** en vivo: piso, tipología, m², dormitorios y baños, orientación, plano, precio y un estado que se actualiza a medida que se venden. **Existe.**
- **Modalidades de compra** por unidad o proyecto (`purchase_options`): propiedad completa, en construcción (*pozo*), renta fija, lanzamiento de tokens. **Existe como UI.** Para la etapa 1 mantenemos "propiedad completa" y "pozo". Las modalidades con tokens quedan ocultas hasta la etapa 3.
- **A construir:** planes de pago en cuotas (atadas a hitos de obra), típicos de la venta en pozo. También hacen falta reglas de vencimiento de reservas, atribución a corredor o agente, e integración con contratos o firma electrónica.

### 4.3 Portal del inversor: la transparencia como argumento de venta

Como inversor, el fundador ve que esto falta incluso en Dubái. El inversor debería tener **toda la información necesaria para decidir y, después, para seguir su inversión**:

- Un panel con saldo, tenencias, actividad reciente y proyectos destacados. **Existe.**
- Portafolio con costo de adquisición vs. valor actual por tenencia. **Existe** (hecho para tokens; hay que adaptarlo a unidades completas).
- Avance de obra por proyecto (`progressPct`) e **historias del proyecto** (novedades visuales). **Existe.**
- Historial de transacciones, depósitos y retiros. **Existe.**
- Un chat con asistente de IA. **Existe como simulación.** Responde preguntas sobre los proyectos y la posición del inversor.
- **A construir:** cronograma de pagos y recordatorios de la próxima cuota, un repositorio de documentos (contratos, recibos, permisos), fotos y videos de la obra enviados como notificaciones, y un cronograma de entrega.

**Argumento para la desarrolladora:** los inversores confían y vuelven a las desarrolladoras que son transparentes. Los compradores recurrentes y los referidos cuestan menos que los leads nuevos, y "esta desarrolladora usa Real Invest" se vuelve una señal de calidad.

### 4.4 Cumplimiento y onboarding

- Un flujo de onboarding KYC (identidad, Cédula o Pasaporte, documentos, beneficiarios finales, screening, estados pendiente, aprobado o rechazado), que habilita la inversión y los depósitos. **Existe** con un proveedor simulado.
- Inicio de sesión con Google. **Existe.**
- La SEPRELAD exige AML/KYC a muchos vendedores inmobiliarios de todas formas, así que es una función que la desarrolladora necesita, no un costo extra.

### 4.5 Pagos

- Cobro fiat por medios locales (Bancard vPOS, billeteras QR, transferencia bancaria, dLocal para pagos desde el exterior). Investigado en `research/providers/payments.md`. **A construir.**
- **Pagos con cripto (USDT):** un comprador que tiene cripto puede pagar una unidad y la desarrolladora recibe fiat (o cripto, si lo prefiere). **Esto no es tokenización.** Abre la propiedad al segmento de compradores con cripto, incluidos compradores extranjeros. La pantalla de depósito por QR (USDT) **existe** sobre la custodia simulada de Fireblocks. Para producción podemos procesar a través de un procesador cripto licenciado de terceros o esperar a tener nuestra propia PSAV. Ver decisión D6.

### 4.6 Back-office de la desarrolladora (app admin)

- Gestión de proyectos y propiedades, estadísticas, actividad, chat. **Existe** a nivel básico (`apps/admin`).
- **A construir:** configuración del lanzamiento (etapas, precios, monto del depósito, hora de apertura), pipeline de leads y reservas, reportes de ventas y comunicaciones a inversores.

### 4.7 Stack de tokenización (etapa 3)

Marketplace de tokens, mercado secundario (libro de órdenes, posiciones, operaciones), página de tokenización y custodia en Fireblocks. **Existe como demo.** Lo mantenemos para demos y para clientes que lo pidan, pero **no** es el primer producto.

### 4.8 Modelo de entrega

- App web, más envoltorios nativos (Capacitor para iOS y Android, Tauri para escritorio) que hoy están solo en estructura inicial.
- **White-label por cliente:** marca, dominio y despliegue por desarrolladora. El código se comparte a través de `packages/*`.

---

## 5. Catálogo de servicios

| Servicio | Descripción | Etapa | Tipo de ingreso | Notas |
| --- | --- | --- | --- | --- |
| **Implementación y personalización** | Despliegue, marca, carga de datos, adaptar los flujos al proceso de venta de la desarrolladora | 1 | Único (setup) | Necesario ahora. **Canal de aprendizaje**: los primeros clientes dan forma al producto estándar. Debería achicarse cuando el producto esté listo para usar. |
| **3D y multimedia** | Vistas o recorridos 3D de unidades, renders, visualización de planos, video para eventos de lanzamiento | 2 | Por proyecto o por pieza | Al principio, con un estudio 3D asociado. Las unidades ya tienen planos y espacios para imágenes. |
| **Marketing e ingeniería de go-to-market** | Gestión de campañas publicitarias, captación de leads, gestión del equipo de ventas o corredores, agentes de IA para seguimiento y calificación (los motores que usamos en otros proyectos) | 2 | Abono mensual y/o comisión por resultado | Se puede revender junto con agencias de marketing (reparto de ingresos). Encaja naturalmente con los días de lanzamiento. |
| **Pagos con cripto** | Aceptar USDT y otros activos para reservas y cuotas, con liquidación en fiat | 2 | % por transacción | Requiere un procesador licenciado o nuestra PSAV. |
| **Procesamiento de pagos fiat** | Cobro con tarjeta, QR y transferencia integrado con reservas y cuotas | 1 y 2 | Margen sobre la comisión de la pasarela, o tarifa fija | Costo trasladado más margen. Ver §6. |
| **Tokenización inmobiliaria** | Estructuración (fideicomiso), emisión de tokens, custodia, gestión de inversores, mercado secundario | 3 | Fee de estructuración, % de la emisión, fee de administración, comisiones de operación | Requiere empresa en PY, PSAV y socios legales. Se vende "a pedido". |
| **Publicación en el marketplace regional** | Publicar proyectos en un marketplace regional multi-desarrolladora | 4 | Publicación, posición destacada, comisión por éxito | Futuro. Solo se menciona como "próximamente". |

---

## 6. Monetización: opciones y recomendación

### 6.1 La pregunta central

Si una desarrolladora no tokeniza, **¿por qué nos pagaría una comisión recurrente?** La respuesta tiene que ser que el abono recurrente paga un valor que continúa en el tiempo: hosting y operación de la plataforma, el portal del inversor que usan sus compradores, pagos, cumplimiento, actualizaciones y soporte. Es un argumento SaaS normal. Una comisión porcentual necesita una razón clara, como dinero que procesamos o una venta que ayudamos a cerrar.

### 6.2 Opciones comparadas

| Modelo | Cómo funciona | Ventajas | Desventajas |
| --- | --- | --- | --- |
| **A. Setup + abono SaaS mensual** | Costo de implementación accesible y luego un abono mensual por nivel (cantidad de proyectos o unidades activas) | Previsible, fácil de explicar, normal en software | Un abono fijo puede parecer caro para una desarrolladora chica entre lanzamientos |
| **B. Comisión por éxito por unidad vendida** | Un % chico o monto fijo por unidad reservada o vendida a través de la plataforma | Alineado con la desarrolladora: paga cuando vende | Difícil verificar ventas cerradas fuera de la plataforma. La desarrolladora puede desviar ventas. |
| **C. Margen sobre el procesamiento de pagos** | Costo de la pasarela más nuestro margen en cada cobro (reservas, depósitos, cuotas) | Se cobra sobre flujo real de dinero, escala con el volumen | En tickets grandes un % sale caro, así que necesita un **tope por transacción**. Las desarrolladoras suelen preferir transferencias para evitar comisiones. |
| **D. Comisión por procesamiento cripto** | % sobre pagos con cripto, como una pasarela de pagos cripto | Aceptado por el mercado (1–2% es normal en procesadores cripto), nuevo segmento de compradores | Poco volumen al principio. Dependencia regulatoria (D6). |
| **E. Comisiones de tokenización** | Fee de estructuración, % de la emisión, fee anual de administración o custodia, comisiones de operación | Alto valor, justificado por el servicio y la licencia | Solo después de la PSAV. Ciclo de venta largo. |
| **F. Gratis a cambio de derechos de publicación en el marketplace** | Plataforma gratis; obtenemos el derecho a publicar sus proyectos en el marketplace público (y quizás una comisión al comprador o por lead) | Adopción rápida, construye la oferta del marketplace | Sin ingresos hasta que exista el marketplace. Solo funciona si la desarrolladora queda **muy integrada** con la plataforma. |
| **G. Ingresos por servicios** | Implementación, 3D, marketing (§5) | Caja desde el primer día, financia el producto | No escala como el software. Cuidar los márgenes de los servicios revendidos de socios. |

### 6.3 Modelo recomendado para la etapa 1 (hipótesis a validar con los primeros clientes)

1. **Costo de implementación:** accesible, y presentado en parte como "implementación" para que pague el trabajo de aprendizaje con los primeros clientes.
2. **Abono mensual de plataforma:** bajo, con niveles según proyectos activos. Es la "comisión de operación" que cubre hosting, soporte y actualizaciones.
3. **Procesamiento de pagos:** trasladar el costo de la pasarela con un margen chico y un **tope por transacción**. Los pagos con cripto llevan una comisión % aparte.
4. **Comisión por éxito opcional en eventos de lanzamiento:** cuando operamos el lanzamiento (acceso con depósito, campaña, seguimiento con IA), una comisión chica por unidad vendida en ese evento es fácil de justificar y de medir, porque la reserva ocurre dentro de la plataforma.
5. **Servicios** facturados por separado.
6. **Programa de socios fundadores** (variante de F) para las primeras 2–3 desarrolladoras: costo de implementación y abono reducidos o en cero durante el piloto. A cambio aceptan un caso de estudio y testimonio, sesiones de feedback, el **derecho a publicar sus proyectos en el futuro marketplace regional**, y que las cuentas de inversores se creen en nuestra red.

Sobre la **retención**: no deberíamos depender de los contratos para retener clientes. Deberíamos depender de que la operación de la desarrolladora corra sobre la plataforma: inventario, reservas, cobro de cuotas, comunicación con inversores, documentos y la propia base de inversores. Que las cuentas de inversores vivan en nuestra red (con la marca de la desarrolladora) es la verdadera barrera de salida y la semilla del marketplace. Igualmente, los contratos tienen que decir con claridad **quién es dueño de los datos de los inversores** (compartidos, con consentimiento) y que la desarrolladora puede exportarlos. Si no, se rompe la confianza con las desarrolladoras y con los reguladores.

### 6.4 Etapas posteriores

- **Tokenización:** fee de estructuración, % de la emisión, fee anual de administración o custodia, comisiones del mercado secundario.
- **Marketplace:** fees de publicación, posiciones destacadas, comisión por éxito en ventas transfronterizas, herramientas premium para compradores (análisis, alertas) e ingresos por referidos de socios (hipotecas, seguros, legal, administración de propiedades).

Los precios de referencia se dejan afuera a propósito. Hay que fijarlos después de 3–5 conversaciones con desarrolladoras en Paraguay (disposición a pagar, comisiones actuales de corredores, costos de pasarela).

---

## 7. Estructura societaria y expansión internacional

### 7.1 Paraguay ahora

- **Corto plazo (antes de tener entidad local):** el socio local actúa como **revendedor o agente comercial** a comisión. Los contratos y la facturación pasan por nuestra entidad existente. Esto alcanza para SaaS y servicios, y permite probar la demanda antes de invertir en una empresa.
- **Cuándo necesitamos entidad local:** para facturar localmente a escala, para cuentas de comercio con Bancard o bancos locales y, sobre todo, para el **registro PSAV** que requieren la tokenización o el procesamiento cripto propio.

### 7.2 Modelo para cada país

| Opción | Descripción | Encaje |
| --- | --- | --- |
| **Franquicia maestra o licencia** | Una empresa del socio local licencia la marca, la plataforma y el know-how, paga un monto inicial más regalías (% de ingresos), y se ocupa de ventas, operación y licencias en el país | Poco capital de nuestra parte, rápido. Menos control sobre la calidad y sobre el marketplace. |
| **Joint venture o subsidiaria local** | Una empresa local en copropiedad con el socio. Nosotros aportamos plataforma y tecnología; el socio, acceso al mercado y operación | Más control y participación en las ganancias locales. Requiere capital y gobierno corporativo. |
| **Híbrido (recomendado evaluar)** | Una **holding o empresa de PI** es dueña de la plataforma y la marca y las licencia a una **OpCo por país**. La OpCo es un JV con el socio local y tiene las licencias locales (PSAV), las cuentas de comercio y los contratos | Mantiene la PI y el marketplace centralizados y la responsabilidad local en lo local. Repetible por país. |

Elijamos lo que elijamos, el control central tiene que quedar en la holding: el **código, la marca y el futuro marketplace regional**. El marketplace solo funciona si todos los países se conectan a él.

---

## 8. Go-to-market en Paraguay

1. **Terminar la demo para ventas:** un flujo de día de lanzamiento de punta a punta (acceso con depósito, cuenta regresiva, reserva por orden de llegada), una unidad en pozo con plan de cuotas y un portal del inversor con novedades de obra. Todo en español.
2. **Landing page** (ver §9) más un formulario para pedir demo, y un video corto del flujo de lanzamiento.
3. **Prospección liderada por el socio:** el socio presenta 5–10 desarrolladoras y hacemos demos en vivo.
4. **2–3 clientes piloto** bajo el programa de socios fundadores. Usar la implementación para aprender qué es estándar y qué es a medida.
5. **Un evento de lanzamiento de muestra** con una desarrolladora piloto, incluyendo marketing y seguimiento con IA. Publicar los resultados como caso de estudio.
6. **En paralelo (frente legal):** decidir la entidad, luego el camino PSAV, y hablar con una fiduciaria para la estructura de fideicomiso. Esto prepara la tokenización sin bloquear la etapa 1.

---

## 9. Landing page: qué incluir

**Público:** desarrolladoras (B2B), no inversores. **Idioma:** español (Paraguay). Se puede sumar otro idioma más adelante.

### 9.1 Secciones recomendadas

1. **Hero:** "Vendé tu proyecto en pozo como en Dubái" (o similar). Subtítulo: una plataforma para lanzar etapas, tomar reservas y mantener informados a los inversores, con tu propia marca. CTA: *Agendar demo*.
2. **El problema:** preventas con planillas, WhatsApp y corredores. Inversores que no saben cómo va su compra.
3. **Día de lanzamiento (lanzamientos por etapas):** etapas con precios crecientes, acceso pago para inversores calificados, reservas por orden de llegada el día del lanzamiento y señales de demanda antes de lanzar.
4. **Inventario y reservas en vivo:** unidades, planos, disponibilidad, planes de compra y cuotas.
5. **Portal del comprador y experiencia del inversor:** avance de obra, pagos, documentos, novedades, asistente de IA; sección aparte para compradores e inversores que exploran oportunidades y vuelven a elegirte.
6. **Pagos:** tarjetas, QR, transferencias y **pagos con cripto** para llegar a compradores con activos digitales.
7. **Conocé a tus compradores:** actividad por interesado (proyectos vistos, unidades guardadas, registros) y reactivación de compradores anteriores. *(La verificación KYC se retiró de la landing.)*
8. **Servicios:** implementación y personalización, recorridos 3D y multimedia, marketing y automatización de ventas con IA (con agencias asociadas).
9. **Cómo funciona y precios:** "Implementación accesible + abono mensual". Sin precios exactos al principio, solo un CTA para conversar.
10. **CTA de demo, más contacto o WhatsApp con el socio local.**

*(Tokenización, marketplace y socios fundadores no figuran en la landing actual.)*

**Implementación:** la landing vive en `apps/landing` (Next.js, puerto 47313, dominio local `https://local.landing.realinvest.com` vía Caddy). Los textos están en `apps/landing/src/content/es.ts` (fuente editorial: [landing-copy-2026-oct.md](./landing-copy-2026-oct.md)); el formulario de demo guarda en la tabla `demo_requests` de SQLite (`DATABASE_URL=file:../../packages/db/wallet.db`, migración `0005_sweet_sway`). Metadatos SEO, `robots.txt` y `sitemap.xml` usan `NEXT_PUBLIC_SITE_URL`.

### 9.2 Qué evitar en la landing

- Prometer **rendimientos** (p. ej. "renta fija garantizada", o cifras de ROI presentadas como garantía). La demo tiene esas etiquetas, y son riesgosas frente al regulador de valores y frente a los consumidores.
- Presentar la tokenización o la custodia cripto como **disponibles hoy**. No podemos ofrecerlas sin la PSAV, así que siempre decir "a pedido" o "sujeto al marco regulatorio".
- Lenguaje dirigido a inversores ("invertí ahora") en una página dirigida a desarrolladoras. Mantener el mensaje B2B.

---

## 10. Decisiones a tomar

| # | Decisión | Opciones | Recomendación / próximo paso |
| --- | --- | --- | --- |
| D1 | **Relación con el socio en Paraguay** | Revendedor a comisión / franquicia maestra / JV | Empezar como **revendedor con exclusividad por tiempo limitado** atada a objetivos. Decidir entre franquicia y JV cuando cierren los primeros pilotos. |
| D2 | **Estructura societaria** | Una sola empresa / holding + OpCos por país | Diseñar ahora el modelo holding (PI) + OpCo, y constituir la OpCo de PY solo cuando lo requieran la PSAV o las cuentas de comercio. |
| D3 | **Modelo de precios para la etapa 1** | Opciones A–G de §6 | Setup + abono mensual + margen sobre pagos + comisión opcional por lanzamiento. Validar con 3–5 desarrolladoras. |
| D4 | **Programa de socios fundadores (gratis)** | Sí / no; cuántos; qué recibimos a cambio | Sí, máximo 2–3 desarrolladoras, por tiempo limitado, con derechos de publicación en el marketplace y caso de estudio por escrito. |
| D5 | **Propiedad de los datos de inversores** | Solo la desarrolladora / compartidos / plataforma | Compartidos con consentimiento explícito del inversor. La cuenta del inversor pertenece a la red, la relación comercial pertenece a la desarrolladora y la exportación está garantizada. |
| D6 | **Camino para pagos cripto** | Procesador licenciado de terceros ahora / PSAV propia después | Usar un procesador de terceros para el piloto y pasar a nuestra PSAV junto con la tokenización. |
| D7 | **Pasarela de pagos fiat para PY** | Bancard / dLocal / solo transferencia | Bancard para lo local, dLocal para lo transfronterizo. Confirmar el rubro de comercio y los webhooks. |
| D8 | **Cuándo iniciar el trámite PSAV** | Ahora / con el primer pedido de tokenización | Preparar la documentación ahora y presentarla cuando haya un cliente de tokenización comprometido. |
| D9 | **Alcance de la personalización** | Cualquier cosa / un conjunto acotado | Definir un "producto estándar" y cobrar aparte el trabajo a medida. Toda personalización vuelve al núcleo si es reutilizable. |
| D10 | **Socios de servicios** | Hacerlo internamente / con socios | Socios para 3D y agencias de marketing con reparto de ingresos. Mantener internamente el motor de ventas y marketing con IA. |
| D11 | **Marca** | Una marca global / una marca por país | Una marca para el marketplace y white-label para los portales de las desarrolladoras. |
| D12 | **Mecánica del día de lanzamiento** | Depósito reembolsable o no, acreditable o no, monto | Configurable por desarrolladora. Recomendar un valor por defecto (reembolsable y acreditable a la compra) para la demo. |

---

## 11. Riesgos

- **Resistencia al cambio:** las desarrolladoras en Latinoamérica están acostumbradas a vender con corredores, así que el modelo de día de lanzamiento es nuevo. *Mitigación:* soportar primero su proceso actual y ofrecer el día de lanzamiento como mejora, con un evento de muestra.
- **Demasiado trabajo a medida:** las primeras implementaciones se convierten en consultoría. *Mitigación:* alcance acotado (D9), con las personalizaciones incorporadas al núcleo.
- **Ventas fuera de la plataforma** (para evitar comisiones por éxito o por pagos). *Mitigación:* el ingreso principal viene del abono. Las comisiones van donde la plataforma es el canal natural (día de lanzamiento, cuotas).
- **Regulatorio:** cripto, tokenización y promesas de rendimiento. *Mitigación:* lenguaje "a pedido", socios licenciados y el frente PSAV.
- **Dependencia del socio:** un único socio en Paraguay. *Mitigación:* exclusividad atada a objetivos, y nuestra marca es dueña de la relación con el cliente.
- **Madurez del producto:** gran parte de la demo está simulada (status §2). *Mitigación:* priorizar las funciones de la etapa 1 (§4.1–4.6) por sobre el stack de tokenización.

---

## 12. Próximos pasos (oct–dic 2026)

1. Escribir la landing page (español, B2B) siguiendo §9, con un formulario para pedir demo.
2. Construir el flujo demo del día de lanzamiento (acceso con depósito, cuenta regresiva, reserva por orden de llegada) y las cuotas de pozo.
3. Adaptar el portal del inversor a compras de unidades completas (cronograma de pagos, documentos, novedades de obra).
4. Tener conversaciones de descubrimiento de precios con 3–5 desarrolladoras a través del socio (D3, D4).
5. Acordar términos con el socio de Paraguay (D1) y bosquejar la estructura societaria (D2).
6. Armar una lista corta de socios de 3D y marketing, y de un procesador de pagos cripto (D6, D10).
7. Mantener en marcha en paralelo el frente legal de tokenización y PSAV (D8), sin bloquear la etapa 1.
