"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderItems = exports.orders = exports.orderStatusEnum = exports.products = exports.categories = exports.pages = exports.pageTemplateEnum = exports.posts = exports.postStatusEnum = exports.auditLogs = exports.refreshTokens = exports.users = exports.tenants = exports.shopTemplateEnum = exports.packageEnum = exports.userRoleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.userRoleEnum = (0, pg_core_1.pgEnum)('user_role', ['owner', 'admin', 'user']);
exports.packageEnum = (0, pg_core_1.pgEnum)('package', [
    'starter',
    'business',
    'enterprise',
]);
exports.shopTemplateEnum = (0, pg_core_1.pgEnum)('shop_template', [
    'default',
    'minimalist',
    'fashion',
    'tech',
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
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
}, (table) => ({
    slugIdx: (0, pg_core_1.uniqueIndex)('tenants_slug_idx').on(table.slug),
    domainIdx: (0, pg_core_1.index)('tenants_domain_idx').on(table.domain),
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
exports.postStatusEnum = (0, pg_core_1.pgEnum)('post_status', [
    'draft',
    'published',
    'archived',
]);
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
    publishedAt: (0, pg_core_1.timestamp)('published_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
}, (table) => ({
    tenantSlugIdx: (0, pg_core_1.uniqueIndex)('posts_tenant_slug_idx').on(table.tenantId, table.slug),
    tenantIdx: (0, pg_core_1.index)('posts_tenant_idx').on(table.tenantId),
    statusIdx: (0, pg_core_1.index)('posts_status_idx').on(table.status),
}));
exports.pageTemplateEnum = (0, pg_core_1.pgEnum)('page_template', [
    'default',
    'landing',
    'contact',
    'about',
    'blank',
]);
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
    metaDescription: (0, pg_core_1.varchar)('meta_description', { length: 500 }),
    template: (0, exports.pageTemplateEnum)('template').default('default').notNull(),
    isPublished: (0, pg_core_1.boolean)('is_published').default(false).notNull(),
    publishedAt: (0, pg_core_1.timestamp)('published_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
}, (table) => ({
    tenantSlugIdx: (0, pg_core_1.uniqueIndex)('pages_tenant_slug_idx').on(table.tenantId, table.slug),
    tenantIdx: (0, pg_core_1.index)('pages_tenant_idx').on(table.tenantId),
    publishedIdx: (0, pg_core_1.index)('pages_published_idx').on(table.isPublished),
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
exports.orderStatusEnum = (0, pg_core_1.pgEnum)('order_status', [
    'pending',
    'processing',
    'completed',
    'cancelled',
]);
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
//# sourceMappingURL=schema.js.map