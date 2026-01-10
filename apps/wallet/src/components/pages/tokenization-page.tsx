"use client";

import {
  useEffect,
  useState,
  useRef,
} from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Building2,
  Coins,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Handshake,
  FileText,
  BarChart3,
  Users,
  Landmark,
} from "lucide-react";
import Image from "next/image";

const stepsData = [
  {
    step: 1,
    title: "Cimientos Legales",
    description:
      "VEST provee servicios para crear un fideicomiso que respalda legalmente el proyecto, garantizando seguridad para todos los participantes.",
  },
  {
    step: 2,
    title: "Tokenización Flexible",
    description:
      "Servicio de tokenización adaptable. Se pueden tokenizar departamentos específicos o pisos enteros, optimizando la estrategia de financiamiento.",
  },
  {
    step: 3,
    title: "Preventa por Etapas",
    description:
      "Lanzamientos por etapas. Se lanza la primera etapa y se avanza con la construcción mientras se captura capital.",
  },
  {
    step: 4,
    title: "Proyecto Exitoso",
    description:
      "Proyecto completado y financiado. Distribución de ganancias y planificación de la siguiente etapa de crecimiento.",
  },
];

export default function TokenizationPage() {
  const [activeStep, setActiveStep] =
    useState(1);
  const sectionRef =
    useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const { top, height } =
        sectionRef.current.getBoundingClientRect();
      const windowHeight =
        window.innerHeight;

      // Only calculate if the section is in view or we are scrolling through it
      if (
        top <= 0 &&
        -top < height - windowHeight
      ) {
        const scrollDistance = -top;
        const totalScrollableDistance =
          height - windowHeight;
        const progress =
          scrollDistance /
          totalScrollableDistance;
        const step = Math.min(
          Math.max(
            Math.floor(progress * 4) +
              1,
            1
          ),
          4
        );
        setActiveStep(step);
      } else if (top > 0) {
        setActiveStep(1);
      } else if (
        -top >=
        height - windowHeight
      ) {
        setActiveStep(4);
      }
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

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="overflow-hidden relative py-20 bg-gradient-to-b from-white to-purple-50 lg:py-32">
        <div className="absolute inset-0 z-0 opacity-30">
          <Image
            src="/landing/pattern-grid.svg"
            alt="Pattern"
            fill
            className="object-cover"
          />
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col items-center mx-auto space-y-8 max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-[#3B2146] leading-tight animate-fade-in-up">
              Multiplica las Fuentes de
              Financiamiento de tus
              Desarrollos: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B1187] to-purple-600">
                Capital Inmobiliario al
                Alcance de Todos
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground animate-fade-in-up">
              Transformamos el
              desarrollo inmobiliario
              conectándote con miles de
              inversores. Financiamiento
              ágil, transparente y 100%
              regulado.
            </p>

            <div className="flex flex-col gap-4 justify-center mt-8 w-full sm:flex-row">
              <Button
                size="lg"
                className="bg-[#5B1187] hover:bg-[#4a0d6e] h-14 px-8 text-lg shadow-lg hover:shadow-purple-500/25 group transition-all duration-300 hover:scale-105"
              >
                Aplicar como
                Desarrollador
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg border-purple-200 hover:bg-purple-50 text-[#5B1187]"
              >
                Agendar Reunión
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-8 p-6 mt-8 w-full max-w-3xl rounded-2xl border border-purple-100 shadow-sm backdrop-blur-sm md:grid-cols-3 bg-white/50">
              <div className="flex flex-col items-center p-4">
                <div className="p-3 bg-purple-100 rounded-xl mb-3 text-[#5B1187]">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-[#3B2146]">
                  +10,000
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Inversores potenciales
                </div>
              </div>
              <div className="flex flex-col items-center p-4 border-t border-purple-100 md:border-t-0 md:border-l">
                <div className="p-3 mb-3 text-blue-700 bg-blue-100 rounded-xl">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-[#3B2146]">
                  50%
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Más rápido que bancos
                  tradicionales
                </div>
              </div>
              <div className="flex flex-col items-center p-4 border-t border-purple-100 md:border-t-0 md:border-l">
                <div className="p-3 mb-3 text-green-700 bg-green-100 rounded-xl">
                  <Landmark className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-[#3B2146]">
                  $50M
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Capital ya financiado
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CNV Section */}
      <section className="py-12 bg-white border-purple-100 border-y">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-6 items-center mx-auto max-w-3xl text-center animate-fade-in-up">
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 px-4 py-1.5 text-sm font-medium rounded-full">
              Regulado por la CNV
            </Badge>
            <div className="relative w-auto h-20 md:h-24">
              <Image
                src="/cnv-logo.png"
                alt="Comisión Nacional de Valores"
                width={200}
                height={100}
                className="object-contain w-auto h-full"
              />
            </div>
            <p className="text-lg leading-relaxed text-muted-foreground">
              La Comisión Nacional de
              Valores garantiza que cada
              token representa
              participación legal en el
              fideicomiso del proyecto,
              brindando seguridad
              jurídica completa a tus
              inversores.
            </p>
          </div>
        </div>
      </section>

      {/* Parallax Construction Section */}
      <section
        ref={sectionRef}
        className="relative h-[400vh] bg-slate-50"
      >
        <div className="flex overflow-hidden sticky top-0 flex-col justify-center items-center w-full h-screen">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-100/40 via-slate-50 to-slate-100 -z-10"></div>

          {/* Title - Fixed at top */}
          <div className="absolute top-10 z-20 px-4 text-center md:top-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3B2146] mb-2">
              Proceso de Tokenización
            </h2>
            <p className="text-muted-foreground">
              Desliza para ver el paso a
              paso
            </p>
          </div>

          {/* Centered Images Layer */}
          <div className="flex absolute inset-0 z-0 justify-center items-center">
            {/* Step 1 Image */}
            <div
              className={`absolute w-full h-full max-w-6xl max-h-[70vh] flex items-center justify-center transition-all duration-1000 ease-out ${
                activeStep === 1
                  ? "opacity-100 blur-0 scale-100"
                  : "opacity-0 blur-xl scale-110"
              }`}
            >
              <Image
                src="/landing/building1.png"
                alt="Cimientos Legales"
                fill
                className="object-contain p-8"
                priority
              />
            </div>
            {/* Step 2 Image */}
            <div
              className={`absolute w-full h-full max-w-6xl max-h-[70vh] flex items-center justify-center transition-all duration-1000 ease-out ${
                activeStep === 2
                  ? "opacity-100 blur-0 scale-100"
                  : "opacity-0 blur-xl scale-110"
              }`}
            >
              <Image
                src="/landing/building2.png"
                alt="Tokenización Flexible"
                fill
                className="object-contain p-8"
              />
            </div>
            {/* Step 3 Image */}
            <div
              className={`absolute w-full h-full max-w-6xl max-h-[70vh] flex items-center justify-center transition-all duration-1000 ease-out ${
                activeStep === 3
                  ? "opacity-100 blur-0 scale-100"
                  : "opacity-0 blur-xl scale-110"
              }`}
            >
              <Image
                src="/landing/building3.png"
                alt="Preventa por Etapas"
                fill
                className="object-contain p-8"
              />
            </div>
            {/* Step 4 Image */}
            <div
              className={`absolute w-full h-full max-w-6xl max-h-[70vh] flex items-center justify-center transition-all duration-1000 ease-out ${
                activeStep === 4
                  ? "opacity-100 blur-0 scale-100"
                  : "opacity-0 blur-xl scale-110"
              }`}
            >
              <Image
                src="/landing/building4.png"
                alt="Proyecto Exitoso"
                fill
                className="object-contain p-8"
              />
            </div>
          </div>

          {/* Centered Text Overlay Layer */}
          <div className="relative z-10 px-6 mt-32 w-full max-w-2xl md:mt-0">
            <div className="p-8 text-center rounded-3xl border shadow-2xl backdrop-blur-xl transition-all duration-500 bg-white/80 md:p-10 border-white/50 hover:scale-105">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#5B1187] text-white text-2xl font-bold mb-6 shadow-lg shadow-purple-500/30">
                {
                  stepsData[
                    activeStep - 1
                  ].step
                }
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-[#3B2146] mb-4">
                {
                  stepsData[
                    activeStep - 1
                  ].title
                }
              </h3>
              <p className="text-lg leading-relaxed md:text-xl text-slate-600">
                {
                  stepsData[
                    activeStep - 1
                  ].description
                }
              </p>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="hidden absolute right-8 top-1/2 z-20 flex-col gap-4 transform -translate-y-1/2 md:flex">
            {[1, 2, 3, 4].map(
              (step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${activeStep === step ? "bg-[#5B1187] scale-125" : "bg-purple-200"}`}
                />
              )
            )}
          </div>
        </div>
      </section>

      {/* Financing Options Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#3B2146] mb-4">
              Múltiples Vías de
              Financiamiento
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Adaptamos la estructura de
              capital a las necesidades
              de tu proyecto, ofreciendo
              flexibilidad tanto para
              vos como para los
              inversores.
            </p>
          </div>

          <div className="grid gap-8 mx-auto max-w-4xl md:grid-cols-2">
            {/* Equity Token Option */}
            <Card className="bg-gradient-to-br from-white border-purple-100 shadow-lg transition-shadow hover:shadow-xl to-purple-50/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 text-[#5B1187]">
                  <Building2 className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl text-[#3B2146]">
                  Equity Tokens
                </CardTitle>
                <CardDescription>
                  Venta de
                  participaciones del
                  activo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex gap-3 items-start">
                    <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Inversores compran
                      m² reales del
                      proyecto.
                    </span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Obtenés capital
                      sin generar deuda.
                    </span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Ideal para
                      preventa y
                      capitalización
                      inicial.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Debt Token Option */}
            <Card className="bg-gradient-to-br from-white border-purple-100 shadow-lg transition-shadow hover:shadow-xl to-blue-50/50">
              <CardHeader>
                <div className="flex justify-center items-center mb-4 w-12 h-12 text-blue-700 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl text-[#3B2146]">
                  Deuda / Renta Fija
                </CardTitle>
                <CardDescription>
                  Crédito con tasa fija
                  para inversores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex gap-3 items-start">
                    <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Instrumentos
                      similares a bonos
                      corporativos.
                    </span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Pagás un interés
                      fijo a los
                      inversores.
                    </span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Mantenés la
                      titularidad
                      completa del
                      activo.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 border-t bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 text-center md:grid-cols-3">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mb-6 text-[#5B1187]">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#3B2146]">
                Regulado por CNV
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                Operamos bajo el marco
                regulatorio de la
                Comisión Nacional de
                Valores, garantizando
                seguridad jurídica para
                todas las partes.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mb-6 text-[#5B1187]">
                <Handshake className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#3B2146]">
                Smart Contracts
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                Automatizamos la
                distribución de
                rendimientos y la
                gestión de la propiedad
                mediante contratos
                inteligentes auditados.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mb-6 text-[#5B1187]">
                <Coins className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#3B2146]">
                Liquidez Secundaria
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                Tus inversores pueden
                operar en nuestro
                mercado secundario,
                brindando una ventaja
                competitiva de liquidez
                a tu proyecto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#3B2146] text-white">
        <div className="container px-4 text-center md:px-6">
          <h2 className="mb-6 text-3xl font-bold tracking-tight">
            ¿Listo para tokenizar tu
            desarrollo?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-purple-200">
            Sumate a la revolución del
            Real Estate. Completá el
            formulario y nuestro equipo
            de estructuración financiera
            se pondrá en contacto.
          </p>
          <Button
            size="lg"
            className="bg-white text-[#5B1187] hover:bg-gray-100 font-semibold px-8 h-12 text-lg"
          >
            Comenzar Solicitud
          </Button>
        </div>
      </section>
    </div>
  );
}
