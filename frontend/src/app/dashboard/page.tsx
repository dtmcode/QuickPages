'use client';

import { useQuery, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { usePackage } from '@/contexts/package-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

// ─── PackageFeatures hat nur: cms | shop | email | analytics | customDomain ──
// Alle anderen Module (booking, forms, ai, newsletter) sind nicht über
// hasFeature prüfbar — Backend-Guards regeln den tatsächlichen Zugriff.
type GatedFeature = 'cms' | 'shop' | 'email' | 'analytics' | 'customDomain';

interface QuickAction {
  icon: string;
  label: string;
  sub: string;
  href: string;
  gatedBy?: GatedFeature;
}

const QUICK_ACTIONS: QuickAction[] = [
  { icon: '🎨', label: 'Website bearbeiten',  sub: 'Builder öffnen',           href: '/dashboard/website-builder' },
  { icon: '📝', label: 'Neuer Post',          sub: 'Inhalt erstellen',          href: '/dashboard/cms/posts/new',            gatedBy: 'cms' },
  { icon: '🛒', label: 'Neues Produkt',       sub: 'Shop erweitern',            href: '/dashboard/shop/products/new',        gatedBy: 'shop' },
  { icon: '📅', label: 'Termin anlegen',      sub: 'Booking verwalten',         href: '/dashboard/booking' },
  { icon: '📧', label: 'Neue Kampagne',       sub: 'Newsletter senden',         href: '/dashboard/newsletter/campaigns/new', gatedBy: 'email' },
  { icon: '📋', label: 'Neues Formular',      sub: 'Formular erstellen',        href: '/dashboard/forms/new' },
  { icon: '🤖', label: 'AI Content',          sub: 'Text generieren',           href: '/dashboard/ai' },
  { icon: '📊', label: 'Analytics',           sub: 'Besucher auswerten',        href: '/dashboard/analytics',                gatedBy: 'analytics' },
  { icon: '👥', label: 'Team verwalten',      sub: 'Benutzer einladen',         href: '/dashboard/users' },
  { icon: '⚙️',  label: 'Einstellungen',      sub: 'Workspace konfigurieren',   href: '/dashboard/settings' },
];

// ─── Stat-Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <Card hover>
      <CardContent className="p-5">
        <span className="text-2xl">{icon}</span>
        <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

// ─── Package-Banner (slim) ────────────────────────────────────────────────────
function PackageBanner({ packageName, currentPackage }: { packageName: string; currentPackage: string }) {
  const isEnterprise = currentPackage === 'enterprise' || currentPackage === 'platform-admin';
  return (
    <div className={`flex items-center justify-between px-5 py-3 rounded-xl border transition-all duration-300 ${
      isEnterprise ? 'bg-primary/5 border-primary/20' : 'bg-amber-500/5 border-amber-500/20'
    }`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{isEnterprise ? '⭐' : '📦'}</span>
        <div>
          <span className="text-xs text-muted-foreground">Aktuelles Paket</span>
          <p className="text-sm font-semibold text-foreground capitalize leading-tight">{packageName}</p>
        </div>
      </div>
      <Link href="/dashboard/packages">
        <Button size="sm" variant={isEnterprise ? 'ghost' : 'primary'} className={`text-xs h-8 ${!isEnterprise ? 'btn-glow' : ''}`}>
          {isEnterprise ? 'Verwalten →' : 'Upgrade ↑'}
        </Button>
      </Link>
    </div>
  );
}

// ─── Quick Action Card ────────────────────────────────────────────────────────
function ActionCard({ action, locked }: { action: QuickAction; locked: boolean }) {
  if (locked) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border opacity-40 cursor-not-allowed select-none">
        <span className="text-xl grayscale">{action.icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{action.label}</p>
          <p className="text-xs text-muted-foreground truncate">🔒 Upgrade erforderlich</p>
        </div>
      </div>
    );
  }
  return (
    <Link
      href={action.href}
      className="flex items-center gap-3 p-4 rounded-xl border border-border transition-all duration-200 hover:bg-primary/5 hover:border-primary/30 hover:shadow-sm group"
    >
      <span className="text-xl transition-transform duration-200 group-hover:scale-110">{action.icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{action.label}</p>
        <p className="text-xs text-muted-foreground truncate">{action.sub}</p>
      </div>
    </Link>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, tenant } = useAuth();
  const { data, loading } = useQuery(ME_QUERY, { fetchPolicy: 'cache-and-network' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { hasFeature, getLimit, currentPackage, packageName } = usePackage() as any;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Lädt...</p>
        </div>
      </div>
    );
  }

  const currentUser = data?.me?.user || user;
  const currentTenant = data?.me?.tenant || tenant;

  const fmt = (v: number) => (v === -1 ? '∞' : v?.toLocaleString() ?? '0');

  const stats = [
    { icon: '📝', label: 'Posts-Limit',    value: fmt(getLimit('posts')) },
    { icon: '🛒', label: 'Produkte-Limit', value: fmt(getLimit('products')) },
    { icon: '👥', label: 'User-Limit',     value: fmt(getLimit('users')) },
    { icon: '📧', label: 'Emails / Monat', value: fmt(getLimit('emailsPerMonth')) },
  ];

  const actions = QUICK_ACTIONS.map((a) => ({
    ...a,
    locked: !!a.gatedBy && !hasFeature(a.gatedBy),
  }));

  // Nur PackageFeatures-Keys: cms | shop | email | analytics | customDomain
  const activeFeatures: string[] = [
    hasFeature('cms') && 'CMS',
    hasFeature('shop') && 'Shop',
    hasFeature('analytics') && 'Analytics',
    hasFeature('email') && 'Newsletter',
    hasFeature('customDomain') && 'Custom Domain',
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Willkommen zurück, {currentUser?.firstName}! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {currentTenant?.name} · <span className="text-primary">{currentTenant?.slug}</span>
          </p>
        </div>
        <PackageBanner packageName={packageName} currentPackage={currentPackage} />
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Schnellaktionen ── */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Schnellaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {actions.map((a) => (
              <ActionCard key={a.href} action={a} locked={a.locked} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Info-Row ── */}
      <div className="grid lg:grid-cols-2 gap-6">

        <Card hover>
          <CardHeader>
            <CardTitle>👤 Benutzer</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-0">
              {([
                ['Name',   `${currentUser?.firstName ?? ''} ${currentUser?.lastName ?? ''}`],
                ['E-Mail', currentUser?.email ?? ''],
                ['Rolle',  currentUser?.role ?? ''],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-border last:border-0">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-xs font-medium text-foreground capitalize">{value}</dd>
                </div>
              ))}
              <div className="flex justify-between py-2">
                <dt className="text-xs text-muted-foreground">E-Mail verifiziert</dt>
                <dd>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    currentUser?.emailVerified
                      ? 'text-green-600 bg-green-100 dark:bg-green-900/20'
                      : 'text-red-600 bg-red-100 dark:bg-red-900/20'
                  }`}>
                    {currentUser?.emailVerified ? 'Ja ✓' : 'Nein ✗'}
                  </span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <CardTitle>🏢 Workspace & Features</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-0 mb-4">
              {([
                ['Workspace', currentTenant?.name ?? ''],
                ['Slug',      currentTenant?.slug ?? ''],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-border last:border-0">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-xs font-medium text-primary">{value}</dd>
                </div>
              ))}
            </dl>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Aktive Features</p>
              <div className="flex flex-wrap gap-1.5">
                {activeFeatures.length > 0 ? activeFeatures.map((f) => (
                  <span key={f} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                    {f}
                  </span>
                )) : (
                  <span className="text-xs text-muted-foreground">Keine Features aktiv</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Usage ── */}
      <UsageDashboard />
    </div>
  );
}