"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BookingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const drizzle_module_1 = require("../../core/database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
let BookingService = BookingService_1 = class BookingService {
    db;
    logger = new common_1.Logger(BookingService_1.name);
    constructor(db) {
        this.db = db;
    }
    async getServices(tenantId) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT * FROM booking_services WHERE tenant_id = ${tenantId} ORDER BY sort_order ASC, name ASC`);
        return result.rows || [];
    }
    async getActiveServices(tenantId) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT * FROM booking_services WHERE tenant_id = ${tenantId} AND is_active = true ORDER BY sort_order ASC`);
        return result.rows || [];
    }
    async createService(tenantId, data) {
        const slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-') +
            '-' +
            Date.now().toString(36);
        const result = await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO booking_services (tenant_id, name, slug, description, duration_minutes, buffer_minutes, price, color, max_bookings_per_slot, requires_confirmation)
          VALUES (${tenantId}, ${data.name}, ${slug}, ${data.description || null}, ${data.durationMinutes},
                  ${data.bufferMinutes || 0}, ${data.price || 0}, ${data.color || '#3b82f6'},
                  ${data.maxBookingsPerSlot || 1}, ${data.requiresConfirmation || false})
          RETURNING *`);
        return result.rows?.[0];
    }
    async updateService(tenantId, serviceId, data) {
        const setClauses = Object.entries(data)
            .filter(([_, v]) => v !== undefined)
            .map(([k, _]) => `${this.toSnakeCase(k)} = $${k}`)
            .join(', ');
        const result = await this.db.execute((0, drizzle_orm_1.sql) `UPDATE booking_services SET 
            name = COALESCE(${data.name}, name),
            description = COALESCE(${data.description}, description),
            duration_minutes = COALESCE(${data.durationMinutes}, duration_minutes),
            buffer_minutes = COALESCE(${data.bufferMinutes}, buffer_minutes),
            price = COALESCE(${data.price}, price),
            color = COALESCE(${data.color}, color),
            max_bookings_per_slot = COALESCE(${data.maxBookingsPerSlot}, max_bookings_per_slot),
            requires_confirmation = COALESCE(${data.requiresConfirmation}, requires_confirmation),
            is_active = COALESCE(${data.isActive}, is_active),
            updated_at = NOW()
          WHERE id = ${serviceId} AND tenant_id = ${tenantId}
          RETURNING *`);
        return result.rows?.[0];
    }
    async deleteService(tenantId, serviceId) {
        await this.db.execute((0, drizzle_orm_1.sql) `DELETE FROM booking_services WHERE id = ${serviceId} AND tenant_id = ${tenantId}`);
        return true;
    }
    async getAvailability(tenantId) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT * FROM booking_availability WHERE tenant_id = ${tenantId} ORDER BY day_of_week ASC`);
        return result.rows || [];
    }
    async setAvailability(tenantId, slots) {
        await this.db.execute((0, drizzle_orm_1.sql) `DELETE FROM booking_availability WHERE tenant_id = ${tenantId}`);
        for (const slot of slots) {
            await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO booking_availability (tenant_id, day_of_week, start_time, end_time, is_active)
            VALUES (${tenantId}, ${slot.dayOfWeek}, ${slot.startTime}, ${slot.endTime}, ${slot.isActive})`);
        }
        return this.getAvailability(tenantId);
    }
    async getBlockedDates(tenantId) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT * FROM booking_blocked_dates WHERE tenant_id = ${tenantId} AND date >= CURRENT_DATE ORDER BY date ASC`);
        return result.rows || [];
    }
    async addBlockedDate(tenantId, date, reason) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO booking_blocked_dates (tenant_id, date, reason)
          VALUES (${tenantId}, ${date}::date, ${reason || null})
          ON CONFLICT (tenant_id, date) DO UPDATE SET reason = EXCLUDED.reason
          RETURNING *`);
        return result.rows?.[0];
    }
    async removeBlockedDate(tenantId, blockedDateId) {
        await this.db.execute((0, drizzle_orm_1.sql) `DELETE FROM booking_blocked_dates WHERE id = ${blockedDateId} AND tenant_id = ${tenantId}`);
        return true;
    }
    async getSettings(tenantId) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT * FROM booking_settings WHERE tenant_id = ${tenantId} LIMIT 1`);
        if (result.rows?.length === 0) {
            const insert = await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO booking_settings (tenant_id) VALUES (${tenantId})
            ON CONFLICT (tenant_id) DO NOTHING
            RETURNING *`);
            return (insert.rows?.[0] || {
                timezone: 'Europe/Berlin',
                min_notice_hours: 24,
                max_advance_days: 60,
                slot_interval_minutes: 30,
            });
        }
        return result.rows[0];
    }
    async updateSettings(tenantId, data) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO booking_settings (tenant_id, timezone, min_notice_hours, max_advance_days, slot_interval_minutes,
            confirmation_email_enabled, reminder_email_hours, cancellation_policy, booking_page_title, booking_page_description)
          VALUES (${tenantId}, ${data.timezone || 'Europe/Berlin'}, ${data.minNoticeHours ?? 24}, ${data.maxAdvanceDays ?? 60},
                  ${data.slotIntervalMinutes ?? 30}, ${data.confirmationEmailEnabled ?? true}, ${data.reminderEmailHours ?? 24},
                  ${data.cancellationPolicy || null}, ${data.bookingPageTitle || null}, ${data.bookingPageDescription || null})
          ON CONFLICT (tenant_id) DO UPDATE SET
            timezone = EXCLUDED.timezone, min_notice_hours = EXCLUDED.min_notice_hours,
            max_advance_days = EXCLUDED.max_advance_days, slot_interval_minutes = EXCLUDED.slot_interval_minutes,
            confirmation_email_enabled = EXCLUDED.confirmation_email_enabled, reminder_email_hours = EXCLUDED.reminder_email_hours,
            cancellation_policy = EXCLUDED.cancellation_policy, booking_page_title = EXCLUDED.booking_page_title,
            booking_page_description = EXCLUDED.booking_page_description, updated_at = NOW()
          RETURNING *`);
        return result.rows?.[0];
    }
    async getAvailableSlots(tenantId, serviceId, date) {
        const serviceResult = await this.db.execute((0, drizzle_orm_1.sql) `SELECT * FROM booking_services WHERE id = ${serviceId} AND tenant_id = ${tenantId} AND is_active = true LIMIT 1`);
        const service = serviceResult.rows?.[0];
        if (!service)
            throw new Error('Service nicht gefunden');
        const settings = await this.getSettings(tenantId);
        const blockedResult = await this.db.execute((0, drizzle_orm_1.sql) `SELECT id FROM booking_blocked_dates WHERE tenant_id = ${tenantId} AND date = ${date}::date LIMIT 1`);
        if (blockedResult.rows?.length > 0)
            return [];
        const targetDate = new Date(date);
        const now = new Date();
        const minDate = new Date(now.getTime() + (settings.min_notice_hours || 24) * 60 * 60 * 1000);
        const maxDate = new Date(now.getTime() + (settings.max_advance_days || 60) * 24 * 60 * 60 * 1000);
        if (targetDate < new Date(now.toISOString().slice(0, 10)))
            return [];
        if (targetDate > maxDate)
            return [];
        const dayOfWeek = targetDate.getDay();
        const availResult = await this.db.execute((0, drizzle_orm_1.sql) `SELECT * FROM booking_availability WHERE tenant_id = ${tenantId} AND day_of_week = ${dayOfWeek} AND is_active = true LIMIT 1`);
        const availability = availResult.rows?.[0];
        if (!availability)
            return [];
        const appointmentsResult = await this.db.execute((0, drizzle_orm_1.sql) `SELECT start_time, end_time FROM booking_appointments
          WHERE tenant_id = ${tenantId} AND service_id = ${serviceId}
          AND date = ${date}::date AND status NOT IN ('cancelled')
          ORDER BY start_time ASC`);
        const existingAppointments = appointmentsResult.rows || [];
        const slots = [];
        const interval = settings.slot_interval_minutes || 30;
        const duration = service.duration_minutes;
        const buffer = service.buffer_minutes || 0;
        let currentMinutes = this.timeToMinutes(availability.start_time);
        const endMinutes = this.timeToMinutes(availability.end_time);
        while (currentMinutes + duration <= endMinutes) {
            const slotStart = this.minutesToTime(currentMinutes);
            const slotEnd = this.minutesToTime(currentMinutes + duration);
            const hasConflict = existingAppointments.some((apt) => {
                const aptStart = this.timeToMinutes(apt.start_time);
                const aptEnd = this.timeToMinutes(apt.end_time);
                return (currentMinutes < aptEnd + buffer &&
                    currentMinutes + duration + buffer > aptStart);
            });
            const isToday = date === now.toISOString().slice(0, 10);
            const isPast = isToday &&
                currentMinutes <
                    now.getHours() * 60 +
                        now.getMinutes() +
                        (settings.min_notice_hours || 0) * 60;
            const bookingsAtSlot = existingAppointments.filter((apt) => apt.start_time === slotStart).length;
            const maxReached = bookingsAtSlot >= (service.max_bookings_per_slot || 1);
            slots.push({
                startTime: slotStart,
                endTime: slotEnd,
                available: !hasConflict && !isPast && !maxReached,
            });
            currentMinutes += interval;
        }
        return slots;
    }
    async getAvailableDates(tenantId, serviceId, days = 60) {
        const settings = await this.getSettings(tenantId);
        const availability = await this.getAvailability(tenantId);
        const blockedDates = await this.getBlockedDates(tenantId);
        const blockedSet = new Set(blockedDates.map((b) => b.date));
        const activeDays = new Set(availability
            .filter((a) => a.is_active)
            .map((a) => a.day_of_week));
        const result = [];
        const now = new Date();
        for (let i = 0; i < Math.min(days, settings.max_advance_days || 60); i++) {
            const d = new Date(now);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().slice(0, 10);
            const dayOfWeek = d.getDay();
            const isAvailable = activeDays.has(dayOfWeek) && !blockedSet.has(dateStr);
            result.push({
                date: dateStr,
                available: isAvailable,
                slotsCount: 0,
            });
        }
        return result;
    }
    async createAppointment(tenantId, data) {
        const serviceResult = await this.db.execute((0, drizzle_orm_1.sql) `SELECT * FROM booking_services WHERE id = ${data.serviceId} AND tenant_id = ${tenantId} AND is_active = true LIMIT 1`);
        const service = serviceResult.rows?.[0];
        if (!service)
            throw new Error('Service nicht gefunden');
        const slots = await this.getAvailableSlots(tenantId, data.serviceId, data.date);
        const slot = slots.find((s) => s.startTime === data.startTime);
        if (!slot || !slot.available) {
            throw new Error('Dieser Zeitslot ist nicht mehr verfügbar');
        }
        const endTime = this.minutesToTime(this.timeToMinutes(data.startTime) + service.duration_minutes);
        const confirmationToken = crypto.randomBytes(16).toString('hex');
        const status = service.requires_confirmation ? 'pending' : 'confirmed';
        const result = await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO booking_appointments (tenant_id, service_id, customer_name, customer_email, customer_phone,
            customer_notes, date, start_time, end_time, status, confirmation_token)
          VALUES (${tenantId}, ${data.serviceId}, ${data.customerName}, ${data.customerEmail},
                  ${data.customerPhone || null}, ${data.customerNotes || null}, ${data.date}::date,
                  ${data.startTime}, ${endTime}, ${status}, ${confirmationToken})
          RETURNING *`);
        const appointment = result.rows?.[0];
        this.logger.log(`Termin gebucht: ${data.customerName} → ${service.name} am ${data.date} ${data.startTime}`);
        return { ...appointment, service_name: service.name };
    }
    async cancelAppointment(tenantId, appointmentId, reason) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `UPDATE booking_appointments SET status = 'cancelled', cancellation_reason = ${reason || null},
            cancelled_at = NOW(), updated_at = NOW()
          WHERE id = ${appointmentId} AND tenant_id = ${tenantId} AND status NOT IN ('cancelled', 'completed')
          RETURNING *`);
        const apt = result.rows?.[0];
        if (!apt)
            throw new Error('Termin nicht gefunden oder bereits storniert');
        return apt;
    }
    async cancelByToken(token) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `UPDATE booking_appointments SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
          WHERE confirmation_token = ${token} AND status NOT IN ('cancelled', 'completed')
          RETURNING *`);
        if (result.rows?.length === 0) {
            throw new Error('Ungültiger oder bereits stornierter Termin');
        }
        return result.rows[0];
    }
    async getAppointments(tenantId, filters) {
        let query = (0, drizzle_orm_1.sql) `SELECT a.*, s.name as service_name, s.color as service_color, s.duration_minutes
                    FROM booking_appointments a
                    JOIN booking_services s ON a.service_id = s.id
                    WHERE a.tenant_id = ${tenantId}`;
        if (filters?.startDate)
            query = (0, drizzle_orm_1.sql) `${query} AND a.date >= ${filters.startDate}::date`;
        if (filters?.endDate)
            query = (0, drizzle_orm_1.sql) `${query} AND a.date <= ${filters.endDate}::date`;
        if (filters?.status)
            query = (0, drizzle_orm_1.sql) `${query} AND a.status = ${filters.status}`;
        if (filters?.serviceId)
            query = (0, drizzle_orm_1.sql) `${query} AND a.service_id = ${filters.serviceId}`;
        query = (0, drizzle_orm_1.sql) `${query} ORDER BY a.date ASC, a.start_time ASC`;
        const result = await this.db.execute(query);
        return result.rows || [];
    }
    async updateAppointmentStatus(tenantId, appointmentId, status) {
        const validStatuses = [
            'confirmed',
            'cancelled',
            'completed',
            'no_show',
            'pending',
        ];
        if (!validStatuses.includes(status))
            throw new Error('Ungültiger Status');
        const result = await this.db.execute((0, drizzle_orm_1.sql) `UPDATE booking_appointments SET status = ${status}, updated_at = NOW()
          WHERE id = ${appointmentId} AND tenant_id = ${tenantId}
          RETURNING *`);
        return result.rows?.[0];
    }
    async getTenantIdBySlug(slug) {
        const [tenant] = await this.db
            .select({ id: schema_1.tenants.id })
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.slug, slug))
            .limit(1);
        return tenant?.id || null;
    }
    timeToMinutes(time) {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    }
    minutesToTime(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
    toSnakeCase(str) {
        return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    }
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = BookingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], BookingService);
//# sourceMappingURL=booking.service.js.map