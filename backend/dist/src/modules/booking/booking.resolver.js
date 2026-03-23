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
exports.BookingResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../core/auth/decorators/tenant-id.decorator");
const booking_service_1 = require("./booking.service");
const booking_types_1 = require("./dto/booking.types");
let BookingResolver = class BookingResolver {
    bookingService;
    constructor(bookingService) {
        this.bookingService = bookingService;
    }
    async bookingServices(tenantId) {
        const rows = await this.bookingService.getServices(tenantId);
        return rows.map(this.mapService);
    }
    async createBookingService(input, tenantId) {
        return this.mapService(await this.bookingService.createService(tenantId, input));
    }
    async deleteBookingService(id, tenantId) {
        return this.bookingService.deleteService(tenantId, id);
    }
    async bookingAvailability(tenantId) {
        const rows = await this.bookingService.getAvailability(tenantId);
        return rows.map((r) => ({
            dayOfWeek: r.day_of_week,
            startTime: r.start_time,
            endTime: r.end_time,
            isActive: r.is_active,
        }));
    }
    async setBookingAvailability(slots, tenantId) {
        const rows = await this.bookingService.setAvailability(tenantId, slots);
        return rows.map((r) => ({
            dayOfWeek: r.day_of_week,
            startTime: r.start_time,
            endTime: r.end_time,
            isActive: r.is_active,
        }));
    }
    async addBookingBlockedDate(date, reason, tenantId) {
        await this.bookingService.addBlockedDate(tenantId, date, reason);
        return true;
    }
    async removeBookingBlockedDate(id, tenantId) {
        return this.bookingService.removeBlockedDate(tenantId, id);
    }
    async bookingAppointments(tenantId, startDate, endDate, status) {
        const rows = await this.bookingService.getAppointments(tenantId, {
            startDate,
            endDate,
            status,
        });
        return rows.map(this.mapAppointment);
    }
    async cancelBookingAppointment(id, reason, tenantId) {
        await this.bookingService.cancelAppointment(tenantId, id, reason);
        return true;
    }
    async updateAppointmentStatus(id, status, tenantId) {
        await this.bookingService.updateAppointmentStatus(tenantId, id, status);
        return true;
    }
    async bookingSettings(tenantId) {
        const s = await this.bookingService.getSettings(tenantId);
        return {
            timezone: s.timezone,
            minNoticeHours: s.min_notice_hours,
            maxAdvanceDays: s.max_advance_days,
            slotIntervalMinutes: s.slot_interval_minutes,
            confirmationEmailEnabled: s.confirmation_email_enabled,
            reminderEmailHours: s.reminder_email_hours,
            cancellationPolicy: s.cancellation_policy,
            bookingPageTitle: s.booking_page_title,
            bookingPageDescription: s.booking_page_description,
        };
    }
    async updateBookingSettings(input, tenantId) {
        await this.bookingService.updateSettings(tenantId, input);
        return true;
    }
    mapService(r) {
        return {
            id: r.id,
            name: r.name,
            slug: r.slug,
            description: r.description,
            durationMinutes: r.duration_minutes,
            bufferMinutes: r.buffer_minutes,
            price: r.price,
            color: r.color,
            maxBookingsPerSlot: r.max_bookings_per_slot,
            requiresConfirmation: r.requires_confirmation,
            isActive: r.is_active,
        };
    }
    mapAppointment(r) {
        return {
            id: r.id,
            serviceId: r.service_id,
            serviceName: r.service_name,
            serviceColor: r.service_color,
            customerName: r.customer_name,
            customerEmail: r.customer_email,
            customerPhone: r.customer_phone,
            customerNotes: r.customer_notes,
            date: r.date,
            startTime: r.start_time,
            endTime: r.end_time,
            status: r.status,
            cancellationReason: r.cancellation_reason,
            createdAt: r.created_at,
        };
    }
};
exports.BookingResolver = BookingResolver;
__decorate([
    (0, graphql_1.Query)(() => [booking_types_1.BookingServiceType]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingResolver.prototype, "bookingServices", null);
__decorate([
    (0, graphql_1.Mutation)(() => booking_types_1.BookingServiceType),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [booking_types_1.CreateBookingServiceInput, String]),
    __metadata("design:returntype", Promise)
], BookingResolver.prototype, "createBookingService", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BookingResolver.prototype, "deleteBookingService", null);
__decorate([
    (0, graphql_1.Query)(() => [booking_types_1.BookingAvailabilityType]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingResolver.prototype, "bookingAvailability", null);
__decorate([
    (0, graphql_1.Mutation)(() => [booking_types_1.BookingAvailabilityType]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)({ name: 'slots', type: () => [booking_types_1.AvailabilitySlotInput] })),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], BookingResolver.prototype, "setBookingAvailability", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('date')),
    __param(1, (0, graphql_1.Args)('reason', { nullable: true })),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BookingResolver.prototype, "addBookingBlockedDate", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BookingResolver.prototype, "removeBookingBlockedDate", null);
__decorate([
    (0, graphql_1.Query)(() => [booking_types_1.AppointmentType]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(2, (0, graphql_1.Args)('endDate', { nullable: true })),
    __param(3, (0, graphql_1.Args)('status', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], BookingResolver.prototype, "bookingAppointments", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('reason', { nullable: true })),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BookingResolver.prototype, "cancelBookingAppointment", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('status')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BookingResolver.prototype, "updateAppointmentStatus", null);
__decorate([
    (0, graphql_1.Query)(() => booking_types_1.BookingSettingsType),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingResolver.prototype, "bookingSettings", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [booking_types_1.BookingSettingsInput, String]),
    __metadata("design:returntype", Promise)
], BookingResolver.prototype, "updateBookingSettings", null);
exports.BookingResolver = BookingResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [booking_service_1.BookingService])
], BookingResolver);
//# sourceMappingURL=booking.resolver.js.map