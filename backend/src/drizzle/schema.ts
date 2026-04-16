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

export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'user']);

// ========== ENUMS ==========

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
  'shop_extra',
  'booking_module',
  'blog_module',
  'newsletter',
  'newsletter_extra',
  'booking',
  'ai_content',
  'form_builder',
  'i18n',
  'extra_products',
  'extra_ai_credits',
  'extra_pages',
  'members_module',
  'custom_domain',
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
    customDomain: varchar('custom_domain', { length: 255 }),
    domainVerified: boolean('domain_verified').default(false),
    domainVerificationToken: varchar('domain_verification_token', {
      length: 100,
    }),
    domainVerifiedAt: timestamp('domain_verified_at'),
    dnsRecordsValid: boolean('dns_records_valid').default(false),
    sslStatus: varchar('ssl_status', { length: 20 }).default('none'),
    sslExpiresAt: timestamp('ssl_expires_at'),
    lastDnsCheck: timestamp('last_dns_check'),
    defaultLocale: varchar('default_locale', { length: 10 }).default('de'),
    enabledLocales: text('enabled_locales').array().default(['de']),
    package: varchar('package', { length: 50 })
      .default('website_micro')
      .notNull(),
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
export const domainEvents = pgTable('domain_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .references(() => tenants.id, { onDelete: 'cascade' })
    .notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  domain: varchar('domain', { length: 255 }),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
});
// ========== SUBSCRIPTIONS ==========
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    package: varchar('package', { length: 50 }).notNull(),
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
     hasVariants: boolean('has_variants').default(false).notNull(),
   sku: varchar('sku', { length: 100 }),
   weight: integer('weight'),
   isDigital: boolean('is_digital').default(false).notNull(),
   downloadUrl: varchar('download_url', { length: 500 }),
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
    orderType: varchar('order_type', { length: 30 })
      .default('shipping')
      .notNull(),
     trackingNumber: varchar('tracking_number', { length: 100 }),
     carrier: varchar('carrier', { length: 100 }),
      shippedAt: timestamp('shipped_at'),
    deliveredAt: timestamp('delivered_at'),
      pickupCode: varchar('pickup_code', { length: 20 }),
     pickupCodeUsed: boolean('pickup_code_used').default(false).notNull(),
     pickupSlot: timestamp('pickup_slot'),
     pickupConfirmedAt: timestamp('pickup_confirmed_at'),
    stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
     paidAt: timestamp('paid_at'),
     couponId: uuid('coupon_id'),
   discountAmount: integer('discount_amount').default(0).notNull(),
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

// ============================================================
// 1. SHOP ERWEITERUNGEN
// ============================================================
 
export const productVariantGroups = pgTable('product_variant_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  isRequired: boolean('is_required').default(true).notNull(),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  productIdx: index('pvg_product_idx').on(table.productId),
}));
 
export const productVariants = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  groupId: uuid('group_id').references(() => productVariantGroups.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  label: varchar('label', { length: 100 }).notNull(),
  sku: varchar('sku', { length: 100 }),
  priceModifier: integer('price_modifier').default(0).notNull(),
  stock: integer('stock').default(0).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  groupIdx: index('pv_group_idx').on(table.groupId),
  productIdx: index('pv_product_idx').on(table.productId),
}));
 
export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  // pending | processing | shipped | delivered | completed | cancelled | refunded
  status: varchar('status', { length: 30 }).notNull(),
  note: varchar('note', { length: 500 }),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  orderIdx: index('osh_order_idx').on(table.orderId),
}));
 
// ============================================================
// 2. GUTSCHEINE — Platform Feature (alle Module)
// ============================================================
 
export const coupons = pgTable('coupons', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  code: varchar('code', { length: 50 }).notNull(),
  description: varchar('description', { length: 500 }),
  // percent | fixed | free_shipping
  type: varchar('type', { length: 20 }).notNull(),
  value: integer('value').notNull(),
  minOrderAmount: integer('min_order_amount').default(0),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').default(0).notNull(),
  // shop | restaurant | local | courses | all
  applicableModule: varchar('applicable_module', { length: 30 }).default('all').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  startsAt: timestamp('starts_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenantCodeIdx: uniqueIndex('coupons_tenant_code_idx').on(table.tenantId, table.code),
  tenantIdx: index('coupons_tenant_idx').on(table.tenantId),
}));
 
export const couponUses = pgTable('coupon_uses', {
  id: uuid('id').defaultRandom().primaryKey(),
  couponId: uuid('coupon_id').references(() => coupons.id, { onDelete: 'cascade' }).notNull(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  referenceId: uuid('reference_id'),
  // shop | restaurant | local | course
  referenceType: varchar('reference_type', { length: 30 }),
  discountAmount: integer('discount_amount').notNull(),
  usedAt: timestamp('used_at').defaultNow(),
}, (table) => ({
  couponIdx: index('coupon_uses_coupon_idx').on(table.couponId),
  tenantIdx: index('coupon_uses_tenant_idx').on(table.tenantId),
}));
 
// ============================================================
// 3. RESTAURANT / FOOD MODUL
// ============================================================
 
export const restaurantSettings = pgTable('restaurant_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull().unique(),
  dineInEnabled: boolean('dine_in_enabled').default(true).notNull(),
  pickupEnabled: boolean('pickup_enabled').default(true).notNull(),
  deliveryEnabled: boolean('delivery_enabled').default(false).notNull(),
  deliveryRadius: integer('delivery_radius').default(5),
  deliveryFee: integer('delivery_fee').default(0),
  freeDeliveryFrom: integer('free_delivery_from'),
  minOrderAmount: integer('min_order_amount').default(0),
  estimatedPickupTime: integer('estimated_pickup_time').default(20),
  estimatedDeliveryTime: integer('estimated_delivery_time').default(45),
  cashEnabled: boolean('cash_enabled').default(true).notNull(),
  cardOnPickupEnabled: boolean('card_on_pickup_enabled').default(true).notNull(),
  onlinePaymentEnabled: boolean('online_payment_enabled').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
 
export const restaurantTables = pgTable('restaurant_tables', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  number: varchar('number', { length: 20 }).notNull(),
  name: varchar('name', { length: 100 }),
  capacity: integer('capacity').default(4).notNull(),
  qrCode: varchar('qr_code', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  tenantIdx: index('rt_tenant_idx').on(table.tenantId),
  tenantNumberIdx: uniqueIndex('rt_tenant_number_idx').on(table.tenantId, table.number),
}));
 
export const menuCategories = pgTable('menu_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull(),
  description: varchar('description', { length: 500 }),
  image: varchar('image', { length: 500 }),
  position: integer('position').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  availableFrom: varchar('available_from', { length: 5 }),
  availableTo: varchar('available_to', { length: 5 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenantSlugIdx: uniqueIndex('mc_tenant_slug_idx').on(table.tenantId, table.slug),
  tenantIdx: index('mc_tenant_idx').on(table.tenantId),
}));
 
export const menuItems = pgTable('menu_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  categoryId: uuid('category_id').references(() => menuCategories.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 300 }).notNull(),
  slug: varchar('slug', { length: 300 }).notNull(),
  description: varchar('description', { length: 1000 }),
  price: integer('price').notNull(),
  images: jsonb('images').default([]),
  allergens: text('allergens').array().default([]),
  isVegan: boolean('is_vegan').default(false).notNull(),
  isVegetarian: boolean('is_vegetarian').default(false).notNull(),
  isSpicy: boolean('is_spicy').default(false).notNull(),
  isPopular: boolean('is_popular').default(false).notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  position: integer('position').default(0).notNull(),
  preparationTime: integer('preparation_time').default(15),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenantSlugIdx: uniqueIndex('mi_tenant_slug_idx').on(table.tenantId, table.slug),
  tenantIdx: index('mi_tenant_idx').on(table.tenantId),
  categoryIdx: index('mi_category_idx').on(table.categoryId),
}));
 
export const menuModifierGroups = pgTable('menu_modifier_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  menuItemId: uuid('menu_item_id').references(() => menuItems.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  isRequired: boolean('is_required').default(false).notNull(),
  minSelections: integer('min_selections').default(0).notNull(),
  maxSelections: integer('max_selections').default(1).notNull(),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  menuItemIdx: index('mmg_menu_item_idx').on(table.menuItemId),
}));
 
export const menuModifiers = pgTable('menu_modifiers', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  groupId: uuid('group_id').references(() => menuModifierGroups.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  priceModifier: integer('price_modifier').default(0).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  groupIdx: index('mm_group_idx').on(table.groupId),
}));
 
export const foodOrders = pgTable('food_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  orderNumber: varchar('order_number', { length: 50 }).notNull(),
  // dine_in | pickup | delivery
  orderType: varchar('order_type', { length: 20 }).notNull(),
  tableId: uuid('table_id').references(() => restaurantTables.id, { onDelete: 'set null' }),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }),
  customerPhone: varchar('customer_phone', { length: 50 }),
  deliveryAddress: varchar('delivery_address', { length: 1000 }),
  // new | accepted | preparing | ready | on_the_way | delivered | cancelled
  status: varchar('status', { length: 30 }).default('new').notNull(),
  notes: varchar('notes', { length: 1000 }),
  subtotal: integer('subtotal').notNull(),
  tax: integer('tax').default(0).notNull(),
  deliveryFee: integer('delivery_fee').default(0).notNull(),
  discountAmount: integer('discount_amount').default(0).notNull(),
  total: integer('total').notNull(),
  pickupCode: varchar('pickup_code', { length: 20 }),
  pickupCodeUsed: boolean('pickup_code_used').default(false).notNull(),
  estimatedReadyAt: timestamp('estimated_ready_at'),
  // cash | card_on_pickup | online
  paymentMethod: varchar('payment_method', { length: 30 }).default('cash').notNull(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  paidAt: timestamp('paid_at'),
  couponId: uuid('coupon_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenantIdx: index('fo_tenant_idx').on(table.tenantId),
  orderNumberIdx: uniqueIndex('fo_order_number_idx').on(table.orderNumber),
  statusIdx: index('fo_status_idx').on(table.status),
}));
 
export const foodOrderItems = pgTable('food_order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  foodOrderId: uuid('food_order_id').references(() => foodOrders.id, { onDelete: 'cascade' }).notNull(),
  menuItemId: uuid('menu_item_id').references(() => menuItems.id, { onDelete: 'set null' }),
  menuItemName: varchar('menu_item_name', { length: 300 }).notNull(),
  menuItemPrice: integer('menu_item_price').notNull(),
  quantity: integer('quantity').notNull(),
  selectedModifiers: jsonb('selected_modifiers').default([]),
  notes: varchar('notes', { length: 500 }),
  total: integer('total').notNull(),
}, (table) => ({
  orderIdx: index('foi_order_idx').on(table.foodOrderId),
}));
 
export const foodOrderStatusHistory = pgTable('food_order_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  foodOrderId: uuid('food_order_id').references(() => foodOrders.id, { onDelete: 'cascade' }).notNull(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  status: varchar('status', { length: 30 }).notNull(),
  note: varchar('note', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  orderIdx: index('fosh_order_idx').on(table.foodOrderId),
}));
 
// ============================================================
// 4. LOKALER HANDEL MODUL
// ============================================================
 
export const localStoreSettings = pgTable('local_store_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull().unique(),
  // market | pharmacy | florist | bakery | butcher | kiosk | farm | other
  storeType: varchar('store_type', { length: 50 }).default('other').notNull(),
  pickupEnabled: boolean('pickup_enabled').default(true).notNull(),
  deliveryEnabled: boolean('delivery_enabled').default(false).notNull(),
  pickupSlotDuration: integer('pickup_slot_duration').default(30),
  maxOrdersPerSlot: integer('max_orders_per_slot').default(5),
  minOrderAmount: integer('min_order_amount').default(0),
  cashOnPickupEnabled: boolean('cash_on_pickup_enabled').default(true).notNull(),
  cardOnPickupEnabled: boolean('card_on_pickup_enabled').default(true).notNull(),
  onlinePaymentEnabled: boolean('online_payment_enabled').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
 
export const localProducts = pgTable('local_products', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  categoryId: uuid('category_id'),
  name: varchar('name', { length: 300 }).notNull(),
  slug: varchar('slug', { length: 300 }).notNull(),
  description: varchar('description', { length: 2000 }),
  price: integer('price').notNull(),
  compareAtPrice: integer('compare_at_price'),
  // kg | g | Stück | Liter | ml | Bund | Packung
  unit: varchar('unit', { length: 30 }).default('Stück').notNull(),
  images: jsonb('images').default([]),
  stock: integer('stock').default(0),
  isUnlimited: boolean('is_unlimited').default(false).notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isOrganic: boolean('is_organic').default(false).notNull(),
  isRegional: boolean('is_regional').default(false).notNull(),
  origin: varchar('origin', { length: 200 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenantSlugIdx: uniqueIndex('lp_tenant_slug_idx').on(table.tenantId, table.slug),
  tenantIdx: index('lp_tenant_idx').on(table.tenantId),
}));
 
export const localDeals = pgTable('local_deals', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  localProductId: uuid('local_product_id').references(() => localProducts.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 300 }).notNull(),
  description: varchar('description', { length: 1000 }),
  image: varchar('image', { length: 500 }),
  // percent | fixed
  discountType: varchar('discount_type', { length: 20 }).notNull(),
  discountValue: integer('discount_value').notNull(),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  tenantIdx: index('ld_tenant_idx').on(table.tenantId),
}));
 
export const localPickupSlots = pgTable('local_pickup_slots', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  // 0=So, 1=Mo, ... 6=Sa
  dayOfWeek: integer('day_of_week').notNull(),
  startTime: varchar('start_time', { length: 5 }).notNull(),
  endTime: varchar('end_time', { length: 5 }).notNull(),
  maxOrders: integer('max_orders').default(5).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  tenantIdx: index('lps_tenant_idx').on(table.tenantId),
}));
 
export const localOrders = pgTable('local_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  orderNumber: varchar('order_number', { length: 50 }).notNull(),
  // pickup | delivery
  orderType: varchar('order_type', { length: 20 }).default('pickup').notNull(),
  pickupSlotId: uuid('pickup_slot_id').references(() => localPickupSlots.id, { onDelete: 'set null' }),
  pickupDate: varchar('pickup_date', { length: 10 }),
  pickupCode: varchar('pickup_code', { length: 20 }),
  pickupCodeUsed: boolean('pickup_code_used').default(false).notNull(),
  pickupConfirmedAt: timestamp('pickup_confirmed_at'),
  pickupConfirmedBy: uuid('pickup_confirmed_by').references(() => users.id, { onDelete: 'set null' }),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }),
  customerPhone: varchar('customer_phone', { length: 50 }),
  deliveryAddress: varchar('delivery_address', { length: 1000 }),
  // pending | confirmed | ready | picked_up | cancelled
  status: varchar('status', { length: 30 }).default('pending').notNull(),
  notes: varchar('notes', { length: 1000 }),
  subtotal: integer('subtotal').notNull(),
  discountAmount: integer('discount_amount').default(0).notNull(),
  total: integer('total').notNull(),
  // cash_on_pickup | card_on_pickup | online
  paymentMethod: varchar('payment_method', { length: 30 }).default('cash_on_pickup').notNull(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  paidAt: timestamp('paid_at'),
  couponId: uuid('coupon_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenantIdx: index('lo_tenant_idx').on(table.tenantId),
  orderNumberIdx: uniqueIndex('lo_order_number_idx').on(table.orderNumber),
  statusIdx: index('lo_status_idx').on(table.status),
}));
 
export const localOrderItems = pgTable('local_order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  localOrderId: uuid('local_order_id').references(() => localOrders.id, { onDelete: 'cascade' }).notNull(),
  localProductId: uuid('local_product_id').references(() => localProducts.id, { onDelete: 'set null' }),
  productName: varchar('product_name', { length: 300 }).notNull(),
  productPrice: integer('product_price').notNull(),
  unit: varchar('unit', { length: 30 }).notNull(),
  quantity: integer('quantity').notNull(),
  total: integer('total').notNull(),
}, (table) => ({
  orderIdx: index('loi_order_idx').on(table.localOrderId),
}));
 
// ============================================================
// 5. FUNNELS MODUL
// ============================================================
 
export const funnels = pgTable('funnels', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 300 }).notNull(),
  slug: varchar('slug', { length: 300 }).notNull(),
  description: varchar('description', { length: 1000 }),
  isActive: boolean('is_active').default(false).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  // email | purchase | booking
  conversionGoal: varchar('conversion_goal', { length: 30 }).default('email').notNull(),
  utmSource: varchar('utm_source', { length: 100 }),
  utmMedium: varchar('utm_medium', { length: 100 }),
  utmCampaign: varchar('utm_campaign', { length: 100 }),
  totalViews: integer('total_views').default(0).notNull(),
  totalConversions: integer('total_conversions').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenantSlugIdx: uniqueIndex('funnels_tenant_slug_idx').on(table.tenantId, table.slug),
  tenantIdx: index('funnels_tenant_idx').on(table.tenantId),
}));
 
export const funnelSteps = pgTable('funnel_steps', {
  id: uuid('id').defaultRandom().primaryKey(),
  funnelId: uuid('funnel_id').references(() => funnels.id, { onDelete: 'cascade' }).notNull(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 300 }).notNull(),
  slug: varchar('slug', { length: 300 }).notNull(),
  // optin | sales | upsell | downsell | thankyou | video
  stepType: varchar('step_type', { length: 30 }).notNull(),
  content: jsonb('content').default([]),
  position: integer('position').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  nextStepId: uuid('next_step_id'),
  views: integer('views').default(0).notNull(),
  conversions: integer('conversions').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  funnelIdx: index('fs_funnel_idx').on(table.funnelId),
  tenantSlugIdx: uniqueIndex('fs_tenant_slug_idx').on(table.tenantId, table.slug),
}));
 
export const funnelSubmissions = pgTable('funnel_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  funnelId: uuid('funnel_id').references(() => funnels.id, { onDelete: 'cascade' }).notNull(),
  stepId: uuid('step_id').references(() => funnelSteps.id, { onDelete: 'set null' }),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }),
  customerName: varchar('customer_name', { length: 255 }),
  data: jsonb('data').default({}),
  utmSource: varchar('utm_source', { length: 100 }),
  utmMedium: varchar('utm_medium', { length: 100 }),
  utmCampaign: varchar('utm_campaign', { length: 100 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  convertedAt: timestamp('converted_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  funnelIdx: index('fsub_funnel_idx').on(table.funnelId),
  tenantIdx: index('fsub_tenant_idx').on(table.tenantId),
}));
 
// ============================================================
// 6. MEMBERSHIP PLÄNE + KURSE
// ============================================================
 
export const membershipPlans = pgTable('membership_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull(),
  description: varchar('description', { length: 2000 }),
  price: integer('price').notNull(),
  // monthly | yearly | lifetime
  interval: varchar('interval', { length: 20 }).default('monthly').notNull(),
  features: jsonb('features').default([]),
  isActive: boolean('is_active').default(true).notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenantSlugIdx: uniqueIndex('mp_tenant_slug_idx').on(table.tenantId, table.slug),
  tenantIdx: index('mp_tenant_idx').on(table.tenantId),
}));
 
export const memberships = pgTable('memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  planId: uuid('plan_id').references(() => membershipPlans.id, { onDelete: 'set null' }),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  // active | cancelled | expired | trial | paused
  status: varchar('status', { length: 30 }).default('active').notNull(),
  startedAt: timestamp('started_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  cancelledAt: timestamp('cancelled_at'),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  grantedManually: boolean('granted_manually').default(false).notNull(),
  grantedBy: uuid('granted_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenantIdx: index('mem_tenant_idx').on(table.tenantId),
  emailIdx: index('mem_email_idx').on(table.customerEmail),
  planIdx: index('mem_plan_idx').on(table.planId),
  stripeIdx: index('mem_stripe_idx').on(table.stripeSubscriptionId),
}));
 
export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull(),
  description: text('description'),
  shortDescription: varchar('short_description', { length: 500 }),
  thumbnail: varchar('thumbnail', { length: 500 }),
  price: integer('price').default(0).notNull(),
  isFree: boolean('is_free').default(false).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  requiresMembershipPlanId: uuid('requires_membership_plan_id').references(() => membershipPlans.id, { onDelete: 'set null' }),
  // beginner | intermediate | advanced
  level: varchar('level', { length: 30 }).default('beginner').notNull(),
  language: varchar('language', { length: 10 }).default('de').notNull(),
  totalDuration: integer('total_duration').default(0),
  certificateEnabled: boolean('certificate_enabled').default(false).notNull(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenantSlugIdx: uniqueIndex('courses_tenant_slug_idx').on(table.tenantId, table.slug),
  tenantIdx: index('courses_tenant_idx').on(table.tenantId),
}));
 
export const courseChapters = pgTable('course_chapters', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 300 }).notNull(),
  description: varchar('description', { length: 1000 }),
  position: integer('position').default(0).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  courseIdx: index('cc_course_idx').on(table.courseId),
}));
 
export const courseLessons = pgTable('course_lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  chapterId: uuid('chapter_id').references(() => courseChapters.id, { onDelete: 'cascade' }).notNull(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 300 }).notNull(),
  slug: varchar('slug', { length: 300 }).notNull(),
  // video | text | pdf | quiz
  type: varchar('type', { length: 20 }).default('video').notNull(),
  content: jsonb('content').default({}),
  videoUrl: varchar('video_url', { length: 500 }),
  duration: integer('duration').default(0),
  position: integer('position').default(0).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  isFreePreview: boolean('is_free_preview').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  chapterIdx: index('cl_chapter_idx').on(table.chapterId),
  courseIdx: index('cl_course_idx').on(table.courseId),
  tenantSlugIdx: uniqueIndex('cl_tenant_slug_idx').on(table.tenantId, table.slug),
}));
 
export const courseEnrollments = pgTable('course_enrollments', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  // purchase | membership | manual | free
  accessGrantedBy: varchar('access_granted_by', { length: 30 }).default('purchase').notNull(),
  membershipId: uuid('membership_id').references(() => memberships.id, { onDelete: 'set null' }),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  enrolledAt: timestamp('enrolled_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  progress: integer('progress').default(0).notNull(),
  certificateUrl: varchar('certificate_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  courseIdx: index('ce_course_idx').on(table.courseId),
  emailIdx: index('ce_email_idx').on(table.customerEmail),
  tenantEmailCourseIdx: uniqueIndex('ce_tenant_email_course_idx').on(table.tenantId, table.customerEmail, table.courseId),
}));
 
export const lessonProgress = pgTable('lesson_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  enrollmentId: uuid('enrollment_id').references(() => courseEnrollments.id, { onDelete: 'cascade' }).notNull(),
  lessonId: uuid('lesson_id').references(() => courseLessons.id, { onDelete: 'cascade' }).notNull(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  completedAt: timestamp('completed_at'),
  watchTime: integer('watch_time').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  enrollmentIdx: index('lp_enrollment_idx').on(table.enrollmentId),
  enrollmentLessonIdx: uniqueIndex('lp_enrollment_lesson_idx').on(table.enrollmentId, table.lessonId),
}));
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
    settings: jsonb('settings')
      .$type<{
        backgroundColor?: string;
        textColor?: string;
        fontFamily?: string;
        itemsAlign?: 'left' | 'center' | 'right';
        logoText?: string;
      }>()
      .default({}),
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

// ==================== BOOKING SYSTEM ====================

export const bookingServices = pgTable(
  'booking_services',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    description: text('description'),
    durationMinutes: integer('duration_minutes').notNull().default(30),
    bufferMinutes: integer('buffer_minutes').notNull().default(0),
    price: integer('price').notNull().default(0),
    color: varchar('color', { length: 20 }).default('#3b82f6'),
    maxBookingsPerSlot: integer('max_bookings_per_slot').default(1),
    requiresConfirmation: boolean('requires_confirmation').default(false),
    isActive: boolean('is_active').default(true),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    tenantIdx: index('booking_services_tenant_idx').on(table.tenantId),
  }),
);

export const bookingAvailability = pgTable(
  'booking_availability',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    dayOfWeek: integer('day_of_week').notNull(),
    startTime: varchar('start_time', { length: 5 }).notNull().default('09:00'),
    endTime: varchar('end_time', { length: 5 }).notNull().default('17:00'),
    isActive: boolean('is_active').default(true),
  },
  (table) => ({
    tenantDayIdx: uniqueIndex('booking_availability_tenant_day_idx').on(
      table.tenantId,
      table.dayOfWeek,
    ),
  }),
);

export const bookingBlockedDates = pgTable(
  'booking_blocked_dates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    date: varchar('date', { length: 10 }).notNull(), // 'YYYY-MM-DD'
    reason: varchar('reason', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    tenantDateIdx: uniqueIndex('booking_blocked_dates_tenant_date_idx').on(
      table.tenantId,
      table.date,
    ),
  }),
);

export const bookingSettings = pgTable('booking_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' })
    .unique(),
  timezone: varchar('timezone', { length: 100 }).default('Europe/Berlin'),
  minNoticeHours: integer('min_notice_hours').default(24),
  maxAdvanceDays: integer('max_advance_days').default(60),
  slotIntervalMinutes: integer('slot_interval_minutes').default(30),
  confirmationEmailEnabled: boolean('confirmation_email_enabled').default(true),
  reminderEmailHours: integer('reminder_email_hours').default(24),
  cancellationPolicy: text('cancellation_policy'),
  bookingPageTitle: varchar('booking_page_title', { length: 255 }),
  bookingPageDescription: text('booking_page_description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const bookingAppointments = pgTable(
  'booking_appointments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => bookingServices.id, { onDelete: 'cascade' }),
    customerName: varchar('customer_name', { length: 255 }).notNull(),
    customerEmail: varchar('customer_email', { length: 255 }).notNull(),
    customerPhone: varchar('customer_phone', { length: 50 }),
    customerNotes: text('customer_notes'),
    date: varchar('date', { length: 10 }).notNull(), // 'YYYY-MM-DD'
    startTime: varchar('start_time', { length: 5 }).notNull(),
    endTime: varchar('end_time', { length: 5 }).notNull(),
    status: varchar('status', { length: 50 }).default('confirmed'),
    confirmationToken: varchar('confirmation_token', { length: 100 }),
    cancellationReason: text('cancellation_reason'),
    cancelledAt: timestamp('cancelled_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    tenantIdx: index('booking_appointments_tenant_idx').on(table.tenantId),
    dateIdx: index('booking_appointments_date_idx').on(table.date),
    statusIdx: index('booking_appointments_status_idx').on(table.status),
    tokenIdx: index('booking_appointments_token_idx').on(
      table.confirmationToken,
    ),
  }),
);

// ==================== ANALYTICS ====================

export const pageViews = pgTable(
  'page_views',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // Was wurde besucht
    path: varchar('path', { length: 500 }).notNull().default('/'),
    referrer: text('referrer'),

    // Client-Infos (privacy-safe)
    userAgent: text('user_agent'),
    ipHash: varchar('ip_hash', { length: 16 }), // 8-byte Hex, täglicher Salt
    country: varchar('country', { length: 2 }),

    // Gerät / Browser
    deviceType: varchar('device_type', { length: 20 }), // desktop|mobile|tablet
    browser: varchar('browser', { length: 50 }),
    os: varchar('os', { length: 50 }),

    // Session
    sessionId: varchar('session_id', { length: 32 }).notNull(),
    isUnique: boolean('is_unique').default(true).notNull(), // erster View in Session
    durationSeconds: integer('duration_seconds').default(0), // via sendBeacon aktualisiert

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('page_views_tenant_idx').on(table.tenantId),
    createdAtIdx: index('page_views_created_at_idx').on(table.createdAt),
    sessionIdx: index('page_views_session_idx').on(table.sessionId),
    tenantDateIdx: index('page_views_tenant_date_idx').on(
      table.tenantId,
      table.createdAt,
    ),
  }),
);

// ========== ANALYTICS DAILY (erweiterte Version) =======================
// Aggregierte Tagesdaten — befüllt vom Cron-Job um 00:05

export const analyticsDaily = pgTable(
  'analytics_daily',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    date: varchar('date', { length: 10 }).notNull(),

    pageViews: integer('page_views').default(0).notNull(),
    uniqueVisitors: integer('unique_visitors').default(0).notNull(),
    sessions: integer('sessions').default(0).notNull(),
    newSessions: integer('new_sessions').default(0).notNull(),

    avgDuration: integer('avg_duration').default(0).notNull(),
    bounceRate: integer('bounce_rate').default(0),

    ordersCount: integer('orders_count').default(0).notNull(),
    revenue: integer('revenue').default(0).notNull(),

    topPages: jsonb('top_pages').default([]),
    topReferrers: jsonb('top_referrers').default([]),
    devices: jsonb('devices').default({}),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantDateIdx: uniqueIndex('analytics_daily_tenant_date_idx').on(
      table.tenantId,
      table.date,
    ),
    tenantIdx: index('analytics_daily_tenant_idx').on(table.tenantId),
  }),
);

// ==================== FORM BUILDER ====================

export const forms = pgTable(
  'forms',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    description: text('description'),
    fields: jsonb('fields').default([]).notNull(),
    settings: jsonb('settings').default({}).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    submitButtonText: varchar('submit_button_text', { length: 100 }).default(
      'Absenden',
    ),
    successMessage: text('success_message'),
    redirectUrl: text('redirect_url'),
    emailNotification: boolean('email_notification').default(false),
    notificationEmail: varchar('notification_email', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('forms_tenant_idx').on(table.tenantId),
    tenantSlugIdx: uniqueIndex('forms_tenant_slug_idx').on(
      table.tenantId,
      table.slug,
    ),
  }),
);

export const formSubmissions = pgTable(
  'form_submissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    formId: uuid('form_id')
      .notNull()
      .references(() => forms.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    data: jsonb('data').notNull().default({}),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    isRead: boolean('is_read').default(false).notNull(),
    isStarred: boolean('is_starred').default(false).notNull(),
    isSpam: boolean('is_spam').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    formIdx: index('form_submissions_form_idx').on(table.formId),
    tenantIdx: index('form_submissions_tenant_idx').on(table.tenantId),
    createdAtIdx: index('form_submissions_created_at_idx').on(table.createdAt),
  }),
);

// ==================== BLOG COMMENTS ====================

export const blogComments = pgTable(
  'blog_comments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    parentId: uuid('parent_id'), // self-ref, set after table definition
    authorName: varchar('author_name', { length: 255 }).notNull(),
    authorEmail: varchar('author_email', { length: 255 }).notNull(),
    content: text('content').notNull(),
    status: varchar('status', { length: 20 }).default('pending').notNull(), // pending|approved|rejected|spam
    isSpam: boolean('is_spam').default(false).notNull(),
    isPinned: boolean('is_pinned').default(false).notNull(),
    ipAddress: varchar('ip_address', { length: 45 }),
    depth: integer('depth').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('blog_comments_tenant_idx').on(table.tenantId),
    postIdx: index('blog_comments_post_idx').on(table.postId),
    statusIdx: index('blog_comments_status_idx').on(table.status),
  }),
);

export const commentSettings = pgTable('comment_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' })
    .unique(),
  enabled: boolean('enabled').default(true).notNull(),
  requireApproval: boolean('require_approval').default(true).notNull(),
  allowAnonymous: boolean('allow_anonymous').default(false).notNull(),
  allowReplies: boolean('allow_replies').default(true).notNull(),
  maxDepth: integer('max_depth').default(3).notNull(),
  spamFilter: boolean('spam_filter').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
// ==================== I18N ====================

export const translations = pgTable(
  'translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    entityId: uuid('entity_id').notNull(),
    locale: varchar('locale', { length: 10 }).notNull(),
    field: varchar('field', { length: 100 }).notNull(),
    value: text('value').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueIdx: uniqueIndex('translations_unique_idx').on(
      table.tenantId,
      table.entityType,
      table.entityId,
      table.locale,
      table.field,
    ),
    tenantIdx: index('translations_tenant_idx').on(table.tenantId),
    entityIdx: index('translations_entity_idx').on(
      table.entityType,
      table.entityId,
    ),
  }),
);

export const uiTranslations = pgTable(
  'ui_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 }).notNull(),
    key: varchar('key', { length: 100 }).notNull(),
    value: text('value').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueIdx: uniqueIndex('ui_translations_unique_idx').on(
      table.tenantId,
      table.locale,
      table.key,
    ),
    tenantIdx: index('ui_translations_tenant_idx').on(table.tenantId),
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
  domainEvents: many(domainEvents),
  bookingServices: many(bookingServices),
  bookingAppointments: many(bookingAppointments),
  pageViews: many(pageViews),
  analyticsDaily: many(analyticsDaily),
  forms: many(forms),
  formSubmissions: many(formSubmissions),
  blogComments: many(blogComments),
  translations: many(translations),
  uiTranslations: many(uiTranslations),
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
export const domainEventsRelations = relations(domainEvents, ({ one }) => ({
  tenant: one(tenants, {
    fields: [domainEvents.tenantId],
    references: [tenants.id],
  }),
}));
export const bookingServicesRelations = relations(
  bookingServices,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [bookingServices.tenantId],
      references: [tenants.id],
    }),
    appointments: many(bookingAppointments),
  }),
);

export const bookingAppointmentsRelations = relations(
  bookingAppointments,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [bookingAppointments.tenantId],
      references: [tenants.id],
    }),
    service: one(bookingServices, {
      fields: [bookingAppointments.serviceId],
      references: [bookingServices.id],
    }),
  }),
);

export const formsRelations = relations(forms, ({ one, many }) => ({
  tenant: one(tenants, { fields: [forms.tenantId], references: [tenants.id] }),
  submissions: many(formSubmissions),
}));

export const formSubmissionsRelations = relations(
  formSubmissions,
  ({ one }) => ({
    form: one(forms, {
      fields: [formSubmissions.formId],
      references: [forms.id],
    }),
    tenant: one(tenants, {
      fields: [formSubmissions.tenantId],
      references: [tenants.id],
    }),
  }),
);

export const blogCommentsRelations = relations(
  blogComments,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [blogComments.tenantId],
      references: [tenants.id],
    }),
    post: one(posts, { fields: [blogComments.postId], references: [posts.id] }),
    replies: many(blogComments, { relationName: 'replies' }),
  }),
);

export const pageViewsRelations = relations(pageViews, ({ one }) => ({
  tenant: one(tenants, {
    fields: [pageViews.tenantId],
    references: [tenants.id],
  }),
}));

export const analyticsDailyRelations = relations(analyticsDaily, ({ one }) => ({
  tenant: one(tenants, {
    fields: [analyticsDaily.tenantId],
    references: [tenants.id],
  }),
}));

export const productVariantGroupsRelations = relations(productVariantGroups, ({ one, many }) => ({
  tenant: one(tenants, { fields: [productVariantGroups.tenantId], references: [tenants.id] }),
  product: one(products, { fields: [productVariantGroups.productId], references: [products.id] }),
  variants: many(productVariants),
}));
 
export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  tenant: one(tenants, { fields: [productVariants.tenantId], references: [tenants.id] }),
  group: one(productVariantGroups, { fields: [productVariants.groupId], references: [productVariantGroups.id] }),
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));
 
export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, { fields: [orderStatusHistory.orderId], references: [orders.id] }),
  tenant: one(tenants, { fields: [orderStatusHistory.tenantId], references: [tenants.id] }),
  createdByUser: one(users, { fields: [orderStatusHistory.createdBy], references: [users.id] }),
}));
 
export const couponsRelations = relations(coupons, ({ one, many }) => ({
  tenant: one(tenants, { fields: [coupons.tenantId], references: [tenants.id] }),
  uses: many(couponUses),
}));
 
export const couponUsesRelations = relations(couponUses, ({ one }) => ({
  coupon: one(coupons, { fields: [couponUses.couponId], references: [coupons.id] }),
  tenant: one(tenants, { fields: [couponUses.tenantId], references: [tenants.id] }),
}));
 
export const menuCategoriesRelations = relations(menuCategories, ({ one, many }) => ({
  tenant: one(tenants, { fields: [menuCategories.tenantId], references: [tenants.id] }),
  items: many(menuItems),
}));
 
export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  tenant: one(tenants, { fields: [menuItems.tenantId], references: [tenants.id] }),
  category: one(menuCategories, { fields: [menuItems.categoryId], references: [menuCategories.id] }),
  modifierGroups: many(menuModifierGroups),
}));
 
export const menuModifierGroupsRelations = relations(menuModifierGroups, ({ one, many }) => ({
  tenant: one(tenants, { fields: [menuModifierGroups.tenantId], references: [tenants.id] }),
  menuItem: one(menuItems, { fields: [menuModifierGroups.menuItemId], references: [menuItems.id] }),
  modifiers: many(menuModifiers),
}));
 
export const menuModifiersRelations = relations(menuModifiers, ({ one }) => ({
  tenant: one(tenants, { fields: [menuModifiers.tenantId], references: [tenants.id] }),
  group: one(menuModifierGroups, { fields: [menuModifiers.groupId], references: [menuModifierGroups.id] }),
}));
 
export const restaurantTablesRelations = relations(restaurantTables, ({ one }) => ({
  tenant: one(tenants, { fields: [restaurantTables.tenantId], references: [tenants.id] }),
}));
 
export const foodOrdersRelations = relations(foodOrders, ({ one, many }) => ({
  tenant: one(tenants, { fields: [foodOrders.tenantId], references: [tenants.id] }),
  table: one(restaurantTables, { fields: [foodOrders.tableId], references: [restaurantTables.id] }),
  items: many(foodOrderItems),
  statusHistory: many(foodOrderStatusHistory),
}));
 
export const foodOrderItemsRelations = relations(foodOrderItems, ({ one }) => ({
  foodOrder: one(foodOrders, { fields: [foodOrderItems.foodOrderId], references: [foodOrders.id] }),
  menuItem: one(menuItems, { fields: [foodOrderItems.menuItemId], references: [menuItems.id] }),
}));
 
export const foodOrderStatusHistoryRelations = relations(foodOrderStatusHistory, ({ one }) => ({
  foodOrder: one(foodOrders, { fields: [foodOrderStatusHistory.foodOrderId], references: [foodOrders.id] }),
  tenant: one(tenants, { fields: [foodOrderStatusHistory.tenantId], references: [tenants.id] }),
}));
 
export const localProductsRelations = relations(localProducts, ({ one, many }) => ({
  tenant: one(tenants, { fields: [localProducts.tenantId], references: [tenants.id] }),
  deals: many(localDeals),
}));
 
export const localDealsRelations = relations(localDeals, ({ one }) => ({
  tenant: one(tenants, { fields: [localDeals.tenantId], references: [tenants.id] }),
  localProduct: one(localProducts, { fields: [localDeals.localProductId], references: [localProducts.id] }),
}));
 
export const localPickupSlotsRelations = relations(localPickupSlots, ({ one }) => ({
  tenant: one(tenants, { fields: [localPickupSlots.tenantId], references: [tenants.id] }),
}));
 
export const localOrdersRelations = relations(localOrders, ({ one, many }) => ({
  tenant: one(tenants, { fields: [localOrders.tenantId], references: [tenants.id] }),
  pickupSlot: one(localPickupSlots, { fields: [localOrders.pickupSlotId], references: [localPickupSlots.id] }),
  confirmedByUser: one(users, { fields: [localOrders.pickupConfirmedBy], references: [users.id] }),
  items: many(localOrderItems),
}));
 
export const localOrderItemsRelations = relations(localOrderItems, ({ one }) => ({
  localOrder: one(localOrders, { fields: [localOrderItems.localOrderId], references: [localOrders.id] }),
  localProduct: one(localProducts, { fields: [localOrderItems.localProductId], references: [localProducts.id] }),
}));
 
export const funnelsRelations = relations(funnels, ({ one, many }) => ({
  tenant: one(tenants, { fields: [funnels.tenantId], references: [tenants.id] }),
  steps: many(funnelSteps),
  submissions: many(funnelSubmissions),
}));
 
export const funnelStepsRelations = relations(funnelSteps, ({ one, many }) => ({
  funnel: one(funnels, { fields: [funnelSteps.funnelId], references: [funnels.id] }),
  tenant: one(tenants, { fields: [funnelSteps.tenantId], references: [tenants.id] }),
  submissions: many(funnelSubmissions),
}));
 
export const funnelSubmissionsRelations = relations(funnelSubmissions, ({ one }) => ({
  funnel: one(funnels, { fields: [funnelSubmissions.funnelId], references: [funnels.id] }),
  step: one(funnelSteps, { fields: [funnelSubmissions.stepId], references: [funnelSteps.id] }),
  tenant: one(tenants, { fields: [funnelSubmissions.tenantId], references: [tenants.id] }),
}));
 
export const membershipPlansRelations = relations(membershipPlans, ({ one, many }) => ({
  tenant: one(tenants, { fields: [membershipPlans.tenantId], references: [tenants.id] }),
  memberships: many(memberships),
  courses: many(courses),
}));
 
export const membershipsRelations = relations(memberships, ({ one, many }) => ({
  tenant: one(tenants, { fields: [memberships.tenantId], references: [tenants.id] }),
  plan: one(membershipPlans, { fields: [memberships.planId], references: [membershipPlans.id] }),
  grantedByUser: one(users, { fields: [memberships.grantedBy], references: [users.id] }),
  enrollments: many(courseEnrollments),
}));
 
export const coursesRelations = relations(courses, ({ one, many }) => ({
  tenant: one(tenants, { fields: [courses.tenantId], references: [tenants.id] }),
  requiredPlan: one(membershipPlans, { fields: [courses.requiresMembershipPlanId], references: [membershipPlans.id] }),
  chapters: many(courseChapters),
  enrollments: many(courseEnrollments),
}));
 
export const courseChaptersRelations = relations(courseChapters, ({ one, many }) => ({
  course: one(courses, { fields: [courseChapters.courseId], references: [courses.id] }),
  tenant: one(tenants, { fields: [courseChapters.tenantId], references: [tenants.id] }),
  lessons: many(courseLessons),
}));
 
export const courseLessonsRelations = relations(courseLessons, ({ one, many }) => ({
  chapter: one(courseChapters, { fields: [courseLessons.chapterId], references: [courseChapters.id] }),
  course: one(courses, { fields: [courseLessons.courseId], references: [courses.id] }),
  tenant: one(tenants, { fields: [courseLessons.tenantId], references: [tenants.id] }),
  progress: many(lessonProgress),
}));
 
export const courseEnrollmentsRelations = relations(courseEnrollments, ({ one, many }) => ({
  course: one(courses, { fields: [courseEnrollments.courseId], references: [courses.id] }),
  tenant: one(tenants, { fields: [courseEnrollments.tenantId], references: [tenants.id] }),
  membership: one(memberships, { fields: [courseEnrollments.membershipId], references: [memberships.id] }),
  lessonProgress: many(lessonProgress),
}));
 
export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  enrollment: one(courseEnrollments, { fields: [lessonProgress.enrollmentId], references: [courseEnrollments.id] }),
  lesson: one(courseLessons, { fields: [lessonProgress.lessonId], references: [courseLessons.id] }),
  tenant: one(tenants, { fields: [lessonProgress.tenantId], references: [tenants.id] }),
}));
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
export const translationsRelations = relations(translations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [translations.tenantId],
    references: [tenants.id],
  }),
}));

export const uiTranslationsRelations = relations(uiTranslations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [uiTranslations.tenantId],
    references: [tenants.id],
  }),
}));
