"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowLeft,
  Search,
  TrendingUp,
  Star,
  LayoutGrid,
  CircleDollarSign,
  Filter,
  Layers,
  MapPin,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import type {
  MarketToken,
  Project,
  WalletBalance,
} from "@/types/wallet";

interface ExchangePageProps {
  tokens: MarketToken[];
  projects: Project[];
  balances: WalletBalance[];
}

export default function ExchangePage({
  tokens,
  projects,
  balances,
}: ExchangePageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] =
    useState("tokens");
  const [searchQuery, setSearchQuery] =
    useState("");
  const [showFilters, setShowFilters] =
    useState(false);
  const [
    selectedProject,
    setSelectedProject,
  ] = useState<string>("");

  // Filter tokens based on search and project
  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => {
      const matchesSearch = token.symbol
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        );
      const matchesProject =
        selectedProject
          ? token.projectId ===
            selectedProject
          : true;
      return (
        matchesSearch && matchesProject
      );
    });
  }, [
    tokens,
    searchQuery,
    selectedProject,
  ]);

  // Filter projects based on search
  const filteredProjects =
    useMemo(() => {
      return projects.filter(
        (project) =>
          project.title
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            )
      );
    }, [projects, searchQuery]);

  // Get user's balance for a token
  const getTokenBalance = (
    tokenId: string
  ) => {
    const balance = balances.find(
      (b) => b.currencyCode === tokenId
    );
    return balance?.available || 0;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex gap-3 items-center p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.back()
            }
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight">
              Exchange
            </h1>
            <p className="text-sm text-muted-foreground">
              Compra y vende tokens
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setShowFilters(true)
            }
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tokens o proyectos..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 w-7 h-7 -translate-y-1/2"
                onClick={() =>
                  setSearchQuery("")
                }
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger
              value="tokens"
              className="text-xs font-bold tracking-wider uppercase"
            >
              Tokens
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="text-xs font-bold tracking-wider uppercase"
            >
              Proyectos
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1">
        <Tabs value={activeTab}>
          <TabsContent
            value="tokens"
            className="p-4 mt-0 space-y-3"
          >
            {filteredTokens.map(
              (token) => {
                const balance =
                  getTokenBalance(
                    token.id
                  );
                return (
                  <Card
                    key={token.id}
                    className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01]"
                    onClick={() =>
                      router.push(
                        `/exchange/${token.symbol}`
                      )
                    }
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center">
                          <div className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                            <CircleDollarSign className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {
                                token.symbol
                              }
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {
                                token.projectTitle
                              }
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                        >
                          {
                            token.projectTitle
                          }
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Precio
                        </span>
                        <span className="font-semibold">
                          $
                          {
                            token.priceUsd
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          24h
                        </span>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            token.change24hPct >=
                              0
                              ? "text-green-500"
                              : "text-red-500"
                          )}
                        >
                          {token.change24hPct >=
                          0
                            ? "+"
                            : ""}
                          {token.change24hPct.toFixed(
                            2
                          )}
                          %
                        </span>
                      </div>
                      {balance > 0 && (
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm text-muted-foreground">
                            Balance
                          </span>
                          <span className="font-semibold">
                            {balance}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              }
            )}
          </TabsContent>

          <TabsContent
            value="projects"
            className="p-4 mt-0 space-y-3"
          >
            {filteredProjects.map(
              (project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01]"
                  onClick={() =>
                    router.push(
                      `/project/${project.id}`
                    )
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3 items-center">
                        <div className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {
                              project.title
                            }
                          </CardTitle>
                          <div className="flex gap-1 items-center text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {
                              project.location
                            }
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          project.status ===
                          "IN_CONSTRUCTION"
                            ? "default"
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        ROI Estimado
                      </span>
                      <span className="font-semibold text-green-500">
                        +
                        {project.roiPct}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Progreso
                      </span>
                      <span className="font-semibold">
                        {
                          project.progressPct
                        }
                        %
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Precio desde
                      </span>
                      <span className="font-semibold">
                        {
                          project.priceRangeUsd
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Filters Dialog */}
      <Dialog
        open={showFilters}
        onOpenChange={setShowFilters}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Filtros
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Proyecto</Label>
              <select
                className="px-3 py-2 w-full text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedProject}
                onChange={(e) =>
                  setSelectedProject(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Todos los proyectos
                </option>
                {projects.map(
                  (project) => (
                    <option
                      key={project.id}
                      value={project.id}
                    >
                      {project.title}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedProject(
                    ""
                  );
                  setSearchQuery("");
                }}
              >
                Limpiar
              </Button>
              <Button
                className="flex-1"
                onClick={() =>
                  setShowFilters(false)
                }
              >
                Aplicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
