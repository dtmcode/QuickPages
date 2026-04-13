'use client';

import { useState, useEffect, useCallback } from 'react';

// ==================== TYPES ====================
interface LocaleConfig {
  code: string;
  name: string;
  flag: string;
  enabled: boolean;
  isDefault: boolean;
}

interface UiTranslation {
  key: string;
  value: string;
  locale: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

// ==================== GRAPHQL HELPER ====================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_URL}/graphql`, {
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

// ==================== AVAILABLE LOCALES ====================
const ALL_LOCALES: Array<{ code: string; name: string; flag: string }> = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

// ==================== DEFAULT UI KEYS ====================
const DEFAULT_UI_KEYS: Record<string, Record<string, string>> = {
  'common.home': { de: 'Startseite', en: 'Home' },
  'common.about': { de: 'Über uns', en: 'About' },
  'common.contact': { de: 'Kontakt', en: 'Contact' },
  'common.search': { de: 'Suchen', en: 'Search' },
  'common.read_more': { de: 'Weiterlesen', en: 'Read more' },
  'shop.add_to_cart': { de: 'In den Warenkorb', en: 'Add to cart' },
  'shop.checkout': { de: 'Zur Kasse', en: 'Checkout' },
  'shop.price': { de: 'Preis', en: 'Price' },
  'blog.posted_on': { de: 'Veröffentlicht am', en: 'Posted on' },
  'blog.comments': { de: 'Kommentare', en: 'Comments' },
  'booking.book_now': { de: 'Jetzt buchen', en: 'Book now' },
  'booking.select_date': { de: 'Datum wählen', en: 'Select date' },
  'newsletter.subscribe': { de: 'Abonnieren', en: 'Subscribe' },
  'newsletter.email_placeholder': { de: 'Ihre E-Mail-Adresse', en: 'Your email address' },
  'footer.privacy': { de: 'Datenschutz', en: 'Privacy' },
  'footer.imprint': { de: 'Impressum', en: 'Imprint' },
};

// ==================== COMPONENT ====================
export default function I18nDashboardPage() {
  const [tab, setTab] = useState<'languages' | 'translations'>('languages');
  const [locales, setLocales] = useState<LocaleConfig[]>([]);
  const [translations, setTranslations] = useState<UiTranslation[]>([]);
  const [selectedLocale, setSelectedLocale] = useState('de');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [filterGroup, setFilterGroup] = useState('all');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ==================== LOAD DATA ====================
  const loadLocales = useCallback(async () => {
    try {
      const data = await gqlRequest<{ i18nLocales: LocaleConfig[] }>(`
        query { i18nLocales { code name flag enabled isDefault } }
      `);
      if (data.i18nLocales.length > 0) {
        setLocales(data.i18nLocales);
      } else {
        // Defaults
        setLocales(
          ALL_LOCALES.map((l) => ({
            ...l,
            enabled: l.code === 'de',
            isDefault: l.code === 'de',
          }))
        );
      }
    } catch {
      setLocales(
        ALL_LOCALES.map((l) => ({
          ...l,
          enabled: l.code === 'de',
          isDefault: l.code === 'de',
        }))
      );
    }
  }, []);

  const loadTranslations = useCallback(async () => {
    try {
      const data = await gqlRequest<{ allUiTranslations: UiTranslation[] }>(`
        query($locale: String!) {
          allUiTranslations(locale: $locale) { key value locale }
        }
      `, { locale: selectedLocale });
      setTranslations(data.allUiTranslations);
    } catch {
      setTranslations([]);
    }
  }, [selectedLocale]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadLocales();
      await loadTranslations();
      setLoading(false);
    };
    init();
  }, [loadLocales, loadTranslations]);

  useEffect(() => {
    if (tab === 'translations') loadTranslations();
  }, [selectedLocale, tab, loadTranslations]);

  // ==================== ACTIONS ====================
  const toggleLocale = async (code: string) => {
    const updated = locales.map((l) =>
      l.code === code ? { ...l, enabled: !l.enabled } : l
    );
    setLocales(updated);
    try {
      await gqlRequest(`
        mutation($code: String!, $enabled: Boolean!) {
          toggleLocale(code: $code, enabled: $enabled) { code enabled }
        }
      `, { code, enabled: !locales.find((l) => l.code === code)?.enabled });
    } catch {
      showToast('Fehler beim Speichern', 'error');
    }
  };

  const setDefaultLocale = async (code: string) => {
    const updated = locales.map((l) => ({
      ...l,
      isDefault: l.code === code,
      enabled: l.code === code ? true : l.enabled,
    }));
    setLocales(updated);
    try {
      await gqlRequest(`
        mutation($code: String!) { setDefaultLocale(code: $code) { code isDefault } }
      `, { code });
      showToast(`${code.toUpperCase()} als Standard gesetzt`);
    } catch {
      showToast('Fehler', 'error');
    }
  };

  const saveTranslation = async (key: string, value: string) => {
    try {
      await gqlRequest(`
        mutation($locale: String!, $key: String!, $value: String!) {
          setUiTranslation(locale: $locale, key: $key, value: $value) { key value }
        }
      `, { locale: selectedLocale, key, value });
    } catch {
      showToast('Fehler beim Speichern', 'error');
    }
  };

  // ==================== TRANSLATION HELPERS ====================
  const getTranslationValue = (key: string): string => {
    const found = translations.find((t) => t.key === key);
    if (found) return found.value;
    return '';
  };

  const getPlaceholder = (key: string): string => {
    const defaults = DEFAULT_UI_KEYS[key];
    if (!defaults) return '';
    return defaults[selectedLocale] || defaults['de'] || defaults['en'] || '';
  };

  const groups = ['all', 'common', 'shop', 'blog', 'booking', 'newsletter', 'footer'];

  const filteredKeys = Object.keys(DEFAULT_UI_KEYS).filter(
    (key) => filterGroup === 'all' || key.startsWith(`${filterGroup}.`)
  );

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900">Mehrsprachigkeit (i18n)</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {([['languages', 'Sprachen'], ['translations', 'UI-Texte']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* ==================== LANGUAGES TAB ==================== */}
      {tab === 'languages' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {ALL_LOCALES.map((locale) => {
            const config = locales.find((l) => l.code === locale.code);
            const isEnabled = config?.enabled || false;
            const isDefault = config?.isDefault || false;
            return (
              <div
                key={locale.code}
                className={`rounded-xl border p-4 text-center transition-all ${
                  isEnabled ? 'bg-white border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="text-3xl mb-2">{locale.flag}</div>
                <p className="font-medium text-sm text-gray-900">{locale.name}</p>
                <p className="text-xs text-gray-400 uppercase">{locale.code}</p>
                {isDefault && (
                  <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    Standard
                  </span>
                )}
                <div className="mt-3 space-y-1">
                  <button
                    onClick={() => toggleLocale(locale.code)}
                    className={`w-full text-xs py-1 rounded ${
                      isEnabled ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isEnabled ? 'Aktiviert ✓' : 'Aktivieren'}
                  </button>
                  {isEnabled && !isDefault && (
                    <button
                      onClick={() => setDefaultLocale(locale.code)}
                      className="w-full text-xs py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                      Als Standard
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== TRANSLATIONS TAB ==================== */}
      {tab === 'translations' && (
        <div className="space-y-4">
          {/* Locale Selector */}
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-medium text-gray-700">Sprache:</label>
            <div className="flex gap-2">
              {locales.filter((l) => l.enabled).map((l) => (
                <button
                  key={l.code}
                  onClick={() => setSelectedLocale(l.code)}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 ${
                    selectedLocale === l.code ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {l.flag} {l.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Group Filter */}
          <div className="flex gap-2 flex-wrap">
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setFilterGroup(g)}
                className={`px-3 py-1 rounded-lg text-xs ${
                  filterGroup === g ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {g === 'all' ? 'Alle' : g}
              </button>
            ))}
          </div>

          {/* Translation Editor */}
          <div className="bg-white rounded-lg border divide-y">
            {filteredKeys.map((key) => (
              <div key={key} className="flex items-center gap-4 px-4 py-3">
                <div className="w-48 shrink-0">
                  <span className="text-xs font-mono text-gray-400">{key}</span>
                </div>
                <input
                  type="text"
                  value={getTranslationValue(key)}
                  placeholder={getPlaceholder(key)}
                  onBlur={(e) => {
                    if (e.target.value !== getTranslationValue(key)) {
                      saveTranslation(key, e.target.value);
                      // Update local state
                      setTranslations((prev) => {
                        const existing = prev.findIndex((t) => t.key === key);
                        if (existing >= 0) {
                          const updated = [...prev];
                          updated[existing] = { ...updated[existing], value: e.target.value };
                          return updated;
                        }
                        return [...prev, { key, value: e.target.value, locale: selectedLocale }];
                      });
                    }
                  }}
                  onChange={(e) => {
                    setTranslations((prev) => {
                      const existing = prev.findIndex((t) => t.key === key);
                      if (existing >= 0) {
                        const updated = [...prev];
                        updated[existing] = { ...updated[existing], value: e.target.value };
                        return updated;
                      }
                      return [...prev, { key, value: e.target.value, locale: selectedLocale }];
                    });
                  }}
                  className="flex-1 border rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}