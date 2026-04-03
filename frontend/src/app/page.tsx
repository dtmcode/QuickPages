'use client';

import { useQuery, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { usePackage } from '@/contexts/package-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PackageBadge } from '@/components/package-badge';
import { Button } from '@/components/ui/button';
import { UsageDashboard } from '@/components/usage-dashboard';
import Link from 'next/link';

const ME_QUERY = gql`
  query Me {
    me {
      user { id email firstName lastName role emailVerified }
      tenant { id name slug package }
    }
  }
`;

const QUICK_ACTIONS = [
  { label: 'Website Builder', desc: 'Seiten gestalten', href: '/dashboard/website-builder', emoji: '🎨', color: 'from-violet-500/10 to-purple-500/10 border-violet-200 dark:border-violet-800 hover:border-violet-400' },
  { label: 'Neuer Post', desc: 'Blog-Artikel erstellen', href: '/dashboard/cms/posts/new', emoji: '📝', color: 'from-blue-500/10 to-sky-500/10 border-blue-200 dark:border-blue-800 hover:border-blue-400' },
  { label: 'Neues Produkt', desc: 'Shop erweitern', href: '/dashboard/shop/products/new', emoji: '🛒', color: 'from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800 hover:border-green-400' },
  { label: 'Navigation', desc: 'Menü bearbeiten', href: '/dashboard/navigation', emoji: '🧭', color: 'from-orange-500/10 to-amber-500/10 border-orange-200 dark:border-orange-800 hover:border-orange-400' },
  { label: 'Newsletter', desc: 'Kampagne erstellen', href: '/dashboard/newsletter/campaigns', emoji: '📧', color: 'from-pink-500/10 to-rose-500/10 border-pink-200 dark:border-pink-800 hover:border-pink-400' },
  { label: 'Benutzer', desc: 'Team verwalten', href: '/dashboard/users', emoji: '👥', color: 'from-indigo-500/10 to-blue-500/10 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400' },
  { label: 'Analytics', desc: 'Statistiken ansehen', href: '/dashboard/analytics', emoji: '📊', color: 'from-teal-500/10 to-cyan-500/10 border-teal-200 dark:border-teal-800 hover:border-teal-400' },
  { label: 'Einstellungen', desc: 'Workspace konfigurieren', href: '/dashboard/settings', emoji: '⚙️', color: 'from-gray-500/10 to-slate-500/10 border-gray-200 dark:border-gray-700 hover:border-gray-400' },
  { label: 'Media', desc: 'Dateien verwalten', href: '/dashboard/media', emoji: '🖼️', color: 'from-yellow-500/10 to-orange-500/10 border-yellow-200 dark:border-yellow-800 hover:border-yellow-400' },
];

const STATS = [
  { name: 'Gesamtumsatz', value: '€0', change: '+0%', up: true, emoji: '💰' },
  { name: 'Neue Benutzer', value: '1', change: '+100%', up: true, emoji: '👤' },
  { name: 'Blog Posts', value: '0', change: '+0%', up: true, emoji: '📝' },
  { name: 'Besucher', value: '0', change: '0%', up: true, emoji: '👁' },
];

export default function DashboardPage() {
  const { user, tenant } = useAuth();
  const { data, loading } = useQuery(ME_QUERY, { fetchPolicy: 'cache-and-network' });
  const { hasFeature, getLimit, currentPackage, packageName } = usePackage();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Lädt...</p>
        </div>
      </div>
    );
  }

  const currentUser = data?.me?.user || user;
  const currentTenant = data?.me?.tenant || tenant;

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Willkommen, {currentUser?.firstName}! 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentTenant?.name} · <span className="capitalize font-medium text-primary">{packageName} Plan</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PackageBadge />
          {currentPackage !== 'enterprise' && (
            <Link href="/dashboard/packages">
              <Button size="sm" className="btn-glow text-xs">
                ⬆ Upgrade
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.name} className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.emoji}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                stat.up
                  ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
                  : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground leading-none mb-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">⚡ Schnellaktionen</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex flex-col gap-2 p-4 rounded-xl border bg-gradient-to-br transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group ${action.color}`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200 w-fit">{action.emoji}</span>
              <div>
                <div className="text-sm font-semibold text-foreground leading-tight">{action.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{action.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Package Info + User/Workspace */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Package */}
        <Card hover className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">📦 Dein Package</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Package', value: packageName },
                { label: 'Users', value: getLimit('users') === -1 ? '∞' : String(getLimit('users')) },
                { label: 'Posts', value: getLimit('posts') === -1 ? '∞' : String(getLimit('posts')) },
                { label: 'Produkte', value: getLimit('products') === -1 ? '∞' : String(getLimit('products') || '0') },
              ].map(item => (
                <div key={item.label} className="bg-muted rounded-lg p-3 border border-border">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{item.label}</div>
                  <div className="text-lg font-bold text-foreground capitalize mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Active Features */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {hasFeature('cms') && <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-semibold rounded-full border border-primary/20">CMS</span>}
              {hasFeature('shop') && <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-semibold rounded-full border border-green-500/20">Shop</span>}
              {hasFeature('analytics') && <span className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold rounded-full border border-blue-500/20">Analytics</span>}
              {hasFeature('newsletter') && <span className="px-2 py-1 bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-semibold rounded-full border border-pink-500/20">Newsletter</span>}
            </div>

            {currentPackage !== 'enterprise' && (
              <Link href="/dashboard/packages" className="block">
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors duration-150 cursor-pointer">
                  <div className="text-xs font-semibold text-foreground">Mehr Features freischalten</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {currentPackage === 'starter' && 'Business für Shop & Analytics'}
                    {currentPackage === 'business' && 'Enterprise für Email & unbegrenzte Features'}
                  </div>
                </div>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* User + Workspace */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
          <Card hover>
            <CardHeader>
              <CardTitle className="text-base">👤 Benutzer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {[
                  { label: 'Name', value: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() },
                  { label: 'E-Mail', value: currentUser?.email },
                  { label: 'Rolle', value: currentUser?.role },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                    <span className="text-xs font-semibold text-foreground capitalize truncate max-w-[55%] text-right">{item.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-muted-foreground font-medium">E-Mail verifiziert</span>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                    currentUser?.emailVerified
                      ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
                      : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
                  }`}>
                    {currentUser?.emailVerified ? '✓ Ja' : '✗ Nein'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle className="text-base">🏢 Workspace</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {[
                  { label: 'Name', value: currentTenant?.name },
                  { label: 'Slug', value: currentTenant?.slug },
                  { label: 'Package', value: packageName },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                    <span className="text-xs font-semibold text-foreground capitalize truncate max-w-[55%] text-right">{item.value}</span>
                  </div>
                ))}
                <div className="pt-1">
                  <Link href="/dashboard/settings" className="text-xs text-primary hover:underline font-medium">
                    Einstellungen öffnen →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Usage Dashboard */}
      <UsageDashboard />
    </div>
  );
}