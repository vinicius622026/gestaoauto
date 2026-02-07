import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, ToggleLeft, ToggleRight, Building2, Users, Package, MessageCircle } from "lucide-react";
import { toast } from "sonner";

/**
 * SaaS Admin Dashboard
 * Platform admin interface for managing tenants and subscriptions
 * Only accessible to users with role === "admin"
 */

export default function SaaSAdmin() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    subdomain: "",
    name: "",
    email: "",
    phone: "",
  });

  // Fetch platform statistics
  const statsQuery = trpc.admin.getPlatformStats.useQuery();
  const tenantsQuery = trpc.admin.getAllTenants.useQuery();

  // Mutations
  const createTenantMutation = trpc.admin.createTenant.useMutation({
    onSuccess: () => {
      toast.success("Tenant criado com sucesso!");
      setFormData({ subdomain: "", name: "", email: "", phone: "" });
      setShowCreateForm(false);
      tenantsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const toggleTenantMutation = trpc.admin.toggleTenantStatus.useMutation({
    onSuccess: () => {
      toast.success("Status do tenant atualizado!");
      tenantsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subdomain || !formData.name) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    createTenantMutation.mutate(formData);
  };

  const stats = statsQuery.data;
  const tenants = tenantsQuery.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Administração SaaS</h1>
          <p className="text-slate-600 mt-1">Gerencie tenants, assinaturas e métricas da plataforma</p>
        </div>
      </div>

      {/* Platform Statistics */}
      {statsQuery.isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Building2 size={18} className="text-blue-600" />
                Total de Tenants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalTenants || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats?.activeTenants || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Package size={18} className="text-orange-600" />
                Veículos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalVehicles || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <MessageCircle size={18} className="text-green-500" />
                Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalLeads || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Users size={18} className="text-purple-600" />
                Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalUsers || 0}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Tenant Form */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Criar Novo Tenant</CardTitle>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="gap-2"
              size="sm"
            >
              <Plus size={16} />
              {showCreateForm ? "Cancelar" : "Novo Tenant"}
            </Button>
          </div>
        </CardHeader>
        {showCreateForm && (
          <CardContent>
            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Subdomínio *
                  </label>
                  <Input
                    type="text"
                    placeholder="loja-a"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                    disabled={createTenantMutation.isPending}
                  />
                  <p className="text-xs text-slate-500 mt-1">Será acessível em: loja-a.autogestao.com.br</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nome da Loja *
                  </label>
                  <Input
                    type="text"
                    placeholder="Loja A Veículos"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={createTenantMutation.isPending}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="contato@loja.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={createTenantMutation.isPending}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Telefone
                  </label>
                  <Input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={createTenantMutation.isPending}
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={createTenantMutation.isPending}
                className="w-full"
              >
                {createTenantMutation.isPending && <Loader2 className="animate-spin mr-2" size={16} />}
                Criar Tenant
              </Button>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Tenants List */}
      <Card>
        <CardHeader>
          <CardTitle>Tenants Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {tenantsQuery.isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : tenants.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Nenhum tenant cadastrado</p>
          ) : (
            <div className="space-y-2">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{tenant.name}</h3>
                    <p className="text-sm text-slate-600">{tenant.subdomain}.autogestao.com.br</p>
                    {tenant.email && <p className="text-xs text-slate-500">{tenant.email}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        tenant.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tenant.isActive ? "Ativo" : "Inativo"}
                    </span>
                    <button
                      onClick={() =>
                        toggleTenantMutation.mutate({
                          tenantId: tenant.id,
                          isActive: !tenant.isActive,
                        })
                      }
                      disabled={toggleTenantMutation.isPending}
                      className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      {tenant.isActive ? (
                        <ToggleRight size={20} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={20} className="text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
