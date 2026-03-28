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

// Navigation Component (innerhalb PackageProvider) {currentTenant?.slug}
function DashboardNav() {
  const pathname = usePathname();
  const { user, logout, tenant } = useAuth(); // ← tenant hinzugefügt
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

  
const allNavigation = [
    { 
      name: 'Übersicht', 
      href: '/dashboard', 
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      visible: true,
      isEmoji: false,
    },
    { 
      name: 'Website Builder', 
      href: '/dashboard/website-builder', 
      icon: '🎨',
      visible: true,
      isEmoji: true,
    },
    { 
      name: 'Blog / CMS', 
      href: '/dashboard/cms/posts', 
      icon: '📝',
      visible: true,
     // visible: hasFeature('cms'),
      isEmoji: true,
    },
    { 
      name: 'Media', 
      href: '/dashboard/media', 
      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      visible: true,
      isEmoji: false,
    },
    { 
      name: 'Shop', 
      href: '/dashboard/shop', 
      icon: '🛒',
      visible: true,
     // visible: hasFeature('shop'),
      isEmoji: true,
    },
    { 
      name: 'Booking', 
      href: '/dashboard/booking', 
      icon: '📅',
      visible: true,
     // visible: hasFeature('booking'),
      isEmoji: true,
    },
    { 
      name: 'Newsletter', 
      href: '/dashboard/newsletter/campaigns', 
      icon: '📧',
      visible: true,
     // visible: hasFeature('newsletter'),
      isEmoji: true,
    },
    { 
      name: 'Formulare', 
      href: '/dashboard/forms', 
      icon: '📋',
      visible: true,
     // visible:hasFeature('forms'),
      isEmoji: true,
    },
    { 
      name: 'Kommentare', 
      href: '/dashboard/comments', 
      icon: '💬',
      visible: true,
     // visible:hasFeature('cms'),
      isEmoji: true,
    },
    { 
      name: 'Analytics', 
      href: '/dashboard/analytics', 
      icon: '📊',
      visible: true,
      isEmoji: true,
    },
    { 
      name: 'AI Content', 
      href: '/dashboard/ai', 
      icon: '🤖',
      visible: true,
     // visible: hasFeature('ai'),
      isEmoji: true,
    },
    { 
      name: 'Benutzer', 
      href: '/dashboard/users', 
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      visible: true,
      isEmoji: false,
    },
    { 
      name: 'packages', 
      href: '/dashboard/packages', 
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      visible: true,
      isEmoji: false,
  },
  { 
      name: 'i18n', 
      href: '/dashboard/i18n', 
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      visible: true,
      isEmoji: false,
  },
   { 
      name: 'tools', 
      href: '/dashboard/tools', 
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      visible: true,
      isEmoji: false,
  },
    { 
      name: 'Einstellungen', 
      href: '/dashboard/settings', 
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      visible: true,
      isEmoji: false,
    },
  ];

  const navigation = allNavigation.filter(item => item.visible);

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-colors duration-300">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border transition-colors duration-300">
           <Link href="/dashboard" className="flex items-center space-x-2 group">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105 overflow-hidden"
              style={{ backgroundColor: branding.primaryColor || 'hsl(var(--primary))' }}
            >
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-primary-foreground font-bold text-xl">
                  {branding.logoInitial || 'S'}
                </span>
              )}
            </div>
            <span className="text-xl font-bold text-foreground transition-colors duration-300">
              {branding.platformName || 'SaaS'}
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                  isActive
                    ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border-l-4 border-transparent'
                }`}
              >
                {item.isEmoji ? (
                  <span className="text-xl transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
                ) : (
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                )}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}

          {/* Website ansehen Button{currentTenant?.slug} */}
          <div className="pt-4 mt-4 border-t border-border">
            <a
              href={publicSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-primary hover:bg-primary/10 border-2 border-primary/20 hover:border-primary/50 card-hover group"
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="font-medium">Website ansehen</span>
            </a>
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border transition-colors duration-300">
          <div className="flex items-center space-x-3 px-4 py-3 mb-2 rounded-lg hover:bg-muted transition-all duration-300 group">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <span className="text-primary-foreground font-semibold text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate transition-colors duration-300">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate transition-colors duration-300">
                {user?.email}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout} 
            fullWidth
            className="hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
          >
            Abmelden
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('❌ Not authenticated - redirecting to login');
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lädt...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <PackageProvider>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <DashboardNav />
        <div className="lg:pl-64">
          <header className="bg-card border-b border-border sticky top-0 z-40 transition-colors duration-300 backdrop-blur-sm bg-card/95">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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