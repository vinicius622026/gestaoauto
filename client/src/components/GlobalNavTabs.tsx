import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Shield, ClipboardList } from "lucide-react";

const navItems = [
  {
    value: "admin-master",
    label: "Admin mestre",
    path: "/admin/saas",
    icon: Shield,
    hint: "Administração master",
  },
  {
    value: "cadastros",
    label: "Cadastros",
    path: "/admin/vehicles",
    icon: ClipboardList,
    hint: "Criar e gerenciar cadastros",
  },
];

export function GlobalNavTabs() {
  const [location, setLocation] = useLocation();
  const active = navItems.find((item) => location.startsWith(item.path))?.value ?? navItems[0].value;

  return (
    <div className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
          <span>Gestão Auto</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">Admin</span>
        </div>

        <Tabs
          value={active}
          onValueChange={(value) => {
            const target = navItems.find((item) => item.value === value);
            if (target) setLocation(target.path);
          }}
        >
          <TabsList className="grid grid-cols-2 bg-muted">
            {navItems.map(({ value, label, icon: Icon, hint }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-2"
                title={hint}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
