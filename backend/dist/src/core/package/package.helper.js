"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADDON_DEFINITIONS = exports.PACKAGE_PRICES = exports.PACKAGE_LIMITS = exports.PACKAGE_FEATURES = exports.PACKAGE_ORDER = exports.AddonType = exports.PackageType = void 0;
exports.hasFeature = hasFeature;
exports.getBaseLimit = getBaseLimit;
exports.calculateTotalLimits = calculateTotalLimits;
exports.isWithinLimit = isWithinLimit;
exports.getPackageIndex = getPackageIndex;
exports.canChangeTo = canChangeTo;
exports.formatPrice = formatPrice;
var PackageType;
(function (PackageType) {
    PackageType["PAGE"] = "page";
    PackageType["LANDING"] = "landing";
    PackageType["CREATOR"] = "creator";
    PackageType["BUSINESS"] = "business";
    PackageType["SHOP"] = "shop";
    PackageType["PROFESSIONAL"] = "professional";
    PackageType["ENTERPRISE"] = "enterprise";
})(PackageType || (exports.PackageType = PackageType = {}));
var AddonType;
(function (AddonType) {
    AddonType["SHOP_BUSINESS"] = "shop_business";
    AddonType["SHOP_PRO"] = "shop_pro";
    AddonType["EMAIL_STARTER"] = "email_starter";
    AddonType["EMAIL_BUSINESS"] = "email_business";
    AddonType["EXTRA_USERS"] = "extra_users";
    AddonType["SHOP_MODULE"] = "shop_module";
    AddonType["NEWSLETTER"] = "newsletter";
    AddonType["BOOKING"] = "booking";
    AddonType["AI_CONTENT"] = "ai_content";
    AddonType["FORM_BUILDER"] = "form_builder";
    AddonType["I18N"] = "i18n";
    AddonType["EXTRA_PRODUCTS"] = "extra_products";
    AddonType["EXTRA_AI_CREDITS"] = "extra_ai_credits";
})(AddonType || (exports.AddonType = AddonType = {}));
exports.PACKAGE_ORDER = [
    PackageType.PAGE,
    PackageType.LANDING,
    PackageType.CREATOR,
    PackageType.BUSINESS,
    PackageType.SHOP,
    PackageType.PROFESSIONAL,
    PackageType.ENTERPRISE,
];
exports.PACKAGE_FEATURES = {
    [PackageType.PAGE]: {
        cms: false,
        shop: false,
        newsletter: false,
        booking: false,
        formBuilder: false,
        analytics: true,
        ai: false,
        i18n: false,
        customDomain: false,
        whiteLabel: false,
    },
    [PackageType.LANDING]: {
        cms: false,
        shop: false,
        newsletter: false,
        booking: false,
        formBuilder: true,
        analytics: true,
        ai: false,
        i18n: false,
        customDomain: true,
        whiteLabel: false,
    },
    [PackageType.CREATOR]: {
        cms: true,
        shop: false,
        newsletter: false,
        booking: false,
        formBuilder: true,
        analytics: true,
        ai: false,
        i18n: false,
        customDomain: true,
        whiteLabel: false,
    },
    [PackageType.BUSINESS]: {
        cms: true,
        shop: false,
        newsletter: true,
        booking: true,
        formBuilder: true,
        analytics: true,
        ai: false,
        i18n: false,
        customDomain: true,
        whiteLabel: false,
    },
    [PackageType.SHOP]: {
        cms: true,
        shop: true,
        newsletter: true,
        booking: false,
        formBuilder: true,
        analytics: true,
        ai: false,
        i18n: false,
        customDomain: true,
        whiteLabel: false,
    },
    [PackageType.PROFESSIONAL]: {
        cms: true,
        shop: true,
        newsletter: true,
        booking: true,
        formBuilder: true,
        analytics: true,
        ai: true,
        i18n: true,
        customDomain: true,
        whiteLabel: false,
    },
    [PackageType.ENTERPRISE]: {
        cms: true,
        shop: true,
        newsletter: true,
        booking: true,
        formBuilder: true,
        analytics: true,
        ai: true,
        i18n: true,
        customDomain: true,
        whiteLabel: true,
    },
};
exports.PACKAGE_LIMITS = {
    [PackageType.PAGE]: {
        users: 1,
        posts: 0,
        pages: 1,
        products: 0,
        emailsPerMonth: 0,
        subscribers: 0,
        aiCredits: 0,
        storageMb: 100,
    },
    [PackageType.LANDING]: {
        users: 1,
        posts: 0,
        pages: 3,
        products: 0,
        emailsPerMonth: 0,
        subscribers: 0,
        aiCredits: 0,
        storageMb: 500,
    },
    [PackageType.CREATOR]: {
        users: 2,
        posts: 50,
        pages: 10,
        products: 0,
        emailsPerMonth: 0,
        subscribers: 0,
        aiCredits: 0,
        storageMb: 1024,
    },
    [PackageType.BUSINESS]: {
        users: 5,
        posts: 200,
        pages: 30,
        products: 0,
        emailsPerMonth: 5000,
        subscribers: 1000,
        aiCredits: 0,
        storageMb: 5120,
    },
    [PackageType.SHOP]: {
        users: 10,
        posts: 500,
        pages: 50,
        products: 200,
        emailsPerMonth: 10000,
        subscribers: 3000,
        aiCredits: 0,
        storageMb: 10240,
    },
    [PackageType.PROFESSIONAL]: {
        users: 25,
        posts: 1000,
        pages: 100,
        products: 1000,
        emailsPerMonth: 30000,
        subscribers: 10000,
        aiCredits: 500,
        storageMb: 25600,
    },
    [PackageType.ENTERPRISE]: {
        users: -1,
        posts: -1,
        pages: -1,
        products: -1,
        emailsPerMonth: 100000,
        subscribers: -1,
        aiCredits: 2000,
        storageMb: -1,
    },
};
exports.PACKAGE_PRICES = {
    [PackageType.PAGE]: 900,
    [PackageType.LANDING]: 1900,
    [PackageType.CREATOR]: 2900,
    [PackageType.BUSINESS]: 4900,
    [PackageType.SHOP]: 7900,
    [PackageType.PROFESSIONAL]: 12900,
    [PackageType.ENTERPRISE]: 24900,
};
exports.ADDON_DEFINITIONS = {
    [AddonType.SHOP_BUSINESS]: {
        name: 'Shop Business',
        description: 'Upgrade auf 1.000 Produkte',
        price: 2900,
        limits: { products: 1000 },
    },
    [AddonType.SHOP_PRO]: {
        name: 'Shop Pro',
        description: 'Unbegrenzte Produkte',
        price: 4900,
        limits: { products: -1 },
    },
    [AddonType.EMAIL_STARTER]: {
        name: 'Email Starter',
        description: '10.000 Emails pro Monat',
        price: 2900,
        limits: { emailsPerMonth: 10000 },
    },
    [AddonType.EMAIL_BUSINESS]: {
        name: 'Email Business',
        description: '100.000 Emails pro Monat',
        price: 5900,
        limits: { emailsPerMonth: 100000 },
    },
    [AddonType.EXTRA_USERS]: {
        name: 'Extra Benutzer',
        description: '+1 Team-Account',
        price: 300,
        limits: { users: 1 },
    },
    [AddonType.SHOP_MODULE]: {
        name: 'Shop Modul',
        description: 'Produkte verkaufen mit Warenkorb und Bestellverwaltung (100 Produkte)',
        price: 1500,
        limits: { products: 100 },
    },
    [AddonType.NEWSLETTER]: {
        name: 'Newsletter',
        description: 'E-Mail-Kampagnen an bis zu 500 Abonnenten',
        price: 900,
        limits: { subscribers: 500, emailsPerMonth: 2000 },
    },
    [AddonType.BOOKING]: {
        name: 'Booking System',
        description: 'Online-Terminbuchung mit Kalender und Bestätigungen',
        price: 900,
        limits: {},
    },
    [AddonType.AI_CONTENT]: {
        name: 'AI Content',
        description: '100 KI-Anfragen pro Monat',
        price: 900,
        limits: { aiCredits: 100 },
    },
    [AddonType.FORM_BUILDER]: {
        name: 'Form Builder',
        description: 'Beliebige Formulare mit 10 Feldtypen',
        price: 500,
        limits: {},
    },
    [AddonType.I18N]: {
        name: 'Mehrsprachigkeit',
        description: 'Website in bis zu 13 Sprachen',
        price: 500,
        limits: {},
    },
    [AddonType.EXTRA_PRODUCTS]: {
        name: 'Mehr Produkte (+100)',
        description: '+100 zusätzliche Produkte im Shop',
        price: 500,
        limits: { products: 100 },
    },
    [AddonType.EXTRA_AI_CREDITS]: {
        name: 'AI Credits (+200)',
        description: '+200 zusätzliche KI-Anfragen',
        price: 700,
        limits: { aiCredits: 200 },
    },
};
function hasFeature(packageType, feature) {
    const pkg = packageType;
    return exports.PACKAGE_FEATURES[pkg]?.[feature] ?? false;
}
function getBaseLimit(packageType, limit) {
    const pkg = packageType;
    return exports.PACKAGE_LIMITS[pkg]?.[limit] ?? 0;
}
function calculateTotalLimits(packageType, addons) {
    const baseLimits = {
        ...(exports.PACKAGE_LIMITS[packageType] ??
            exports.PACKAGE_LIMITS[PackageType.PAGE]),
    };
    addons.forEach((addon) => {
        const addonDef = exports.ADDON_DEFINITIONS[addon];
        if (!addonDef)
            return;
        const addonLimits = addonDef.limits;
        Object.entries(addonLimits).forEach(([key, value]) => {
            const limitKey = key;
            if (value === -1) {
                baseLimits[limitKey] = -1;
            }
            else if (baseLimits[limitKey] !== -1) {
                baseLimits[limitKey] += value;
            }
        });
    });
    return baseLimits;
}
function isWithinLimit(packageType, limitKey, current) {
    const limit = getBaseLimit(packageType, limitKey);
    if (limit === -1)
        return true;
    return current < limit;
}
function getPackageIndex(packageType) {
    return exports.PACKAGE_ORDER.indexOf(packageType);
}
function canChangeTo(currentPackage, targetPackage) {
    return currentPackage !== targetPackage;
}
function formatPrice(cents) {
    return `€${(cents / 100).toFixed(2)}`;
}
//# sourceMappingURL=package.helper.js.map