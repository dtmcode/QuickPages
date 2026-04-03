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
exports.PlatformPaymentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_payments_service_1 = require("./platform-payments.service");
let PlatformPaymentsController = class PlatformPaymentsController {
    platformPaymentsService;
    constructor(platformPaymentsService) {
        this.platformPaymentsService = platformPaymentsService;
    }
    async handleStripeWebhook(req, signature) {
        if (!signature)
            throw new common_1.BadRequestException('stripe-signature Header fehlt');
        const rawBody = req.rawBody;
        if (!rawBody)
            throw new common_1.BadRequestException('Raw body fehlt — prüfe main.ts Setup');
        try {
            await this.platformPaymentsService.handleWebhook(rawBody, signature);
            return { received: true };
        }
        catch (err) {
            console.error('❌ Stripe Webhook Fehler:', err.message);
            throw new common_1.BadRequestException(err.message);
        }
    }
};
exports.PlatformPaymentsController = PlatformPaymentsController;
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PlatformPaymentsController.prototype, "handleStripeWebhook", null);
exports.PlatformPaymentsController = PlatformPaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [platform_payments_service_1.PlatformPaymentsService])
], PlatformPaymentsController);
//# sourceMappingURL=platform-payments.controller.js.map