# Investigación Técnica: Arquitectura de Tokenización y Wallets para Venta en Pozo (Paraguay)

> Este documento complementa a [`paraguay.md`](./paraguay.md) (marco legal y normativo) y se enfoca exclusivamente en el **stack técnico y de proveedores** necesario para construir el módulo de tokenización + mercado secundario sobre la app de venta en pozo existente, bajo la restricción central del proyecto: **no operar infraestructura de custodia propia**, delegando la parte custodial crítica a un proveedor externo tipo *Wallet-as-a-Service* (WaaS) white-label, mientras el equipo desarrolla los smart contracts, la lógica de negocio y, opcionalmente, una wallet self-custody embebida.

---

## 1. Resumen Ejecutivo

* El problema central planteado no es "TON vs. otra blockchain" en abstracto, sino **qué tan bien resuelve cada ecosistema la custodia de tokens nuevos y arbitrarios** (un token por propiedad), no solo de las criptomonedas populares. Ahí las cadenas **EVM** (Polygon, Base, otros L2s) tienen una ventaja estructural: el estándar ERC-20 es genérico, así que casi cualquier proveedor de WaaS institucional soporta *cualquier* token ERC-20 nuevo con fricción casi nula (ver §2 y §3).
* **TON** es atractivo por distribución (Telegram) y bajo costo, pero su ecosistema de custodia institucional/WaaS para *Jettons* (el estándar de token de TON) es inmaduro: casi todos los proveedores "custodiales" de TON son wallets de consumo (Tonkeeper, xRocket) pensadas para usuarios finales dentro de Telegram, no infraestructura white-label para que una fintech emita y custodie tokens propios de terceros. Adoptar TON hoy probablemente implica construir la capa de custodia (aunque sea self-custody) prácticamente desde cero.
* **Hedera** merece consideración seria: su *Hedera Token Service* (HTS) tiene KYC y freeze *nativos a nivel de protocolo* (no de smart contract), lo que reduce superficie de auditoría y encaja muy bien con el requisito de SEPRELAD/SIV de habilitar solo a inversores verificados. Fireblocks ya soporta Hedera y ofrece *Asset Tokenization Studio*, con integraciones de custodia/compliance de terceros.
* Ningún proveedor de WaaS "gratuito por comisión" revisado (los que cobran solo sobre volumen de trading/transferencia) confirma en su documentación pública soporte robusto para tokens *nuevos y arbitrarios por proyecto* — ese modelo de negocio está optimizado para un catálogo curado de criptoactivos líquidos. Los proveedores que sí confirman soporte genérico para tokens custom (Fireblocks, Dfns, Turnkey, Privy, Crossmint, thirdweb) cobran por **suscripción + uso** (wallets activas, firmas, throughput), no por comisión de trading — lo cual de hecho es más previsible para un producto B2B como este.
* **Recomendación de fondo (detalle en §7):** migrar el eje de la decisión de "qué blockchain" a "qué estándar de token + qué proveedor de custodia/compliance", y usar una **arquitectura híbrida**: wallets self-custody embebidas (no gestionamos llaves) para los tokens inmobiliarios ilíquidos y bespoke, + un proveedor custodial/WaaS de terceros solo para la pata de stablecoin (on/off-ramp fiat↔USDT/USDC) que sí es un activo estándar bien soportado por cualquier WaaS.

---

## 2. Elección de Blockchain: Comparativa

| Criterio | **TON** | **EVM L2 (Polygon / Base / Arbitrum)** | **Hedera** | **Stellar (Soroban)** | **Algorand** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Estándar de token por propiedad** | Jetton (contrato TEP-74) | ERC-20 / ERC-3643 (T-REX) / ERC-1155 | Hedera Token Service (HTS) — token *nativo*, no smart contract | Soroban asset contracts (nuevo, aún madurando) | ASA (Algorand Standard Asset) — nativo |
| **Costo de emitir un token nuevo** | Bajo (deploy de contrato Jetton) | Bajo en L2s (gas fees centavos) | Muy bajo, tarifa fija de creación de token (~1 USD) | Bajo | Muy bajo |
| **Compliance nativo (KYC/freeze) a nivel protocolo** | No — hay que programarlo en el contrato Jetton | No — hay que usar un estándar como ERC-3643 que añade identity registry on-chain | **Sí** — KYC key y freeze key son flags nativos del token, sin contrato adicional | Parcial — se está desarrollando tooling de compliance sobre Soroban (ej. Stellar Asset Tokenization Suite, proyectos open source todavía jóvenes) | Parcial — clawback/freeze nativos en ASA, pero menos tooling de identity registry que ERC-3643 |
| **Madurez de tooling RWA/security-token** | Baja — pocos frameworks RWA dedicados a TON | **Alta** — ERC-3643 es el estándar de facto (~28.000 M USD tokenizados, 90+ miembros en la asociación incluyendo DTCC), con implementación de referencia open source (Tokeny/ERC3643.org) | Media-alta — Hedera promociona activamente HTS para RWA y tiene Asset Tokenization Studio | Media — proyectos existen (StellarForge, Stellar Asset Tokenization Suite) pero son más nuevos/menos probados en producción institucional | Media — validado en producción por Lofty (ver §4), pero sin estándar de compliance tan formalizado como ERC-3643 |
| **Ecosistema de WaaS/custodia institucional que soporte tokens *custom*** | **Débil** — casi ningún WaaS institucional revisado confirma soporte genérico de Jettons arbitrarios; la oferta se concentra en wallets de consumo dentro de Telegram (Tonkeeper, xRocket) | **Fuerte** — Fireblocks, Dfns, Turnkey, Privy, Crossmint, thirdweb soportan agregar cualquier ERC-20 casi instantáneamente (Fireblocks: ~30 segundos vía self-service) | Media — Fireblocks confirma soporte a Hedera; menor variedad de proveedores que EVM | Media — Fireblocks también soporta Stellar | Media — soporte de Fireblocks y otros, pero menos providers "custom token friendly" documentados que EVM |
| **Distribución / UX de adquisición** | Muy fuerte en mercados con alto uso de Telegram (onboarding dentro del chat, sin fricción de instalar wallet) | Estándar (requiere wallet o wallet embebida vía login social) | Estándar | Estándar | Estándar |

**Conclusión de esta sección:** para el caso de uso específico (muchos tokens nuevos, custodia delegada, cumplimiento SIV/SEPRELAD), la ventaja de TON en distribución no compensa la debilidad de su ecosistema de custodia institucional para tokens arbitrarios. La opción técnicamente más segura es una **cadena EVM (L2) con ERC-3643**, con **Hedera** como alternativa fuerte #2 por su compliance nativo a nivel de protocolo. TON queda como opción secundaria/futura si la distribución vía Telegram se vuelve una prioridad estratégica de negocio, no como base del producto v1.

---

## 3. Proveedores de Wallet-as-a-Service / Custodia White-Label

Evaluados específicamente en si soportan **tokens nuevos y arbitrarios definidos por el proyecto** (no solo una lista curada de criptomonedas populares).

| Proveedor | Modelo de custodia | Soporte de tokens custom/arbitrarios | Modelo de precio | Confirmado / Sin confirmar |
| :--- | :--- | :--- | :--- | :--- |
| **Fireblocks** | Custodial/MPC, infraestructura como SaaS; permite wallets white-label | **Confirmado** — función de self-service para añadir cualquier ERC-20 en ~30 segundos pegando la dirección del contrato; soporta Hedera y Stellar también | Enterprise, no público (histórico: setup fee + suscripción) | ✅ Confirmado en blog/docs oficiales |
| **Dfns** | Tecnología pura — el cliente retiene control, Dfns nunca toca los activos (SaaS, híbrido o on-prem) | **Confirmado** — 100+ redes soportadas (incluye EVMs, Stellar, Solana), con emisión/gestión de activos tokenizados (fondos, bonos, equities) | Suscripción + uso por wallet (no toma comisión sobre custodia ni volumen) | ✅ Confirmado |
| **Turnkey** | Infraestructura de firma en TEEs; las llaves nunca son expuestas ni siquiera a Turnkey | Orientado a wallets embebidas EVM/Solana genéricas — no aparece limitación de token, pero no confirma explícitamente soporte de tokens RWA/ERC-3643 | Free tier (100 wallets) → Pay-as-you-go $0.10/firma → Pro $99/mes ($0.01/firma) → Enterprise ($0.0015/firma) | ⚠️ Soporte de tokens custom no confirmado explícitamente, infraestructura genérica lo sugiere |
| **Privy** | Embedded wallets no-custodiales (enclaves seguros + key splitting) | Soporta EVM, Solana, Bitcoin; referencia a estándares RWA (RWAERC20) en el ecosistema pero no confirmación directa propia | No público (>120M cuentas, SLA 4 nueves) | ⚠️ Soporte de tokens custom no confirmado explícitamente |
| **thirdweb (In-App Wallets)** | No-custodial (enclave/MPC) | **Confirmado** — contratos pre-armados para ERC-20/721/1155, branding blanco total | Freemium + planes de uso | ✅ Confirmado |
| **Crossmint** | Custodial, no-custodial **o híbrido**, cambiable en cualquier momento | **Confirmado** — "Minting API" para tokenizar a escala + wallets + KYC + fiat on/off-ramp + compliance en una sola integración | Enterprise, SLA 99.99% | ✅ Confirmado — el más "todo en uno" para este caso de uso |
| **BitGo** | Custodial, trust bank (OCC-chartered) | No confirmado explícitamente para tokens arbitrarios; fuerte en stablecoin issuance y activos líquidos | Enterprise | ⚠️ Sin confirmar para tokens RWA custom |
| **Copper** | Custodial (VASP license VARA, FCA UK), ClearLoop para settlement off-exchange | Orientado a trading institucional multi-exchange, no a emisión de tokens propios de terceros | Enterprise | ⚠️ Probablemente no es el fit correcto para este caso |
| **Anchorage Digital** | Custodial, único banco de activos digitales con charter federal OCC en EE.UU. | Fuerte para "qualified custodian" regulatorio en EE.UU.; sin confirmación de soporte de tokens RWA custom por proyecto | Enterprise | ⚠️ Sin confirmar; relevante solo si se necesita presencia regulatoria en EE.UU. |
| **Coinbase Prime / Custody** | Custodial (NYDFS trust) | Lanzó (dic. 2025) un servicio de "stablecoin-as-a-service" para tokens propios respaldados por USDC — señal de que sí pueden emitir/custodiar tokens custom, pero enfocado a stablecoins, no a activos inmobiliarios fraccionados | Enterprise | ⚠️ Confirmado solo para stablecoins propios, no para tokens RWA en general |
| **Zerohash** | Custodial, infraestructura para brokers/fintechs (on/off-ramp, trading) | Enfocado en activos líquidos estándar; sin evidencia de soporte a tokens nuevos por proyecto | Enterprise | ⚠️ Sin confirmar — probablemente no aplica |
| **Magic.link** | No-custodial vía TEE (aunque las llaves están en infraestructura de Magic, ej. AWS) | Genérico EVM; sin confirmación específica de tokens RWA custom | No público | ⚠️ Sin confirmar |
| **Particle Network** | No-custodial (MPC-TSS) + Universal Accounts (chain abstraction) | Genérico multi-chain; sin confirmación específica de tokens RWA custom | No público | ⚠️ Sin confirmar |
| **TON: Tonkeeper Business / TonAPI / TonX / Whales API** | Mayormente **no-custodial** (lectura/indexación de Jettons, no custodia de llaves de terceros) | Soporta leer/mostrar cualquier Jetton (indexación abierta), pero no se encontró un proveedor **custodial** white-label serio para Jettons arbitrarios de nivel enterprise | Variable, mayormente APIs de infraestructura, no custodia | ❌ No se encontró oferta custodial white-label madura en TON para este caso de uso |
| **xRocket / Tobi (TON, Telegram)** | Custodial, orientado a consumidor dentro de Telegram (wallet + mini-exchange) | Soporta trading de Jettons ya listados en su exchange interno, no está pensado como backend white-label para que un tercero emita y custodie tokens propios | Comisión sobre trading | ❌ No es una opción B2B/white-label para este caso |

**Lectura clave:** el problema que el fundador anticipó — "las WaaS gratuitas por comisión están armadas para el top de criptomonedas, no para tokens nuevos por proyecto" — se confirma parcialmente: los proveedores con modelo *comisión sobre trading* (Copper, Zerohash, xRocket) efectivamente están orientados a activos líquidos ya listados. Pero existe un grupo de proveedores con modelo **suscripción + uso** (Dfns, Fireblocks, Crossmint, thirdweb) que sí confirman soporte genérico para tokens arbitrarios — ese es el segmento correcto a evaluar, no el de "wallet gratis por comisión".

---

## 4. Alternativa de Self-Custody / Arquitectura Híbrida

### 4.1. Self-custody en TON (TON Connect)

* **TON Connect** es un protocolo de comunicación cifrada entre dApp y wallet — la app nunca toca las llaves privadas del usuario. Pero **TON Connect no provee SDK del lado de la wallet**: solo conecta la dApp con wallets ya existentes (Tonkeeper, MyTonWallet, etc.). Si se quiere una wallet self-custody **embebida dentro de la propia app** (sin depender de que el usuario instale Tonkeeper), hay que construir esa capa a mano con SDKs de bajo nivel de TON (`ton-core`, `tonweb`) — generación de llaves, derivación, backup/recovery — un desarrollo no trivial y con la responsabilidad completa de la seguridad de las llaves en el propio equipo.
* Esto es relevante porque contradice parcialmente la premisa de "TON facilita self-custody": TON Connect facilita **conectar** con wallets de terceros, no **generar** una wallet embebida propia con buena UX para usuarios no cripto-nativos.

### 4.2. Self-custody en EVM (embedded wallets)

* Proveedores como **Privy**, **Turnkey**, **thirdweb** y **Magic.link** resuelven exactamente el problema de UX que preocupa para inversores inmobiliarios no cripto-nativos: login por email/redes sociales/passkeys, generación de wallet automática, y custodia de llaves vía **enclaves seguros o MPC** donde el proveedor (según ellos) nunca tiene acceso a la llave completa.
* Esto técnicamente **no es una wallet custodial tradicional** (el proveedor no puede mover fondos unilateralmente), pero tampoco es 100% "el usuario tiene su seed phrase" — es un punto intermedio que conviene validar legalmente contra la definición de **Proveedor de Servicios de Activos Virtuales (PSAV)** de SEPRELAD (Resolución 314/2021, ver `paraguay.md` §2.5): si el modelo MPC/TEE implica que un tercero *puede* asistir en la recuperación de acceso, un regulador podría considerarlo funcionalmente custodial. **Esto queda como punto abierto para validar con asesoría legal local** (ver §8).

### 4.3. Patrón híbrido observado en plataformas RWA existentes

| Plataforma | Blockchain | Patrón de custodia observado |
| :--- | :--- | :--- |
| **Lofty AI** | Algorand | Crea automáticamente una **wallet custodial** por inversor nuevo (sin fricción de onboarding), pero permite exportar a self-custody (Pera Wallet, Defly) en cualquier momento — costo de una sola transacción. Estructura legal: **LLC por propiedad**, el token representa participación en esa LLC. |
| **RealT** (histórico) | Gnosis Chain (ex-xDai) | Modelo similar de LLC por propiedad; salió del mercado de EE.UU. en 2023 y fue liquidada — señal de riesgo regulatorio a monitorear, no solo técnico. |
| **Securitize** | Multi-chain (incluye Ethereum/Polygon) | **Compra** en vez de construir: opera como *broker-dealer y transfer agent registrado* (en EE.UU.) y delega custodia a **Fireblocks** y **Taurus**. Administra el ciclo regulatorio completo (KYC, transfer restrictions, cap table) para emisores. Powered tokenización de fondos de BlackRock. |
| **Brickken** | Multi-chain | Plataforma end-to-end con compliance integrado (KYC/KYB), certificada ISO 27001 + DORA; también delega la infraestructura de custodia/blockchain de bajo nivel a terceros en vez de operar su propia capa de custodia. |
| **Tokeny (creador de ERC-3643)** | Ethereum / EVM | Provee el software de emisión y compliance (identity registry, T-REX); se integra con **Fireblocks** para la capa de custodia — separación clara entre "capa de emisión/compliance" (se construye o se compra a Tokeny) y "capa de custodia" (se compra a un WaaS). |

**Patrón consistente:** ninguna de las plataformas RWA serias revisadas construye su propia infraestructura de custodia desde cero. Todas compran la pata de custodia (Fireblocks, Taurus, u otros) y construyen/compran por separado la capa de compliance y emisión (identity registry, KYC gating, cap table). Esto valida la estrategia planteada por el fundador.

### 4.4. Recomendación de arquitectura híbrida para este proyecto

* **Tokens de propiedad (Jettons/ERC-20/ERC-3643/HTS por proyecto inmobiliario):** wallet **self-custody embebida** (Privy, Turnkey o thirdweb) — activo bespoke, de bajo volumen de trading, donde el riesgo de operar custodia propia de terceros es menor porque el usuario técnicamente retiene el control de la llave.
* **Pata de stablecoin (USDT/USDC usada para pagar/cobrar tokens, y para el mercado secundario):** proveedor **custodial/WaaS de terceros** (Crossmint, o directamente un partner de pagos/PSP local con licencia) — activo estándar, alta liquidez, exactamente el tipo de activo que los WaaS "gratuitos por comisión" sí soportan bien.
* Esto separa el problema en dos partes con soluciones ya maduras en el mercado, en vez de buscar un único proveedor que resuelva ambas — que es precisamente donde la búsqueda original ("un WaaS que soporte tokens nuevos Y sea gratis por comisión") se vuelve difícil.

---

## 5. Integración de Cumplimiento (KYC / AML / Reporting)

Paraguay exige KYC/AML vía SEPRELAD (Resolución 314/2021) y reporte de umbrales vía DNIT (Resolución 47/2026) — ver `paraguay.md` §2.5-2.6. Esto condiciona qué proveedores de WaaS son viables: **deben permitir un KYC/AML "propio" o "pluggable"**, no depender exclusivamente del KYC cerrado del proveedor (que probablemente no cubre requisitos paraguayos específicos).

* **Sumsub**: solución de referencia para Travel Rule + KYC + AML unificados. Conecta a 2.100+ VASPs, soporta 8.000+ activos virtuales para wallet scoring, resuelve checks de Travel Rule en <5 segundos vía protocolos compartidos (TRP), y activa un flujo de **EDD (Enhanced Due Diligence)** cuando una wallet no tiene VASP asociado (relevante para wallets self-custody de inversores). Alternativas equivalentes: Persona, Veriff, Fractal ID — no investigadas en la misma profundidad en esta pasada.
* **Patrón de integración recomendado:** Sumsub (u otro KYC) genera la decisión de elegibilidad del inversor → esa decisión se escribe on-chain como:
  * En **ERC-3643**: un *claim* firmado en el **ONCHAINID** del inversor, verificado contra el *identity registry* y *trusted-issuers registry* del token en cada transferencia.
  * En **Hedera HTS**: el emisor activa la **KYC key** de la cuenta del inversor para ese token específico — el propio protocolo bloquea transferencias hacia cuentas no habilitadas.
  * En **TON/Jetton**: no hay mecanismo nativo — habría que programar una whitelist propia dentro del contrato Jetton (mayor superficie de auditoría/riesgo).
* Herramientas de monitoreo de transacciones/Travel Rule (Chainalysis, TRM Labs, Notabene) son relevantes principalmente para la pata de stablecoin de alto volumen; para los tokens de propiedad (baja frecuencia, contrapartes ya KYC'ed por el propio identity registry) el riesgo es menor pero DNIT igual exige reporte de umbrales — conviene que el mismo proveedor de custodia de stablecoins ofrezca reporting/export compatible con los formatos que DNIT exige (a validar con contador/legal local).

---

## 6. Mecánica del Mercado Secundario

* **AMMs (pools de liquidez tipo Uniswap) no son el patrón recomendado** para tokens de propiedad individuales: son activos de nicho con pocos holders, todos ya KYC'ed (el mismo universo pequeño termina proveyendo liquidez a sí mismo), y un AMM estándar no verifica elegibilidad del comprador en cada swap — rompe el modelo de cumplimiento de ERC-3643/HTS. La SEC en EE.UU. recién está explorando una "exención de innovación" para AMMs permisionados (2026), lo que confirma que sigue siendo terreno regulatorio no resuelto incluso en mercados más desarrollados.
* **Order book permisionado o matching OTC** es el patrón usado por plataformas como Securitize: solo participantes ya verificados por el identity registry pueden colocar/tomar órdenes; el smart contract rechaza cualquier transferencia hacia una wallet no habilitada, independientemente del mecanismo de matching usado por encima.
* **Implementación concreta recomendada:** un order book **off-chain** (base de datos propia, dentro de la app existente) para el matching de órdenes (más rápido, más barato, más fácil de intervenir ante disputas), que dispara **transferencias on-chain** solo al momento del *settlement* — y esas transferencias quedan bloqueadas automáticamente por el identity registry (ERC-3643) o KYC key (Hedera) si alguna de las partes no está habilitada. Este es el patrón estándar en la industria de security tokens (a veces llamado "hybrid/off-chain matching, on-chain settlement").

---

## 7. Arquitectura Técnica Recomendada

### Opción A (recomendada): EVM L2 + ERC-3643 + wallets embebidas + custodia de stablecoin delegada

```
                        ┌─────────────────────────────┐
                        │   App "Venta en Pozo"        │
                        │   (existente, se extiende)   │
                        └───────────────┬───────────────┘
                                        │
                ┌───────────────────────┼───────────────────────┐
                │                       │                       │
   ┌────────────▼───────────┐ ┌─────────▼─────────┐ ┌───────────▼───────────┐
   │ Módulo de Emisión       │ │ Módulo KYC/AML     │ │ Módulo de Mercado      │
   │ (smart contracts propios│ │ (Sumsub o similar) │ │ Secundario (order book │
   │ ERC-3643 / T-REX,       │ │ → escribe claims   │ │ off-chain + settlement │
   │ 1 token por propiedad)  │ │ en ONCHAINID        │ │ on-chain)              │
   └────────────┬───────────┘ └─────────┬─────────┘ └───────────┬───────────┘
                │                       │                       │
                └───────────┬───────────┴───────────┬───────────┘
                            │                       │
              ┌─────────────▼───────────┐ ┌──────────▼─────────────┐
              │ Wallet embebida          │ │ Custodia stablecoin     │
              │ SELF-CUSTODY             │ │ CUSTODIAL (WaaS 3ro)    │
              │ (Privy / Turnkey /       │ │ (Crossmint u otro,      │
              │  thirdweb) — tokens de   │ │  USDT/USDC on/off-ramp) │
              │  propiedad por usuario   │ │                         │
              └─────────────┬───────────┘ └──────────┬─────────────┘
                            │                       │
                            └───────────┬───────────┘
                                        │
                          ┌─────────────▼─────────────┐
                          │  Blockchain: Polygon/Base   │
                          │  (EVM L2)                   │
                          └─────────────────────────────┘
```

* **Blockchain:** Polygon PoS o Base (L2 de Ethereum) — fees bajos, EVM estándar, máxima compatibilidad con herramientas ERC-3643 y WaaS.
* **Estándar de token:** ERC-3643 (T-REX), usando la implementación de referencia open source de la ERC-3643 Association/Tokeny como base, adaptada a los requisitos de SIV/SEPRELAD (identity registry con claims propios).
* **Wallet de tokens de propiedad:** embebida self-custody (Turnkey o Privy — evaluar ambos con una prueba de concepto; Turnkey tiene pricing más transparente y público).
* **Custodia de stablecoin / on-off-ramp fiat:** Crossmint (por ser el más "todo en uno": wallets + KYC + fiat ramps + minting en una sola integración) — **a validar con una llamada comercial si su servicio de custodia/fiat ramp opera en Paraguay** (riesgo abierto, ver §8).
* **KYC/AML/Travel Rule:** Sumsub, alimentando el identity registry de ERC-3643.
* **Mercado secundario:** order book off-chain construido dentro de la app existente + settlement on-chain vía los mismos smart contracts ERC-3643.

### Opción B (alternativa): Hedera + HTS nativo + Fireblocks

* Mismo patrón de capas, pero reemplazando blockchain/estándar por **Hedera + Hedera Token Service** (KYC/freeze nativos al protocolo, menor superficie de smart contract a auditar) y usando **Fireblocks** como proveedor único para custodia de stablecoin (Fireblocks confirma soporte a Hedera y tiene *Asset Tokenization Studio* con integraciones de compliance de terceros).
* Ventaja: menos código de compliance propio (los flags KYC/freeze ya existen a nivel de protocolo). Desventaja: ecosistema de proveedores/desarrolladores más chico que EVM, y Fireblocks es un proveedor enterprise — probablemente con costos de entrada más altos que Turnkey/Privy/Crossmint para una etapa temprana del producto.

### Sobre TON

* No se recomienda como base del producto v1 por la debilidad confirmada del ecosistema de custodia institucional para Jettons arbitrarios (§2-§3). Si en el futuro la distribución vía Telegram se vuelve estratégicamente importante en Paraguay, se puede evaluar un puente/wrapping de los tokens ERC-3643 hacia TON, o una emisión paralela, sin migrar toda la arquitectura.

---

## 8. Riesgos Abiertos y Próximos Pasos

1. **Ningún proveedor de WaaS revisado confirma operación en Paraguay ni conocimiento explícito del marco SIV/SEPRELAD.** Antes de comprometerse con Crossmint, Turnkey, Privy o Fireblocks, se necesita una llamada comercial para confirmar: (a) si operan/permiten clientes paraguayos, (b) si su modelo "self-custody" es compatible con la definición de PSAV de SEPRELAD o si dispara obligaciones adicionales.
2. **La calificación legal de wallets MPC/TEE ("self-custody asistida") bajo SEPRELAD no está resuelta en este research** — depende de cómo la Resolución 314/2021 defina el umbral de "control" sobre activos de terceros. Recomendación: consulta puntual con el estudio legal que ya asesora en el marco de `paraguay.md`.
3. **Turnkey y Privy no confirman explícitamente en su documentación pública soporte a tokens ERC-3643/RWA custom** (sí confirman EVM genérico) — validar en PoC técnica antes de comprometer arquitectura.
4. **No se validó en esta pasada si Fireblocks/Dfns/Crossmint cobran fees de setup o mínimos mensuales incompatibles con la etapa actual del producto** — los precios "enterprise" no están publicados; se necesita cotización directa.
5. **RealT (comparable directo en real estate tokenizado) salió del mercado de EE.UU. en 2023 y fue liquidada** — vale investigar en una próxima iteración *por qué* (regulatorio, modelo de negocio, liquidez) antes de replicar su modelo de LLC-por-propiedad.
6. **Próximo paso sugerido:** una prueba de concepto (PoC) chica — emitir un token ERC-3643 de prueba en Polygon testnet, conectarlo a un wallet embebida de Turnkey o Privy en modo sandbox, y correr un flujo KYC de prueba con Sumsub — antes de comprometer la arquitectura final, dado que casi todos los puntos marcados con ⚠️ arriba requieren validación directa con los proveedores.

---

## 9. Fuentes

* [Launch support for any ERC-20 token instantly with Fireblocks](https://www.fireblocks.com/blog/launch-support-for-any-erc-20-token-instantly-with-fireblocks)
* [Fireblocks — Add Tokens (Developer Docs)](https://developers.fireblocks.com/docs/add-your-tokens-1)
* [Fireblocks x Tokeny — Fund Tokenization](https://www.fireblocks.com/blog/enhancing-fund-tokenization-operations-and-management-with-fireblocks-x-tokeny)
* [Dfns — Wallet-as-a-Service](https://dfns.co/wallet-as-a-service)
* [Dfns — Pricing](https://dfns.co/pricing)
* [Turnkey — Embedded Wallets](https://www.turnkey.com/embedded-wallets)
* [Turnkey — White-Label Embedded WaaS Infrastructure](https://www.turnkey.com/embedded-wallets/embedded-waas)
* [Privy — Embedded Wallets](https://www.privy.io/wallets)
* [Privy — Fintech / Stablecoin infra](https://www.privy.io/fintech)
* [Tokenizing Real-World Assets with RWAERC20](https://medium.com/noncept/tokenizing-real-world-assets-with-rwaerc20-773808985f70)
* [thirdweb — In-App Wallets](https://thirdweb.com/in-app-wallets)
* [Crossmint — Wallet Infrastructure](https://www.crossmint.com/products/wallet-infrastructure)
* [Crossmint — Minting API / Tokenization Platform](https://www.crossmint.com/products/minting-api)
* [Crossmint — Signers and Custody Docs](https://docs.crossmint.com/wallets/signers-and-custody)
* [TON Docs — TON Connect Overview](https://docs.ton.org/applications/ton-connect/overview)
* [Tonkeeper — Self-Custody TON Wallet](https://tonkeeper.com/pro)
* [TON API (TonAPI / TonX)](https://tonapi.io/)
* [ERC-3643 (EIP-3643) — T-REX Standard](https://eips.ethereum.org/EIPS/eip-3643)
* [Tokeny — ERC-3643 Official Standard for Permissioned Tokens](https://tokeny.com/erc3643/)
* [ERC-3643 vs ERC-1400 vs ERC-20 — Protofire (2026)](https://protofire.io/guides/rwa-token-standards/)
* [Introduction to ERC-3643 — Chainalysis](https://www.chainalysis.com/blog/introduction-to-erc-3643-ethereum-rwa-token-standard/)
* [Hedera Token Service (HTS) — Hedera docs](https://hedera.com/service/token-service/)
* [Hedera — Disable KYC account flag](https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service/disable-kyc-account-flag)
* [Hedera — Asset Tokenization Studio](https://hedera.com/product/asset-tokenization-studio/)
* [Why is Hedera Good for RWA Tokenization? — Zoniqx](https://www.zoniqx.com/resources/why-is-hedera-good-for-real-world-asset-tokenization)
* [How Algorand helped Lofty transform real estate](https://algorand.co/case-studies/lofty-transform-real-estate-industry)
* [Tokenized Real Estate 2026: RealT, Lofty, Propy Compared](https://eco.com/support/en/articles/15254024-tokenized-real-estate-2026-realt-lofty-propy-compared)
* [Lofty Review 2026 — CrowdfundedWealth](https://www.crowdfundedwealth.com/reviews/lofty-review)
* [Brickken — Securities Tokenization Platform](https://www.brickken.com/securities-tokenization)
* [Asset Tokenization Platform: Build or Buy White Label? — ChainUp](https://chainup.com/blog/real-world-asset-tokenization-platform-build-in-house-or-buy-white-label/)
* [Tokenization Platforms Explained — XBTO](https://www.xbto.com/resources/tokenization-platforms-explained-technology-custody-compliance)
* [Securitize — SEC Written Input on Compliant Security Token Markets](https://www.sec.gov/files/ctf-written-input-carlos-domingo-securitize-100325.pdf)
* [Sumsub — Travel Rule Compliance for Crypto VASPs](https://sumsub.com/travel-rule/)
* [Sumsub — Crypto Travel Rule Made Easy](https://sumsub.com/blog/crypto-travel-rule-made-easy-with-sumsub/)
* [Tokenized RWA Custody 2026: Anchorage, BitGo, Fireblocks — eco.com](https://eco.com/support/en/articles/15254027-tokenized-rwa-custody-2026-anchorage-bitgo-fireblocks-for-institutions)
* [Best Institutional Crypto Custody Providers 2026 — CoinGape](https://coingape.com/best-institutional-custody-solutions-for-tokenized-assets/)
* [Stellar — Tokenize Real-World Assets](https://stellar.org/use-cases/tokenization)
* [Order Book vs AMM — Injective](https://injective.com/blog/decentralized-exchange-designs-order-book-model-vs-automated-market-maker-amm)
* [SEC Innovation Exemption: Tokenized US Stocks on Permissioned AMM DEXs](https://news.futunn.com/en/post/79440213/the-us-sec-introduces-an-innovation-exemption-tokenized-us-stocks)
* [Magic Labs](https://magic.link/) / [Particle Network — Universal Accounts](https://docs.magic.link/home/integrations/api-wallets/particle-network-universal-accounts)
