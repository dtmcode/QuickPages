import { I18nService } from './i18n.service';
export declare class I18nPublicController {
    private i18nService;
    constructor(i18nService: I18nService);
    getTranslations(slug: string, locale: string): Promise<{
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
