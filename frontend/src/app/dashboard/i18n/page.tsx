'use client';

import { useState, useEffect, useCallback } from 'react';

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

// ==================== GRAPHQL HELPER ====================
// ✅ FIX: 'token' → 'accessToken' (so heißt er überall im Rest der App)
const API_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql';

async function gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
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
const LOCALE_META: Record<string, { name: string; flag: string }> = {
  de: { name: 'Deutsch',    flag: '🇩🇪' },
  en: { name: 'English',    flag: '🇬🇧' },
  fr: { name: 'Français',   flag: '🇫🇷' },
  es: { name: 'Español',    flag: '🇪🇸' },
  it: { name: 'Italiano',   flag: '🇮🇹' },
  nl: { name: 'Nederlands', flag: '🇳🇱' },
  pl: { name: 'Polski',     flag: '🇵🇱' },
  tr: { name: 'Türkçe',     flag: '🇹🇷' },
  pt: { name: 'Português',  flag: '🇵🇹' },
  ru: { name: 'Русский',    flag: '🇷🇺' },
  ar: { name: 'العربية',    flag: '🇸🇦' },
  ja: { name: '日本語',      flag: '🇯🇵' },
  zh: { name: '中文',        flag: '🇨🇳' },
};

// ==================== DEFAULT UI KEYS ====================
// Entspricht exakt den Keys aus i18n.service.ts DEFAULT_UI_TRANSLATIONS
const DEFAULT_UI_KEYS: Record<string, Record<string, string>> = {
  'common.home':                 { de: 'Startseite',            en: 'Home' },
  'common.about':                { de: 'Über uns',              en: 'About' },
  'common.contact':              { de: 'Kontakt',               en: 'Contact' },
  'common.search':               { de: 'Suchen',                en: 'Search' },
  'common.back':                 { de: 'Zurück',                en: 'Back' },
  'common.loading':              { de: 'Wird geladen...',       en: 'Loading...' },
  'common.read_more':            { de: 'Weiterlesen',           en: 'Read more' },
  'common.show_more':            { de: 'Mehr anzeigen',         en: 'Show more' },
  'shop.add_to_cart':            { de: 'In den Warenkorb',      en: 'Add to cart' },
  'shop.cart':                   { de: 'Warenkorb',             en: 'Cart' },
  'shop.checkout':               { de: 'Zur Kasse',             en: 'Checkout' },
  'shop.price':                  { de: 'Preis',                 en: 'Price' },
  'shop.quantity':               { de: 'Menge',                 en: 'Quantity' },
  'shop.total':                  { de: 'Gesamt',                en: 'Total' },
  'shop.empty_cart':             { de: 'Warenkorb ist leer',    en: 'Cart is empty' },
  'blog.posted_on':              { de: 'Veröffentlicht am',     en: 'Posted on' },
  'blog.by':                     { de: 'von',                   en: 'by' },
  'blog.comments':               { de: 'Kommentare',            en: 'Comments' },
  'blog.no_posts':               { de: 'Keine Beiträge',        en: 'No posts found' },
  'booking.book_now':            { de: 'Jetzt buchen',          en: 'Book now' },
  'booking.select_service':      { de: 'Service wählen',        en: 'Select service' },
  'booking.select_date':         { de: 'Datum wählen',          en: 'Select date' },
  'booking.select_time':         { de: 'Uhrzeit wählen',        en: 'Select time' },
  'newsletter.subscribe':        { de: 'Newsletter abonnieren', en: 'Subscribe' },
  'newsletter.email_placeholder':{ de: 'Deine E-Mail-Adresse',  en: 'Your email address' },
  'footer.privacy':              { de: 'Datenschutz',           en: 'Privacy' },
  'footer.imprint':              { de: 'Impressum',             en: 'Imprint' },
  'footer.terms':                { de: 'AGB',                   en: 'Terms' },
};

const GROUPS = ['all', 'common', 'shop', 'blog', 'booking', 'newsletter', 'footer'] as const;

// ==================== COMPONENT ====================
export default function I18nDashboardPage() {
  const [tab, setTab] = useState<'languages' | 'translations'>('languages');
  const [settings, setSettings] = useState<LocaleSettings | null>(null);
  // uiValues: locale → key → value (custom overrides vom Backend)
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

  // ── Resolver: localeSettings ───────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    const data = await gqlRequest<{ localeSettings: LocaleSettings }>(`
      query { localeSettings { defaultLocale enabledLocales supportedLocales } }
    `);
    setSettings(data.localeSettings);
    // selectedLocale auf defaultLocale setzen falls noch nicht gesetzt
    setSelectedLocale((prev) =>
      data.localeSettings.enabledLocales.includes(prev)
        ? prev
        : data.localeSettings.defaultLocale,
    );
  }, []);

  // ── Resolver: uiTranslations(locale) ─────────────────────────────────────
  const loadUiTranslations = useCallback(async (locale: string) => {
    const data = await gqlRequest<{ uiTranslations: Record<string, string> }>(`
      query($locale: String!) { uiTranslations(locale: $locale) }
    `, { locale });
    setUiValues(data.uiTranslations || {});
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await loadSettings();
      } catch {
        showToast('Spracheinstellungen konnten nicht geladen werden', 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadSettings]);

  useEffect(() => {
    if (tab === 'translations') {
      loadUiTranslations(selectedLocale);
    }
  }, [selectedLocale, tab, loadUiTranslations]);

  // ── Resolver: updateLocaleSettings(defaultLocale, enabledLocales) ─────────
  const saveLocaleSettings = async (newDefault: string, newEnabled: string[]) => {
    setSaving(true);
    try {
      await gqlRequest<{ updateLocaleSettings: boolean }>(`
        mutation($defaultLocale: String!, $enabledLocales: [String!]!) {
          updateLocaleSettings(defaultLocale: $defaultLocale, enabledLocales: $enabledLocales)
        }
      `, { defaultLocale: newDefault, enabledLocales: newEnabled });
      setSettings((prev) =>
        prev ? { ...prev, defaultLocale: newDefault, enabledLocales: newEnabled } : prev,
      );
      showToast('Spracheinstellungen gespeichert');
    } catch {
      showToast('Fehler beim Speichern', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleLocale = (code: string) => {
    if (!settings) return;
    const isEnabled = settings.enabledLocales.includes(code);
    // Standardsprache kann nicht deaktiviert werden
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
    // Standard aktiviert automatisch die Sprache
    const newEnabled = settings.enabledLocales.includes(code)
      ? settings.enabledLocales
      : [...settings.enabledLocales, code];
    saveLocaleSettings(code, newEnabled);
  };

  // ── Resolver: setUiTranslation(locale, key, value) ────────────────────────
  const saveTranslation = async (key: string, value: string) => {
    try {
      await gqlRequest(`
        mutation($locale: String!, $key: String!, $value: String!) {
          setUiTranslation(locale: $locale, key: $key, value: $value)
        }
      `, { locale: selectedLocale, key, value });
    } catch {
      showToast('Fehler beim Speichern der Übersetzung', 'error');
    }
  };

  // Lokalen State + Backend aktualisieren
  const handleTranslationChange = (key: string, value: string) => {
    setUiValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleTranslationBlur = (key: string, value: string) => {
    // Nur speichern wenn der Wert vom Default abweicht oder schon gespeichert war
    const defaultValue = DEFAULT_UI_KEYS[key]?.[selectedLocale] || '';
    if (value !== defaultValue || uiValues[key] !== undefined) {
      saveTranslation(key, value);
    }
  };

  const getDisplayValue = (key: string) => uiValues[key] ?? '';
  const getPlaceholder = (key: string) =>
    DEFAULT_UI_KEYS[key]?.[selectedLocale] ||
    DEFAULT_UI_KEYS[key]?.['de'] ||
    DEFAULT_UI_KEYS[key]?.['en'] ||
    key;

  const filteredKeys = Object.keys(DEFAULT_UI_KEYS).filter(
    (k) => filterGroup === 'all' || k.startsWith(`${filterGroup}.`),
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const allLocales = Object.entries(LOCALE_META).map(([code, meta]) => ({
    code,
    ...meta,
    enabled: settings?.enabledLocales.includes(code) ?? false,
    isDefault: settings?.defaultLocale === code,
  }));

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white transition-all ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">🌐 Mehrsprachigkeit (i18n)</h1>
        {saving && (
          <span className="text-sm text-muted-foreground animate-pulse">Speichert...</span>
        )}
      </div>

      {/* Standard-Sprache Info */}
      {settings && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
          <span className="text-muted-foreground">Standardsprache: </span>
          <span className="font-semibold text-foreground">
            {LOCALE_META[settings.defaultLocale]?.flag} {LOCALE_META[settings.defaultLocale]?.name}
          </span>
          <span className="text-muted-foreground ml-4">Aktive Sprachen: </span>
          <span className="font-semibold text-foreground">
            {settings.enabledLocales.join(', ')}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {([['languages', '🗺️ Sprachen'], ['translations', '✏️ UI-Texte']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── SPRACHEN TAB ─────────────────────────────────────────────────────── */}
      {tab === 'languages' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {allLocales.map((locale) => (
            <div
              key={locale.code}
              className={`rounded-xl border p-4 text-center transition-all ${
                locale.enabled
                  ? 'bg-card border-primary/20 shadow-sm'
                  : 'bg-muted border-border opacity-60'
              }`}
            >
              <div className="text-3xl mb-2">{locale.flag}</div>
              <p className="font-medium text-sm text-foreground">{locale.name}</p>
              <p className="text-xs text-muted-foreground uppercase">{locale.code}</p>

              {locale.isDefault && (
                <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                  Standard
                </span>
              )}

              <div className="mt-3 space-y-1">
                <button
                  onClick={() => toggleLocale(locale.code)}
                  disabled={locale.isDefault || saving}
                  className={`w-full text-xs py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    locale.enabled
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-muted text-muted-foreground hover:bg-border'
                  }`}
                >
                  {locale.enabled ? '✓ Aktiv' : 'Aktivieren'}
                </button>

                {locale.enabled && !locale.isDefault && (
                  <button
                    onClick={() => setDefaultLocale(locale.code)}
                    disabled={saving}
                    className="w-full text-xs py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    Als Standard
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── UI-TEXTE TAB ─────────────────────────────────────────────────────── */}
      {tab === 'translations' && (
        <div className="space-y-4">
          {/* Sprach-Selector */}
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-medium text-muted-foreground">Sprache:</label>
            <div className="flex gap-2 flex-wrap">
              {allLocales.filter((l) => l.enabled).map((l) => (
                <button
                  key={l.code}
                  onClick={() => setSelectedLocale(l.code)}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                    selectedLocale === l.code
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-border'
                  }`}
                >
                  {l.flag} {l.code.toUpperCase()}
                  {l.isDefault && <span className="text-xs opacity-70">(Standard)</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Gruppen-Filter */}
          <div className="flex gap-2 flex-wrap">
            {GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setFilterGroup(g)}
                className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                  filterGroup === g
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-border'
                }`}
              >
                {g === 'all' ? 'Alle' : g}
              </button>
            ))}
          </div>

          {/* Translation-Editor */}
          <div className="rounded-lg border border-border divide-y divide-border bg-card">
            {filteredKeys.map((key) => {
              const value = getDisplayValue(key);
              const placeholder = getPlaceholder(key);
              const hasCustom = uiValues[key] !== undefined && uiValues[key] !== '';

              return (
                <div key={key} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-52 shrink-0">
                    <span className="text-xs font-mono text-muted-foreground">{key}</span>
                    {hasCustom && (
                      <span className="ml-2 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        angepasst
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => handleTranslationChange(key, e.target.value)}
                    onBlur={(e) => handleTranslationBlur(key, e.target.value)}
                    className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  />
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            💡 Platzhaltertext = Standardwert aus dem System. Eigene Werte werden sofort beim Verlassen des Feldes gespeichert.
          </p>
        </div>
      )}
    </div>
  );
}