/**
 * Hook para acessar informações do tenant no cliente
 */

import { useEffect, useState } from "react";

export interface TenantInfo {
  subdomain: string | null;
  isTenantRequest: boolean;
}

/**
 * Get tenant information from current URL
 */
function getTenantFromUrl(): TenantInfo {
  if (typeof window === "undefined") {
    return { subdomain: null, isTenantRequest: false };
  }

  const hostname = window.location.hostname;

  // Check if this is a subdomain request
  if (hostname === "localhost" || hostname.includes("manus.computer")) {
    return { subdomain: null, isTenantRequest: false };
  }

  const parts = hostname.split(".");
  if (parts.length >= 3) {
    return {
      subdomain: parts[0],
      isTenantRequest: true,
    };
  }

  return { subdomain: null, isTenantRequest: false };
}

/**
 * Hook to access tenant information
 */
export function useTenant(): TenantInfo {
  const [tenant, setTenant] = useState<TenantInfo>(() => getTenantFromUrl());

  useEffect(() => {
    setTenant(getTenantFromUrl());
  }, []);

  return tenant;
}

/**
 * Get the public URL for a tenant store
 */
export function getTenantStoreUrl(subdomain: string, basePath: string = "/"): string {
  const protocol = window.location.protocol.replace(":", "");
  const domain = process.env.VITE_APP_DOMAIN || "autogestao.com.br";
  return `${protocol}://${subdomain}.${domain}${basePath}`;
}

/**
 * Get the public URL for the main site
 */
export function getPublicUrl(basePath: string = "/"): string {
  const protocol = window.location.protocol.replace(":", "");
  const domain = process.env.VITE_APP_DOMAIN || "autogestao.com.br";
  return `${protocol}://${domain}${basePath}`;
}
