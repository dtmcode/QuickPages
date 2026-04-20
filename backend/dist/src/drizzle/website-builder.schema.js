"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectedPagesRelations = exports.wbSectionsRelations = exports.wbPagesRelations = exports.wbTemplatesRelations = exports.wbGlobalTemplateSectionsRelations = exports.wbGlobalTemplatePagesRelations = exports.wbGlobalTemplatesRelations = exports.protectedPages = exports.wbSections = exports.wbPages = exports.wbTemplates = exports.wbGlobalTemplateSections = exports.wbGlobalTemplatePages = exports.wbGlobalTemplates = exports.pageStatusEnum = exports.sectionTypeEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("./schema");
exports.sectionTypeEnum = (0, pg_core_1.pgEnum)('wb_section_type', [
    'freestyle',
    'custom',
]);
exports.pageStatusEnum = (0, pg_core_1.pgEnum)('wb_page_status', [
    'draft',
    'published',
    'archived',
]);
exports.wbGlobalTemplates = (0, pg_core_1.pgTable)('wb_global_templates', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    thumbnailUrl: (0, pg_core_1.text)('thumbnail_url'),
    category: (0, pg_core_1.varchar)('category', { length: 100 }),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    isPremium: (0, pg_core_1.boolean)('is_premium').default(false).notNull(),
    settings: (0, pg_core_1.jsonb)('settings')
        .$type()
        .default({}),
    previewUrl: (0, pg_core_1.text)('preview_url'),
    demoUrl: (0, pg_core_1.text)('demo_url'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    categoryIdx: (0, pg_core_1.index)('wb_global_templates_category_idx').on(table.category),
    activeIdx: (0, pg_core_1.index)('wb_global_templates_active_idx').on(table.isActive),
}));
exports.wbGlobalTemplatePages = (0, pg_core_1.pgTable)('wb_global_template_pages', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    templateId: (0, pg_core_1.uuid)('template_id')
        .references(() => exports.wbGlobalTemplates.id, { onDelete: 'cascade' })
        .notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    isHomepage: (0, pg_core_1.boolean)('is_homepage').default(false).notNull(),
    order: (0, pg_core_1.integer)('order').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    templateIdx: (0, pg_core_1.index)('wb_global_template_pages_template_idx').on(table.templateId),
    slugIdx: (0, pg_core_1.index)('wb_global_template_pages_slug_idx').on(table.slug),
}));
exports.wbGlobalTemplateSections = (0, pg_core_1.pgTable)('wb_global_template_sections', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    pageId: (0, pg_core_1.uuid)('page_id')
        .references(() => exports.wbGlobalTemplatePages.id, { onDelete: 'cascade' })
        .notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    type: (0, exports.sectionTypeEnum)('type').notNull(),
    order: (0, pg_core_1.integer)('order').default(0).notNull(),
    content: (0, pg_core_1.jsonb)('content').notNull().default({}),
    styling: (0, pg_core_1.jsonb)('styling'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    pageIdx: (0, pg_core_1.index)('wb_global_template_sections_page_idx').on(table.pageId),
    orderIdx: (0, pg_core_1.index)('wb_global_template_sections_order_idx').on(table.order),
}));
exports.wbTemplates = (0, pg_core_1.pgTable)('wb_templates', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .references(() => schema_1.tenants.id, { onDelete: 'cascade' })
        .notNull(),
    globalTemplateId: (0, pg_core_1.uuid)('global_template_id').references(() => exports.wbGlobalTemplates.id, { onDelete: 'set null' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    thumbnailUrl: (0, pg_core_1.text)('thumbnail_url'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    isDefault: (0, pg_core_1.boolean)('is_default').default(false).notNull(),
    settings: (0, pg_core_1.jsonb)('settings')
        .$type()
        .default({}),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    tenantIdx: (0, pg_core_1.index)('wb_templates_tenant_idx').on(table.tenantId),
    globalTemplateIdx: (0, pg_core_1.index)('wb_templates_global_template_idx').on(table.globalTemplateId),
    defaultIdx: (0, pg_core_1.index)('wb_templates_default_idx').on(table.tenantId, table.isDefault),
}));
exports.wbPages = (0, pg_core_1.pgTable)('wb_pages', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .references(() => schema_1.tenants.id, { onDelete: 'cascade' })
        .notNull(),
    templateId: (0, pg_core_1.uuid)('template_id')
        .references(() => exports.wbTemplates.id, { onDelete: 'cascade' })
        .notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    metaTitle: (0, pg_core_1.varchar)('meta_title', { length: 255 }),
    metaDescription: (0, pg_core_1.text)('meta_description'),
    metaKeywords: (0, pg_core_1.text)('meta_keywords'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    isHomepage: (0, pg_core_1.boolean)('is_homepage').default(false).notNull(),
    order: (0, pg_core_1.integer)('order').default(0).notNull(),
    settings: (0, pg_core_1.jsonb)('settings')
        .$type()
        .default({}),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    tenantIdx: (0, pg_core_1.index)('wb_pages_tenant_idx').on(table.tenantId),
    templateIdx: (0, pg_core_1.index)('wb_pages_template_idx').on(table.templateId),
    slugIdx: (0, pg_core_1.index)('wb_pages_slug_idx').on(table.slug),
    tenantSlugIdx: (0, pg_core_1.uniqueIndex)('wb_pages_tenant_slug_idx').on(table.tenantId, table.templateId, table.slug),
    homepageIdx: (0, pg_core_1.index)('wb_pages_homepage_idx').on(table.isHomepage),
}));
exports.wbSections = (0, pg_core_1.pgTable)('wb_sections', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .references(() => schema_1.tenants.id, { onDelete: 'cascade' })
        .notNull(),
    pageId: (0, pg_core_1.uuid)('page_id')
        .references(() => exports.wbPages.id, { onDelete: 'cascade' })
        .notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    type: (0, exports.sectionTypeEnum)('type').notNull(),
    order: (0, pg_core_1.integer)('order').default(0).notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    content: (0, pg_core_1.jsonb)('content')
        .$type()
        .notNull()
        .default({}),
    styling: (0, pg_core_1.jsonb)('styling').$type(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    tenantIdx: (0, pg_core_1.index)('wb_sections_tenant_idx').on(table.tenantId),
    pageIdx: (0, pg_core_1.index)('wb_sections_page_idx').on(table.pageId),
    orderIdx: (0, pg_core_1.index)('wb_sections_order_idx').on(table.order),
    typeIdx: (0, pg_core_1.index)('wb_sections_type_idx').on(table.type),
}));
exports.protectedPages = (0, pg_core_1.pgTable)('protected_pages', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .references(() => schema_1.tenants.id, { onDelete: 'cascade' })
        .notNull(),
    pageId: (0, pg_core_1.uuid)('page_id')
        .references(() => exports.wbPages.id, { onDelete: 'cascade' })
        .notNull(),
    requiresMembershipPlanId: (0, pg_core_1.uuid)('requires_membership_plan_id').references(() => schema_1.membershipPlans.id, { onDelete: 'set null' }),
    requiresCourseId: (0, pg_core_1.uuid)('requires_course_id').references(() => schema_1.courses.id, {
        onDelete: 'set null',
    }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
}, (table) => ({
    tenantPageIdx: (0, pg_core_1.uniqueIndex)('pp_tenant_page_idx').on(table.tenantId, table.pageId),
}));
exports.wbGlobalTemplatesRelations = (0, drizzle_orm_1.relations)(exports.wbGlobalTemplates, ({ many }) => ({
    pages: many(exports.wbGlobalTemplatePages),
    tenantInstances: many(exports.wbTemplates),
}));
exports.wbGlobalTemplatePagesRelations = (0, drizzle_orm_1.relations)(exports.wbGlobalTemplatePages, ({ one, many }) => ({
    template: one(exports.wbGlobalTemplates, {
        fields: [exports.wbGlobalTemplatePages.templateId],
        references: [exports.wbGlobalTemplates.id],
    }),
    sections: many(exports.wbGlobalTemplateSections),
}));
exports.wbGlobalTemplateSectionsRelations = (0, drizzle_orm_1.relations)(exports.wbGlobalTemplateSections, ({ one }) => ({
    page: one(exports.wbGlobalTemplatePages, {
        fields: [exports.wbGlobalTemplateSections.pageId],
        references: [exports.wbGlobalTemplatePages.id],
    }),
}));
exports.wbTemplatesRelations = (0, drizzle_orm_1.relations)(exports.wbTemplates, ({ one, many }) => ({
    tenant: one(schema_1.tenants, {
        fields: [exports.wbTemplates.tenantId],
        references: [schema_1.tenants.id],
    }),
    globalTemplate: one(exports.wbGlobalTemplates, {
        fields: [exports.wbTemplates.globalTemplateId],
        references: [exports.wbGlobalTemplates.id],
    }),
    pages: many(exports.wbPages),
}));
exports.wbPagesRelations = (0, drizzle_orm_1.relations)(exports.wbPages, ({ one, many }) => ({
    tenant: one(schema_1.tenants, {
        fields: [exports.wbPages.tenantId],
        references: [schema_1.tenants.id],
    }),
    template: one(exports.wbTemplates, {
        fields: [exports.wbPages.templateId],
        references: [exports.wbTemplates.id],
    }),
    sections: many(exports.wbSections),
}));
exports.wbSectionsRelations = (0, drizzle_orm_1.relations)(exports.wbSections, ({ one }) => ({
    tenant: one(schema_1.tenants, {
        fields: [exports.wbSections.tenantId],
        references: [schema_1.tenants.id],
    }),
    page: one(exports.wbPages, {
        fields: [exports.wbSections.pageId],
        references: [exports.wbPages.id],
    }),
}));
exports.protectedPagesRelations = (0, drizzle_orm_1.relations)(exports.protectedPages, ({ one }) => ({
    tenant: one(schema_1.tenants, { fields: [exports.protectedPages.tenantId], references: [schema_1.tenants.id] }),
    page: one(exports.wbPages, { fields: [exports.protectedPages.pageId], references: [exports.wbPages.id] }),
    requiredPlan: one(schema_1.membershipPlans, { fields: [exports.protectedPages.requiresMembershipPlanId], references: [schema_1.membershipPlans.id] }),
    requiredCourse: one(schema_1.courses, { fields: [exports.protectedPages.requiresCourseId], references: [schema_1.courses.id] }),
}));
//# sourceMappingURL=website-builder.schema.js.map