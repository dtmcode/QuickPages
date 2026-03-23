import { I18nService } from './i18n.service';
export declare class I18nResolver {
    private i18nService;
    constructor(i18nService: I18nService);
    localeSettings(tid: string): Promise<{
        defaultLocale: any;
        enabledLocales: any;
        supportedLocales: ("de" | "en" | "fr" | "es" | "it" | "nl" | "pl" | "tr" | "pt" | "ru" | "ar" | "ja" | "zh")[];
    }>;
    updateLocaleSettings(dl: string, el: string[], tid: string): Promise<boolean>;
    translations(et: string, eid: string, locale: string, tid: string): Promise<any>;
    setTranslation(et: string, eid: string, locale: string, field: string, value: string, tid: string): Promise<boolean>;
    setTranslationsBatch(et: string, eid: string, locale: string, translations: Record<string, string>, tid: string): Promise<boolean>;
    deleteTranslations(et: string, eid: string, locale: string, tid: string): Promise<boolean>;
    uiTranslations(locale: string, tid: string): Promise<Record<string, string>>;
    allUiTranslations(tid: string): Promise<Record<string, Record<string, string>>>;
    setUiTranslation(locale: string, key: string, value: string, tid: string): Promise<boolean>;
}
