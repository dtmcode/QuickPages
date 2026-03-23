import { WhiteLabelService } from './white-label.service';
declare class BrandingSettingsType {
    platformName?: string;
    logoUrl?: string;
    logoInitial?: string;
    primaryColor?: string;
    hidePoweredBy?: boolean;
    faviconUrl?: string;
}
declare class UpdateBrandingInput {
    platformName?: string;
    logoUrl?: string;
    logoInitial?: string;
    primaryColor?: string;
    hidePoweredBy?: boolean;
    faviconUrl?: string;
}
export declare class WhiteLabelResolver {
    private whiteLabelService;
    constructor(whiteLabelService: WhiteLabelService);
    brandingSettings(tenantId: string): Promise<BrandingSettingsType>;
    updateBranding(input: UpdateBrandingInput, tenantId: string): Promise<BrandingSettingsType>;
}
export {};
