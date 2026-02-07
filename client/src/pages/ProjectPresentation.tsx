/**
 * Project Presentation Page - Interactive showcase of AutoGestão Pro
 * Displays features, architecture, and usage statistics
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Database,
  Shield,
  Users,
  Zap,
  Globe,
  Lock,
  CheckCircle2,
  Download,
  Share2,
  TrendingUp,
} from "lucide-react";

// Sample data for visualizations
const architectureData = [
  { layer: "Frontend", complexity: 85, features: 12 },
  { layer: "Backend", complexity: 90, features: 15 },
  { layer: "Database", complexity: 80, features: 4 },
];

const featureAdoptionData = [
  { month: "Jan", adoption: 20, users: 5 },
  { month: "Feb", adoption: 35, users: 12 },
  { month: "Mar", adoption: 55, users: 25 },
  { month: "Apr", adoption: 75, users: 45 },
  { month: "May", adoption: 85, users: 65 },
  { month: "Jun", adoption: 95, users: 85 },
];

const tenantDistributionData = [
  { name: "Lojas Ativas", value: 85 },
  { name: "Em Desenvolvimento", value: 12 },
  { name: "Inativos", value: 3 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

export default function ProjectPresentationPage() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const handleDownloadReport = () => {
    const report = `
AutoGestão Pro - Relatório de Implementação
============================================

Data: ${new Date().toLocaleDateString("pt-BR")}

1. ARQUITETURA MULTI-TENANT
   ✓ Isolamento de dados via tenant_id
   ✓ Identificação por subdomínio
   ✓ RLS (Row Level Security) preparado
   ✓ Escalabilidade horizontal

2. AUTENTICAÇÃO & SEGURANÇA
   ✓ Integração com Manus OAuth
   ✓ Gerenciamento de perfis por tenant
   ✓ Roles de acesso (owner, manager, viewer)
   ✓ Isolamento de contexto de tenant

3. INTERFACE ADMINISTRATIVA
   ✓ Dashboard com menu lateral
   ✓ Gerenciamento de estoque
   ✓ Configurações da loja
   ✓ CRUD de veículos com upload

4. VITRINE PÚBLICA
   ✓ Grid responsivo de veículos
   ✓ Filtros e busca avançada
   ✓ Informações de contato da loja
   ✓ Design profissional e moderno

5. RESPONSIVIDADE
   ✓ Desktop (1920px+)
   ✓ Tablet (768px-1024px)
   ✓ Mobile (320px-767px)
   ✓ Navegação mobile-friendly

6. TECNOLOGIAS
   - Frontend: React 19, Tailwind CSS 4, TypeScript
   - Backend: Node.js, Express, tRPC
   - Database: MySQL/TiDB com Drizzle ORM
   - Auth: Manus OAuth
    `;

    const blob = new Blob([report], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "autogesto-pro-relatorio.txt";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleShare = () => {
    const text = "AutoGestão Pro - Plataforma SaaS de Revenda de Veículos Multi-Tenant";
    if (navigator.share) {
      navigator.share({
        title: "AutoGestão Pro",
        text: text,
        url: window.location.href,
      });
    } else {
      alert("Copie o link para compartilhar: " + window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">AutoGestão Pro</h1>
              <p className="text-slate-600 mt-1">Plataforma SaaS Multi-Tenant de Revenda de Veículos</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleShare} variant="outline" className="gap-2">
                <Share2 size={18} />
                Compartilhar
              </Button>
              <Button onClick={handleDownloadReport} className="gap-2">
                <Download size={18} />
                Relatório
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-12">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="architecture">Arquitetura</TabsTrigger>
            <TabsTrigger value="features">Funcionalidades</TabsTrigger>
            <TabsTrigger value="analytics">Análise</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Database className="text-blue-600" size={18} />
                    Tabelas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">4</p>
                  <p className="text-xs text-slate-500 mt-1">tenants, profiles, vehicles, users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Shield className="text-green-600" size={18} />
                    Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">RLS</p>
                  <p className="text-xs text-slate-500 mt-1">Row Level Security</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Users className="text-purple-600" size={18} />
                    Tenants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">∞</p>
                  <p className="text-xs text-slate-500 mt-1">Escalável horizontalmente</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Zap className="text-yellow-600" size={18} />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">Fast</p>
                  <p className="text-xs text-slate-500 mt-1">Otimizado para velocidade</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>O que é AutoGestão Pro?</CardTitle>
                <CardDescription>
                  Uma plataforma SaaS completa para lojistas de automóveis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">
                  AutoGestão Pro é uma solução empresarial de código aberto que permite que lojistas de automóveis
                  gerenciem seus estoques e exibam seus veículos para clientes de forma independente. A plataforma
                  utiliza uma arquitetura Multi-Tenant robusta, garantindo isolamento completo de dados entre lojas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-slate-900">Isolamento de Dados</p>
                      <p className="text-sm text-slate-600">Cada loja tem seus próprios dados isolados</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-slate-900">Subdomínio Único</p>
                      <p className="text-sm text-slate-600">Cada loja tem seu próprio subdomínio</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-slate-900">Autenticação Segura</p>
                      <p className="text-sm text-slate-600">OAuth integrado com Manus</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-slate-900">Interface Responsiva</p>
                      <p className="text-sm text-slate-600">Funciona em todos os dispositivos</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stack Tecnológico</CardTitle>
                  <CardDescription>Tecnologias utilizadas no projeto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-slate-900">Frontend</p>
                      <p className="text-sm text-slate-600">React 19, Tailwind CSS 4, TypeScript, Wouter</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Backend</p>
                      <p className="text-sm text-slate-600">Node.js, Express 4, tRPC 11, TypeScript</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Database</p>
                      <p className="text-sm text-slate-600">MySQL/TiDB, Drizzle ORM, Migrations</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Autenticação</p>
                      <p className="text-sm text-slate-600">Manus OAuth, JWT, Session Cookies</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Testes</p>
                      <p className="text-sm text-slate-600">Vitest, Unit Tests</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Isolamento Multi-Tenant</CardTitle>
                  <CardDescription>Como os dados são isolados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm font-mono text-slate-700">
                      <span className="text-blue-600">tenant_id</span>: Identificador único da loja
                    </p>
                    <p className="text-sm font-mono text-slate-700">
                      <span className="text-blue-600">subdomain</span>: loja-a.autogestao.com.br
                    </p>
                    <p className="text-sm font-mono text-slate-700">
                      <span className="text-blue-600">RLS</span>: Políticas de segurança no banco
                    </p>
                  </div>
                  <p className="text-sm text-slate-600">
                    Cada loja só acessa seus próprios dados através de verificações de tenant_id em todas as queries.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Complexidade por Camada</CardTitle>
                <CardDescription>Distribuição de features e complexidade</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={architectureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="layer" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="complexity" fill="#3b82f6" name="Complexidade (%)" />
                    <Bar dataKey="features" fill="#10b981" name="Features" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="text-blue-600" size={20} />
                    Vitrine Pública
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-slate-600">✓ Grid responsivo de veículos</p>
                  <p className="text-sm text-slate-600">✓ Filtros avançados (marca, modelo, ano, preço)</p>
                  <p className="text-sm text-slate-600">✓ Informações de contato da loja</p>
                  <p className="text-sm text-slate-600">✓ Design profissional e moderno</p>
                  <p className="text-sm text-slate-600">✓ Galeria de imagens</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="text-green-600" size={20} />
                    Área Administrativa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-slate-600">✓ Dashboard com estatísticas</p>
                  <p className="text-sm text-slate-600">✓ CRUD completo de veículos</p>
                  <p className="text-sm text-slate-600">✓ Upload de imagens</p>
                  <p className="text-sm text-slate-600">✓ Configurações da loja</p>
                  <p className="text-sm text-slate-600">✓ Menu lateral colapsável</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="text-purple-600" size={20} />
                    Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-slate-600">✓ Autenticação OAuth</p>
                  <p className="text-sm text-slate-600">✓ Isolamento de tenant_id</p>
                  <p className="text-sm text-slate-600">✓ Roles de acesso (owner, manager, viewer)</p>
                  <p className="text-sm text-slate-600">✓ Proteção de rotas</p>
                  <p className="text-sm text-slate-600">✓ Validação de entrada</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="text-yellow-600" size={20} />
                    Responsividade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-slate-600">✓ Desktop (1920px+)</p>
                  <p className="text-sm text-slate-600">✓ Tablet (768px-1024px)</p>
                  <p className="text-sm text-slate-600">✓ Mobile (320px-767px)</p>
                  <p className="text-sm text-slate-600">✓ Navegação mobile-friendly</p>
                  <p className="text-sm text-slate-600">✓ Touch-friendly UI</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Adoção de Features ao Longo do Tempo</CardTitle>
                <CardDescription>Crescimento de usuários e adoção de features</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={featureAdoptionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="adoption"
                      stroke="#3b82f6"
                      name="Adoção (%)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#10b981"
                      name="Usuários Ativos"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Tenants</CardTitle>
                <CardDescription>Status das lojas cadastradas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ResponsiveContainer width={300} height={300}>
                    <PieChart>
                      <Pie
                        data={tenantDistributionData}
                        cx={150}
                        cy={150}
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {tenantDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {tenantDistributionData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-slate-600">
                          {item.name}: {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-16">
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">AutoGestão Pro</h4>
              <p className="text-slate-400 text-sm">
                Plataforma SaaS Multi-Tenant para revenda de veículos com isolamento completo de dados.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Recursos</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>✓ Vitrine Pública</li>
                <li>✓ Área Administrativa</li>
                <li>✓ CRUD de Veículos</li>
                <li>✓ Autenticação Segura</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Tecnologias</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>React 19 + TypeScript</li>
                <li>Node.js + tRPC</li>
                <li>MySQL + Drizzle ORM</li>
                <li>Tailwind CSS 4</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 AutoGestão Pro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
