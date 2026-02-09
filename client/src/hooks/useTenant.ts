import { useEffect, useState } from "react";

export interface TenantInfo {
  subdomain: string | null;
  isLocalhost: boolean;
  isMainDomain: boolean;
}

/**
 * Hook to detect current tenant from subdomain
 * 
 * Examples:
 * - localhost:3000 -> null (development, no tenant)
 * - premium.localhost:3000 -> "premium"
 * - premium.autogestao.com.br -> "premium"
 * - autogestao.com.br -> null (main domain)
 */
export function useTenant(): TenantInfo {
  const [tenantInfo, setTenantInfo] = useState<TenantInfo>({
    subdomain: null,
    isLocalhost: false,
    isMainDomain: false,
  });

  useEffect(() => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    
    let subdomain: string | null = null;
    let isMainDomain = false;

    if (isLocalhost) {
      // For localhost, subdomain is part of the hostname before the colon
      // e.g., "premium.localhost" -> "premium"
      const parts = hostname.split(".");
      if (parts.length > 1 && parts[0] !== "localhost") {
        subdomain = parts[0];
      }
    } else {
      // For production domains, extract subdomain
      // e.g., "premium.autogestao.com.br" -> "premium"
      const parts = hostname.split(".");
      
      // Check if it's the main domain (no subdomain)
      if (parts.length <= 2) {
        isMainDomain = true;
      } else {
        // Get the first part as subdomain
        subdomain = parts[0];
      }
    }

    setTenantInfo({
      subdomain,
      isLocalhost,
      isMainDomain,
    });
  }, []);

  return tenantInfo;
}

/**
 * Get the base URL for a specific tenant
 */
export function getTenantUrl(subdomain: string | null): string {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : "";

  if (!subdomain) {
    return `${protocol}//${hostname}${port}`;
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${subdomain}.localhost${port}`;
  }

  // For production, replace subdomain or add it
  const parts = hostname.split(".");
  if (parts.length > 1 && parts[0] !== subdomain) {
    parts[0] = subdomain;
    return `${protocol}//${parts.join(".")}${port}`;
  }

  return `${protocol}//${subdomain}.${hostname}${port}`;
}

/**
 * Navigate to a specific tenant
 */
export function navigateToTenant(subdomain: string | null, path: string = "/"): void {
  const url = getTenantUrl(subdomain);
  window.location.href = `${url}${path}`;
}
