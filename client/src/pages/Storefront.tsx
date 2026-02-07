/**
 * Public Storefront - Display vehicles for customers
 * Accessible via tenant subdomain
 */

import { useState } from "react";
import { useTenant } from "@/_core/hooks/useTenant";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Mail, Search, Filter, ChevronRight } from "lucide-react";

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  color?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  imageUrl?: string;
  isAvailable: boolean;
}

export default function StorefrontPage() {
  const { subdomain } = useTenant();
  const tenantQuery = trpc.auth.getTenant.useQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterPrice, setFilterPrice] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const tenant = tenantQuery.data;

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear = !filterYear || v.year.toString() === filterYear;
    const matchesPrice = !filterPrice || v.price <= parseInt(filterPrice);

    return matchesSearch && matchesYear && matchesPrice && v.isAvailable;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Store Info */}
      <header className="bg-slate-900 text-white">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold">{tenant?.name || "AutoGestão"}</h1>
              <p className="text-slate-300 mt-2">{tenant?.description || "Encontre o veículo perfeito"}</p>
            </div>
            {tenant?.logoUrl && (
              <img src={tenant.logoUrl} alt="Logo" className="h-16 w-16 object-cover rounded" />
            )}
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {tenant?.address && (
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>
                  {tenant.address}
                  {tenant.city && `, ${tenant.city}`}
                  {tenant.state && ` - ${tenant.state}`}
                </span>
              </div>
            )}
            {tenant?.phone && (
              <div className="flex items-center gap-2">
                <Phone size={18} />
                <a href={`tel:${tenant.phone}`} className="hover:text-blue-300">
                  {tenant.phone}
                </a>
              </div>
            )}
            {tenant?.email && (
              <div className="flex items-center gap-2">
                <Mail size={18} />
                <a href={`mailto:${tenant.email}`} className="hover:text-blue-300">
                  {tenant.email}
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search and Filter Section */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Buscar Veículos</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <Input
                placeholder="Marca ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div>
              <Input
                type="number"
                placeholder="Ano mínimo"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              />
            </div>

            <div>
              <Input
                type="number"
                placeholder="Preço máximo"
                value={filterPrice}
                onChange={(e) => setFilterPrice(e.target.value)}
              />
            </div>

            <Button className="w-full">
              <Filter size={18} className="mr-2" />
              Filtrar
            </Button>
          </div>
        </div>
      </section>

      {/* Vehicles Grid */}
      <section className="container max-w-7xl mx-auto px-4 py-12">
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-600 text-lg mb-4">
              {vehicles.length === 0
                ? "Nenhum veículo disponível no momento"
                : "Nenhum veículo encontrado com os filtros selecionados"}
            </p>
            {vehicles.length > 0 && (
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setFilterYear("");
                  setFilterPrice("");
                }}
                variant="outline"
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="text-slate-600 mb-6">
              Mostrando {filteredVehicles.length} de {vehicles.length} veículos
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <Card
                  key={vehicle.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  {/* Image */}
                  <div className="relative bg-slate-200 h-48 overflow-hidden">
                    {vehicle.imageUrl ? (
                      <img
                        src={vehicle.imageUrl}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-slate-400">Sem imagem</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      R$ {vehicle.price.toLocaleString("pt-BR")}
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="pt-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      {vehicle.mileage !== undefined && (
                        <div className="text-slate-600">
                          <p className="text-xs text-slate-500">Quilometragem</p>
                          <p className="font-semibold">{vehicle.mileage.toLocaleString("pt-BR")} km</p>
                        </div>
                      )}
                      {vehicle.color && (
                        <div className="text-slate-600">
                          <p className="text-xs text-slate-500">Cor</p>
                          <p className="font-semibold">{vehicle.color}</p>
                        </div>
                      )}
                      {vehicle.fuelType && (
                        <div className="text-slate-600">
                          <p className="text-xs text-slate-500">Combustível</p>
                          <p className="font-semibold">{vehicle.fuelType}</p>
                        </div>
                      )}
                      {vehicle.transmission && (
                        <div className="text-slate-600">
                          <p className="text-xs text-slate-500">Câmbio</p>
                          <p className="font-semibold">{vehicle.transmission}</p>
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Button className="w-full group/btn">
                      Ver Detalhes
                      <ChevronRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-16">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Sobre</h4>
              <p className="text-slate-400 text-sm">{tenant?.description || "Encontre o veículo perfeito para você"}</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contato</h4>
              <div className="text-slate-400 text-sm space-y-2">
                {tenant?.phone && <p>{tenant.phone}</p>}
                {tenant?.email && <p>{tenant.email}</p>}
                {tenant?.address && <p>{tenant.address}</p>}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Horário</h4>
              <p className="text-slate-400 text-sm">Segunda a Sexta: 9h - 18h</p>
              <p className="text-slate-400 text-sm">Sábado: 9h - 13h</p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 {tenant?.name || "AutoGestão"}. Todos os direitos reservados.</p>
            <p className="mt-2">Powered by AutoGestão Pro</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
