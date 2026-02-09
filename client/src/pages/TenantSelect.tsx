import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { navigateToTenant } from "@/hooks/useTenant";
import { Loader2, Car, LogOut, Building2 } from "lucide-react";

interface Tenant {
  id: number;
  subdomain: string;
  name: string;
  role: "admin" | "user";
}

export default function TenantSelect() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, loading, setLocation]);

  // Load tenant data
  useEffect(() => {
    if (user && isAuthenticated) {
      // Mock tenant data - in production, this would come from an API
      const mockTenants: Tenant[] = [
        {
          id: 1,
          subdomain: "premium",
          name: "Concessionária Premium",
          role: "admin",
        },
        {
          id: 2,
          subdomain: "centro",
          name: "Loja Centro",
          role: "user",
        },
        {
          id: 3,
          subdomain: "sul",
          name: "Filial Sul",
          role: "user",
        },
      ];

      setTenants(mockTenants);
      setIsLoadingTenants(false);
    }
  }, [user, isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const handleSelectTenant = (subdomain: string) => {
    navigateToTenant(subdomain, "/dashboard");
  };

  if (loading || isLoadingTenants) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">AutoGestão Pro</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.name || user?.email}</p>
              <p className="text-xs text-slate-400">Selecione uma concessionária</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">Minhas Concessionárias</h2>
          <p className="text-slate-400">Selecione uma concessionária para continuar</p>
        </div>

        {/* Tenants grid */}
        {tenants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant) => (
              <Card
                key={tenant.id}
                className="bg-slate-800/50 border-slate-700 hover:border-blue-500 hover:bg-slate-800 transition cursor-pointer group"
                onClick={() => handleSelectTenant(tenant.subdomain)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-3 bg-blue-600/20 rounded-lg group-hover:bg-blue-600/30 transition">
                        <Building2 className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">
                          {tenant.name}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {tenant.subdomain}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Função:</span>
                      <span className="text-sm font-medium text-white capitalize">
                        {tenant.role === "admin" ? "Administrador" : "Usuário"}
                      </span>
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTenant(tenant.subdomain);
                      }}
                    >
                      Acessar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-12 pb-12 text-center">
              <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">Nenhuma concessionária disponível</p>
              <p className="text-sm text-slate-500 mt-2">
                Entre em contato com o administrador para obter acesso
              </p>
            </CardContent>
          </Card>
        )}

        {/* Info section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/30 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Dica</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Você pode acessar cada concessionária através de seu subdomínio específico.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Suporte</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Precisa de ajuda? Entre em contato com o suporte técnico.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                Seus dados estão isolados e seguros em cada concessionária.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
