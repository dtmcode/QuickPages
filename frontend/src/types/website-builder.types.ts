/**
 * Shared TypeScript Types für Website Builder
 * Verwendbar in: Backend, Dashboard, Public Frontend
 * 
 * KEIN 'any' - 100% typ-sicher!
 */

// ==================== ENUMS ====================

export enum SectionType {
  HERO = 'hero',
  FEATURES = 'features',
  ABOUT = 'about',
  SERVICES = 'services',
  GALLERY = 'gallery',
  TESTIMONIALS = 'testimonials',
  TEAM = 'team',
  PRICING = 'pricing',
  CTA = 'cta',
  CONTACT = 'contact',
  FAQ = 'faq',
  BLOG = 'blog',
  STATS = 'stats',
  VIDEO = 'video',
  TEXT = 'text',
  HTML = 'html',
  CUSTOM = 'custom',
   FREESTYLE = 'freestyle',
}

export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// ==================== SETTINGS ====================

export interface TemplateSettings {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  spacing?: {
    default?: string;
  };
}

export interface PageSettings {
  layout?: string;
  headerVisible?: boolean;
  footerVisible?: boolean;
  customCss?: string;
  customJs?: string;
}

// ==================== SECTION CONTENT ====================

export interface SectionContentItem {
  id: string;
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
  link?: string;
}

export interface GalleryImage {
  url: string;
  alt?: string;
  title?: string;
  description?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  text: string;
  avatar?: string;
  rating?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  currency?: string;
  interval?: string;
  features: string[];
  highlighted?: boolean;
  buttonText?: string;
  buttonLink?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Stat {
  id: string;
  value: string;
  label: string;
  icon?: string;
}

export interface SectionContent {
  // Hero
  heading?: string;
  subheading?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
  backgroundVideo?: string;

  // Universal
  title?: string;
  subtitle?: string;
  description?: string;
  alignment?: 'left' | 'center' | 'right';

  // Features/Services
  items?: SectionContentItem[];

  // Gallery
  images?: GalleryImage[];

  // Testimonials
  testimonials?: Testimonial[];

  // Team
  members?: TeamMember[];

  // Pricing
  plans?: PricingPlan[];

  // FAQ
  faqs?: FAQ[];

  // Stats
  stats?: Stat[];

  // Video
  videoUrl?: string;
  videoPoster?: string;

  // Text/HTML
  text?: string;
  html?: string;
}

// ==================== SECTION STYLING ====================

export interface SectionPadding {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

export interface SectionMargin {
  top?: string;
  bottom?: string;
}

export interface SectionStyling {
  backgroundColor?: string;
  textColor?: string;
  padding?: SectionPadding;
  margin?: SectionMargin;
  customCss?: string;
  containerWidth?: 'full' | 'contained' | 'narrow';
  backgroundImage?: string;
  backgroundOverlay?: string;
}

// ==================== ENTITIES ====================

export interface Section {
  id: string;
  tenantId: string;
  pageId: string;
  name: string;
  type: SectionType;
  order: number;
  isActive: boolean;
  content: SectionContent;
  styling: SectionStyling | null;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  tenantId: string;
  templateId: string;
  name: string;
  slug: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  isActive: boolean;
  isHomepage: boolean;
  order: number;
  settings: PageSettings | null;
  sections?: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  isActive: boolean;
  isDefault: boolean;
  settings: TemplateSettings | null;
  pages?: Page[];
  createdAt: string;
  updatedAt: string;
}

// ==================== DTOs ====================

export interface CreateTemplateDto {
  name: string;
  description?: string;
  thumbnailUrl?: string;
  isActive?: boolean;
  isDefault?: boolean;
  settings?: TemplateSettings;
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  thumbnailUrl?: string;
  isActive?: boolean;
  isDefault?: boolean;
  settings?: TemplateSettings;
}

export interface CreatePageDto {
  templateId: string;
  name: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isActive?: boolean;
  isHomepage?: boolean;
  order?: number;
  settings?: PageSettings;
}

export interface UpdatePageDto {
  name?: string;
  slug?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isActive?: boolean;
  isHomepage?: boolean;
  order?: number;
  settings?: PageSettings;
}

export interface CreateSectionDto {
  pageId: string;
  name: string;
  type: SectionType;
  order?: number;
  isActive?: boolean;
  content: SectionContent;
  styling?: SectionStyling;
}

export interface UpdateSectionDto {
  name?: string;
  type?: SectionType;
  order?: number;
  isActive?: boolean;
  content?: SectionContent;
  styling?: SectionStyling;
}

export interface ReorderSectionsDto {
  sectionIds: string[];
}

// ==================== API RESPONSES ====================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// ==================== FORM STATES ====================

export interface FormState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
}

// ==================== DASHBOARD SPECIFIC ====================

export interface EditorState {
  selectedSection: Section | null;
  isDragging: boolean;
  previewMode: 'desktop' | 'tablet' | 'mobile';
}

export interface DashboardContext {
  template: Template | null;
  currentPage: Page | null;
  sections: Section[];
  isLoading: boolean;
  error: string | null;
}
