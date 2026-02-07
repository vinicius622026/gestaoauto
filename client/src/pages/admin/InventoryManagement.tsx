/**
 * InventoryManagement - Complete vehicle inventory management page
 * Includes vehicle CRUD, image upload, gallery, and responsive design
 */

import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import VehicleForm from "@/components/VehicleForm";
import ImageGallery from "@/components/ImageGallery";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Edit2, Trash2, Plus, Search, Loader2, Image as ImageIcon } from "lucide-react";

type VehicleFormData = {
  make: string;
  model: string;
  year: number;
  price: number;
  color?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  description?: string;
};

export default function InventoryManagementPage() {
  const [showForm, setShowForm] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // tRPC hooks
  const vehiclesQuery = trpc.vehicles.list.useQuery();
  const createVehicleMutation = trpc.vehicles.create.useMutation();
  const updateVehicleMutation = trpc.vehicles.update.useMutation();
  const deleteVehicleMutation = trpc.vehicles.delete.useMutation();
  const uploadImageMutation = trpc.images.upload.useMutation();
  const vehicleImagesQuery = trpc.images.getVehicleImages.useQuery(
    { vehicleId: selectedVehicle?.id || 0 },
    { enabled: !!selectedVehicle?.id }
  );
  const setCoverMutation = trpc.images.setCover.useMutation();
  const deleteImageMutation = trpc.images.delete.useMutation();

  const utils = trpc.useUtils();

  // Filter vehicles by search
  const filteredVehicles = vehiclesQuery.data?.filter(
    (v) =>
      `${v.make} ${v.model}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.year.toString().includes(searchQuery)
  ) || [];

  // Handle form submission
  const handleFormSubmit = async (data: VehicleFormData, imageFiles: File[]) => {
    try {
      let vehicleId: number;

      if (editingId) {
        // Update existing vehicle
        await updateVehicleMutation.mutateAsync({
          id: editingId,
          ...data,
        });
        vehicleId = editingId;
        toast.success("Veículo atualizado com sucesso");
      } else {
        // Create new vehicle
        const result = await createVehicleMutation.mutateAsync(data);
        vehicleId = (result as any).id || selectedVehicle?.id || 0;
        toast.success("Veículo criado com sucesso");
      }

      // Upload images
      if (imageFiles.length > 0) {
        let uploadedCount = 0;
        for (const file of imageFiles) {
          try {
            const buffer = Buffer.from(await file.arrayBuffer());
            await uploadImageMutation.mutateAsync({
              vehicleId,
              file: buffer,
              filename: file.name,
              mimeType: file.type,
              fileSize: file.size,
              setAsCover: uploadedCount === 0, // First image as cover
            });
            uploadedCount++;
          } catch (error) {
            console.error(`Erro ao fazer upload de ${file.name}:`, error);
            toast.error(`Erro ao fazer upload de ${file.name}`);
          }
        }
        toast.success(`${uploadedCount} imagem(ns) enviada(s)`);
      }

      // Reset form and refresh
      setShowForm(false);
      setEditingId(null);
      await utils.vehicles.list.invalidate();
    } catch (error) {
      console.error("Erro ao salvar veículo:", error);
      toast.error("Erro ao salvar veículo");
    }
  };

  // Handle delete vehicle
  const handleDeleteVehicle = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover este veículo?")) {
      return;
    }

    try {
      await deleteVehicleMutation.mutateAsync({ id });
      toast.success("Veículo removido com sucesso");
      await utils.vehicles.list.invalidate();
    } catch (error) {
      console.error("Erro ao remover veículo:", error);
      toast.error("Erro ao remover veículo");
    }
  };

  // Handle edit vehicle
  const handleEditVehicle = (vehicle: any) => {
    setEditingId(vehicle.id);
    setSelectedVehicle(vehicle);
    setShowForm(true);
  };

  // Handle set cover image
  const handleSetCover = async (imageId: number) => {
    if (!selectedVehicle) return;

    try {
      await setCoverMutation.mutateAsync({
        imageId,
        vehicleId: selectedVehicle.id,
      });
      await utils.images.getVehicleImages.invalidate({
        vehicleId: selectedVehicle.id,
      });
    } catch (error) {
      console.error("Erro ao definir capa:", error);
      throw error;
    }
  };

  // Handle delete image
  const handleDeleteImage = async (imageId: number) => {
    if (!selectedVehicle) return;

    try {
      await deleteImageMutation.mutateAsync({
        imageId,
        vehicleId: selectedVehicle.id,
      });
      await utils.images.getVehicleImages.invalidate({
        vehicleId: selectedVehicle.id,
      });
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
      throw error;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestão de Estoque</h1>
            <p className="text-slate-600 mt-1">
              Gerenciar veículos, imagens e informações do catálogo
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              setSelectedVehicle(null);
              setShowForm(true);
            }}
            className="gap-2"
          >
            <Plus size={18} />
            Adicionar Veículo
          </Button>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <Input
                placeholder="Buscar por marca, modelo ou ano..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Veículos Cadastrados</CardTitle>
            <CardDescription>
              {filteredVehicles.length} veículo(s) no estoque
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vehiclesQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">Nenhum veículo cadastrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Ano</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">
                          {vehicle.make} {vehicle.model}
                        </TableCell>
                        <TableCell>{vehicle.year}</TableCell>
                        <TableCell>
                          R$ {(typeof vehicle.price === "number" ? vehicle.price : Number(vehicle.price)).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={vehicle.isAvailable ? "default" : "secondary"}
                          >
                            {vehicle.isAvailable ? "Disponível" : "Indisponível"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedVehicle(vehicle);
                                setShowGallery(true);
                              }}
                              className="gap-1"
                            >
                              <ImageIcon size={16} />
                              <span className="hidden sm:inline">Fotos</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditVehicle(vehicle)}
                              className="gap-1"
                            >
                              <Edit2 size={16} />
                              <span className="hidden sm:inline">Editar</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                              className="gap-1"
                            >
                              <Trash2 size={16} />
                              <span className="hidden sm:inline">Remover</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Veículo" : "Adicionar Novo Veículo"}
            </DialogTitle>
          </DialogHeader>
          <VehicleForm
            initialData={selectedVehicle}
            onSubmit={handleFormSubmit}
            isLoading={
              createVehicleMutation.isPending ||
              updateVehicleMutation.isPending ||
              uploadImageMutation.isPending
            }
            title={editingId ? "Editar Veículo" : "Adicionar Veículo"}
          />
        </DialogContent>
      </Dialog>

      {/* Gallery Dialog */}
          <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Galeria - {selectedVehicle?.make || ""} {selectedVehicle?.model || ""}
            </DialogTitle>
          </DialogHeader>
          {vehicleImagesQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
          ) : (
            <ImageGallery
              images={vehicleImagesQuery.data || []}
              onSetCover={handleSetCover}
              onDelete={handleDeleteImage}
              isLoading={setCoverMutation.isPending || deleteImageMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
