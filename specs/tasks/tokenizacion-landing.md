# Plan de Mejoras para VEST: Enfoque Comercial y Estética Innovadora

## Resumen Ejecutivo

Este plan integra ideas clave para crear un sitio web que comunique de manera efectiva el valor de VEST a los desarrolladores inmobiliarios, centrándose en la captación de capital masivo y la confianza regulatoria de la CNV, a través de una experiencia visual atractiva y moderna.

## Archivos a Modificar

- **Página Principal**: `/Users/facundofierro/git/real-invest/apps/wallet/src/components/pages/tokenization-page.tsx`
- **Estilos CSS**: Verificar si existe archivo de estilos específicos para esta página
- **Assets**: Imágenes del edificio para parallax ya disponibles en `/Users/facundofierro/git/real-invest/apps/wallet/public/landing/`

## 1. Democratización de Inversiones: El Camino hacia Mayor Capital

### Objetivo

Demostrar que abrir la inversión a todos se traduce directamente en más dinero para el proyecto del desarrollador.

### Cambios Propuestos

#### Titular Principal Revisado

**Actual**: "Financiá tu Proyecto Inmobiliario con Tokenización"
**Nuevo**: "Multiplica las Fuentes de Financiamiento de tus Desarrollos: Capital Inmobiliario al Alcance de Todos"

#### Mensaje Clave

Explicar cómo la suma de pequeñas inversiones de miles de personas mitiga el riesgo de depender de grandes inversores únicos y acelera los plazos de construcción.

#### Implementación en Código

```tsx
// Reemplazar el h1 actual en línea 20-22
<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-[#3B2146]">
  Multiplica las Fuentes de Financiamiento de tus Desarrollos:
  <span className="text-purple-600">Capital Inmobiliario al Alcance de Todos</span>
</h1>

// Agregar sección de estadísticas después del párrafo actual
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
  <div className="text-center">
    <div className="text-3xl font-bold text-purple-600">+10,000</div>
    <div className="text-sm text-muted-foreground">Inversores potenciales</div>
  </div>
  <div className="text-center">
    <div className="text-3xl font-bold text-purple-600">50%</div>
    <div className="text-sm text-muted-foreground">Más rápido que bancos tradicionales</div>
  </div>
  <div className="text-center">
    <div className="text-3xl font-bold text-purple-600">$50M</div>
    <div className="text-sm text-muted-foreground">Capital ya financiado</div>
  </div>
</div>
```

## 2. Respaldo de la CNV: El Imán para los Inversores

### Objetivo

La regulación es la garantía que necesitan los pequeños inversores para participar, lo cual beneficia directamente al desarrollador al llenar sus proyectos más rápido.

### Cambios Propuestos

#### Sello Visible y Explicación Simple

- Integrar el logo de la CNV de forma destacada en el hero section
- Agregar una sección corta y concisa que aclare que la regulación asegura que el token está respaldado legalmente por la propiedad física real (el fideicomiso)

#### Implementación en Código

```tsx
// Agregar después del badge actual en línea 17-19
<div className="flex items-center justify-center gap-2 mb-6">
  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 px-4 py-1">
    Regulado por la CNV
  </Badge>
  <img src="/cnv-logo.png" alt="CNV" className="h-8 w-auto" />
</div>

// Agregar tooltip o modal con explicación
<div className="text-sm text-muted-foreground max-w-2xl mx-auto mt-4">
  <p>
    La Comisión Nacional de Valores garantiza que cada token representa
    participación legal en el fideicomiso del proyecto, brindando seguridad
    jurídica completa a tus inversores.
  </p>
</div>
```

## 3. Experiencia Visual Interactiva con Parallax y Animación

### Objetivo

Crear una experiencia visual inmersiva que muestre el proceso de construcción y financiamiento mediante un efecto parallax.

### Implementación Detallada

#### Sección de Construcción Animada

Agregar entre la sección 2 y 3 una nueva sección con efecto parallax:

```tsx
// Nueva sección a agregar después de "Financing Options Section"
<section className="py-32 bg-gradient-to-b from-white to-slate-100 relative overflow-hidden">
  <div className="container px-4 md:px-6">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      {/* Columna de Texto */}
      <div className="space-y-8">
        <div
          className="construction-step"
          data-step="1"
        >
          <h3 className="text-2xl font-bold text-[#3B2146] mb-4">
            Paso 1: Cimientos Legales
          </h3>
          <p className="text-muted-foreground">
            VEST provee servicios para
            crear un fideicomiso que
            respalda legalmente el
            proyecto, garantizando
            seguridad para todos los
            participantes.
          </p>
        </div>

        <div
          className="construction-step"
          data-step="2"
        >
          <h3 className="text-2xl font-bold text-[#3B2146] mb-4">
            Paso 2: Tokenización
            Flexible
          </h3>
          <p className="text-muted-foreground">
            Servicio de tokenización
            adaptable. Se pueden
            tokenizar departamentos
            específicos o pisos enteros,
            optimizando la estrategia de
            financiamiento.
          </p>
        </div>

        <div
          className="construction-step"
          data-step="3"
        >
          <h3 className="text-2xl font-bold text-[#3B2146] mb-4">
            Paso 3: Preventa por Etapas
          </h3>
          <p className="text-muted-foreground">
            Lanzamientos por etapas. Se
            lanza la primera etapa y se
            avanza con la construcción
            mientras se captura capital.
          </p>
        </div>

        <div
          className="construction-step"
          data-step="4"
        >
          <h3 className="text-2xl font-bold text-[#3B2146] mb-4">
            Paso 4: Proyecto Exitoso
          </h3>
          <p className="text-muted-foreground">
            Proyecto completado y
            financiado. Distribución de
            ganancias y planificación de
            la siguiente etapa de
            crecimiento.
          </p>
        </div>
      </div>

      {/* Columna de Imagen con Parallax */}
      <div className="relative h-[600px] lg:h-[800px]">
        <div className="building-container sticky top-20">
          {/* Imágenes del edificio en diferentes etapas */}
          <img
            src="/landing/building1.png"
            alt="Cimientos"
            className="building-stage absolute inset-0 w-full h-full object-contain"
            data-stage="1"
          />
          <img
            src="/landing/building2.png"
            alt="Estructura baja"
            className="building-stage absolute inset-0 w-full h-full object-contain opacity-0"
            data-stage="2"
          />
          <img
            src="/landing/building3.png"
            alt="Estructura media"
            className="building-stage absolute inset-0 w-full h-full object-contain opacity-0"
            data-stage="3"
          />
          <img
            src="/landing/building4.png"
            alt="Edificio terminado"
            className="building-stage absolute inset-0 w-full h-full object-contain opacity-0"
            data-stage="4"
          />
        </div>
      </div>
    </div>
  </div>
</section>
```

#### JavaScript para el Efecto Parallax

```tsx
// Agregar al archivo de la página o crear un nuevo archivo JavaScript
useEffect(() => {
  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    const constructionSteps =
      document.querySelectorAll(
        ".construction-step"
      );
    const buildingStages =
      document.querySelectorAll(
        ".building-stage"
      );

    // Mostrar/ocultar pasos de construcción basado en scroll
    constructionSteps.forEach(
      (step, index) => {
        const stepTop = step.offsetTop;
        const stepHeight =
          step.offsetHeight;
        const windowHeight =
          window.innerHeight;

        if (
          scrolled >
          stepTop - windowHeight + 100
        ) {
          step.classList.add("active");

          // Actualizar imagen del edificio
          buildingStages.forEach(
            (stage) => {
              stage.classList.add(
                "opacity-0"
              );
              stage.classList.remove(
                "opacity-100"
              );
            }
          );

          const currentStage =
            document.querySelector(
              `[data-stage="${index + 1}"]`
            );
          if (currentStage) {
            currentStage.classList.remove(
              "opacity-0"
            );
            currentStage.classList.add(
              "opacity-100"
            );
          }
        }
      }
    );
  };

  window.addEventListener(
    "scroll",
    handleScroll
  );
  return () =>
    window.removeEventListener(
      "scroll",
      handleScroll
    );
}, []);
```

## 4. Mejoras Adicionales de UI/UX

### Animaciones de Entrada

```css
/* Agregar animaciones CSS */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out
    forwards;
}
```

### Mejoras en los Botones CTAs

```tsx
// Agregar microinteracciones a los botones
<Button
  size="lg"
  className="bg-[#5B1187] hover:bg-[#4a0d6e] group transition-all duration-300 hover:scale-105"
>
  Aplicar como Desarrollador
  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
</Button>
```

## 5. Assets Necesarios

### Imágenes

- `/public/landing/building1.png` - Etapa 1 (cimientos)
- `/public/landing/building2.png` - Etapa 2 (estructura inicial)
- `/public/landing/building3.png` - Etapa 3 (estructura intermedia)
- `/public/landing/building4.png` - Etapa 4 (edificio terminado)
- `/public/cnv-logo.png` - Logo de la Comisión Nacional de Valores (pendiente si no existe)

### Iconos Adicionales

- Icono de construcción para las etapas
- Icono de seguridad regulatoria
- Icono de crecimiento/progreso

## 6. Consideraciones Técnicas

### Performance

- Implementar lazy loading para las imágenes del edificio
- Usar `IntersectionObserver` para optimizar las animaciones de scroll
- Considerar el uso de `react-intersection-observer` para mejorar la performance

### Responsive Design

- Asegurar que el efecto parallax funcione correctamente en dispositivos móviles
- Considerar una versión simplificada del efecto para pantallas pequeñas
- Optimizar las imágenes para diferentes tamaños de pantalla

### Accesibilidad

- Agregar atributos `alt` descriptivos a todas las imágenes
- Asegurar que el contenido sea navegable por teclado
- Implementar `aria-labels` para elementos interactivos

## 7. Métricas de Éxito

### KPIs a Monitorear

- Tiempo promedio en la página
- Tasa de conversión de clicks en CTAs
- Porcentaje de scroll hasta la sección de construcción
- Tasa de rebote
- Tiempo de carga de la página

### Herramientas de Análisis

- Google Analytics 4
- Hotjar para mapas de calor
- Google PageSpeed Insights para performance

## 8. Próximos Pasos

1. **Fase 1**: Implementar cambios de texto y estadísticas (1-2 días)
2. **Fase 2**: Integrar logo CNV y mejorar CTAs (1 día)
3. **Fase 3**: Crear y agregar sección de construcción animada (3-4 días)
4. **Fase 4**: Optimización de performance y responsive (2 días)
5. **Fase 5**: Testing y ajustes finales (1 día)

## Notas de Implementación

- Las imágenes del edificio pueden ser ilustraciones 3D o renders fotorealistas
- Considerar trabajar con un diseñador gráfico para crear las imágenes de las etapas
- El efecto parallax debe ser suave y no afectar la navegación
- Mantener la coherencia con el diseño existente de la plataforma
- Asegurar compatibilidad cross-browser para las animaciones
