export interface TemplateSettings {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  layout?: {
    maxWidth?: string;
    spacing?: string;
  };
}

export interface SectionConfig {
  [key: string]: string | number | boolean | undefined;
}

export interface Template {
  id: string;
  tenantId?: string;
  name: string;
  category: 'business' | 'shop' | 'blog' | 'landing' | 'portfolio' | 'custom';
  description?: string;
  thumbnail?: string;
  isPreset: boolean;
  isPublic: boolean;
  settings?: TemplateSettings;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  templateSections?: TemplateSection[];
}

export interface Section {
  id: string;
  tenantId?: string;
  name: string;
  type: 'hero' | 'features' | 'contact' | 'newsletter' | 'products' | 'blog' | 'gallery' | 'testimonials' | 'cta' | 'team' | 'pricing' | 'faq' | 'stats' | 'footer' | 'custom';
  component: string;
  description?: string;
  config?: SectionConfig;
  isPreset: boolean;
  isPublic: boolean;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateSection {
  id: string;
  templateId: string;
  sectionId: string;
  orderIndex: number;
  overrideConfig?: SectionConfig;
  section?: Section;
  createdAt: string;
}

export interface CreateTemplateInput {
  name: string;
  category: string;
  description?: string;
  thumbnail?: string;
  settings?: TemplateSettings;
  isPublic?: boolean;
}

export interface UpdateTemplateInput {
  name?: string;
  category?: string;
  description?: string;
  thumbnail?: string;
  settings?: TemplateSettings;
  isPublic?: boolean;
}