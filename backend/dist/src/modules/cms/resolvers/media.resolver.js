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
exports.MediaResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../../core/auth/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../../core/auth/decorators/current-user.decorator");
const media_service_1 = require("../services/media.service");
const media_types_1 = require("../dto/media.types");
const graphql_upload_ts_1 = require("graphql-upload-ts");
let MediaResolver = class MediaResolver {
    mediaService;
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    async mediaFiles(tenantId, type, folder, search, limit, offset) {
        return this.mediaService.getFiles(tenantId, {
            type,
            folder,
            search,
            limit,
            offset,
        });
    }
    async mediaFile(tenantId, id) {
        return this.mediaService.getFile(tenantId, id);
    }
    async mediaFolders(tenantId) {
        return this.mediaService.getFolders(tenantId);
    }
    async uploadMedia(tenantId, user, file, folder, alt, title) {
        const { createReadStream, filename, mimetype } = await file;
        const stream = createReadStream();
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        return this.mediaService.uploadFile(tenantId, {
            filename: filename.replace(/[^a-zA-Z0-9.-]/g, '_'),
            originalFilename: filename,
            mimeType: mimetype,
            fileSize: buffer.length,
            buffer,
            folder,
            alt,
            title,
            userId: user.userId,
        });
    }
    async updateMedia(tenantId, id, input) {
        return this.mediaService.updateFile(tenantId, id, input);
    }
    async deleteMedia(tenantId, id) {
        return this.mediaService.deleteFile(tenantId, id);
    }
};
exports.MediaResolver = MediaResolver;
__decorate([
    (0, graphql_1.Query)(() => [media_types_1.MediaFile]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('type', { nullable: true })),
    __param(2, (0, graphql_1.Args)('folder', { nullable: true })),
    __param(3, (0, graphql_1.Args)('search', { nullable: true })),
    __param(4, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __param(5, (0, graphql_1.Args)('offset', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], MediaResolver.prototype, "mediaFiles", null);
__decorate([
    (0, graphql_1.Query)(() => media_types_1.MediaFile, { nullable: true }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MediaResolver.prototype, "mediaFile", null);
__decorate([
    (0, graphql_1.Query)(() => [String]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaResolver.prototype, "mediaFolders", null);
__decorate([
    (0, graphql_1.Mutation)(() => media_types_1.MediaFile),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, graphql_1.Args)({ name: 'file', type: () => graphql_upload_ts_1.GraphQLUpload })),
    __param(3, (0, graphql_1.Args)('folder', { nullable: true })),
    __param(4, (0, graphql_1.Args)('alt', { nullable: true })),
    __param(5, (0, graphql_1.Args)('title', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], MediaResolver.prototype, "uploadMedia", null);
__decorate([
    (0, graphql_1.Mutation)(() => media_types_1.MediaFile),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id')),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, media_types_1.UpdateMediaInput]),
    __metadata("design:returntype", Promise)
], MediaResolver.prototype, "updateMedia", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MediaResolver.prototype, "deleteMedia", null);
exports.MediaResolver = MediaResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaResolver);
//# sourceMappingURL=media.resolver.js.map