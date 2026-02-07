/**
 * Store Settings - Configure store information and branding
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { useState } from "react";

export default function StoreSettingsPage() {
  const { user, loading } = useAuth();
  const tenantQuery = trpc.auth.getTenant.useQuery();
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Implement save functionality with tRPC mutation
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Configurações da Loja</h1>
          <p className="text-slate-600 mt-2">Gerencie as informações e branding da sua loja</p>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Dados principais da sua loja</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Nome da Loja
                </label>
                <Input defaultValue={tenant?.name || ""} placeholder="Nome da sua loja" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Subdomínio
                </label>
                <Input disabled defaultValue={tenant?.subdomain || ""} className="bg-slate-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  defaultValue={tenant?.email || ""}
                  placeholder="contato@loja.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Telefone
                </label>
                <Input defaultValue={tenant?.phone || ""} placeholder="(11) 99999-9999" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Descrição
              </label>
              <Textarea
                defaultValue={tenant?.description || ""}
                placeholder="Descreva sua loja..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
            <CardDescription>Localização da sua loja</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Endereço
              </label>
              <Input
                defaultValue={tenant?.address || ""}
                placeholder="Rua, número, complemento"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Cidade
                </label>
                <Input defaultValue={tenant?.city || ""} placeholder="São Paulo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Estado
                </label>
                <Input defaultValue={tenant?.state || ""} placeholder="SP" maxLength={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  CEP
                </label>
                <Input placeholder="00000-000" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Personalize a aparência da sua loja</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Logo da Loja
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                {tenant?.logoUrl ? (
                  <img
                    src={tenant.logoUrl}
                    alt="Logo"
                    className="h-20 mx-auto mb-4"
                  />
                ) : (
                  <p className="text-slate-500">Nenhuma logo enviada</p>
                )}
                <Button variant="outline" className="mt-4">
                  Fazer Upload
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Website
              </label>
              <Input
                type="url"
                defaultValue={tenant?.website || ""}
                placeholder="https://www.sualojas.com.br"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8"
          >
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
          <Button variant="outline">Cancelar</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
