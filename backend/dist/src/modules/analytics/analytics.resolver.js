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
exports.AnalyticsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../core/auth/decorators/tenant-id.decorator");
const analytics_service_1 = require("./analytics.service");
const analytics_types_1 = require("./dto/analytics.types");
let AnalyticsResolver = class AnalyticsResolver {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async analyticsDashboard(startDate, endDate, tenantId) {
        this.validateDateRange(startDate, endDate);
        const [overview, dailyStats, topPages, topReferrers, breakdowns, realtimeVisitors,] = await Promise.all([
            this.analyticsService.getOverview(tenantId, startDate, endDate),
            this.analyticsService.getDailyStats(tenantId, startDate, endDate),
            this.analyticsService.getTopPages(tenantId, startDate, endDate, 10),
            this.analyticsService.getTopReferrers(tenantId, startDate, endDate, 10),
            this.analyticsService.getBreakdowns(tenantId, startDate, endDate),
            this.analyticsService.getRealtimeVisitors(tenantId),
        ]);
        return {
            overview,
            dailyStats,
            topPages,
            topReferrers,
            breakdowns,
            realtimeVisitors,
        };
    }
    async analyticsOverview(startDate, endDate, tenantId) {
        this.validateDateRange(startDate, endDate);
        return this.analyticsService.getOverview(tenantId, startDate, endDate);
    }
    async analyticsDailyStats(startDate, endDate, tenantId) {
        this.validateDateRange(startDate, endDate);
        return this.analyticsService.getDailyStats(tenantId, startDate, endDate);
    }
    async analyticsTopPages(startDate, endDate, limit, tenantId) {
        this.validateDateRange(startDate, endDate);
        return this.analyticsService.getTopPages(tenantId, startDate, endDate, limit);
    }
    async analyticsRealtimeVisitors(tenantId) {
        return this.analyticsService.getRealtimeVisitors(tenantId);
    }
    validateDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Ungültiges Datumsformat. Nutze YYYY-MM-DD.');
        }
        if (start > end) {
            throw new Error('startDate muss vor endDate liegen');
        }
        const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 365) {
            throw new Error('Maximaler Zeitraum: 365 Tage');
        }
    }
};
exports.AnalyticsResolver = AnalyticsResolver;
__decorate([
    (0, graphql_1.Query)(() => analytics_types_1.AnalyticsDashboardData),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('startDate')),
    __param(1, (0, graphql_1.Args)('endDate')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "analyticsDashboard", null);
__decorate([
    (0, graphql_1.Query)(() => analytics_types_1.AnalyticsOverview),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('startDate')),
    __param(1, (0, graphql_1.Args)('endDate')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "analyticsOverview", null);
__decorate([
    (0, graphql_1.Query)(() => [analytics_types_1.AnalyticsDailyPoint]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('startDate')),
    __param(1, (0, graphql_1.Args)('endDate')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "analyticsDailyStats", null);
__decorate([
    (0, graphql_1.Query)(() => [analytics_types_1.TopPageEntry]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('startDate')),
    __param(1, (0, graphql_1.Args)('endDate')),
    __param(2, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, defaultValue: 10 })),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "analyticsTopPages", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_1.Int),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "analyticsRealtimeVisitors", null);
exports.AnalyticsResolver = AnalyticsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsResolver);
//# sourceMappingURL=analytics.resolver.js.map