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
exports.FormBuilderPublicController = void 0;
const common_1 = require("@nestjs/common");
const form_builder_service_1 = require("./form-builder.service");
let FormBuilderPublicController = class FormBuilderPublicController {
    formService;
    constructor(formService) {
        this.formService = formService;
    }
    async getForm(tenantSlug, slug) {
        const tid = await this.formService.getTenantIdBySlug(tenantSlug);
        if (!tid)
            throw new common_1.HttpException('Nicht gefunden', common_1.HttpStatus.NOT_FOUND);
        const form = (await this.formService.getFormBySlug(tid, slug));
        if (!form)
            throw new common_1.HttpException('Formular nicht gefunden', common_1.HttpStatus.NOT_FOUND);
        return {
            id: form.id,
            name: form.name,
            description: form.description,
            fields: form.fields,
            submitButtonText: form.submit_button_text,
            successMessage: form.success_message,
        };
    }
    async submitForm(tenantSlug, slug, body, req) {
        const tid = await this.formService.getTenantIdBySlug(tenantSlug);
        if (!tid)
            throw new common_1.HttpException('Nicht gefunden', common_1.HttpStatus.NOT_FOUND);
        try {
            await this.formService.submitForm(tid, slug, body, req.ip, req.headers['user-agent']);
            return { success: true };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
            throw new common_1.HttpException(message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.FormBuilderPublicController = FormBuilderPublicController;
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FormBuilderPublicController.prototype, "getForm", null);
__decorate([
    (0, common_1.Post)(':slug/submit'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Param)('slug')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], FormBuilderPublicController.prototype, "submitForm", null);
exports.FormBuilderPublicController = FormBuilderPublicController = __decorate([
    (0, common_1.Controller)('api/public/:tenant/forms'),
    __metadata("design:paramtypes", [form_builder_service_1.FormBuilderService])
], FormBuilderPublicController);
//# sourceMappingURL=form-builder-public.controller.js.map