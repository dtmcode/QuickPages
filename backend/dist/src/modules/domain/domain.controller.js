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
exports.DomainController = void 0;
const common_1 = require("@nestjs/common");
const domain_service_1 = require("./domain.service");
let DomainController = class DomainController {
    domainService;
    constructor(domainService) {
        this.domainService = domainService;
    }
    async lookupDomain(domain) {
        if (!domain) {
            throw new common_1.HttpException('domain Parameter fehlt', common_1.HttpStatus.BAD_REQUEST);
        }
        const tenant = await this.domainService.getTenantByDomain(domain);
        if (!tenant) {
            throw new common_1.HttpException('Domain nicht gefunden oder nicht verifiziert', common_1.HttpStatus.NOT_FOUND);
        }
        return {
            slug: tenant.slug,
            id: tenant.id,
        };
    }
    async getNginxConfig(domain) {
        const tenant = await this.domainService.getTenantByDomain(domain);
        if (!tenant) {
            throw new common_1.HttpException('Domain nicht gefunden', common_1.HttpStatus.NOT_FOUND);
        }
        const config = this.domainService.generateNginxConfig(domain, tenant.slug);
        return { domain, slug: tenant.slug, config };
    }
    async getAllNginxConfigs() {
        const configs = await this.domainService.generateAllNginxConfigs();
        return { count: configs.length, configs };
    }
    async getPendingSslDomains() {
        const domains = await this.domainService.getDomainsNeedingSsl();
        return { count: domains.length, domains };
    }
};
exports.DomainController = DomainController;
__decorate([
    (0, common_1.Get)('lookup'),
    __param(0, (0, common_1.Query)('domain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DomainController.prototype, "lookupDomain", null);
__decorate([
    (0, common_1.Get)('nginx/:domain'),
    __param(0, (0, common_1.Param)('domain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DomainController.prototype, "getNginxConfig", null);
__decorate([
    (0, common_1.Get)('nginx'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DomainController.prototype, "getAllNginxConfigs", null);
__decorate([
    (0, common_1.Get)('ssl/pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DomainController.prototype, "getPendingSslDomains", null);
exports.DomainController = DomainController = __decorate([
    (0, common_1.Controller)('api/domains'),
    __metadata("design:paramtypes", [domain_service_1.DomainService])
], DomainController);
//# sourceMappingURL=domain.controller.js.map