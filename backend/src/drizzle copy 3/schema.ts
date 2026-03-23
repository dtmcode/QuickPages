import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  pgEnum,
  uniqueIndex,
  index,
  integer,
  text,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ========== ENUMS ==========
export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'user']);
export const packageEnum = pgEnum('package', [
  'starter',
  'business',
  'enterprise',
]);
export const shopTemplateEnum = pgEnum('shop_template', [
  'default',
  'minimalist',
  'fashion',
  'tech',
]);

// NEU: Add-on Types
export const addonTypeEnum = pgEnum('addon_type', [
  'shop_business',
  'shop_pro',
  'email_starter',
  'email_business',
  'extra_users',
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'cancelled',
  'past_due',
  'trialing',
]);

export const postStatusEnum = pgEnum('post_status', [
  'draft',
  'published',
  'archived',
]);
export const pageTemplateEnum = pgEnum('page_template', [
  'default',
  'landing',
  'contact',
  'about',
  'blank',
]);
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'processing',
  'completed',
  'cancelled',
]);

// ✅ NEU: Website Template Category
export const websiteTemplateCategoryEnum = pgEnum('website_template_category', [
  'business',
  'shop',
  'blog',
  'landing',
  'portfolio',
  'agency',
  'restaurant',
  'saas',
  'custom',
]);

export const templateCategoryEnum = pgEnum('template_category', [
  'business',
  'shop',
  'blog',
  'landing',
  'portfolio',
  'custom',
]);

export const sectionTypeEnum = pgEnum('section_type', [
  'hero',
  'features',
  'contact',
  'newsletter',
  'products',
  'blog',
  'gallery',
  'testimonials',
  'cta',
  'team',
  'pricing',
  'faq',
  'stats',
  'footer',
  'custom',
]);

export const mediaTypeEnum = pgEnum('media_type', [
  'image',
  'video',
  'audio',
  'document',
  'other',
]);

export const emailProviderEnum = pgEnum('email_provider', [
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

export const subscriberStatusEnum = pgEnum('subscriber_status', [
  'pending',
  'active',
  'unsubscribed',
  'bounced',
  'complained',
]);

export const campaignStatusEnum = pgEnum('campaign_status', [
  'draft',
  'scheduled',
  'sending',
  'sent',
  'paused',
  'failed',
]);

export const campaignEventTypeEnum = pgEnum('campaign_event_type', [
  'sent',
  'delivered',
  'opened',
  'clicked',
  'bounced',
  'unsubscribed',
  'complained',
]);

// ========== TENANTS ==========
export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 200 }).notNull(),
    slug: varchar('slug', { length: 200 }).notNull().unique(),
    domain: varchar('domain', { length: 255 }),
    package: packageEnum('package').default('starter').notNull(),
    shopTemplate: shopTemplateEnum('shop_template').default('default'),
    settings: jsonb('settings').default({
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
    isActive: boolean('is_active').default(true),
    activeTemplateId: uuid('active_template_id'),
    templateCustomizations: jsonb('template_customizations').default({}),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('tenants_slug_idx').on(table.slug),
    domainIdx: index('tenants_domain_idx').on(table.domain),
  }),
);

// ========== SUBSCRIPTIONS ==========
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    package: packageEnum('package').notNull(),
    status: subscriptionStatusEnum('status').default('active').notNull(),
    currentPeriodStart: timestamp('current_period_start').notNull(),
    currentPeriodEnd: timestamp('current_period_end').notNull(),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    tenantIdx: index('subscriptions_tenant_idx').on(table.tenantId),
    stripeIdx: index('subscriptions_stripe_idx').on(table.stripeSubscriptionId),
  }),
);

// ========== TENANT ADD-ONS ==========
export const tenantAddons = pgTable(
  'tenant_addons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    addonType: addonTypeEnum('addon_type').notNull(),
    quantity: integer('quantity').default(1).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    activatedAt: timestamp('activated_at').defaultNow(),
    expiresAt: timestamp('expires_at'),
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    tenantIdx: index('tenant_addons_tenant_idx').on(table.tenantId),
    tenantAddonIdx: uniqueIndex('tenant_addons_tenant_addon_idx').on(
      table.tenantId,
      table.addonType,
    ),
  }),
);

// ========== USAGE TRACKING ==========
export const usageTracking = pgTable(
  'usage_tracking',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    month: varchar('month', { length: 7 }).notNull(),
    emailsSent: integer('emails_sent').default(0).notNull(),
    productsCreated: integer('products_created').default(0).notNull(),
    postsCreated: integer('posts_created').default(0).notNull(),
    apiCalls: integer('api_calls').default(0).notNull(),
    storageUsedMb: integer('storage_used_mb').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    tenantMonthIdx: uniqueIndex('usage_tracking_tenant_month_idx').on(
      table.tenantId,
      table.month,
    ),
  }),
);

// ========== USERS ==========
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }),
    role: userRoleEnum('role').default('user').notNull(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    isActive: boolean('is_active').default(true),
    emailVerified: boolean('email_verified').default(false),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    tenantEmailIdx: uniqueIndex('users_tenant_email_idx').on(
      table.tenantId,
      table.email,
    ),
    emailIdx: index('users_email_idx').on(table.email),
  }),
);

// ========== REFRESH TOKENS ==========
export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    token: varchar('token', { length: 500 }).notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    tokenIdx: uniqueIndex('refresh_tokens_token_idx').on(table.token),
    userIdx: index('refresh_tokens_user_idx').on(table.userId),
  }),
);

// ========== AUDIT LOGS ==========
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    action: varchar('action', { length: 100 }).notNull(),
    resource: varchar('resource', { length: 100 }).notNull(),
    resourceId: varchar('resource_id', { length: 100 }),
    metadata: jsonb('metadata'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    tenantIdx: index('audit_logs_tenant_idx').on(table.tenantId),
    userIdx: index('audit_logs_user_idx').on(table.userId),
    actionIdx: index('audit_logs_action_idx').on(table.action),
    createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
  }),
);

// ========== CMS: POSTS ==========
export const posts = pgTable(
  'posts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    authorId: uuid('author_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    title: varchar('title', { length: 500 }).notNull(),
    slug: varchar('slug', { length: 500 }).notNull(),
    content: varchar('content', { length: 50000 }),
    excerpt: varchar('excerpt', { length: 1000 }),
    featuredImage: varchar('featured_image', { length: 500 }),
    status: postStatusEnum('status').default('draft').notNull(),
    isPublished: boolean('is_published').default(false).notNull(),
    publishedAt: timestamp('published_at'),
    categoryId: uuid('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    tenantSlugIdx: uniqueIndex('posts_tenant_slug_idx').on(
      table.tenantId,
      table.slug,
    ),
    tenantIdx: index('posts_tenant_idx').on(table.tenantId),
    statusIdx: index('posts_status_idx').on(table.status),
  }),
);

// ========== CMS: PAGES (✅ ERWEITERT) ==========
export const pages = pgTable(
  'pages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    authorId: uuid('author_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    // Content
    title: varchar('title', { length: 500 }).notNull(),
    slug: varchar('slug', { length: 500 }).notNull(),
    content: varchar('content', { length: 50000 }),
    excerpt: varchar('excerpt', { length: 1000 }),
    featuredImage: varchar('featured_image', { length: 500 }),
    metaDescription: varchar('meta_description', { length: 500 }),

    // Template & Status
    template: pageTemplateEnum('template').default('default').notNull(),
    status: postStatusEnum('status').default('draft').notNull(),
    isPublished: boolean('is_published').default(false).notNull(),
    publishedAt: timestamp('published_at'),

    // ✅ NEU: Website Template Tracking
    appliedWebsiteTemplateId: uuid('applied_website_template_id'),
    sourceTemplatePageId: uuid('source_template_page_id'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    tenantSlugIdx: uniqueIndex('pages_tenant_slug_idx').on(
      table.tenantId,
      table.slug,
    ),
    tenantIdx: index('pages_tenant_idx').on(table.tenantId),
    publishedIdx: index('pages_published_idx').on(table.isPublished),
    statusIdx: index('pages_status_idx').on(table.status),
    // ✅ NEU: Indices für Template Tracking
    appliedTemplateIdx: index('pages_applied_template_idx').on(
      table.appliedWebsiteTemplateId,
    ),
    sourceTemplatePageIdx: index('pages_source_template_page_idx').on(
      table.sourceTemplatePageId,
    ),
  }),
);

// ========== SHOP: CATEGORIES ==========
export const categories = pgTable(
  'categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    slug: varchar('slug', { length: 200 }).notNull(),
    description: varchar('description', { length: 1000 }),
    image: varchar('image', { length: 500 }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    tenantSlugIdx: uniqueIndex('categories_tenant_slug_idx').on(
      table.tenantId,
      table.slug,
    ),
    tenantIdx: index('categories_tenant_idx').on(table.tenantId),
  }),
);

// ========== SHOP: PRODUCTS ==========
export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    categoryId: uuid('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),
    name: varchar('name', { length: 500 }).notNull(),
    slug: varchar('slug', { length: 500 }).notNull(),
    description: varchar('description', { length: 5000 }),
    price: integer('price').notNull(),
    compareAtPrice: integer('compare_at_price'),
    stock: integer('stock').default(0).notNull(),
    images: varchar('images', { length: 2000 }),
    isActive: boolean('is_active').default(true).notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    tenantSlugIdx: uniqueIndex('products_tenant_slug_idx').on(
      table.tenantId,
      table.slug,
    ),
    tenantIdx: index('products_tenant_idx').on(table.tenantId),
    categoryIdx: index('products_category_idx').on(table.categoryId),
    featuredIdx: index('products_featured_idx').on(table.isFeatured),
  }),
);

// ========== SHOP: ORDERS ==========
export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    orderNumber: varchar('order_number', { length: 50 }).notNull(),
    customerEmail: varchar('customer_email', { length: 255 }).notNull(),
    customerName: varchar('customer_name', { length: 255 }).notNull(),
    customerAddress: varchar('customer_address', { length: 1000 }),
    status: orderStatusEnum('status').default('pending').notNull(),
    subtotal: integer('subtotal').notNull(),
    tax: integer('tax').default(0).notNull(),
    shipping: integer('shipping').default(0).notNull(),
    total: integer('total').notNull(),
    notes: varchar('notes', { length: 1000 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    tenantIdx: index('orders_tenant_idx').on(table.tenantId),
    orderNumberIdx: uniqueIndex('orders_order_number_idx').on(
      table.orderNumber,
    ),
    statusIdx: index('orders_status_idx').on(table.status),
  }),
);

// ========== SHOP: ORDER ITEMS ==========
export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .references(() => orders.id, { onDelete: 'cascade' })
      .notNull(),
    productId: uuid('product_id').references(() => products.id, {
      onDelete: 'set null',
    }),
    productName: varchar('product_name', { length: 500 }).notNull(),
    productPrice: integer('product_price').notNull(),
    quantity: integer('quantity').notNull(),
    total: integer('total').notNull(),
  },
  (table) => ({
    orderIdx: index('order_items_order_idx').on(table.orderId),
  }),
);

// ==================== EMAIL SYSTEM ====================

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false).notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const emailLogs = pgTable('email_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, {
    onDelete: 'cascade',
  }),
  to: varchar('to', { length: 255 }).notNull(),
  from: varchar('from', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 500 }).notNull(),
  template: varchar('template', { length: 100 }),
  status: varchar('status', { length: 50 }).default('sent').notNull(),
  error: text('error'),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  openedAt: timestamp('opened_at'),
  clickedAt: timestamp('clicked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const emailEvents = pgTable('email_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  emailLogId: uuid('email_log_id')
    .notNull()
    .references(() => emailLogs.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tenantEmailSettings = pgTable(
  'tenant_email_settings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' })
      .unique(),
    provider: emailProviderEnum('provider').default('custom').notNull(),
    smtpHost: varchar('smtp_host', { length: 255 }),
    smtpPort: integer('smtp_port').default(587),
    smtpSecure: boolean('smtp_secure').default(false).notNull(),
    smtpUser: varchar('smtp_user', { length: 255 }),
    smtpPassword: text('smtp_password'),
    fromEmail: varchar('from_email', { length: 255 }).notNull(),
    fromName: varchar('from_name', { length: 255 }),
    replyTo: varchar('reply_to', { length: 255 }),
    isEnabled: boolean('is_enabled').default(false).notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),
    lastTestedAt: timestamp('last_tested_at'),
    lastUsedAt: timestamp('last_used_at'),
    lastError: text('last_error'),
    errorCount: integer('error_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('tenant_email_settings_tenant_idx').on(table.tenantId),
  }),
);

export const tenantEmailTemplates = pgTable(
  'tenant_email_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    subject: varchar('subject', { length: 500 }).notNull(),
    htmlContent: text('html_content').notNull(),
    textContent: text('text_content'),
    variables: jsonb('variables'),
    isActive: boolean('is_active').default(true).notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantNameIdx: uniqueIndex('tenant_email_templates_tenant_name_idx').on(
      table.tenantId,
      table.name,
    ),
  }),
);

// ==================== NEWSLETTER SYSTEM ====================

export const newsletterSubscribers = pgTable(
  'newsletter_subscribers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    status: subscriberStatusEnum('status').default('pending').notNull(),
    tags: text('tags').array().default([]),
    customFields: jsonb('custom_fields'),
    source: varchar('source', { length: 100 }),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    subscribedAt: timestamp('subscribed_at'),
    confirmedAt: timestamp('confirmed_at'),
    unsubscribedAt: timestamp('unsubscribed_at'),
    bouncedAt: timestamp('bounced_at'),
    unsubscribeToken: varchar('unsubscribe_token', { length: 255 }).unique(),
    confirmToken: varchar('confirm_token', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantEmailIdx: uniqueIndex('newsletter_subscribers_tenant_email_idx').on(
      table.tenantId,
      table.email,
    ),
    statusIdx: index('newsletter_subscribers_status_idx').on(table.status),
    tagsIdx: index('newsletter_subscribers_tags_idx').on(table.tags),
  }),
);

export const newsletterCampaigns = pgTable(
  'newsletter_campaigns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    subject: varchar('subject', { length: 500 }).notNull(),
    previewText: varchar('preview_text', { length: 255 }),
    fromName: varchar('from_name', { length: 255 }),
    fromEmail: varchar('from_email', { length: 255 }),
    replyTo: varchar('reply_to', { length: 255 }),
    htmlContent: text('html_content').notNull(),
    plainTextContent: text('plain_text_content'),
    status: campaignStatusEnum('status').default('draft').notNull(),
    scheduledAt: timestamp('scheduled_at'),
    sendAt: timestamp('send_at'),
    completedAt: timestamp('completed_at'),
    filterTags: text('filter_tags').array(),
    excludeTags: text('exclude_tags').array(),
    totalRecipients: integer('total_recipients').default(0).notNull(),
    sentCount: integer('sent_count').default(0).notNull(),
    deliveredCount: integer('delivered_count').default(0).notNull(),
    openedCount: integer('opened_count').default(0).notNull(),
    clickedCount: integer('clicked_count').default(0).notNull(),
    bouncedCount: integer('bounced_count').default(0).notNull(),
    unsubscribedCount: integer('unsubscribed_count').default(0).notNull(),
    complainedCount: integer('complained_count').default(0).notNull(),
    lastError: text('last_error'),
    errorCount: integer('error_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('newsletter_campaigns_tenant_idx').on(table.tenantId),
    statusIdx: index('newsletter_campaigns_status_idx').on(table.status),
    scheduledIdx: index('newsletter_campaigns_scheduled_idx').on(
      table.scheduledAt,
    ),
  }),
);

export const campaignEvents = pgTable(
  'campaign_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => newsletterCampaigns.id, { onDelete: 'cascade' }),
    subscriberId: uuid('subscriber_id')
      .notNull()
      .references(() => newsletterSubscribers.id, { onDelete: 'cascade' }),
    eventType: campaignEventTypeEnum('event_type').notNull(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    clickedUrl: text('clicked_url'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    campaignIdx: index('campaign_events_campaign_idx').on(table.campaignId),
    subscriberIdx: index('campaign_events_subscriber_idx').on(
      table.subscriberId,
    ),
    eventTypeIdx: index('campaign_events_event_type_idx').on(table.eventType),
  }),
);

export const campaignQueue = pgTable(
  'campaign_queue',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => newsletterCampaigns.id, { onDelete: 'cascade' }),
    subscriberId: uuid('subscriber_id')
      .notNull()
      .references(() => newsletterSubscribers.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 50 }).default('pending').notNull(),
    attempts: integer('attempts').default(0).notNull(),
    lastAttemptAt: timestamp('last_attempt_at'),
    error: text('error'),
    scheduledFor: timestamp('scheduled_for').notNull(),
    sentAt: timestamp('sent_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    campaignSubscriberIdx: uniqueIndex(
      'campaign_queue_campaign_subscriber_idx',
    ).on(table.campaignId, table.subscriberId),
    statusIdx: index('campaign_queue_status_idx').on(table.status),
    scheduledIdx: index('campaign_queue_scheduled_idx').on(table.scheduledFor),
  }),
);

// ==================== MEDIA LIBRARY ====================

export const mediaFiles = pgTable(
  'media_files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    filename: varchar('filename', { length: 255 }).notNull(),
    originalFilename: varchar('original_filename', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    fileSize: integer('file_size').notNull(),
    type: mediaTypeEnum('type').notNull(),
    url: text('url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    path: text('path').notNull(),
    width: integer('width'),
    height: integer('height'),
    duration: integer('duration'),
    alt: text('alt'),
    title: varchar('title', { length: 255 }),
    description: text('description'),
    folder: varchar('folder', { length: 255 }),
    tags: text('tags').array().default([]),
    uploadedBy: uuid('uploaded_by').references(() => users.id),
    usageCount: integer('usage_count').default(0).notNull(),
    lastUsedAt: timestamp('last_used_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('media_files_tenant_idx').on(table.tenantId),
    typeIdx: index('media_files_type_idx').on(table.type),
    folderIdx: index('media_files_folder_idx').on(table.folder),
  }),
);

// ==================== NAVIGATION SYSTEM ====================

export const navigations = pgTable(
  'navigations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    location: varchar('location', { length: 100 }).notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantLocationIdx: uniqueIndex('navigations_tenant_location_idx').on(
      table.tenantId,
      table.location,
    ),
    tenantIdx: index('navigations_tenant_idx').on(table.tenantId),
  }),
);

export const navigationItems = pgTable(
  'navigation_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    navigationId: uuid('navigation_id')
      .notNull()
      .references(() => navigations.id, { onDelete: 'cascade' }),
    label: varchar('label', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    url: text('url'),
    pageId: uuid('page_id').references(() => pages.id, {
      onDelete: 'set null',
    }),
    postId: uuid('post_id').references(() => posts.id, {
      onDelete: 'set null',
    }),
    categoryId: uuid('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),
    icon: varchar('icon', { length: 100 }),
    cssClass: varchar('css_class', { length: 255 }),
    openInNewTab: boolean('open_in_new_tab').default(false).notNull(),
    order: integer('order').default(0).notNull(),
    parentId: uuid('parent_id').references(() => navigationItems.id, {
      onDelete: 'cascade',
    }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    navigationIdx: index('navigation_items_navigation_idx').on(
      table.navigationId,
    ),
    parentIdx: index('navigation_items_parent_idx').on(table.parentId),
    orderIdx: index('navigation_items_order_idx').on(table.order),
  }),
);

// ==================== SEO ====================

export const seoMeta = pgTable(
  'seo_meta',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    entityId: uuid('entity_id').notNull(),
    metaTitle: varchar('meta_title', { length: 255 }),
    metaDescription: text('meta_description'),
    metaKeywords: text('meta_keywords'),
    ogTitle: varchar('og_title', { length: 255 }),
    ogDescription: text('og_description'),
    ogImage: text('og_image'),
    canonicalUrl: text('canonical_url'),
    noindex: boolean('noindex').default(false).notNull(),
    nofollow: boolean('nofollow').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    entityIdx: uniqueIndex('seo_meta_entity_idx').on(
      table.entityType,
      table.entityId,
    ),
  }),
);

// ==================== OLD TEMPLATE SYSTEM (Bestehend - NICHT LÖSCHEN!) ====================

export const templates = pgTable(
  'templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id, {
      onDelete: 'cascade',
    }),
    name: varchar('name', { length: 255 }).notNull(),
    category: templateCategoryEnum('category').notNull(),
    description: text('description'),
    thumbnail: text('thumbnail'),
    isPreset: boolean('is_preset').default(false).notNull(),
    isPublic: boolean('is_public').default(false).notNull(),
    settings: jsonb('settings')
      .$type<{
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
      }>()
      .default({}),
    createdBy: uuid('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('templates_tenant_idx').on(table.tenantId),
    categoryIdx: index('templates_category_idx').on(table.category),
    presetIdx: index('templates_preset_idx').on(table.isPreset),
  }),
);

export const sections = pgTable(
  'sections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id, {
      onDelete: 'cascade',
    }),
    name: varchar('name', { length: 255 }).notNull(),
    type: sectionTypeEnum('type').notNull(),
    component: varchar('component', { length: 100 }).notNull(),
    description: text('description'),
    config: jsonb('config').$type<Record<string, any>>().default({}),
    isPreset: boolean('is_preset').default(false).notNull(),
    isPublic: boolean('is_public').default(false).notNull(),
    thumbnail: text('thumbnail'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('sections_tenant_idx').on(table.tenantId),
    typeIdx: index('sections_type_idx').on(table.type),
    presetIdx: index('sections_preset_idx').on(table.isPreset),
  }),
);

export const templateSections = pgTable(
  'template_sections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    templateId: uuid('template_id')
      .notNull()
      .references(() => templates.id, { onDelete: 'cascade' }),
    sectionId: uuid('section_id')
      .notNull()
      .references(() => sections.id, { onDelete: 'cascade' }),
    orderIndex: integer('order_index').notNull(),
    overrideConfig: jsonb('override_config')
      .$type<Record<string, any>>()
      .default({}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    templateIdx: index('template_sections_template_idx').on(table.templateId),
    sectionIdx: index('template_sections_section_idx').on(table.sectionId),
    orderIdx: index('template_sections_order_idx').on(table.orderIndex),
  }),
);

// ==================== ✅ NEW WEBSITE TEMPLATE SYSTEM ====================

// Website Templates = Komplette Websites
export const websiteTemplates = pgTable(
  'website_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id, {
      onDelete: 'cascade',
    }),

    // Template Info
    name: varchar('name', { length: 255 }).notNull(),
    category: websiteTemplateCategoryEnum('category').notNull(),
    description: text('description'),
    thumbnail: text('thumbnail'),

    // Preset & Visibility
    isPreset: boolean('is_preset').default(false).notNull(),
    isPublic: boolean('is_public').default(false).notNull(),

    // Global Settings
    settings: jsonb('settings')
      .$type<{
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
        logo?: string;
        favicon?: string;
      }>()
      .default({}),

    createdBy: uuid('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('website_templates_tenant_idx').on(table.tenantId),
    categoryIdx: index('website_templates_category_idx').on(table.category),
    presetIdx: index('website_templates_preset_idx').on(table.isPreset),
  }),
);

// Website Template Pages = Pages im Template
export const websiteTemplatePages = pgTable(
  'website_template_pages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    templateId: uuid('template_id')
      .notNull()
      .references(() => websiteTemplates.id, { onDelete: 'cascade' }),

    // Page Info
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),

    // Order
    orderIndex: integer('order_index').default(0).notNull(),

    // Page Settings
    settings: jsonb('settings')
      .$type<{
        showInNav?: boolean;
        navLabel?: string;
        seo?: {
          metaTitle?: string;
          metaDescription?: string;
        };
      }>()
      .default({}),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    templateIdx: index('website_template_pages_template_idx').on(
      table.templateId,
    ),
    templateSlugIdx: uniqueIndex('website_template_pages_template_slug_idx').on(
      table.templateId,
      table.slug,
    ),
    orderIdx: index('website_template_pages_order_idx').on(table.orderIndex),
  }),
);

// Website Template Page Sections = Sections pro Template-Page
export const websiteTemplatePageSections = pgTable(
  'website_template_page_sections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    templatePageId: uuid('template_page_id')
      .notNull()
      .references(() => websiteTemplatePages.id, { onDelete: 'cascade' }),
    sectionId: uuid('section_id')
      .notNull()
      .references(() => sections.id, { onDelete: 'cascade' }),

    // Order & Config
    orderIndex: integer('order_index').default(0).notNull(),
    config: jsonb('config').$type<Record<string, any>>().default({}),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    templatePageIdx: index('website_template_page_sections_page_idx').on(
      table.templatePageId,
    ),
    sectionIdx: index('website_template_page_sections_section_idx').on(
      table.sectionId,
    ),
    orderIdx: index('website_template_page_sections_order_idx').on(
      table.orderIndex,
    ),
  }),
);

// Page Sections = Sections in echten Pages (nach Apply)
export const pageSections = pgTable(
  'page_sections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pageId: uuid('page_id')
      .notNull()
      .references(() => pages.id, { onDelete: 'cascade' }),
    sectionId: uuid('section_id')
      .notNull()
      .references(() => sections.id, { onDelete: 'cascade' }),

    // Order & Config
    orderIndex: integer('order_index').default(0).notNull(),
    overrideConfig: jsonb('override_config')
      .$type<Record<string, any>>()
      .default({}),

    // Optional: Tracking
    sourceTemplatePageId: uuid('source_template_page_id').references(
      () => websiteTemplatePages.id,
      { onDelete: 'set null' },
    ),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    pageIdx: index('page_sections_page_idx').on(table.pageId),
    sectionIdx: index('page_sections_section_idx').on(table.sectionId),
    orderIdx: index('page_sections_order_idx').on(table.orderIndex),
    sourcePageIdx: index('page_sections_source_page_idx').on(
      table.sourceTemplatePageId,
    ),
  }),
);

// ==================== RELATIONS ====================

// Old Template System Relations (Bestehend)
export const templatesRelations = relations(templates, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [templates.tenantId],
    references: [tenants.id],
  }),
  createdByUser: one(users, {
    fields: [templates.createdBy],
    references: [users.id],
  }),
  templateSections: many(templateSections),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [sections.tenantId],
    references: [tenants.id],
  }),
  templateSections: many(templateSections),
  websiteTemplatePageSections: many(websiteTemplatePageSections),
  pageSections: many(pageSections),
}));

export const templateSectionsRelations = relations(
  templateSections,
  ({ one }) => ({
    template: one(templates, {
      fields: [templateSections.templateId],
      references: [templates.id],
    }),
    section: one(sections, {
      fields: [templateSections.sectionId],
      references: [sections.id],
    }),
  }),
);

// Navigation Relations
export const navigationsRelations = relations(navigations, ({ many, one }) => ({
  tenant: one(tenants, {
    fields: [navigations.tenantId],
    references: [tenants.id],
  }),
  items: many(navigationItems),
}));

export const navigationItemsRelations = relations(
  navigationItems,
  ({ one, many }) => ({
    navigation: one(navigations, {
      fields: [navigationItems.navigationId],
      references: [navigations.id],
    }),
    parent: one(navigationItems, {
      fields: [navigationItems.parentId],
      references: [navigationItems.id],
      relationName: 'children',
    }),
    children: many(navigationItems, {
      relationName: 'children',
    }),
    page: one(pages, {
      fields: [navigationItems.pageId],
      references: [pages.id],
    }),
    post: one(posts, {
      fields: [navigationItems.postId],
      references: [posts.id],
    }),
    category: one(categories, {
      fields: [navigationItems.categoryId],
      references: [categories.id],
    }),
  }),
);

// ✅ NEW Website Template Relations
export const websiteTemplatesRelations = relations(
  websiteTemplates,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [websiteTemplates.tenantId],
      references: [tenants.id],
    }),
    createdByUser: one(users, {
      fields: [websiteTemplates.createdBy],
      references: [users.id],
    }),
    pages: many(websiteTemplatePages),
  }),
);

export const websiteTemplatePagesRelations = relations(
  websiteTemplatePages,
  ({ one, many }) => ({
    template: one(websiteTemplates, {
      fields: [websiteTemplatePages.templateId],
      references: [websiteTemplates.id],
    }),
    sections: many(websiteTemplatePageSections),
  }),
);

export const websiteTemplatePageSectionsRelations = relations(
  websiteTemplatePageSections,
  ({ one }) => ({
    templatePage: one(websiteTemplatePages, {
      fields: [websiteTemplatePageSections.templatePageId],
      references: [websiteTemplatePages.id],
    }),
    section: one(sections, {
      fields: [websiteTemplatePageSections.sectionId],
      references: [sections.id],
    }),
  }),
);

export const pageSectionsRelations = relations(pageSections, ({ one }) => ({
  page: one(pages, {
    fields: [pageSections.pageId],
    references: [pages.id],
  }),
  section: one(sections, {
    fields: [pageSections.sectionId],
    references: [sections.id],
  }),
  sourceTemplatePage: one(websiteTemplatePages, {
    fields: [pageSections.sourceTemplatePageId],
    references: [websiteTemplatePages.id],
  }),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [pages.tenantId],
    references: [tenants.id],
  }),
  author: one(users, {
    fields: [pages.authorId],
    references: [users.id],
  }),
  appliedWebsiteTemplate: one(websiteTemplates, {
    fields: [pages.appliedWebsiteTemplateId],
    references: [websiteTemplates.id],
  }),
  sourceTemplatePage: one(websiteTemplatePages, {
    fields: [pages.sourceTemplatePageId],
    references: [websiteTemplatePages.id],
  }),
  pageSections: many(pageSections),
}));
