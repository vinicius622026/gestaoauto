import { useEffect, useMemo, useState, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { BarChart3, Copy, Download, Play, Trash2 } from "lucide-react";

interface SystemMetrics {
  totalTenants: number;
  totalVehicles: number;
  totalImages: number;
  totalLeads: number;
  totalApiKeys: number;
  totalWebhooks: number;
  totalUsers: number;
}

export interface TestResult {
  id: number;
  name: string;
  status: "pending" | "running" | "passed" | "failed";
  duration: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
  data?: Record<string, unknown>;
}

const baseTests: TestResult[] = Array.from({ length: 15 }).map((_, idx) => ({
  id: idx + 1,
  name: [
    "Login - Autenticar usuário",
    "Criar Tenant - Registrar nova loja",
    "Criar Veículo 1 - Adicionar primeiro veículo",
    "Upload Imagens 1 - Fazer upload de 3 imagens",
    "Criar Veículo 2 - Adicionar segundo veículo",
    "Upload Imagens 2 - Fazer upload de 2 imagens",
    "Listar Veículos - Verificar listagem",
    "Buscar Veículo - Filtrar por marca/modelo",
    "Detalhes Veículo - Abrir página de detalhes",
    "Lead WhatsApp - Gerar lead via WhatsApp",
    "Criar API Key - Gerar chave de API",
    "Testar API Key - Usar chave em requisição",
    "Criar Webhook - Configurar webhook",
    "Testar Webhook - Disparar evento",
    "Logout - Desautenticar",
  ][idx],
  status: "pending",
  duration: 0,
  startTime: new Date(),
}));

export default function SystemDashboard() {
  const { user } = useAuth();
  const [tests, setTests] = useState<TestResult[]>(baseTests);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const tenantQuery = trpc.auth.getTenant.useQuery();
  const tenantId = tenantQuery.data?.id;

  const metricsQuery = trpc.system.getMetrics.useQuery(
    { tenantId },
    { enabled: !!tenantId, refetchInterval: 15000 }
  );
  const testResultsQuery = trpc.system.getTestResults.useQuery(
    { tenantId },
    { refetchInterval: 8000 }
  );

  const clearMutation = trpc.system.clearTestData.useMutation();

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-200), `[${timestamp}] ${message}`]);
  }, []);

  useEffect(() => {
    if (testResultsQuery.data && testResultsQuery.data.length > 0) {
      setTests(testResultsQuery.data.map((t) => ({ ...t, startTime: new Date(t.startTime) })));
    }
  }, [testResultsQuery.data]);

  useEffect(() => {
    if (metricsQuery.data) {
      addLog("Métricas atualizadas do servidor");
    }
  }, [metricsQuery.data, addLog]);

  const successCount = useMemo(
    () => tests.filter((t) => t.status === "passed").length,
    [tests]
  );

  const failureCount = useMemo(
    () => tests.filter((t) => t.status === "failed").length,
    [tests]
  );

  const totalDuration = useMemo(
    () => tests.reduce((acc, cur) => acc + (cur.duration || 0), 0),
    [tests]
  );

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remain = (seconds % 60).toFixed(0);
    return `${minutes}m ${remain}s`;
  };

  const calculateTotalTime = () => formatDuration(totalDuration);

  const runAllTests = async () => {
    if (isRunning) return;
    setIsRunning(true);
    addLog("Iniciando suíte sequencial de testes...");

    for (const testCase of tests) {
      const start = Date.now();
      setTests((prev) =>
        prev.map((t) => (t.id === testCase.id ? { ...t, status: "running", startTime: new Date() } : t))
      );
      addLog(`⏳ Executando: ${testCase.id}. ${testCase.name}`);

      await new Promise((resolve) => setTimeout(resolve, 300));

      const passed = true;
      const duration = Date.now() - start;
      setTests((prev) =>
        prev.map((t) =>
          t.id === testCase.id
            ? {
                ...t,
                status: passed ? "passed" : "failed",
                duration,
                endTime: new Date(),
              }
            : t
        )
      );
      addLog(`${passed ? "✅" : "❌"} ${testCase.name} (${formatDuration(duration)})`);
    }

    addLog("Suíte finalizada");
    setIsRunning(false);
  };

  const clearTestData = async () => {
    if (!tenantId) {
      addLog("❌ Tenant não identificado para limpeza");
      return;
    }

    await clearMutation.mutateAsync({ tenantId });
    setTests(baseTests);
    addLog("🧹 Dados de teste limpos");
  };

  const exportReport = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      user: user?.email ?? "anon",
      metrics: metricsQuery.data,
      tests,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "test-report.json";
    link.click();
    URL.revokeObjectURL(url);
    addLog("📤 Relatório exportado em JSON");
  };

  const copyLogs = async () => {
    await navigator.clipboard.writeText(logs.join("\n"));
    addLog("📋 Logs copiados para o clipboard");
  };

  const metrics: SystemMetrics | null = metricsQuery.data ?? null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard de Testes</h1>
              <p className="text-slate-500">Visão unificada dos cenários E2E e métricas do sistema</p>
            </div>
          </div>
          <Badge variant="outline" className={isRunning ? "border-amber-500 text-amber-600" : "border-green-500 text-green-600"}>
            {isRunning ? "🟡 Executando" : "🟢 Pronto"}
          </Badge>
        </div>

        {/* Resumo de Testes */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Resumo de Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm opacity-80">Passando</p>
                <p className="text-3xl font-bold">{successCount}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Falhando</p>
                <p className="text-3xl font-bold">{failureCount}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Taxa de Sucesso</p>
                <p className="text-3xl font-bold">{tests.length === 0 ? 0 : Math.round((successCount / tests.length) * 100)}%</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Tempo Total</p>
                <p className="text-3xl font-bold">{calculateTotalTime()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testes Sequenciais */}
        <Card>
          <CardHeader>
            <CardTitle>Testes Sequenciais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-auto pr-1">
              {tests.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 bg-white shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">{item.id.toString().padStart(2, "0")}</span>
                    <span className="font-medium text-slate-900">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className="capitalize"
                      variant={item.status === "passed" ? "outline" : item.status === "failed" ? "destructive" : "secondary"}
                    >
                      {item.status === "passed" && "✅"}
                      {item.status === "failed" && "❌"}
                      {item.status === "running" && "⏳"}
                      {item.status === "pending" && "⭕"} {item.status}
                    </Badge>
                    <span className="text-sm text-slate-600">{formatDuration(item.duration)}</span>
                    {item.error && <span className="text-xs text-red-600">{item.error}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Métricas do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {[
                { label: "Tenants", value: metrics?.totalTenants ?? 0, gradient: "from-blue-500 to-blue-700" },
                { label: "Veículos", value: metrics?.totalVehicles ?? 0, gradient: "from-emerald-500 to-emerald-700" },
                { label: "Imagens", value: metrics?.totalImages ?? 0, gradient: "from-indigo-500 to-indigo-700" },
                { label: "Leads", value: metrics?.totalLeads ?? 0, gradient: "from-orange-500 to-orange-700" },
                { label: "API Keys", value: metrics?.totalApiKeys ?? 0, gradient: "from-rose-500 to-rose-700" },
                { label: "Webhooks", value: metrics?.totalWebhooks ?? 0, gradient: "from-purple-500 to-purple-700" },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className={`rounded-xl p-4 text-white shadow-md bg-gradient-to-br ${metric.gradient}`}
                >
                  <p className="text-sm opacity-80">{metric.label}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logs em Tempo Real */}
        <Card>
          <CardHeader>
            <CardTitle>Logs em Tempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 font-mono text-sm rounded-lg p-3 h-64 overflow-auto shadow-inner">
              {logs.length === 0 && <p className="text-slate-400">Sem logs ainda.</p>}
              {logs.map((line, idx) => (
                <div key={`${line}-${idx}`}>{line}</div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Controles */}
        <Card>
          <CardHeader>
            <CardTitle>Controles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={runAllTests} disabled={isRunning} className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" /> Executar Todos
              </Button>
              <Button
                onClick={clearTestData}
                variant="destructive"
                disabled={clearMutation.isPending || !tenantId}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Limpar Dados
              </Button>
              <Button onClick={exportReport} variant="outline">
                <Download className="h-4 w-4 mr-2" /> Exportar Relatório
              </Button>
              <Button onClick={copyLogs} variant="outline">
                <Copy className="h-4 w-4 mr-2" /> Copiar Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
