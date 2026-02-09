import React, { createContext, useContext, ReactNode } from "react";
import { useTenant, TenantInfo } from "@/hooks/useTenant";

interface TenantContextType extends TenantInfo {
  tenantName?: string;
  tenantLogo?: string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const tenantInfo = useTenant();

  // Mock tenant data - in production, this would come from an API
  const tenantData: Record<string, { name: string; logo?: string }> = {
    premium: {
      name: "Concessionária Premium",
      logo: "🏆",
    },
    centro: {
      name: "Loja Centro",
      logo: "🏢",
    },
    sul: {
      name: "Filial Sul",
      logo: "🚗",
    },
  };

  const currentTenantData = tenantInfo.subdomain
    ? tenantData[tenantInfo.subdomain]
    : undefined;

  const value: TenantContextType = {
    ...tenantInfo,
    tenantName: currentTenantData?.name,
    tenantLogo: currentTenantData?.logo,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenantContext must be used within TenantProvider");
  }
  return context;
}
