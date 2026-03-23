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
exports.DomainResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../core/auth/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../core/auth/decorators/current-user.decorator");
const domain_service_1 = require("./domain.service");
const domain_types_1 = require("./dto/domain.types");
let DomainResolver = class DomainResolver {
    domainService;
    constructor(domainService) {
        this.domainService = domainService;
    }
    async domainStatus(tenantId) {
        const status = await this.domainService.getDomainStatus(tenantId);
        return {
            ...status,
            customDomain: status.customDomain ?? undefined,
            sslExpiresAt: status.sslExpiresAt ?? undefined,
            verificationToken: status.verificationToken ?? undefined,
            lastDnsCheck: status.lastDnsCheck ?? undefined,
        };
    }
    async addCustomDomain(domain, tenantId, user) {
        if (user.role !== 'owner') {
            throw new Error('Nur der Owner kann Domains verwalten');
        }
        return this.domainService.addCustomDomain(tenantId, domain);
    }
    async removeCustomDomain(tenantId, user) {
        if (user.role !== 'owner') {
            throw new Error('Nur der Owner kann Domains verwalten');
        }
        return this.domainService.removeCustomDomain(tenantId);
    }
    async verifyDomain(tenantId) {
        return this.domainService.verifyDomain(tenantId);
    }
};
exports.DomainResolver = DomainResolver;
__decorate([
    (0, graphql_1.Query)(() => domain_types_1.DomainStatusResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DomainResolver.prototype, "domainStatus", null);
__decorate([
    (0, graphql_1.Mutation)(() => domain_types_1.AddDomainResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('domain')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DomainResolver.prototype, "addCustomDomain", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DomainResolver.prototype, "removeCustomDomain", null);
__decorate([
    (0, graphql_1.Mutation)(() => domain_types_1.VerifyDomainResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DomainResolver.prototype, "verifyDomain", null);
exports.DomainResolver = DomainResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [domain_service_1.DomainService])
], DomainResolver);
//# sourceMappingURL=domain.resolver.js.map