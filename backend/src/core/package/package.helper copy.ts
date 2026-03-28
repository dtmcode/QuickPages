// 📂 PFAD: backend/src/packages/package.helper.ts

export enum PackageType {
  PAGE = 'page',
  LANDING = 'landing',
  CREATOR = 'creator',
  BUSINESS = 'business',
  SHOP = 'shop',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

export enum AddonType {
  // Alte Werte — bleiben für Backwards-Compat
  SHOP_BUSINESS = 'shop_business',
  SHOP_PRO = 'shop_pro',
  EMAIL_STARTER = 'email_starter',
  EMAIL_BUSINESS = 'email_business',
  EXTRA_USERS = 'extra_users',
  // Neue Werte
  SHOP_MODULE = 'shop_module',
  NEWSLETTER = 'newsletter',
  BOOKING = 'booking',
  AI_CONTENT = 'ai_content',
  FORM_BUILDER = 'form_builder',
  I18N = 'i18n',
  EXTRA_PRODUCTS = 'extra_products',
  EXTRA_AI_CREDITS = 'extra_ai_credits',
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

// ==================== PACKAGE ORDER ====================
export const PACKAGE_ORDER: PackageType[] = [
  PackageType.PAGE,
  PackageType.LANDING,
  PackageType.CREATOR,
  PackageType.BUSINESS,
  PackageType.SHOP,
  PackageType.PROFESSIONAL,
  PackageType.ENTERPRISE,
];

// ==================== FEATURES ====================
export const PACKAGE_FEATURES: Record<PackageType, PackageFeatures> = {
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

// ==================== LIMITS ====================
export const PACKAGE_LIMITS: Record<PackageType, PackageLimits> = {
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

// ==================== PRICES (cents) ====================
export const PACKAGE_PRICES: Record<PackageType, number> = {
  [PackageType.PAGE]: 900, // €9
  [PackageType.LANDING]: 1900, // €19
  [PackageType.CREATOR]: 2900, // €29
  [PackageType.BUSINESS]: 4900, // €49
  [PackageType.SHOP]: 7900, // €79
  [PackageType.PROFESSIONAL]: 12900, // €129
  [PackageType.ENTERPRISE]: 24900, // €249
};

// ==================== ADDON DEFINITIONS ====================
export interface AddonDefinition {
  name: string;
  description: string;
  price: number; // cents
  limits: Partial<PackageLimits>;
}

export const ADDON_DEFINITIONS: Record<AddonType, AddonDefinition> = {
  // Legacy (Backwards-Compat)
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
  // Neue Add-ons
  [AddonType.SHOP_MODULE]: {
    name: 'Shop Modul',
    description:
      'Produkte verkaufen mit Warenkorb und Bestellverwaltung (100 Produkte)',
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

// ==================== HELPER FUNCTIONS ====================

export function hasFeature(
  packageType: string,
  feature: keyof PackageFeatures,
): boolean {
  const pkg = packageType as PackageType;
  return PACKAGE_FEATURES[pkg]?.[feature] ?? false;
}

export function getBaseLimit(
  packageType: string,
  limit: keyof PackageLimits,
): number {
  const pkg = packageType as PackageType;
  return PACKAGE_LIMITS[pkg]?.[limit] ?? 0;
}

export function calculateTotalLimits(
  packageType: string,
  addons: AddonType[],
): PackageLimits {
  const baseLimits = {
    ...(PACKAGE_LIMITS[packageType as PackageType] ??
      PACKAGE_LIMITS[PackageType.PAGE]),
  };

  addons.forEach((addon) => {
    const addonDef = ADDON_DEFINITIONS[addon];
    if (!addonDef) return;
    const addonLimits = addonDef.limits;
    Object.entries(addonLimits).forEach(([key, value]) => {
      const limitKey = key as keyof PackageLimits;
      if (value === -1) {
        baseLimits[limitKey] = -1;
      } else if (baseLimits[limitKey] !== -1) {
        baseLimits[limitKey] += value as number;
      }
    });
  });

  return baseLimits;
}

export function isWithinLimit(
  packageType: string,
  limitKey: keyof PackageLimits,
  current: number,
): boolean {
  const limit = getBaseLimit(packageType, limitKey);
  if (limit === -1) return true;
  return current < limit;
}

export function getPackageIndex(packageType: string): number {
  return PACKAGE_ORDER.indexOf(packageType as PackageType);
}

export function canChangeTo(
  currentPackage: string,
  targetPackage: string,
): boolean {
  return currentPackage !== targetPackage;
}

export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}
