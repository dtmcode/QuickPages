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
        return await this.publicService.getTenantSettings(tenantSlug);
    }
    async getBranding(tenantSlug) {
        return await this.publicService.getTenantBranding(tenantSlug);
    }
    async getPages(tenantSlug) {
        return await this.publicService.getPublishedPages(tenantSlug);
    }
    async getPage(tenantSlug, pageSlug) {
        return await this.publicService.getPageBySlug(tenantSlug, pageSlug);
    }
    async getNavigation(tenantSlug, location) {
        return await this.publicService.getNavigation(tenantSlug, location);
    }
    async getProducts(tenantSlug) {
        return await this.publicService.getProducts(tenantSlug);
    }
    async getProduct(tenantSlug, productSlug) {
        return await this.publicService.getProductBySlug(tenantSlug, productSlug);
    }
    async createOrder(tenantSlug, body) {
        return await this.publicService.createPublicOrder(tenantSlug, body);
    }
    async getPosts(tenantSlug) {
        return await this.publicService.getPublishedPosts(tenantSlug);
    }
    async getPost(tenantSlug, postSlug) {
        return await this.publicService.getPostBySlug(tenantSlug, postSlug);
    }
    async getCategories(tenantSlug) {
        return await this.publicService.getCategories(tenantSlug);
    }
    async getWbHomepage(tenantSlug) {
        const templateId = await this.getDefaultTemplateId(tenantSlug);
        if (!templateId)
            throw new common_1.NotFoundException('No default template found');
        return await this.publicService.getWbHomepage(tenantSlug, templateId);
    }
    async getWbPages(tenantSlug) {
        const templateId = await this.getDefaultTemplateId(tenantSlug);
        if (!templateId)
            return [];
        return await this.publicService.getPublishedWbPages(tenantSlug, templateId);
    }
    async getWbPage(tenantSlug, pageSlug) {
        const templateId = await this.getDefaultTemplateId(tenantSlug);
        if (!templateId)
            throw new common_1.NotFoundException('No default template found');
        return await this.publicService.getWbPageBySlug(tenantSlug, templateId, pageSlug);
    }
    async subscribe(tenantSlug, body) {
        return await this.publicService.subscribeToNewsletter(tenantSlug, body);
    }
    async contact(tenantSlug, body) {
        return await this.publicService.submitContactForm(tenantSlug, body);
    }
    async customerRegister(tenantSlug, body) {
        return await this.publicService.customerRegister(tenantSlug, body);
    }
    async customerLogin(tenantSlug, body) {
        return await this.publicService.customerLogin(tenantSlug, body);
    }
    async getCustomerOrders(tenantSlug, auth) {
        const token = auth?.replace('Bearer ', '');
        if (!token)
            throw new common_1.NotFoundException('Unauthorized');
        return await this.publicService.getCustomerOrders(tenantSlug, token);
    }
    async getDefaultTemplateId(tenantSlug) {
        try {
            const tenant = await this.publicService.getTenantSettings(tenantSlug);
            const settings = tenant.settings;
            if (settings?.defaultTemplateId)
                return settings.defaultTemplateId;
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
    (0, common_1.Get)('branding'),
    __param(0, (0, common_1.Param)('tenant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getBranding", null);
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
    (0, common_1.Post)('orders'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "createOrder", null);
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
__decorate([
    (0, common_1.Post)('newsletter/subscribe'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "subscribe", null);
__decorate([
    (0, common_1.Post)('contact'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "contact", null);
__decorate([
    (0, common_1.Post)('auth/register'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "customerRegister", null);
__decorate([
    (0, common_1.Post)('auth/login'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "customerLogin", null);
__decorate([
    (0, common_1.Get)('account/orders'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getCustomerOrders", null);
exports.PublicController = PublicController = __decorate([
    (0, common_1.Controller)('api/public/:tenant'),
    __metadata("design:paramtypes", [public_service_1.PublicService])
], PublicController);
//# sourceMappingURL=public.controller.js.map