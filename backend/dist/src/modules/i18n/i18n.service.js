"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18nService = exports.SUPPORTED_LOCALES = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
exports.SUPPORTED_LOCALES = [
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
];
const DEFAULT_UI_TRANSLATIONS = {
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
let I18nService = class I18nService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getLocaleSettings(tenantId) {
        const [tenant] = await this.db
            .select()
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId))
            .limit(1);
        return {
            defaultLocale: tenant.defaultLocale || 'de',
            enabledLocales: tenant.enabledLocales || ['de'],
            supportedLocales: [...exports.SUPPORTED_LOCALES],
        };
    }
    async updateLocaleSettings(tenantId, defaultLocale, enabledLocales) {
        if (!exports.SUPPORTED_LOCALES.includes(defaultLocale))
            throw new Error('Ungültige Sprache');
        if (!enabledLocales.includes(defaultLocale))
            enabledLocales.unshift(defaultLocale);
        await this.db
            .update(schema_1.tenants)
            .set({
            defaultLocale,
            enabledLocales,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId));
        return true;
    }
    async getTranslations(tenantId, entityType, entityId, locale) {
        let query = (0, drizzle_orm_1.sql) `SELECT * FROM translations WHERE tenant_id = ${tenantId} AND entity_type = ${entityType} AND entity_id = ${entityId}`;
        if (locale)
            query = (0, drizzle_orm_1.sql) `${query} AND locale = ${locale}`;
        query = (0, drizzle_orm_1.sql) `${query} ORDER BY field ASC`;
        const result = await this.db.execute(query);
        return result.rows || [];
    }
    async setTranslation(tenantId, entityType, entityId, locale, field, value) {
        await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO translations (tenant_id, entity_type, entity_id, locale, field, value)
          VALUES (${tenantId}, ${entityType}, ${entityId}, ${locale}, ${field}, ${value})
          ON CONFLICT (tenant_id, entity_type, entity_id, locale, field)
          DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`);
        return true;
    }
    async setTranslationsBatch(tenantId, entityType, entityId, locale, translations) {
        for (const [field, value] of Object.entries(translations)) {
            await this.setTranslation(tenantId, entityType, entityId, locale, field, value);
        }
        return true;
    }
    async deleteTranslations(tenantId, entityType, entityId, locale) {
        if (locale) {
            await this.db.execute((0, drizzle_orm_1.sql) `DELETE FROM translations WHERE tenant_id = ${tenantId} AND entity_type = ${entityType} AND entity_id = ${entityId} AND locale = ${locale}`);
        }
        else {
            await this.db.execute((0, drizzle_orm_1.sql) `DELETE FROM translations WHERE tenant_id = ${tenantId} AND entity_type = ${entityType} AND entity_id = ${entityId}`);
        }
        return true;
    }
    async getTranslatedContent(tenantId, entityType, entityId, locale, originalFields) {
        const translations = await this.getTranslations(tenantId, entityType, entityId, locale);
        const translated = { ...originalFields };
        for (const t of translations) {
            if (t.value)
                translated[t.field] = t.value;
        }
        return translated;
    }
    async getUiTranslations(tenantId, locale) {
        const defaults = DEFAULT_UI_TRANSLATIONS[locale] || DEFAULT_UI_TRANSLATIONS['en'] || {};
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT key, value FROM ui_translations WHERE tenant_id = ${tenantId} AND locale = ${locale}`);
        const custom = {};
        for (const row of result.rows || [])
            custom[row.key] = row.value;
        return { ...defaults, ...custom };
    }
    async setUiTranslation(tenantId, locale, key, value) {
        await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO ui_translations (tenant_id, locale, key, value) VALUES (${tenantId}, ${locale}, ${key}, ${value})
          ON CONFLICT (tenant_id, locale, key) DO UPDATE SET value = EXCLUDED.value`);
        return true;
    }
    async getAllUiTranslations(tenantId) {
        const settings = await this.getLocaleSettings(tenantId);
        const result = {};
        for (const locale of settings.enabledLocales) {
            result[locale] = await this.getUiTranslations(tenantId, locale);
        }
        return result;
    }
    async getPublicTranslations(tenantSlug, locale) {
        const [tenant] = await this.db
            .select()
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.slug, tenantSlug))
            .limit(1);
        if (!tenant)
            return { ui: {}, locale, defaultLocale: 'de' };
        const enabledLocales = tenant.enabledLocales || ['de'];
        const effectiveLocale = enabledLocales.includes(locale)
            ? locale
            : tenant.defaultLocale || 'de';
        return {
            ui: await this.getUiTranslations(tenant.id, effectiveLocale),
            locale: effectiveLocale,
            defaultLocale: tenant.defaultLocale || 'de',
            enabledLocales,
        };
    }
};
exports.I18nService = I18nService;
exports.I18nService = I18nService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], I18nService);
//# sourceMappingURL=i18n.service.js.map