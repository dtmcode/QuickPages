import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { headers } from 'next/headers';
import { getAPI } from '@/lib/api';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { I18nProvider } from '@/components/I18nProvider';
import { CustomerAuthProvider } from '@/contexts/customer-auth-context';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  try {
    const headersList = await headers();
    const tenantSlug = headersList.get('x-tenant') || 'demo';
    const api = getAPI(tenantSlug);
    const [tenant, branding] = await Promise.all([
      api.getSettings(),
      api.getBranding().catch(() => null),
    ]);

    return {
      title: {
        default: branding?.platformName || tenant.name,
        template: `%s | ${branding?.platformName || tenant.name}`,
      },
      description: `${tenant.name} — Entdecke unsere Produkte und Services`,
      icons: branding?.faviconUrl ? { icon: branding.faviconUrl } : undefined,
      openGraph: {
        title: branding?.platformName || tenant.name,
        description: `${tenant.name} — Entdecke unsere Produkte und Services`,
        siteName: branding?.platformName || tenant.name,
        type: 'website',
      },
      robots: { index: true, follow: true },
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
  let headerNav = null;
  let footerNav = null;
  let branding = null;

  try {
    const api = getAPI(tenantSlug);
    [tenant, headerNav, footerNav, branding] = await Promise.all([
      api.getSettings(),
      api.getNavigation('header').catch(() => null),
      api.getNavigation('footer').catch(() => null),
      api.getBranding().catch(() => null),
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
        <I18nProvider tenant={tenantSlug}>
           <CustomerAuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header
            navigation={headerNav}
            tenantName={branding?.platformName || tenant.name}
            logoUrl={branding?.logoUrl}
            logoInitial={branding?.logoInitial}
            primaryColor={branding?.primaryColor}
          />
          <main className="flex-grow">{children}</main>
          <Footer
            navigation={footerNav}
            tenantName={branding?.platformName || tenant.name}
            hidePoweredBy={branding?.hidePoweredBy}
          />
            </div>
            </CustomerAuthProvider>
          </I18nProvider>
        <AnalyticsTracker tenantSlug={tenantSlug} />
      </body>
    </html>
  );
}