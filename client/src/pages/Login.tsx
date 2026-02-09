import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTenantContext } from "@/contexts/TenantContext";
import { trpc } from "@/lib/trpc";
import { Loader2, Car, AlertCircle } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const tenant = useTenantContext();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginMutation.mutateAsync({
        email,
        password,
      });

      if (result.success) {
        // Store user info in localStorage
        localStorage.setItem("user", JSON.stringify(result.user));
        
        // Redirect to dashboard
        setLocation("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">AutoGestão Pro</h1>
              {tenant.tenantName && (
                <p className="text-sm text-slate-400">{tenant.tenantName}</p>
              )}
            </div>
          </div>
          <p className="text-slate-400">Plataforma de Gestão de Concessionárias</p>
        </div>

        {/* Login card */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Bem-vindo</CardTitle>
            <CardDescription className="text-slate-400">
              Faça login para acessar sua concessionária
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Email input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>

              {/* Password input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>

              {/* Signup link */}
              <div className="text-center text-sm text-slate-400">
                Não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => setLocation("/signup")}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Crie uma agora
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tenant info */}
        {tenant.subdomain && (
          <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700 rounded-lg text-center">
            <p className="text-xs text-slate-500">Você está acessando:</p>
            <p className="text-sm font-medium text-slate-300 mt-1">
              {tenant.tenantName || tenant.subdomain}
            </p>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>AutoGestão Pro © 2026</p>
          <p>Plataforma multi-tenant para gestão de concessionárias de carros</p>
        </div>
      </div>
    </div>
  );
}
