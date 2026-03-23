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
exports.PageResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../../core/auth/decorators/tenant-id.decorator");
const page_service_1 = require("../services/page.service");
const page_types_1 = require("../dto/page.types");
let PageResolver = class PageResolver {
    pageService;
    constructor(pageService) {
        this.pageService = pageService;
    }
    async pages(tenantId, status, search, limit, offset) {
        return this.pageService.getPages(tenantId, {
            status,
            search,
            limit,
            offset,
        });
    }
    async page(tenantId, id) {
        return this.pageService.getPage(tenantId, id);
    }
    async pageBySlug(tenantId, slug) {
        return this.pageService.getPageBySlug(tenantId, slug);
    }
    async createPage(tenantId, input) {
        return this.pageService.createPage(tenantId, input);
    }
    async updatePage(tenantId, id, input) {
        return this.pageService.updatePage(tenantId, id, input);
    }
    async deletePage(tenantId, id) {
        return this.pageService.deletePage(tenantId, id);
    }
    async duplicatePage(tenantId, id) {
        return this.pageService.duplicatePage(tenantId, id);
    }
};
exports.PageResolver = PageResolver;
__decorate([
    (0, graphql_1.Query)(() => [page_types_1.Page]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('status', { nullable: true })),
    __param(2, (0, graphql_1.Args)('search', { nullable: true })),
    __param(3, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __param(4, (0, graphql_1.Args)('offset', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "pages", null);
__decorate([
    (0, graphql_1.Query)(() => page_types_1.Page, { nullable: true }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "page", null);
__decorate([
    (0, graphql_1.Query)(() => page_types_1.Page, { nullable: true }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "pageBySlug", null);
__decorate([
    (0, graphql_1.Mutation)(() => page_types_1.Page),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, page_types_1.CreatePageInput]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "createPage", null);
__decorate([
    (0, graphql_1.Mutation)(() => page_types_1.Page),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id')),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, page_types_1.UpdatePageInput]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "updatePage", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "deletePage", null);
__decorate([
    (0, graphql_1.Mutation)(() => page_types_1.Page),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "duplicatePage", null);
exports.PageResolver = PageResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [page_service_1.PageService])
], PageResolver);
//# sourceMappingURL=page.resolver.js.map