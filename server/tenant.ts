/**
 * Tenant detection and context management
 * Handles subdomain-based tenant identification
 */

/**
 * Extract tenant subdomain from hostname
 * Examples:
 * - "loja-a.autogestao.com.br" -> "loja-a"
 * - "localhost:3000" -> null (local development)
 * - "3000-iw75os3v1ndicn5xxn5e2-3a22751a.us1.manus.computer" -> null (dev environment)
 */
export function extractSubdomainFromHost(host: string): string | null {
  if (!host) return null;

  // Remove port if present
  const hostname = host.split(":")[0];

  // Skip localhost and dev environments
  if (hostname === "localhost" || hostname.includes("manus.computer")) {
    return null;
  }

  // Split by dots
  const parts = hostname.split(".");

  // For domains like "loja-a.autogestao.com.br" (4 parts), we want "loja-a"
  // For domains like "autogestao.com.br" (3 parts), we return null (no subdomain)
  // We only consider it a subdomain if there are 4+ parts
  if (parts.length >= 4) {
    return parts[0];
  }

  return null;
}

/**
 * Determine if a request is for the public storefront (no subdomain)
 * or for a tenant-specific store
 */
export function isTenantRequest(host: string): boolean {
  const subdomain = extractSubdomainFromHost(host);
  return subdomain !== null;
}

/**
 * Get the base domain from a host
 * Examples:
 * - "loja-a.autogestao.com.br" -> "autogestao.com.br"
 * - "localhost:3000" -> "localhost"
 */
export function getBaseDomain(host: string): string {
  const hostname = host.split(":")[0];
  const parts = hostname.split(".");

  // For localhost or dev environments
  if (parts.length <= 2) {
    return hostname;
  }

  // For subdomains, return everything except the first part
  return parts.slice(1).join(".");
}

/**
 * Build a URL for a specific tenant's store
 */
export function buildTenantUrl(
  subdomain: string,
  basePath: string = "/",
  protocol: string = "https"
): string {
  const host = process.env.VITE_APP_DOMAIN || "autogestao.com.br";
  return `${protocol}://${subdomain}.${host}${basePath}`;
}

/**
 * Build a URL for the public/main site
 */
export function buildPublicUrl(
  basePath: string = "/",
  protocol: string = "https"
): string {
  const host = process.env.VITE_APP_DOMAIN || "autogestao.com.br";
  return `${protocol}://${host}${basePath}`;
}
