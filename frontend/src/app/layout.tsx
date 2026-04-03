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

const NAV_ITEMS = [
  {
    name: 'Übersicht',
    href: '/dashboard',
    emoji: '⊞',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    visible: true,
    isEmoji: false,
  },
  {
    name: 'Website Builder',
    href: '/dashboard/website-builder',
    emoji: '🎨',
    icon: null,
    visible: true,
    isEmoji: true,
  },
  {
    name: 'Blog / CMS',
    href: '/dashboard/cms/posts',
    emoji: '📝',
    icon: null,
    visible: true,
    isEmoji: true,
  },
  {
    name: 'Media',
    href: '/dashboard/media',
    emoji: '🖼️',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    visible: true,
    isEmoji: false,
  },
  {
    name: 'Shop',
    href: '/dashboard/shop',
    emoji: '🛒',
    icon: null,
    visible: true,
    isEmoji: true,
  },
  {
    name: 'Booking',
    href: '/dashboard/booking',
    emoji: '📅',
    icon: null,
    visible: true,
    isEmoji: true,
  },
  {
    name: 'Newsletter',
    href: '/dashboard/newsletter/campaigns',
    emoji: '📧',
    icon: null,
    visible: true,
    isEmoji: true,
  },
  {
    name: 'Formulare',
    href: '/dashboard/forms',
    emoji: '📋',
    icon: null,
    visible: true,
    isEmoji: true,
  },
  {
    name: 'Kommentare',
    href: '/dashboard/comments',
    emoji: '💬',
    icon: null,
    visible: true,
    isEmoji: true,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    emoji: '📊',
    icon: null,
    visible: true,
    isEmoji: true,
  },
  {
    name: 'AI Content',
    href: '/dashboard/ai',
    emoji: '🤖',
    icon: null,
    visible: true,
    isEmoji: true,
  },
  {
    name: 'Benutzer',
    href: '/dashboard/users',
    emoji: '👥',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    visible: true,
    isEmoji: false,
  },
  {
    name: 'Packages',
    href: '/dashboard/packages',
    emoji: '📦',
    icon: null,
    visible: true,
    isEmoji: true,
  },
  {
    name: 'i18n',
    href: '/dashboard/i18n',
    emoji: '🌍',
    icon: null,
    visible: true,
    isEmoji: true,
  },
  {
    name: 'Tools',
    href: '/dashboard/tools',
    emoji: '🔧',
    icon: null,
    visible: true,
    isEmoji: true,
  },
  {
    name: 'Einstellungen',
    href: '/dashboard/settings',
    emoji: '⚙️',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    visible: true,
    isEmoji: false,
  },
];

function DashboardNav({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user, logout, tenant } = useAuth();
  const { hasFeature } = usePackage();
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
      body: JSON.stringify({ query: `query { brandingSettings { platformName logoUrl logoInitial primaryColor hidePoweredBy } }` }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.data?.brandingSettings) setBranding(d.data.brandingSettings); })
      .catch(() => {});
  }, []);

  const publicSiteUrl = getPublicLink(tenantSlug, '/');
  const navigation = NAV_ITEMS.filter(item => item.visible);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 overflow-hidden shadow-sm"
            style={{ backgroundColor: branding.primaryColor || 'hsl(var(--primary))' }}
          >
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <span className="text-primary-foreground font-bold text-lg">
                {branding.logoInitial || 'Q'}
              </span>
            )}
          </div>
          <div>
            <span className="text-base font-bold text-foreground leading-none">
              {branding.platformName || 'QuickPages'}
            </span>
            <div className="text-[10px] text-muted-foreground font-medium tracking-wide">DASHBOARD</div>
          </div>
        </Link>
        {/* Mobile close */}
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group text-sm font-medium ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {item.isEmoji ? (
                <span className="text-base w-5 text-center leading-none">{item.emoji}</span>
              ) : (
                <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 1.75} d={item.icon!} />
                </svg>
              )}
              <span className="truncate">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/60" />
              )}
            </Link>
          );
        })}

        {/* Website ansehen */}
        <div className="pt-3 mt-3 border-t border-border">
          <a
            href={publicSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-all duration-150 group"
          >
            <svg className="w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Website ansehen</span>
            <svg className="w-3 h-3 ml-auto opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-all duration-150 group mb-1">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-primary-foreground font-semibold text-xs">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          fullWidth
          className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground text-xs h-8 transition-all duration-150"
        >
          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Abmelden
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-60 bg-card border-r border-border flex-col">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <div className="relative w-60 bg-card border-r border-border flex flex-col shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
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
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Lädt...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <PackageProvider>
      <div className="min-h-screen bg-background">
        <DashboardNav mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="lg:pl-60">
          {/* Top bar */}
          <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
            <div className="flex items-center justify-between h-14 px-4 sm:px-6">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-2 ml-auto">
                <ThemeToggle />
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