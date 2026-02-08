import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Package, MessageCircle, DollarSign } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import AdminLayout from "@/components/AdminLayout";

/**
 * Dealership Dashboard
 * Displays key metrics for lojista including:
 * - Total vehicles in stock
 * - Total inventory value
 * - WhatsApp clicks/leads
 * - Vehicle distribution by fuel type and body type
 * - Price range statistics
 */

export default function DealershipDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  // Fetch metrics from tRPC
  const metricsQuery = trpc.metrics.getDealershipMetrics.useQuery();
  const fuelTypeQuery = trpc.metrics.getVehiclesByFuelType.useQuery();
  const bodyTypeQuery = trpc.metrics.getVehiclesByBodyType.useQuery();
  const priceStatsQuery = trpc.metrics.getPriceRangeStats.useQuery();

  const isLoading = metricsQuery.isLoading || fuelTypeQuery.isLoading || bodyTypeQuery.isLoading || priceStatsQuery.isLoading;

  // Prepare data for charts
  const fuelTypeData = fuelTypeQuery.data?.map((item) => ({
    name: item.fuelType || "Sem informação",
    value: item.count || 0,
  })) || [];

  const bodyTypeData = bodyTypeQuery.data?.map((item) => ({
    name: item.bodyType || "Sem informação",
    value: item.count || 0,
  })) || [];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      </AdminLayout>
    );
  }

  const metrics = metricsQuery.data;

  return (
    <AdminLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard de Operações</h1>
          <p className="text-slate-600 mt-1">Acompanhe o desempenho da sua loja em tempo real</p>
        </div>
        <div className="flex gap-2">
          {(["week", "month", "year"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === period
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {period === "week" ? "Semana" : period === "month" ? "Mês" : "Ano"}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vehicles */}
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Package size={18} className="text-blue-600" />
              Veículos em Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{metrics?.totalVehicles || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Carros disponíveis para venda</p>
          </CardContent>
        </Card>

        {/* Inventory Value */}
        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <DollarSign size={18} className="text-green-600" />
              Valor Total do Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              R$ {(metrics?.totalInventoryValue || 0).toLocaleString("pt-BR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-xs text-slate-500 mt-1">Valor total dos veículos</p>
          </CardContent>
        </Card>

        {/* WhatsApp Clicks */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <MessageCircle size={18} className="text-green-500" />
              Cliques no WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{metrics?.whatsappClicks || 0}</p>
            <p className="text-xs text-slate-500 mt-1">
              {metrics?.whatsappClicksThisMonth || 0} este mês
            </p>
          </CardContent>
        </Card>

        {/* Avg Price */}
        <Card className="border-l-4 border-l-purple-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <TrendingUp size={18} className="text-purple-600" />
              Preço Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              R$ {(priceStatsQuery.data?.avgPrice || 0).toLocaleString("pt-BR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              De R$ {(priceStatsQuery.data?.minPrice || 0).toLocaleString("pt-BR", {
                minimumFractionDigits: 0,
              })} a R$ {(priceStatsQuery.data?.maxPrice || 0).toLocaleString("pt-BR", {
                minimumFractionDigits: 0,
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Combustível</CardTitle>
          </CardHeader>
          <CardContent>
            {fuelTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={fuelTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {fuelTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 py-8">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>

        {/* Body Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Carroceria</CardTitle>
          </CardHeader>
          <CardContent>
            {bodyTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bodyTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 py-8">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      {metrics?.recentLeads && metrics.recentLeads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Leads Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.recentLeads.slice(0, 5).map((lead, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{lead.vehicleName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(lead.clickedAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <MessageCircle size={18} className="text-green-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </AdminLayout>
  );
}
