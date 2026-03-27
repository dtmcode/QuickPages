// 📂 PFAD: frontend-public/src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { headers } from 'next/headers';
import { getAPI } from '@/lib/api';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  try {
    const headersList = await headers();
    const tenantSlug = headersList.get('x-tenant') || 'demo';
    const api = getAPI(tenantSlug);
    const tenant = await api.getSettings();

    return {
      title: {
        default: tenant.name,
        template: `%s | ${tenant.name}`,
      },
      description: `${tenant.name} — Entdecke unsere Produkte und Services`,
      openGraph: {
        title: tenant.name,
        description: `${tenant.name} — Entdecke unsere Produkte und Services`,
        siteName: tenant.name,
        type: 'website',
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return {
      title: 'Website',
      description: 'Multi-tenant platform',
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant') || 'demo';

  let tenant = null;
  let navigation = null;

  try {
    const api = getAPI(tenantSlug);
    [tenant, navigation] = await Promise.all([
      api.getSettings(),
      api.getNavigation('header'),
    ]);
  } catch (error) {
    console.error('Failed to load tenant:', error);
  }

  if (!tenant) {
    return (
      <html lang="de">
        <body className={inter.className}>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Tenant not found
              </h2>
              <p className="text-gray-600">
                The subdomain &quot;{tenantSlug}&quot; does not exist.
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="de">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header navigation={navigation} tenantName={tenant.name} />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
        {/* ✅ Analytics Tracker — Client Component, trackt Page Views automatisch */}
        <AnalyticsTracker tenantSlug={tenantSlug} />
      </body>
    </html>
  );
}