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
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const public_service_1 = require("./public.service");
let PublicController = class PublicController {
    publicService;
    constructor(publicService) {
        this.publicService = publicService;
    }
    async getTenantSettings(tenantSlug) {
        return this.publicService.getTenantSettings(tenantSlug);
    }
    async getPages(tenantSlug) {
        return this.publicService.getPublishedPages(tenantSlug);
    }
    async getPage(tenantSlug, pageSlug) {
        return this.publicService.getPageBySlug(tenantSlug, pageSlug);
    }
    async getNavigation(tenantSlug, location) {
        return this.publicService.getNavigation(tenantSlug, location);
    }
    async getProducts(tenantSlug) {
        return this.publicService.getProducts(tenantSlug);
    }
    async getProduct(tenantSlug, productSlug) {
        return this.publicService.getProductBySlug(tenantSlug, productSlug);
    }
    async getPosts(tenantSlug) {
        return this.publicService.getPublishedPosts(tenantSlug);
    }
    async getPost(tenantSlug, postSlug) {
        return this.publicService.getPostBySlug(tenantSlug, postSlug);
    }
    async getCategories(tenantSlug) {
        return this.publicService.getCategories(tenantSlug);
    }
    async getWbHomepage(tenantSlug) {
        const templateId = await this.getDefaultTemplateId(tenantSlug);
        if (!templateId) {
            throw new common_1.NotFoundException('No default template found');
        }
        return this.publicService.getWbHomepage(tenantSlug, templateId);
    }
    async getWbPages(tenantSlug) {
        const templateId = await this.getDefaultTemplateId(tenantSlug);
        if (!templateId) {
            return [];
        }
        return this.publicService.getPublishedWbPages(tenantSlug, templateId);
    }
    async getWbPage(tenantSlug, pageSlug) {
        const templateId = await this.getDefaultTemplateId(tenantSlug);
        if (!templateId) {
            throw new common_1.NotFoundException('No default template found');
        }
        return this.publicService.getWbPageBySlug(tenantSlug, templateId, pageSlug);
    }
    async getDefaultTemplateId(tenantSlug) {
        try {
            const tenant = await this.publicService.getTenantSettings(tenantSlug);
            const settings = tenant.settings;
            if (settings?.defaultTemplateId) {
                return settings.defaultTemplateId;
            }
            return await this.publicService.getDefaultTemplateId(tenantSlug);
        }
        catch {
            return null;
        }
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Get)('settings'),
    __param(0, (0, common_1.Param)('tenant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getTenantSettings", null);
__decorate([
    (0, common_1.Get)('pages'),
    __param(0, (0, common_1.Param)('tenant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getPages", null);
__decorate([
    (0, common_1.Get)('pages/:slug'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getPage", null);
__decorate([
    (0, common_1.Get)('navigation/:location'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Param)('location')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getNavigation", null);
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Param)('tenant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('products/:slug'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getProduct", null);
__decorate([
    (0, common_1.Get)('posts'),
    __param(0, (0, common_1.Param)('tenant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getPosts", null);
__decorate([
    (0, common_1.Get)('posts/:slug'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getPost", null);
__decorate([
    (0, common_1.Get)('categories'),
    __param(0, (0, common_1.Param)('tenant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('wb/homepage'),
    __param(0, (0, common_1.Param)('tenant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getWbHomepage", null);
__decorate([
    (0, common_1.Get)('wb/pages'),
    __param(0, (0, common_1.Param)('tenant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getWbPages", null);
__decorate([
    (0, common_1.Get)('wb/pages/:slug'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getWbPage", null);
exports.PublicController = PublicController = __decorate([
    (0, common_1.Controller)('api/public/:tenant'),
    __metadata("design:paramtypes", [public_service_1.PublicService])
], PublicController);
//# sourceMappingURL=public.controller.js.map