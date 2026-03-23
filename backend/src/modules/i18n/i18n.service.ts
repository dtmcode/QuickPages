/**
 * ==================== I18N SERVICE ====================
 * Mehrsprachigkeit für Content + UI
 *
 * Content-Translations: Posts, Pages, Products etc. in verschiedenen Sprachen
 * UI-Translations: "In den Warenkorb", "Weiterlesen" etc.
 */

import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { tenants } from '../../drizzle/schema';
import { eq, sql } from 'drizzle-orm';

export const SUPPORTED_LOCALES = [
  'de',
  'en',
  'fr',
  'es',
  'it',
  'nl',
  'pl',
  'tr',
  'pt',
  'ru',
  'ar',
  'ja',
  'zh',
] as const;

// Default UI translations (German + English)
const DEFAULT_UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  de: {
    'common.home': 'Startseite',
    'common.contact': 'Kontakt',
    'common.about': 'Über uns',
    'common.search': 'Suchen',
    'common.back': 'Zurück',
    'common.loading': 'Wird geladen...',
    'common.read_more': 'Weiterlesen',
    'common.show_more': 'Mehr anzeigen',
    'shop.add_to_cart': 'In den Warenkorb',
    'shop.cart': 'Warenkorb',
    'shop.checkout': 'Zur Kasse',
    'shop.price': 'Preis',
    'shop.quantity': 'Menge',
    'shop.total': 'Gesamt',
    'shop.empty_cart': 'Warenkorb ist leer',
    'blog.posted_on': 'Veröffentlicht am',
    'blog.by': 'von',
    'blog.comments': 'Kommentare',
    'blog.no_posts': 'Keine Beiträge gefunden',
    'booking.book_now': 'Jetzt buchen',
    'booking.select_service': 'Service wählen',
    'booking.select_date': 'Datum wählen',
    'booking.select_time': 'Uhrzeit wählen',
    'newsletter.subscribe': 'Newsletter abonnieren',
    'newsletter.email_placeholder': 'Deine E-Mail-Adresse',
    'footer.privacy': 'Datenschutz',
    'footer.imprint': 'Impressum',
    'footer.terms': 'AGB',
  },
  en: {
    'common.home': 'Home',
    'common.contact': 'Contact',
    'common.about': 'About',
    'common.search': 'Search',
    'common.back': 'Back',
    'common.loading': 'Loading...',
    'common.read_more': 'Read more',
    'common.show_more': 'Show more',
    'shop.add_to_cart': 'Add to cart',
    'shop.cart': 'Cart',
    'shop.checkout': 'Checkout',
    'shop.price': 'Price',
    'shop.quantity': 'Quantity',
    'shop.total': 'Total',
    'shop.empty_cart': 'Cart is empty',
    'blog.posted_on': 'Posted on',
    'blog.by': 'by',
    'blog.comments': 'Comments',
    'blog.no_posts': 'No posts found',
    'booking.book_now': 'Book now',
    'booking.select_service': 'Select service',
    'booking.select_date': 'Select date',
    'booking.select_time': 'Select time',
    'newsletter.subscribe': 'Subscribe',
    'newsletter.email_placeholder': 'Your email address',
    'footer.privacy': 'Privacy',
    'footer.imprint': 'Legal Notice',
    'footer.terms': 'Terms',
  },
};

@Injectable()
export class I18nService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // ===== LOCALE SETTINGS =====
  async getLocaleSettings(tenantId: string) {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);
    return {
      defaultLocale: (tenant as any).defaultLocale || 'de',
      enabledLocales: (tenant as any).enabledLocales || ['de'],
      supportedLocales: [...SUPPORTED_LOCALES],
    };
  }

  async updateLocaleSettings(
    tenantId: string,
    defaultLocale: string,
    enabledLocales: string[],
  ) {
    if (!SUPPORTED_LOCALES.includes(defaultLocale as any))
      throw new Error('Ungültige Sprache');
    if (!enabledLocales.includes(defaultLocale))
      enabledLocales.unshift(defaultLocale);

    await this.db
      .update(tenants)
      .set({
        defaultLocale,
        enabledLocales,
        updatedAt: new Date(),
      } as any)
      .where(eq(tenants.id, tenantId));
    return true;
  }

  // ===== CONTENT TRANSLATIONS =====
  async getTranslations(
    tenantId: string,
    entityType: string,
    entityId: string,
    locale?: string,
  ) {
    let query = sql`SELECT * FROM translations WHERE tenant_id = ${tenantId} AND entity_type = ${entityType} AND entity_id = ${entityId}`;
    if (locale) query = sql`${query} AND locale = ${locale}`;
    query = sql`${query} ORDER BY field ASC`;
    const result = await this.db.execute(query);
    return (result as any).rows || [];
  }

  async setTranslation(
    tenantId: string,
    entityType: string,
    entityId: string,
    locale: string,
    field: string,
    value: string,
  ) {
    await this.db.execute(
      sql`INSERT INTO translations (tenant_id, entity_type, entity_id, locale, field, value)
          VALUES (${tenantId}, ${entityType}, ${entityId}, ${locale}, ${field}, ${value})
          ON CONFLICT (tenant_id, entity_type, entity_id, locale, field)
          DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    );
    return true;
  }

  async setTranslationsBatch(
    tenantId: string,
    entityType: string,
    entityId: string,
    locale: string,
    translations: Record<string, string>,
  ) {
    for (const [field, value] of Object.entries(translations)) {
      await this.setTranslation(
        tenantId,
        entityType,
        entityId,
        locale,
        field,
        value,
      );
    }
    return true;
  }

  async deleteTranslations(
    tenantId: string,
    entityType: string,
    entityId: string,
    locale?: string,
  ) {
    if (locale) {
      await this.db.execute(
        sql`DELETE FROM translations WHERE tenant_id = ${tenantId} AND entity_type = ${entityType} AND entity_id = ${entityId} AND locale = ${locale}`,
      );
    } else {
      await this.db.execute(
        sql`DELETE FROM translations WHERE tenant_id = ${tenantId} AND entity_type = ${entityType} AND entity_id = ${entityId}`,
      );
    }
    return true;
  }

  /**
   * Gibt Content mit Übersetzungen zurück
   * Fallback: defaultLocale → Originalwert
   */
  async getTranslatedContent(
    tenantId: string,
    entityType: string,
    entityId: string,
    locale: string,
    originalFields: Record<string, string>,
  ) {
    const translations = await this.getTranslations(
      tenantId,
      entityType,
      entityId,
      locale,
    );
    const translated = { ...originalFields };
    for (const t of translations) {
      if (t.value) translated[t.field] = t.value;
    }
    return translated;
  }

  // ===== UI TRANSLATIONS =====
  async getUiTranslations(
    tenantId: string,
    locale: string,
  ): Promise<Record<string, string>> {
    // Defaults laden
    const defaults =
      DEFAULT_UI_TRANSLATIONS[locale] || DEFAULT_UI_TRANSLATIONS['en'] || {};

    // Custom Overrides laden
    const result = await this.db.execute(
      sql`SELECT key, value FROM ui_translations WHERE tenant_id = ${tenantId} AND locale = ${locale}`,
    );

    const custom: Record<string, string> = {};
    for (const row of (result as any).rows || []) custom[row.key] = row.value;

    return { ...defaults, ...custom };
  }

  async setUiTranslation(
    tenantId: string,
    locale: string,
    key: string,
    value: string,
  ) {
    await this.db.execute(
      sql`INSERT INTO ui_translations (tenant_id, locale, key, value) VALUES (${tenantId}, ${locale}, ${key}, ${value})
          ON CONFLICT (tenant_id, locale, key) DO UPDATE SET value = EXCLUDED.value`,
    );
    return true;
  }

  async getAllUiTranslations(
    tenantId: string,
  ): Promise<Record<string, Record<string, string>>> {
    const settings = await this.getLocaleSettings(tenantId);
    const result: Record<string, Record<string, string>> = {};
    for (const locale of settings.enabledLocales) {
      result[locale] = await this.getUiTranslations(tenantId, locale);
    }
    return result;
  }

  // ===== PUBLIC: All translations for a locale =====
  async getPublicTranslations(tenantSlug: string, locale: string) {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, tenantSlug))
      .limit(1);
    if (!tenant) return { ui: {}, locale, defaultLocale: 'de' };

    const enabledLocales = (tenant as any).enabledLocales || ['de'];
    const effectiveLocale = enabledLocales.includes(locale)
      ? locale
      : (tenant as any).defaultLocale || 'de';

    return {
      ui: await this.getUiTranslations(tenant.id, effectiveLocale),
      locale: effectiveLocale,
      defaultLocale: (tenant as any).defaultLocale || 'de',
      enabledLocales,
    };
  }
}
