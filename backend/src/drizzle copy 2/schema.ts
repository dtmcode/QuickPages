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
  'shop_business', // 1.000 Produkte
  'shop_pro', // unbegrenzt
  'email_starter', // 10.000 Emails/Monat
  'email_business', // 100.000 Emails/Monat
  'extra_users', // +5 Users pro Add-on
]);

// NEU: Subscription Status
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
    activeTemplateId: uuid('active_template_id'), // ← HINZUFÜGEN!
    templateCustomizations: jsonb('template_customizations').default({}), // ← HINZUFÜGEN!

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('tenants_slug_idx').on(table.slug),
    domainIdx: index('tenants_domain_idx').on(table.domain),
  }),
);

// ========== NEU: SUBSCRIPTIONS ==========
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

// ========== NEU: TENANT ADD-ONS ==========
export const tenantAddons = pgTable(
  'tenant_addons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    addonType: addonTypeEnum('addon_type').notNull(),
    quantity: integer('quantity').default(1).notNull(), // für extra_users
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

// ========== NEU: USAGE TRACKING ==========
export const usageTracking = pgTable(
  'usage_tracking',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    month: varchar('month', { length: 7 }).notNull(), // Format: YYYY-MM
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

    // Content
    title: varchar('title', { length: 500 }).notNull(),
    slug: varchar('slug', { length: 500 }).notNull(),
    content: varchar('content', { length: 50000 }),
    excerpt: varchar('excerpt', { length: 1000 }),
    featuredImage: varchar('featured_image', { length: 500 }),

    // Status
    status: postStatusEnum('status').default('draft').notNull(),
    isPublished: boolean('is_published').default(false).notNull(),
    publishedAt: timestamp('published_at'),

    // Category (optional - falls du später Categories für Posts willst)
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

// ========== CMS: PAGES ==========
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
    status: postStatusEnum('status').default('draft').notNull(), // Reuse postStatusEnum
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
    price: integer('price').notNull(), // in cents
    compareAtPrice: integer('compare_at_price'), // in cents
    stock: integer('stock').default(0).notNull(),
    images: varchar('images', { length: 2000 }), // JSON array of image URLs
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
    subtotal: integer('subtotal').notNull(), // in cents
    tax: integer('tax').default(0).notNull(), // in cents
    shipping: integer('shipping').default(0).notNull(), // in cents
    total: integer('total').notNull(), // in cents
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
    productPrice: integer('product_price').notNull(), // in cents
    quantity: integer('quantity').notNull(),
    total: integer('total').notNull(), // in cents
  },
  (table) => ({
    orderIdx: index('order_items_order_idx').on(table.orderId),
  }),
);
// ==================== EMAIL SYSTEM ====================

// Password Reset Tokens
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

// Email Logs (optional - für Tracking)
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

// Email Events (optional - detailliertes Tracking)
export const emailEvents = pgTable('email_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  emailLogId: uuid('email_log_id')
    .notNull()
    .references(() => emailLogs.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================== MULTI-TENANT EMAIL SETTINGS ====================

// Email Provider Enum
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

// Tenant Email Settings
export const tenantEmailSettings = pgTable(
  'tenant_email_settings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' })
      .unique(),

    // Provider Info
    provider: emailProviderEnum('provider').default('custom').notNull(),

    // SMTP Settings
    smtpHost: varchar('smtp_host', { length: 255 }),
    smtpPort: integer('smtp_port').default(587),
    smtpSecure: boolean('smtp_secure').default(false).notNull(),
    smtpUser: varchar('smtp_user', { length: 255 }),
    smtpPassword: text('smtp_password'),

    // From Settings
    fromEmail: varchar('from_email', { length: 255 }).notNull(),
    fromName: varchar('from_name', { length: 255 }),
    replyTo: varchar('reply_to', { length: 255 }),

    // Status
    isEnabled: boolean('is_enabled').default(false).notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),
    lastTestedAt: timestamp('last_tested_at'),
    lastUsedAt: timestamp('last_used_at'),

    // Error Tracking
    lastError: text('last_error'),
    errorCount: integer('error_count').default(0).notNull(),

    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('tenant_email_settings_tenant_idx').on(table.tenantId),
  }),
);

// Email Templates (Optional - Custom Templates pro Tenant)
export const tenantEmailTemplates = pgTable(
  'tenant_email_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // Template Info
    name: varchar('name', { length: 100 }).notNull(),
    subject: varchar('subject', { length: 500 }).notNull(),
    htmlContent: text('html_content').notNull(),
    textContent: text('text_content'),

    // Variables
    variables: jsonb('variables'),

    // Status
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

// Newsletter Status Enums
export const subscriberStatusEnum = pgEnum('subscriber_status', [
  'pending', // Wartet auf Bestätigung (Double Opt-In)
  'active', // Aktiv - empfängt Newsletter
  'unsubscribed', // Abgemeldet
  'bounced', // Email bounce
  'complained', // Spam-Beschwerde
]);

export const campaignStatusEnum = pgEnum('campaign_status', [
  'draft', // Entwurf
  'scheduled', // Geplant
  'sending', // Wird versendet
  'sent', // Versendet
  'paused', // Pausiert
  'failed', // Fehlgeschlagen
]);

export const campaignEventTypeEnum = pgEnum('campaign_event_type', [
  'sent', // Email versendet
  'delivered', // Zugestellt
  'opened', // Geöffnet
  'clicked', // Link geklickt
  'bounced', // Bounce
  'unsubscribed', // Abgemeldet
  'complained', // Spam-Beschwerde
]);

// Newsletter Subscribers
export const newsletterSubscribers = pgTable(
  'newsletter_subscribers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // Subscriber Info
    email: varchar('email', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),

    // Status & Tags
    status: subscriberStatusEnum('status').default('pending').notNull(),
    tags: text('tags').array().default([]), // ['customer', 'vip', 'lead']

    // Custom Fields (JSON)
    customFields: jsonb('custom_fields'), // { "company": "Acme", "phone": "+49..." }

    // Opt-In Tracking
    source: varchar('source', { length: 100 }), // 'website', 'import', 'api'
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),

    // Timestamps
    subscribedAt: timestamp('subscribed_at'),
    confirmedAt: timestamp('confirmed_at'),
    unsubscribedAt: timestamp('unsubscribed_at'),
    bouncedAt: timestamp('bounced_at'),

    // Token for unsubscribe/confirm
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

// Newsletter Campaigns
export const newsletterCampaigns = pgTable(
  'newsletter_campaigns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // Campaign Info
    name: varchar('name', { length: 255 }).notNull(),
    subject: varchar('subject', { length: 500 }).notNull(),
    previewText: varchar('preview_text', { length: 255 }), // Email preview text

    // Sender Info
    fromName: varchar('from_name', { length: 255 }),
    fromEmail: varchar('from_email', { length: 255 }),
    replyTo: varchar('reply_to', { length: 255 }),

    // Content
    htmlContent: text('html_content').notNull(),
    plainTextContent: text('plain_text_content'),

    // Status
    status: campaignStatusEnum('status').default('draft').notNull(),

    // Scheduling
    scheduledAt: timestamp('scheduled_at'),
    sendAt: timestamp('send_at'), // Actual send time
    completedAt: timestamp('completed_at'),

    // Targeting
    filterTags: text('filter_tags').array(), // Send only to subscribers with these tags
    excludeTags: text('exclude_tags').array(), // Exclude subscribers with these tags

    // Statistics
    totalRecipients: integer('total_recipients').default(0).notNull(),
    sentCount: integer('sent_count').default(0).notNull(),
    deliveredCount: integer('delivered_count').default(0).notNull(),
    openedCount: integer('opened_count').default(0).notNull(),
    clickedCount: integer('clicked_count').default(0).notNull(),
    bouncedCount: integer('bounced_count').default(0).notNull(),
    unsubscribedCount: integer('unsubscribed_count').default(0).notNull(),
    complainedCount: integer('complained_count').default(0).notNull(),

    // Error Tracking
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

// Campaign Events (Analytics)
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

    // Event Info
    eventType: campaignEventTypeEnum('event_type').notNull(),

    // Tracking Data
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    clickedUrl: text('clicked_url'), // For click events

    // Metadata
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

// Campaign Queue (für Bulk Sending)
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

    // Status
    status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, sending, sent, failed

    // Error Tracking
    attempts: integer('attempts').default(0).notNull(),
    lastAttemptAt: timestamp('last_attempt_at'),
    error: text('error'),

    // Timestamps
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

export const mediaTypeEnum = pgEnum('media_type', [
  'image',
  'video',
  'audio',
  'document',
  'other',
]);

// Media Files
export const mediaFiles = pgTable(
  'media_files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // File Info
    filename: varchar('filename', { length: 255 }).notNull(),
    originalFilename: varchar('original_filename', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    fileSize: integer('file_size').notNull(), // in bytes
    type: mediaTypeEnum('type').notNull(),

    // Storage
    url: text('url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    path: text('path').notNull(),

    // Metadata
    width: integer('width'),
    height: integer('height'),
    duration: integer('duration'), // for video/audio
    alt: text('alt'),
    title: varchar('title', { length: 255 }),
    description: text('description'),

    // Organization
    folder: varchar('folder', { length: 255 }),
    tags: text('tags').array().default([]),

    // Tracking
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

// ==================== CMS ENHANCEMENTS ====================

// Navigation Menus
export const navigationMenus = pgTable(
  'navigation_menus',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    name: varchar('name', { length: 255 }).notNull(),
    location: varchar('location', { length: 100 }).notNull(), // 'header', 'footer', 'sidebar'
    items: jsonb('items').notNull().default([]), // Array of menu items

    isActive: boolean('is_active').default(true).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantLocationIdx: uniqueIndex('navigation_menus_tenant_location_idx').on(
      table.tenantId,
      table.location,
    ),
  }),
);

// SEO Settings (pro Page/Post)
export const seoMeta = pgTable(
  'seo_meta',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // Reference
    entityType: varchar('entity_type', { length: 50 }).notNull(), // 'page', 'post', 'product'
    entityId: uuid('entity_id').notNull(),

    // SEO Fields
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
// ==================== NAVIGATION SYSTEM (erweitert) ====================

export const navigations = pgTable(
  'navigations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    name: varchar('name', { length: 255 }).notNull(),
    location: varchar('location', { length: 100 }).notNull(), // 'header', 'footer', 'sidebar', 'mobile'
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

    // Item Info
    label: varchar('label', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // 'page', 'post', 'custom', 'category', 'external'

    // Links
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

    // Styling
    icon: varchar('icon', { length: 100 }),
    cssClass: varchar('css_class', { length: 255 }),

    // Behavior
    openInNewTab: boolean('open_in_new_tab').default(false).notNull(),
    order: integer('order').default(0).notNull(),

    // Hierarchy (nested menus)
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
// ==================== TEMPLATE SYSTEM ====================

// Template Category Enum
export const templateCategoryEnum = pgEnum('template_category', [
  'business',
  'shop',
  'blog',
  'landing',
  'portfolio',
  'custom',
]);

// Section Type Enum
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

// Templates Table
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

// Sections Table
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

// Template Sections Junction
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

// ==================== RELATIONS ====================

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
