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
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    CANCELLED = "cancelled",
    PAST_DUE = "past_due",
    TRIALING = "trialing"
}
export declare class Subscription {
    id: string;
    package: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    stripeSubscriptionId?: string;
    createdAt: Date;
}
export declare class TenantAddon {
    id: string;
    addonType: AddonType;
    quantity: number;
    isActive: boolean;
    activatedAt: Date;
    expiresAt?: Date;
    createdAt: Date;
}
export declare class UsageStats {
    month: string;
    emailsSent: number;
    productsCreated: number;
    postsCreated: number;
    apiCalls: number;
    storageUsedMb: number;
}
export declare class PackageLimitsType {
    users: number;
    posts: number;
    pages: number;
    products: number;
    emailsPerMonth: number;
    subscribers: number;
    aiCredits: number;
    storageMb: number;
}
export declare class TenantSubscriptionInfo {
    currentPackage: string;
    limits: PackageLimitsType;
    addons: TenantAddon[];
    currentUsage: UsageStats;
    subscription?: Subscription;
}
export declare class AddonDefinitionType {
    type: AddonType;
    name: string;
    description: string;
    price: number;
    limits: PackageLimitsType;
}
export declare class PackageDefinitionType {
    type: string;
    name: string;
    description: string;
    price: number;
    limits: PackageLimitsType;
    features: string[];
}
export declare class AvailablePackagesResponse {
    packages: PackageDefinitionType[];
    addons: AddonDefinitionType[];
}
