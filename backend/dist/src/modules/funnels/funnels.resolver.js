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
exports.FunnelsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../core/auth/decorators/tenant-id.decorator");
const funnels_service_1 = require("./funnels.service");
const funnels_types_1 = require("./dto/funnels.types");
const funnels_input_1 = require("./dto/funnels.input");
let FunnelsResolver = class FunnelsResolver {
    funnelsService;
    constructor(funnelsService) {
        this.funnelsService = funnelsService;
    }
    async funnels(tenantId) {
        return this.funnelsService.getFunnels(tenantId);
    }
    async funnel(tenantId, id) {
        return this.funnelsService.getFunnelById(tenantId, id);
    }
    async publicFunnel(tenantId, slug) {
        return this.funnelsService.getFunnelBySlug(tenantId, slug);
    }
    async createFunnel(tenantId, input) {
        return this.funnelsService.createFunnel(tenantId, input);
    }
    async updateFunnel(tenantId, id, input) {
        return this.funnelsService.updateFunnel(tenantId, id, input);
    }
    async deleteFunnel(tenantId, id) {
        return this.funnelsService.deleteFunnel(tenantId, id);
    }
    async duplicateFunnel(tenantId, id) {
        return this.funnelsService.duplicateFunnel(tenantId, id);
    }
    async createFunnelStep(tenantId, input) {
        return this.funnelsService.createStep(tenantId, input);
    }
    async updateFunnelStep(tenantId, id, input) {
        return this.funnelsService.updateStep(tenantId, id, input);
    }
    async updateFunnelStepContent(tenantId, id, input) {
        return this.funnelsService.updateStepContent(tenantId, id, input);
    }
    async deleteFunnelStep(tenantId, id) {
        return this.funnelsService.deleteStep(tenantId, id);
    }
    async reorderFunnelSteps(tenantId, funnelId, stepIds) {
        return this.funnelsService.reorderSteps(tenantId, funnelId, stepIds);
    }
    async submitFunnel(tenantId, input) {
        return this.funnelsService.createSubmission(tenantId, input);
    }
    async funnelSubmissions(tenantId, funnelId) {
        return this.funnelsService.getSubmissions(tenantId, funnelId);
    }
    async trackFunnelEvent(tenantId, input) {
        return this.funnelsService.trackEvent(tenantId, input);
    }
    async funnelAnalytics(tenantId, funnelId) {
        return this.funnelsService.getAnalytics(tenantId, funnelId);
    }
};
exports.FunnelsResolver = FunnelsResolver;
__decorate([
    (0, graphql_1.Query)(() => funnels_types_1.FunnelsResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FunnelsResolver.prototype, "funnels", null);
__decorate([
    (0, graphql_1.Query)(() => funnels_types_1.Funnel),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FunnelsResolver.prototype, "funnel", null);
__decorate([
    (0, graphql_1.Query)(() => funnels_types_1.Funnel),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FunnelsResolver.prototype, "publicFunnel", null);
__decorate([
    (0, graphql_1.Mutation)(() => funnels_types_1.Funnel),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, funnels_input_1.CreateFunnelInput]),
    __metadata("design:returntype", Promise)
], FunnelsResolver.prototype, "createFunnel", null);
__decorate([
    (0, graphql_1.Mutation)(() => funnels_types_1.Funnel),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, funnels_input_1.UpdateFunnelInput]),
    __metadata("design:returntype", Promise)
], FunnelsResolver.prototype, "updateFunnel", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FunnelsResolver.prototype, "deleteFunnel", null);
__decorate([
    (0, graphql_1.Mutation)(() => funnels_types_1.Funnel),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FunnelsResolver.prototype, "duplicateFunnel", null);
__decorate([
    (0, graphql_1.Mutation)(() => funnels_types_1.FunnelStep),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, funnels_input_1.CreateFunnelStepInput]),
    __metadata("design:returntype", Promise)
], FunnelsResolver.prototype, "createFunnelStep", null);
__decorate([
    (0, graphql_1.Mutation)(() => funnels_types_1.FunnelStep),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, funnels_input_1.UpdateFunnelStepInput]),
    __metadata("design:returntype", Promise)
], FunnelsResolver.prototype, "updateFunnelStep", null);
__decorate([
    (0, graphql_1.Mutation)(() => funnels_types_1.FunnelStep),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, funnels_input_1.UpdateFunnelStepContentInput]),
    __metadata("design:returntype", Promise)
], FunnelsResolver.prototype, "updateFunnelStepContent", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FunnelsResolver.prototype, "deleteFunnelStep", null);
__decorate([
    (0, graphql_1.Mutation)(() => funnels_types_1.Funnel),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('funnelId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('stepIds', { type: () => [graphql_1.ID] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", Promise)
], FunnelsResolver.prototype, "reorderFunnelSteps", null);
__decorate([
    (0, graphql_1.Mutation)(() => funnels_types_1.FunnelSubmission),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, funnels_input_1.CreateFunnelSubmissionInput]),
    __metadata("design:returntype", Promise)
], FunnelsResolver.prototype, "submitFunnel", null);
__decorate([
    (0, graphql_1.Query)(() => funnels_types_1.FunnelSubmissionsResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('funnelId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FunnelsResolver.prototype, "funnelSubmissions", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, funnels_input_1.TrackFunnelEventInput]),
    __metadata("design:returntype", Promise)
], FunnelsResolver.prototype, "trackFunnelEvent", null);
__decorate([
    (0, graphql_1.Query)(() => funnels_types_1.FunnelAnalytics),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('funnelId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FunnelsResolver.prototype, "funnelAnalytics", null);
exports.FunnelsResolver = FunnelsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [funnels_service_1.FunnelsService])
], FunnelsResolver);
//# sourceMappingURL=funnels.resolver.js.map