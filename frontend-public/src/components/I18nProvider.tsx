'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ==================== TYPES ====================
interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  enabledLocales: Array<{ code: string; name: string; flag: string }>;
  defaultLocale: string;
  t: (key: string, fallback?: string) => string;
}

interface I18nData {
  locale: string;
  defaultLocale: string;
  enabledLocales: Array<{ code: string; name: string; flag: string }>;
  translations: Record<string, string>;
}

// ==================== CONTEXT ====================
const I18nContext = createContext<I18nContextType>({
  locale: 'de',
  setLocale: () => {},
  enabledLocales: [],
  defaultLocale: 'de',
  t: (key: string, fallback?: string) => fallback || key,
});

export function useI18n() {
  return useContext(I18nContext);
}

// ==================== PROVIDER ====================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

interface I18nProviderProps {
  tenant: string;
  children: ReactNode;
}

export function I18nProvider({ tenant, children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState('de');
  const [defaultLocale, setDefaultLocale] = useState('de');
  const [enabledLocales, setEnabledLocales] = useState<Array<{ code: string; name: string; flag: string }>>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  const loadTranslations = useCallback(async (loc: string) => {
    try {
      const res = await fetch(`${API_URL}/api/public/${tenant}/i18n?locale=${loc}`);
      if (!res.ok) return;
      const data: I18nData = await res.json();
      setTranslations(data.translations || {});
      setDefaultLocale(data.defaultLocale || 'de');
      setEnabledLocales(data.enabledLocales || []);
    } catch {
      console.error('i18n: Fehler beim Laden der Übersetzungen');
    } finally {
      setLoaded(true);
    }
  }, [tenant]);

  useEffect(() => {
    // Detect initial locale from cookie or browser
    const cookieLocale = getCookie('locale');
    if (cookieLocale) {
      setLocaleState(cookieLocale);
      loadTranslations(cookieLocale);
    } else {
      loadTranslations('de');
    }
  }, [loadTranslations]);

  const setLocale = useCallback((newLocale: string) => {
    setLocaleState(newLocale);
    setCookie('locale', newLocale);
    loadTranslations(newLocale);
  }, [loadTranslations]);

  const t = useCallback((key: string, fallback?: string): string => {
    return translations[key] || fallback || key;
  }, [translations]);

  const contextValue: I18nContextType = {
    locale,
    setLocale,
    enabledLocales,
    defaultLocale,
    t,
  };

  if (!loaded) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

// ==================== LANGUAGE SWITCHER ====================
export function LanguageSwitcher() {
  const { locale, setLocale, enabledLocales } = useI18n();
  const [open, setOpen] = useState(false);

  // Don't render if only 1 language
  if (enabledLocales.length <= 1) return null;

  const current = enabledLocales.find((l) => l.code === locale) || enabledLocales[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 transition-colors"
      >
        <span>{current?.flag}</span>
        <span className="uppercase text-xs font-medium">{locale}</span>
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg border shadow-lg py-1 z-50 min-w-[140px]">
            {enabledLocales.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLocale(l.code); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 ${
                  l.code === locale ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}