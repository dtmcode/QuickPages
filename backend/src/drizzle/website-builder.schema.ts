/**
 * 🎨 WEBSITE BUILDER SCHEMA
 * Separates Schema für Website Builder Modul
 */

import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  integer,
  text,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './schema'; // Import from core schema

// ==================== ENUMS ====================

export const sectionTypeEnum = pgEnum('wb_section_type', [
  'hero',
  'features',
  'about',
  'services',
  'gallery',
  'testimonials',
  'team',
  'pricing',
  'cta',
  'contact',
  'faq',
  'blog',
  'stats',
  'video',
  'text',
  'html',
  'custom',
  'newsletter',
  'booking',
  'map',
  'countdown',
  'social',
  'spacer',
  'before_after',
  'whatsapp',
  'freestyle',
]);

export const pageStatusEnum = pgEnum('wb_page_status', [
  'draft',
  'published',
  'archived',
]);

// ==================== GLOBAL TEMPLATES ====================
// ✅ Diese Templates sind für ALLE Tenants verfügbar

export const wbGlobalTemplates = pgTable(
  'wb_global_templates',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Template Info
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    thumbnailUrl: text('thumbnail_url'),
    category: varchar('category', { length: 100 }), // 'business', 'creative', 'ecommerce', etc.

    // Status
    isActive: boolean('is_active').default(true).notNull(),
    isPremium: boolean('is_premium').default(false).notNull(),

    // Global Settings
    settings: jsonb('settings')
      .$type<{
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
      }>()
      .default({}),

    // Metadata
    previewUrl: text('preview_url'),
    demoUrl: text('demo_url'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index('wb_global_templates_category_idx').on(table.category),
    activeIdx: index('wb_global_templates_active_idx').on(table.isActive),
  }),
);

// ==================== GLOBAL TEMPLATE PAGES ====================
// ✅ Seiten-Vorlagen für globale Templates

export const wbGlobalTemplatePages = pgTable(
  'wb_global_template_pages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    templateId: uuid('template_id')
      .references(() => wbGlobalTemplates.id, { onDelete: 'cascade' })
      .notNull(),

    // Page Info
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    description: text('description'),

    // Status
    isHomepage: boolean('is_homepage').default(false).notNull(),
    order: integer('order').default(0).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    templateIdx: index('wb_global_template_pages_template_idx').on(
      table.templateId,
    ),
    slugIdx: index('wb_global_template_pages_slug_idx').on(table.slug),
  }),
);

// ==================== GLOBAL TEMPLATE SECTIONS ====================
// ✅ Section-Vorlagen für globale Template Pages

export const wbGlobalTemplateSections = pgTable(
  'wb_global_template_sections',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    pageId: uuid('page_id')
      .references(() => wbGlobalTemplatePages.id, { onDelete: 'cascade' })
      .notNull(),

    // Section Info
    name: varchar('name', { length: 255 }).notNull(),
    type: sectionTypeEnum('type').notNull(),
    order: integer('order').default(0).notNull(),

    // Content & Styling
    content: jsonb('content').notNull().default({}),
    styling: jsonb('styling'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    pageIdx: index('wb_global_template_sections_page_idx').on(table.pageId),
    orderIdx: index('wb_global_template_sections_order_idx').on(table.order),
  }),
);

// ==================== TENANT TEMPLATES ====================
// ✅ Tenant Templates - können eigene ODER von Global Template sein

export const wbTemplates = pgTable(
  'wb_templates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    globalTemplateId: uuid('global_template_id').references(
      () => wbGlobalTemplates.id,
      { onDelete: 'set null' },
    ), // ✅ NULL = eigenes Template, gesetzt = von Global

    // Template Info
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    thumbnailUrl: text('thumbnail_url'),

    // Status
    isActive: boolean('is_active').default(true).notNull(),
    isDefault: boolean('is_default').default(false).notNull(),

    // Settings
    settings: jsonb('settings')
      .$type<{
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
      }>()
      .default({}),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('wb_templates_tenant_idx').on(table.tenantId),
    globalTemplateIdx: index('wb_templates_global_template_idx').on(
      table.globalTemplateId,
    ),
    defaultIdx: index('wb_templates_default_idx').on(
      table.tenantId,
      table.isDefault,
    ),
  }),
);

// ==================== PAGES ====================

export const wbPages = pgTable(
  'wb_pages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    templateId: uuid('template_id')
      .references(() => wbTemplates.id, { onDelete: 'cascade' })
      .notNull(),

    // Page Info
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    description: text('description'),

    // SEO
    metaTitle: varchar('meta_title', { length: 255 }),
    metaDescription: text('meta_description'),
    metaKeywords: text('meta_keywords'),

    // Status
    isActive: boolean('is_active').default(true).notNull(),
    isHomepage: boolean('is_homepage').default(false).notNull(),
    order: integer('order').default(0).notNull(),

    // Page Settings
    settings: jsonb('settings')
      .$type<{
        layout?: string;
        headerVisible?: boolean;
        footerVisible?: boolean;
        customCss?: string;
        customJs?: string;
      }>()
      .default({}),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('wb_pages_tenant_idx').on(table.tenantId),
    templateIdx: index('wb_pages_template_idx').on(table.templateId),
    slugIdx: index('wb_pages_slug_idx').on(table.slug),
    tenantSlugIdx: uniqueIndex('wb_pages_tenant_slug_idx').on(
      table.tenantId,
      table.templateId,
      table.slug,
    ),
    homepageIdx: index('wb_pages_homepage_idx').on(table.isHomepage),
  }),
);

// ==================== SECTIONS ====================

export const wbSections = pgTable(
  'wb_sections',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    pageId: uuid('page_id')
      .references(() => wbPages.id, { onDelete: 'cascade' })
      .notNull(),

    // Section Info
    name: varchar('name', { length: 255 }).notNull(),
    type: sectionTypeEnum('type').notNull(),
    order: integer('order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),

    // Content (Flexible JSON)
    content: jsonb('content')
      .$type<{
        // Hero/CTA
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
        items?: Array<{
          id?: string;
          title?: string;
          description?: string;
          icon?: string;
          image?: string;
          link?: string;
        }>;

        // Gallery
        images?: Array<{
          url: string;
          alt?: string;
          title?: string;
          description?: string;
        }>;

        // Testimonials
        testimonials?: Array<{
          id?: string;
          name?: string;
          role?: string;
          company?: string;
          text?: string;
          avatar?: string;
          rating?: number;
        }>;

        // Team
        members?: Array<{
          id?: string;
          name?: string;
          role?: string;
          bio?: string;
          image?: string;
          social?: {
            linkedin?: string;
            twitter?: string;
            github?: string;
          };
        }>;

        // Pricing
        plans?: Array<{
          id?: string;
          name?: string;
          price?: string;
          currency?: string;
          interval?: string;
          features?: string[];
          highlighted?: boolean;
          buttonText?: string;
          buttonLink?: string;
        }>;

        // FAQ
        faqs?: Array<{
          id?: string;
          question?: string;
          answer?: string;
        }>;

        // Stats
        stats?: Array<{
          id?: string;
          value?: string;
          label?: string;
          icon?: string;
        }>;

        // Video
        videoUrl?: string;
        videoPoster?: string;

        // Text/HTML
        text?: string;
        html?: string;
      }>()
      .notNull()
      .default({}),

    // Styling
    styling: jsonb('styling').$type<{
      backgroundColor?: string;
      textColor?: string;
      padding?: {
        top?: string;
        bottom?: string;
        left?: string;
        right?: string;
      };
      margin?: {
        top?: string;
        bottom?: string;
      };
      customCss?: string;
      containerWidth?: 'full' | 'contained' | 'narrow';
      backgroundImage?: string;
      backgroundOverlay?: string;
    }>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('wb_sections_tenant_idx').on(table.tenantId),
    pageIdx: index('wb_sections_page_idx').on(table.pageId),
    orderIdx: index('wb_sections_order_idx').on(table.order),
    typeIdx: index('wb_sections_type_idx').on(table.type),
  }),
);

// ==================== RELATIONS ====================

export const wbGlobalTemplatesRelations = relations(
  wbGlobalTemplates,
  ({ many }) => ({
    pages: many(wbGlobalTemplatePages),
    tenantInstances: many(wbTemplates),
  }),
);

export const wbGlobalTemplatePagesRelations = relations(
  wbGlobalTemplatePages,
  ({ one, many }) => ({
    template: one(wbGlobalTemplates, {
      fields: [wbGlobalTemplatePages.templateId],
      references: [wbGlobalTemplates.id],
    }),
    sections: many(wbGlobalTemplateSections),
  }),
);

export const wbGlobalTemplateSectionsRelations = relations(
  wbGlobalTemplateSections,
  ({ one }) => ({
    page: one(wbGlobalTemplatePages, {
      fields: [wbGlobalTemplateSections.pageId],
      references: [wbGlobalTemplatePages.id],
    }),
  }),
);

export const wbTemplatesRelations = relations(wbTemplates, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [wbTemplates.tenantId],
    references: [tenants.id],
  }),
  globalTemplate: one(wbGlobalTemplates, {
    fields: [wbTemplates.globalTemplateId],
    references: [wbGlobalTemplates.id],
  }),
  pages: many(wbPages),
}));

export const wbPagesRelations = relations(wbPages, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [wbPages.tenantId],
    references: [tenants.id],
  }),
  template: one(wbTemplates, {
    fields: [wbPages.templateId],
    references: [wbTemplates.id],
  }),
  sections: many(wbSections),
}));

export const wbSectionsRelations = relations(wbSections, ({ one }) => ({
  tenant: one(tenants, {
    fields: [wbSections.tenantId],
    references: [tenants.id],
  }),
  page: one(wbPages, {
    fields: [wbSections.pageId],
    references: [wbPages.id],
  }),
}));
