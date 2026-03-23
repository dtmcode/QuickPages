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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingSettingsInput = exports.AvailabilitySlotInput = exports.CreateBookingServiceInput = exports.BookingSettingsType = exports.AppointmentType = exports.BookingDateType = exports.BookingSlotType = exports.BookingAvailabilityType = exports.BookingServiceType = void 0;
const graphql_1 = require("@nestjs/graphql");
let BookingServiceType = class BookingServiceType {
    id;
    name;
    slug;
    description;
    durationMinutes;
    bufferMinutes;
    price;
    color;
    maxBookingsPerSlot;
    requiresConfirmation;
    isActive;
};
exports.BookingServiceType = BookingServiceType;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BookingServiceType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BookingServiceType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BookingServiceType.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BookingServiceType.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BookingServiceType.prototype, "durationMinutes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BookingServiceType.prototype, "bufferMinutes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BookingServiceType.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BookingServiceType.prototype, "color", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BookingServiceType.prototype, "maxBookingsPerSlot", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], BookingServiceType.prototype, "requiresConfirmation", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], BookingServiceType.prototype, "isActive", void 0);
exports.BookingServiceType = BookingServiceType = __decorate([
    (0, graphql_1.ObjectType)()
], BookingServiceType);
let BookingAvailabilityType = class BookingAvailabilityType {
    dayOfWeek;
    startTime;
    endTime;
    isActive;
};
exports.BookingAvailabilityType = BookingAvailabilityType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BookingAvailabilityType.prototype, "dayOfWeek", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BookingAvailabilityType.prototype, "startTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BookingAvailabilityType.prototype, "endTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], BookingAvailabilityType.prototype, "isActive", void 0);
exports.BookingAvailabilityType = BookingAvailabilityType = __decorate([
    (0, graphql_1.ObjectType)()
], BookingAvailabilityType);
let BookingSlotType = class BookingSlotType {
    startTime;
    endTime;
    available;
};
exports.BookingSlotType = BookingSlotType;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BookingSlotType.prototype, "startTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BookingSlotType.prototype, "endTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], BookingSlotType.prototype, "available", void 0);
exports.BookingSlotType = BookingSlotType = __decorate([
    (0, graphql_1.ObjectType)()
], BookingSlotType);
let BookingDateType = class BookingDateType {
    date;
    available;
    slotsCount;
};
exports.BookingDateType = BookingDateType;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BookingDateType.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], BookingDateType.prototype, "available", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BookingDateType.prototype, "slotsCount", void 0);
exports.BookingDateType = BookingDateType = __decorate([
    (0, graphql_1.ObjectType)()
], BookingDateType);
let AppointmentType = class AppointmentType {
    id;
    serviceId;
    serviceName;
    serviceColor;
    customerName;
    customerEmail;
    customerPhone;
    customerNotes;
    date;
    startTime;
    endTime;
    status;
    cancellationReason;
    createdAt;
};
exports.AppointmentType = AppointmentType;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AppointmentType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AppointmentType.prototype, "serviceId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AppointmentType.prototype, "serviceName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AppointmentType.prototype, "serviceColor", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AppointmentType.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AppointmentType.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AppointmentType.prototype, "customerPhone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AppointmentType.prototype, "customerNotes", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AppointmentType.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AppointmentType.prototype, "startTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AppointmentType.prototype, "endTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AppointmentType.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AppointmentType.prototype, "cancellationReason", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AppointmentType.prototype, "createdAt", void 0);
exports.AppointmentType = AppointmentType = __decorate([
    (0, graphql_1.ObjectType)()
], AppointmentType);
let BookingSettingsType = class BookingSettingsType {
    timezone;
    minNoticeHours;
    maxAdvanceDays;
    slotIntervalMinutes;
    confirmationEmailEnabled;
    reminderEmailHours;
    cancellationPolicy;
    bookingPageTitle;
    bookingPageDescription;
};
exports.BookingSettingsType = BookingSettingsType;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BookingSettingsType.prototype, "timezone", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BookingSettingsType.prototype, "minNoticeHours", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BookingSettingsType.prototype, "maxAdvanceDays", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BookingSettingsType.prototype, "slotIntervalMinutes", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], BookingSettingsType.prototype, "confirmationEmailEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BookingSettingsType.prototype, "reminderEmailHours", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BookingSettingsType.prototype, "cancellationPolicy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BookingSettingsType.prototype, "bookingPageTitle", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BookingSettingsType.prototype, "bookingPageDescription", void 0);
exports.BookingSettingsType = BookingSettingsType = __decorate([
    (0, graphql_1.ObjectType)()
], BookingSettingsType);
let CreateBookingServiceInput = class CreateBookingServiceInput {
    name;
    description;
    durationMinutes;
    bufferMinutes;
    price;
    color;
    maxBookingsPerSlot;
    requiresConfirmation;
};
exports.CreateBookingServiceInput = CreateBookingServiceInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateBookingServiceInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateBookingServiceInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CreateBookingServiceInput.prototype, "durationMinutes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], CreateBookingServiceInput.prototype, "bufferMinutes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], CreateBookingServiceInput.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: '#3b82f6' }),
    __metadata("design:type", String)
], CreateBookingServiceInput.prototype, "color", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 1 }),
    __metadata("design:type", Number)
], CreateBookingServiceInput.prototype, "maxBookingsPerSlot", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    __metadata("design:type", Boolean)
], CreateBookingServiceInput.prototype, "requiresConfirmation", void 0);
exports.CreateBookingServiceInput = CreateBookingServiceInput = __decorate([
    (0, graphql_1.InputType)()
], CreateBookingServiceInput);
let AvailabilitySlotInput = class AvailabilitySlotInput {
    dayOfWeek;
    startTime;
    endTime;
    isActive;
};
exports.AvailabilitySlotInput = AvailabilitySlotInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AvailabilitySlotInput.prototype, "dayOfWeek", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AvailabilitySlotInput.prototype, "startTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AvailabilitySlotInput.prototype, "endTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], AvailabilitySlotInput.prototype, "isActive", void 0);
exports.AvailabilitySlotInput = AvailabilitySlotInput = __decorate([
    (0, graphql_1.InputType)()
], AvailabilitySlotInput);
let BookingSettingsInput = class BookingSettingsInput {
    timezone;
    minNoticeHours;
    maxAdvanceDays;
    slotIntervalMinutes;
    confirmationEmailEnabled;
    reminderEmailHours;
    cancellationPolicy;
    bookingPageTitle;
    bookingPageDescription;
};
exports.BookingSettingsInput = BookingSettingsInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BookingSettingsInput.prototype, "timezone", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], BookingSettingsInput.prototype, "minNoticeHours", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], BookingSettingsInput.prototype, "maxAdvanceDays", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], BookingSettingsInput.prototype, "slotIntervalMinutes", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], BookingSettingsInput.prototype, "confirmationEmailEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], BookingSettingsInput.prototype, "reminderEmailHours", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BookingSettingsInput.prototype, "cancellationPolicy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BookingSettingsInput.prototype, "bookingPageTitle", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BookingSettingsInput.prototype, "bookingPageDescription", void 0);
exports.BookingSettingsInput = BookingSettingsInput = __decorate([
    (0, graphql_1.InputType)()
], BookingSettingsInput);
//# sourceMappingURL=booking.types.js.map