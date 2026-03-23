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
exports.BookingPublicController = void 0;
const common_1 = require("@nestjs/common");
const booking_service_1 = require("./booking.service");
let BookingPublicController = class BookingPublicController {
    bookingService;
    constructor(bookingService) {
        this.bookingService = bookingService;
    }
    async getServices(slug) {
        const tenantId = await this.bookingService.getTenantIdBySlug(slug);
        if (!tenantId)
            throw new common_1.HttpException('Nicht gefunden', common_1.HttpStatus.NOT_FOUND);
        return this.bookingService.getActiveServices(tenantId);
    }
    async getSettings(slug) {
        const tenantId = await this.bookingService.getTenantIdBySlug(slug);
        if (!tenantId)
            throw new common_1.HttpException('Nicht gefunden', common_1.HttpStatus.NOT_FOUND);
        const s = await this.bookingService.getSettings(tenantId);
        return {
            title: s.booking_page_title,
            description: s.booking_page_description,
            cancellationPolicy: s.cancellation_policy,
            timezone: s.timezone,
        };
    }
    async getAvailableDates(slug, serviceId) {
        const tenantId = await this.bookingService.getTenantIdBySlug(slug);
        if (!tenantId)
            throw new common_1.HttpException('Nicht gefunden', common_1.HttpStatus.NOT_FOUND);
        return this.bookingService.getAvailableDates(tenantId, serviceId);
    }
    async getSlots(slug, serviceId, date) {
        const tenantId = await this.bookingService.getTenantIdBySlug(slug);
        if (!tenantId)
            throw new common_1.HttpException('Nicht gefunden', common_1.HttpStatus.NOT_FOUND);
        return this.bookingService.getAvailableSlots(tenantId, serviceId, date);
    }
    async createBooking(slug, body) {
        const tenantId = await this.bookingService.getTenantIdBySlug(slug);
        if (!tenantId)
            throw new common_1.HttpException('Nicht gefunden', common_1.HttpStatus.NOT_FOUND);
        if (!body.serviceId ||
            !body.date ||
            !body.startTime ||
            !body.customerName ||
            !body.customerEmail) {
            throw new common_1.HttpException('Alle Pflichtfelder ausfüllen', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const appointment = await this.bookingService.createAppointment(tenantId, body);
            return { success: true, appointment };
        }
        catch (err) {
            throw new common_1.HttpException(err.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async cancelByToken(token) {
        if (!token)
            throw new common_1.HttpException('Token fehlt', common_1.HttpStatus.BAD_REQUEST);
        try {
            await this.bookingService.cancelByToken(token);
            return { success: true, message: 'Termin storniert' };
        }
        catch (err) {
            throw new common_1.HttpException(err.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.BookingPublicController = BookingPublicController;
__decorate([
    (0, common_1.Get)('services'),
    __param(0, (0, common_1.Param)('tenant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingPublicController.prototype, "getServices", null);
__decorate([
    (0, common_1.Get)('settings'),
    __param(0, (0, common_1.Param)('tenant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingPublicController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Get)('dates'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Query)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BookingPublicController.prototype, "getAvailableDates", null);
__decorate([
    (0, common_1.Get)('slots'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Query)('serviceId')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BookingPublicController.prototype, "getSlots", null);
__decorate([
    (0, common_1.Post)('book'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingPublicController.prototype, "createBooking", null);
__decorate([
    (0, common_1.Post)('cancel'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingPublicController.prototype, "cancelByToken", null);
exports.BookingPublicController = BookingPublicController = __decorate([
    (0, common_1.Controller)('api/public/:tenant/booking'),
    __metadata("design:paramtypes", [booking_service_1.BookingService])
], BookingPublicController);
//# sourceMappingURL=booking-public.controller.js.map