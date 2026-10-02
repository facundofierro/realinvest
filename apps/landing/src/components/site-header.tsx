"use client";

import { Menu } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/ui/sheet";
import { BrandLogo } from "@/components/brand-logo";
import { CtaLink } from "@/components/cta-link";
import { nav } from "@/content/es";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-card-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-[68px] w-full max-w-[1180px] items-center justify-between gap-4 px-6">
        <a href="#top" aria-label="Real Invest — inicio" className="rounded-lg">
          <BrandLogo />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {nav.links.map((link) => (
            <a
              key={link.href + link.label}
              href={link.href}
              className="rounded-lg px-3 py-2.5 text-[15px] text-muted-foreground transition-colors hover:bg-tint hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          <CtaLink href={nav.cta.href} className="ml-2 min-h-[42px]">
            {nav.cta.label}
          </CtaLink>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <CtaLink
            href={nav.cta.href}
            className="hidden min-h-[42px] px-5 min-[420px]:inline-flex"
          >
            {nav.cta.label}
          </CtaLink>
          <Sheet>
            <SheetTrigger
              aria-label="Abrir menú"
              className="flex size-11 items-center justify-center rounded-xl text-ink transition-colors hover:bg-tint"
            >
              <Menu className="size-6" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-6">
              <SheetTitle className="sr-only">Menú</SheetTitle>
              <SheetDescription className="sr-only">
                Navegación principal
              </SheetDescription>
              <BrandLogo />
              <nav aria-label="Principal (móvil)" className="grid gap-1">
                {nav.links.map((link) => (
                  <SheetClose asChild key={link.href + link.label}>
                    <a
                      href={link.href}
                      className="rounded-lg px-3 py-3 text-base text-ink transition-colors hover:bg-tint"
                    >
                      {link.label}
                    </a>
                  </SheetClose>
                ))}
              </nav>
              <SheetClose asChild>
                <CtaLink href={nav.cta.href}>{nav.cta.label}</CtaLink>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
