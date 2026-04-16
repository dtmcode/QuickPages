"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const website_builder_schema_1 = require("../../drizzle/website-builder.schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
const bcrypt = __importStar(require("bcryptjs"));
let PublicService = class PublicService {
    db;
    jwtService;
    constructor(db, jwtService) {
        this.db = db;
        this.jwtService = jwtService;
    }
    async getTenantSettings(tenantSlug) {
        const [tenant] = await this.db
            .select()
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenants.slug, tenantSlug), (0, drizzle_orm_1.eq)(schema_1.tenants.isActive, true)))
            .limit(1);
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        return {
            name: tenant.name,
            slug: tenant.slug,
            domain: tenant.domain,
            shopTemplate: tenant.shopTemplate,
            settings: tenant.settings,
        };
    }
    async getTenantBranding(tenantSlug) {
        const [tenant] = await this.db
            .select({ package: schema_1.tenants.package, branding: schema_1.tenants.branding })
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenants.slug, tenantSlug), (0, drizzle_orm_1.eq)(schema_1.tenants.isActive, true)))
            .limit(1);
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        if (tenant.package !== 'enterprise')
            return {};
        return tenant.branding ?? {};
    }
    async getTenantId(tenantSlug) {
        const [tenant] = await this.db
            .select({ id: schema_1.tenants.id })
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenants.slug, tenantSlug), (0, drizzle_orm_1.eq)(schema_1.tenants.isActive, true)))
            .limit(1);
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        return tenant.id;
    }
    async getPublishedPages(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        return this.db
            .select()
            .from(schema_1.pages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.pages.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.pages.isPublished, true), (0, drizzle_orm_1.eq)(schema_1.pages.status, 'published')))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.pages.publishedAt));
    }
    async getPageBySlug(tenantSlug, pageSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const [page] = await this.db
            .select()
            .from(schema_1.pages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.pages.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.pages.slug, pageSlug), (0, drizzle_orm_1.eq)(schema_1.pages.isPublished, true)))
            .limit(1);
        if (!page)
            throw new common_1.NotFoundException('Page not found');
        const [seo] = await this.db
            .select()
            .from(schema_1.seoMeta)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.seoMeta.entityType, 'page'), (0, drizzle_orm_1.eq)(schema_1.seoMeta.entityId, page.id)))
            .limit(1);
        return { ...page, seo: seo ?? null };
    }
    async getPublishedWbPages(tenantSlug, templateId) {
        const tenantId = await this.getTenantId(tenantSlug);
        const pagesResult = await this.db
            .select()
            .from(website_builder_schema_1.wbPages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.tenantId, tenantId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.templateId, templateId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.isActive, true)))
            .orderBy((0, drizzle_orm_1.asc)(website_builder_schema_1.wbPages.order));
        const pagesWithSections = await Promise.all(pagesResult.map(async (page) => {
            const sections = await this.db
                .select()
                .from(website_builder_schema_1.wbSections)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.pageId, page.id), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.isActive, true)))
                .orderBy((0, drizzle_orm_1.asc)(website_builder_schema_1.wbSections.order));
            return { ...page, sections };
        }));
        return pagesWithSections;
    }
    async getWbPageBySlug(tenantSlug, templateId, pageSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const [wbPage] = await this.db
            .select()
            .from(website_builder_schema_1.wbPages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.tenantId, tenantId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.templateId, templateId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.slug, pageSlug), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.isActive, true)))
            .limit(1);
        if (!wbPage)
            throw new common_1.NotFoundException('Website Builder Page not found');
        const sections = await this.db
            .select()
            .from(website_builder_schema_1.wbSections)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.pageId, wbPage.id), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.isActive, true)))
            .orderBy((0, drizzle_orm_1.asc)(website_builder_schema_1.wbSections.order));
        return { ...wbPage, sections };
    }
    async getWbHomepage(tenantSlug, templateId) {
        const tenantId = await this.getTenantId(tenantSlug);
        const [homepage] = await this.db
            .select()
            .from(website_builder_schema_1.wbPages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.tenantId, tenantId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.templateId, templateId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.isHomepage, true), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.isActive, true)))
            .limit(1);
        if (!homepage)
            return null;
        const sections = await this.db
            .select()
            .from(website_builder_schema_1.wbSections)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.pageId, homepage.id), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.isActive, true)))
            .orderBy((0, drizzle_orm_1.asc)(website_builder_schema_1.wbSections.order));
        console.log(`🏠 Homepage "${homepage.name}": ${sections.length} sections loaded`);
        return { ...homepage, sections };
    }
    async getDefaultTemplateId(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const [defaultTemplate] = await this.db
            .select({ id: website_builder_schema_1.wbTemplates.id })
            .from(website_builder_schema_1.wbTemplates)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.tenantId, tenantId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.isDefault, true), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.isActive, true)))
            .limit(1);
        return defaultTemplate?.id ?? null;
    }
    async getPublishedPosts(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        return this.db
            .select()
            .from(schema_1.posts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.posts.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.posts.isPublished, true), (0, drizzle_orm_1.eq)(schema_1.posts.status, 'published')))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.posts.publishedAt));
    }
    async getPostBySlug(tenantSlug, postSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const [post] = await this.db
            .select()
            .from(schema_1.posts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.posts.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.posts.slug, postSlug), (0, drizzle_orm_1.eq)(schema_1.posts.isPublished, true)))
            .limit(1);
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const [seo] = await this.db
            .select()
            .from(schema_1.seoMeta)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.seoMeta.entityType, 'post'), (0, drizzle_orm_1.eq)(schema_1.seoMeta.entityId, post.id)))
            .limit(1);
        return { ...post, seo: seo ?? null };
    }
    async getProducts(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        return this.db
            .select()
            .from(schema_1.products)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.products.isActive, true)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.products.createdAt));
    }
    async getProductBySlug(tenantSlug, productSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const [product] = await this.db
            .select()
            .from(schema_1.products)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.products.slug, productSlug), (0, drizzle_orm_1.eq)(schema_1.products.isActive, true)))
            .limit(1);
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const [seo] = await this.db
            .select()
            .from(schema_1.seoMeta)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.seoMeta.entityType, 'product'), (0, drizzle_orm_1.eq)(schema_1.seoMeta.entityId, product.id)))
            .limit(1);
        return { ...product, seo: seo ?? null };
    }
    async getCategories(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        return this.db
            .select()
            .from(schema_1.categories)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.categories.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.categories.isActive, true)));
    }
    async createPublicOrder(tenantSlug, data) {
        const tenantId = await this.getTenantId(tenantSlug);
        const orderNumber = `ORD-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()}`;
        const [order] = await this.db
            .insert(schema_1.orders)
            .values({
            tenantId,
            orderNumber,
            customerEmail: data.customerEmail,
            customerName: data.customerName,
            customerAddress: data.customerAddress,
            status: 'pending',
            subtotal: data.subtotal,
            tax: 0,
            shipping: data.shipping,
            total: data.total,
            notes: data.notes,
        })
            .returning();
        await this.db.insert(schema_1.orderItems).values(data.items.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            productPrice: item.productPrice,
            quantity: item.quantity,
            total: item.productPrice * item.quantity,
        })));
        for (const item of data.items) {
            const [product] = await this.db
                .select({ id: schema_1.products.id, stock: schema_1.products.stock })
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
        return { orderNumber: order.orderNumber, id: order.id };
    }
    async getNavigation(tenantSlug, location) {
        const tenantId = await this.getTenantId(tenantSlug);
        const result = await this.db.query.navigations.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.navigations.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.navigations.location, location), (0, drizzle_orm_1.eq)(schema_1.navigations.isActive, true)),
            with: {
                items: {
                    orderBy: [(0, drizzle_orm_1.asc)(schema_1.navigationItems.order)],
                    with: {
                        children: {
                            orderBy: [(0, drizzle_orm_1.asc)(schema_1.navigationItems.order)],
                        },
                    },
                },
            },
        });
        return result ?? null;
    }
    async subscribeToNewsletter(tenantSlug, data) {
        const tenantId = await this.getTenantId(tenantSlug);
        const [existing] = await this.db
            .select()
            .from(schema_1.newsletterSubscribers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.email, data.email)))
            .limit(1);
        if (existing) {
            if (existing.status === 'unsubscribed') {
                await this.db
                    .update(schema_1.newsletterSubscribers)
                    .set({
                    status: 'active',
                    subscribedAt: new Date(),
                    unsubscribedAt: null,
                    source: data.source ?? 'website-resubscribe',
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.id, existing.id));
                return { success: true, message: 'Willkommen zurück!' };
            }
            return { success: true, message: 'Du bist bereits angemeldet!' };
        }
        await this.db.insert(schema_1.newsletterSubscribers).values({
            tenantId,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            status: 'active',
            source: data.source ?? 'website',
            subscribedAt: new Date(),
            unsubscribeToken: (0, crypto_1.randomUUID)(),
            confirmToken: (0, crypto_1.randomUUID)(),
        });
        return { success: true, message: 'Erfolgreich angemeldet! 🎉' };
    }
    async submitContactForm(tenantSlug, data) {
        const tenantId = await this.getTenantId(tenantSlug);
        await this.db.insert(schema_1.emailLogs).values({
            tenantId,
            to: 'contact-form',
            from: data.email,
            subject: data.subject ?? `Kontaktanfrage von ${data.name}`,
            template: 'contact-form',
            status: 'received',
            error: JSON.stringify({
                name: data.name,
                email: data.email,
                message: data.message,
                phone: data.phone,
                submittedAt: new Date().toISOString(),
            }),
        });
        return { success: true, message: 'Deine Nachricht wurde gesendet!' };
    }
    async customerRegister(tenantSlug, data) {
        const tenantId = await this.getTenantId(tenantSlug);
        const existing = await this.db
            .select({ id: schema_1.tenantCustomers.id })
            .from(schema_1.tenantCustomers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenantCustomers.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.tenantCustomers.email, data.email)))
            .limit(1);
        if (existing.length > 0) {
            throw new common_1.ConflictException('E-Mail bereits registriert');
        }
        const passwordHash = await bcrypt.hash(data.password, 10);
        const result = await this.db
            .insert(schema_1.tenantCustomers)
            .values({
            tenantId,
            email: data.email,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            isMember: false,
        })
            .returning();
        const customer = result[0];
        const accessToken = this.jwtService.sign({
            customerId: customer.id,
            tenantId,
            type: 'customer',
        });
        return {
            accessToken,
            customer: {
                id: customer.id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
            },
        };
    }
    async customerLogin(tenantSlug, data) {
        const tenantId = await this.getTenantId(tenantSlug);
        const result = await this.db
            .select()
            .from(schema_1.tenantCustomers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenantCustomers.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.tenantCustomers.email, data.email), (0, drizzle_orm_1.eq)(schema_1.tenantCustomers.isActive, true)))
            .limit(1);
        const customer = result[0];
        if (!customer?.passwordHash) {
            throw new common_1.UnauthorizedException('Ungültige Anmeldedaten');
        }
        const valid = await bcrypt.compare(data.password, customer.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Ungültige Anmeldedaten');
        const accessToken = this.jwtService.sign({
            customerId: customer.id,
            tenantId,
            type: 'customer',
        });
        return {
            accessToken,
            customer: {
                id: customer.id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
            },
        };
    }
    async getCustomerOrders(tenantSlug, token) {
        let payload;
        try {
            payload = this.jwtService.verify(token);
        }
        catch {
            throw new common_1.UnauthorizedException('Ungültiges Token');
        }
        if (payload.type !== 'customer') {
            throw new common_1.UnauthorizedException();
        }
        const tenantId = await this.getTenantId(tenantSlug);
        const customerResult = await this.db
            .select({ email: schema_1.tenantCustomers.email })
            .from(schema_1.tenantCustomers)
            .where((0, drizzle_orm_1.eq)(schema_1.tenantCustomers.id, payload.customerId))
            .limit(1);
        const customer = customerResult[0];
        if (!customer)
            throw new common_1.UnauthorizedException();
        return this.db
            .select()
            .from(schema_1.orders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.orders.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.orders.customerEmail, customer.email)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt));
    }
    async getPublicForms(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT id, name, slug, description, fields, success_message 
        FROM forms 
        WHERE tenant_id = ${tenantId} AND is_active = true 
        ORDER BY created_at DESC`);
        return result.rows || [];
    }
    async getPublicBookingServices(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT id, name, description, duration, price, currency, color
        FROM booking_services 
        WHERE tenant_id = ${tenantId} AND is_active = true 
        ORDER BY name ASC`);
        return result.rows || [];
    }
    async getRestaurantSettings(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const [s] = await this.db
            .select()
            .from(schema_1.restaurantSettings)
            .where((0, drizzle_orm_1.eq)(schema_1.restaurantSettings.tenantId, tenantId));
        return s ?? null;
    }
    async getRestaurantMenu(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const cats = await this.db
            .select()
            .from(schema_1.menuCategories)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.menuCategories.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.menuCategories.isActive, true)))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.menuCategories.position));
        const items = await this.db
            .select()
            .from(schema_1.menuItems)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.menuItems.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.menuItems.isAvailable, true)))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.menuItems.position));
        return cats.map((cat) => ({
            ...cat,
            items: items.filter((i) => i.categoryId === cat.id),
        }));
    }
    async getLocalStoreSettings(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const [s] = await this.db
            .select()
            .from(schema_1.localStoreSettings)
            .where((0, drizzle_orm_1.eq)(schema_1.localStoreSettings.tenantId, tenantId));
        return s ?? null;
    }
    async getLocalStoreProducts(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        return this.db
            .select()
            .from(schema_1.localProducts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localProducts.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.localProducts.isAvailable, true)))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.localProducts.name));
    }
    async getLocalStoreSlots(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        return this.db
            .select()
            .from(schema_1.localPickupSlots)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localPickupSlots.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.localPickupSlots.isActive, true)))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.localPickupSlots.dayOfWeek), (0, drizzle_orm_1.asc)(schema_1.localPickupSlots.startTime));
    }
    async getPublicCourses(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        return this.db
            .select()
            .from(schema_1.courses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courses.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.courses.isPublished, true)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.courses.createdAt));
    }
    async getPublicCourseBySlug(tenantSlug, slug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const [course] = await this.db
            .select()
            .from(schema_1.courses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courses.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.courses.slug, slug), (0, drizzle_orm_1.eq)(schema_1.courses.isPublished, true)));
        if (!course)
            throw new common_1.NotFoundException('Kurs nicht gefunden');
        const chapters = await this.db
            .select()
            .from(schema_1.courseChapters)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courseChapters.courseId, course.id), (0, drizzle_orm_1.eq)(schema_1.courseChapters.isPublished, true)))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.courseChapters.position));
        const chaptersWithLessons = await Promise.all(chapters.map(async (ch) => {
            const lessons = await this.db
                .select()
                .from(schema_1.courseLessons)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courseLessons.chapterId, ch.id), (0, drizzle_orm_1.eq)(schema_1.courseLessons.isPublished, true)))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.courseLessons.position));
            return { ...ch, lessons };
        }));
        return { ...course, chapters: chaptersWithLessons };
    }
    async getPublicMembershipPlans(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        return this.db
            .select()
            .from(schema_1.membershipPlans)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.membershipPlans.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.membershipPlans.isActive, true)))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.membershipPlans.position));
    }
    async getPublicFunnel(tenantSlug, slug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const [funnel] = await this.db
            .select()
            .from(schema_1.funnels)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.funnels.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.funnels.slug, slug), (0, drizzle_orm_1.eq)(schema_1.funnels.isPublished, true)));
        if (!funnel)
            throw new common_1.NotFoundException('Funnel nicht gefunden');
        const steps = await this.db
            .select()
            .from(schema_1.funnelSteps)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.funnelSteps.funnelId, funnel.id), (0, drizzle_orm_1.eq)(schema_1.funnelSteps.isActive, true)))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.funnelSteps.position));
        return { ...funnel, steps };
    }
};
exports.PublicService = PublicService;
exports.PublicService = PublicService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService])
], PublicService);
//# sourceMappingURL=public.service.js.map