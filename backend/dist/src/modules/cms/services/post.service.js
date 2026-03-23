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
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../../core/database/drizzle.module");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
let PostService = class PostService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createPost(tenantId, input) {
        const status = (input.status || 'draft').toLowerCase();
        const isPublished = status === 'published';
        const [post] = await this.db
            .insert(schema_1.posts)
            .values({
            tenantId,
            title: input.title,
            slug: input.slug,
            content: input.content,
            excerpt: input.excerpt,
            featuredImage: input.featuredImage,
            status: status,
            isPublished,
            publishedAt: isPublished
                ? input.publishedAt
                    ? new Date(input.publishedAt)
                    : new Date()
                : null,
            categoryId: input.categoryId || null,
        })
            .returning();
        return post;
    }
    async getPosts(tenantId, options) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.posts.tenantId, tenantId)];
        if (options?.status) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.posts.status, options.status.toLowerCase()));
        }
        if (options?.search) {
            conditions.push((0, drizzle_orm_1.like)(schema_1.posts.title, `%${options.search}%`));
        }
        const query = this.db
            .select()
            .from(schema_1.posts)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.posts.createdAt));
        if (options?.limit) {
            query.limit(options.limit);
        }
        if (options?.offset) {
            query.offset(options.offset);
        }
        return query;
    }
    async getPost(tenantId, postId) {
        const [post] = await this.db
            .select()
            .from(schema_1.posts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.posts.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.posts.id, postId)))
            .limit(1);
        if (!post) {
            throw new common_1.NotFoundException(`Post with ID ${postId} not found`);
        }
        return post;
    }
    async updatePost(tenantId, postId, input) {
        await this.getPost(tenantId, postId);
        const updateData = {
            ...input,
            updatedAt: new Date(),
        };
        if (input.status) {
            updateData.status = input.status.toLowerCase();
            if (updateData.status === 'published') {
                updateData.isPublished = true;
                if (input.publishedAt) {
                    updateData.publishedAt = new Date(input.publishedAt);
                }
                else if (!updateData.publishedAt) {
                    updateData.publishedAt = new Date();
                }
            }
            else if (updateData.status === 'draft' ||
                updateData.status === 'archived') {
                updateData.isPublished = false;
            }
        }
        const [updated] = await this.db
            .update(schema_1.posts)
            .set(updateData)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.posts.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.posts.id, postId)))
            .returning();
        return updated;
    }
    async deletePost(tenantId, postId) {
        await this.getPost(tenantId, postId);
        await this.db
            .delete(schema_1.posts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.posts.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.posts.id, postId)));
        return true;
    }
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], PostService);
//# sourceMappingURL=post.service.js.map