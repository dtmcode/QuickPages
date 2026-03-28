// 📂 PFAD: frontend/src/app/dashboard/website-builder/website-templates/global-templates/page.tsx
// ÄNDERUNG: isPremium Templates werden basierend auf Paket gesperrt angezeigt
'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { usePackage } from '@/contexts/package-context';
import { useState } from 'react';
import Link from 'next/link';

const GET_ALL_GLOBAL_TEMPLATES = gql`
  query GetAllGlobalTemplates {
    wbGlobalTemplates {
      id
      name
      description
      category
      thumbnailUrl
      isPremium
      previewUrl
      demoUrl
    }
  }
`;

const CLONE_GLOBAL_TEMPLATE = gql`
  mutation CloneGlobalTemplate($globalTemplateId: String!, $tenantId: String!) {
    cloneGlobalTemplate(globalTemplateId: $globalTemplateId, tenantId: $tenantId) {
      id
      name
    }
  }
`;

// Pakete die Premium Templates sehen dürfen
const PREMIUM_ALLOWED_PACKAGES = ['business', 'shop', 'professional', 'enterprise', 'creator'];

// Kategorie → Site-Typ Mapping (für Wizard-Redirect)
const CATEGORY_TO_SITETYPE: Record<string, string> = {
  onepage: 'onepage',
  portfolio: 'onepage',
  creative: 'onepage',
  blog: 'blog',
  magazine: 'blog',
  content: 'blog',
  landing: 'landing',
  funnel: 'landing',
  shop: 'shop',
  ecommerce: 'shop',
  business: 'multipage',
  corporate: 'multipage',
  agency: 'multipage',
  restaurant: 'multipage',
  members: 'member',
  course: 'member',
};

const CATEGORY_LABELS: Record<string, string> = {
  onepage: 'One-Page',
  portfolio: 'Portfolio',
  creative: 'Creative',
  blog: 'Blog',
  magazine: 'Magazine',
  landing: 'Landing',
  shop: 'Shop',
  ecommerce: 'E-Commerce',
  business: 'Business',
  corporate: 'Corporate',
  agency: 'Agentur',
  restaurant: 'Restaurant',
};

export default function GlobalTemplatesGalleryPage() {
  const { tenant } = useAuth();
  const { currentPackage } = usePackage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cloningId, setCloningId] = useState<string | null>(null);

  const { data, loading } = useQuery(GET_ALL_GLOBAL_TEMPLATES);
  const [cloneTemplate] = useMutation(CLONE_GLOBAL_TEMPLATE);

  const templates = data?.wbGlobalTemplates || [];
  const canUsePremium = PREMIUM_ALLOWED_PACKAGES.includes(currentPackage);

  const filteredTemplates = templates.filter((t: any) => {
    const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const categories = ['all', ...Array.from(new Set(templates.map((t: any) => t.category).filter(Boolean))) as string[]];

  const handleClone = async (template: any) => {
    if (template.isPremium && !canUsePremium) return; // blocked
    if (!confirm(`"${template.name}" verwenden?`)) return;
    setCloningId(template.id);
    try {
      const result = await cloneTemplate({
        variables: { globalTemplateId: template.id, tenantId: tenant.id },
      });
      window.location.href = `/dashboard/website-builder/website-templates/${result.data.cloneGlobalTemplate.id}`;
    } catch (err: any) {
      alert(`❌ Fehler: ${err.message}`);
    } finally {
      setCloningId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Lädt Templates…</p>
      </div>
    );
  }

  const premiumCount = templates.filter((t: any) => t.isPremium).length;
  const freeCount = templates.length - premiumCount;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/website-builder/website-templates" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 transition-colors">
          ← Zurück zu deinen Templates
        </Link>
        <h1 className="text-4xl font-bold mb-2 text-foreground">🌟 Template Galerie</h1>
        <p className="text-muted-foreground text-lg">
          {freeCount} kostenlose Templates{premiumCount > 0 && ` · ${premiumCount} Premium`}
        </p>
      </div>

      {/* Package hint if not premium */}
      {!canUsePremium && premiumCount > 0 && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
              ⭐ {premiumCount} Premium Templates verfügbar
            </p>
            <p className="text-amber-800 dark:text-amber-300 text-xs mt-0.5">
              Upgrade auf Business oder höher um alle Templates zu nutzen
            </p>
          </div>
          <Link
            href="/dashboard/packages"
            className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Upgraden →
          </Link>
        </div>
      )}

      {/* Search + Filter */}
      <div className="bg-card border border-border rounded-xl p-5 mb-8">
        <input
          type="text"
          placeholder="Templates durchsuchen…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent mb-4 transition-all"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat === 'all' ? 'Alle' : (CATEGORY_LABELS[cat] || cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template: any) => {
            const isLocked = template.isPremium && !canUsePremium;
            const isCloning = cloningId === template.id;

            return (
              <div
                key={template.id}
                className={`bg-card border border-border rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${isLocked ? 'opacity-80' : ''}`}
              >
                {/* Thumbnail */}
                <div className="relative">
                  {template.thumbnailUrl ? (
                    <img
                      src={template.thumbnailUrl}
                      alt={template.name}
                      className={`w-full h-48 object-cover ${isLocked ? 'filter grayscale' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center text-5xl">
                      🎨
                    </div>
                  )}

                  {/* Premium Badge */}
                  {template.isPremium && (
                    <div className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-md ${
                      canUsePremium
                        ? 'bg-amber-400 text-amber-900'
                        : 'bg-gray-800/80 text-white backdrop-blur-sm'
                    }`}>
                      {isLocked ? '🔒' : '⭐'} Premium
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-lg font-bold text-foreground">{template.name}</h3>
                  </div>

                  {template.category && (
                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium mb-3 capitalize">
                      {CATEGORY_LABELS[template.category] || template.category}
                    </span>
                  )}

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {template.demoUrl && (
                      <a
                        href={template.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-muted text-foreground px-3 py-2 rounded-lg hover:bg-muted/80 transition-all text-sm text-center font-medium"
                      >
                        👁️ Demo
                      </a>
                    )}

                    {isLocked ? (
                      <Link
                        href="/dashboard/packages"
                        className="flex-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-2 rounded-lg text-sm text-center font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all"
                      >
                        🔒 Upgraden
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleClone(template)}
                        disabled={isCloning}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-1"
                      >
                        {isCloning ? (
                          <><div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />Wird erstellt…</>
                        ) : '✨ Template verwenden'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Nichts gefunden</h3>
          <p className="text-muted-foreground mb-6">Versuche einen anderen Suchbegriff</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-all"
          >
            Filter zurücksetzen
          </button>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-muted-foreground">
        {filteredTemplates.length} von {templates.length} Templates
        {!canUsePremium && ` · ${premiumCount} Premium Templates mit Upgrade verfügbar`}
      </div>
    </div>
  );
}