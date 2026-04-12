'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { PackageProvider, usePackage } from '@/contexts/package-context';
import { getPublicLink } from '@/lib/public-link';

interface DashboardLayoutProps {
  children: ReactNode;
}

// ─── Nav-Item Typen ────────────────────────────────────────────────────────────
type NavItem = {
  name: string;
  href: string;
  emoji: string;
  visible: boolean;
};

// ─── Navigation Component ──────────────────────────────────────────────────────
function DashboardNav({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout, tenant } = useAuth();
  usePackage(); // Kontext laden
  const tenantSlug = tenant?.slug || 'demo';
  const [branding, setBranding] = useState<{
    platformName?: string;
    logoUrl?: string;
    logoInitial?: string;
    primaryColor?: string;
    hidePoweredBy?: boolean;
  }>({});

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        query: `query { brandingSettings { platformName logoUrl logoInitial primaryColor hidePoweredBy } }`,
      }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.data?.brandingSettings) setBranding(d.data.brandingSettings); })
      .catch(() => {});
  }, []);

  const publicSiteUrl = getPublicLink(tenantSlug, '/');

  // ── Haupt-Navigation ─────────────────────────────────────────────────────────
  const navigation: NavItem[] = [
    { name: 'Übersicht',       href: '/dashboard',                       emoji: '🏠', visible: true },
    { name: 'Website Builder', href: '/dashboard/website-builder',       emoji: '🎨', visible: true },
    { name: 'Blog / CMS',      href: '/dashboard/cms/posts',             emoji: '📝', visible: true },
    { name: 'Media',           href: '/dashboard/media',                 emoji: '🖼️', visible: true },
    { name: 'Shop',            href: '/dashboard/shop',                  emoji: '🛒', visible: true },
    { name: 'Booking',         href: '/dashboard/booking',               emoji: '📅', visible: true },
    { name: 'Newsletter',      href: '/dashboard/newsletter/campaigns',  emoji: '📧', visible: true },
    { name: 'Formulare',       href: '/dashboard/forms',                 emoji: '📋', visible: true },
    { name: 'Kommentare',      href: '/dashboard/comments',              emoji: '💬', visible: true },
    { name: 'Analytics',       href: '/dashboard/analytics',             emoji: '📊', visible: true },
    { name: 'AI Content',      href: '/dashboard/ai',                    emoji: '🤖', visible: true },
    { name: 'Benutzer',        href: '/dashboard/users',                 emoji: '👥', visible: true },
  ];

  // ── System-Navigation (unten, vor Einstellungen) ──────────────────────────────
  const systemNavigation: NavItem[] = [
    { name: 'Pakete',         href: '/dashboard/packages',  emoji: '📦', visible: true },
    { name: 'i18n',           href: '/dashboard/i18n',      emoji: '🌐', visible: true },
    { name: 'Tools',          href: '/dashboard/tools',     emoji: '🔧', visible: true },
    { name: 'Einstellungen',  href: '/dashboard/settings',  emoji: '⚙️', visible: true },
  ];

  const renderNavItem = (item: NavItem) => {
    const isActive =
      pathname === item.href ||
      (item.href !== '/dashboard' && pathname.startsWith(item.href));

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
          isActive
            ? 'bg-primary/10 text-primary border-l-4 border-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground border-l-4 border-transparent'
        }`}
      >
        <span className="text-base w-5 text-center transition-transform duration-200 group-hover:scale-110 flex-shrink-0">
          {item.emoji}
        </span>
        <span className="text-sm font-medium truncate">{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Logo ── */}
      <div className="p-5 border-b border-border flex-shrink-0">
        <Link href="/dashboard" className="flex items-center space-x-2 group">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105 overflow-hidden flex-shrink-0"
            style={{ backgroundColor: branding.primaryColor || 'hsl(var(--primary))' }}
          >
            {branding.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <span className="text-primary-foreground font-bold text-lg">
                {branding.logoInitial || 'Q'}
              </span>
            )}
          </div>
          <span className="text-lg font-bold text-foreground truncate">
            {branding.platformName || 'QuickPages'}
          </span>
        </Link>
      </div>

      {/* ── Haupt-Nav ── */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navigation.filter((i) => i.visible).map(renderNavItem)}

        {/* Divider */}
        <div className="pt-3 pb-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            System
          </p>
        </div>

        {systemNavigation.filter((i) => i.visible).map(renderNavItem)}

        {/* Website ansehen */}
        <div className="pt-3 mt-1 border-t border-border">
          <a
            href={publicSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-primary hover:bg-primary/10 border border-primary/20 hover:border-primary/40 group"
          >
            <span className="text-base w-5 text-center flex-shrink-0">🌍</span>
            <span className="text-sm font-medium">Website ansehen</span>
            <svg
              className="w-3.5 h-3.5 ml-auto opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </nav>

      {/* ── User Footer ── */}
      <div className="p-3 border-t border-border flex-shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1 rounded-lg hover:bg-muted transition-colors duration-200 group">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-semibold text-xs">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          fullWidth
          className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200 text-xs"
        >
          Abmelden
        </Button>
      </div>
    </div>
  );
}

// ─── Layout ────────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Lädt...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <PackageProvider>
      <div className="min-h-screen bg-background transition-colors duration-300">

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-60 bg-card border-r border-border transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <DashboardNav onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main */}
        <div className="lg:pl-60">
          <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-40 transition-colors duration-300">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-14">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="ml-auto">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </PackageProvider>
  );
}