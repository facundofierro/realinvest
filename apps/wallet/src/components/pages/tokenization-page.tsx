"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Building2, Coins, TrendingUp, ShieldCheck, ArrowRight, Handshake, FileText } from "lucide-react";
import Link from "next/link";

export default function TokenizationPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-purple-50 py-20 lg:py-32">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 mb-4 px-4 py-1">
              Regulado por la CNV
            </Badge>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-[#3B2146]">
              Financiá tu Proyecto Inmobiliario con Tokenización
            </h1>
            <p className="text-xl text-muted-foreground max-w-[700px]">
              Accedé a financiamiento ágil y transparente para tus desarrollos en Argentina. 
              Conectamos desarrolladores con inversores a través de tecnología blockchain regulada.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button size="lg" className="bg-[#5B1187] hover:bg-[#4a0d6e]">
                Aplicar como Desarrollador
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Conocer más
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Financing Options Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[#3B2146] mb-4">
              Múltiples Vías de Financiamiento
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Adaptamos la estructura de capital a las necesidades de tu proyecto, ofreciendo flexibilidad tanto para vos como para los inversores.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Equity Token Option */}
            <Card className="border-purple-100 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-purple-50/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 text-[#5B1187]">
                  <Building2 className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl text-[#3B2146]">Equity Tokens</CardTitle>
                <CardDescription>Venta de participaciones del activo</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Inversores compran m² reales del proyecto.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Obtenés capital sin generar deuda.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Ideal para preventa y capitalización inicial.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Debt Token Option */}
            <Card className="border-purple-100 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-blue-50/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 text-blue-700">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl text-[#3B2146]">Deuda / Renta Fija</CardTitle>
                <CardDescription>Crédito con tasa fija para inversores</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Instrumentos similares a bonos corporativos.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Pagás un interés fijo a los inversores.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Mantenés la titularidad completa del activo.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-slate-50 border-t">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mb-6 text-[#5B1187]">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#3B2146]">Regulado por CNV</h3>
              <p className="text-muted-foreground leading-relaxed">
                Operamos bajo el marco regulatorio de la Comisión Nacional de Valores, garantizando seguridad jurídica para todas las partes.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mb-6 text-[#5B1187]">
                <Handshake className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#3B2146]">Smart Contracts</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automatizamos la distribución de rendimientos y la gestión de la propiedad mediante contratos inteligentes auditados.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mb-6 text-[#5B1187]">
                <Coins className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#3B2146]">Liquidez Secundaria</h3>
              <p className="text-muted-foreground leading-relaxed">
                Tus inversores pueden operar en nuestro mercado secundario, brindando una ventaja competitiva de liquidez a tu proyecto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#3B2146] text-white">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-6">
            ¿Listo para tokenizar tu desarrollo?
          </h2>
          <p className="text-purple-200 text-lg mb-10 max-w-2xl mx-auto">
            Sumate a la revolución del Real Estate. Completá el formulario y nuestro equipo de estructuración financiera se pondrá en contacto.
          </p>
          <Button size="lg" className="bg-white text-[#5B1187] hover:bg-gray-100 font-semibold px-8 h-12 text-lg">
            Comenzar Solicitud
          </Button>
        </div>
      </section>
    </div>
  );
}
