// 📂 PFAD: backend/src/modules/package/package.helper.ts

// ==================== PACKAGE CATEGORIES ====================
// 5 Kategorien, je 3 Stufen = 15 Pakete total
// Jedes Paket enthält Website Builder (One-Page + Multi-Page)
// One-Page vs Multi-Page ist eine Wizard-Entscheidung, kein Paket-Merkmal

export type PackageType =
  // Website (nur Builder)
  | 'website_micro'
  | 'website_standard'
  | 'website_pro'
  // Blog (Builder + CMS)
  | 'blog_personal'
  | 'blog_publisher'
  | 'blog_magazine'
  // Business (Builder + Booking + Forms + Newsletter)
  | 'business_starter'
  | 'business_professional'
  | 'business_agency'
  // Shop (Builder + Shop + Newsletter + Blog)
  | 'shop_mini'
  | 'shop_wachstum'
  | 'shop_premium'
  // Members (Builder + Members + Courses)
  | 'members_community'
  | 'members_kurse'
  | 'members_academy'
  // Restaurant
  | 'restaurant_starter'
  | 'restaurant_pro'
  | 'restaurant_premium'
  // Lokaler Händler
  | 'local_starter'
  | 'local_pro'
  | 'local_premium'
  // Funnels
  | 'funnels_starter'
  | 'funnels_pro'
  | 'funnels_premium';

export type AddonType =
  | 'shop_module' // Shop für Website/Blog/Business Pakete
  | 'shop_extra' // +500 Produkte (nur wenn shop_module aktiv)
  | 'booking_module' // Booking für alle ohne Booking
  | 'blog_module' // Blog für Website/Shop/Members
  | 'newsletter_extra' // +1.000 Abonnenten
  | 'members_module' // Mitglieder für alle anderen
  | 'ai_content' // AI Credits
  | 'extra_pages' // +10 Seiten
  | 'extra_users' // +1 Benutzer
  | 'i18n' // Mehrsprachigkeit
  | 'custom_domain' // Custom Domain
  | 'restaurant_module' // NEU
  | 'local_store_module' // NEU
  | 'funnels_module'; // NEU

// ==================== FEATURES ====================

export interface PackageFeatures {
  // Website Builder
  websiteBuilder: boolean;
  maxPages: number; // -1 = im höchsten Tier sehr hoch

  // Blog / CMS
  blog: boolean;
  maxPosts: number;
  maxAuthors: number;
  comments: boolean;

  // Shop
  shop: boolean;
  maxProducts: number;
  digitalProducts: boolean;
  productVariants: boolean;

  // Booking
  booking: boolean;
  maxBookingServices: number;

  // Newsletter
  newsletter: boolean;
  maxSubscribers: number;

  // Forms
  forms: boolean;
  maxForms: number;

  // Members / Courses
  members: boolean;
  maxMembers: number;
  courses: boolean;
  maxCourses: number;
  maxDownloads: number;

  // Platform
  analytics: 'basic' | 'advanced' | 'full';
  customDomain: boolean;
  aiContent: boolean;
  aiCreditsPerMonth: number;
  i18n: boolean;
  maxUsers: number;
  storageMb: number;
  removeBranding: boolean;

  restaurant: boolean;
  localStore: boolean;
  funnels: boolean;
  maxFunnels: number;
  coupons: boolean;
}

// ==================== PACKAGE DEFINITION ====================

export interface PackageDefinition {
  type: PackageType;
  category: 'website' | 'blog' | 'business' | 'shop' | 'members' | 'restaurant' | 'local' | 'funnels';
  tier: 1 | 2 | 3;
  name: string;
  tagline: string;
  description: string;
  priceMonthly: number; // in cents
  features: PackageFeatures;
  highlightFeatures: string[]; // für die Pakete-Karte
}

// ==================== PACKAGE DATA ====================

export const PACKAGES: Record<PackageType, PackageDefinition> = {
  // ======================== WEBSITE ========================
  // Nur Builder — für Visitenkarten, Portfolios, kleine Präsenzen
  // Kein Blog, kein Shop, keine Buchung nötig

  website_micro: {
    type: 'website_micro',
    category: 'website',
    tier: 1,
    name: 'Micro',
    tagline: 'Einfach online sein',
    description:
      'Deine digitale Visitenkarte. Schnell, einfach, professionell.',
    priceMonthly: 900, // €9
    features: {
      websiteBuilder: true,
      maxPages: 3,
      blog: false,
      maxPosts: 0,
      maxAuthors: 0,
      comments: false,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: false,
      maxBookingServices: 0,
      newsletter: false,
      maxSubscribers: 0,
      forms: true,
      maxForms: 1,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'basic',
      customDomain: false,
      aiContent: false,
      aiCreditsPerMonth: 0,
      i18n: false,
      maxUsers: 1,
      storageMb: 500,
      removeBranding: false,
      restaurant: false,
      localStore: false,
      funnels: false,
      maxFunnels: 0,
      coupons: false,
    },
    highlightFeatures: [
      '3 Seiten (inkl. Impressum & Datenschutz)',
      'Website Builder (One-Page oder Multi-Page)',
      '1 Kontaktformular',
      'Basis-Analytics',
      'SSL-Zertifikat',
      'QuickPages Subdomain',
    ],
  },

  website_standard: {
    type: 'website_standard',
    category: 'website',
    tier: 2,
    name: 'Standard',
    tagline: 'Professioneller Auftritt',
    description: 'Mehr Seiten, eigene Domain und erweiterte Features.',
    priceMonthly: 1900, // €19
    features: {
      websiteBuilder: true,
      maxPages: 10,
      blog: false,
      maxPosts: 0,
      maxAuthors: 0,
      comments: false,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: false,
      maxBookingServices: 0,
      newsletter: false,
      maxSubscribers: 0,
      forms: true,
      maxForms: 3,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'advanced',
      customDomain: true,
      aiContent: false,
      aiCreditsPerMonth: 0,
      i18n: false,
      maxUsers: 2,
      storageMb: 2000,
      removeBranding: true,
      restaurant: false,
      localStore: false,
      funnels: false,
      maxFunnels: 0,
      coupons: false,
    },
    highlightFeatures: [
      '10 Seiten (inkl. Pflichtseiten)',
      'Eigene Domain',
      '3 Kontaktformulare',
      'Erweiterte Analytics',
      'Kein QuickPages-Branding',
      '2 GB Speicher',
    ],
  },

  website_pro: {
    type: 'website_pro',
    category: 'website',
    tier: 3,
    name: 'Pro',
    tagline: 'Alles für deine Website',
    description:
      'Maximale Flexibilität für deine professionelle Online-Präsenz.',
    priceMonthly: 2900, // €29
    features: {
      websiteBuilder: true,
      maxPages: 30,
      blog: false,
      maxPosts: 0,
      maxAuthors: 0,
      comments: false,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: false,
      maxBookingServices: 0,
      newsletter: false,
      maxSubscribers: 0,
      forms: true,
      maxForms: 10,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'full',
      customDomain: true,
      aiContent: false,
      aiCreditsPerMonth: 0,
      i18n: false,
      maxUsers: 3,
      storageMb: 10000,
      removeBranding: true,
      restaurant: false,
      localStore: false,
      funnels: false,
      maxFunnels: 0,
      coupons: false,
    },
    highlightFeatures: [
      '30 Seiten',
      'Eigene Domain',
      '10 Formulare',
      'Volle Analytics',
      '10 GB Speicher',
      '3 Team-Mitglieder',
    ],
  },

  // ======================== BLOG ========================
  // Builder + CMS — für Blogger, Creator, Journalisten

  blog_personal: {
    type: 'blog_personal',
    category: 'blog',
    tier: 1,
    name: 'Personal',
    tagline: 'Deine Stimme im Web',
    description: 'Starte deinen Blog. Schreibe, teile, wachse.',
    priceMonthly: 1900, // €19
    features: {
      websiteBuilder: true,
      maxPages: 10,
      blog: true,
      maxPosts: 100,
      maxAuthors: 1,
      comments: true,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: false,
      maxBookingServices: 0,
      newsletter: false,
      maxSubscribers: 0,
      forms: true,
      maxForms: 2,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'advanced',
      customDomain: true,
      aiContent: false,
      aiCreditsPerMonth: 0,
      i18n: false,
      maxUsers: 1,
      storageMb: 3000,
      removeBranding: true,
      restaurant: false,
      localStore: false,
      funnels: false,
      maxFunnels: 0,
      coupons: false,
    },
    highlightFeatures: [
      '100 Blog-Beiträge',
      'Blog-Kommentare',
      '10 Seiten',
      'Eigene Domain',
      'Erweiterte Analytics',
      '3 GB Speicher',
    ],
  },

  blog_publisher: {
    type: 'blog_publisher',
    category: 'blog',
    tier: 2,
    name: 'Publisher',
    tagline: 'Professionell publizieren',
    description: 'Mehr Inhalte, Newsletter und Team-Autoren.',
    priceMonthly: 3900, // €39
    features: {
      websiteBuilder: true,
      maxPages: 20,
      blog: true,
      maxPosts: 500,
      maxAuthors: 3,
      comments: true,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: false,
      maxBookingServices: 0,
      newsletter: true,
      maxSubscribers: 500,
      forms: true,
      maxForms: 5,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'full',
      customDomain: true,
      aiContent: false,
      aiCreditsPerMonth: 0,
      i18n: false,
      maxUsers: 3,
      storageMb: 10000,
      removeBranding: true,
      restaurant: false,
      localStore: false,
      funnels: false,
      maxFunnels: 0,
      coupons: false,
    },
    highlightFeatures: [
      '500 Blog-Beiträge',
      '3 Autoren',
      'Newsletter (500 Abonnenten)',
      '20 Seiten',
      'Volle Analytics',
      '10 GB Speicher',
    ],
  },

  blog_magazine: {
    type: 'blog_magazine',
    category: 'blog',
    tier: 3,
    name: 'Magazine',
    tagline: 'Dein Online-Magazin',
    description: 'Für Redaktionen, Magazine und professionelle Publisher.',
    priceMonthly: 7900, // €79
    features: {
      websiteBuilder: true,
      maxPages: 50,
      blog: true,
      maxPosts: 2000,
      maxAuthors: 10,
      comments: true,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: false,
      maxBookingServices: 0,
      newsletter: true,
      maxSubscribers: 5000,
      forms: true,
      maxForms: 15,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'full',
      customDomain: true,
      aiContent: true,
      aiCreditsPerMonth: 100,
      i18n: true,
      maxUsers: 10,
      storageMb: 50000,
      removeBranding: true,
      restaurant: false,
      localStore: false,
      funnels: false,
      maxFunnels: 0,
      coupons: false,
    },
    highlightFeatures: [
      '2.000 Blog-Beiträge',
      '10 Autoren',
      'Newsletter (5.000 Abonnenten)',
      'AI Content (100 Credits/Monat)',
      'Mehrsprachigkeit',
      '50 GB Speicher',
    ],
  },

  // ======================== BUSINESS ========================
  // Builder + Booking + Forms + Newsletter
  // Für: Friseur, Arzt, Coach, Berater, Handwerker, Restaurant

  business_starter: {
    type: 'business_starter',
    category: 'business',
    tier: 1,
    name: 'Starter',
    tagline: 'Dein Business online',
    description:
      'Terminbuchung, Kontaktformulare und Newsletter für lokale Unternehmen.',
    priceMonthly: 2900, // €29
    features: {
      websiteBuilder: true,
      maxPages: 15,
      blog: false,
      maxPosts: 0,
      maxAuthors: 0,
      comments: false,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: true,
      maxBookingServices: 3,
      newsletter: true,
      maxSubscribers: 500,
      forms: true,
      maxForms: 5,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'advanced',
      customDomain: true,
      aiContent: false,
      aiCreditsPerMonth: 0,
      i18n: false,
      maxUsers: 3,
      storageMb: 5000,
      removeBranding: true,
      restaurant: false,
      localStore: false,
      funnels: false,
      maxFunnels: 0,
      coupons: false,
    },
    highlightFeatures: [
      '15 Seiten',
      'Online-Terminbuchung (3 Services)',
      'Newsletter (500 Abonnenten)',
      '5 Formulare',
      'Eigene Domain',
      '5 GB Speicher',
    ],
  },

  business_professional: {
    type: 'business_professional',
    category: 'business',
    tier: 2,
    name: 'Professional',
    tagline: 'Mehr Power für dein Business',
    description: 'Blog, mehr Termine, mehr Abonnenten und AI-Unterstützung.',
    priceMonthly: 5900, // €59
    features: {
      websiteBuilder: true,
      maxPages: 50,
      blog: true,
      maxPosts: 200,
      maxAuthors: 3,
      comments: true,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: true,
      maxBookingServices: 10,
      newsletter: true,
      maxSubscribers: 5000,
      forms: true,
      maxForms: 20,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'full',
      customDomain: true,
      aiContent: true,
      aiCreditsPerMonth: 100,
      i18n: false,
      maxUsers: 5,
      storageMb: 20000,
      removeBranding: true,
      restaurant: false,
      localStore: false,
      funnels: true, // ← professional hat Funnels inklusive
      maxFunnels: 5,
      coupons: false,
    },
    highlightFeatures: [
      '50 Seiten',
      'Terminbuchung (10 Services)',
      'Blog (200 Beiträge)',
      'Newsletter (5.000 Abonnenten)',
      'AI Content (100 Credits/Monat)',
      '20 GB Speicher',
    ],
  },

  business_agency: {
    type: 'business_agency',
    category: 'business',
    tier: 3,
    name: 'Agency',
    tagline: 'Für Agenturen und große Teams',
    description: 'Verwalte mehrere Standorte oder Kunden-Websites.',
    priceMonthly: 9900, // €99
    features: {
      websiteBuilder: true,
      maxPages: 150,
      blog: true,
      maxPosts: 1000,
      maxAuthors: 10,
      comments: true,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: true,
      maxBookingServices: 30,
      newsletter: true,
      maxSubscribers: 20000,
      forms: true,
      maxForms: 50,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'full',
      customDomain: true,
      aiContent: true,
      aiCreditsPerMonth: 500,
      i18n: true,
      maxUsers: 15,
      storageMb: 100000,
      removeBranding: true,
      restaurant: false,
      localStore: false,
      funnels: true, // ← agency auch
      maxFunnels: 20,
      coupons: false,
    },
    highlightFeatures: [
      '150 Seiten',
      'Terminbuchung (30 Services)',
      'Newsletter (20.000 Abonnenten)',
      'AI Content (500 Credits/Monat)',
      'Mehrsprachigkeit',
      '100 GB Speicher',
    ],
  },

  // ======================== SHOP ========================
  // Builder + Shop + Newsletter + Blog
  // Für: Online-Händler, Handmade, digitale Produkte

  shop_mini: {
    type: 'shop_mini',
    category: 'shop',
    tier: 1,
    name: 'Mini',
    tagline: 'Dein erster Online-Shop',
    description: 'Starte deinen Shop und verkaufe deine ersten Produkte.',
    priceMonthly: 3900, // €39
    features: {
      websiteBuilder: true,
      maxPages: 20,
      blog: false,
      maxPosts: 0,
      maxAuthors: 0,
      comments: false,
      shop: true,
      maxProducts: 100,
      digitalProducts: false,
      productVariants: false,
      booking: false,
      maxBookingServices: 0,
      newsletter: true,
      maxSubscribers: 500,
      forms: true,
      maxForms: 3,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'advanced',
      customDomain: true,
      aiContent: false,
      aiCreditsPerMonth: 0,
      i18n: false,
      maxUsers: 2,
      storageMb: 10000,
      removeBranding: true,
      restaurant: false,
      localStore: false,
      funnels: false,
      maxFunnels: 0,
      coupons: true,
    },
    highlightFeatures: [
      '100 Produkte',
      'Stripe-Zahlungen',
      'Bestellverwaltung',
      'Newsletter (500 Abonnenten)',
      '20 Seiten',
      '10 GB Speicher',
    ],
  },

  shop_wachstum: {
    type: 'shop_wachstum',
    category: 'shop',
    tier: 2,
    name: 'Wachstum',
    tagline: 'Dein Shop skaliert',
    description: 'Mehr Produkte, Varianten, digitale Downloads und Blog.',
    priceMonthly: 6900, // €69
    features: {
      websiteBuilder: true,
      maxPages: 50,
      blog: true,
      maxPosts: 100,
      maxAuthors: 2,
      comments: false,
      shop: true,
      maxProducts: 500,
      digitalProducts: true,
      productVariants: true,
      booking: false,
      maxBookingServices: 0,
      newsletter: true,
      maxSubscribers: 3000,
      forms: true,
      maxForms: 10,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'full',
      customDomain: true,
      aiContent: false,
      aiCreditsPerMonth: 0,
      i18n: false,
      maxUsers: 5,
      storageMb: 30000,
      removeBranding: true,
      restaurant: false,
      localStore: false,
      funnels: false,
      maxFunnels: 0,
      coupons: true,
    },
    highlightFeatures: [
      '500 Produkte',
      'Produktvarianten & digitale Downloads',
      'Blog (100 Beiträge)',
      'Newsletter (3.000 Abonnenten)',
      '50 Seiten',
      '30 GB Speicher',
    ],
  },

  shop_premium: {
    type: 'shop_premium',
    category: 'shop',
    tier: 3,
    name: 'Premium',
    tagline: 'Der professionelle Shop',
    description: 'Für etablierte Shops mit hohem Volumen und AI-Unterstützung.',
    priceMonthly: 11900, // €119
    features: {
      websiteBuilder: true,
      maxPages: 100,
      blog: true,
      maxPosts: 500,
      maxAuthors: 5,
      comments: true,
      shop: true,
      maxProducts: 2000,
      digitalProducts: true,
      productVariants: true,
      booking: false,
      maxBookingServices: 0,
      newsletter: true,
      maxSubscribers: 10000,
      forms: true,
      maxForms: 20,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'full',
      customDomain: true,
      aiContent: true,
      aiCreditsPerMonth: 200,
      i18n: true,
      maxUsers: 10,
      storageMb: 100000,
      removeBranding: true,
      restaurant: false,
      localStore: false,
      funnels: false,
      maxFunnels: 0,
      coupons: true,
    },
    highlightFeatures: [
      '2.000 Produkte',
      'Varianten + digitale Produkte',
      'Newsletter (10.000 Abonnenten)',
      'AI Content (200 Credits/Monat)',
      'Mehrsprachigkeit',
      '100 GB Speicher',
    ],
  },

  // ======================== MEMBERS ========================
  // Builder + Members + Courses
  // Für: Online-Kurse, Communities, Premium-Content

  members_community: {
    type: 'members_community',
    category: 'members',
    tier: 1,
    name: 'Community',
    tagline: 'Deine geschlossene Gruppe',
    description:
      'Baue eine Community mit geschützten Inhalten und Mitgliederbereichen.',
    priceMonthly: 2900, // €29
    features: {
      websiteBuilder: true,
      maxPages: 20,
      blog: false,
      maxPosts: 0,
      maxAuthors: 0,
      comments: false,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: false,
      maxBookingServices: 0,
      newsletter: false,
      maxSubscribers: 0,
      forms: true,
      maxForms: 3,
      members: true,
      maxMembers: 100,
      courses: false,
      maxCourses: 0,
      maxDownloads: 10,
      analytics: 'advanced',
      customDomain: true,
      aiContent: false,
      aiCreditsPerMonth: 0,
      i18n: false,
      maxUsers: 2,
      storageMb: 5000,
      removeBranding: true,
      restaurant: false,
      localStore: false,
      funnels: false,
      maxFunnels: 0,
      coupons: false,
    },
    highlightFeatures: [
      '100 Mitglieder',
      'Geschützter Bereich',
      '10 Download-Dateien',
      '20 Seiten',
      'Eigene Domain',
      '5 GB Speicher',
    ],
  },

  members_kurse: {
    type: 'members_kurse',
    category: 'members',
    tier: 2,
    name: 'Kurse',
    tagline: 'Deine Online-Akademie',
    description:
      'Erstelle und verkaufe Online-Kurse mit strukturierten Inhalten.',
    priceMonthly: 5900, // €59
    features: {
      websiteBuilder: true,
      maxPages: 50,
      blog: true,
      maxPosts: 50,
      maxAuthors: 1,
      comments: false,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: false,
      maxBookingServices: 0,
      newsletter: true,
      maxSubscribers: 500,
      forms: true,
      maxForms: 10,
      members: true,
      maxMembers: 500,
      courses: true,
      maxCourses: 5,
      maxDownloads: 100,
      analytics: 'full',
      customDomain: true,
      aiContent: false,
      aiCreditsPerMonth: 0,
      i18n: false,
      maxUsers: 3,
      storageMb: 30000,
      removeBranding: true,
      restaurant: false,
      localStore: false,
      funnels: false,
      maxFunnels: 0,
      coupons: false,
    },
    highlightFeatures: [
      '500 Mitglieder',
      '5 Online-Kurse',
      '100 Download-Dateien',
      'Newsletter (500 Abonnenten)',
      '50 Seiten',
      '30 GB Speicher',
    ],
  },

  members_academy: {
    type: 'members_academy',
    category: 'members',
    tier: 3,
    name: 'Academy',
    tagline: 'Deine vollständige Lernplattform',
    description:
      'Für professionelle Trainer und Bildungsanbieter mit vollem Funktionsumfang.',
    priceMonthly: 9900, // €99
    features: {
      websiteBuilder: true,
      maxPages: 100,
      blog: true,
      maxPosts: 200,
      maxAuthors: 5,
      comments: true,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: true,
      maxBookingServices: 5,
      newsletter: true,
      maxSubscribers: 5000,
      forms: true,
      maxForms: 20,
      members: true,
      maxMembers: 2000,
      courses: true,
      maxCourses: 30,
      maxDownloads: 500,
      analytics: 'full',
      customDomain: true,
      aiContent: true,
      aiCreditsPerMonth: 100,
      i18n: false,
      maxUsers: 10,
      storageMb: 100000,
      removeBranding: true,
      restaurant: false,
      localStore: false,
      funnels: false,
      maxFunnels: 0,
      coupons: false,
    },
    highlightFeatures: [
      '2.000 Mitglieder',
      '30 Online-Kurse',
      '500 Download-Dateien',
      'Terminbuchung (5 Services)',
      'AI Content (100 Credits/Monat)',
      '100 GB Speicher',
    ],
  },
  restaurant_starter: {
    type: 'restaurant_starter',
    category: 'restaurant',
    tier: 1,
    name: 'Starter',
    tagline: 'Dein Restaurant online',
    description:
      'Speisekarte, Tischbestellungen und Reservierungen für Einsteiger.',
    priceMonthly: 2900,
    features: {
      websiteBuilder: true,
      maxPages: 10,
      blog: false,
      maxPosts: 0,
      maxAuthors: 0,
      comments: false,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: true,
      maxBookingServices: 3,
      newsletter: true,
      maxSubscribers: 500,
      forms: true,
      maxForms: 3,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'advanced',
      customDomain: true,
      aiContent: false,
      aiCreditsPerMonth: 0,
      i18n: false,
      maxUsers: 2,
      storageMb: 5000,
      removeBranding: true,
      restaurant: true,
      localStore: false,
      funnels: false,
      maxFunnels: 0,
      coupons: true,
    },
    highlightFeatures: [
      'Digitale Speisekarte',
      'Tischbestellungen',
      'Reservierungen (3 Services)',
      'Newsletter (500 Abonnenten)',
      '10 Seiten',
      'Eigene Domain',
    ],
  },

  restaurant_pro: {
    type: 'restaurant_pro',
    category: 'restaurant',
    tier: 2,
    name: 'Pro',
    tagline: 'Mehr Bestellungen, mehr Umsatz',
    description: 'Lieferung, Abholung, Gutscheine und Online-Zahlung.',
    priceMonthly: 5900,
    features: {
      websiteBuilder: true,
      maxPages: 30,
      blog: false,
      maxPosts: 0,
      maxAuthors: 0,
      comments: false,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: true,
      maxBookingServices: 10,
      newsletter: true,
      maxSubscribers: 2000,
      forms: true,
      maxForms: 10,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'full',
      customDomain: true,
      aiContent: false,
      aiCreditsPerMonth: 0,
      i18n: false,
      maxUsers: 5,
      storageMb: 20000,
      removeBranding: true,
      restaurant: true,
      localStore: false,
      funnels: false,
      maxFunnels: 0,
      coupons: true,
    },
    highlightFeatures: [
      'Lieferung & Abholung',
      'Online-Zahlung (Stripe)',
      'Gutscheine & Rabatte',
      'Newsletter (2.000 Abonnenten)',
      '30 Seiten',
      '5 Team-Mitglieder',
    ],
  },

  restaurant_premium: {
    type: 'restaurant_premium',
    category: 'restaurant',
    tier: 3,
    name: 'Premium',
    tagline: 'Für Ketten und Gastro-Profis',
    description:
      'Mehrere Standorte, AI-Content, Mehrsprachigkeit und volle Analytics.',
    priceMonthly: 9900,
    features: {
      websiteBuilder: true,
      maxPages: 80,
      blog: true,
      maxPosts: 100,
      maxAuthors: 3,
      comments: false,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: true,
      maxBookingServices: 30,
      newsletter: true,
      maxSubscribers: 10000,
      forms: true,
      maxForms: 20,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'full',
      customDomain: true,
      aiContent: true,
      aiCreditsPerMonth: 200,
      i18n: true,
      maxUsers: 15,
      storageMb: 50000,
      removeBranding: true,
      restaurant: true,
      localStore: false,
      funnels: false,
      maxFunnels: 0,
      coupons: true,
    },
    highlightFeatures: [
      'Mehrere Standorte',
      'AI Content (200 Credits)',
      'Mehrsprachig',
      'Newsletter (10.000 Abonnenten)',
      '80 Seiten',
      '15 Team-Mitglieder',
    ],
  },

  local_starter: {
    type: 'local_starter',
    category: 'local',
    tier: 1,
    name: 'Starter',
    tagline: 'Dein Laden online',
    description:
      'Click & Collect für Apotheken, Bäckereien und lokale Geschäfte.',
    priceMonthly: 2900,
    features: {
      websiteBuilder: true,
      maxPages: 10,
      blog: false,
      maxPosts: 0,
      maxAuthors: 0,
      comments: false,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: false,
      maxBookingServices: 0,
      newsletter: true,
      maxSubscribers: 500,
      forms: true,
      maxForms: 3,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'advanced',
      customDomain: true,
      aiContent: false,
      aiCreditsPerMonth: 0,
      i18n: false,
      maxUsers: 2,
      storageMb: 5000,
      removeBranding: true,
      restaurant: false,
      localStore: true,
      funnels: false,
      maxFunnels: 0,
      coupons: true,
    },
    highlightFeatures: [
      'Click & Collect',
      'Abholslots verwalten',
      'Lokale Produkte präsentieren',
      'Newsletter (500 Abonnenten)',
      '10 Seiten',
      'Eigene Domain',
    ],
  },

  local_pro: {
    type: 'local_pro',
    category: 'local',
    tier: 2,
    name: 'Pro',
    tagline: 'Mehr Reichweite für deinen Laden',
    description: 'Online-Zahlung, Lieferung und Aktionen für lokale Händler.',
    priceMonthly: 4900,
    features: {
      websiteBuilder: true,
      maxPages: 30,
      blog: false,
      maxPosts: 0,
      maxAuthors: 0,
      comments: false,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: false,
      maxBookingServices: 0,
      newsletter: true,
      maxSubscribers: 2000,
      forms: true,
      maxForms: 10,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'full',
      customDomain: true,
      aiContent: false,
      aiCreditsPerMonth: 0,
      i18n: false,
      maxUsers: 5,
      storageMb: 15000,
      removeBranding: true,
      restaurant: false,
      localStore: true,
      funnels: false,
      maxFunnels: 0,
      coupons: true,
    },
    highlightFeatures: [
      'Online-Zahlung (Stripe)',
      'Lieferung & Abholung',
      'Angebote & Aktionen',
      'Newsletter (2.000 Abonnenten)',
      '30 Seiten',
      '5 Team-Mitglieder',
    ],
  },

  local_premium: {
    type: 'local_premium',
    category: 'local',
    tier: 3,
    name: 'Premium',
    tagline: 'Der komplette lokale Marktplatz',
    description: 'Für Märkte, große Händler und Franchise-Konzepte.',
    priceMonthly: 7900,
    features: {
      websiteBuilder: true,
      maxPages: 60,
      blog: true,
      maxPosts: 50,
      maxAuthors: 2,
      comments: false,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: false,
      maxBookingServices: 0,
      newsletter: true,
      maxSubscribers: 10000,
      forms: true,
      maxForms: 20,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'full',
      customDomain: true,
      aiContent: true,
      aiCreditsPerMonth: 100,
      i18n: true,
      maxUsers: 10,
      storageMb: 50000,
      removeBranding: true,
      restaurant: false,
      localStore: true,
      funnels: false,
      maxFunnels: 0,
      coupons: true,
    },
    highlightFeatures: [
      'Mehrere Standorte',
      'AI Content (100 Credits)',
      'Mehrsprachig',
      'Newsletter (10.000 Abonnenten)',
      '60 Seiten',
      '10 Team-Mitglieder',
    ],
  },

  funnels_starter: {
    type: 'funnels_starter',
    category: 'funnels',
    tier: 1,
    name: 'Starter',
    tagline: 'Dein erster Funnel',
    description: 'Lead-Generierung und Opt-in Seiten für Einsteiger.',
    priceMonthly: 1900,
    features: {
      websiteBuilder: true,
      maxPages: 10,
      blog: false,
      maxPosts: 0,
      maxAuthors: 0,
      comments: false,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: false,
      maxBookingServices: 0,
      newsletter: true,
      maxSubscribers: 500,
      forms: true,
      maxForms: 5,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'advanced',
      customDomain: true,
      aiContent: false,
      aiCreditsPerMonth: 0,
      i18n: false,
      maxUsers: 1,
      storageMb: 2000,
      removeBranding: true,
      restaurant: false,
      localStore: false,
      funnels: true,
      maxFunnels: 5,
      coupons: false,
    },
    highlightFeatures: [
      '5 Funnels',
      'Opt-in & Lead-Seiten',
      'Newsletter (500 Abonnenten)',
      'Conversion-Tracking',
      '10 Seiten',
      'Eigene Domain',
    ],
  },

  funnels_pro: {
    type: 'funnels_pro',
    category: 'funnels',
    tier: 2,
    name: 'Pro',
    tagline: 'Mehr Conversions, mehr Umsatz',
    description: 'Sales Funnels, Upsells und A/B-Testing.',
    priceMonthly: 4900,
    features: {
      websiteBuilder: true,
      maxPages: 30,
      blog: false,
      maxPosts: 0,
      maxAuthors: 0,
      comments: false,
      shop: false,
      maxProducts: 0,
      digitalProducts: false,
      productVariants: false,
      booking: false,
      maxBookingServices: 0,
      newsletter: true,
      maxSubscribers: 5000,
      forms: true,
      maxForms: 20,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'full',
      customDomain: true,
      aiContent: false,
      aiCreditsPerMonth: 0,
      i18n: false,
      maxUsers: 3,
      storageMb: 10000,
      removeBranding: true,
      restaurant: false,
      localStore: false,
      funnels: true,
      maxFunnels: 20,
      coupons: true,
    },
    highlightFeatures: [
      '20 Funnels',
      'Sales & Upsell Seiten',
      'Newsletter (5.000 Abonnenten)',
      'A/B-Testing',
      '30 Seiten',
      '3 Team-Mitglieder',
    ],
  },

  funnels_premium: {
    type: 'funnels_premium',
    category: 'funnels',
    tier: 3,
    name: 'Premium',
    tagline: 'ClickFunnels-Ersatz komplett',
    description:
      'Unbegrenzte Funnels, AI-Texte und volle Marketing-Automation.',
    priceMonthly: 9900,
    features: {
      websiteBuilder: true,
      maxPages: 100,
      blog: false,
      maxPosts: 0,
      maxAuthors: 0,
      comments: false,
      shop: true,
      maxProducts: 50,
      digitalProducts: true,
      productVariants: false,
      booking: false,
      maxBookingServices: 0,
      newsletter: true,
      maxSubscribers: 20000,
      forms: true,
      maxForms: 50,
      members: false,
      maxMembers: 0,
      courses: false,
      maxCourses: 0,
      maxDownloads: 0,
      analytics: 'full',
      customDomain: true,
      aiContent: true,
      aiCreditsPerMonth: 500,
      i18n: false,
      maxUsers: 5,
      storageMb: 50000,
      removeBranding: true,
      restaurant: false,
      localStore: false,
      funnels: true,
      maxFunnels: 999,
      coupons: true,
    },
    highlightFeatures: [
      'Unbegrenzte Funnels',
      'AI Content (500 Credits)',
      'Marketing-Automation',
      'Newsletter (20.000 Abonnenten)',
      'Shop (50 Produkte)',
      '5 Team-Mitglieder',
    ],
  },
};

// ==================== ADD-ONS ====================

export interface AddonDefinition {
  type: AddonType;
  name: string;
  description: string;
  priceMonthly: number; // cents
  icon: string;
  // Was wird hinzugefügt
  adds: Partial<PackageFeatures>;
  // Ab welchem Paket verfügbar (leer = alle)
  availableForCategories: Array<
    'website' | 'blog' | 'business' | 'shop' | 'members' | 'all'
  >;
  // Voraussetzungen
  requires?: AddonType[];
}

export const ADDONS: Record<AddonType, AddonDefinition> = {
  shop_module: {
    type: 'shop_module',
    name: 'Shop-Modul',
    description:
      '100 Produkte, Warenkorb, Stripe-Zahlung und Bestellverwaltung.',
    priceMonthly: 1900, // €19
    icon: '🛒',
    adds: { shop: true, maxProducts: 100 },
    availableForCategories: ['website', 'blog', 'business', 'members'],
  },
  shop_extra: {
    type: 'shop_extra',
    name: 'Shop-Erweiterung',
    description: '+500 Produkte, Varianten und digitale Downloads.',
    priceMonthly: 1500, // €15
    icon: '📦',
    adds: { maxProducts: 500, digitalProducts: true, productVariants: true },
    availableForCategories: ['all'],
    requires: ['shop_module'],
  },
  booking_module: {
    type: 'booking_module',
    name: 'Booking-Modul',
    description:
      'Online-Terminbuchung mit bis zu 5 Services, Kalender und Bestätigungs-Emails.',
    priceMonthly: 1200, // €12
    icon: '📅',
    adds: { booking: true, maxBookingServices: 5 },
    availableForCategories: ['website', 'blog', 'shop', 'members'],
  },
  blog_module: {
    type: 'blog_module',
    name: 'Blog-Modul',
    description: '100 Blog-Beiträge mit Kommentaren und Kategorien.',
    priceMonthly: 900, // €9
    icon: '✍️',
    adds: { blog: true, maxPosts: 100, maxAuthors: 1, comments: true },
    availableForCategories: ['website', 'shop', 'members'],
  },
  newsletter_extra: {
    type: 'newsletter_extra',
    name: 'Newsletter-Erweiterung',
    description: '+1.000 Newsletter-Abonnenten.',
    priceMonthly: 900, // €9
    icon: '📧',
    adds: { newsletter: true, maxSubscribers: 1000 },
    availableForCategories: ['all'],
  },
  members_module: {
    type: 'members_module',
    name: 'Mitglieder-Modul',
    description:
      'Geschützter Bereich für bis zu 100 Mitglieder mit Download-Bereich.',
    priceMonthly: 1900, // €19
    icon: '🔐',
    adds: { members: true, maxMembers: 100, maxDownloads: 10 },
    availableForCategories: ['website', 'blog', 'business', 'shop'],
  },
  ai_content: {
    type: 'ai_content',
    name: 'AI Content',
    description:
      '200 AI-Credits/Monat für Texte, Verbesserungen und Übersetzungen.',
    priceMonthly: 1400, // €14
    icon: '🤖',
    adds: { aiContent: true, aiCreditsPerMonth: 200 },
    availableForCategories: ['all'],
  },
  extra_pages: {
    type: 'extra_pages',
    name: 'Extra Seiten',
    description: '+10 Seiten für deine Website.',
    priceMonthly: 500, // €5
    icon: '📄',
    adds: { maxPages: 10 },
    availableForCategories: ['all'],
  },
  extra_users: {
    type: 'extra_users',
    name: 'Extra Benutzer',
    description: '+1 Team-Mitglied mit Dashboard-Zugang.',
    priceMonthly: 400, // €4
    icon: '👤',
    adds: { maxUsers: 1 },
    availableForCategories: ['all'],
  },
  i18n: {
    type: 'i18n',
    name: 'Mehrsprachigkeit',
    description: 'Deine Website in bis zu 13 Sprachen übersetzen.',
    priceMonthly: 900, // €9
    icon: '🌍',
    adds: { i18n: true },
    availableForCategories: ['all'],
  },
  custom_domain: {
    type: 'custom_domain',
    name: 'Eigene Domain',
    description: 'Verbinde deine eigene Domain (z.B. meine-firma.de).',
    priceMonthly: 0, // kostenlos ab Standard
    icon: '🌐',
    adds: { customDomain: true },
    availableForCategories: ['all'],
  },
  restaurant_module: {
    type: 'restaurant_module',
    name: 'Restaurant-Modul',
    description:
      'Digitale Speisekarte, Tischbestellungen, Lieferung und Abholung.',
    priceMonthly: 1900, // €19
    icon: '🍽️',
    adds: { restaurant: true },
    availableForCategories: ['business', 'website'],
  },
  local_store_module: {
    type: 'local_store_module',
    name: 'Lokaler Handel',
    description: 'Online-Bestellungen mit Abholslots für lokale Geschäfte.',
    priceMonthly: 1900, // €19
    icon: '🏪',
    adds: { localStore: true },
    availableForCategories: ['business', 'website', 'shop'],
  },
  funnels_module: {
    type: 'funnels_module',
    name: 'Sales Funnels',
    description: 'Lead-Funnels, Opt-in Seiten und Conversion-Tracking.',
    priceMonthly: 1500, // €15
    icon: '🎯',
    adds: { funnels: true, maxFunnels: 10 },
    availableForCategories: ['business', 'shop', 'members'],
  },
};

// ==================== CATEGORY DISPLAY ====================

export const PACKAGE_CATEGORIES = [
  {
    id: 'website' as const,
    label: 'Website',
    icon: '🌐',
    tagline: 'Einfach online sein',
    description:
      'Für alle die einen professionellen Auftritt brauchen — ohne Shop, Blog oder Buchungen.',
    color: 'from-blue-500 to-cyan-500',
    examples: 'Friseur, Arzt, Handwerker, Fotograf, Visitenkarte',
    tiers: [
      'website_micro',
      'website_standard',
      'website_pro',
    ] as PackageType[],
  },
  {
    id: 'blog' as const,
    label: 'Blog',
    icon: '✍️',
    tagline: 'Publizieren & Wachsen',
    description:
      'Für Blogger, Creator und Redaktionen die regelmäßig Inhalte veröffentlichen.',
    color: 'from-green-500 to-teal-500',
    examples: 'Blogger, Journalist, Creator, Online-Magazin',
    tiers: [
      'blog_personal',
      'blog_publisher',
      'blog_magazine',
    ] as PackageType[],
  },
  {
    id: 'business' as const,
    label: 'Business',
    icon: '💼',
    tagline: 'Termine, Kunden, Wachstum',
    description:
      'Für lokale Unternehmen und Dienstleister die Termine buchen und Kunden verwalten.',
    color: 'from-violet-500 to-purple-600',
    examples: 'Coach, Berater, Restaurant, Physiotherapeut, Agentur',
    tiers: [
      'business_starter',
      'business_professional',
      'business_agency',
    ] as PackageType[],
  },
  {
    id: 'shop' as const,
    label: 'Shop',
    icon: '🛒',
    tagline: 'Produkte verkaufen',
    description:
      'Für Online-Händler die physische oder digitale Produkte verkaufen wollen.',
    color: 'from-orange-500 to-red-500',
    examples: 'Online-Shop, Handmade, digitale Produkte, Dropshipping',
    tiers: ['shop_mini', 'shop_wachstum', 'shop_premium'] as PackageType[],
  },
  {
    id: 'members' as const,
    label: 'Mitglieder',
    icon: '🔐',
    tagline: 'Community & Kurse',
    description:
      'Für alle die exklusive Inhalte, Kurse oder Communities aufbauen wollen.',
    color: 'from-pink-500 to-rose-600',
    examples: 'Online-Kurs, Community, Coaching-Programm, Membership-Site',
    tiers: [
      'members_community',
      'members_kurse',
      'members_academy',
    ] as PackageType[],
  },
  {
    id: 'restaurant' as const,
    label: 'Restaurant',
    icon: '🍽️',
    tagline: 'Gastronomie digitalisieren',
    description:
      'Speisekarte, Bestellungen, Reservierungen — alles für dein Restaurant.',
    color: 'from-orange-500 to-red-500',
    examples: 'Restaurant, Café, Burger, Pizzeria, Food Truck',
    tiers: [
      'restaurant_starter',
      'restaurant_pro',
      'restaurant_premium',
    ] as PackageType[],
  },
  {
    id: 'local' as const,
    label: 'Lokaler Handel',
    icon: '🏪',
    tagline: 'Vor-Ort Handel online bringen',
    description:
      'Click & Collect, Abholslots und lokale Produkte für stationäre Händler.',
    color: 'from-teal-500 to-green-500',
    examples: 'Apotheke, Bäckerei, Blumenladen, Metzger, Supermarkt',
    tiers: ['local_starter', 'local_pro', 'local_premium'] as PackageType[],
  },
  {
    id: 'funnels' as const,
    label: 'Funnels',
    icon: '🎯',
    tagline: 'ClickFunnels-Ersatz',
    description: 'Lead-Generierung, Sales Funnels und Marketing-Automation.',
    color: 'from-purple-500 to-indigo-600',
    examples: 'Lead-Generierung, Webinar, Produkt-Launch, Affiliate-Marketing',
    tiers: [
      'funnels_starter',
      'funnels_pro',
      'funnels_premium',
    ] as PackageType[],
  },
];

// ==================== HELPER FUNCTIONS ====================

export function getPackage(type: PackageType): PackageDefinition {
  return PACKAGES[type];
}

export function hasFeature(
  packageType: PackageType,
  feature: keyof PackageFeatures,
): boolean {
  const pkg = PACKAGES[packageType];
  if (!pkg) return false;
  const val = pkg.features[feature];
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val > 0;
  return !!val;
}

export function getLimit(
  packageType: PackageType,
  limit: keyof PackageFeatures,
): number {
  const pkg = PACKAGES[packageType];
  if (!pkg) return 0;
  const val = pkg.features[limit];
  return typeof val === 'number' ? val : 0;
}

export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(0)}`;
}

export function formatLimit(
  val: number,
  singular: string,
  plural?: string,
): string {
  if (val <= 0) return '—';
  const label = plural && val !== 1 ? plural : singular;
  return `${val.toLocaleString('de-DE')} ${label}`;
}

export function getCategoryPackages(category: string): PackageDefinition[] {
  return Object.values(PACKAGES).filter((p) => p.category === category);
}

// Immer inklusive — in jeder Paket-Karte anzeigen
export const ALWAYS_INCLUDED = [
  '✅ Impressum, Datenschutz & AGB inklusive',
  '✅ SSL-Zertifikat',
  '✅ Dashboard mit allen aktiven Modulen',
  '✅ Website Builder (One-Page oder Multi-Page)',
  '✅ DSGVO-konform, Made in Germany',
  '✅ Subdomain (deinname.quickpages.de)',
];
