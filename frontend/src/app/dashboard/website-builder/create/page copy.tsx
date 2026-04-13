// 📂 PFAD: frontend/src/app/dashboard/website-builder/create/page.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CREATE_TEMPLATE = gql`
  mutation CreateTemplate($input: CreateTemplateInput!, $tenantId: String!) {
    createTemplate(input: $input, tenantId: $tenantId) { id name }
  }
`;
const CREATE_PAGE = gql`
  mutation CreatePage($input: CreatePageInput!, $tenantId: String!) {
    createPage(input: $input, tenantId: $tenantId) { id slug }
  }
`;
const CLONE_GLOBAL_TEMPLATE = gql`
  mutation CloneGlobalTemplate($globalTemplateId: String!, $tenantId: String!) {
    cloneGlobalTemplate(globalTemplateId: $globalTemplateId, tenantId: $tenantId) { id name }
  }
`;
const SET_DEFAULT = gql`
  mutation SetDefaultTemplate($id: String!, $tenantId: String!) {
    setDefaultTemplate(id: $id, tenantId: $tenantId) { id isDefault }
  }
`;
const GET_GLOBAL_TEMPLATES = gql`
  query GetGlobalTemplates {
    wbGlobalTemplates { id name description category thumbnailUrl isPremium }
  }
`;
const GET_MY_TEMPLATES_COUNT = gql`
  query GetMyTemplatesCount($tenantId: String!) {
    wbTemplates(tenantId: $tenantId) { id }
  }
`;

// ==================== CONFIG ====================

interface PageDef {
  name: string;
  slug: string;
  isHomepage: boolean;
  description?: string;
  isLegal?: boolean;
}

interface SiteType {
  id: string;
  icon: string;
  label: string;
  tagline: string;
  description: string;
  gradient: string;
  badge?: string;
  badgeColor?: string;
  pages: PageDef[];
  globalCategories: string[];
}

const SITE_TYPES: SiteType[] = [
  {
    id: 'onepage',
    icon: '📄',
    label: 'One-Page',
    tagline: 'Alles auf einen Blick',
    description: 'Alle Infos auf einer Seite — ideal für Freelancer, Portfolios und schnelle Online-Präsenz',
    gradient: 'from-blue-500 to-cyan-400',
    pages: [
      { name: 'Startseite', slug: 'home', isHomepage: true },
      { name: 'Impressum', slug: 'impressum', isHomepage: false, isLegal: true },
      { name: 'Datenschutz', slug: 'datenschutz', isHomepage: false, isLegal: true },
    ],
    globalCategories: ['business', 'portfolio', 'onepage', 'creative'],
  },
  {
    id: 'multipage',
    icon: '🌐',
    label: 'Multi-Page Website',
    tagline: 'Klassische Website',
    description: 'Mehrere Seiten für Unternehmen, Agenturen und Dienstleister mit vollständiger Navigation',
    gradient: 'from-violet-500 to-purple-600',
    pages: [
      { name: 'Startseite', slug: 'home', isHomepage: true },
      { name: 'Über uns', slug: 'ueber-uns', isHomepage: false },
      { name: 'Leistungen', slug: 'leistungen', isHomepage: false },
      { name: 'Kontakt', slug: 'kontakt', isHomepage: false },
      { name: 'Impressum', slug: 'impressum', isHomepage: false, isLegal: true },
      { name: 'Datenschutz', slug: 'datenschutz', isHomepage: false, isLegal: true },
    ],
    globalCategories: ['business', 'corporate', 'agency', 'restaurant'],
  },
  {
    id: 'shop',
    icon: '🛒',
    label: 'Online Shop',
    tagline: 'E-Commerce mit Shop-Modul',
    description: 'Produkte verkaufen mit Warenkorb — verbunden mit deinem Shop-Modul',
    gradient: 'from-orange-500 to-red-500',
    badge: 'Shop-Modul',
    badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    pages: [
      { name: 'Startseite', slug: 'home', isHomepage: true },
      { name: 'Shop', slug: 'shop', isHomepage: false, description: 'Über Shop-Modul' },
      { name: 'Über uns', slug: 'ueber-uns', isHomepage: false },
      { name: 'Impressum', slug: 'impressum', isHomepage: false, isLegal: true },
      { name: 'Datenschutz', slug: 'datenschutz', isHomepage: false, isLegal: true },
      { name: 'AGB', slug: 'agb', isHomepage: false, isLegal: true },
      { name: 'Widerruf', slug: 'widerruf', isHomepage: false, isLegal: true },
    ],
    globalCategories: ['shop', 'ecommerce'],
  },
  {
    id: 'blog',
    icon: '✍️',
    label: 'Blog / Magazine',
    tagline: 'Content-first mit CMS-Modul',
    description: 'Blog-Beiträge und Artikel veröffentlichen — powered by deinem CMS-Modul',
    gradient: 'from-green-500 to-teal-500',
    badge: 'CMS-Modul',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    pages: [
      { name: 'Startseite', slug: 'home', isHomepage: true },
      { name: 'Blog', slug: 'blog', isHomepage: false, description: 'Über CMS-Modul' },
      { name: 'Über uns', slug: 'ueber-uns', isHomepage: false },
      { name: 'Impressum', slug: 'impressum', isHomepage: false, isLegal: true },
      { name: 'Datenschutz', slug: 'datenschutz', isHomepage: false, isLegal: true },
    ],
    globalCategories: ['blog', 'magazine', 'content'],
  },
  {
    id: 'landing',
    icon: '🚀',
    label: 'Landing Page',
    tagline: 'Maximale Conversion',
    description: 'High-converting Einzelseite für Produkt-Launches, Lead-Magneten und Kampagnen',
    gradient: 'from-pink-500 to-rose-600',
    pages: [
      { name: 'Landing Page', slug: 'home', isHomepage: true },
      { name: 'Danke', slug: 'danke', isHomepage: false, description: 'Nach Opt-in' },
      { name: 'Impressum', slug: 'impressum', isHomepage: false, isLegal: true },
      { name: 'Datenschutz', slug: 'datenschutz', isHomepage: false, isLegal: true },
    ],
    globalCategories: ['landing', 'funnel'],
  },
  {
    id: 'member',
    icon: '🔐',
    label: 'Mitglieder-Bereich',
    tagline: 'Exklusive Inhalte',
    description: 'Geschützte Bereiche für Kurse, Communities und Premium-Content',
    gradient: 'from-slate-500 to-gray-600',
    badge: 'Bald verfügbar',
    badgeColor: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    pages: [
      { name: 'Startseite', slug: 'home', isHomepage: true },
      { name: 'Mitglieder', slug: 'mitglieder', isHomepage: false },
      { name: 'Impressum', slug: 'impressum', isHomepage: false, isLegal: true },
      { name: 'Datenschutz', slug: 'datenschutz', isHomepage: false, isLegal: true },
    ],
    globalCategories: ['members', 'course'],
  },
];

// ==================== COMPONENT ====================

export default function CreateWebsitePage() {
  const { tenant } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<SiteType | null>(null);
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [selectedGlobalId, setSelectedGlobalId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data: globalData } = useQuery(GET_GLOBAL_TEMPLATES);
  const { data: myData } = useQuery(GET_MY_TEMPLATES_COUNT, {
    variables: { tenantId: tenant?.id },
    skip: !tenant?.id,
  });
  const [createTemplate] = useMutation(CREATE_TEMPLATE);
  const [createPage] = useMutation(CREATE_PAGE);
  const [cloneGlobalTemplate] = useMutation(CLONE_GLOBAL_TEMPLATE);
  const [setDefault] = useMutation(SET_DEFAULT);

  const isFirstTemplate = (myData?.wbTemplates?.length ?? 0) === 0;
  const allGlobal = globalData?.wbGlobalTemplates || [];
  const filteredGlobal = selectedType
    ? allGlobal.filter((t: any) =>
        selectedType.globalCategories.some((cat) =>
          (t.category || '').toLowerCase().includes(cat.toLowerCase())
        )
      )
    : [];

  const goStep = (s: number) => { setError(''); setStep(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleCreate = async () => {
    if (!tenant?.id || !selectedType) return;
    setIsCreating(true);
    setError('');
    try {
      let templateId: string;

      if (selectedGlobalId) {
        // Clone global template first
        const res = await cloneGlobalTemplate({
          variables: { globalTemplateId: selectedGlobalId, tenantId: tenant.id },
        });
        templateId = res.data.cloneGlobalTemplate.id;
      } else {
        // Create blank template
        const res = await createTemplate({
          variables: {
            input: {
              name: siteName.trim(),
              description: siteDescription.trim() || undefined,
              isActive: true,
              isDefault: false,
              settings: {
                siteType: selectedType.id,
                colors: { primary: '#3b82f6', secondary: '#6366f1', accent: '#f59e0b', background: '#ffffff', text: '#1f2937' },
                fonts: { heading: 'Inter', body: 'Inter' },
                spacing: { default: 'normal' },
              },
            },
            tenantId: tenant.id,
          },
        });
        templateId = res.data.createTemplate.id;
      }

      // Always create all required pages — silently skip if slug already exists (cloned template)
      for (let i = 0; i < selectedType.pages.length; i++) {
        const p = selectedType.pages[i];
        try {
          await createPage({
            variables: {
              input: {
                templateId,
                name: p.name,
                slug: p.slug,
                description: p.description || null,
                isActive: true,
                isHomepage: p.isHomepage,
                order: i,
              },
              tenantId: tenant.id,
            },
          });
        } catch {
          // Slug already exists from cloned template — skip silently
        }
      }

      if (isFirstTemplate) {
        await setDefault({ variables: { id: templateId, tenantId: tenant.id } });
      }

      setCreatedId(templateId);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Erstellen. Bitte versuche es erneut.');
    } finally {
      setIsCreating(false);
    }
  };

  const STEPS = ['Typ', 'Details', 'Vorlage', 'Fertig'];

  return (
    <div className="min-h-screen bg-background">
      {/* TOP BAR */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/website-builder" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Zurück
            </Link>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm font-semibold text-foreground">Neue Website erstellen</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {STEPS.map((label, i) => {
              const s = i + 1;
              return (
                <div key={s} className="flex items-center gap-1">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    step > s ? 'text-green-600 dark:text-green-400' :
                    step === s ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step > s ? 'bg-green-500 text-white' :
                      step === s ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {step > s ? '✓' : s}
                    </span>
                    {label}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-4 h-px ${step > s ? 'bg-green-400' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* STEP 1 — TYPE */}
        {step === 1 && (
          <div>
            <div className="text-center mb-10">
              <div className="text-5xl mb-4">🎨</div>
              <h1 className="text-4xl font-bold text-foreground mb-3">Was möchtest du erstellen?</h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Wähle den Typ — alle nötigen Seiten werden automatisch angelegt, inklusive Impressum und Datenschutz
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SITE_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => { setSelectedType(type); goStep(2); }}
                  className="group relative text-left rounded-2xl border-2 border-border bg-card hover:border-primary hover:shadow-xl transition-all duration-200 overflow-hidden"
                >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${type.gradient} group-hover:h-2 transition-all`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-200">{type.icon}</span>
                      {type.badge && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${type.badgeColor}`}>{type.badge}</span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors">{type.label}</h3>
                    <p className="text-xs text-muted-foreground font-medium mb-2">{type.tagline}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">{type.description}</p>
                    <div className="pt-3 border-t border-border">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">{type.pages.length} Seiten inklusive</p>
                      <div className="flex flex-wrap gap-1">
                        {type.pages.map((p) => (
                          <span key={p.slug} className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            p.isLegal ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-muted text-muted-foreground'
                          }`}>
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-center">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                ⚖️ <strong>DSGVO-konform:</strong> Alle Typen enthalten automatisch Impressum &amp; Datenschutzerklärung
              </p>
            </div>
          </div>
        )}

        {/* STEP 2 — NAME */}
        {step === 2 && selectedType && (
          <div className="max-w-xl mx-auto">
            <button onClick={() => goStep(1)} className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1 transition-colors">
              ← Typ ändern
            </button>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${selectedType.gradient} text-white text-sm font-semibold mb-8`}>
              <span>{selectedType.icon}</span>
              <span>{selectedType.label}</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Wie heißt deine Website?</h2>
            <p className="text-muted-foreground mb-8">Du kannst den Namen jederzeit ändern</p>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Name der Website <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => { setSiteName(e.target.value); setError(''); }}
                  placeholder={selectedType.id === 'shop' ? 'z.B. Mein Online-Shop' : selectedType.id === 'blog' ? 'z.B. Mein Blog' : 'z.B. Meine Website'}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-lg placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && (() => { if (!siteName.trim()) { setError('Bitte gib einen Namen ein.'); return; } goStep(3); })()}
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Kurzbeschreibung <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="Worum geht es auf dieser Website?"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="bg-muted/40 rounded-xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Wird automatisch angelegt:</p>
                <div className="space-y-1.5">
                  {selectedType.pages.map((p) => (
                    <div key={p.slug} className="flex items-center gap-2 text-sm">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.isLegal ? 'bg-amber-500' : 'bg-primary'}`} />
                      <span className="font-medium text-foreground">{p.name}</span>
                      <span className="text-muted-foreground text-xs">/{p.slug}</span>
                      {p.isHomepage && <span className="ml-auto text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full">Homepage</span>}
                      {p.isLegal && <span className="ml-auto text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">Pflicht</span>}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { if (!siteName.trim()) { setError('Bitte gib einen Namen ein.'); return; } goStep(3); }}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all"
              >
                Weiter: Vorlage wählen →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — TEMPLATE CHOICE */}
        {step === 3 && selectedType && (
          <div>
            <button onClick={() => goStep(2)} className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1 transition-colors">
              ← Details ändern
            </button>
            <h2 className="text-3xl font-bold text-foreground mb-2">Mit einer Vorlage starten?</h2>
            <p className="text-muted-foreground mb-8">
              Alle fehlenden Pflicht-Seiten werden immer automatisch ergänzt — egal welche Vorlage du wählst
            </p>

            {/* Blank */}
            <button
              onClick={() => setSelectedGlobalId(null)}
              className={`w-full mb-5 p-5 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${
                selectedGlobalId === null ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl flex-shrink-0">✨</div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">Leeres Template</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Von Null starten — {selectedType.pages.length} Seiten werden angelegt, du gestaltest sie selbst
                </p>
              </div>
              {selectedGlobalId === null && (
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0">✓</div>
              )}
            </button>

            {filteredGlobal.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Passende Vorlagen für {selectedType.label}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredGlobal.map((t: any) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedGlobalId(t.id)}
                      className={`text-left rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                        selectedGlobalId === t.id ? 'border-primary shadow-lg' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      {t.thumbnailUrl
                        ? <img src={t.thumbnailUrl} alt={t.name} className="w-full h-32 object-cover" />
                        : <div className="w-full h-32 bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center text-4xl">🎨</div>
                      }
                      <div className="p-4 bg-card">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground text-sm">{t.name}</h4>
                          {selectedGlobalId === t.id && <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">✓</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredGlobal.length === 0 && (
              <div className="text-center py-8 bg-muted/30 rounded-2xl mb-6">
                <p className="text-3xl mb-2">🎨</p>
                <p className="text-sm text-muted-foreground">Noch keine spezifischen Vorlagen für diesen Typ.</p>
              </div>
            )}

            {/* Summary + Create */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">📋 Zusammenfassung</h3>
              <div className="space-y-2 text-sm mb-5">
                {[
                  ['Typ', `${selectedType.icon} ${selectedType.label}`],
                  ['Name', siteName],
                  ['Vorlage', selectedGlobalId ? (filteredGlobal.find((t: any) => t.id === selectedGlobalId)?.name ?? 'Vorlage') : 'Leeres Template'],
                  ['Seiten', `${selectedType.pages.length} Seiten (inkl. Pflicht-Seiten)`],
                  ...(isFirstTemplate ? [['Status', '⭐ Wird als aktive Website gesetzt']] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{k}</span>
                    <span className={`font-medium text-right ${k === 'Status' ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>{v}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
                  ❌ {error}
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary/90 disabled:opacity-60 disabled:cursor-wait transition-all flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Website wird erstellt…</>
                ) : '🚀 Website jetzt erstellen'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — SUCCESS */}
        {step === 4 && createdId && selectedType && (
          <div className="max-w-lg mx-auto text-center">
            <div className="text-7xl mb-6">🎉</div>
            <h2 className="text-4xl font-bold text-foreground mb-3">Website erstellt!</h2>
            <p className="text-muted-foreground text-lg mb-8">
              <strong className="text-foreground">{siteName || selectedType.label}</strong> ist bereit.
              Alle {selectedType.pages.length} Seiten wurden angelegt.
            </p>

            <div className="bg-card border border-border rounded-2xl p-6 text-left mb-6">
              <h3 className="font-bold text-foreground mb-4">🗺️ Was jetzt?</h3>
              <div className="space-y-3">
                {[
                  { n: 1, title: 'Startseite gestalten', sub: 'Sections hinzufügen und Inhalte bearbeiten', active: true },
                  { n: 2, title: 'Pflicht-Seiten ausfüllen', sub: 'Impressum und Datenschutz mit deinen echten Daten befüllen', active: false },
                  ...(selectedType.id === 'shop' ? [{ n: 3, title: 'Produkte im Shop-Modul anlegen', sub: 'Die Shop-Seite zeigt deine Produkte automatisch', active: false }] : []),
                  ...(selectedType.id === 'blog' ? [{ n: 3, title: 'Ersten Beitrag im CMS schreiben', sub: 'Die Blog-Seite zeigt deine Beiträge automatisch', active: false }] : []),
                  { n: selectedType.id === 'shop' || selectedType.id === 'blog' ? 4 : 3, title: 'Navigation einrichten', sub: 'Menü im Website Builder → Navigation konfigurieren', active: false },
                ].map((item) => (
                  <div key={item.n} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${item.active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {item.n}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/dashboard/website-builder/website-templates/${createdId}`} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all text-center">
                🎨 Website jetzt gestalten
              </Link>
              <Link href="/dashboard/website-builder" className="flex-1 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all text-center">
                Zur Übersicht
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}