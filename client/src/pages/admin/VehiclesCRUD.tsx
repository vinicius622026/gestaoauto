/**
 * Vehicle Management with CRUD operations and image upload
 */

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, Search, Upload, X } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";

interface FormData {
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
  imageUrl?: string;
}

const initialFormData: FormData = {
  make: "",
  model: "",
  year: new Date().getFullYear(),
  price: 0,
};

export default function VehiclesCRUDPage() {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // tRPC queries and mutations
  const vehiclesQuery = trpc.vehicles.listAdmin.useQuery();
  const utils = trpc.useUtils();
  const createMutation = trpc.vehicles.create.useMutation({
    onSuccess: () => {
      toast.success("Veículo adicionado com sucesso!");
      utils.vehicles.listAdmin.invalidate();
      setFormData(initialFormData);
      setImageFile(null);
      setImagePreview("");
      setShowForm(false);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
  const updateMutation = trpc.vehicles.update.useMutation({
    onSuccess: () => {
      toast.success("Veículo atualizado com sucesso!");
      utils.vehicles.listAdmin.invalidate();
      setFormData(initialFormData);
      setImageFile(null);
      setImagePreview("");
      setShowForm(false);
      setEditingId(null);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
  const deleteMutation = trpc.vehicles.delete.useMutation({
    onSuccess: () => {
      toast.success("Veículo removido com sucesso!");
      utils.vehicles.listAdmin.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Carregando...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Você precisa estar autenticado para acessar esta área.</p>
        </div>
      </AdminLayout>
    );
  }

  const vehicles = vehiclesQuery.data || [];
  const filteredVehicles = vehicles.filter(
    (v) =>
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.make || !formData.model || formData.year === 0 || formData.price === 0) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const submitData = {
      ...formData,
      year: parseInt(formData.year.toString()),
      price: parseFloat(formData.price.toString()),
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (vehicle: any) => {
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      color: vehicle.color,
      mileage: vehicle.mileage,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      bodyType: vehicle.bodyType,
      description: vehicle.description,
      imageUrl: vehicle.imageUrl,
    });
    setImagePreview(vehicle.imageUrl || "");
    setEditingId(vehicle.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este veículo?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gerenciar Veículos</h1>
            <p className="text-slate-600 mt-2">Adicione, edite ou remova veículos do seu estoque</p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              setFormData(initialFormData);
              setImageFile(null);
              setImagePreview("");
              setShowForm(!showForm);
            }}
            className="gap-2"
          >
            <Plus size={18} />
            Novo Veículo
          </Button>
        </div>

        {/* Add/Edit Vehicle Form */}
        {showForm && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>{editingId ? "Editar Veículo" : "Adicionar Novo Veículo"}</CardTitle>
              <CardDescription>
                {editingId ? "Atualize os dados do veículo" : "Preencha os dados do veículo para adicionar ao estoque"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Marca *
                    </label>
                    <Input
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      placeholder="Ex: Toyota"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Modelo *
                    </label>
                    <Input
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="Ex: Corolla"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Ano *
                    </label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      placeholder="2024"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Preço (R$) *
                    </label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      placeholder="50000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Quilometragem
                    </label>
                    <Input
                      type="number"
                      value={formData.mileage || ""}
                      onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || undefined })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Cor
                    </label>
                    <Input
                      value={formData.color || ""}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="Ex: Branco"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Combustível
                    </label>
                    <Input
                      value={formData.fuelType || ""}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      placeholder="Ex: Gasolina"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Câmbio
                    </label>
                    <Input
                      value={formData.transmission || ""}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      placeholder="Ex: Automático"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Tipo de Carroceria
                  </label>
                  <Input
                    value={formData.bodyType || ""}
                    onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                    placeholder="Ex: Sedan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Descrição
                  </label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o veículo..."
                    rows={4}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Imagem Principal
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="h-40 mx-auto mb-4 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview("");
                          }}
                          className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto mb-2 text-slate-400" size={32} />
                        <p className="text-slate-500 mb-2">Clique para fazer upload</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1">
                    {editingId ? "Atualizar Veículo" : "Adicionar Veículo"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData(initialFormData);
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <Input
            placeholder="Buscar por marca ou modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Vehicles List */}
        {vehiclesQuery.isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Carregando veículos...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-slate-500 text-lg">
                  {vehicles.length === 0
                    ? "Nenhum veículo adicionado ainda"
                    : "Nenhum veículo encontrado"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-slate-600">Preço</p>
                          <p className="font-semibold text-slate-900">
                            R$ {Number(vehicle.price).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Quilometragem</p>
                          <p className="font-semibold text-slate-900">
                            {vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString("pt-BR")} km` : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Cor</p>
                          <p className="font-semibold text-slate-900">{vehicle.color || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Status</p>
                          <p className={`font-semibold ${vehicle.isAvailable ? "text-green-600" : "text-red-600"}`}>
                            {vehicle.isAvailable ? "Disponível" : "Vendido"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(vehicle)}
                      >
                        <Edit2 size={18} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(vehicle.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
