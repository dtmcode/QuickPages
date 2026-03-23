/**
 * Generiert einen Link zum Public Frontend mit richtigem Tenant
 */
export function getPublicLink(
  tenantSlug: string,
  path: string = '/'
): string {
  const publicUrl = process.env.NEXT_PUBLIC_PUBLIC_FRONTEND_URL || 'http://localhost:3002';
  
  // Development: subdomain.localhost:3001
  if (publicUrl.includes('localhost')) {
    const port = publicUrl.split(':')[2] || '3002';
    return `http://${tenantSlug}.localhost:${port}${path}`;
  }
  
  // Production: subdomain.deinedomain.de
  const domain = publicUrl.replace('https://', '').replace('http://', '');
  return `https://${tenantSlug}.${domain}${path}`;
}

/**
 * Hook für Public Links im Dashboard
 */
export function usePublicLink() {
  // Hole Tenant aus Context oder localStorage
  const tenantSlug = localStorage.getItem('tenantSlug') || 'demo';
  
  return {
    getLink: (path: string) => getPublicLink(tenantSlug, path),
    tenantSlug,
  };
}