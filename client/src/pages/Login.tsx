import React, { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";
import { LogOut, ArrowLeft, Search, LogIn } from "lucide-react";

type LoginPhase = "tenant-selection" | "oauth-login" | "profile-selection";

interface Tenant {
  id: number;
  subdomain: string;
  name: string;
  description?: string;
  logoUrl?: string;
  city?: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface Profile {
  id: number;
  userId: number;
  tenantId: number;
  role: "owner" | "manager" | "viewer";
  isActive: boolean;
  tenant: Tenant | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface LoginState {
  phase: LoginPhase;
  selectedTenant?: Tenant;
  userProfiles?: Profile[];
  isLoading: boolean;
  error?: string;
}

const STORAGE_KEY = "ag:selectedTenant";

export default function LoginPage() {
  const [state, setState] = useState<LoginState>({ phase: "tenant-selection", isLoading: false });
  const [searchQuery, setSearchQuery] = useState("");

  const tenantsQuery = trpc.authLogin.listTenants.useQuery(undefined, { retry: 1 });
  const profilesQuery = trpc.authLogin.getUserProfiles.useQuery(undefined, { enabled: state.phase === "profile-selection" });

  useEffect(() => {
    // preload selected tenant from localStorage
    const sub = localStorage.getItem(STORAGE_KEY);
    if (sub && tenantsQuery.data) {
      const t = tenantsQuery.data.find((x: Tenant) => x.subdomain === sub);
      if (t) setState((s) => ({ ...s, selectedTenant: t }));
    }
  }, [tenantsQuery.data]);

  useEffect(() => {
    if (profilesQuery.data && profilesQuery.data.length > 0) {
      setState((s) => ({ ...s, userProfiles: profilesQuery.data as Profile[] }));
    }
  }, [profilesQuery.data]);

  const filteredTenants = useMemo(() => {
    const list = tenantsQuery.data ?? [];
    if (!searchQuery) return list as Tenant[];
    const q = searchQuery.toLowerCase();
    return (list as Tenant[]).filter(
      (t) => t.name.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q) || (t.city ?? "").toLowerCase().includes(q)
    );
  }, [tenantsQuery.data, searchQuery]);

  async function handleSelectTenant(t: Tenant) {
    setState((s) => ({ ...s, selectedTenant: t, phase: "oauth-login" }));
    try {
      localStorage.setItem(STORAGE_KEY, t.subdomain);
    } catch (err) {
      // ignore
    }
  }

  function handleBackToSelection() {
    setState({ phase: "tenant-selection", isLoading: false });
  }

  const loginUrlQuery = trpc.authLogin.getLoginUrl.useQuery(
    { tenantSubdomain: state.selectedTenant?.subdomain ?? "", returnPath: "/admin" },
    { enabled: false }
  );

  async function handleOAuthLogin() {
    if (!state.selectedTenant) return;
    try {
      const res = await loginUrlQuery.refetch();
      const url = res.data?.loginUrl;
      if (url) window.location.href = url;
    } catch (err: any) {
      setState((s) => ({ ...s, error: err?.message ?? "Erro ao gerar URL de login" }));
    }
  }

  const selectProfileMutation = trpc.authLogin.selectProfile.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  async function handleSelectProfile(profileId: number) {
    try {
      const res = await selectProfileMutation.mutateAsync({ profileId });
      if (res?.redirectUrl) window.location.href = res.redirectUrl;
    } catch (err: any) {
      setState((s) => ({ ...s, error: err?.message ?? "Erro ao selecionar perfil" }));
    }
  }

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
      setState({ phase: "tenant-selection", isLoading: false });
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 p-4 flex items-start justify-center">
      <div className="w-full max-w-6xl">
        {state.phase === "tenant-selection" && (
          <section>
            <h1 className="text-2xl font-semibold mb-4">🔐 AutoGestão Pro - Escolha sua Loja</h1>

            <div className="mb-4 flex gap-2">
              <Input
                placeholder="Buscar loja..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                icon={<Search />}
              />
            </div>

            {tenantsQuery.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-4 h-40">
                    <Skeleton className="h-10 w-28 mb-2" />
                    <Skeleton className="h-6 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </Card>
                ))}
              </div>
            ) : tenantsQuery.error ? (
              <div className="p-4 bg-red-50 border border-red-100 rounded-md">Erro ao carregar lojas. Tente novamente.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTenants.map((t: Tenant) => (
                  <Card
                    key={t.id}
                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
                    onClick={() => handleSelectTenant(t)}
                  >
                    <div className="flex items-center gap-3">
                      <img src={t.logoUrl ?? '/logo-placeholder.png'} alt={t.name} className="h-12 w-12 object-cover rounded" />
                      <div>
                        <div className="font-medium">{t.name}</div>
                        <div className="text-sm text-gray-500">{t.city ?? ""}</div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-600 line-clamp-3">{t.description}</p>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {state.phase === "oauth-login" && state.selectedTenant && (
          <section className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" onClick={handleBackToSelection}>
                <ArrowLeft className="mr-2" /> Voltar
              </Button>
            </div>

            <Card className="p-8 flex flex-col items-center text-center">
              <img src={state.selectedTenant.logoUrl ?? '/logo-placeholder.png'} alt={state.selectedTenant.name} className="h-28 w-28 rounded mb-4 object-cover" />
              <h2 className="text-xl font-semibold">{state.selectedTenant.name}</h2>
              <p className="text-sm text-gray-600 mt-2">{state.selectedTenant.description}</p>

              <div className="mt-6 w-full max-w-sm">
                <Button variant="default" size="lg" className="w-full" onClick={handleOAuthLogin}>
                  <LogIn className="mr-2" /> Entrar com Manus
                </Button>
                <Button variant="outline" size="default" className="w-full mt-2" onClick={handleBackToSelection}>
                  Voltar
                </Button>
                <p className="text-xs text-gray-500 mt-3">Você será redirecionado para autenticação segura.</p>
              </div>
            </Card>
          </section>
        )}

        {state.phase === "profile-selection" && (
          <section className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">🔐 Selecione seu Perfil</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setState({ phase: "tenant-selection", isLoading: false })}>
                  Trocar loja
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2" /> Logout
                </Button>
              </div>
            </div>

            {profilesQuery.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4 h-36">
                    <Skeleton className="h-12 w-12 mb-2" />
                    <Skeleton className="h-6 w-2/3 mb-1" />
                    <Skeleton className="h-4 w-1/3" />
                  </Card>
                ))}
              </div>
            ) : profilesQuery.error ? (
              <div className="p-4 bg-red-50 border border-red-100 rounded-md">Erro ao carregar perfis. Tente novamente.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(state.userProfiles ?? []).map((p) => (
                  <Card key={p.id} className="p-4 flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <img src={p.tenant?.logoUrl ?? '/logo-placeholder.png'} alt={p.tenant?.name ?? ''} className="h-12 w-12 object-cover rounded" />
                      <div>
                        <div className="font-medium">{p.tenant?.name}</div>
                        <div className="text-sm text-gray-500">{p.tenant?.subdomain}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant={p.role === 'owner' ? 'secondary' : p.role === 'manager' ? 'default' : 'outline'}>
                        {p.role}
                      </Badge>
                      <Button size="sm" onClick={() => handleSelectProfile(p.id)}>Entrar</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* If user is authenticated and has profiles we should switch to profile-selection -- try to detect */}
        {profilesQuery.data && profilesQuery.data.length > 0 && state.phase !== "profile-selection" && (
          <div className="mt-6">
            <Button onClick={() => setState((s) => ({ ...s, phase: "profile-selection", userProfiles: profilesQuery.data as Profile[] }))}>
              Continuar com perfis
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
