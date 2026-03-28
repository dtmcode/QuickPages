// 📂 PFAD: frontend/src/components/packages/PackageTiers.tsx
// Shared Component — verwendbar im Dashboard und auf der Homepage
//
// Dashboard: onSelectPackage() → Stripe Checkout
// Homepage:  ctaHref="/register" → Registrierung

'use client';

import { useState } from 'react';
import Link from 'next/link';

// ==================== TYPES ====================

export type PackageCategoryId = 'website' | 'blog' | 'business' | 'shop' | 'members';

export interface TierLimit {
  pages: number;
  posts?: number;
  products?: number;
  subscribers?: number;
  members?: number;
  courses?: number;
  bookingServices?: number;
  forms: number;
  users: number;
  storageMb: number;
}

export interface TierDef {
  type: string;
  name: string;
  tagline: string;
  priceMonthly: number; // Cent
  features: string[];
  limits: TierLimit;
  highlight?: boolean;
}

export interface CategoryDef {
  id: PackageCategoryId;
  icon: string;
  label: string;
  tagline: string;
  description: string;
  examples: string;
  gradient: string;
  tiers: TierDef[];
}

export interface PackageTiersProps {
  // Kontext
  mode: 'dashboard' | 'homepage';

  // Dashboard-Modus
  currentPackage?: string;
  isSuperAdmin?: boolean;
  isOwner?: boolean;
  onSelectPackage?: (tier: TierDef, category: CategoryDef) => void;
  loadingPackage?: string | null;

  // Homepage-Modus
  ctaHref?: string; // z.B. "/register"
  ctaLabel?: string; // z.B. "Jetzt starten"

  // Gemeinsam
  defaultCategory?: PackageCategoryId;
  showAlwaysIncluded?: boolean;
}

// ==================== DATA ====================

const ALWAYS_INCLUDED = [
  'Website Builder (One-Page & Multi-Page)',
  'Impressum, Datenschutz & AGB',
  'SSL-Zertifikat',
  'Dashboard mit allen aktiven Modulen',
  'DSGVO-konform, Made in Germany',
  'Subdomain (name.quickpages.de)',
];

export const PACKAGE_CATEGORIES: CategoryDef[] = [
  {
    id: 'website',
    icon: '🌐',
    label: 'Website',
    tagline: 'Einfach online sein',
    description: 'Professioneller Auftritt — ohne Shop, Blog oder Buchungen.',
    examples: 'Friseur, Arzt, Handwerker, Fotograf, Visitenkarte',
    gradient: 'from-blue-500 to-cyan-500',
    tiers: [
      {
        type: 'website_micro',
        name: 'Micro',
        tagline: 'Deine digitale Visitenkarte',
        priceMonthly: 900,
        features: ['3 Seiten', '1 Kontaktformular', 'Basis-Analytics', 'QuickPages Subdomain'],
        limits: { pages: 3, forms: 1, users: 1, storageMb: 500 },
      },
      {
        type: 'website_standard',
        name: 'Standard',
        tagline: 'Professioneller Auftritt',
        priceMonthly: 1900,
        highlight: true,
        features: ['10 Seiten', '3 Formulare', 'Eigene Domain', 'Kein QuickPages-Branding'],
        limits: { pages: 10, forms: 3, users: 2, storageMb: 2000 },
      },
      {
        type: 'website_pro',
        name: 'Pro',
        tagline: 'Maximale Flexibilität',
        priceMonthly: 2900,
        features: ['30 Seiten', '10 Formulare', 'Volle Analytics', '3 Team-Mitglieder'],
        limits: { pages: 30, forms: 10, users: 3, storageMb: 10000 },
      },
    ],
  },
  {
    id: 'blog',
    icon: '✍️',
    label: 'Blog',
    tagline: 'Publizieren & Wachsen',
    description: 'Für Blogger, Creator und Redaktionen.',
    examples: 'Blogger, Journalist, Creator, Online-Magazin',
    gradient: 'from-green-500 to-teal-500',
    tiers: [
      {
        type: 'blog_personal',
        name: 'Personal',
        tagline: 'Deine Stimme im Web',
        priceMonthly: 1900,
        features: ['100 Beiträge', 'Kommentare', '10 Seiten', 'Eigene Domain'],
        limits: { pages: 10, posts: 100, forms: 2, users: 1, storageMb: 3000 },
      },
      {
        type: 'blog_publisher',
        name: 'Publisher',
        tagline: 'Professionell publizieren',
        priceMonthly: 3900,
        highlight: true,
        features: ['500 Beiträge', '3 Autoren', 'Newsletter (500)', '20 Seiten'],
        limits: { pages: 20, posts: 500, subscribers: 500, forms: 5, users: 3, storageMb: 10000 },
      },
      {
        type: 'blog_magazine',
        name: 'Magazine',
        tagline: 'Dein Online-Magazin',
        priceMonthly: 7900,
        features: ['2.000 Beiträge', '10 Autoren', 'Newsletter (5.000)', 'AI Content', 'Mehrsprachig'],
        limits: { pages: 50, posts: 2000, subscribers: 5000, forms: 15, users: 10, storageMb: 50000 },
      },
    ],
  },
  {
    id: 'business',
    icon: '💼',
    label: 'Business',
    tagline: 'Termine, Kunden, Wachstum',
    description: 'Für Dienstleister die Termine buchen und Kunden verwalten.',
    examples: 'Coach, Berater, Restaurant, Physiotherapeut, Gastro',
    gradient: 'from-violet-500 to-purple-600',
    tiers: [
      {
        type: 'business_starter',
        name: 'Starter',
        tagline: 'Dein Business online',
        priceMonthly: 2900,
        features: ['15 Seiten', 'Booking (3 Services)', 'Newsletter (500)', '5 Formulare'],
        limits: { pages: 15, bookingServices: 3, subscribers: 500, forms: 5, users: 3, storageMb: 5000 },
      },
      {
        type: 'business_professional',
        name: 'Professional',
        tagline: 'Mehr Power',
        priceMonthly: 5900,
        highlight: true,
        features: ['50 Seiten', 'Booking (10)', 'Blog (200)', 'Newsletter (5.000)', 'AI Content'],
        limits: { pages: 50, posts: 200, bookingServices: 10, subscribers: 5000, forms: 20, users: 5, storageMb: 20000 },
      },
      {
        type: 'business_agency',
        name: 'Agency',
        tagline: 'Für Agenturen & große Teams',
        priceMonthly: 9900,
        features: ['150 Seiten', 'Booking (30)', 'Newsletter (20.000)', 'AI (500 Credits)', 'Mehrsprachig'],
        limits: { pages: 150, posts: 1000, bookingServices: 30, subscribers: 20000, forms: 50, users: 15, storageMb: 100000 },
      },
    ],
  },
  {
    id: 'shop',
    icon: '🛒',
    label: 'Shop',
    tagline: 'Produkte verkaufen',
    description: 'Für Online-Händler die Produkte verkaufen.',
    examples: 'Online-Shop, Handmade, digitale Produkte',
    gradient: 'from-orange-500 to-red-500',
    tiers: [
      {
        type: 'shop_mini',
        name: 'Mini',
        tagline: 'Dein erster Shop',
        priceMonthly: 3900,
        features: ['100 Produkte', 'Stripe-Zahlung', 'Newsletter (500)', '20 Seiten'],
        limits: { pages: 20, products: 100, subscribers: 500, forms: 3, users: 2, storageMb: 10000 },
      },
      {
        type: 'shop_wachstum',
        name: 'Wachstum',
        tagline: 'Dein Shop skaliert',
        priceMonthly: 6900,
        highlight: true,
        features: ['500 Produkte', 'Varianten + Downloads', 'Blog (100)', 'Newsletter (3.000)'],
        limits: { pages: 50, products: 500, posts: 100, subscribers: 3000, forms: 10, users: 5, storageMb: 30000 },
      },
      {
        type: 'shop_premium',
        name: 'Premium',
        tagline: 'Der professionelle Shop',
        priceMonthly: 11900,
        features: ['2.000 Produkte', 'Newsletter (10.000)', 'AI Content (200)', 'Mehrsprachig'],
        limits: { pages: 100, products: 2000, posts: 500, subscribers: 10000, forms: 20, users: 10, storageMb: 100000 },
      },
    ],
  },
  {
    id: 'members',
    icon: '🔐',
    label: 'Mitglieder',
    tagline: 'Community & Kurse',
    description: 'Für exklusive Inhalte, Kurse und Communities.',
    examples: 'Online-Kurs, Community, Coaching, Membership-Site',
    gradient: 'from-pink-500 to-rose-600',
    tiers: [
      {
        type: 'members_community',
        name: 'Community',
        tagline: 'Deine geschlossene Gruppe',
        priceMonthly: 2900,
        features: ['100 Mitglieder', 'Geschützter Bereich', '10 Downloads', '20 Seiten'],
        limits: { pages: 20, members: 100, forms: 3, users: 2, storageMb: 5000 },
      },
      {
        type: 'members_kurse',
        name: 'Kurse',
        tagline: 'Deine Online-Akademie',
        priceMonthly: 5900,
        highlight: true,
        features: ['500 Mitglieder', '5 Kurse', '100 Downloads', 'Newsletter (500)', '50 Seiten'],
        limits: { pages: 50, members: 500, courses: 5, subscribers: 500, forms: 10, users: 3, storageMb: 30000 },
      },
      {
        type: 'members_academy',
        name: 'Academy',
        tagline: 'Vollständige Lernplattform',
        priceMonthly: 9900,
        features: ['2.000 Mitglieder', '30 Kurse', '500 Downloads', 'Booking (5)', 'AI (100 Credits)'],
        limits: { pages: 100, members: 2000, courses: 30, bookingServices: 5, subscribers: 5000, forms: 20, users: 10, storageMb: 100000 },
      },
    ],
  },
];

// ==================== HELPERS ====================

function fmt(cents: number) {
  return `€${(cents / 100).toFixed(0)}`;
}

function fmtStorage(mb: number) {
  return mb >= 1000 ? `${mb / 1000} GB` : `${mb} MB`;
}

// ==================== COMPONENT ====================

export function PackageTiers({
  mode,
  currentPackage,
  isSuperAdmin = false,
  isOwner = true,
  onSelectPackage,
  loadingPackage,
  ctaHref = '/register',
  ctaLabel = 'Jetzt starten',
  defaultCategory = 'website',
  showAlwaysIncluded = true,
}: PackageTiersProps) {
  const [activeCategory, setActiveCategory] = useState<PackageCategoryId>(defaultCategory);
  const selectedCategory = PACKAGE_CATEGORIES.find(c => c.id === activeCategory)!;

  return (
    <div className="space-y-8">

      {/* Always Included Banner */}
      {showAlwaysIncluded && (
        <div className={`rounded-2xl p-5 border ${
          mode === 'dashboard'
            ? 'bg-primary/5 border-primary/20'
            : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
        }`}>
          <p className="text-sm font-bold text-foreground mb-3">
            ✅ In <em>jedem</em> Paket inklusive:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {ALWAYS_INCLUDED.map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                <span className="text-green-600 dark:text-green-400 font-bold text-xs">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {PACKAGE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-2xl p-4 text-left transition-all border-2 ${
              activeCategory === cat.id
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-border bg-card hover:border-primary/40 hover:shadow-sm'
            }`}
          >
            <span className="text-3xl block mb-2">{cat.icon}</span>
            <p className="font-bold text-foreground text-sm leading-tight">{cat.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{cat.tagline}</p>
          </button>
        ))}
      </div>

      {/* Category Banner */}
      <div className={`rounded-2xl bg-gradient-to-r ${selectedCategory.gradient} p-6 text-white`}>
        <div className="flex items-start gap-4">
          <span className="text-5xl flex-shrink-0">{selectedCategory.icon}</span>
          <div>
            <h2 className="text-2xl font-bold mb-1">{selectedCategory.label}-Pakete</h2>
            <p className="opacity-90 text-sm mb-1">{selectedCategory.description}</p>
            <p className="text-xs opacity-75">Beispiele: {selectedCategory.examples}</p>
          </div>
        </div>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {selectedCategory.tiers.map((tier, idx) => {
          const isCurrent = tier.type === currentPackage;
          const isLoading = loadingPackage === tier.type;

          return (
            <div
              key={tier.type}
              className={`relative rounded-2xl border-2 bg-card flex flex-col transition-all duration-200 ${
                isCurrent
                  ? 'border-primary shadow-xl shadow-primary/20'
                  : tier.highlight
                  ? 'border-primary/40 shadow-lg'
                  : 'border-border hover:border-primary/30 hover:shadow-md'
              }`}
            >
              {/* Badges */}
              {isCurrent && mode === 'dashboard' && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow">
                    ✓ Aktuelles Paket
                  </span>
                </div>
              )}
              {tier.highlight && !isCurrent && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className={`bg-gradient-to-r ${selectedCategory.gradient} text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow`}>
                    ⭐ Beliebt
                  </span>
                </div>
              )}

              {/* Gradient bar */}
              <div className={`h-1.5 w-full rounded-t-2xl bg-gradient-to-r ${selectedCategory.gradient}`} />

              <div className="p-6 flex flex-col flex-1">
                {/* Header */}
                <div className="mb-5">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    {idx === 0 ? 'Einsteiger' : idx === 1 ? 'Empfohlen' : 'Profi'}
                  </p>
                  <h3 className="text-2xl font-bold text-foreground">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground">{tier.tagline}</p>
                  <div className="mt-3">
                    <span className="text-4xl font-bold text-foreground">{fmt(tier.priceMonthly)}</span>
                    <span className="text-muted-foreground text-sm">/Monat</span>
                  </div>
                  {mode === 'homepage' && (
                    <p className="text-xs text-muted-foreground mt-1">zzgl. MwSt. · monatlich kündbar</p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2 mb-5 flex-1">
                  {tier.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <span className="text-primary font-bold flex-shrink-0">✓</span>
                      <span className="text-foreground">{f}</span>
                    </div>
                  ))}
                </div>

                {/* Limits */}
                <div className="bg-muted/40 rounded-xl p-3 mb-5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Limits
                  </p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {([
                      ['Seiten', tier.limits.pages],
                      tier.limits.posts != null && ['Blog-Posts', tier.limits.posts],
                      tier.limits.products != null && ['Produkte', tier.limits.products],
                      tier.limits.subscribers != null && ['Abonnenten', tier.limits.subscribers],
                      tier.limits.members != null && ['Mitglieder', tier.limits.members],
                      tier.limits.courses != null && ['Kurse', tier.limits.courses],
                      tier.limits.bookingServices != null && ['Booking-Services', tier.limits.bookingServices],
                      ['Formulare', tier.limits.forms],
                      ['Nutzer', tier.limits.users],
                      ['Speicher', fmtStorage(tier.limits.storageMb)],
                    ] as Array<[string, number | string] | false>)
                      .filter(Boolean)
                      .map(([k, v]) => (
                        <div key={k as string} className="flex justify-between text-xs gap-1">
                          <span className="text-muted-foreground truncate">{k}</span>
                          <span className="font-semibold text-foreground flex-shrink-0">
                            {typeof v === 'number' ? v.toLocaleString('de-DE') : v}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* CTA Button */}
                {mode === 'dashboard' ? (
                  isCurrent ? (
                    <div className="w-full py-3 bg-muted text-muted-foreground rounded-xl text-center text-sm font-semibold">
                      ✓ Aktuelles Paket
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectPackage?.(tier, selectedCategory)}
                      disabled={!isOwner || isLoading || isSuperAdmin === false && !isOwner}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        tier.highlight
                          ? `bg-gradient-to-r ${selectedCategory.gradient} text-white hover:opacity-90 shadow-md`
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Weiterleitung…
                        </>
                      ) : (
                        <>Paket wählen {!isSuperAdmin && '→'}</>
                      )}
                    </button>
                  )
                ) : (
                  // Homepage CTA
                  <Link
                    href={ctaHref}
                    className={`w-full py-3 rounded-xl font-bold text-sm text-center transition-all block ${
                      tier.highlight
                        ? `bg-gradient-to-r ${selectedCategory.gradient} text-white hover:opacity-90 shadow-md`
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {ctaLabel}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Homepage: Stripe Hinweis */}
      {mode === 'homepage' && (
        <p className="text-center text-sm text-muted-foreground">
          🔒 Sichere Zahlung via <strong>Stripe</strong> · Kreditkarte, SEPA, Sofort und mehr · Keine Mindestlaufzeit
        </p>
      )}

      {/* Dashboard: Stripe Hinweis */}
      {mode === 'dashboard' && !isSuperAdmin && (
        <p className="text-center text-sm text-muted-foreground">
          🔒 Bezahlung über Stripe · Monatlich kündbar · Änderungen sofort aktiv
        </p>
      )}
    </div>
  );
}