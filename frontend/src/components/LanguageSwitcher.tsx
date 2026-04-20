'use client';
// 📂 PFAD: src/components/LanguageSwitcher.tsx

import { useState, useTransition } from 'react';
import { useLocale } from 'next-intl';

const LOCALES: Record<string, { name: string; flag: string }> = {
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

export function LanguageSwitcher() {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const current = LOCALES[locale] ?? LOCALES.de;

  const setLocale = (newLocale: string) => {
    // Cookie setzen
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    setOpen(false);
    // Seite neu laden damit Server den neuen Locale liest
    startTransition(() => {
      window.location.reload();
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-xs font-semibold text-muted-foreground uppercase">{locale}</span>
        <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg py-1 z-50 min-w-[170px] max-h-[400px] overflow-y-auto">
            {Object.entries(LOCALES).map(([code, { name, flag }]) => (
              <button
                key={code}
                onClick={() => setLocale(code)}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-muted transition-colors ${
                  code === locale ? 'bg-primary/5 text-primary font-semibold' : 'text-foreground'
                }`}
              >
                <span className="text-xl leading-none">{flag}</span>
                <span>{name}</span>
                {code === locale && <span className="ml-auto text-primary text-xs">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}