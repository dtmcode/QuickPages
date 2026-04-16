// frontend-public\src\app\membership\page.tsx
import { headers } from 'next/headers';
import MembershipClient from './MembershipClient';

export default async function MembershipPage() {
  const h = await headers();
  const tenant = h.get('x-tenant') || 'demo';
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const plans = await fetch(`${api}/api/public/${tenant}/membership/plans`, { next: { revalidate: 60 } })
    .then(r => r.ok ? r.json() : []);

  return <MembershipClient plans={plans} tenant={tenant} />;
}