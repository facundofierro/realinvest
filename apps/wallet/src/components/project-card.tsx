"use client";

import {
  Card,
  CardContent,
} from "@repo/ui/components/ui/card";
import { Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProjectCardProps {
  id: string;
  title: string;
  location: string;
  image: string;
  status: string;
  roi: string | number;
  progress: number;
  priceRange: string;
  fixedRent: string | number;
  isPreSale?: boolean;
}

export function ProjectCard({
  id,
  title,
  location,
  image,
  status,
  roi,
  progress,
  priceRange,
  fixedRent,
  isPreSale,
}: ProjectCardProps) {
  const isPreSaleStatus =
    isPreSale ||
    status === "PRE-VENTA" ||
    status === "PRE_SALE";

  return (
    <Link href={`/project/${id}`}>
      <Card className="overflow-hidden h-full border-none shadow-lg group">
        <div className="relative h-32 bg-slate-200">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 to-transparent bg-linear-to-t from-black/60" />
          <div
            className={`absolute top-2 right-2 ${isPreSaleStatus ? "bg-accent/90 shadow-accent/20" : "bg-black/40 border-white/10"} text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full backdrop-blur-md border shadow-sm`}
          >
            {status.replace(/_/g, " ")}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold transition-colors line-clamp-1 group-hover:text-primary">
                {title}
              </h3>
              <p className="flex items-center text-xs text-muted-foreground">
                <Building2 className="mr-1 w-3 h-3" />{" "}
                {location}
              </p>
            </div>
            <div className="text-right">
              <span className="block font-bold text-primary">
                {roi}
                {typeof roi === "number"
                  ? "%"
                  : ""}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase">
                TIR Est.
              </span>
            </div>
          </div>
          <div className="overflow-hidden mb-2 w-full h-2 rounded-full bg-secondary">
            <div
              className="h-full transition-all duration-500 bg-primary"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Desde: {priceRange}
            </span>
            <span>
              Renta fija: {fixedRent}
              {typeof fixedRent ===
              "number"
                ? "%"
                : ""}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
