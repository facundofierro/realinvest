# Investigación: Tokenización Inmobiliaria y Venta en Pozo en Paraguay

## 1. Resumen Ejecutivo y Contexto
La **tokenización inmobiliaria** consiste en la representación digital de derechos de propiedad, participación económica o instrumentos de deuda vinculados a un activo inmobiliario (Real World Assets - RWA) mediante tecnología de registro distribuido (*blockchain* / DLT).

En Paraguay, la **"Venta en Pozo"** (inversión pre-construcción u obra en desarrollo) es uno de los motores principales de la industria inmobiliaria y urbana (especialmente en Asunción y áreas metropolitana/Gran Asunción). La integración de la tokenización a la venta en pozo ofrece los siguientes beneficios clave:
* **Democratización del Capital:** Permite a pequeños y medianos inversores adquirir microfracciones (tokens) de unidades residenciales o corporativas desde montos significativos más bajos que en la compra tradicional.
* **Financiamiento Temprano:** Brinda a desarrolladores e inmobiliarias una fuente alternativa y ágil de liquidez durante las etapas iniciales de la obra (pozo).
* **Trazabilidad y Eficiencia:** El registro en *smart contracts* otorga transparencia en los flujos de pagos, derechos futuros sobre unidades o repartos de dividendos y plusvalía.

---

## 2. Marco Legal y Normativo en Paraguay

El entorno legal paraguayo ha experimentado importantes actualizaciones recientes que otorgan seguridad jurídica a la emisión y gestión de activos digitales respaldados por bienes reales:

### 2.1. Ley N° 7572/2025 "De Mercado de Valores y Productos"
* **Reconocimiento Legal de DLT/Blockchain:** Promulgada para modernizar el mercado de capitales, esta ley reconoce explícitamente el uso de Tecnologías de Registro Distribuido (DLT) para la emisión, custodia, registro y negociación de instrumentos financieros tokenizados.
* **Valores Tokenizados (Security Tokens):** Establece la diferencia legal entre criptomonedas especulativas o no respaldadas y **tokens que representan derechos económicos, de crédito o participación** en activos reales. Estos últimos están bajo el régimen de mercado de valores.

### 2.2. Superintendencia de Valores (SIV) – Banco Central del Paraguay (BCP)
* **Ente Regulador:** Anteriormente conocida como Comisión Nacional de Valores (CNV), la entidad fue integrada al BCP bajo la Ley N° 7160/2023 como la **Superintendencia de Valores (SIV)**.
* **Neutralidad Tecnológica y Regulación Operativa:** La SIV aplica el principio de *"misma actividad, mismo riesgo, mismo resultado regulatorio"*. La reglamentación operativa específica norma la custodia digital de valores, ciberseguridad, y transparencia en la oferta pública de tokens financieros.

### 2.3. Ley N° 921/96 "De Negocios Fiduciarios" (El Fideicomiso Inmobiliario)
* **Patrimonio Autónomo e Inembargable:** Es la estructura jurídica fundamental utilizada para respaldar la tokenización en pozo. Mediante el Fideicomiso Inmobiliario, el terreno y los fondos de la obra se transfieren a un **patrimonio separado**, blindado frente a posibles quiebras o deudas del desarrollador.
* **Representación Fiduciaria del Token:** Los tokens emitidos representan **derechos fiduciarios o de beneficiario** (*derechos económicos o de adjudicación futura de unidades*) sobre la masa fiduciaria administrada por una entidad supervisada por el BCP.

### 2.4. Código Civil Paraguayo
* **Venta de Cosa Futura (Art. 695 y ss.):** Regula la naturaleza jurídica de la compra en pozo cuando no media un fideicomiso, clasificándose como una compraventa supeditada a la existencia y finalización del bien futuro.

### 2.5. Prevención de Lavado de Dinero (SEPRELAD)
* **Resolución SEPRELAD N° 314/2021 & Ley N° 1015/1997:** Establece el marco para Proveedores de Servicios de Activos Virtuales (PSAV). Las plataformas de tokenización deben implementar protocolos estrictos de debida diligencia, KYC (*Know Your Customer*) y reporte de operaciones sospechosas (ROS).

### 2.6. Trazabilidad Fiscal (DNIT)
* **Resolución General DNIT N° 47/2026:** Obliga a los actores financieros y digitales a reportar transacciones y transferencias con criptoactivos y tokens que superen ciertos umbrales para garantizar la transparencia tributaria y el pago impositivo (IVA / IRE / IDU según corresponda).

---

## 3. Requisitos para la Regulación y Estructuración de Proyectos

Para llevar a cabo un proyecto legalmente sólido de tokenización de venta en pozo en Paraguay, se deben cumplir los siguientes requisitos:

| Dimensión | Requisito / Procedimiento |
| :--- | :--- |
| **Estructuración Jurídica** | Constituir un **Fideicomiso Inmobiliario al Costo / de Administración** regido por la Ley 921/96 con una entidad fiduciaria autorizada por el BCP (Banco, Financiera o Sociedad Fiduciaria). |
| **Vinculación Token-Activo** | Elaboración de un **Contrato de Adhesión / Cesión de Derechos Fiduciarios** que vincule inequívocamente cada Token (o conjunto de tokens) con los derechos del beneficiario sobre el fideicomiso o unidad en pozo. |
| **Clasificación del Token** | • **Privado (Oferta Privada):** Venta directa por cesión de derechos con validez contractual civil.<br>• **Público (Security Token):** Si se ofrece masivamente como instrumento de inversión pública, requiere inscripción y aprobación del prospecto de emisión ante la Superintendencia de Valores (SIV). |
| **Cumplimiento AML/KYC** | Implementar verificación de identidad de los inversores (KYC), origen de fondos (AML) y registro/reporte conforme normativas SEPRELAD. |
| **Auditoría Técnica y Seguridad** | Auditoría técnica e independiente de los *Smart Contracts* (contratos inteligentes ERC-20 / ERC-3643 / ERC-1155) para evitar vulnerabilidades informáticas. |
| **Custodia y Registro** | Protocolo de custodia digital segura de las claves privadas/tokens y registro en la Caja de Valores de Paraguay (Cavapy) u homologación fiduciaria. |

---

## 4. Ejemplos Reales y Empresas Operando en Paraguay

Aunque el ecosistema de tokenización está en fase de expansión, existen iniciativas relevantes y plataformas en Paraguay:

### 4.1. Valle de Innovación de Asunción (*Innovation Valley*)
* **Descripción:** Proyecto de desarrollo inmobiliario y distrito de innovación urbana en Asunción.
* **Implementación Blockchain:** En colaboración con *Paradata* y *Better Use Blockchain*, tokenizaron capital y terrenos sobre la red **Polkadot**.
* **Modelo de Pozo/Desarrollo:** Los tokens están vinculados al valor del suelo y a los ingresos proyectados de futuros desarrollos (oficinas, hoteles y centros de datos), distribuyendo dividendos proporcionales a los tenedores.

### 4.2. Metlabs (*metlabs.io*)
* **Perfil:** Empresa paraguaya especializada en desarrollo tecnológico y consultoría en *software blockchain*.
* **Solución RWA:** Ofrece desarrollo a medida de plataformas de tokenización inmobiliaria en Paraguay, combinando arquitectura de contratos inteligentes con estructuras de cumplimiento regulatorio local (SIV / SEPRELAD).

### 4.3. Raíz Finance (*raiz.finance*)
* **Perfil:** Plataforma regional de tokenización inmobiliaria que ha expandido sus operaciones para incluir proyectos de inversión en el mercado paraguayo, permitiendo el ingreso fraccionado a desarrollos de bienes raíces desde montos bajos.

### 4.4. Ecosistema Proptech y Alianzas Regionales
* **Paraguay Blockchain Summit & Assets Forum:** Eventos de referencia en Asunción donde desarrolladores locales (ej. vinculados a la Cámara Paraguaya de Fintech) articulan soluciones junto a firmas regionales de tokenización (como *Pala Blockchain* de Argentina) para financiar proyectos en pozo en Paraguay.

---

## 5. Análisis Comparativo: Fideicomiso Tradicional vs. Pozo Tokenizado

| Característica | Venta en Pozo Tradicional | Venta en Pozo Tokenizada |
| :--- | :--- | :--- |
| **Monto Mínimo de Inversión** | Alto (se requiere comprar un departamento o cochera completa). | Muy Bajo (fraccionamiento en tokens desde USD 100 - USD 1,000). |
| **Liquidez** | Baja (dificultad para vender la cuota parte antes del fin de obra). | Alta (posibilidad de intercambiar tokens en mercados secundarios autorizados). |
| **Costos Transaccionales** | Notariales y escrituración por cada cesión individual. | Automatizados por *Smart Contracts* bajo el contrato marco del fideicomiso. |
| **Transparencia y Seguimiento** | Informes periódicos por e-mail / reuniones con la desarrolladora. | Trazabilidad en tiempo real sobre blockchain e hitos de obra verificables. |

---

## 6. Conclusiones y Recomendaciones

1. **Paraguay cuenta con un marco legal propicio y en modernización:** La combinación de la **Ley N° 7572/2025 (Mercado de Valores)** y la **Ley N° 921/96 (Fideicomisos)** permite estructurar la tokenización de venta en pozo con total solidez jurídica.
2. **El Fideicomiso es imprescindible:** No se recomienda emitir tokens directamente contra contratos de promesa de compraventa privados simples; la figura del Fideicomiso Inmobiliario con un fiduciario regulado por el BCP es lo que otorga la inembargabilidad y el respaldo real.
3. **Perspectiva de Crecimiento:** Con el continuo auge del desarrollo inmobiliario en Asunción y la estabilidad económica del país, la tokenización representa una de las mayores oportunidades para canalizar capitales de pequeños inversores locales e internacionales hacia el sector inmobiliario en pozo.
