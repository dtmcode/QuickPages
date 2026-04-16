'use client';

import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';

// ==================== TYPES ====================
interface LocaleSettings {
  defaultLocale: string;
  enabledLocales: string[];
  supportedLocales: string[];
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

// ==================== GRAPHQL HELPER — COOKIES FIX ====================
const API_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql';

async function gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = typeof window !== 'undefined' ? Cookies.get('accessToken') : null;
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

// ==================== LOCALE META ====================
const LOCALE_META: Record<string, { name: string; nativeName: string; flag: string; region: string }> = {
  de: { name: 'Deutsch',     nativeName: 'Deutsch',     flag: '🇩🇪', region: 'Europa' },
  en: { name: 'Englisch',    nativeName: 'English',     flag: '🇬🇧', region: 'Europa' },
  fr: { name: 'Französisch', nativeName: 'Français',    flag: '🇫🇷', region: 'Europa' },
  es: { name: 'Spanisch',    nativeName: 'Español',     flag: '🇪🇸', region: 'Europa' },
  it: { name: 'Italienisch', nativeName: 'Italiano',    flag: '🇮🇹', region: 'Europa' },
  nl: { name: 'Niederländisch', nativeName: 'Nederlands', flag: '🇳🇱', region: 'Europa' },
  pl: { name: 'Polnisch',    nativeName: 'Polski',      flag: '🇵🇱', region: 'Europa' },
  tr: { name: 'Türkisch',    nativeName: 'Türkçe',      flag: '🇹🇷', region: 'Asien' },
  pt: { name: 'Portugiesisch', nativeName: 'Português', flag: '🇵🇹', region: 'Europa' },
  ru: { name: 'Russisch',    nativeName: 'Русский',     flag: '🇷🇺', region: 'Europa' },
  ar: { name: 'Arabisch',    nativeName: 'العربية',     flag: '🇸🇦', region: 'Nahost' },
  ja: { name: 'Japanisch',   nativeName: '日本語',       flag: '🇯🇵', region: 'Asien' },
  zh: { name: 'Chinesisch',  nativeName: '中文',         flag: '🇨🇳', region: 'Asien' },
};

// ==================== DEFAULT UI KEYS ====================
const DEFAULT_UI_KEYS: Record<string, Record<string, string>> = {
  'common.home':                  { de: 'Startseite',            en: 'Home' },
  'common.about':                 { de: 'Über uns',              en: 'About' },
  'common.contact':               { de: 'Kontakt',               en: 'Contact' },
  'common.search':                { de: 'Suchen',                en: 'Search' },
  'common.back':                  { de: 'Zurück',                en: 'Back' },
  'common.loading':               { de: 'Wird geladen...',       en: 'Loading...' },
  'common.read_more':             { de: 'Weiterlesen',           en: 'Read more' },
  'common.show_more':             { de: 'Mehr anzeigen',         en: 'Show more' },
  'shop.add_to_cart':             { de: 'In den Warenkorb',      en: 'Add to cart' },
  'shop.cart':                    { de: 'Warenkorb',             en: 'Cart' },
  'shop.checkout':                { de: 'Zur Kasse',             en: 'Checkout' },
  'shop.price':                   { de: 'Preis',                 en: 'Price' },
  'shop.quantity':                { de: 'Menge',                 en: 'Quantity' },
  'shop.total':                   { de: 'Gesamt',                en: 'Total' },
  'shop.empty_cart':              { de: 'Warenkorb ist leer',    en: 'Cart is empty' },
  'blog.posted_on':               { de: 'Veröffentlicht am',     en: 'Posted on' },
  'blog.by':                      { de: 'von',                   en: 'by' },
  'blog.comments':                { de: 'Kommentare',            en: 'Comments' },
  'blog.no_posts':                { de: 'Keine Beiträge',        en: 'No posts found' },
  'booking.book_now':             { de: 'Jetzt buchen',          en: 'Book now' },
  'booking.select_service':       { de: 'Service wählen',        en: 'Select service' },
  'booking.select_date':          { de: 'Datum wählen',          en: 'Select date' },
  'booking.select_time':          { de: 'Uhrzeit wählen',        en: 'Select time' },
  'newsletter.subscribe':         { de: 'Newsletter abonnieren', en: 'Subscribe' },
  'newsletter.email_placeholder': { de: 'Deine E-Mail-Adresse',  en: 'Your email address' },
  'footer.privacy':               { de: 'Datenschutz',           en: 'Privacy' },
  'footer.imprint':               { de: 'Impressum',             en: 'Imprint' },
  'footer.terms':                 { de: 'AGB',                   en: 'Terms' },
};

const GROUPS = ['all', 'common', 'shop', 'blog', 'booking', 'newsletter', 'footer'] as const;

const GROUP_LABELS: Record<string, string> = {
  all: 'Alle', common: 'Allgemein', shop: 'Shop',
  blog: 'Blog', booking: 'Buchung', newsletter: 'Newsletter', footer: 'Footer',
};

// ==================== COMPONENT ====================
export default function I18nDashboardPage() {
  const [tab, setTab] = useState<'languages' | 'translations'>('languages');
  const [settings, setSettings] = useState<LocaleSettings | null>(null);
  const [uiValues, setUiValues] = useState<Record<string, string>>({});
  const [selectedLocale, setSelectedLocale] = useState('de');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [filterGroup, setFilterGroup] = useState<typeof GROUPS[number]>('all');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadSettings = useCallback(async () => {
    const data = await gqlRequest<{ localeSettings: LocaleSettings }>(`
      query { localeSettings { defaultLocale enabledLocales supportedLocales } }
    `);
    setSettings(data.localeSettings);
    setSelectedLocale((prev) =>
      data.localeSettings.enabledLocales.includes(prev)
        ? prev
        : data.localeSettings.defaultLocale,
    );
  }, []);

  const loadUiTranslations = useCallback(async (locale: string) => {
    const data = await gqlRequest<{ uiTranslations: Record<string, string> }>(`
      query($locale: String!) { uiTranslations(locale: $locale) }
    `, { locale });
    setUiValues(data.uiTranslations || {});
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try { await loadSettings(); }
      catch { showToast('Spracheinstellungen konnten nicht geladen werden', 'error'); }
      finally { setLoading(false); }
    };
    init();
  }, [loadSettings]);

  useEffect(() => {
    if (tab === 'translations') loadUiTranslations(selectedLocale);
  }, [selectedLocale, tab, loadUiTranslations]);

  const saveLocaleSettings = async (newDefault: string, newEnabled: string[]) => {
    setSaving(true);
    try {
      await gqlRequest<{ updateLocaleSettings: boolean }>(`
        mutation($defaultLocale: String!, $enabledLocales: [String!]!) {
          updateLocaleSettings(defaultLocale: $defaultLocale, enabledLocales: $enabledLocales)
        }
      `, { defaultLocale: newDefault, enabledLocales: newEnabled });
      setSettings((prev) => prev ? { ...prev, defaultLocale: newDefault, enabledLocales: newEnabled } : prev);
      showToast('Gespeichert');
    } catch {
      showToast('Fehler beim Speichern', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleLocale = (code: string) => {
    if (!settings) return;
    const isEnabled = settings.enabledLocales.includes(code);
    if (isEnabled && code === settings.defaultLocale) {
      showToast('Standardsprache kann nicht deaktiviert werden', 'error');
      return;
    }
    const newEnabled = isEnabled
      ? settings.enabledLocales.filter((l) => l !== code)
      : [...settings.enabledLocales, code];
    saveLocaleSettings(settings.defaultLocale, newEnabled);
  };

  const setDefaultLocale = (code: string) => {
    if (!settings) return;
    const newEnabled = settings.enabledLocales.includes(code)
      ? settings.enabledLocales
      : [...settings.enabledLocales, code];
    saveLocaleSettings(code, newEnabled);
  };

  const saveTranslation = async (key: string, value: string) => {
    try {
      await gqlRequest(`
        mutation($locale: String!, $key: String!, $value: String!) {
          setUiTranslation(locale: $locale, key: $key, value: $value)
        }
      `, { locale: selectedLocale, key, value });
    } catch {
      showToast('Fehler beim Speichern', 'error');
    }
  };

  const handleTranslationChange = (key: string, value: string) => {
    setUiValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleTranslationBlur = (key: string, value: string) => {
    const defaultValue = DEFAULT_UI_KEYS[key]?.[selectedLocale] || '';
    if (value !== defaultValue || uiValues[key] !== undefined) {
      saveTranslation(key, value);
    }
  };

  const getDisplayValue = (key: string) => uiValues[key] ?? '';
  const getPlaceholder = (key: string) =>
    DEFAULT_UI_KEYS[key]?.[selectedLocale] ||
    DEFAULT_UI_KEYS[key]?.['de'] ||
    DEFAULT_UI_KEYS[key]?.['en'] || key;

  const filteredKeys = Object.keys(DEFAULT_UI_KEYS).filter(
    (k) => filterGroup === 'all' || k.startsWith(`${filterGroup}.`),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const allLocales = Object.entries(LOCALE_META).map(([code, meta]) => ({
    code, ...meta,
    enabled: settings?.enabledLocales.includes(code) ?? false,
    isDefault: settings?.defaultLocale === code,
  }));

  const enabledCount = allLocales.filter(l => l.enabled).length;

  return (
    <div className="space-y-6 p-1">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            🌐 Mehrsprachigkeit
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {enabledCount} {enabledCount === 1 ? 'Sprache' : 'Sprachen'} aktiv
            {settings && ` · Standard: ${LOCALE_META[settings.defaultLocale]?.flag} ${LOCALE_META[settings.defaultLocale]?.nativeName}`}
          </p>
        </div>
        {saving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            Speichert...
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-1">
          {([['languages', '🗺️ Sprachen'], ['translations', '✏️ UI-Texte']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors rounded-t-lg ${
                tab === key
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── SPRACHEN TAB ────────────────────────────────────────────────────── */}
      {tab === 'languages' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Aktiviere Sprachen für deine Website. Die Standardsprache wird immer angezeigt.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {allLocales.map((locale) => (
              <div
                key={locale.code}
                className={`relative rounded-2xl border-2 p-4 text-center transition-all duration-200 ${
                  locale.isDefault
                    ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                    : locale.enabled
                    ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                    : 'border-border bg-card opacity-60 hover:opacity-80'
                }`}
              >
                {/* Default Badge */}
                {locale.isDefault && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    Standard
                  </div>
                )}

                {/* Flag */}
                <div className="text-4xl mb-2 leading-none">{locale.flag}</div>

                {/* Names */}
                <p className="font-semibold text-sm text-foreground leading-tight">{locale.nativeName}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{locale.name}</p>
                <p className="text-[10px] text-muted-foreground/60 font-mono uppercase mt-0.5">{locale.code}</p>

                {/* Status dot */}
                <div className="flex justify-center mt-2">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    locale.isDefault
                      ? 'bg-primary/15 text-primary'
                      : locale.enabled
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      locale.isDefault ? 'bg-primary' : locale.enabled ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                    }`} />
                    {locale.isDefault ? 'Standard' : locale.enabled ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-3 space-y-1.5">
                  <button
                    onClick={() => toggleLocale(locale.code)}
                    disabled={locale.isDefault || saving}
                    className={`w-full text-xs py-1.5 px-3 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      locale.enabled
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400'
                    }`}
                  >
                    {locale.enabled ? '− Deaktivieren' : '+ Aktivieren'}
                  </button>

                  {locale.enabled && !locale.isDefault && (
                    <button
                      onClick={() => setDefaultLocale(locale.code)}
                      disabled={saving}
                      className="w-full text-xs py-1.5 px-3 rounded-xl font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-40"
                    >
                      Als Standard
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── UI-TEXTE TAB ─────────────────────────────────────────────────────── */}
      {tab === 'translations' && (
        <div className="space-y-4">
          {/* Sprach-Selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Sprache:</span>
            <div className="flex gap-2 flex-wrap">
              {allLocales.filter((l) => l.enabled).map((l) => (
                <button
                  key={l.code}
                  onClick={() => setSelectedLocale(l.code)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    selectedLocale === l.code
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-border'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.nativeName}</span>
                  {l.isDefault && <span className="text-[10px] opacity-70 bg-white/20 px-1 rounded">(Standard)</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Gruppen-Filter */}
          <div className="flex gap-1.5 flex-wrap">
            {GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setFilterGroup(g)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterGroup === g
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-border'
                }`}
              >
                {GROUP_LABELS[g]}
              </button>
            ))}
          </div>

          {/* Translation Table */}
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="grid grid-cols-[200px_1fr] text-xs font-semibold text-muted-foreground bg-muted/50 px-4 py-2.5 border-b border-border">
              <span>Schlüssel</span>
              <span>Übersetzung ({LOCALE_META[selectedLocale]?.nativeName ?? selectedLocale})</span>
            </div>
            <div className="divide-y divide-border">
              {filteredKeys.map((key) => {
                const value = getDisplayValue(key);
                const placeholder = getPlaceholder(key);
                const hasCustom = uiValues[key] !== undefined && uiValues[key] !== '';
                const [group, ...rest] = key.split('.');

                return (
                  <div key={key} className="grid grid-cols-[200px_1fr] items-center px-4 py-2.5 hover:bg-muted/30 transition-colors">
                    <div className="pr-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                          {group}
                        </span>
                        <span className="text-xs text-foreground font-medium">.{rest.join('.')}</span>
                      </div>
                      {hasCustom && (
                        <span className="text-[10px] text-primary mt-0.5 block">● Angepasst</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={value}
                      placeholder={placeholder}
                      onChange={(e) => handleTranslationChange(key, e.target.value)}
                      onBlur={(e) => handleTranslationBlur(key, e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-1.5 text-sm bg-background text-foreground 
                                 placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                 outline-none transition-all"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="text-primary">💡</span>
            Platzhaltertext = Systemstandard. Änderungen werden automatisch beim Verlassen des Feldes gespeichert.
          </p>
        </div>
      )}
    </div>
  );
}