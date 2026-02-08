/**
 * Admin Layout - Sidebar navigation for dealer management
 * Used for tenant-specific admin area
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { useTenant } from "@/_core/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Menu, X, LogOut, Home, Car, Settings, Store, BarChart3 } from "lucide-react";
import { useState } from "react";
import { GlobalNavTabs } from "./GlobalNavTabs";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const { subdomain } = useTenant();
  const [location, navigate] = useLocation();

  const isActive = (path: string) => location === path;

  const menuItems = [
    { label: "Dashboard", icon: Home, path: "/admin" },
    { label: "Veículos", icon: Car, path: "/admin/vehicles" },
    { label: "Loja", icon: Store, path: "/admin/store" },
    { label: "Dashboard de Testes", icon: BarChart3, path: "/admin/system-dashboard" },
    { label: "Configurações", icon: Settings, path: "/admin/settings" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 text-white transition-all duration-300 flex flex-col border-r border-slate-800`}
      >
        {/* Logo/Brand */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex flex-col">
              <h1 className="font-bold text-lg">AutoGestão</h1>
              <p className="text-xs text-slate-400">{subdomain}</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          {sidebarOpen && user && (
            <div className="text-xs">
              <p className="text-slate-400">Conectado como</p>
              <p className="font-medium truncate">{user.name || user.email}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            <LogOut size={16} />
            {sidebarOpen && "Sair"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-slate-50">
          <GlobalNavTabs />
          <div className="p-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
