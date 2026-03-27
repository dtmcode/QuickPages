/**
 * ==================== DRIZZLE CORE SCHEMA ====================
 * Bereinigtes Schema OHNE altes Template-System
 */

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
  'page',
  'creator',
  'shop',
  'professional',
  'landing',
]);
export const shopTemplateEnum = pgEnum('shop_template', [
  'default',
  'minimalist',
  'fashion',
  'tech',
]);

export const addonTypeEnum = pgEnum('addon_type', [
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
    branding: jsonb('branding').default({}),
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

// ========== CMS: PAGES (BEREINIGT - Website Builder Felder entfernt) ==========
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
// ==================== EMAIL VERIFICATION TOKENS ====================

export const emailVerificationTokens = pgTable('email_verification_tokens', {
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

// ==================== SUPPORT TICKETS ====================

export const supportTickets = pgTable(
  'support_tickets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    ticketNumber: varchar('ticket_number', { length: 20 }).notNull().unique(),
    subject: varchar('subject', { length: 500 }).notNull(),
    status: varchar('status', { length: 50 }).notNull().default('open'),
    priority: varchar('priority', { length: 50 }).notNull().default('normal'),
    customerName: varchar('customer_name', { length: 255 }).notNull(),
    customerEmail: varchar('customer_email', { length: 255 }).notNull(),
    assignedTo: uuid('assigned_to').references(() => users.id, {
      onDelete: 'set null',
    }),
    tags: text('tags').array().default([]),
    token: varchar('token', { length: 255 }).notNull().unique(),
    resolvedAt: timestamp('resolved_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('support_tickets_tenant_idx').on(table.tenantId),
    statusIdx: index('support_tickets_status_idx').on(table.status),
    tokenIdx: index('support_tickets_token_idx').on(table.token),
  }),
);

export const supportMessages = pgTable(
  'support_messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    ticketId: uuid('ticket_id')
      .notNull()
      .references(() => supportTickets.id, { onDelete: 'cascade' }),
    authorName: varchar('author_name', { length: 255 }).notNull(),
    authorEmail: varchar('author_email', { length: 255 }).notNull(),
    content: text('content').notNull(),
    isStaff: boolean('is_staff').default(false).notNull(),
    isInternal: boolean('is_internal').default(false).notNull(),
    attachments: jsonb('attachments').default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    ticketIdx: index('support_messages_ticket_idx').on(table.ticketId),
  }),
);
// ==================== RELATIONS ====================

export const tenantsRelations = relations(tenants, ({ many, one }) => ({
  subscriptions: many(subscriptions),
  addons: many(tenantAddons),
  users: many(users),
  posts: many(posts),
  pages: many(pages),
  categories: many(categories),
  products: many(products),
  orders: many(orders),
  navigations: many(navigations),
  mediaFiles: many(mediaFiles),
  emailSettings: one(tenantEmailSettings),
  emailTemplates: many(tenantEmailTemplates),
  newsletterSubscribers: many(newsletterSubscribers),
  newsletterCampaigns: many(newsletterCampaigns),
  emailLogs: many(emailLogs),
  usageTracking: many(usageTracking),
  auditLogs: many(auditLogs),
  supportTickets: many(supportTickets),
  customers: many(tenantCustomers),
 paymentSettings: one(tenantPaymentSettings),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  posts: many(posts),
  pages: many(pages),
  refreshTokens: many(refreshTokens),
  passwordResetTokens: many(passwordResetTokens),
  emailVerificationTokens: many(emailVerificationTokens),
  auditLogs: many(auditLogs),
  uploadedMedia: many(mediaFiles),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [subscriptions.tenantId],
    references: [tenants.id],
  }),
}));

export const tenantAddonsRelations = relations(tenantAddons, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantAddons.tenantId],
    references: [tenants.id],
  }),
}));

export const usageTrackingRelations = relations(usageTracking, ({ one }) => ({
  tenant: one(tenants, {
    fields: [usageTracking.tenantId],
    references: [tenants.id],
  }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(
  passwordResetTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResetTokens.userId],
      references: [users.id],
    }),
  }),
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [auditLogs.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  tenant: one(tenants, {
    fields: [posts.tenantId],
    references: [tenants.id],
  }),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
}));

export const pagesRelations = relations(pages, ({ one }) => ({
  tenant: one(tenants, {
    fields: [pages.tenantId],
    references: [tenants.id],
  }),
  author: one(users, {
    fields: [pages.authorId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [categories.tenantId],
    references: [tenants.id],
  }),
  products: many(products),
  posts: many(posts),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [products.tenantId],
    references: [tenants.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [orders.tenantId],
    references: [tenants.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const emailLogsRelations = relations(emailLogs, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [emailLogs.tenantId],
    references: [tenants.id],
  }),
  events: many(emailEvents),
}));

export const emailEventsRelations = relations(emailEvents, ({ one }) => ({
  emailLog: one(emailLogs, {
    fields: [emailEvents.emailLogId],
    references: [emailLogs.id],
  }),
}));

export const tenantEmailSettingsRelations = relations(
  tenantEmailSettings,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [tenantEmailSettings.tenantId],
      references: [tenants.id],
    }),
  }),
);

export const tenantEmailTemplatesRelations = relations(
  tenantEmailTemplates,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [tenantEmailTemplates.tenantId],
      references: [tenants.id],
    }),
  }),
);

export const newsletterSubscribersRelations = relations(
  newsletterSubscribers,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [newsletterSubscribers.tenantId],
      references: [tenants.id],
    }),
    campaignEvents: many(campaignEvents),
    campaignQueue: many(campaignQueue),
  }),
);

export const newsletterCampaignsRelations = relations(
  newsletterCampaigns,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [newsletterCampaigns.tenantId],
      references: [tenants.id],
    }),
    events: many(campaignEvents),
    queue: many(campaignQueue),
  }),
);

export const campaignEventsRelations = relations(campaignEvents, ({ one }) => ({
  campaign: one(newsletterCampaigns, {
    fields: [campaignEvents.campaignId],
    references: [newsletterCampaigns.id],
  }),
  subscriber: one(newsletterSubscribers, {
    fields: [campaignEvents.subscriberId],
    references: [newsletterSubscribers.id],
  }),
}));

export const campaignQueueRelations = relations(campaignQueue, ({ one }) => ({
  campaign: one(newsletterCampaigns, {
    fields: [campaignQueue.campaignId],
    references: [newsletterCampaigns.id],
  }),
  subscriber: one(newsletterSubscribers, {
    fields: [campaignQueue.subscriberId],
    references: [newsletterSubscribers.id],
  }),
}));

export const mediaFilesRelations = relations(mediaFiles, ({ one }) => ({
  tenant: one(tenants, {
    fields: [mediaFiles.tenantId],
    references: [tenants.id],
  }),
  uploader: one(users, {
    fields: [mediaFiles.uploadedBy],
    references: [users.id],
  }),
}));

export const navigationsRelations = relations(navigations, ({ one, many }) => ({
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
export const supportTicketsRelations = relations(
  supportTickets,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [supportTickets.tenantId],
      references: [tenants.id],
    }),
    assignedUser: one(users, {
      fields: [supportTickets.assignedTo],
      references: [users.id],
    }),
    messages: many(supportMessages),
  }),
);

export const supportMessagesRelations = relations(
  supportMessages,
  ({ one }) => ({
    ticket: one(supportTickets, {
      fields: [supportMessages.ticketId],
      references: [supportTickets.id],
    }),
  }),
);
// ==================== TENANT CUSTOMERS (Public Member Area) ====================
 
export const tenantCustomers = pgTable(
  'tenant_customers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    isActive: boolean('is_active').default(true).notNull(),
    isMember: boolean('is_member').default(false).notNull(),
    memberSince: timestamp('member_since'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantEmailIdx: uniqueIndex('tenant_customers_tenant_email_idx').on(
      table.tenantId,
      table.email,
    ),
    tenantIdx: index('tenant_customers_tenant_idx').on(table.tenantId),
  }),
);
 
// ==================== TENANT PAYMENT SETTINGS ====================
 
export const tenantPaymentSettings = pgTable('tenant_payment_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' })
    .unique(),
  // Stripe
  stripePublishableKey: varchar('stripe_publishable_key', { length: 500 }),
  stripeSecretKeyEncrypted: text('stripe_secret_key_encrypted'),
  stripeWebhookSecretEncrypted: text('stripe_webhook_secret_encrypted'),
  stripeMode: varchar('stripe_mode', { length: 10 }).default('test'),
  stripeActive: boolean('stripe_active').default(false),
  // PayPal
  paypalClientId: varchar('paypal_client_id', { length: 500 }),
  paypalSecretEncrypted: text('paypal_secret_encrypted'),
  paypalMode: varchar('paypal_mode', { length: 10 }).default('sandbox'),
  paypalActive: boolean('paypal_active').default(false),
  // Bank Transfer
  bankActive: boolean('bank_active').default(false),
  bankIban: varchar('bank_iban', { length: 50 }),
  bankBic: varchar('bank_bic', { length: 20 }),
  bankAccountHolder: varchar('bank_account_holder', { length: 255 }),
  bankName: varchar('bank_name', { length: 255 }),
  bankReference: varchar('bank_reference', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});