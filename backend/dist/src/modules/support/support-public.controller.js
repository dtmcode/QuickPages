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
exports.SupportPublicController = void 0;
const common_1 = require("@nestjs/common");
const support_service_1 = require("./support.service");
let SupportPublicController = class SupportPublicController {
    supportService;
    constructor(supportService) {
        this.supportService = supportService;
    }
    async createTicket(slug, body) {
        const tenantId = await this.supportService.getTenantIdBySlug(slug);
        if (!tenantId)
            throw new common_1.HttpException('Nicht gefunden', common_1.HttpStatus.NOT_FOUND);
        if (!body.subject ||
            !body.customerName ||
            !body.customerEmail ||
            !body.message) {
            throw new common_1.HttpException('Alle Pflichtfelder ausfüllen', common_1.HttpStatus.BAD_REQUEST);
        }
        const ticket = await this.supportService.createTicket(tenantId, body);
        return {
            success: true,
            ticketNumber: ticket.ticket_number,
            token: ticket.token,
        };
    }
    async getTicket(slug, token) {
        const ticket = await this.supportService.getTicketByToken(token);
        if (!ticket)
            throw new common_1.HttpException('Ticket nicht gefunden', common_1.HttpStatus.NOT_FOUND);
        const messages = await this.supportService.getMessages(ticket.id, false);
        return { ticket, messages };
    }
    async reply(token, body) {
        if (!body.content)
            throw new common_1.HttpException('Nachricht darf nicht leer sein', common_1.HttpStatus.BAD_REQUEST);
        try {
            await this.supportService.addPublicMessage(token, body);
            return { success: true };
        }
        catch (err) {
            throw new common_1.HttpException(err instanceof Error ? err.message : 'Fehler', common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.SupportPublicController = SupportPublicController;
__decorate([
    (0, common_1.Post)('ticket'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SupportPublicController.prototype, "createTicket", null);
__decorate([
    (0, common_1.Get)('ticket/:token'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SupportPublicController.prototype, "getTicket", null);
__decorate([
    (0, common_1.Post)('ticket/:token/reply'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SupportPublicController.prototype, "reply", null);
exports.SupportPublicController = SupportPublicController = __decorate([
    (0, common_1.Controller)('api/public/:tenant/support'),
    __metadata("design:paramtypes", [support_service_1.SupportService])
], SupportPublicController);
//# sourceMappingURL=support-public.controller.js.map