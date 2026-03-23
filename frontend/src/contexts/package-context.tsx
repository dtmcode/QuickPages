'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface PackageFeatures {
  cms: boolean;
  shop: boolean;
  email: boolean;
  analytics: boolean;
  customDomain: boolean;
  booking: boolean;
  newsletter: boolean;
  forms: boolean;
  ai: boolean;
  i18n: boolean;
  comments: boolean;
}

interface PackageLimits {
  users: number;
  posts: number;
  pages: number;
  products: number;
  emailsPerMonth: number;
  subscribers: number;
  storage: number; // in MB
}

interface PackageContextType {
  currentPackage: string;
  hasFeature: (feature: keyof PackageFeatures) => boolean;
  getLimit: (limit: keyof PackageLimits) => number;
  canUpgrade: boolean;
  packageName: string;
  isLoading: boolean;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

const PACKAGE_FEATURES: Record<string, PackageFeatures> = {
  page: {
    cms: false,
    shop: false,
    email: false,
    analytics: true,
    customDomain: false,
    booking: false,
    newsletter: false,
    forms: false,
    ai: false,
    i18n: false,
    comments: false,
  },
  creator: {
    cms: true,
    shop: false,
    email: false,
    analytics: true,
    customDomain: true,
    booking: false,   // Add-on
    newsletter: false, // Add-on
    forms: false,      // Add-on
    ai: false,
    i18n: false,
    comments: true,
  },
  business: {
    cms: true,
    shop: false,  // Add-on
    email: true,
    analytics: true,
    customDomain: true,
    booking: true,
    newsletter: true,
    forms: true,
    ai: false,    // Add-on
    i18n: false,  // Add-on
    comments: true,
  },
  shop: {
    cms: true,
    shop: true,
    email: true,
    analytics: true,
    customDomain: true,
    booking: true,
    newsletter: true,
    forms: true,
    ai: false,    // Add-on
    i18n: false,  // Add-on
    comments: true,
  },
  professional: {
    cms: true,
    shop: true,
    email: true,
    analytics: true,
    customDomain: true,
    booking: true,
    newsletter: true,
    forms: true,
    ai: true,
    i18n: true,
    comments: true,
  },
};

const PACKAGE_LIMITS: Record<string, PackageLimits> = {
  page: {
    users: 1, posts: 0, pages: 1, products: 0,
    emailsPerMonth: 0, subscribers: 0, storage: 100,
  },
  creator: {
    users: 2, posts: 50, pages: 10, products: 0,
    emailsPerMonth: 0, subscribers: 0, storage: 1024,
  },
  business: {
    users: 5, posts: 200, pages: 30, products: 0,
    emailsPerMonth: 5000, subscribers: 1000, storage: 5120,
  },
  shop: {
    users: 10, posts: 500, pages: 50, products: 200,
    emailsPerMonth: 10000, subscribers: 3000, storage: 10240,
  },
  professional: {
    users: 25, posts: 1000, pages: 100, products: 1000,
    emailsPerMonth: 50000, subscribers: 10000, storage: 25600,
  },
};

export function PackageProvider({ children }: { children: ReactNode }) {
  const { tenant, isAuthenticated } = useAuth();
  const currentPackage = tenant?.package || 'page';
  const isLoading = isAuthenticated && !tenant;

  const hasFeature = (feature: keyof PackageFeatures): boolean => {
    if (!tenant) return false;
    return PACKAGE_FEATURES[currentPackage]?.[feature] ?? false;
  };

  const getLimit = (limit: keyof PackageLimits): number => {
    if (!tenant) return 0;
    return PACKAGE_LIMITS[currentPackage]?.[limit] ?? 0;
  };

  const canUpgrade = currentPackage !== 'professional';
  const packageName = currentPackage.charAt(0).toUpperCase() + currentPackage.slice(1);

  return (
    <PackageContext.Provider
      value={{ currentPackage, hasFeature, getLimit, canUpgrade, packageName, isLoading }}
    >
      {children}
    </PackageContext.Provider>
  );
}

export function usePackage() {
  const context = useContext(PackageContext);
  if (!context) {
    throw new Error('usePackage must be used within PackageProvider');
  }
  return context;
}