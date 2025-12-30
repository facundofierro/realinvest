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

// API functions to fetch data client-side
async function fetchMarketTokens(): Promise<
  MarketToken[]
> {
  const response = await fetch(
    "/api/market/tokens"
  );
  if (!response.ok)
    throw new Error(
      "Failed to fetch tokens"
    );
  const json = (await response
    .json()
    .catch(() => null)) as {
    tokens?: MarketToken[];
  } | null;
  return Array.isArray(json?.tokens)
    ? json.tokens
    : [];
}

async function fetchProjects(): Promise<
  Project[]
> {
  const response = await fetch(
    "/api/projects"
  );
  if (!response.ok)
    throw new Error(
      "Failed to fetch projects"
    );
  const json = (await response
    .json()
    .catch(() => null)) as {
    projects?: Project[];
  } | null;
  return Array.isArray(json?.projects)
    ? json.projects
    : [];
}

async function fetchWalletBalances(): Promise<
  WalletBalance[]
> {
  const response = await fetch(
    "/api/wallet/balances"
  );
  if (!response.ok)
    throw new Error(
      "Failed to fetch balances"
    );
  const json = (await response
    .json()
    .catch(() => null)) as {
    balances?: WalletBalance[];
  } | null;
  return Array.isArray(json?.balances)
    ? json.balances
    : [];
}

export default function ExchangePage() {
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
  const [tokens, setTokens] = useState<
    MarketToken[]
  >([]);
  const [projects, setProjects] =
    useState<Project[]>([]);
  const [balances, setBalances] =
    useState<WalletBalance[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState<
    string | null
  >(null);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [
          tokensData,
          projectsData,
          balancesData,
        ] = await Promise.all([
          fetchMarketTokens(),
          fetchProjects(),
          fetchWalletBalances(),
        ]);
        setTokens(tokensData);
        setProjects(projectsData);
        setBalances(balancesData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter tokens based on search and project
  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => {
      const matchesSearch = token.symbol
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        );
      const matchesProject =
        !selectedProject ||
        token.projectId ===
          selectedProject;
      return (
        matchesSearch && matchesProject
      );
    });
  }, [
    tokens,
    searchQuery,
    selectedProject,
  ]);

  // Get unique projects from tokens
  const uniqueProjects = useMemo(() => {
    const projectIds = tokens.map(
      (t) => t.projectId
    );
    return projects.filter((p) =>
      projectIds.includes(p.id)
    );
  }, [tokens, projects]);

  // Calculate portfolio value
  const portfolioValue = useMemo(() => {
    return balances.reduce(
      (sum, balance) =>
        sum + balance.available,
      0
    );
  }, [balances]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-muted-foreground">
          Loading exchange data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-destructive">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex gap-4 items-center p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.back()
            }
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">
            Exchange
          </h1>
        </div>
      </header>

      {/* Portfolio Summary */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {portfolioValue.toFixed(
                2
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setShowFilters(
                !showFilters
              )
            }
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 space-y-4">
            <div>
              <Label>Project</Label>
              <select
                value={selectedProject}
                onChange={(e) =>
                  setSelectedProject(
                    e.target.value
                  )
                }
                className="px-3 py-2 mt-1 w-full rounded-md border"
              >
                <option value="">
                  All Projects
                </option>
                {uniqueProjects.map(
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
          </div>
        )}
      </div>

      {/* Tokens List */}
      <div className="flex-1 px-4 pb-4">
        <div className="space-y-2">
          {filteredTokens.map(
            (token) => (
              <Card
                key={token.id}
                className="transition-colors cursor-pointer hover:bg-muted/50"
                onClick={() =>
                  router.push(
                    `/exchange/${token.symbol}`
                  )
                }
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <div className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/10">
                        <CircleDollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {token.symbol}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {
                            token.projectTitle
                          }
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        $
                        {token.priceUsd.toFixed(
                          2
                        )}
                      </div>
                      <div className="text-sm text-green-600">
                        +2.5%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
}
