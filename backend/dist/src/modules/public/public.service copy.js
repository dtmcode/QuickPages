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
exports.PublicService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const website_builder_schema_1 = require("../../drizzle/website-builder.schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
let PublicService = class PublicService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getTenantSettings(tenantSlug) {
        const [tenant] = await this.db
            .select()
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenants.slug, tenantSlug), (0, drizzle_orm_1.eq)(schema_1.tenants.isActive, true)))
            .limit(1);
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        return {
            name: tenant.name,
            slug: tenant.slug,
            domain: tenant.domain,
            shopTemplate: tenant.shopTemplate,
            settings: tenant.settings,
        };
    }
    async getTenantId(tenantSlug) {
        const [tenant] = await this.db
            .select({ id: schema_1.tenants.id })
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenants.slug, tenantSlug), (0, drizzle_orm_1.eq)(schema_1.tenants.isActive, true)))
            .limit(1);
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        return tenant.id;
    }
    async getPublishedPages(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const result = await this.db
            .select()
            .from(schema_1.pages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.pages.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.pages.isPublished, true), (0, drizzle_orm_1.eq)(schema_1.pages.status, 'published')))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.pages.publishedAt));
        return result;
    }
    async getPageBySlug(tenantSlug, pageSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const [page] = await this.db
            .select()
            .from(schema_1.pages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.pages.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.pages.slug, pageSlug), (0, drizzle_orm_1.eq)(schema_1.pages.isPublished, true)))
            .limit(1);
        if (!page) {
            throw new common_1.NotFoundException('Page not found');
        }
        const [seo] = await this.db
            .select()
            .from(schema_1.seoMeta)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.seoMeta.entityType, 'page'), (0, drizzle_orm_1.eq)(schema_1.seoMeta.entityId, page.id)))
            .limit(1);
        return {
            ...page,
            seo: seo || null,
        };
    }
    async getPublishedWbPages(tenantSlug, templateId) {
        const tenantId = await this.getTenantId(tenantSlug);
        const wbPagesResult = await this.db.query.wbPages.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.tenantId, tenantId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.templateId, templateId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.isActive, true)),
            with: {
                sections: {
                    where: (0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.isActive, true),
                    orderBy: (0, drizzle_orm_1.asc)(website_builder_schema_1.wbSections.order),
                },
            },
            orderBy: (0, drizzle_orm_1.asc)(website_builder_schema_1.wbPages.order),
        });
        return wbPagesResult;
    }
    async getWbPageBySlug(tenantSlug, templateId, pageSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const wbPage = await this.db.query.wbPages.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.tenantId, tenantId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.templateId, templateId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.slug, pageSlug), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.isActive, true)),
            with: {
                sections: {
                    where: (0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.isActive, true),
                    orderBy: (0, drizzle_orm_1.asc)(website_builder_schema_1.wbSections.order),
                },
            },
        });
        if (!wbPage) {
            throw new common_1.NotFoundException('Website Builder Page not found');
        }
        return wbPage;
    }
    async getWbHomepage(tenantSlug, templateId) {
        const tenantId = await this.getTenantId(tenantSlug);
        const homepage = await this.db.query.wbPages.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.tenantId, tenantId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.templateId, templateId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.isHomepage, true), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.isActive, true)),
            with: {
                sections: {
                    where: (0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.isActive, true),
                    orderBy: (0, drizzle_orm_1.asc)(website_builder_schema_1.wbSections.order),
                },
            },
        });
        return homepage || null;
    }
    async getDefaultTemplateId(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const [defaultTemplate] = await this.db
            .select({ id: website_builder_schema_1.wbTemplates.id })
            .from(website_builder_schema_1.wbTemplates)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.tenantId, tenantId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.isDefault, true), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.isActive, true)))
            .limit(1);
        return defaultTemplate?.id || null;
    }
    async getPublishedPosts(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const result = await this.db
            .select()
            .from(schema_1.posts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.posts.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.posts.isPublished, true), (0, drizzle_orm_1.eq)(schema_1.posts.status, 'published')))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.posts.publishedAt));
        return result;
    }
    async getPostBySlug(tenantSlug, postSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const [post] = await this.db
            .select()
            .from(schema_1.posts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.posts.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.posts.slug, postSlug), (0, drizzle_orm_1.eq)(schema_1.posts.isPublished, true)))
            .limit(1);
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        const [seo] = await this.db
            .select()
            .from(schema_1.seoMeta)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.seoMeta.entityType, 'post'), (0, drizzle_orm_1.eq)(schema_1.seoMeta.entityId, post.id)))
            .limit(1);
        return {
            ...post,
            seo: seo || null,
        };
    }
    async getProducts(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const result = await this.db
            .select()
            .from(schema_1.products)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.products.isActive, true)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.products.createdAt));
        return result;
    }
    async getProductBySlug(tenantSlug, productSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        const [product] = await this.db
            .select()
            .from(schema_1.products)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.products.slug, productSlug), (0, drizzle_orm_1.eq)(schema_1.products.isActive, true)))
            .limit(1);
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const [seo] = await this.db
            .select()
            .from(schema_1.seoMeta)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.seoMeta.entityType, 'product'), (0, drizzle_orm_1.eq)(schema_1.seoMeta.entityId, product.id)))
            .limit(1);
        return {
            ...product,
            seo: seo || null,
        };
    }
    async getCategories(tenantSlug) {
        const tenantId = await this.getTenantId(tenantSlug);
        return this.db
            .select()
            .from(schema_1.categories)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.categories.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.categories.isActive, true)));
    }
    async getNavigation(tenantSlug, location) {
        const tenantId = await this.getTenantId(tenantSlug);
        const result = await this.db.query.navigations.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.navigations.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.navigations.location, location), (0, drizzle_orm_1.eq)(schema_1.navigations.isActive, true)),
            with: {
                items: {
                    orderBy: (0, drizzle_orm_1.asc)(schema_1.navigationItems.order),
                    with: {
                        children: {
                            orderBy: (0, drizzle_orm_1.asc)(schema_1.navigationItems.order),
                        },
                    },
                },
            },
        });
        return result || null;
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
                    source: data.source || 'website-resubscribe',
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.id, existing.id));
                return {
                    success: true,
                    message: 'Willkommen zurück! Du bist wieder angemeldet.',
                };
            }
            return { success: true, message: 'Du bist bereits angemeldet!' };
        }
        const unsubscribeToken = (0, crypto_1.randomUUID)();
        const confirmToken = (0, crypto_1.randomUUID)();
        await this.db.insert(schema_1.newsletterSubscribers).values({
            tenantId,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            status: 'active',
            source: data.source || 'website',
            subscribedAt: new Date(),
            unsubscribeToken,
            confirmToken,
        });
        return { success: true, message: 'Erfolgreich angemeldet! 🎉' };
    }
    async submitContactForm(tenantSlug, data) {
        const tenantId = await this.getTenantId(tenantSlug);
        await this.db.insert(schema_1.emailLogs).values({
            tenantId,
            to: 'contact-form',
            from: data.email,
            subject: data.subject || `Kontaktanfrage von ${data.name}`,
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
        console.log(`📬 Contact form from ${data.name} (${data.email}) for tenant ${tenantSlug}`);
        return {
            success: true,
            message: 'Deine Nachricht wurde gesendet! Wir melden uns bald.',
        };
    }
};
exports.PublicService = PublicService;
exports.PublicService = PublicService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], PublicService);
//# sourceMappingURL=public.service%20copy.js.map