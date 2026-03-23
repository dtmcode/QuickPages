import type { DrizzleDB } from '../../core/database/drizzle.module';
export declare const SUPPORTED_LOCALES: readonly ["de", "en", "fr", "es", "it", "nl", "pl", "tr", "pt", "ru", "ar", "ja", "zh"];
export declare class I18nService {
    private db;
    constructor(db: DrizzleDB);
    getLocaleSettings(tenantId: string): Promise<{
        defaultLocale: any;
        enabledLocales: any;
        supportedLocales: ("de" | "en" | "fr" | "es" | "it" | "nl" | "pl" | "tr" | "pt" | "ru" | "ar" | "ja" | "zh")[];
    }>;
    updateLocaleSettings(tenantId: string, defaultLocale: string, enabledLocales: string[]): Promise<boolean>;
    getTranslations(tenantId: string, entityType: string, entityId: string, locale?: string): Promise<any>;
    setTranslation(tenantId: string, entityType: string, entityId: string, locale: string, field: string, value: string): Promise<boolean>;
    setTranslationsBatch(tenantId: string, entityType: string, entityId: string, locale: string, translations: Record<string, string>): Promise<boolean>;
    deleteTranslations(tenantId: string, entityType: string, entityId: string, locale?: string): Promise<boolean>;
    getTranslatedContent(tenantId: string, entityType: string, entityId: string, locale: string, originalFields: Record<string, string>): Promise<{
        [x: string]: string;
    }>;
    getUiTranslations(tenantId: string, locale: string): Promise<Record<string, string>>;
    setUiTranslation(tenantId: string, locale: string, key: string, value: string): Promise<boolean>;
    getAllUiTranslations(tenantId: string): Promise<Record<string, Record<string, string>>>;
    getPublicTranslations(tenantSlug: string, locale: string): Promise<{
        ui: {};
        locale: string;
        defaultLocale: string;
        enabledLocales?: undefined;
    } | {
        ui: Record<string, string>;
        locale: any;
        defaultLocale: any;
        enabledLocales: any;
    }>;
}
