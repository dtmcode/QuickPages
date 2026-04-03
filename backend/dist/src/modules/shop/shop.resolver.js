"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../core/auth/guards/gql-auth.guard");
const package_guard_1 = require("../../core/package/guards/package.guard");
const require_feature_decorator_1 = require("../../core/package/decorators/require-feature.decorator");
const tenant_id_decorator_1 = require("../../core/auth/decorators/tenant-id.decorator");
const package_helper_1 = require("../../core/package/package.helper");
const product_types_1 = require("./dto/product.types");
const order_types_1 = require("./dto/order.types");
const product_input_1 = require("./dto/product.input");
const order_input_1 = require("./dto/order.input");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
let ShopResolver = class ShopResolver {
    db;
    constructor(db) {
        this.db = db;
    }
    async categories(tenantId) {
        const result = await this.db
            .select()
            .from(schema_1.categories)
            .where((0, drizzle_orm_1.eq)(schema_1.categories.tenantId, tenantId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.categories.createdAt));
        return {
            categories: result.map((cat) => ({
                ...cat,
                description: cat.description ?? undefined,
                image: cat.image ?? undefined,
                isActive: cat.isActive ?? true,
                createdAt: cat.createdAt ?? new Date(),
            })),
            total: result.length,
        };
    }
    async publicCategories() {
        const result = await this.db
            .select()
            .from(schema_1.categories)
            .where((0, drizzle_orm_1.eq)(schema_1.categories.isActive, true))
            .orderBy(schema_1.categories.name);
        return result.map((cat) => ({
            ...cat,
            description: cat.description ?? undefined,
            image: cat.image ?? undefined,
            isActive: cat.isActive ?? true,
            createdAt: cat.createdAt ?? new Date(),
        }));
    }
    async createCategory(input, tenantId) {
        const slug = input.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-');
        const [category] = await this.db
            .insert(schema_1.categories)
            .values({
            tenantId,
            name: input.name,
            slug,
            description: input.description,
            image: input.image,
            isActive: input.isActive,
        })
            .returning();
        return {
            ...category,
            description: category.description ?? undefined,
            image: category.image ?? undefined,
            isActive: category.isActive ?? true,
            createdAt: category.createdAt ?? new Date(),
        };
    }
    async updateCategory(id, input, tenantId) {
        const [category] = await this.db
            .update(schema_1.categories)
            .set({ ...input, updatedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.categories.id, id), (0, drizzle_orm_1.eq)(schema_1.categories.tenantId, tenantId)))
            .returning();
        return {
            ...category,
            description: category.description ?? undefined,
            image: category.image ?? undefined,
            isActive: category.isActive ?? true,
            createdAt: category.createdAt ?? new Date(),
        };
    }
    async deleteCategory(id, tenantId) {
        await this.db
            .delete(schema_1.categories)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.categories.id, id), (0, drizzle_orm_1.eq)(schema_1.categories.tenantId, tenantId)));
        return true;
    }
    async products(tenantId) {
        const result = await this.db
            .select()
            .from(schema_1.products)
            .where((0, drizzle_orm_1.eq)(schema_1.products.tenantId, tenantId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.products.createdAt));
        return {
            products: result.map((product) => ({
                ...product,
                description: product.description ?? undefined,
                compareAtPrice: product.compareAtPrice ?? undefined,
                images: product.images ? JSON.parse(product.images) : undefined,
                categoryId: product.categoryId ?? undefined,
                isActive: product.isActive ?? true,
                isFeatured: product.isFeatured ?? false,
                stock: product.stock ?? 0,
                createdAt: product.createdAt ?? new Date(),
            })),
            total: result.length,
        };
    }
    async publicProducts() {
        const result = await this.db
            .select()
            .from(schema_1.products)
            .where((0, drizzle_orm_1.eq)(schema_1.products.isActive, true))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.products.isFeatured), (0, drizzle_orm_1.desc)(schema_1.products.createdAt));
        return result.map((product) => ({
            ...product,
            description: product.description ?? undefined,
            compareAtPrice: product.compareAtPrice ?? undefined,
            images: product.images ? JSON.parse(product.images) : undefined,
            categoryId: product.categoryId ?? undefined,
            isActive: product.isActive ?? true,
            isFeatured: product.isFeatured ?? false,
            stock: product.stock ?? 0,
            createdAt: product.createdAt ?? new Date(),
        }));
    }
    async createProduct(input, tenantId) {
        const [tenant] = await this.db
            .select()
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId))
            .limit(1);
        if (!tenant) {
            throw new Error('Tenant nicht gefunden');
        }
        const currentProducts = await this.db
            .select()
            .from(schema_1.products)
            .where((0, drizzle_orm_1.eq)(schema_1.products.tenantId, tenantId));
        const pkg = package_helper_1.PACKAGES[tenant.package];
        const maxProducts = pkg?.features.maxProducts ?? 0;
        if (maxProducts !== -1 && currentProducts.length >= maxProducts) {
            const limits = {
                starter: 0,
                business: 100,
                enterprise: -1,
            };
            throw new Error(`Produkt-Limit erreicht! Dein ${tenant.package.toUpperCase()} Package erlaubt ${limits[tenant.package] === -1 ? 'unbegrenzt' : limits[tenant.package]} Produkte. Upgrade auf BUSINESS für mehr!`);
        }
        const slug = input.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-') +
            '-' +
            Date.now();
        const [product] = await this.db
            .insert(schema_1.products)
            .values({
            tenantId,
            name: input.name,
            slug,
            description: input.description,
            price: input.price,
            compareAtPrice: input.compareAtPrice,
            stock: input.stock,
            images: input.images ? JSON.stringify(input.images) : null,
            categoryId: input.categoryId,
            isActive: input.isActive,
            isFeatured: input.isFeatured,
        })
            .returning();
        return {
            ...product,
            description: product.description ?? undefined,
            compareAtPrice: product.compareAtPrice ?? undefined,
            images: product.images ? JSON.parse(product.images) : undefined,
            categoryId: product.categoryId ?? undefined,
            isActive: product.isActive ?? true,
            isFeatured: product.isFeatured ?? false,
            stock: product.stock ?? 0,
            createdAt: product.createdAt ?? new Date(),
        };
    }
    async updateProduct(id, input, tenantId) {
        const updateData = { ...input, updatedAt: new Date() };
        if (input.images) {
            updateData.images = JSON.stringify(input.images);
        }
        const [product] = await this.db
            .update(schema_1.products)
            .set(updateData)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.id, id), (0, drizzle_orm_1.eq)(schema_1.products.tenantId, tenantId)))
            .returning();
        return {
            ...product,
            description: product.description ?? undefined,
            compareAtPrice: product.compareAtPrice ?? undefined,
            images: product.images ? JSON.parse(product.images) : undefined,
            categoryId: product.categoryId ?? undefined,
            isActive: product.isActive ?? true,
            isFeatured: product.isFeatured ?? false,
            stock: product.stock ?? 0,
            createdAt: product.createdAt ?? new Date(),
        };
    }
    async deleteProduct(id, tenantId) {
        await this.db
            .delete(schema_1.products)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.id, id), (0, drizzle_orm_1.eq)(schema_1.products.tenantId, tenantId)));
        return true;
    }
    async orders(tenantId) {
        const result = await this.db
            .select()
            .from(schema_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_1.orders.tenantId, tenantId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt));
        return {
            orders: result.map((order) => ({
                ...order,
                customerAddress: order.customerAddress ?? undefined,
                notes: order.notes ?? undefined,
                status: order.status,
                tax: order.tax ?? 0,
                shipping: order.shipping ?? 0,
                createdAt: order.createdAt ?? new Date(),
            })),
            total: result.length,
        };
    }
    async order(id, tenantId) {
        const [order] = await this.db
            .select()
            .from(schema_1.orders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.orders.id, id), (0, drizzle_orm_1.eq)(schema_1.orders.tenantId, tenantId)))
            .limit(1);
        if (!order) {
            throw new Error('Bestellung nicht gefunden');
        }
        const items = await this.db
            .select()
            .from(schema_1.orderItems)
            .where((0, drizzle_orm_1.eq)(schema_1.orderItems.orderId, id));
        return {
            ...order,
            customerAddress: order.customerAddress ?? undefined,
            notes: order.notes ?? undefined,
            status: order.status,
            tax: order.tax ?? 0,
            shipping: order.shipping ?? 0,
            items: items.map((item) => ({
                ...item,
                total: item.total ?? 0,
            })),
            createdAt: order.createdAt ?? new Date(),
        };
    }
    async createOrder(input, tenantId) {
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const [order] = await this.db
            .insert(schema_1.orders)
            .values({
            tenantId,
            orderNumber,
            customerEmail: input.customerEmail,
            customerName: input.customerName,
            customerAddress: input.customerAddress,
            status: 'pending',
            subtotal: input.subtotal,
            tax: input.tax,
            shipping: input.shipping,
            total: input.total,
            notes: input.notes,
        })
            .returning();
        const itemsToInsert = input.items.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            productPrice: item.productPrice,
            quantity: item.quantity,
            total: item.productPrice * item.quantity,
        }));
        await this.db.insert(schema_1.orderItems).values(itemsToInsert);
        for (const item of input.items) {
            const [product] = await this.db
                .select()
                .from(schema_1.products)
                .where((0, drizzle_orm_1.eq)(schema_1.products.id, item.productId))
                .limit(1);
            if (product) {
                await this.db
                    .update(schema_1.products)
                    .set({
                    stock: Math.max(0, (product.stock ?? 0) - item.quantity),
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.products.id, item.productId));
            }
        }
        return {
            ...order,
            customerAddress: order.customerAddress ?? undefined,
            notes: order.notes ?? undefined,
            status: order.status,
            tax: order.tax ?? 0,
            shipping: order.shipping ?? 0,
            createdAt: order.createdAt ?? new Date(),
        };
    }
    async updateOrderStatus(id, status, tenantId) {
        const [order] = await this.db
            .update(schema_1.orders)
            .set({ status, updatedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.orders.id, id), (0, drizzle_orm_1.eq)(schema_1.orders.tenantId, tenantId)))
            .returning();
        if (!order) {
            throw new Error('Bestellung nicht gefunden');
        }
        return {
            ...order,
            customerAddress: order.customerAddress ?? undefined,
            notes: order.notes ?? undefined,
            status: order.status,
            tax: order.tax ?? 0,
            shipping: order.shipping ?? 0,
            createdAt: order.createdAt ?? new Date(),
        };
    }
};
exports.ShopResolver = ShopResolver;
__decorate([
    (0, graphql_1.Query)(() => product_types_1.CategoriesResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopResolver.prototype, "categories", null);
__decorate([
    (0, graphql_1.Query)(() => [product_types_1.Category]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopResolver.prototype, "publicCategories", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_types_1.Category),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_input_1.CreateCategoryInput, String]),
    __metadata("design:returntype", Promise)
], ShopResolver.prototype, "createCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_types_1.Category),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_input_1.UpdateCategoryInput, String]),
    __metadata("design:returntype", Promise)
], ShopResolver.prototype, "updateCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShopResolver.prototype, "deleteCategory", null);
__decorate([
    (0, graphql_1.Query)(() => product_types_1.ProductsResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopResolver.prototype, "products", null);
__decorate([
    (0, graphql_1.Query)(() => [product_types_1.Product]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopResolver.prototype, "publicProducts", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_types_1.Product),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, package_guard_1.PackageGuard),
    (0, require_feature_decorator_1.RequireFeature)('shop'),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_input_1.CreateProductInput, String]),
    __metadata("design:returntype", Promise)
], ShopResolver.prototype, "createProduct", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_types_1.Product),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_input_1.UpdateProductInput, String]),
    __metadata("design:returntype", Promise)
], ShopResolver.prototype, "updateProduct", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShopResolver.prototype, "deleteProduct", null);
__decorate([
    (0, graphql_1.Query)(() => order_types_1.OrdersResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopResolver.prototype, "orders", null);
__decorate([
    (0, graphql_1.Query)(() => order_types_1.Order),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShopResolver.prototype, "order", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_types_1.Order),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_input_1.CreateOrderInput, String]),
    __metadata("design:returntype", Promise)
], ShopResolver.prototype, "createOrder", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_types_1.Order),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('status')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ShopResolver.prototype, "updateOrderStatus", null);
exports.ShopResolver = ShopResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], ShopResolver);
//# sourceMappingURL=shop.resolver.js.map