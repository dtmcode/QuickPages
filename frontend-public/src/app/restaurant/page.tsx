// frontend-public\src\app\restaurant\page.tsx
import { headers } from 'next/headers';
import RestaurantClient from './RestaurantClient';

export default async function RestaurantPage() {
  const h = await headers();
  const tenant = h.get('x-tenant') || 'demo';
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const base = `${api}/api/public/${tenant}`;

  const [menu, settings] = await Promise.all([
    fetch(`${base}/restaurant/menu`, { next: { revalidate: 30 } }).then(r => r.ok ? r.json() : []),
    fetch(`${base}/restaurant/settings`, { next: { revalidate: 60 } }).then(r => r.ok ? r.json() : null),
  ]);

  return <RestaurantClient menu={menu} settings={settings} tenant={tenant} />;
}