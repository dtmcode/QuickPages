// frontend-public\src\app\local-store\page.tsx
import { headers } from 'next/headers';
import LocalStoreClient from './LocalStoreClient';

export default async function LocalStorePage() {
  const h = await headers();
  const tenant = h.get('x-tenant') || 'demo';
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const base = `${api}/api/public/${tenant}`;

  const [products, settings, slots] = await Promise.all([
    fetch(`${base}/local-store/products`, { next: { revalidate: 30 } }).then(r => r.ok ? r.json() : []),
    fetch(`${base}/local-store/settings`, { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : null),
    fetch(`${base}/local-store/slots`, { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : []),
  ]);

  return <LocalStoreClient products={products} settings={settings} slots={slots} tenant={tenant} />;
}