import type { DrizzleDB } from '../../core/database/drizzle.module';
export interface BrandingSettings {
    platformName?: string;
    logoUrl?: string;
    logoInitial?: string;
    primaryColor?: string;
    hidePoweredBy?: boolean;
    faviconUrl?: string;
}
export declare class WhiteLabelService {
    private db;
    constructor(db: DrizzleDB);
    getSettings(tenantId: string): Promise<BrandingSettings>;
    updateSettings(tenantId: string, data: BrandingSettings): Promise<BrandingSettings>;
}
