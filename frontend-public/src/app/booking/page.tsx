// 📂 PFAD: frontend-public/src/app/booking/page.tsx

import { headers } from 'next/headers';
import BookingClient from './BookingClient';

export default async function BookingPage() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant') || 'demo';

  return <BookingClient tenantSlug={tenantSlug} />;
}