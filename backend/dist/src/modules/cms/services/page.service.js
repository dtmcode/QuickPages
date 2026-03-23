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
exports.PageService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../../core/database/drizzle.module");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const page_types_1 = require("../dto/page.types");
let PageService = class PageService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createPage(tenantId, input) {
        const [page] = await this.db
            .insert(schema_1.pages)
            .values({
            tenantId,
            title: input.title,
            slug: input.slug,
            content: input.content,
            excerpt: input.excerpt,
            featuredImage: input.featuredImage,
            metaDescription: input.metaDescription,
            status: (input.status || page_types_1.PageStatus.draft),
            template: (input.template || page_types_1.PageTemplate.default),
            isPublished: input.status === page_types_1.PageStatus.published,
            publishedAt: input.status === page_types_1.PageStatus.published ? new Date() : null,
        })
            .returning();
        return page;
    }
    async getPages(tenantId, options) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.pages.tenantId, tenantId)];
        if (options?.status) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.pages.status, options.status));
        }
        if (options?.search) {
            conditions.push((0, drizzle_orm_1.like)(schema_1.pages.title, `%${options.search}%`));
        }
        const query = this.db
            .select()
            .from(schema_1.pages)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.pages.createdAt));
        if (options?.limit) {
            query.limit(options.limit);
        }
        if (options?.offset) {
            query.offset(options.offset);
        }
        return query;
    }
    async getPage(tenantId, pageId) {
        const [page] = await this.db
            .select()
            .from(schema_1.pages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.pages.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.pages.id, pageId)))
            .limit(1);
        return page;
    }
    async getPageBySlug(tenantId, slug) {
        const [page] = await this.db
            .select()
            .from(schema_1.pages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.pages.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.pages.slug, slug)))
            .limit(1);
        return page;
    }
    async updatePage(tenantId, pageId, input) {
        const updateData = {
            ...input,
            updatedAt: new Date(),
        };
        if (input.status === page_types_1.PageStatus.published) {
            updateData.isPublished = true;
            updateData.publishedAt = new Date();
        }
        else if (input.status === page_types_1.PageStatus.draft ||
            input.status === page_types_1.PageStatus.archived) {
            updateData.isPublished = false;
        }
        const [updated] = await this.db
            .update(schema_1.pages)
            .set(updateData)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.pages.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.pages.id, pageId)))
            .returning();
        return updated;
    }
    async deletePage(tenantId, pageId) {
        await this.db
            .delete(schema_1.pages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.pages.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.pages.id, pageId)));
        return true;
    }
    async duplicatePage(tenantId, pageId) {
        const original = await this.getPage(tenantId, pageId);
        if (!original) {
            throw new Error('Page not found');
        }
        const [duplicate] = await this.db
            .insert(schema_1.pages)
            .values({
            tenantId,
            title: `${original.title} (Copy)`,
            slug: `${original.slug}-copy-${Date.now()}`,
            content: original.content,
            excerpt: original.excerpt,
            featuredImage: original.featuredImage,
            metaDescription: original.metaDescription,
            status: page_types_1.PageStatus.draft,
            template: original.template,
            isPublished: false,
            publishedAt: null,
        })
            .returning();
        return duplicate;
    }
};
exports.PageService = PageService;
exports.PageService = PageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], PageService);
//# sourceMappingURL=page.service.js.map