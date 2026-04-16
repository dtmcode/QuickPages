// frontend-public\src\app\funnel\[slug]\page.tsx
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import FunnelClient from './FunnelClient';

export default async function FunnelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const h = await headers();
  const tenant = h.get('x-tenant') || 'demo';
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const funnel = await fetch(`${api}/api/public/${tenant}/funnel/${slug}`, { next: { revalidate: 30 } })
    .then(r => r.ok ? r.json() : null);

  if (!funnel) notFound();

  return <FunnelClient funnel={funnel} tenant={tenant} />;
}