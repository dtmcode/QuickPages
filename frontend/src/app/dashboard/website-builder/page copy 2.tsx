'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ==================== GRAPHQL ====================

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

// ==================== HELPERS ====================

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Heute';
  if (days === 1) return 'Gestern';
  if (days < 7) return `vor ${days} Tagen`;
  if (days < 30) return `vor ${Math.floor(days / 7)} Wochen`;
  return `vor ${Math.floor(days / 30)} Monaten`;
}

// ==================== QUICK ACTION BUTTON ====================

function QuickBtn({
  icon, label, onClick, danger = false, disabled = false,
}: {
  icon: string; label: string; onClick: (e: React.MouseEvent) => void;
  danger?: boolean; disabled?: boolean;
}) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!disabled) onClick(e); }}
      disabled={disabled}
      title={label}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
        ${danger
          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
          : 'bg-muted text-foreground hover:bg-muted/70'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
      `}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ==================== TEMPLATE CARD ====================

function TemplateCard({
  template, onSetDefault, onClone, onDelete, isLive,
}: {
  template: any;
  onSetDefault: (id: string) => void;
  onClone: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
  isLive: boolean;
}) {
  const pageCount = template.pages?.length ?? 0;
  const sectionCount = template.pages?.reduce((acc: number, p: any) => acc + (p.sections?.length ?? 0), 0) ?? 0;

  return (
    <div className={`group relative rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-xl
      ${isLive
        ? 'border-green-500 shadow-green-500/20 shadow-lg'
        : template.isDefault
        ? 'border-purple-400 shadow-purple-500/10 shadow-md'
        : 'border-border hover:border-primary/40'
      }
    `}>

      {/* Live-Puls-Badge */}
      {isLive && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          Live
        </div>
      )}

      {/* Standard Badge */}
      {template.isDefault && !isLive && (
        <div className="absolute top-3 left-3 z-20 bg-purple-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md">
          ⭐ Standard
        </div>
      )}

      {/* Thumbnail */}
      <Link href={`/dashboard/website-builder/website-templates/${template.id}`} className="block">
        {template.thumbnailUrl ? (
          <div className="h-44 bg-muted overflow-hidden">
            <img
              src={template.thumbnailUrl}
              alt={template.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className={`h-44 flex items-center justify-center text-5xl transition-all duration-300
            ${isLive ? 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20'
              : 'bg-gradient-to-br from-muted to-muted/50'}
          `}>
            🎨
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 bg-card">
        <Link href={`/dashboard/website-builder/website-templates/${template.id}`}>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors duration-200 mb-1 line-clamp-1">
            {template.name}
          </h3>
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span>{pageCount} {pageCount === 1 ? 'Seite' : 'Seiten'}</span>
          <span>·</span>
          <span>{sectionCount} Sections</span>
          <span>·</span>
          <span>{timeAgo(template.updatedAt || template.createdAt)}</span>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {template.isActive && (
            <span className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-full text-xs font-medium">
              ✓ Aktiv
            </span>
          )}
          {!template.isActive && (
            <span className="px-2 py-0.5 bg-muted text-muted-foreground border border-border rounded-full text-xs font-medium">
              Inaktiv
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
          <Link
            href={`/dashboard/website-builder/website-templates/${template.id}/pages`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={e => e.stopPropagation()}
          >
            ✏️ <span className="hidden sm:inline">Bearbeiten</span>
          </Link>

          <Link
            href={`/${template.pages?.find((p: any) => p.isHomepage)?.slug ?? ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-foreground hover:bg-muted/70 transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={e => e.stopPropagation()}
          >
            👁 <span className="hidden sm:inline">Vorschau</span>
          </Link>

          {!template.isDefault && (
            <QuickBtn
              icon="⭐"
              label="Standard"
              onClick={() => onSetDefault(template.id)}
            />
          )}

          <QuickBtn
            icon="📋"
            label="Klonen"
            onClick={() => onClone(template.id, template.name)}
          />

          {!template.isDefault && (
            <QuickBtn
              icon="🗑"
              label="Löschen"
              danger
              onClick={() => onDelete(template.id, template.name)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function WebsiteBuilderDashboard() {
  const { tenant } = useAuth();
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(DASHBOARD_STATS, {
    variables: { tenantId: tenant?.id },
    skip: !tenant?.id,
  });

  const [setDefaultMut] = useMutation(SET_DEFAULT);
  const [cloneMut] = useMutation(CLONE_TEMPLATE);
  const [deleteMut] = useMutation(DELETE_TEMPLATE);

  const templates = data?.wbTemplates || [];
  const defaultTemplate = templates.find((t: any) => t.isDefault);
  const otherTemplates = templates.filter((t: any) => !t.isDefault);
  const totalPages = templates.reduce((acc: number, t: any) => acc + (t.pages?.length ?? 0), 0);
  const totalSections = templates.reduce((acc: number, t: any) =>
    acc + (t.pages?.reduce((a: number, p: any) => a + (p.sections?.length ?? 0), 0) ?? 0), 0);

  const handleSetDefault = async (id: string) => {
    setActionLoading(id);
    try {
      await setDefaultMut({ variables: { id, tenantId: tenant!.id } });
      await refetch();
    } catch (e) { console.error(e); }
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
    try {
      await deleteMut({ variables: { id, tenantId: tenant!.id } });
      await refetch();
    } catch (e) { console.error(e); }
    finally { setActionLoading(null); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Lädt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🎨 Website Builder</h1>
          <p className="text-muted-foreground mt-1">Verwalte und bearbeite deine Websites</p>
        </div>
        <Link
          href="/dashboard/website-builder/website-templates/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 text-sm"
        >
          + Neue Website
        </Link>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Websites', value: templates.length, icon: '🌐', color: 'from-blue-500 to-blue-600', href: '/dashboard/website-builder/website-templates' },
          { label: 'Seiten gesamt', value: totalPages, icon: '📄', color: 'from-violet-500 to-violet-600', href: null },
          { label: 'Sections gesamt', value: totalSections, icon: '⬛', color: 'from-teal-500 to-teal-600', href: null },
          { label: 'Navigation', value: 'Menüs', icon: '🧭', color: 'from-orange-500 to-orange-600', href: '/dashboard/website-builder/navigation' },
        ].map((stat) => (
          <Card key={stat.label} className={`bg-gradient-to-br ${stat.color} border-0 shadow-lg overflow-hidden group`}>
            <CardContent className="p-5 text-white">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-white/70 text-xs font-medium mb-1">{stat.label}</p>
                  <p className={`font-bold ${typeof stat.value === 'number' ? 'text-3xl' : 'text-xl'}`}>{stat.value}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-2.5 text-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
              </div>
              {stat.href && (
                <Link href={stat.href} className="text-white/70 hover:text-white text-xs transition-colors flex items-center gap-1 group/link">
                  Öffnen <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── LIVE TEMPLATE HERO ── */}
      {defaultTemplate ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <h2 className="text-lg font-bold text-foreground">Live Website</h2>
          </div>

          <div className="relative rounded-2xl border-2 border-green-500 overflow-hidden shadow-lg shadow-green-500/10 bg-card">
            <div className="flex flex-col md:flex-row">

              {/* Thumbnail */}
              <div className="md:w-80 h-48 md:h-auto flex-shrink-0 relative">
                {defaultTemplate.thumbnailUrl ? (
                  <img src={defaultTemplate.thumbnailUrl} alt={defaultTemplate.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center text-6xl">
                    🎨
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/20 md:to-card/40" />
              </div>

              {/* Info */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                      </span>
                      Live & Aktiv
                    </div>
                    <span className="text-xs text-muted-foreground">Zuletzt bearbeitet: {timeAgo(defaultTemplate.updatedAt || defaultTemplate.createdAt)}</span>
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-1">{defaultTemplate.name}</h3>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>📄 {defaultTemplate.pages?.length ?? 0} Seiten</span>
                    <span>⬛ {defaultTemplate.pages?.reduce((a: number, p: any) => a + (p.sections?.length ?? 0), 0) ?? 0} Sections</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/website-builder/website-templates/${defaultTemplate.id}/pages`}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                  >
                    ✏️ Editor öffnen
                  </Link>
                  <a
                    href={`/${tenant?.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                  >
                    🌐 Website ansehen
                  </a>
                  <Link
                    href={`/dashboard/website-builder/website-templates/${defaultTemplate.id}`}
                    className="flex items-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-xl font-semibold text-sm hover:bg-muted/70 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    ⚙️ Einstellungen
                  </Link>
                  <button
                    onClick={() => handleClone(defaultTemplate.id, defaultTemplate.name)}
                    disabled={actionLoading === defaultTemplate.id}
                    className="flex items-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-xl font-semibold text-sm hover:bg-muted/70 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    📋 Klonen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : templates.length === 0 ? (
        /* ── LEER-STATE ── */
        <Card className="shadow-lg">
          <CardContent className="p-16 text-center">
            <div className="text-8xl mb-6">🎨</div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">Willkommen beim Website Builder!</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Erstelle deine erste Website. Wähle aus professionellen Templates oder starte von Null.
            </p>
            <Link
              href="/dashboard/website-builder/website-templates/create"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              ✦ Erste Website erstellen
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {/* ── WEITERE TEMPLATES ── */}
      {otherTemplates.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Weitere Websites ({otherTemplates.length})</h2>
            <Link href="/dashboard/website-builder/website-templates" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
              Alle ansehen →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {otherTemplates.map((template: any) => (
              <div key={template.id} className={actionLoading === template.id ? 'opacity-50 pointer-events-none' : ''}>
                <TemplateCard
                  template={template}
                  onSetDefault={handleSetDefault}
                  onClone={handleClone}
                  onDelete={handleDelete}
                  isLive={false}
                />
              </div>
            ))}

            {/* + Neue Website Karte */}
            <Link
              href="/dashboard/website-builder/website-templates/create"
              className="group flex flex-col items-center justify-center h-full min-h-[280px] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-card hover:bg-primary/5 transition-all duration-300 p-6 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted group-hover:bg-primary/10 flex items-center justify-center text-2xl mb-4 transition-all duration-300 group-hover:scale-110">
                +
              </div>
              <p className="font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Neue Website</p>
              <p className="text-xs text-muted-foreground mt-1">Template oder von Null</p>
            </Link>
          </div>
        </div>
      )}

      {/* ── QUICK LINKS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: '🌟',
            title: 'Template-Galerie',
            desc: 'Professionelle Vorlagen entdecken',
            href: '/dashboard/website-builder/website-templates/global-templates',
            color: 'hover:border-purple-400 hover:bg-purple-500/5',
          },
          {
            icon: '🧭',
            title: 'Navigation',
            desc: 'Header & Footer Menüs verwalten',
            href: '/dashboard/website-builder/navigation',
            color: 'hover:border-orange-400 hover:bg-orange-500/5',
          },
          {
            icon: '📊',
            title: 'Analytics',
            desc: 'Besucher & Seitenaufrufe',
            href: '/dashboard/analytics',
            color: 'hover:border-teal-400 hover:bg-teal-500/5',
          },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={`group flex items-center gap-4 p-5 rounded-2xl border-2 border-border bg-card transition-all duration-300 ${item.color} hover:shadow-md`}
          >
            <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
            <div>
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <span className="ml-auto text-muted-foreground group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        ))}
      </div>

    </div>
  );
}