// Hero Section
export interface HeroSectionConfig {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
  style?: 'fullscreen' | 'split';
}

// Features Section
export interface Feature {
  title: string;
  description: string;
  icon?: string;
}

export interface FeaturesSectionConfig {
  title?: string;
  subtitle?: string;
  features?: Feature[];
  columns?: 2 | 3 | 4;
}

// Blog Feed Section
export interface BlogFeedSectionConfig {
  limit?: number;
  title?: string;
  subtitle?: string;
  showAuthor?: boolean;
  showCategory?: boolean;
  showDate?: boolean;
}

// Product Grid Section
export interface ProductGridSectionConfig {
  limit?: number;
  featuredOnly?: boolean;
  title?: string;
  subtitle?: string;
  showCategory?: boolean;
  showPrice?: boolean;
}

// Newsletter Section
export interface NewsletterSectionConfig {
  title?: string;
  subtitle?: string;
  style?: 'inline' | 'card';
  showNameFields?: boolean;
  backgroundColor?: string;
}

// Contact Section
export interface ContactSectionConfig {
  title?: string;
  subtitle?: string;
  showContactInfo?: boolean;
  email?: string;
  phone?: string;
  address?: string;
}

// Gallery Section
export interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface GallerySectionConfig {
  title?: string;
  subtitle?: string;
  images?: GalleryImage[];
  columns?: 2 | 3 | 4;
}

// Testimonials Section
export interface Testimonial {
  name: string;
  role: string;
  company?: string;
  content: string;
  avatar?: string;
  rating?: number;
}

export interface TestimonialsSectionConfig {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  columns?: 1 | 2 | 3;
}

// CTA Section
export interface CTASectionConfig {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundColor?: string;
  variant?: 'default' | 'card';
}

// Footer Section
export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterSectionConfig {
  companyName?: string;
  description?: string;
  columns?: FooterColumn[];
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  copyrightText?: string;
}

// Union Type für alle Section Configs
export type SectionConfig =
  | HeroSectionConfig
  | FeaturesSectionConfig
  | BlogFeedSectionConfig
  | ProductGridSectionConfig
  | NewsletterSectionConfig
  | ContactSectionConfig
  | GallerySectionConfig
  | TestimonialsSectionConfig
  | CTASectionConfig
  | FooterSectionConfig;

// Section Type Mapping
export type SectionType =
  | 'hero'
  | 'features'
  | 'blog'
  | 'products'
  | 'newsletter'
  | 'contact'
  | 'gallery'
  | 'testimonials'
  | 'cta'
  | 'footer';

// Template Section Interface
export interface TemplateSection {
  id: string;
  sectionId: string;
  orderIndex: number;
  section?: {
    type: SectionType;
    name: string;
    component: string;
    description?: string;
  };
  overrideConfig?: SectionConfig;
}