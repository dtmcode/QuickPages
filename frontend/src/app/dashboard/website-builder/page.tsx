'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { usePackage } from '@/contexts/package-context';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const DASHBOARD_STATS = gql`
  query DashboardStats($tenantId: String!) {
    wbTemplates(tenantId: $tenantId) {
      id
      name
      isDefault
      isActive
      thumbnailUrl
      createdAt
      updatedAt
      pages {
        id
        isHomepage
        slug
        sections { id }
      }
    }
  }
`;

const SET_DEFAULT = gql`
  mutation SetDefaultTemplate($id: String!, $tenantId: String!) {
    setDefaultTemplate(id: $id, tenantId: $tenantId) { id isDefault }
  }
`;

const CLONE_TEMPLATE = gql`
  mutation CloneTemplate($id: String!, $tenantId: String!, $newName: String) {
    cloneTemplate(id: $id, tenantId: $tenantId, newName: $newName) { id name }
  }
`;

const DELETE_TEMPLATE = gql`
  mutation DeleteTemplate($id: String!, $tenantId: String!) {
    deleteTemplate(id: $id, tenantId: $tenantId)
  }
`;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Heute';
  if (days === 1) return 'Gestern';
  if (days < 7) return `vor ${days} Tagen`;
  if (days < 30) return `vor ${Math.floor(days / 7)} Wochen`;
  return `vor ${Math.floor(days / 30)} Monaten`;
}

// ─── Module die je nach Paket freigeschaltet sind ────────────────────────────
type GatedFeature = 'cms' | 'shop' | 'email' | 'analytics' | 'customDomain';

interface PageModule {
  icon: string;
  label: string;
  desc: string;
  feature?: GatedFeature;
  badge?: string;
  href: string;
  comingSoon?: boolean;
}

const PAGE_MODULES: PageModule[] = [
  {
    icon: '🌐',
    label: 'Website / Landing Page',
    desc: 'Seiten, Sections und Editoren verwalten',
    href: '/dashboard/website-builder/website-templates',
  },
  {
    icon: '🛒',
    label: 'Shop-Seiten',
    desc: 'Produkt- und Kategorie-Seiten gestalten',
    feature: 'shop',
    badge: 'Shop-Modul',
    href: '/dashboard/shop',
  },
  {
    icon: '📝',
    label: 'Blog-Seiten',
    desc: 'Blog- und Artikel-Layouts anpassen',
    feature: 'cms',
    badge: 'CMS-Modul',
    href: '/dashboard/cms/posts',
  },
  {
    icon: '🚀',
    label: 'ClickFunnels / Funnels',
    desc: 'High-converting Landing Pages und Funnels',
    href: '/dashboard/website-builder/create',
    badge: 'Neu',
  },
  {
    icon: '🔐',
    label: 'Mitglieder-Bereich',
    desc: 'Geschützte Seiten für Kurse und Communities',
    comingSoon: true,
    href: '#',
    badge: 'Bald',
  },
  {
    icon: '📅',
    label: 'Booking-Seite',
    desc: 'Online-Buchungsseite gestalten',
    href: '/dashboard/booking',
  },
];

// ─── Editor-Typen Übersicht ───────────────────────────────────────────────────
const EDITORS = [
  {
    icon: '✦',
    label: 'WYSIWYG Editor',
    desc: 'Klick-basiert, direkt auf der Seite bearbeiten',
    color: 'from-orange-500 to-pink-500',
  },
  {
    icon: '🎨',
    label: 'Visual Editor',
    desc: 'Sections per Drag & Drop zusammenstellen',
    color: 'from-purple-600 to-blue-600',
  },
  {
    icon: '👁',
    label: 'Preview',
    desc: 'Live-Vorschau wie die Seite aussieht',
    color: 'from-teal-500 to-green-500',
  },
  {
    icon: '⚙️',
    label: 'Settings Editor',
    desc: 'SEO, Meta-Daten und Seiten-Einstellungen',
    color: 'from-slate-500 to-slate-700',
  },
];

// ─── Template Card ────────────────────────────────────────────────────────────
function TemplateCard({
  template, onSetDefault, onClone, onDelete,
}: {
  template: any;
  onSetDefault: (id: string) => void;
  onClone: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const pageCount = template.pages?.length ?? 0;
  const sectionCount = template.pages?.reduce(
    (acc: number, p: any) => acc + (p.sections?.length ?? 0), 0,
  ) ?? 0;

  return (
    <div className="group relative rounded-2xl border-2 border-border overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-300 bg-card">
      <Link href={`/dashboard/website-builder/website-templates/${template.id}`} className="block">
        {template.thumbnailUrl ? (
          <div className="h-36 bg-muted overflow-hidden">
            <img
              src={template.thumbnailUrl}
              alt={template.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="h-36 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-4xl">
            🎨
          </div>
        )}
      </Link>

      <div className="p-4">
        <Link href={`/dashboard/website-builder/website-templates/${template.id}`}>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-1 text-sm">
            {template.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mb-3">
          {pageCount} Seiten · {sectionCount} Sections · {timeAgo(template.updatedAt || template.createdAt)}
        </p>

        <div className="flex flex-wrap gap-1.5">
          <Link
            href={`/dashboard/website-builder/website-templates/${template.id}`}
            className="flex-1 text-center text-xs px-2 py-1.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            onClick={e => e.stopPropagation()}
          >
            ✏️ Öffnen
          </Link>
          <button
            onClick={() => onClone(template.id, template.name)}
            className="text-xs px-2 py-1.5 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/70 transition-colors"
          >
            📋
          </button>
          {!template.isDefault && (
            <button
              onClick={() => onSetDefault(template.id)}
              className="text-xs px-2 py-1.5 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/70 transition-colors"
            >
              ⭐
            </button>
          )}
          {!template.isDefault && (
            <button
              onClick={() => onDelete(template.id, template.name)}
              className="text-xs px-2 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-semibold hover:bg-red-100 transition-colors"
            >
              🗑
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function WebsiteBuilderDashboard() {
  const { tenant } = useAuth();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { hasFeature } = usePackage() as any;
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(DASHBOARD_STATS, {
    variables: { tenantId: tenant?.id },
    skip: !tenant?.id,
  });

  const [setDefaultMut] = useMutation(SET_DEFAULT);
  const [cloneMut] = useMutation(CLONE_TEMPLATE);
  const [deleteMut] = useMutation(DELETE_TEMPLATE);

  const templates: any[] = data?.wbTemplates || [];
  const defaultTemplate = templates.find((t) => t.isDefault);
  const otherTemplates = templates.filter((t) => !t.isDefault);
  const totalPages = templates.reduce((acc, t) => acc + (t.pages?.length ?? 0), 0);
  const totalSections = templates.reduce(
    (acc, t) => acc + (t.pages?.reduce((a: number, p: any) => a + (p.sections?.length ?? 0), 0) ?? 0), 0,
  );

  const handleSetDefault = async (id: string) => {
    setActionLoading(id);
    try { await setDefaultMut({ variables: { id, tenantId: tenant!.id } }); await refetch(); }
    catch (e) { console.error(e); }
    finally { setActionLoading(null); }
  };

  const handleClone = async (id: string, name: string) => {
    setActionLoading(id);
    try {
      const res = await cloneMut({ variables: { id, tenantId: tenant!.id, newName: `${name} (Kopie)` } });
      await refetch();
      if (res.data?.cloneTemplate?.id) {
        router.push(`/dashboard/website-builder/website-templates/${res.data.cloneTemplate.id}`);
      }
    } catch (e) { console.error(e); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" wirklich löschen? Alle Seiten und Sections gehen verloren.`)) return;
    setActionLoading(id);
    try { await deleteMut({ variables: { id, tenantId: tenant!.id } }); await refetch(); }
    catch (e) { console.error(e); }
    finally { setActionLoading(null); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">🎨 Website Builder</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {templates.length} {templates.length === 1 ? 'Website' : 'Websites'} · {totalPages} Seiten · {totalSections} Sections
          </p>
        </div>
        {/* ✅ FIX: korrekte Route /create statt /website-templates/create */}
        <Link
          href="/dashboard/website-builder/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md text-sm"
        >
          + Neue Website erstellen
        </Link>
      </div>

      {/* ── LIVE WEBSITE ── */}
      {defaultTemplate ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <h2 className="text-base font-bold text-foreground">Live Website</h2>
          </div>

          <div className="rounded-2xl border-2 border-green-500 overflow-hidden shadow-lg shadow-green-500/10 bg-card">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-72 h-44 md:h-auto flex-shrink-0">
                {defaultTemplate.thumbnailUrl ? (
                  <img src={defaultTemplate.thumbnailUrl} alt={defaultTemplate.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center text-5xl min-h-[11rem]">
                    🎨
                  </div>
                )}
              </div>
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center gap-1.5 bg-green-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                      </span>
                      Live
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(defaultTemplate.updatedAt || defaultTemplate.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-1">{defaultTemplate.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {defaultTemplate.pages?.length ?? 0} Seiten ·{' '}
                    {defaultTemplate.pages?.reduce((a: number, p: any) => a + (p.sections?.length ?? 0), 0) ?? 0} Sections
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* ✅ FIX: korrekte Route [templateId] nicht [templateId]/pages */}
                  <Link
                    href={`/dashboard/website-builder/website-templates/${defaultTemplate.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all"
                  >
                    ✏️ Editor öffnen
                  </Link>
                  <a
                    href={`https://${tenant?.slug}.myquickpage.de`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-all"
                  >
                    🌐 Ansehen
                  </a>
                  <button
                    onClick={() => handleClone(defaultTemplate.id, defaultTemplate.name)}
                    disabled={actionLoading === defaultTemplate.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-muted text-foreground rounded-xl font-semibold text-sm hover:bg-muted/70 transition-all disabled:opacity-50"
                  >
                    📋 Klonen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center">
            <div className="text-7xl mb-5">🎨</div>
            <h3 className="text-xl font-bold mb-2 text-foreground">Willkommen beim Website Builder!</h3>
            <p className="text-muted-foreground mb-6 text-sm max-w-md mx-auto">
              Erstelle deine erste Website. Wähle aus professionellen Templates oder starte von Null — mit automatischem Impressum und Datenschutz.
            </p>
            <Link
              href="/dashboard/website-builder/create"
              className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
            >
              ✦ Erste Website erstellen
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {/* ── WEITERE WEBSITES ── */}
      {otherTemplates.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">
              Weitere Websites ({otherTemplates.length})
            </h2>
            <Link href="/dashboard/website-builder/website-templates" className="text-sm text-primary hover:text-primary/80 font-medium">
              Alle →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {otherTemplates.map((t) => (
              <div key={t.id} className={actionLoading === t.id ? 'opacity-50 pointer-events-none' : ''}>
                <TemplateCard
                  template={t}
                  onSetDefault={handleSetDefault}
                  onClone={handleClone}
                  onDelete={handleDelete}
                />
              </div>
            ))}
            <Link
              href="/dashboard/website-builder/create"
              className="group flex flex-col items-center justify-center min-h-[220px] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-card hover:bg-primary/5 transition-all p-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center text-xl mb-3 transition-all group-hover:scale-110">
                +
              </div>
              <p className="font-semibold text-muted-foreground group-hover:text-foreground text-sm transition-colors">
                Neue Website
              </p>
            </Link>
          </div>
        </div>
      )}

      {/* ── SEITEN-MODULE (paket-aware) ── */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-1">Seiten-Module</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Je nach Paket stehen dir verschiedene Seiten-Typen zur Verfügung
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PAGE_MODULES.map((mod) => {
            const isLocked = !!mod.feature && !hasFeature(mod.feature);
            const isSoon = mod.comingSoon;

            if (isLocked || isSoon) {
              return (
                <div
                  key={mod.label}
                  className="relative flex items-start gap-4 p-4 rounded-xl border-2 border-dashed border-border bg-muted/30 opacity-60 select-none"
                >
                  <span className="text-2xl grayscale">{mod.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{mod.label}</p>
                      {mod.badge && (
                        <span className="text-[10px] px-2 py-0.5 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full font-medium">
                          {mod.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                      {isSoon ? '⏳ Bald verfügbar' : '🔒 Upgrade erforderlich'}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={mod.label}
                href={mod.href}
                className="group flex items-start gap-4 p-4 rounded-xl border-2 border-border bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm transition-all"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{mod.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {mod.label}
                    </p>
                    {mod.badge && (
                      <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium border border-primary/20">
                        {mod.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
                </div>
                <span className="text-muted-foreground group-hover:translate-x-1 transition-transform text-sm flex-shrink-0">
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── EDITOREN ÜBERSICHT ── */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-1">Verfügbare Editoren</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Für jede Seite hast du mehrere Editor-Optionen — öffne sie über die Seiten-Ansicht
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {EDITORS.map((ed) => (
            <div
              key={ed.label}
              className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-all"
            >
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${ed.color} flex items-center justify-center text-white font-bold text-sm mb-3`}>
                {ed.icon}
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">{ed.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{ed.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── QUICK LINKS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: '🌟', title: 'Template-Galerie', desc: 'Professionelle Vorlagen', href: '/dashboard/website-builder/website-templates/global-templates' },
          { icon: '🧭', title: 'Navigation', desc: 'Header & Footer Menüs', href: '/dashboard/website-builder/navigation' },
          { icon: '📊', title: 'Analytics', desc: 'Besucher & Seitenaufrufe', href: '/dashboard/analytics' },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-card hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm transition-all"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}