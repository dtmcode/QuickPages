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
exports.CampaignResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../core/auth/decorators/tenant-id.decorator");
const campaign_service_1 = require("./campaign.service");
const campaign_types_1 = require("./dto/campaign.types");
let CampaignResolver = class CampaignResolver {
    campaignService;
    constructor(campaignService) {
        this.campaignService = campaignService;
    }
    async newsletterCampaigns(tenantId, status, limit, offset) {
        return this.campaignService.getCampaigns(tenantId, {
            status,
            limit,
            offset,
        });
    }
    async newsletterCampaign(tenantId, id) {
        return this.campaignService.getCampaign(tenantId, id);
    }
    async campaignStats(tenantId, id) {
        return this.campaignService.getCampaignStats(tenantId, id);
    }
    async createCampaign(tenantId, input) {
        return this.campaignService.createCampaign(tenantId, input);
    }
    async updateCampaign(tenantId, id, input) {
        return this.campaignService.updateCampaign(tenantId, id, input);
    }
    async deleteCampaign(tenantId, id) {
        return this.campaignService.deleteCampaign(tenantId, id);
    }
    async sendCampaign(tenantId, id) {
        return this.campaignService.sendCampaign(tenantId, id);
    }
    async duplicateCampaign(tenantId, id) {
        return this.campaignService.duplicateCampaign(tenantId, id);
    }
};
exports.CampaignResolver = CampaignResolver;
__decorate([
    (0, graphql_1.Query)(() => [campaign_types_1.NewsletterCampaign]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('status', { nullable: true })),
    __param(2, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __param(3, (0, graphql_1.Args)('offset', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], CampaignResolver.prototype, "newsletterCampaigns", null);
__decorate([
    (0, graphql_1.Query)(() => campaign_types_1.NewsletterCampaign, { nullable: true }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CampaignResolver.prototype, "newsletterCampaign", null);
__decorate([
    (0, graphql_1.Query)(() => campaign_types_1.CampaignStats),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CampaignResolver.prototype, "campaignStats", null);
__decorate([
    (0, graphql_1.Mutation)(() => campaign_types_1.NewsletterCampaign),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, campaign_types_1.CreateCampaignInput]),
    __metadata("design:returntype", Promise)
], CampaignResolver.prototype, "createCampaign", null);
__decorate([
    (0, graphql_1.Mutation)(() => campaign_types_1.NewsletterCampaign),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id')),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, campaign_types_1.UpdateCampaignInput]),
    __metadata("design:returntype", Promise)
], CampaignResolver.prototype, "updateCampaign", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CampaignResolver.prototype, "deleteCampaign", null);
__decorate([
    (0, graphql_1.Mutation)(() => campaign_types_1.SendCampaignResult),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CampaignResolver.prototype, "sendCampaign", null);
__decorate([
    (0, graphql_1.Mutation)(() => campaign_types_1.NewsletterCampaign),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CampaignResolver.prototype, "duplicateCampaign", null);
exports.CampaignResolver = CampaignResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [campaign_service_1.CampaignService])
], CampaignResolver);
//# sourceMappingURL=campaign.resolver.js.map