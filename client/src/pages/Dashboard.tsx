import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogOut, Car, Users, FileText, Settings } from "lucide-react";

interface Tenant {
  id: number;
  name: string;
  subdomain: string;
  logoUrl?: string;
}

interface UserProfile {
  tenantId: number;
  tenantName: string;
  role: "admin" | "user";
  isActive: boolean;
}

export default function Dashboard() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, loading, setLocation]);

  // Load user data
  useEffect(() => {
    if (user && isAuthenticated) {
      // For now, create mock data
      const mockProfiles: UserProfile[] = [
        {
          tenantId: 1,
          tenantName: "Concessionária Premium",
          role: "admin",
          isActive: true,
        },
        {
          tenantId: 2,
          tenantName: "Loja Centro",
          role: "user",
          isActive: false,
        },
      ];

      const mockTenant: Tenant = {
        id: 1,
        name: "Concessionária Premium",
        subdomain: "premium",
      };

      setUserProfiles(mockProfiles);
      setActiveTenant(mockTenant);
      setIsLoadingData(false);
    }
  }, [user, isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  if (loading || isLoadingData) {
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
            <div>
              <h1 className="text-xl font-bold text-white">AutoGestão Pro</h1>
              <p className="text-sm text-slate-400">{activeTenant?.name || "Dashboard"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.name || user?.email}</p>
              <p className="text-xs text-slate-400">Administrador</p>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo ao Dashboard</h2>
          <p className="text-slate-400">Gerencie sua concessionária de carros com facilidade</p>
        </div>

        {/* Quick actions grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-500" />
                Veículos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">24</p>
              <p className="text-sm text-slate-400">Em estoque</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">8</p>
              <p className="text-sm text-slate-400">Ativos</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                Anúncios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">5</p>
              <p className="text-sm text-slate-400">Publicados</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-500" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">Gerencie sua loja</p>
            </CardContent>
          </Card>
        </div>

        {/* Tenant switcher */}
        {userProfiles.length > 1 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Minhas Concessionárias</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userProfiles.map((profile) => (
                <Card
                  key={profile.tenantId}
                  className={`bg-slate-800/50 border transition cursor-pointer ${
                    profile.isActive
                      ? "border-blue-500 bg-slate-800"
                      : "border-slate-700 hover:bg-slate-800"
                  }`}
                  onClick={() => {
                    if (!profile.isActive) {
                      setActiveTenant({
                        id: profile.tenantId,
                        name: profile.tenantName,
                        subdomain: profile.tenantName.toLowerCase().replace(/\s+/g, "-"),
                      });
                    }
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-white">{profile.tenantName}</CardTitle>
                    <CardDescription className="text-slate-400">
                      Função: {profile.role === "admin" ? "Administrador" : "Usuário"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profile.isActive && (
                      <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                        Ativo
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent activity */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Atividade Recente</CardTitle>
            <CardDescription className="text-slate-400">
              Últimas ações na sua concessionária
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div>
                  <p className="text-white font-medium">Novo veículo adicionado</p>
                  <p className="text-sm text-slate-400">Toyota Corolla 2024</p>
                </div>
                <p className="text-sm text-slate-500">Há 2 horas</p>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div>
                  <p className="text-white font-medium">Usuário criado</p>
                  <p className="text-sm text-slate-400">João Silva</p>
                </div>
                <p className="text-sm text-slate-500">Ontem</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Anúncio publicado</p>
                  <p className="text-sm text-slate-400">Promoção de verão</p>
                </div>
                <p className="text-sm text-slate-500">2 dias atrás</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
