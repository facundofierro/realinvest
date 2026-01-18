"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import {
  Building2,
  Plus,
  Edit,
  MapPin,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";
import { useAllProjects } from "@/hooks/use-admin-queries";
import { trpc } from "@/lib/trpc";
import Image from "next/image";

export function PropertiesPage() {
  const { data: projects = [], isLoading } = useAllProjects();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  const handleAddProperty = () => {
    setEditingProject(null);
    setIsDialogOpen(true);
  };

  const handleEditProperty = (project: any) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <PropertiesSkeleton />;
  }

  return (
    <div className="container py-6 mx-auto space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Propiedades</h1>
          <p className="text-muted-foreground">
            Gestiona las propiedades del sistema
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddProperty}>
              <Plus className="mr-2 w-4 h-4" />
              Nueva Propiedad
            </Button>
          </DialogTrigger>
          <PropertyFormDialog
            project={editingProject}
            onClose={() => {
              setIsDialogOpen(false);
              setEditingProject(null);
            }}
          />
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Propiedades
            </CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              En Pre-venta
            </CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter((p) => p.status === "PRE_SALE").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              En Construcción
            </CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter((p) => p.status === "IN_CONSTRUCTION").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Propiedades</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Propiedad</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>ROI</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="flex gap-3 items-center">
                        {project.image && (
                          <div className="relative w-12 h-12 rounded-md overflow-hidden">
                            <Image
                              src={project.image}
                              alt={project.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{project.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {project.priceRangeUsd}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 items-center text-sm">
                        <MapPin className="w-3 h-3" />
                        {project.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          project.status === "COMPLETED"
                            ? "default"
                            : project.status === "IN_CONSTRUCTION"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {project.status === "PRE_SALE"
                          ? "Pre-venta"
                          : project.status === "IN_CONSTRUCTION"
                          ? "Construcción"
                          : "Completado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 items-center text-sm">
                        <TrendingUp className="w-3 h-3 text-primary" />
                        {project.roiPct}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${project.progressPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {project.progressPct}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProperty(project)}
                      >
                        <Edit className="mr-1 w-3 h-3" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col justify-center items-center py-12 text-center">
              <Building2 className="mb-4 w-12 h-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                No hay propiedades
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Comienza agregando tu primera propiedad
              </p>
              <Button onClick={handleAddProperty}>
                <Plus className="mr-2 w-4 h-4" />
                Nueva Propiedad
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PropertyFormDialog({
  project,
  onClose,
}: {
  project?: any;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: project?.title || "",
    location: project?.location || "",
    image: project?.image || "",
    status: project?.status || "PRE_SALE",
    roiPct: project?.roiPct || 0,
    progressPct: project?.progressPct || 0,
    priceRangeUsd: project?.priceRangeUsd || "",
    fixedRentPct: project?.fixedRentPct || 0,
    tokensTotal: project?.tokensTotal || 0,
  });

  const createMutation = trpc.admin.properties.create.useMutation();
  const updateMutation = trpc.admin.properties.update.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (project) {
        await updateMutation.mutateAsync({
          id: project.id,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync({
          id: `prop-${Date.now()}`,
          ...formData,
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving property:", error);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {project ? "Editar Propiedad" : "Nueva Propiedad"}
        </DialogTitle>
        <DialogDescription>
          {project
            ? "Actualiza los datos de la propiedad"
            : "Completa los datos de la nueva propiedad"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Ubicación *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">URL de Imagen *</Label>
          <Input
            id="image"
            value={formData.image}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
            placeholder="https://..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Estado *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRE_SALE">Pre-venta</SelectItem>
                <SelectItem value="IN_CONSTRUCTION">Construcción</SelectItem>
                <SelectItem value="COMPLETED">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priceRange">Rango de Precio</Label>
            <Input
              id="priceRange"
              value={formData.priceRangeUsd}
              onChange={(e) =>
                setFormData({ ...formData, priceRangeUsd: e.target.value })
              }
              placeholder="$100K - $500K"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="roiPct">ROI (%) *</Label>
            <Input
              id="roiPct"
              type="number"
              step="0.1"
              value={formData.roiPct}
              onChange={(e) =>
                setFormData({ ...formData, roiPct: parseFloat(e.target.value) })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="progressPct">Progreso (%) *</Label>
            <Input
              id="progressPct"
              type="number"
              step="1"
              min="0"
              max="100"
              value={formData.progressPct}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  progressPct: parseFloat(e.target.value),
                })
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fixedRentPct">Renta Fija (%)</Label>
            <Input
              id="fixedRentPct"
              type="number"
              step="0.1"
              value={formData.fixedRentPct}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fixedRentPct: parseFloat(e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokensTotal">Total de Tokens</Label>
            <Input
              id="tokensTotal"
              type="number"
              value={formData.tokensTotal}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tokensTotal: parseInt(e.target.value),
                })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Guardando..."
              : project
              ? "Actualizar"
              : "Crear"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function PropertiesSkeleton() {
  return (
    <div className="container py-6 mx-auto space-y-6 max-w-7xl">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="w-48 h-8" />
          <Skeleton className="w-64 h-4" />
        </div>
        <Skeleton className="w-40 h-10" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="w-32 h-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-16 h-8" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="w-48 h-5" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-full h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
