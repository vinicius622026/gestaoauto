import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTenantContext } from "@/contexts/TenantContext";
import { trpc } from "@/lib/trpc";
import { Loader2, Car, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Signup() {
  const [, setLocation] = useLocation();
  const tenant = useTenantContext();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailValid, setEmailValid] = useState(false);

  const signupMutation = trpc.auth.signup.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
    
    // Validate email format
    if (name === "email") {
      setEmailValid(value.includes("@") && value.includes("."));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Nome é obrigatório");
      return false;
    }
    if (formData.name.length < 3) {
      setError("Nome deve ter pelo menos 3 caracteres");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Email inválido");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return false;
    }
    if (!/[a-z]/.test(formData.password)) {
      setError("Senha deve conter letras minúsculas");
      return false;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError("Senha deve conter letras maiúsculas");
      return false;
    }
    if (!/[0-9]/.test(formData.password)) {
      setError("Senha deve conter números");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Senhas não conferem");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await signupMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        setSuccess(true);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          setLocation("/login");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => setLocation("/login")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para login
        </button>

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
          <p className="text-slate-400">Crie sua conta para começar</p>
        </div>

        {/* Success message */}
        {success && (
          <Card className="bg-green-900/20 border-green-700 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <p>Conta criada com sucesso! Redirecionando para login...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signup card */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Criar Conta</CardTitle>
            <CardDescription className="text-slate-400">
              Preencha os dados abaixo para se registrar
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

              {/* Name field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isSubmitting}
                />
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="text-slate-300">
                    Email
                  </Label>
                  {emailValid && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Válido
                    </span>
                  )}
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isSubmitting}
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Senha
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-slate-400">
                  Mínimo 6 caracteres, com letras maiúsculas, minúsculas e números
                </p>
              </div>

              {/* Confirm password field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">
                  Confirmar Senha
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>

              {/* Login link */}
              <div className="text-center text-sm text-slate-400">
                Já tem conta?{" "}
                <button
                  type="button"
                  onClick={() => setLocation("/login")}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Faça login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>AutoGestão Pro © 2026</p>
        </div>
      </div>
    </div>
  );
}
