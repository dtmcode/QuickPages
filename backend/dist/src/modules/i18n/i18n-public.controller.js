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
exports.I18nPublicController = void 0;
const common_1 = require("@nestjs/common");
const i18n_service_1 = require("./i18n.service");
let I18nPublicController = class I18nPublicController {
    i18nService;
    constructor(i18nService) {
        this.i18nService = i18nService;
    }
    async getTranslations(slug, locale) {
        return this.i18nService.getPublicTranslations(slug, locale || 'de');
    }
};
exports.I18nPublicController = I18nPublicController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Query)('locale')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], I18nPublicController.prototype, "getTranslations", null);
exports.I18nPublicController = I18nPublicController = __decorate([
    (0, common_1.Controller)('api/public/:tenant/i18n'),
    __metadata("design:paramtypes", [i18n_service_1.I18nService])
], I18nPublicController);
//# sourceMappingURL=i18n-public.controller.js.map