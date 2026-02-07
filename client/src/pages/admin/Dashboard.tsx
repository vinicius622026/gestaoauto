/**
 * Admin Dashboard - Overview of store performance and inventory
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { useTenant } from "@/_core/hooks/useTenant";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Car, Users, TrendingUp, AlertCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const { subdomain } = useTenant();
  const tenantQuery = trpc.auth.getTenant.useQuery();

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

  const tenant = tenantQuery.data;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2">
            Bem-vindo de volta, {user.name || user.email}!
          </p>
        </div>

        {/* Store Info */}
        {tenant && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="text-blue-600" size={20} />
                Informações da Loja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Nome da Loja</p>
                  <p className="font-semibold text-slate-900">{tenant.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Subdomínio</p>
                  <p className="font-semibold text-slate-900">{tenant.subdomain}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-semibold text-slate-900">{tenant.email || "Não configurado"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Telefone</p>
                  <p className="font-semibold text-slate-900">{tenant.phone || "Não configurado"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Car className="text-blue-600" size={18} />
                Veículos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">0</p>
              <p className="text-xs text-slate-500 mt-1">No estoque</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <TrendingUp className="text-green-600" size={18} />
                Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">0</p>
              <p className="text-xs text-slate-500 mt-1">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Users className="text-purple-600" size={18} />
                Visitantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">0</p>
              <p className="text-xs text-slate-500 mt-1">Esta semana</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">R$ 0</p>
              <p className="text-xs text-slate-500 mt-1">Este mês</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse rapidamente as funcionalidades principais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/admin/vehicles"
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Car className="text-blue-600" size={24} />
                  <div>
                    <p className="font-semibold text-slate-900">Gerenciar Veículos</p>
                    <p className="text-sm text-slate-600">Adicionar, editar ou remover veículos</p>
                  </div>
                </div>
              </a>

              <a
                href="/admin/store"
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-green-600" size={24} />
                  <div>
                    <p className="font-semibold text-slate-900">Configurar Loja</p>
                    <p className="text-sm text-slate-600">Atualizar informações da loja</p>
                  </div>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
