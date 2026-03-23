export declare enum PackageType {
    PAGE = "page",
    LANDING = "landing",
    CREATOR = "creator",
    BUSINESS = "business",
    SHOP = "shop",
    PROFESSIONAL = "professional",
    ENTERPRISE = "enterprise"
}
export declare enum AddonType {
    SHOP_BUSINESS = "shop_business",
    SHOP_PRO = "shop_pro",
    EMAIL_STARTER = "email_starter",
    EMAIL_BUSINESS = "email_business",
    EXTRA_USERS = "extra_users",
    SHOP_MODULE = "shop_module",
    NEWSLETTER = "newsletter",
    BOOKING = "booking",
    AI_CONTENT = "ai_content",
    FORM_BUILDER = "form_builder",
    I18N = "i18n",
    EXTRA_PRODUCTS = "extra_products",
    EXTRA_AI_CREDITS = "extra_ai_credits"
}
export interface PackageFeatures {
    cms: boolean;
    shop: boolean;
    newsletter: boolean;
    booking: boolean;
    formBuilder: boolean;
    analytics: boolean;
    ai: boolean;
    i18n: boolean;
    customDomain: boolean;
    whiteLabel: boolean;
}
export interface PackageLimits {
    users: number;
    posts: number;
    pages: number;
    products: number;
    emailsPerMonth: number;
    subscribers: number;
    aiCredits: number;
    storageMb: number;
}
export declare const PACKAGE_ORDER: PackageType[];
export declare const PACKAGE_FEATURES: Record<PackageType, PackageFeatures>;
export declare const PACKAGE_LIMITS: Record<PackageType, PackageLimits>;
export declare const PACKAGE_PRICES: Record<PackageType, number>;
export interface AddonDefinition {
    name: string;
    description: string;
    price: number;
    limits: Partial<PackageLimits>;
}
export declare const ADDON_DEFINITIONS: Record<AddonType, AddonDefinition>;
export declare function hasFeature(packageType: string, feature: keyof PackageFeatures): boolean;
export declare function getBaseLimit(packageType: string, limit: keyof PackageLimits): number;
export declare function calculateTotalLimits(packageType: string, addons: AddonType[]): PackageLimits;
export declare function isWithinLimit(packageType: string, limitKey: keyof PackageLimits, current: number): boolean;
export declare function getPackageIndex(packageType: string): number;
export declare function canChangeTo(currentPackage: string, targetPackage: string): boolean;
export declare function formatPrice(cents: number): string;
