import { headers } from 'next/headers';
import { getAPI } from '@/lib/api';
import { notFound } from 'next/navigation';
import { CartProvider } from '@/contexts/cart-context';

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant') || 'demo';
  const api = getAPI(tenantSlug);

  try {
    const tenant = await api.getSettings();
    
    // Shop Modul nicht aktiv → 404
    if (!tenant.settings?.modules?.shop) {
      notFound();
    }
  } catch {
    notFound();
  }

  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}