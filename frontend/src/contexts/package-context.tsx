// 📂 PFAD: frontend/src/contexts/package-context.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

export type PackageCategory = 'website' | 'blog' | 'business' | 'shop' | 'members';

interface PackageFeatures {
  websiteBuilder: boolean; maxPages: number;
  blog: boolean; maxPosts: number; maxAuthors: number; comments: boolean;
  shop: boolean; maxProducts: number; digitalProducts: boolean; productVariants: boolean;
  booking: boolean; maxBookingServices: number;
  newsletter: boolean; maxSubscribers: number;
  forms: boolean; maxForms: number;
  members: boolean; maxMembers: number; courses: boolean; maxCourses: number; maxDownloads: number;
  analytics: 'basic' | 'advanced' | 'full';
  customDomain: boolean; aiContent: boolean; aiCreditsPerMonth: number; i18n: boolean;
  maxUsers: number; storageMb: number; removeBranding: boolean;
}

const SUPERADMIN_FEATURES: PackageFeatures = {
  websiteBuilder: true, maxPages: 999999,
  blog: true, maxPosts: 999999, maxAuthors: 999, comments: true,
  shop: true, maxProducts: 999999, digitalProducts: true, productVariants: true,
  booking: true, maxBookingServices: 999,
  newsletter: true, maxSubscribers: 999999,
  forms: true, maxForms: 999,
  members: true, maxMembers: 999999, courses: true, maxCourses: 999, maxDownloads: 999999,
  analytics: 'full', customDomain: true, aiContent: true, aiCreditsPerMonth: 999999, i18n: true,
  maxUsers: 999, storageMb: 999999, removeBranding: true,
};

const PACKAGE_FEATURES: Record<string, PackageFeatures> = {
  website_micro:          { websiteBuilder: true, maxPages: 3, blog: false, maxPosts: 0, maxAuthors: 0, comments: false, shop: false, maxProducts: 0, digitalProducts: false, productVariants: false, booking: false, maxBookingServices: 0, newsletter: false, maxSubscribers: 0, forms: true, maxForms: 1, members: false, maxMembers: 0, courses: false, maxCourses: 0, maxDownloads: 0, analytics: 'basic', customDomain: false, aiContent: false, aiCreditsPerMonth: 0, i18n: false, maxUsers: 1, storageMb: 500, removeBranding: false },
  website_standard:       { websiteBuilder: true, maxPages: 10, blog: false, maxPosts: 0, maxAuthors: 0, comments: false, shop: false, maxProducts: 0, digitalProducts: false, productVariants: false, booking: false, maxBookingServices: 0, newsletter: false, maxSubscribers: 0, forms: true, maxForms: 3, members: false, maxMembers: 0, courses: false, maxCourses: 0, maxDownloads: 0, analytics: 'advanced', customDomain: true, aiContent: false, aiCreditsPerMonth: 0, i18n: false, maxUsers: 2, storageMb: 2000, removeBranding: true },
  website_pro:            { websiteBuilder: true, maxPages: 30, blog: false, maxPosts: 0, maxAuthors: 0, comments: false, shop: false, maxProducts: 0, digitalProducts: false, productVariants: false, booking: false, maxBookingServices: 0, newsletter: false, maxSubscribers: 0, forms: true, maxForms: 10, members: false, maxMembers: 0, courses: false, maxCourses: 0, maxDownloads: 0, analytics: 'full', customDomain: true, aiContent: false, aiCreditsPerMonth: 0, i18n: false, maxUsers: 3, storageMb: 10000, removeBranding: true },
  blog_personal:          { websiteBuilder: true, maxPages: 10, blog: true, maxPosts: 100, maxAuthors: 1, comments: true, shop: false, maxProducts: 0, digitalProducts: false, productVariants: false, booking: false, maxBookingServices: 0, newsletter: false, maxSubscribers: 0, forms: true, maxForms: 2, members: false, maxMembers: 0, courses: false, maxCourses: 0, maxDownloads: 0, analytics: 'advanced', customDomain: true, aiContent: false, aiCreditsPerMonth: 0, i18n: false, maxUsers: 1, storageMb: 3000, removeBranding: true },
  blog_publisher:         { websiteBuilder: true, maxPages: 20, blog: true, maxPosts: 500, maxAuthors: 3, comments: true, shop: false, maxProducts: 0, digitalProducts: false, productVariants: false, booking: false, maxBookingServices: 0, newsletter: true, maxSubscribers: 500, forms: true, maxForms: 5, members: false, maxMembers: 0, courses: false, maxCourses: 0, maxDownloads: 0, analytics: 'full', customDomain: true, aiContent: false, aiCreditsPerMonth: 0, i18n: false, maxUsers: 3, storageMb: 10000, removeBranding: true },
  blog_magazine:          { websiteBuilder: true, maxPages: 50, blog: true, maxPosts: 2000, maxAuthors: 10, comments: true, shop: false, maxProducts: 0, digitalProducts: false, productVariants: false, booking: false, maxBookingServices: 0, newsletter: true, maxSubscribers: 5000, forms: true, maxForms: 15, members: false, maxMembers: 0, courses: false, maxCourses: 0, maxDownloads: 0, analytics: 'full', customDomain: true, aiContent: true, aiCreditsPerMonth: 100, i18n: true, maxUsers: 10, storageMb: 50000, removeBranding: true },
  business_starter:       { websiteBuilder: true, maxPages: 15, blog: false, maxPosts: 0, maxAuthors: 0, comments: false, shop: false, maxProducts: 0, digitalProducts: false, productVariants: false, booking: true, maxBookingServices: 3, newsletter: true, maxSubscribers: 500, forms: true, maxForms: 5, members: false, maxMembers: 0, courses: false, maxCourses: 0, maxDownloads: 0, analytics: 'advanced', customDomain: true, aiContent: false, aiCreditsPerMonth: 0, i18n: false, maxUsers: 3, storageMb: 5000, removeBranding: true },
  business_professional:  { websiteBuilder: true, maxPages: 50, blog: true, maxPosts: 200, maxAuthors: 3, comments: true, shop: false, maxProducts: 0, digitalProducts: false, productVariants: false, booking: true, maxBookingServices: 10, newsletter: true, maxSubscribers: 5000, forms: true, maxForms: 20, members: false, maxMembers: 0, courses: false, maxCourses: 0, maxDownloads: 0, analytics: 'full', customDomain: true, aiContent: true, aiCreditsPerMonth: 100, i18n: false, maxUsers: 5, storageMb: 20000, removeBranding: true },
  business_agency:        { websiteBuilder: true, maxPages: 150, blog: true, maxPosts: 1000, maxAuthors: 10, comments: true, shop: false, maxProducts: 0, digitalProducts: false, productVariants: false, booking: true, maxBookingServices: 30, newsletter: true, maxSubscribers: 20000, forms: true, maxForms: 50, members: false, maxMembers: 0, courses: false, maxCourses: 0, maxDownloads: 0, analytics: 'full', customDomain: true, aiContent: true, aiCreditsPerMonth: 500, i18n: true, maxUsers: 15, storageMb: 100000, removeBranding: true },
  shop_mini:              { websiteBuilder: true, maxPages: 20, blog: false, maxPosts: 0, maxAuthors: 0, comments: false, shop: true, maxProducts: 100, digitalProducts: false, productVariants: false, booking: false, maxBookingServices: 0, newsletter: true, maxSubscribers: 500, forms: true, maxForms: 3, members: false, maxMembers: 0, courses: false, maxCourses: 0, maxDownloads: 0, analytics: 'advanced', customDomain: true, aiContent: false, aiCreditsPerMonth: 0, i18n: false, maxUsers: 2, storageMb: 10000, removeBranding: true },
  shop_wachstum:          { websiteBuilder: true, maxPages: 50, blog: true, maxPosts: 100, maxAuthors: 2, comments: false, shop: true, maxProducts: 500, digitalProducts: true, productVariants: true, booking: false, maxBookingServices: 0, newsletter: true, maxSubscribers: 3000, forms: true, maxForms: 10, members: false, maxMembers: 0, courses: false, maxCourses: 0, maxDownloads: 0, analytics: 'full', customDomain: true, aiContent: false, aiCreditsPerMonth: 0, i18n: false, maxUsers: 5, storageMb: 30000, removeBranding: true },
  shop_premium:           { websiteBuilder: true, maxPages: 100, blog: true, maxPosts: 500, maxAuthors: 5, comments: true, shop: true, maxProducts: 2000, digitalProducts: true, productVariants: true, booking: false, maxBookingServices: 0, newsletter: true, maxSubscribers: 10000, forms: true, maxForms: 20, members: false, maxMembers: 0, courses: false, maxCourses: 0, maxDownloads: 0, analytics: 'full', customDomain: true, aiContent: true, aiCreditsPerMonth: 200, i18n: true, maxUsers: 10, storageMb: 100000, removeBranding: true },
  members_community:      { websiteBuilder: true, maxPages: 20, blog: false, maxPosts: 0, maxAuthors: 0, comments: false, shop: false, maxProducts: 0, digitalProducts: false, productVariants: false, booking: false, maxBookingServices: 0, newsletter: false, maxSubscribers: 0, forms: true, maxForms: 3, members: true, maxMembers: 100, courses: false, maxCourses: 0, maxDownloads: 10, analytics: 'advanced', customDomain: true, aiContent: false, aiCreditsPerMonth: 0, i18n: false, maxUsers: 2, storageMb: 5000, removeBranding: true },
  members_kurse:          { websiteBuilder: true, maxPages: 50, blog: true, maxPosts: 50, maxAuthors: 1, comments: false, shop: false, maxProducts: 0, digitalProducts: false, productVariants: false, booking: false, maxBookingServices: 0, newsletter: true, maxSubscribers: 500, forms: true, maxForms: 10, members: true, maxMembers: 500, courses: true, maxCourses: 5, maxDownloads: 100, analytics: 'full', customDomain: true, aiContent: false, aiCreditsPerMonth: 0, i18n: false, maxUsers: 3, storageMb: 30000, removeBranding: true },
  members_academy:        { websiteBuilder: true, maxPages: 100, blog: true, maxPosts: 200, maxAuthors: 5, comments: true, shop: false, maxProducts: 0, digitalProducts: false, productVariants: false, booking: true, maxBookingServices: 5, newsletter: true, maxSubscribers: 5000, forms: true, maxForms: 20, members: true, maxMembers: 2000, courses: true, maxCourses: 30, maxDownloads: 500, analytics: 'full', customDomain: true, aiContent: true, aiCreditsPerMonth: 100, i18n: false, maxUsers: 10, storageMb: 100000, removeBranding: true },
  // Legacy
  page:         { websiteBuilder: true, maxPages: 3, blog: false, maxPosts: 0, maxAuthors: 0, comments: false, shop: false, maxProducts: 0, digitalProducts: false, productVariants: false, booking: false, maxBookingServices: 0, newsletter: false, maxSubscribers: 0, forms: true, maxForms: 1, members: false, maxMembers: 0, courses: false, maxCourses: 0, maxDownloads: 0, analytics: 'basic', customDomain: false, aiContent: false, aiCreditsPerMonth: 0, i18n: false, maxUsers: 1, storageMb: 500, removeBranding: false },
  starter:      { websiteBuilder: true, maxPages: 10, blog: true, maxPosts: 50, maxAuthors: 1, comments: false, shop: false, maxProducts: 0, digitalProducts: false, productVariants: false, booking: false, maxBookingServices: 0, newsletter: false, maxSubscribers: 0, forms: true, maxForms: 3, members: false, maxMembers: 0, courses: false, maxCourses: 0, maxDownloads: 0, analytics: 'basic', customDomain: false, aiContent: false, aiCreditsPerMonth: 0, i18n: false, maxUsers: 1, storageMb: 1000, removeBranding: false },
  creator:      { websiteBuilder: true, maxPages: 10, blog: true, maxPosts: 50, maxAuthors: 2, comments: true, shop: false, maxProducts: 0, digitalProducts: false, productVariants: false, booking: false, maxBookingServices: 0, newsletter: false, maxSubscribers: 0, forms: true, maxForms: 3, members: false, maxMembers: 0, courses: false, maxCourses: 0, maxDownloads: 0, analytics: 'advanced', customDomain: true, aiContent: false, aiCreditsPerMonth: 0, i18n: false, maxUsers: 2, storageMb: 2000, removeBranding: true },
  business:     { websiteBuilder: true, maxPages: 30, blog: true, maxPosts: 200, maxAuthors: 5, comments: true, shop: false, maxProducts: 0, digitalProducts: false, productVariants: false, booking: true, maxBookingServices: 5, newsletter: true, maxSubscribers: 1000, forms: true, maxForms: 10, members: false, maxMembers: 0, courses: false, maxCourses: 0, maxDownloads: 0, analytics: 'full', customDomain: true, aiContent: false, aiCreditsPerMonth: 0, i18n: false, maxUsers: 5, storageMb: 5000, removeBranding: true },
  professional: { websiteBuilder: true, maxPages: 100, blog: true, maxPosts: 1000, maxAuthors: 10, comments: true, shop: true, maxProducts: 1000, digitalProducts: true, productVariants: true, booking: true, maxBookingServices: 20, newsletter: true, maxSubscribers: 10000, forms: true, maxForms: 30, members: true, maxMembers: 500, courses: true, maxCourses: 10, maxDownloads: 200, analytics: 'full', customDomain: true, aiContent: true, aiCreditsPerMonth: 200, i18n: true, maxUsers: 15, storageMb: 30000, removeBranding: true },
  enterprise:   { ...SUPERADMIN_FEATURES },
};

const SUPERADMIN_SLUGS = ['myquickpages', 'platform-admin'];

function checkIsSuperAdmin(tenant: any): boolean {
  if (!tenant) return false;
  if (SUPERADMIN_SLUGS.includes(tenant.slug)) return true;
  if (tenant.settings?.isSuperAdmin === true) return true;
  if (tenant.settings?.platformAdmin === true) return true;
  return false;
}

function getCategory(pkg: string): PackageCategory | null {
  if (pkg.startsWith('website_')) return 'website';
  if (pkg.startsWith('blog_')) return 'blog';
  if (pkg.startsWith('business_')) return 'business';
  if (pkg.startsWith('shop_')) return 'shop';
  if (pkg.startsWith('members_')) return 'members';
  return null;
}

const PKG_NAMES: Record<string, string> = {
  website_micro: 'Website Micro', website_standard: 'Website Standard', website_pro: 'Website Pro',
  blog_personal: 'Blog Personal', blog_publisher: 'Blog Publisher', blog_magazine: 'Blog Magazine',
  business_starter: 'Business Starter', business_professional: 'Business Professional', business_agency: 'Business Agency',
  shop_mini: 'Shop Mini', shop_wachstum: 'Shop Wachstum', shop_premium: 'Shop Premium',
  members_community: 'Members Community', members_kurse: 'Members Kurse', members_academy: 'Members Academy',
  enterprise: 'Enterprise', professional: 'Professional', business: 'Business',
  creator: 'Creator', starter: 'Starter', page: 'Page',
};

interface PackageContextValue {
  currentPackage: string;
  packageCategory: PackageCategory | null;
  packageName: string;
  features: PackageFeatures;
  isSuperAdmin: boolean;
  hasFeature: (f: keyof PackageFeatures) => boolean;
  getLimit: (l: keyof PackageFeatures) => number;
  canUse: (f: keyof PackageFeatures) => boolean;
  // Legacy
  hasFeatureLegacy: (f: string) => boolean;
}

const PackageContext = createContext<PackageContextValue>({
  currentPackage: 'website_micro', packageCategory: 'website',
  packageName: 'Website Micro', features: PACKAGE_FEATURES['website_micro'],
  isSuperAdmin: false,
  hasFeature: () => false, getLimit: () => 0, canUse: () => false, hasFeatureLegacy: () => false,
});

export function PackageProvider({ children }: { children: ReactNode }) {
  const { tenant } = useAuth();
  const superAdmin = checkIsSuperAdmin(tenant);
  const currentPackage = (tenant?.package as string) || 'website_micro';
  const features = superAdmin ? SUPERADMIN_FEATURES : (PACKAGE_FEATURES[currentPackage] || PACKAGE_FEATURES['website_micro']);

  const hasFeature = (f: keyof PackageFeatures): boolean => {
    if (superAdmin) return true;
    const val = features[f];
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val > 0;
    return !!val;
  };

  const getLimit = (l: keyof PackageFeatures): number => {
    const val = features[l];
    return typeof val === 'number' ? val : 0;
  };

  const LEGACY_MAP: Record<string, keyof PackageFeatures> = {
    cms: 'blog', shop: 'shop', booking: 'booking', newsletter: 'newsletter',
    analytics: 'analytics', ai: 'aiContent', members: 'members', forms: 'forms',
    i18n: 'i18n', customDomain: 'customDomain',
  };

  const hasFeatureLegacy = (f: string): boolean => {
    if (superAdmin) return true;
    const mapped = LEGACY_MAP[f];
    return mapped ? hasFeature(mapped) : false;
  };

  return (
    <PackageContext.Provider value={{
      currentPackage,
      packageCategory: superAdmin ? null : getCategory(currentPackage),
      packageName: superAdmin ? '⭐ Platform Admin' : (PKG_NAMES[currentPackage] || currentPackage),
      features,
      isSuperAdmin: superAdmin,
      hasFeature,
      getLimit,
      canUse: hasFeature,
      hasFeatureLegacy,
    }}>
      {children}
    </PackageContext.Provider>
  );
}

export function usePackage() {
  return useContext(PackageContext);
}