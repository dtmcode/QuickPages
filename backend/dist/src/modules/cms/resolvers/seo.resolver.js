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
exports.SeoResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../../core/auth/guards/gql-auth.guard");
const seo_service_1 = require("../services/seo.service");
const seo_types_1 = require("../dto/seo.types");
let SeoResolver = class SeoResolver {
    seoService;
    constructor(seoService) {
        this.seoService = seoService;
    }
    async seoMeta(entityType, entityId) {
        return this.seoService.getSeoMeta(entityType, entityId);
    }
    async updateSeoMeta(entityType, entityId, input) {
        return this.seoService.upsertSeoMeta(entityType, entityId, input);
    }
};
exports.SeoResolver = SeoResolver;
__decorate([
    (0, graphql_1.Query)(() => seo_types_1.SeoMeta, { nullable: true }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('entityType')),
    __param(1, (0, graphql_1.Args)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SeoResolver.prototype, "seoMeta", null);
__decorate([
    (0, graphql_1.Mutation)(() => seo_types_1.SeoMeta),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('entityType')),
    __param(1, (0, graphql_1.Args)('entityId')),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, seo_types_1.SeoMetaInput]),
    __metadata("design:returntype", Promise)
], SeoResolver.prototype, "updateSeoMeta", null);
exports.SeoResolver = SeoResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [seo_service_1.SeoService])
], SeoResolver);
//# sourceMappingURL=seo.resolver.js.map