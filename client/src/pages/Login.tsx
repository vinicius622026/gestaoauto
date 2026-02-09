import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTenantContext } from "@/contexts/TenantContext";
import { getLoginUrl } from "@/const";
import { Loader2, Car } from "lucide-react";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const tenant = useTenantContext();
  
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  const handleLogin = () => {
    const loginUrl = getLoginUrl();
    window.location.href = loginUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

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
          <CardContent className="space-y-6">
            {/* Email input (for future use) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                disabled={isSubmitting}
              />
            </div>

            {/* OAuth login button */}
            <Button
              onClick={handleLogin}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                "Entrar com Manus"
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800/50 text-slate-400">ou</span>
              </div>
            </div>

            {/* Signup link */}
            <div className="text-center text-sm text-slate-400">
              Não tem conta?{" "}
              <button
                onClick={() => setLocation("/signup")}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Crie uma agora
              </button>
            </div>
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
