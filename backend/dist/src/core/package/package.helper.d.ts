export type PackageType = 'website_micro' | 'website_standard' | 'website_pro' | 'blog_personal' | 'blog_publisher' | 'blog_magazine' | 'business_starter' | 'business_professional' | 'business_agency' | 'shop_mini' | 'shop_wachstum' | 'shop_premium' | 'members_community' | 'members_kurse' | 'members_academy';
export type AddonType = 'shop_module' | 'shop_extra' | 'booking_module' | 'blog_module' | 'newsletter_extra' | 'members_module' | 'ai_content' | 'extra_pages' | 'extra_users' | 'i18n' | 'custom_domain';
export interface PackageFeatures {
    websiteBuilder: boolean;
    maxPages: number;
    blog: boolean;
    maxPosts: number;
    maxAuthors: number;
    comments: boolean;
    shop: boolean;
    maxProducts: number;
    digitalProducts: boolean;
    productVariants: boolean;
    booking: boolean;
    maxBookingServices: number;
    newsletter: boolean;
    maxSubscribers: number;
    forms: boolean;
    maxForms: number;
    members: boolean;
    maxMembers: number;
    courses: boolean;
    maxCourses: number;
    maxDownloads: number;
    analytics: 'basic' | 'advanced' | 'full';
    customDomain: boolean;
    aiContent: boolean;
    aiCreditsPerMonth: number;
    i18n: boolean;
    maxUsers: number;
    storageMb: number;
    removeBranding: boolean;
}
export interface PackageDefinition {
    type: PackageType;
    category: 'website' | 'blog' | 'business' | 'shop' | 'members';
    tier: 1 | 2 | 3;
    name: string;
    tagline: string;
    description: string;
    priceMonthly: number;
    features: PackageFeatures;
    highlightFeatures: string[];
}
export declare const PACKAGES: Record<PackageType, PackageDefinition>;
export interface AddonDefinition {
    type: AddonType;
    name: string;
    description: string;
    priceMonthly: number;
    icon: string;
    adds: Partial<PackageFeatures>;
    availableForCategories: Array<'website' | 'blog' | 'business' | 'shop' | 'members' | 'all'>;
    requires?: AddonType[];
}
export declare const ADDONS: Record<AddonType, AddonDefinition>;
export declare const PACKAGE_CATEGORIES: ({
    id: "website";
    label: string;
    icon: string;
    tagline: string;
    description: string;
    color: string;
    examples: string;
    tiers: PackageType[];
} | {
    id: "blog";
    label: string;
    icon: string;
    tagline: string;
    description: string;
    color: string;
    examples: string;
    tiers: PackageType[];
} | {
    id: "business";
    label: string;
    icon: string;
    tagline: string;
    description: string;
    color: string;
    examples: string;
    tiers: PackageType[];
} | {
    id: "shop";
    label: string;
    icon: string;
    tagline: string;
    description: string;
    color: string;
    examples: string;
    tiers: PackageType[];
} | {
    id: "members";
    label: string;
    icon: string;
    tagline: string;
    description: string;
    color: string;
    examples: string;
    tiers: PackageType[];
})[];
export declare function getPackage(type: PackageType): PackageDefinition;
export declare function hasFeature(packageType: PackageType, feature: keyof PackageFeatures): boolean;
export declare function getLimit(packageType: PackageType, limit: keyof PackageFeatures): number;
export declare function formatPrice(cents: number): string;
export declare function formatLimit(val: number, singular: string, plural?: string): string;
export declare function getCategoryPackages(category: string): PackageDefinition[];
export declare const ALWAYS_INCLUDED: string[];
