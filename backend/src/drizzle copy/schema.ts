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
  jsonb,
} from 'drizzle-orm/pg-core';

// Enums
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
]); // ← NEU ZEILE 1

// Tenants Tabelle
export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 200 }).notNull(),
    slug: varchar('slug', { length: 200 }).notNull().unique(),
    domain: varchar('domain', { length: 255 }),
    package: packageEnum('package').default('starter').notNull(),
    shopTemplate: shopTemplateEnum('shop_template').default('default'), // ← NEU ZEILE 2
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
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('tenants_slug_idx').on(table.slug),
    domainIdx: index('tenants_domain_idx').on(table.domain),
  }),
);

// Users Tabelle
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

// Refresh Tokens
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

// Audit Logs
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

// CMS - Posts
export const postStatusEnum = pgEnum('post_status', [
  'draft',
  'published',
  'archived',
]);

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
    publishedAt: timestamp('published_at'),
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

// CMS - Pages
export const pageTemplateEnum = pgEnum('page_template', [
  'default',
  'landing',
  'contact',
  'about',
  'blank',
]);

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
    title: varchar('title', { length: 500 }).notNull(),
    slug: varchar('slug', { length: 500 }).notNull(),
    content: varchar('content', { length: 50000 }),
    metaDescription: varchar('meta_description', { length: 500 }),
    template: pageTemplateEnum('template').default('default').notNull(),
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
  }),
);
// Shop - Categories
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

// Shop - Products
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

// Shop - Orders
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'processing',
  'completed',
  'cancelled',
]);

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

// Shop - Order Items
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
