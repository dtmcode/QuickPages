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
exports.CommentsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../core/auth/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../core/auth/decorators/current-user.decorator");
const comments_service_1 = require("./comments.service");
let CommentType = class CommentType {
    id;
    postId;
    parentId;
    authorName;
    authorEmail;
    authorUrl;
    content;
    status;
    likes;
    isPinned;
    postTitle;
    createdAt;
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CommentType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CommentType.prototype, "postId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CommentType.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CommentType.prototype, "authorName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CommentType.prototype, "authorEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CommentType.prototype, "authorUrl", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CommentType.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CommentType.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CommentType.prototype, "likes", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CommentType.prototype, "isPinned", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CommentType.prototype, "postTitle", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], CommentType.prototype, "createdAt", void 0);
CommentType = __decorate([
    (0, graphql_1.ObjectType)()
], CommentType);
let CommentCountsType = class CommentCountsType {
    pending;
    approved;
    spam;
    trash;
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CommentCountsType.prototype, "pending", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CommentCountsType.prototype, "approved", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CommentCountsType.prototype, "spam", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CommentCountsType.prototype, "trash", void 0);
CommentCountsType = __decorate([
    (0, graphql_1.ObjectType)()
], CommentCountsType);
let CommentsResolver = class CommentsResolver {
    commentsService;
    constructor(commentsService) {
        this.commentsService = commentsService;
    }
    async comments(tid, status, postId) {
        const rows = await this.commentsService.getComments(tid, {
            status,
            postId,
        });
        return rows.map((r) => ({
            id: r.id,
            postId: r.post_id,
            parentId: r.parent_id,
            authorName: r.author_name,
            authorEmail: r.author_email,
            authorUrl: r.author_url,
            content: r.content,
            status: r.status,
            likes: r.likes,
            isPinned: r.is_pinned,
            postTitle: r.post_title,
            createdAt: r.created_at,
        }));
    }
    async commentCounts(tid) {
        return this.commentsService.getCommentCounts(tid);
    }
    async approveComment(id, tid, user) {
        return this.commentsService.approveComment(tid, id, user.userId);
    }
    async rejectComment(id, tid) {
        return this.commentsService.rejectComment(tid, id);
    }
    async markCommentAsSpam(id, tid) {
        return this.commentsService.markAsSpam(tid, id);
    }
    async deleteComment(id, tid) {
        return this.commentsService.deleteComment(tid, id);
    }
    async pinComment(id, pinned, tid) {
        return this.commentsService.pinComment(tid, id, pinned);
    }
};
exports.CommentsResolver = CommentsResolver;
__decorate([
    (0, graphql_1.Query)(() => [CommentType]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('status', { nullable: true })),
    __param(2, (0, graphql_1.Args)('postId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CommentsResolver.prototype, "comments", null);
__decorate([
    (0, graphql_1.Query)(() => CommentCountsType),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentsResolver.prototype, "commentCounts", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CommentsResolver.prototype, "approveComment", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CommentsResolver.prototype, "rejectComment", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CommentsResolver.prototype, "markCommentAsSpam", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CommentsResolver.prototype, "deleteComment", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('pinned')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, String]),
    __metadata("design:returntype", Promise)
], CommentsResolver.prototype, "pinComment", null);
exports.CommentsResolver = CommentsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [comments_service_1.CommentsService])
], CommentsResolver);
//# sourceMappingURL=comments.resolver.js.map