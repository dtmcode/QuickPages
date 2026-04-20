// 📂 PFAD: src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

const SUPPORTED = ['de','en','fr','es','it','nl','pl','tr','pt','ru','ar','ja','zh'];

function detectLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return 'de';
  const langs = acceptLanguage.split(',').map(l => l.split(';')[0].trim().toLowerCase());
  for (const lang of langs) {
    const short = lang.slice(0, 2);
    if (SUPPORTED.includes(short)) return short;
  }
  return 'de';
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  // 1. Cookie hat Priorität (User hat manuell gewählt)
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = (cookieLocale && SUPPORTED.includes(cookieLocale))
    ? cookieLocale
    : detectLocale(headerStore.get('accept-language'));

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});