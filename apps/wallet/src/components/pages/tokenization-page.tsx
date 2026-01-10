"use client";

import {
  useEffect,
  useState,
  useRef,
} from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Handshake,
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

const heroLabels = [
  {
    text: "Creación de fideicomiso",
    position:
      "top-8 left-2 sm:left-6 md:top-10",
  },
  {
    text: "Regulado por la CNV",
    position:
      "top-20 right-2 sm:right-8 md:top-24",
  },
  {
    text: "Tokenización de la propiedad",
    position:
      "bottom-20 left-2 sm:left-10 md:bottom-28",
  },
  {
    text: "Compra de tokens en lanzamiento",
    position:
      "bottom-8 right-2 sm:right-6 md:bottom-12",
  },
  {
    text: "Mercado secundario",
    position:
      "top-1/2 -translate-y-1/2 left-1 sm:left-6",
  },
];

export default function TokenizationPage() {
  const [activeStep, setActiveStep] =
    useState(1);
  const [
    activeHeroLabel,
    setActiveHeroLabel,
  ] = useState(0);
  const sectionRef =
    useRef<HTMLElement>(null);
  const videoSectionRef =
    useRef<HTMLElement>(null);
  const video1Ref =
    useRef<HTMLVideoElement>(null);
  const video2Ref =
    useRef<HTMLVideoElement>(null);
  const [
    videoProgress,
    setVideoProgress,
  ] = useState(0);
  const [
    videoVisibility,
    setVideoVisibility,
  ] = useState(0);

  useEffect(() => {
    const sectionEl =
      sectionRef.current;
    if (!sectionEl) return;

    const findScrollParent = () => {
      const isScrollable = (
        el: HTMLElement
      ) => {
        const style =
          window.getComputedStyle(el);
        const overflowY =
          style.overflowY;
        return (
          (overflowY === "auto" ||
            overflowY === "scroll") &&
          el.scrollHeight >
            el.clientHeight
        );
      };

      let el: HTMLElement | null =
        sectionEl.parentElement;
      while (
        el &&
        el !== document.body
      ) {
        if (isScrollable(el)) return el;
        el = el.parentElement;
      }
      return null;
    };

    const scrollParent =
      findScrollParent();

    const getProgress = () => {
      const rect =
        sectionEl.getBoundingClientRect();

      if (!scrollParent) {
        const windowHeight =
          window.innerHeight;
        const scrollY = window.scrollY;
        const sectionTop =
          scrollY + rect.top;
        const totalScrollableDistance =
          Math.max(
            rect.height - windowHeight,
            1
          );
        return Math.min(
          Math.max(
            (scrollY - sectionTop) /
              totalScrollableDistance,
            0
          ),
          1
        );
      }

      const containerRect =
        scrollParent.getBoundingClientRect();
      const containerHeight =
        scrollParent.clientHeight;
      const scrollTop =
        scrollParent.scrollTop;

      const sectionTop =
        scrollTop +
        (rect.top - containerRect.top);
      const totalScrollableDistance =
        Math.max(
          rect.height - containerHeight,
          1
        );

      return Math.min(
        Math.max(
          (scrollTop - sectionTop) /
            totalScrollableDistance,
          0
        ),
        1
      );
    };

    const handleScroll = () => {
      const progress = getProgress();
      const step = Math.min(
        stepsData.length,
        Math.max(
          Math.floor(
            progress * stepsData.length
          ) + 1,
          1
        )
      );
      setActiveStep(step);
    };

    handleScroll();
    if (scrollParent) {
      scrollParent.addEventListener(
        "scroll",
        handleScroll,
        { passive: true }
      );
    } else {
      window.addEventListener(
        "scroll",
        handleScroll,
        {
          passive: true,
        }
      );
    }
    window.addEventListener(
      "resize",
      handleScroll
    );
    return () => {
      if (scrollParent) {
        scrollParent.removeEventListener(
          "scroll",
          handleScroll
        );
      } else {
        window.removeEventListener(
          "scroll",
          handleScroll
        );
      }
      window.removeEventListener(
        "resize",
        handleScroll
      );
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(
      () => {
        setActiveHeroLabel((prev) => {
          if (heroLabels.length <= 1)
            return prev;
          let next = prev;
          while (next === prev) {
            next = Math.floor(
              Math.random() *
                heroLabels.length
            );
          }
          return next;
        });
      },
      2200
    );
    return () =>
      window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const sectionEl =
      videoSectionRef.current;
    if (!sectionEl) return;

    const clamp01 = (v: number) =>
      Math.min(1, Math.max(0, v));

    const findScrollParent = () => {
      const isScrollable = (
        el: HTMLElement
      ) => {
        const style =
          window.getComputedStyle(el);
        const overflowY =
          style.overflowY;
        return (
          (overflowY === "auto" ||
            overflowY === "scroll") &&
          el.scrollHeight >
            el.clientHeight
        );
      };

      let el: HTMLElement | null =
        sectionEl.parentElement;
      while (
        el &&
        el !== document.body
      ) {
        if (isScrollable(el)) return el;
        el = el.parentElement;
      }
      return null;
    };

    const scrollParent =
      findScrollParent();

    const getProgress = () => {
      const rect =
        sectionEl.getBoundingClientRect();

      if (!scrollParent) {
        const windowHeight =
          window.innerHeight;
        const scrollY = window.scrollY;
        const sectionTop =
          scrollY + rect.top;
        const totalScrollableDistance =
          Math.max(
            rect.height - windowHeight,
            1
          );
        return clamp01(
          (scrollY - sectionTop) /
            totalScrollableDistance
        );
      }

      const containerRect =
        scrollParent.getBoundingClientRect();
      const containerHeight =
        scrollParent.clientHeight;
      const scrollTop =
        scrollParent.scrollTop;

      const sectionTop =
        scrollTop +
        (rect.top - containerRect.top);
      const totalScrollableDistance =
        Math.max(
          rect.height - containerHeight,
          1
        );

      return clamp01(
        (scrollTop - sectionTop) /
          totalScrollableDistance
      );
    };

    const getVisibility = () => {
      const rect =
        sectionEl.getBoundingClientRect();
      const viewportTop = scrollParent
        ? scrollParent.getBoundingClientRect()
            .top
        : 0;
      const viewportBottom =
        scrollParent
          ? scrollParent.getBoundingClientRect()
              .bottom
          : window.innerHeight;
      const viewportHeight =
        scrollParent
          ? scrollParent.clientHeight
          : window.innerHeight;
      const visiblePx =
        Math.min(
          rect.bottom,
          viewportBottom
        ) -
        Math.max(rect.top, viewportTop);
      return clamp01(
        visiblePx / viewportHeight
      );
    };

    const handleScroll = () => {
      setVideoProgress(getProgress());
      setVideoVisibility(
        getVisibility()
      );
    };

    handleScroll();
    if (scrollParent) {
      scrollParent.addEventListener(
        "scroll",
        handleScroll,
        { passive: true }
      );
    } else {
      window.addEventListener(
        "scroll",
        handleScroll,
        { passive: true }
      );
    }
    window.addEventListener(
      "resize",
      handleScroll
    );
    return () => {
      if (scrollParent) {
        scrollParent.removeEventListener(
          "scroll",
          handleScroll
        );
      } else {
        window.removeEventListener(
          "scroll",
          handleScroll
        );
      }
      window.removeEventListener(
        "resize",
        handleScroll
      );
    };
  }, []);

  useEffect(() => {
    const clamp01 = (v: number) =>
      Math.min(1, Math.max(0, v));

    const v1 = {
      start: 0.18,
      end: 0.55,
    };
    const v2 = {
      start: 0.68,
      end: 0.92,
    };

    const overallFade = (() => {
      const edge = 0.18;
      return clamp01(
        videoVisibility / edge
      );
    })();

    const shouldPlay =
      overallFade > 0.05;

    const syncVideo = (
      video: HTMLVideoElement | null,
      segment: {
        start: number;
        end: number;
      } | null
    ) => {
      if (!video) return;
      if (!shouldPlay) {
        video.pause();
        return;
      }

      const volume = clamp01(
        overallFade
      );
      if (!video.muted) {
        video.volume = volume;
      }

      if (!segment) {
        video.pause();
        return;
      }

      const segmentProgress = clamp01(
        (videoProgress -
          segment.start) /
          (segment.end - segment.start)
      );
      if (
        Number.isFinite(
          video.duration
        ) &&
        video.duration > 0
      ) {
        const targetTime =
          video.duration *
          segmentProgress;
        if (
          Number.isFinite(targetTime) &&
          Math.abs(
            video.currentTime -
              targetTime
          ) > 0.12
        ) {
          video.currentTime =
            targetTime;
        }
      }

      if (video.paused) {
        const playPromise =
          video.play();
        if (playPromise) {
          playPromise.catch(() => {
            video.muted = true;
            video
              .play()
              .catch(() => {});
          });
        }
      }
    };

    const isIn = (
      p: number,
      s: { start: number; end: number }
    ) => p >= s.start && p <= s.end;

    syncVideo(
      video1Ref.current,
      isIn(videoProgress, v1)
        ? v1
        : null
    );
    syncVideo(
      video2Ref.current,
      isIn(videoProgress, v2)
        ? v2
        : null
    );
  }, [videoProgress, videoVisibility]);

  const clamp01 = (v: number) =>
    Math.min(1, Math.max(0, v));
  const fadeInOut = (
    p: number,
    start: number,
    end: number,
    edge: number
  ) => {
    if (
      p <= start - edge ||
      p >= end + edge
    )
      return 0;
    if (p < start)
      return clamp01(
        (p - (start - edge)) / edge
      );
    if (p > end)
      return clamp01(
        (end + edge - p) / edge
      );
    return 1;
  };
  const fadeIn = (
    p: number,
    start: number,
    edge: number
  ) => clamp01((p - start) / edge);
  const fadeOut = (
    p: number,
    end: number,
    edge: number
  ) => clamp01((end - p) / edge);

  const overallFade = clamp01(
    videoVisibility / 0.18
  );
  const title1Opacity =
    fadeOut(videoProgress, 0.18, 0.07) *
    overallFade;
  const video1Opacity =
    fadeInOut(
      videoProgress,
      0.18,
      0.55,
      0.06
    ) * overallFade;
  const title2Opacity =
    fadeInOut(
      videoProgress,
      0.55,
      0.68,
      0.06
    ) * overallFade;
  const video2Opacity =
    fadeInOut(
      videoProgress,
      0.68,
      0.92,
      0.06
    ) * overallFade;
  const title3Opacity =
    fadeIn(videoProgress, 0.92, 0.06) *
    overallFade;

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="overflow-hidden relative pt-20 pb-24 bg-white sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36 min-h-[82vh] lg:min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-white via-purple-50/60" />
          <div className="absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-purple-300/25 blur-3xl" />
          <div className="absolute -bottom-48 -right-40 h-[28rem] w-[28rem] rounded-full bg-indigo-300/20 blur-3xl" />
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/landing/pattern-grid.svg"
              alt="Pattern"
              fill
              className="object-cover [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_75%)]"
            />
          </div>
        </div>

        <div className="relative z-10 px-4 mx-auto w-full max-w-6xl md:px-6">
          <div className="grid grid-cols-1 gap-12 items-center lg:items-start lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:-translate-y-6 lg:-translate-x-2">
              <h1 className="font-extrabold tracking-tight text-[#3B2146] leading-[1.06] animate-fade-in-up">
                <span className="block text-[clamp(20px,2.4vw,32px)] text-[#2a1632] lg:whitespace-nowrap">
                  Multiplica las fuentes
                  de financiamiento
                </span>
                <span className="block mt-3 text-[clamp(26px,3.4vw,44px)] text-transparent bg-clip-text bg-gradient-to-r from-[#5B1187] via-purple-600 to-fuchsia-500 lg:whitespace-nowrap">
                  Capital inmobiliario
                  al alcance de todos
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-[clamp(15px,1.9vw,18px)] leading-relaxed text-muted-foreground animate-fade-in-up">
                Transformamos el
                desarrollo inmobiliario
                conectándote con miles
                de inversores.
                Financiamiento ágil,
                transparente y 100%
                regulado.
              </p>

              <div className="flex flex-col gap-3 justify-center mt-7 w-full sm:flex-row sm:justify-start sm:w-auto sm:gap-4 animate-fade-in-up">
                <Button
                  size="lg"
                  className="bg-[#5B1187] hover:bg-[#4a0d6e] h-12 sm:h-14 px-7 sm:px-8 text-base sm:text-lg shadow-lg hover:shadow-purple-500/25 group transition-all duration-300 hover:scale-[1.02]"
                >
                  Aplicar como
                  Desarrollador
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 sm:h-14 px-7 sm:px-8 text-base sm:text-lg border-purple-200 hover:bg-purple-50 text-[#5B1187]"
                >
                  Agendar Reunión
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px] lg:ml-auto lg:mr-0 lg:translate-x-10 lg:translate-y-10">
              <div className="relative w-full aspect-[4/3] sm:aspect-square">
                <Image
                  src="/landing/token2.png"
                  alt="Tokenización inmobiliaria"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div
                key={activeHeroLabel}
                className={`absolute ${heroLabels[activeHeroLabel]?.position ?? "top-10 left-6"} motion-reduce:animate-none animate-fade-in-out`}
              >
                <div className="inline-flex gap-2 items-center px-4 py-2 rounded-full border ring-1 shadow-lg backdrop-blur-xl bg-white/35 border-white/60 ring-white/40 shadow-black/5">
                  <span className="w-2 h-2 rounded-full bg-[#5B1187]" />
                  <span className="text-sm font-semibold text-[#3B2146]">
                    {
                      heroLabels[
                        activeHeroLabel
                      ]?.text
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white border-purple-100 border-y sm:py-14">
        <div className="px-4 mx-auto w-full max-w-6xl md:px-6">
          <div className="grid gap-6">
            <div className="overflow-hidden relative rounded-[2rem] border border-purple-100 bg-gradient-to-br from-white via-purple-50/60 to-indigo-50/60 shadow-sm">
              <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-2 lg:gap-12 lg:items-center">
                <div>
                  <Badge className="bg-white/70 text-[#3B2146] hover:bg-white/70 border-purple-200 px-4 py-1.5 text-sm font-medium rounded-full">
                    Múltiples formas de
                    financiamiento
                  </Badge>
                  <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#3B2146]">
                    Estructura de
                    capital flexible
                    para tu proyecto
                  </h2>
                  <p className="mt-4 text-base leading-relaxed sm:text-lg text-muted-foreground">
                    Combiná distintas
                    alternativas para
                    optimizar la
                    preventa, reducir
                    riesgos y atraer más
                    inversores.
                  </p>

                  <div className="grid gap-4 mt-7 sm:grid-cols-2">
                    <div className="p-5 rounded-2xl border backdrop-blur-sm border-white/70 bg-white/70">
                      <div className="flex gap-3 items-start">
                        <div className="flex justify-center items-center w-10 h-10 rounded-xl bg-purple-100 text-[#5B1187] shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-bold text-[#3B2146]">
                            Equity
                            Tokens
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Venta de
                            participaciones
                            del activo
                          </p>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-3">
                        <li className="flex gap-3 items-start">
                          <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            Inversores
                            compran m²
                            reales del
                            proyecto.
                          </span>
                        </li>
                        <li className="flex gap-3 items-start">
                          <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            Obtenés
                            capital sin
                            generar
                            deuda.
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
                    </div>

                    <div className="p-5 rounded-2xl border backdrop-blur-sm border-white/70 bg-white/70">
                      <div className="flex gap-3 items-start">
                        <div className="flex justify-center items-center w-10 h-10 text-blue-700 bg-blue-100 rounded-xl shrink-0">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-bold text-[#3B2146]">
                            Deuda /
                            Renta Fija
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Crédito con
                            tasa fija
                            para
                            inversores
                          </p>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-3">
                        <li className="flex gap-3 items-start">
                          <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            Instrumentos
                            similares a
                            bonos
                            corporativos.
                          </span>
                        </li>
                        <li className="flex gap-3 items-start">
                          <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            Pagás un
                            interés fijo
                            a los
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
                    </div>
                  </div>
                </div>

                <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
                  <div className="w-full rounded-[1.75rem] border border-white/70 bg-white/40 backdrop-blur-sm aspect-[16/10]" />
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="overflow-hidden relative p-7 rounded-[2rem] border border-purple-100 bg-gradient-to-br from-white to-purple-50/60 shadow-sm sm:p-9">
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 px-4 py-1.5 text-sm font-medium rounded-full">
                  Regulado por la CNV
                </Badge>
                <h3 className="mt-4 text-xl sm:text-2xl font-extrabold tracking-tight text-[#3B2146]">
                  Seguridad jurídica
                  para el proyecto
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  Operamos bajo el marco
                  regulatorio de la
                  Comisión Nacional de
                  Valores, garantizando
                  seguridad jurídica
                  para todas las partes.
                </p>
                <div className="mt-6 w-full rounded-2xl border border-white/70 bg-white/50 backdrop-blur-sm aspect-[16/10]" />
              </div>

              <div className="overflow-hidden relative p-7 rounded-[2rem] border border-purple-100 bg-gradient-to-br from-white to-indigo-50/60 shadow-sm sm:p-9">
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 px-4 py-1.5 text-sm font-medium rounded-full">
                  Liquidez secundaria
                </Badge>
                <h3 className="mt-4 text-xl sm:text-2xl font-extrabold tracking-tight text-[#3B2146]">
                  Mercado para tus
                  inversores
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  Tus inversores pueden
                  operar en nuestro
                  mercado secundario,
                  brindando una ventaja
                  competitiva de
                  liquidez a tu
                  proyecto.
                </p>
                <div className="mt-6 w-full rounded-2xl border border-white/70 bg-white/50 backdrop-blur-sm aspect-[16/10]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Construction Section */}
      <section
        ref={sectionRef}
        className="relative h-[400vh] bg-white"
      >
        <div className="sticky top-0 w-full h-screen bg-white">
          <div className="flex flex-col justify-center px-4 mx-auto w-full max-w-6xl h-full md:px-6">
            <div className="mx-auto w-full max-w-6xl">
              <div className="mb-8 text-center lg:mb-12">
                <h2
                  className={`text-2xl sm:text-3xl font-bold text-[#5B1187] mb-2 lg:whitespace-nowrap transition-[filter,opacity] duration-500 ${
                    activeStep === 1
                      ? "blur-0 opacity-100"
                      : "blur-[2px] opacity-75"
                  }`}
                >
                  Proceso de
                  Tokenización
                </h2>
                <p
                  className={`text-muted-foreground transition-[filter,opacity] duration-500 ${
                    activeStep === 1
                      ? "blur-0 opacity-100"
                      : "blur-[2px] opacity-75"
                  }`}
                >
                  Desliza para ver el
                  paso a paso
                </p>
              </div>

              <div className="grid grid-cols-1 gap-10 items-center lg:grid-cols-2 lg:gap-16">
                <div className="relative mx-auto w-full max-w-xl h-[38vh] sm:h-[46vh] lg:h-[56vh]">
                  <Image
                    src="/landing/building1.png"
                    alt="Cimientos Legales"
                    fill
                    className={`object-contain transition-all duration-700 ease-out ${
                      activeStep === 1
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-3 scale-[1.02]"
                    }`}
                    priority
                  />
                  <Image
                    src="/landing/building2.png"
                    alt="Tokenización Flexible"
                    fill
                    className={`object-contain transition-all duration-700 ease-out ${
                      activeStep === 2
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-3 scale-[1.02]"
                    }`}
                  />
                  <Image
                    src="/landing/building3.png"
                    alt="Preventa por Etapas"
                    fill
                    className={`object-contain transition-all duration-700 ease-out ${
                      activeStep === 3
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-3 scale-[1.02]"
                    }`}
                  />
                  <Image
                    src="/landing/building4.png"
                    alt="Proyecto Exitoso"
                    fill
                    className={`object-contain transition-all duration-700 ease-out ${
                      activeStep === 4
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-3 scale-[1.02]"
                    }`}
                  />
                </div>

                <div className="mx-auto w-full max-w-xl lg:max-w-none">
                  <div className="p-8 bg-white rounded-3xl border border-purple-100 shadow-xl sm:p-10">
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#5B1187] text-white text-xl font-bold mb-5 shadow-lg shadow-purple-500/20">
                        {
                          stepsData[
                            activeStep -
                              1
                          ].step
                        }
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-[#3B2146] mb-3">
                        {
                          stepsData[
                            activeStep -
                              1
                          ].title
                        }
                      </h3>
                      <p className="text-base leading-relaxed sm:text-lg text-slate-600">
                        {
                          stepsData[
                            activeStep -
                              1
                          ].description
                        }
                      </p>
                      <div className="flex gap-2 mt-7">
                        {[
                          1, 2, 3, 4,
                        ].map(
                          (step) => (
                            <div
                              key={step}
                              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                                activeStep ===
                                step
                                  ? "bg-[#5B1187] scale-110"
                                  : "bg-purple-200"
                              }`}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={videoSectionRef}
        className="relative bg-white h-[280vh]"
      >
        <div className="flex sticky top-0 items-center w-full h-screen">
          <div className="px-4 mx-auto w-full max-w-6xl md:px-6">
            <div className="flex flex-col items-center mx-auto w-full max-w-5xl">
              <div className="relative w-full aspect-[16/9] bg-white">
                <video
                  ref={video1Ref}
                  className="object-cover absolute inset-0 w-full h-full"
                  playsInline
                  preload="metadata"
                  src="/landing/v1.mp4"
                  style={{
                    opacity:
                      video1Opacity,
                  }}
                />
                <video
                  ref={video2Ref}
                  className="object-cover absolute inset-0 w-full h-full"
                  playsInline
                  preload="metadata"
                  src="/landing/v2.mp4"
                  style={{
                    opacity:
                      video2Opacity,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t pointer-events-none from-white/70 via-white/10 to-white/50" />
                <div className="flex absolute inset-0 justify-center items-center px-6 pointer-events-none sm:px-10">
                  <div
                    className="max-w-2xl text-center"
                    style={{
                      opacity:
                        title1Opacity,
                    }}
                  >
                    <p className="text-xs font-semibold tracking-wide text-[#5B1187] uppercase">
                      Producto
                    </p>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#3B2146] sm:text-4xl">
                      Descubrí la
                      experiencia VEST
                    </h2>
                  </div>

                  <div
                    className="absolute max-w-2xl text-center"
                    style={{
                      opacity:
                        title2Opacity,
                    }}
                  >
                    <p className="text-xs font-semibold tracking-wide text-[#5B1187] uppercase">
                      Flujo
                    </p>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#3B2146] sm:text-4xl">
                      Gestión clara,
                      simple y regulada
                    </h2>
                  </div>

                  <div
                    className="absolute max-w-2xl text-center"
                    style={{
                      opacity:
                        title3Opacity,
                    }}
                  >
                    <p className="text-xs font-semibold tracking-wide text-[#5B1187] uppercase">
                      Escala
                    </p>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#3B2146] sm:text-4xl">
                      Listo para captar
                      más inversores
                    </h2>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-center mt-6">
                <div
                  className="h-1.5 w-8 rounded-full bg-purple-200"
                  style={{
                    opacity: clamp01(
                      title1Opacity *
                        1.2
                    ),
                  }}
                />
                <div
                  className="h-1.5 w-8 rounded-full bg-purple-200"
                  style={{
                    opacity: clamp01(
                      video1Opacity *
                        1.2
                    ),
                  }}
                />
                <div
                  className="h-1.5 w-8 rounded-full bg-purple-200"
                  style={{
                    opacity: clamp01(
                      title2Opacity *
                        1.2
                    ),
                  }}
                />
                <div
                  className="h-1.5 w-8 rounded-full bg-purple-200"
                  style={{
                    opacity: clamp01(
                      video2Opacity *
                        1.2
                    ),
                  }}
                />
                <div
                  className="h-1.5 w-8 rounded-full bg-purple-200"
                  style={{
                    opacity: clamp01(
                      title3Opacity *
                        1.2
                    ),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t bg-slate-50">
        <div className="px-4 mx-auto w-full max-w-6xl md:px-6">
          <div className="flex justify-center text-center">
            <div className="flex flex-col items-center max-w-lg">
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
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#3B2146] text-white">
        <div className="px-4 mx-auto w-full max-w-6xl text-center md:px-6">
          <h2 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
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
