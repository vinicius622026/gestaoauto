/**
 * Vehicle Management - CRUD interface for inventory
 */

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  color?: string;
  isAvailable: boolean;
}

export default function VehiclesPage() {
  const { user, loading } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

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

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gerenciar Veículos</h1>
            <p className="text-slate-600 mt-2">Adicione, edite ou remova veículos do seu estoque</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus size={18} />
            Novo Veículo
          </Button>
        </div>

        {/* Add Vehicle Form */}
        {showForm && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>Adicionar Novo Veículo</CardTitle>
              <CardDescription>Preencha os dados do veículo para adicionar ao estoque</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Marca
                    </label>
                    <Input placeholder="Ex: Toyota" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Modelo
                    </label>
                    <Input placeholder="Ex: Corolla" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Ano
                    </label>
                    <Input type="number" placeholder="2024" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Preço (R$)
                    </label>
                    <Input type="number" placeholder="50000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Quilometragem
                    </label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Cor
                    </label>
                    <Input placeholder="Ex: Branco" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Adicionar Veículo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
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
        {filteredVehicles.length === 0 ? (
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
                            R$ {vehicle.price.toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Quilometragem</p>
                          <p className="font-semibold text-slate-900">
                            {vehicle.mileage ? `${vehicle.mileage.toLocaleString("pt-BR")} km` : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Cor</p>
                          <p className="font-semibold text-slate-900">{vehicle.color || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Status</p>
                          <p className={`font-semibold ${vehicle.isAvailable ? "text-green-600" : "text-red-600"}`}>\n                            {vehicle.isAvailable ? "Disponível" : "Vendido"}\n                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="icon">
                        <Edit2 size={18} />
                      </Button>
                      <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700">
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
