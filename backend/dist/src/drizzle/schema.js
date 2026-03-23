"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogsRelations = exports.passwordResetTokensRelations = exports.refreshTokensRelations = exports.usageTrackingRelations = exports.tenantAddonsRelations = exports.subscriptionsRelations = exports.usersRelations = exports.tenantsRelations = exports.supportMessages = exports.supportTickets = exports.emailVerificationTokens = exports.seoMeta = exports.navigationItems = exports.navigations = exports.mediaFiles = exports.campaignQueue = exports.campaignEvents = exports.newsletterCampaigns = exports.newsletterSubscribers = exports.tenantEmailTemplates = exports.tenantEmailSettings = exports.emailEvents = exports.emailLogs = exports.passwordResetTokens = exports.orderItems = exports.orders = exports.products = exports.categories = exports.pages = exports.posts = exports.auditLogs = exports.refreshTokens = exports.users = exports.usageTracking = exports.tenantAddons = exports.subscriptions = exports.tenants = exports.campaignEventTypeEnum = exports.campaignStatusEnum = exports.subscriberStatusEnum = exports.emailProviderEnum = exports.mediaTypeEnum = exports.orderStatusEnum = exports.pageTemplateEnum = exports.postStatusEnum = exports.subscriptionStatusEnum = exports.addonTypeEnum = exports.shopTemplateEnum = exports.packageEnum = exports.userRoleEnum = void 0;
exports.supportMessagesRelations = exports.supportTicketsRelations = exports.navigationItemsRelations = exports.navigationsRelations = exports.mediaFilesRelations = exports.campaignQueueRelations = exports.campaignEventsRelations = exports.newsletterCampaignsRelations = exports.newsletterSubscribersRelations = exports.tenantEmailTemplatesRelations = exports.tenantEmailSettingsRelations = exports.emailEventsRelations = exports.emailLogsRelations = exports.orderItemsRelations = exports.ordersRelations = exports.productsRelations = exports.categoriesRelations = exports.pagesRelations = exports.postsRelations = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.userRoleEnum = (0, pg_core_1.pgEnum)('user_role', ['owner', 'admin', 'user']);
exports.packageEnum = (0, pg_core_1.pgEnum)('package', [
    'starter',
    'business',
    'enterprise',
    'page',
    'creator',
    'shop',
    'professional',
    'landing',
]);
exports.shopTemplateEnum = (0, pg_core_1.pgEnum)('shop_template', [
    'default',
    'minimalist',
    'fashion',
    'tech',
]);
exports.addonTypeEnum = (0, pg_core_1.pgEnum)('addon_type', [
    'shop_business',
    'shop_pro',
    'email_starter',
    'email_business',
    'extra_users',
    'shop_module',
    'newsletter',
    'booking',
    'ai_content',
    'form_builder',
    'i18n',
    'extra_products',
    'extra_ai_credits',
]);
exports.subscriptionStatusEnum = (0, pg_core_1.pgEnum)('subscription_status', [
    'active',
    'cancelled',
    'past_due',
    'trialing',
]);
exports.postStatusEnum = (0, pg_core_1.pgEnum)('post_status', [
    'draft',
    'published',
    'archived',
]);
exports.pageTemplateEnum = (0, pg_core_1.pgEnum)('page_template', [
    'default',
    'landing',
    'contact',
    'about',
    'blank',
]);
exports.orderStatusEnum = (0, pg_core_1.pgEnum)('order_status', [
    'pending',
    'processing',
    'completed',
    'cancelled',
]);
exports.mediaTypeEnum = (0, pg_core_1.pgEnum)('media_type', [
    'image',
    'video',
    'audio',
    'document',
    'other',
]);
exports.emailProviderEnum = (0, pg_core_1.pgEnum)('email_provider', [
    'custom',
    'gmail',
    'outlook',
    'netcup',
    'ionos',
    'strato',
    'sendgrid',
    'mailgun',
    'resend',
]);
exports.subscriberStatusEnum = (0, pg_core_1.pgEnum)('subscriber_status', [
    'pending',
    'active',
    'unsubscribed',
    'bounced',
    'complained',
]);
exports.campaignStatusEnum = (0, pg_core_1.pgEnum)('campaign_status', [
    'draft',
    'scheduled',
    'sending',
    'sent',
    'paused',
    'failed',
]);
exports.campaignEventTypeEnum = (0, pg_core_1.pgEnum)('campaign_event_type', [
    'sent',
    'delivered',
    'opened',
    'clicked',
    'bounced',
    'unsubscribed',
    'complained',
]);
exports.tenants = (0, pg_core_1.pgTable)('tenants', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 200 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 200 }).notNull().unique(),
    domain: (0, pg_core_1.varchar)('domain', { length: 255 }),
    package: (0, exports.packageEnum)('package').default('starter').notNull(),
    shopTemplate: (0, exports.shopTemplateEnum)('shop_template').default('default'),
    settings: (0, pg_core_1.jsonb)('settings').default({
        modules: {
            cms: false,
            shop: false,
            email: false,
            landing: false,
        },
        limits: {
            users: 5,
            products: 100,
            emails: 1000,
        },
    }),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    activeTemplateId: (0, pg_core_1.uuid)('active_template_id'),
    templateCustomizations: (0, pg_core_1.jsonb)('template_customizations').default({}),
    branding: (0, pg_core_1.jsonb)('branding').default({}),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
}, (table) => ({
    slugIdx: (0, pg_core_1.uniqueIndex)('tenants_slug_idx').on(table.slug),
    domainIdx: (0, pg_core_1.index)('tenants_domain_idx').on(table.domain),
}));
exports.subscriptions = (0, pg_core_1.pgTable)('subscriptions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .references(() => exports.tenants.id, { onDelete: 'cascade' })
        .notNull(),
    package: (0, exports.packageEnum)('package').notNull(),
    status: (0, exports.subscriptionStatusEnum)('status').default('active').notNull(),
    currentPeriodStart: (0, pg_core_1.timestamp)('current_period_start').notNull(),
    currentPeriodEnd: (0, pg_core_1.timestamp)('current_period_end').notNull(),
    cancelAtPeriodEnd: (0, pg_core_1.boolean)('cancel_at_period_end').default(false),
    stripeSubscriptionId: (0, pg_core_1.varchar)('stripe_subscription_id', { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
}, (table) => ({
    tenantIdx: (0, pg_core_1.index)('subscriptions_tenant_idx').on(table.tenantId),
    stripeIdx: (0, pg_core_1.index)('subscriptions_stripe_idx').on(table.stripeSubscriptionId),
}));
exports.tenantAddons = (0, pg_core_1.pgTable)('tenant_addons', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .references(() => exports.tenants.id, { onDelete: 'cascade' })
        .notNull(),
    addonType: (0, exports.addonTypeEnum)('addon_type').notNull(),
    quantity: (0, pg_core_1.integer)('quantity').default(1).notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    activatedAt: (0, pg_core_1.timestamp)('activated_at').defaultNow(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    stripeSubscriptionId: (0, pg_core_1.varchar)('stripe_subscription_id', { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
}, (table) => ({
    tenantIdx: (0, pg_core_1.index)('tenant_addons_tenant_idx').on(table.tenantId),
    tenantAddonIdx: (0, pg_core_1.uniqueIndex)('tenant_addons_tenant_addon_idx').on(table.tenantId, table.addonType),
}));
exports.usageTracking = (0, pg_core_1.pgTable)('usage_tracking', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .references(() => exports.tenants.id, { onDelete: 'cascade' })
        .notNull(),
    month: (0, pg_core_1.varchar)('month', { length: 7 }).notNull(),
    emailsSent: (0, pg_core_1.integer)('emails_sent').default(0).notNull(),
    productsCreated: (0, pg_core_1.integer)('products_created').default(0).notNull(),
    postsCreated: (0, pg_core_1.integer)('posts_created').default(0).notNull(),
    apiCalls: (0, pg_core_1.integer)('api_calls').default(0).notNull(),
    storageUsedMb: (0, pg_core_1.integer)('storage_used_mb').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
}, (table) => ({
    tenantMonthIdx: (0, pg_core_1.uniqueIndex)('usage_tracking_tenant_month_idx').on(table.tenantId, table.month),
}));
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .references(() => exports.tenants.id, { onDelete: 'cascade' })
        .notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }),
    role: (0, exports.userRoleEnum)('role').default('user').notNull(),
    firstName: (0, pg_core_1.varchar)('first_name', { length: 100 }),
    lastName: (0, pg_core_1.varchar)('last_name', { length: 100 }),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    emailVerified: (0, pg_core_1.boolean)('email_verified').default(false),
    lastLoginAt: (0, pg_core_1.timestamp)('last_login_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
}, (table) => ({
    tenantEmailIdx: (0, pg_core_1.uniqueIndex)('users_tenant_email_idx').on(table.tenantId, table.email),
    emailIdx: (0, pg_core_1.index)('users_email_idx').on(table.email),
}));
exports.refreshTokens = (0, pg_core_1.pgTable)('refresh_tokens', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id')
        .references(() => exports.users.id, { onDelete: 'cascade' })
        .notNull(),
    token: (0, pg_core_1.varchar)('token', { length: 500 }).notNull().unique(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
}, (table) => ({
    tokenIdx: (0, pg_core_1.uniqueIndex)('refresh_tokens_token_idx').on(table.token),
    userIdx: (0, pg_core_1.index)('refresh_tokens_user_idx').on(table.userId),
}));
exports.auditLogs = (0, pg_core_1.pgTable)('audit_logs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .references(() => exports.tenants.id, { onDelete: 'cascade' })
        .notNull(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, {
        onDelete: 'set null',
    }),
    action: (0, pg_core_1.varchar)('action', { length: 100 }).notNull(),
    resource: (0, pg_core_1.varchar)('resource', { length: 100 }).notNull(),
    resourceId: (0, pg_core_1.varchar)('resource_id', { length: 100 }),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    userAgent: (0, pg_core_1.varchar)('user_agent', { length: 500 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
}, (table) => ({
    tenantIdx: (0, pg_core_1.index)('audit_logs_tenant_idx').on(table.tenantId),
    userIdx: (0, pg_core_1.index)('audit_logs_user_idx').on(table.userId),
    actionIdx: (0, pg_core_1.index)('audit_logs_action_idx').on(table.action),
    createdAtIdx: (0, pg_core_1.index)('audit_logs_created_at_idx').on(table.createdAt),
}));
exports.posts = (0, pg_core_1.pgTable)('posts', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .references(() => exports.tenants.id, { onDelete: 'cascade' })
        .notNull(),
    authorId: (0, pg_core_1.uuid)('author_id').references(() => exports.users.id, {
        onDelete: 'set null',
    }),
    title: (0, pg_core_1.varchar)('title', { length: 500 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 500 }).notNull(),
    content: (0, pg_core_1.varchar)('content', { length: 50000 }),
    excerpt: (0, pg_core_1.varchar)('excerpt', { length: 1000 }),
    featuredImage: (0, pg_core_1.varchar)('featured_image', { length: 500 }),
    status: (0, exports.postStatusEnum)('status').default('draft').notNull(),
    isPublished: (0, pg_core_1.boolean)('is_published').default(false).notNull(),
    publishedAt: (0, pg_core_1.timestamp)('published_at'),
    categoryId: (0, pg_core_1.uuid)('category_id').references(() => exports.categories.id, {
        onDelete: 'set null',
    }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
}, (table) => ({
    tenantSlugIdx: (0, pg_core_1.uniqueIndex)('posts_tenant_slug_idx').on(table.tenantId, table.slug),
    tenantIdx: (0, pg_core_1.index)('posts_tenant_idx').on(table.tenantId),
    statusIdx: (0, pg_core_1.index)('posts_status_idx').on(table.status),
}));
exports.pages = (0, pg_core_1.pgTable)('pages', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .references(() => exports.tenants.id, { onDelete: 'cascade' })
        .notNull(),
    authorId: (0, pg_core_1.uuid)('author_id').references(() => exports.users.id, {
        onDelete: 'set null',
    }),
    title: (0, pg_core_1.varchar)('title', { length: 500 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 500 }).notNull(),
    content: (0, pg_core_1.varchar)('content', { length: 50000 }),
    excerpt: (0, pg_core_1.varchar)('excerpt', { length: 1000 }),
    featuredImage: (0, pg_core_1.varchar)('featured_image', { length: 500 }),
    metaDescription: (0, pg_core_1.varchar)('meta_description', { length: 500 }),
    template: (0, exports.pageTemplateEnum)('template').default('default').notNull(),
    status: (0, exports.postStatusEnum)('status').default('draft').notNull(),
    isPublished: (0, pg_core_1.boolean)('is_published').default(false).notNull(),
    publishedAt: (0, pg_core_1.timestamp)('published_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
}, (table) => ({
    tenantSlugIdx: (0, pg_core_1.uniqueIndex)('pages_tenant_slug_idx').on(table.tenantId, table.slug),
    tenantIdx: (0, pg_core_1.index)('pages_tenant_idx').on(table.tenantId),
    publishedIdx: (0, pg_core_1.index)('pages_published_idx').on(table.isPublished),
    statusIdx: (0, pg_core_1.index)('pages_status_idx').on(table.status),
}));
exports.categories = (0, pg_core_1.pgTable)('categories', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .references(() => exports.tenants.id, { onDelete: 'cascade' })
        .notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 200 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 200 }).notNull(),
    description: (0, pg_core_1.varchar)('description', { length: 1000 }),
    image: (0, pg_core_1.varchar)('image', { length: 500 }),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
}, (table) => ({
    tenantSlugIdx: (0, pg_core_1.uniqueIndex)('categories_tenant_slug_idx').on(table.tenantId, table.slug),
    tenantIdx: (0, pg_core_1.index)('categories_tenant_idx').on(table.tenantId),
}));
exports.products = (0, pg_core_1.pgTable)('products', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .references(() => exports.tenants.id, { onDelete: 'cascade' })
        .notNull(),
    categoryId: (0, pg_core_1.uuid)('category_id').references(() => exports.categories.id, {
        onDelete: 'set null',
    }),
    name: (0, pg_core_1.varchar)('name', { length: 500 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 500 }).notNull(),
    description: (0, pg_core_1.varchar)('description', { length: 5000 }),
    price: (0, pg_core_1.integer)('price').notNull(),
    compareAtPrice: (0, pg_core_1.integer)('compare_at_price'),
    stock: (0, pg_core_1.integer)('stock').default(0).notNull(),
    images: (0, pg_core_1.varchar)('images', { length: 2000 }),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    isFeatured: (0, pg_core_1.boolean)('is_featured').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
}, (table) => ({
    tenantSlugIdx: (0, pg_core_1.uniqueIndex)('products_tenant_slug_idx').on(table.tenantId, table.slug),
    tenantIdx: (0, pg_core_1.index)('products_tenant_idx').on(table.tenantId),
    categoryIdx: (0, pg_core_1.index)('products_category_idx').on(table.categoryId),
    featuredIdx: (0, pg_core_1.index)('products_featured_idx').on(table.isFeatured),
}));
exports.orders = (0, pg_core_1.pgTable)('orders', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .references(() => exports.tenants.id, { onDelete: 'cascade' })
        .notNull(),
    orderNumber: (0, pg_core_1.varchar)('order_number', { length: 50 }).notNull(),
    customerEmail: (0, pg_core_1.varchar)('customer_email', { length: 255 }).notNull(),
    customerName: (0, pg_core_1.varchar)('customer_name', { length: 255 }).notNull(),
    customerAddress: (0, pg_core_1.varchar)('customer_address', { length: 1000 }),
    status: (0, exports.orderStatusEnum)('status').default('pending').notNull(),
    subtotal: (0, pg_core_1.integer)('subtotal').notNull(),
    tax: (0, pg_core_1.integer)('tax').default(0).notNull(),
    shipping: (0, pg_core_1.integer)('shipping').default(0).notNull(),
    total: (0, pg_core_1.integer)('total').notNull(),
    notes: (0, pg_core_1.varchar)('notes', { length: 1000 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
}, (table) => ({
    tenantIdx: (0, pg_core_1.index)('orders_tenant_idx').on(table.tenantId),
    orderNumberIdx: (0, pg_core_1.uniqueIndex)('orders_order_number_idx').on(table.orderNumber),
    statusIdx: (0, pg_core_1.index)('orders_status_idx').on(table.status),
}));
exports.orderItems = (0, pg_core_1.pgTable)('order_items', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    orderId: (0, pg_core_1.uuid)('order_id')
        .references(() => exports.orders.id, { onDelete: 'cascade' })
        .notNull(),
    productId: (0, pg_core_1.uuid)('product_id').references(() => exports.products.id, {
        onDelete: 'set null',
    }),
    productName: (0, pg_core_1.varchar)('product_name', { length: 500 }).notNull(),
    productPrice: (0, pg_core_1.integer)('product_price').notNull(),
    quantity: (0, pg_core_1.integer)('quantity').notNull(),
    total: (0, pg_core_1.integer)('total').notNull(),
}, (table) => ({
    orderIdx: (0, pg_core_1.index)('order_items_order_idx').on(table.orderId),
}));
exports.passwordResetTokens = (0, pg_core_1.pgTable)('password_reset_tokens', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    token: (0, pg_core_1.varchar)('token', { length: 255 }).notNull().unique(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    used: (0, pg_core_1.boolean)('used').default(false).notNull(),
    usedAt: (0, pg_core_1.timestamp)('used_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.emailLogs = (0, pg_core_1.pgTable)('email_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').references(() => exports.tenants.id, {
        onDelete: 'cascade',
    }),
    to: (0, pg_core_1.varchar)('to', { length: 255 }).notNull(),
    from: (0, pg_core_1.varchar)('from', { length: 255 }).notNull(),
    subject: (0, pg_core_1.varchar)('subject', { length: 500 }).notNull(),
    template: (0, pg_core_1.varchar)('template', { length: 100 }),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).default('sent').notNull(),
    error: (0, pg_core_1.text)('error'),
    sentAt: (0, pg_core_1.timestamp)('sent_at').defaultNow().notNull(),
    openedAt: (0, pg_core_1.timestamp)('opened_at'),
    clickedAt: (0, pg_core_1.timestamp)('clicked_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.emailEvents = (0, pg_core_1.pgTable)('email_events', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    emailLogId: (0, pg_core_1.uuid)('email_log_id')
        .notNull()
        .references(() => exports.emailLogs.id, { onDelete: 'cascade' }),
    eventType: (0, pg_core_1.varchar)('event_type', { length: 50 }).notNull(),
    metadata: (0, pg_core_1.text)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.tenantEmailSettings = (0, pg_core_1.pgTable)('tenant_email_settings', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id, { onDelete: 'cascade' })
        .unique(),
    provider: (0, exports.emailProviderEnum)('provider').default('custom').notNull(),
    smtpHost: (0, pg_core_1.varchar)('smtp_host', { length: 255 }),
    smtpPort: (0, pg_core_1.integer)('smtp_port').default(587),
    smtpSecure: (0, pg_core_1.boolean)('smtp_secure').default(false).notNull(),
    smtpUser: (0, pg_core_1.varchar)('smtp_user', { length: 255 }),
    smtpPassword: (0, pg_core_1.text)('smtp_password'),
    fromEmail: (0, pg_core_1.varchar)('from_email', { length: 255 }).notNull(),
    fromName: (0, pg_core_1.varchar)('from_name', { length: 255 }),
    replyTo: (0, pg_core_1.varchar)('reply_to', { length: 255 }),
    isEnabled: (0, pg_core_1.boolean)('is_enabled').default(false).notNull(),
    isVerified: (0, pg_core_1.boolean)('is_verified').default(false).notNull(),
    lastTestedAt: (0, pg_core_1.timestamp)('last_tested_at'),
    lastUsedAt: (0, pg_core_1.timestamp)('last_used_at'),
    lastError: (0, pg_core_1.text)('last_error'),
    errorCount: (0, pg_core_1.integer)('error_count').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    tenantIdx: (0, pg_core_1.index)('tenant_email_settings_tenant_idx').on(table.tenantId),
}));
exports.tenantEmailTemplates = (0, pg_core_1.pgTable)('tenant_email_templates', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    subject: (0, pg_core_1.varchar)('subject', { length: 500 }).notNull(),
    htmlContent: (0, pg_core_1.text)('html_content').notNull(),
    textContent: (0, pg_core_1.text)('text_content'),
    variables: (0, pg_core_1.jsonb)('variables'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    isDefault: (0, pg_core_1.boolean)('is_default').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    tenantNameIdx: (0, pg_core_1.uniqueIndex)('tenant_email_templates_tenant_name_idx').on(table.tenantId, table.name),
}));
exports.newsletterSubscribers = (0, pg_core_1.pgTable)('newsletter_subscribers', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id, { onDelete: 'cascade' }),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    firstName: (0, pg_core_1.varchar)('first_name', { length: 100 }),
    lastName: (0, pg_core_1.varchar)('last_name', { length: 100 }),
    status: (0, exports.subscriberStatusEnum)('status').default('pending').notNull(),
    tags: (0, pg_core_1.text)('tags').array().default([]),
    customFields: (0, pg_core_1.jsonb)('custom_fields'),
    source: (0, pg_core_1.varchar)('source', { length: 100 }),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    userAgent: (0, pg_core_1.text)('user_agent'),
    subscribedAt: (0, pg_core_1.timestamp)('subscribed_at'),
    confirmedAt: (0, pg_core_1.timestamp)('confirmed_at'),
    unsubscribedAt: (0, pg_core_1.timestamp)('unsubscribed_at'),
    bouncedAt: (0, pg_core_1.timestamp)('bounced_at'),
    unsubscribeToken: (0, pg_core_1.varchar)('unsubscribe_token', { length: 255 }).unique(),
    confirmToken: (0, pg_core_1.varchar)('confirm_token', { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    tenantEmailIdx: (0, pg_core_1.uniqueIndex)('newsletter_subscribers_tenant_email_idx').on(table.tenantId, table.email),
    statusIdx: (0, pg_core_1.index)('newsletter_subscribers_status_idx').on(table.status),
    tagsIdx: (0, pg_core_1.index)('newsletter_subscribers_tags_idx').on(table.tags),
}));
exports.newsletterCampaigns = (0, pg_core_1.pgTable)('newsletter_campaigns', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    subject: (0, pg_core_1.varchar)('subject', { length: 500 }).notNull(),
    previewText: (0, pg_core_1.varchar)('preview_text', { length: 255 }),
    fromName: (0, pg_core_1.varchar)('from_name', { length: 255 }),
    fromEmail: (0, pg_core_1.varchar)('from_email', { length: 255 }),
    replyTo: (0, pg_core_1.varchar)('reply_to', { length: 255 }),
    htmlContent: (0, pg_core_1.text)('html_content').notNull(),
    plainTextContent: (0, pg_core_1.text)('plain_text_content'),
    status: (0, exports.campaignStatusEnum)('status').default('draft').notNull(),
    scheduledAt: (0, pg_core_1.timestamp)('scheduled_at'),
    sendAt: (0, pg_core_1.timestamp)('send_at'),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
    filterTags: (0, pg_core_1.text)('filter_tags').array(),
    excludeTags: (0, pg_core_1.text)('exclude_tags').array(),
    totalRecipients: (0, pg_core_1.integer)('total_recipients').default(0).notNull(),
    sentCount: (0, pg_core_1.integer)('sent_count').default(0).notNull(),
    deliveredCount: (0, pg_core_1.integer)('delivered_count').default(0).notNull(),
    openedCount: (0, pg_core_1.integer)('opened_count').default(0).notNull(),
    clickedCount: (0, pg_core_1.integer)('clicked_count').default(0).notNull(),
    bouncedCount: (0, pg_core_1.integer)('bounced_count').default(0).notNull(),
    unsubscribedCount: (0, pg_core_1.integer)('unsubscribed_count').default(0).notNull(),
    complainedCount: (0, pg_core_1.integer)('complained_count').default(0).notNull(),
    lastError: (0, pg_core_1.text)('last_error'),
    errorCount: (0, pg_core_1.integer)('error_count').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    tenantIdx: (0, pg_core_1.index)('newsletter_campaigns_tenant_idx').on(table.tenantId),
    statusIdx: (0, pg_core_1.index)('newsletter_campaigns_status_idx').on(table.status),
    scheduledIdx: (0, pg_core_1.index)('newsletter_campaigns_scheduled_idx').on(table.scheduledAt),
}));
exports.campaignEvents = (0, pg_core_1.pgTable)('campaign_events', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    campaignId: (0, pg_core_1.uuid)('campaign_id')
        .notNull()
        .references(() => exports.newsletterCampaigns.id, { onDelete: 'cascade' }),
    subscriberId: (0, pg_core_1.uuid)('subscriber_id')
        .notNull()
        .references(() => exports.newsletterSubscribers.id, { onDelete: 'cascade' }),
    eventType: (0, exports.campaignEventTypeEnum)('event_type').notNull(),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    userAgent: (0, pg_core_1.text)('user_agent'),
    clickedUrl: (0, pg_core_1.text)('clicked_url'),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    campaignIdx: (0, pg_core_1.index)('campaign_events_campaign_idx').on(table.campaignId),
    subscriberIdx: (0, pg_core_1.index)('campaign_events_subscriber_idx').on(table.subscriberId),
    eventTypeIdx: (0, pg_core_1.index)('campaign_events_event_type_idx').on(table.eventType),
}));
exports.campaignQueue = (0, pg_core_1.pgTable)('campaign_queue', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    campaignId: (0, pg_core_1.uuid)('campaign_id')
        .notNull()
        .references(() => exports.newsletterCampaigns.id, { onDelete: 'cascade' }),
    subscriberId: (0, pg_core_1.uuid)('subscriber_id')
        .notNull()
        .references(() => exports.newsletterSubscribers.id, { onDelete: 'cascade' }),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).default('pending').notNull(),
    attempts: (0, pg_core_1.integer)('attempts').default(0).notNull(),
    lastAttemptAt: (0, pg_core_1.timestamp)('last_attempt_at'),
    error: (0, pg_core_1.text)('error'),
    scheduledFor: (0, pg_core_1.timestamp)('scheduled_for').notNull(),
    sentAt: (0, pg_core_1.timestamp)('sent_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    campaignSubscriberIdx: (0, pg_core_1.uniqueIndex)('campaign_queue_campaign_subscriber_idx').on(table.campaignId, table.subscriberId),
    statusIdx: (0, pg_core_1.index)('campaign_queue_status_idx').on(table.status),
    scheduledIdx: (0, pg_core_1.index)('campaign_queue_scheduled_idx').on(table.scheduledFor),
}));
exports.mediaFiles = (0, pg_core_1.pgTable)('media_files', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id, { onDelete: 'cascade' }),
    filename: (0, pg_core_1.varchar)('filename', { length: 255 }).notNull(),
    originalFilename: (0, pg_core_1.varchar)('original_filename', { length: 255 }).notNull(),
    mimeType: (0, pg_core_1.varchar)('mime_type', { length: 100 }).notNull(),
    fileSize: (0, pg_core_1.integer)('file_size').notNull(),
    type: (0, exports.mediaTypeEnum)('type').notNull(),
    url: (0, pg_core_1.text)('url').notNull(),
    thumbnailUrl: (0, pg_core_1.text)('thumbnail_url'),
    path: (0, pg_core_1.text)('path').notNull(),
    width: (0, pg_core_1.integer)('width'),
    height: (0, pg_core_1.integer)('height'),
    duration: (0, pg_core_1.integer)('duration'),
    alt: (0, pg_core_1.text)('alt'),
    title: (0, pg_core_1.varchar)('title', { length: 255 }),
    description: (0, pg_core_1.text)('description'),
    folder: (0, pg_core_1.varchar)('folder', { length: 255 }),
    tags: (0, pg_core_1.text)('tags').array().default([]),
    uploadedBy: (0, pg_core_1.uuid)('uploaded_by').references(() => exports.users.id),
    usageCount: (0, pg_core_1.integer)('usage_count').default(0).notNull(),
    lastUsedAt: (0, pg_core_1.timestamp)('last_used_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    tenantIdx: (0, pg_core_1.index)('media_files_tenant_idx').on(table.tenantId),
    typeIdx: (0, pg_core_1.index)('media_files_type_idx').on(table.type),
    folderIdx: (0, pg_core_1.index)('media_files_folder_idx').on(table.folder),
}));
exports.navigations = (0, pg_core_1.pgTable)('navigations', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    location: (0, pg_core_1.varchar)('location', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    tenantLocationIdx: (0, pg_core_1.uniqueIndex)('navigations_tenant_location_idx').on(table.tenantId, table.location),
    tenantIdx: (0, pg_core_1.index)('navigations_tenant_idx').on(table.tenantId),
}));
exports.navigationItems = (0, pg_core_1.pgTable)('navigation_items', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    navigationId: (0, pg_core_1.uuid)('navigation_id')
        .notNull()
        .references(() => exports.navigations.id, { onDelete: 'cascade' }),
    label: (0, pg_core_1.varchar)('label', { length: 255 }).notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    url: (0, pg_core_1.text)('url'),
    pageId: (0, pg_core_1.uuid)('page_id').references(() => exports.pages.id, {
        onDelete: 'set null',
    }),
    postId: (0, pg_core_1.uuid)('post_id').references(() => exports.posts.id, {
        onDelete: 'set null',
    }),
    categoryId: (0, pg_core_1.uuid)('category_id').references(() => exports.categories.id, {
        onDelete: 'set null',
    }),
    icon: (0, pg_core_1.varchar)('icon', { length: 100 }),
    cssClass: (0, pg_core_1.varchar)('css_class', { length: 255 }),
    openInNewTab: (0, pg_core_1.boolean)('open_in_new_tab').default(false).notNull(),
    order: (0, pg_core_1.integer)('order').default(0).notNull(),
    parentId: (0, pg_core_1.uuid)('parent_id').references(() => exports.navigationItems.id, {
        onDelete: 'cascade',
    }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    navigationIdx: (0, pg_core_1.index)('navigation_items_navigation_idx').on(table.navigationId),
    parentIdx: (0, pg_core_1.index)('navigation_items_parent_idx').on(table.parentId),
    orderIdx: (0, pg_core_1.index)('navigation_items_order_idx').on(table.order),
}));
exports.seoMeta = (0, pg_core_1.pgTable)('seo_meta', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    entityType: (0, pg_core_1.varchar)('entity_type', { length: 50 }).notNull(),
    entityId: (0, pg_core_1.uuid)('entity_id').notNull(),
    metaTitle: (0, pg_core_1.varchar)('meta_title', { length: 255 }),
    metaDescription: (0, pg_core_1.text)('meta_description'),
    metaKeywords: (0, pg_core_1.text)('meta_keywords'),
    ogTitle: (0, pg_core_1.varchar)('og_title', { length: 255 }),
    ogDescription: (0, pg_core_1.text)('og_description'),
    ogImage: (0, pg_core_1.text)('og_image'),
    canonicalUrl: (0, pg_core_1.text)('canonical_url'),
    noindex: (0, pg_core_1.boolean)('noindex').default(false).notNull(),
    nofollow: (0, pg_core_1.boolean)('nofollow').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    entityIdx: (0, pg_core_1.uniqueIndex)('seo_meta_entity_idx').on(table.entityType, table.entityId),
}));
exports.emailVerificationTokens = (0, pg_core_1.pgTable)('email_verification_tokens', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    token: (0, pg_core_1.varchar)('token', { length: 255 }).notNull().unique(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    used: (0, pg_core_1.boolean)('used').default(false).notNull(),
    usedAt: (0, pg_core_1.timestamp)('used_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.supportTickets = (0, pg_core_1.pgTable)('support_tickets', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull().references(() => exports.tenants.id, { onDelete: 'cascade' }),
    ticketNumber: (0, pg_core_1.varchar)('ticket_number', { length: 20 }).notNull().unique(),
    subject: (0, pg_core_1.varchar)('subject', { length: 500 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('open'),
    priority: (0, pg_core_1.varchar)('priority', { length: 50 }).notNull().default('normal'),
    customerName: (0, pg_core_1.varchar)('customer_name', { length: 255 }).notNull(),
    customerEmail: (0, pg_core_1.varchar)('customer_email', { length: 255 }).notNull(),
    assignedTo: (0, pg_core_1.uuid)('assigned_to').references(() => exports.users.id, { onDelete: 'set null' }),
    tags: (0, pg_core_1.text)('tags').array().default([]),
    token: (0, pg_core_1.varchar)('token', { length: 255 }).notNull().unique(),
    resolvedAt: (0, pg_core_1.timestamp)('resolved_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    tenantIdx: (0, pg_core_1.index)('support_tickets_tenant_idx').on(table.tenantId),
    statusIdx: (0, pg_core_1.index)('support_tickets_status_idx').on(table.status),
    tokenIdx: (0, pg_core_1.index)('support_tickets_token_idx').on(table.token),
}));
exports.supportMessages = (0, pg_core_1.pgTable)('support_messages', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    ticketId: (0, pg_core_1.uuid)('ticket_id').notNull().references(() => exports.supportTickets.id, { onDelete: 'cascade' }),
    authorName: (0, pg_core_1.varchar)('author_name', { length: 255 }).notNull(),
    authorEmail: (0, pg_core_1.varchar)('author_email', { length: 255 }).notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    isStaff: (0, pg_core_1.boolean)('is_staff').default(false).notNull(),
    isInternal: (0, pg_core_1.boolean)('is_internal').default(false).notNull(),
    attachments: (0, pg_core_1.jsonb)('attachments').default([]),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    ticketIdx: (0, pg_core_1.index)('support_messages_ticket_idx').on(table.ticketId),
}));
exports.tenantsRelations = (0, drizzle_orm_1.relations)(exports.tenants, ({ many, one }) => ({
    subscriptions: many(exports.subscriptions),
    addons: many(exports.tenantAddons),
    users: many(exports.users),
    posts: many(exports.posts),
    pages: many(exports.pages),
    categories: many(exports.categories),
    products: many(exports.products),
    orders: many(exports.orders),
    navigations: many(exports.navigations),
    mediaFiles: many(exports.mediaFiles),
    emailSettings: one(exports.tenantEmailSettings),
    emailTemplates: many(exports.tenantEmailTemplates),
    newsletterSubscribers: many(exports.newsletterSubscribers),
    newsletterCampaigns: many(exports.newsletterCampaigns),
    emailLogs: many(exports.emailLogs),
    usageTracking: many(exports.usageTracking),
    auditLogs: many(exports.auditLogs),
    supportTickets: many(exports.supportTickets),
}));
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ one, many }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.users.tenantId],
        references: [exports.tenants.id],
    }),
    posts: many(exports.posts),
    pages: many(exports.pages),
    refreshTokens: many(exports.refreshTokens),
    passwordResetTokens: many(exports.passwordResetTokens),
    emailVerificationTokens: many(exports.emailVerificationTokens),
    auditLogs: many(exports.auditLogs),
    uploadedMedia: many(exports.mediaFiles),
}));
exports.subscriptionsRelations = (0, drizzle_orm_1.relations)(exports.subscriptions, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.subscriptions.tenantId],
        references: [exports.tenants.id],
    }),
}));
exports.tenantAddonsRelations = (0, drizzle_orm_1.relations)(exports.tenantAddons, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.tenantAddons.tenantId],
        references: [exports.tenants.id],
    }),
}));
exports.usageTrackingRelations = (0, drizzle_orm_1.relations)(exports.usageTracking, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.usageTracking.tenantId],
        references: [exports.tenants.id],
    }),
}));
exports.refreshTokensRelations = (0, drizzle_orm_1.relations)(exports.refreshTokens, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.refreshTokens.userId],
        references: [exports.users.id],
    }),
}));
exports.passwordResetTokensRelations = (0, drizzle_orm_1.relations)(exports.passwordResetTokens, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.passwordResetTokens.userId],
        references: [exports.users.id],
    }),
}));
exports.auditLogsRelations = (0, drizzle_orm_1.relations)(exports.auditLogs, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.auditLogs.tenantId],
        references: [exports.tenants.id],
    }),
    user: one(exports.users, {
        fields: [exports.auditLogs.userId],
        references: [exports.users.id],
    }),
}));
exports.postsRelations = (0, drizzle_orm_1.relations)(exports.posts, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.posts.tenantId],
        references: [exports.tenants.id],
    }),
    author: one(exports.users, {
        fields: [exports.posts.authorId],
        references: [exports.users.id],
    }),
    category: one(exports.categories, {
        fields: [exports.posts.categoryId],
        references: [exports.categories.id],
    }),
}));
exports.pagesRelations = (0, drizzle_orm_1.relations)(exports.pages, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.pages.tenantId],
        references: [exports.tenants.id],
    }),
    author: one(exports.users, {
        fields: [exports.pages.authorId],
        references: [exports.users.id],
    }),
}));
exports.categoriesRelations = (0, drizzle_orm_1.relations)(exports.categories, ({ one, many }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.categories.tenantId],
        references: [exports.tenants.id],
    }),
    products: many(exports.products),
    posts: many(exports.posts),
}));
exports.productsRelations = (0, drizzle_orm_1.relations)(exports.products, ({ one, many }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.products.tenantId],
        references: [exports.tenants.id],
    }),
    category: one(exports.categories, {
        fields: [exports.products.categoryId],
        references: [exports.categories.id],
    }),
    orderItems: many(exports.orderItems),
}));
exports.ordersRelations = (0, drizzle_orm_1.relations)(exports.orders, ({ one, many }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.orders.tenantId],
        references: [exports.tenants.id],
    }),
    items: many(exports.orderItems),
}));
exports.orderItemsRelations = (0, drizzle_orm_1.relations)(exports.orderItems, ({ one }) => ({
    order: one(exports.orders, {
        fields: [exports.orderItems.orderId],
        references: [exports.orders.id],
    }),
    product: one(exports.products, {
        fields: [exports.orderItems.productId],
        references: [exports.products.id],
    }),
}));
exports.emailLogsRelations = (0, drizzle_orm_1.relations)(exports.emailLogs, ({ one, many }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.emailLogs.tenantId],
        references: [exports.tenants.id],
    }),
    events: many(exports.emailEvents),
}));
exports.emailEventsRelations = (0, drizzle_orm_1.relations)(exports.emailEvents, ({ one }) => ({
    emailLog: one(exports.emailLogs, {
        fields: [exports.emailEvents.emailLogId],
        references: [exports.emailLogs.id],
    }),
}));
exports.tenantEmailSettingsRelations = (0, drizzle_orm_1.relations)(exports.tenantEmailSettings, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.tenantEmailSettings.tenantId],
        references: [exports.tenants.id],
    }),
}));
exports.tenantEmailTemplatesRelations = (0, drizzle_orm_1.relations)(exports.tenantEmailTemplates, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.tenantEmailTemplates.tenantId],
        references: [exports.tenants.id],
    }),
}));
exports.newsletterSubscribersRelations = (0, drizzle_orm_1.relations)(exports.newsletterSubscribers, ({ one, many }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.newsletterSubscribers.tenantId],
        references: [exports.tenants.id],
    }),
    campaignEvents: many(exports.campaignEvents),
    campaignQueue: many(exports.campaignQueue),
}));
exports.newsletterCampaignsRelations = (0, drizzle_orm_1.relations)(exports.newsletterCampaigns, ({ one, many }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.newsletterCampaigns.tenantId],
        references: [exports.tenants.id],
    }),
    events: many(exports.campaignEvents),
    queue: many(exports.campaignQueue),
}));
exports.campaignEventsRelations = (0, drizzle_orm_1.relations)(exports.campaignEvents, ({ one }) => ({
    campaign: one(exports.newsletterCampaigns, {
        fields: [exports.campaignEvents.campaignId],
        references: [exports.newsletterCampaigns.id],
    }),
    subscriber: one(exports.newsletterSubscribers, {
        fields: [exports.campaignEvents.subscriberId],
        references: [exports.newsletterSubscribers.id],
    }),
}));
exports.campaignQueueRelations = (0, drizzle_orm_1.relations)(exports.campaignQueue, ({ one }) => ({
    campaign: one(exports.newsletterCampaigns, {
        fields: [exports.campaignQueue.campaignId],
        references: [exports.newsletterCampaigns.id],
    }),
    subscriber: one(exports.newsletterSubscribers, {
        fields: [exports.campaignQueue.subscriberId],
        references: [exports.newsletterSubscribers.id],
    }),
}));
exports.mediaFilesRelations = (0, drizzle_orm_1.relations)(exports.mediaFiles, ({ one }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.mediaFiles.tenantId],
        references: [exports.tenants.id],
    }),
    uploader: one(exports.users, {
        fields: [exports.mediaFiles.uploadedBy],
        references: [exports.users.id],
    }),
}));
exports.navigationsRelations = (0, drizzle_orm_1.relations)(exports.navigations, ({ one, many }) => ({
    tenant: one(exports.tenants, {
        fields: [exports.navigations.tenantId],
        references: [exports.tenants.id],
    }),
    items: many(exports.navigationItems),
}));
exports.navigationItemsRelations = (0, drizzle_orm_1.relations)(exports.navigationItems, ({ one, many }) => ({
    navigation: one(exports.navigations, {
        fields: [exports.navigationItems.navigationId],
        references: [exports.navigations.id],
    }),
    parent: one(exports.navigationItems, {
        fields: [exports.navigationItems.parentId],
        references: [exports.navigationItems.id],
        relationName: 'children',
    }),
    children: many(exports.navigationItems, {
        relationName: 'children',
    }),
    page: one(exports.pages, {
        fields: [exports.navigationItems.pageId],
        references: [exports.pages.id],
    }),
    post: one(exports.posts, {
        fields: [exports.navigationItems.postId],
        references: [exports.posts.id],
    }),
    category: one(exports.categories, {
        fields: [exports.navigationItems.categoryId],
        references: [exports.categories.id],
    }),
}));
exports.supportTicketsRelations = (0, drizzle_orm_1.relations)(exports.supportTickets, ({ one, many }) => ({
    tenant: one(exports.tenants, { fields: [exports.supportTickets.tenantId], references: [exports.tenants.id] }),
    assignedUser: one(exports.users, { fields: [exports.supportTickets.assignedTo], references: [exports.users.id] }),
    messages: many(exports.supportMessages),
}));
exports.supportMessagesRelations = (0, drizzle_orm_1.relations)(exports.supportMessages, ({ one }) => ({
    ticket: one(exports.supportTickets, { fields: [exports.supportMessages.ticketId], references: [exports.supportTickets.id] }),
}));
//# sourceMappingURL=schema.js.map