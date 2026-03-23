/**
 * ==================== BOOKING SERVICE ====================
 * Terminbuchungs-System für Dienstleister-Tenants
 *
 * Features:
 * - Services verwalten (Haarschnitt, Beratung, etc.)
 * - Verfügbarkeiten / Öffnungszeiten definieren
 * - Freie Slots berechnen
 * - Termine buchen + stornieren
 * - Geblockte Tage (Urlaub, Feiertage)
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { tenants } from '../../drizzle/schema';
import { eq, and, sql, gte, lte } from 'drizzle-orm';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // ==================== SERVICES ====================

  async getServices(tenantId: string) {
    const result = await this.db.execute(
      sql`SELECT * FROM booking_services WHERE tenant_id = ${tenantId} ORDER BY sort_order ASC, name ASC`,
    );
    return (result as any).rows || [];
  }

  async getActiveServices(tenantId: string) {
    const result = await this.db.execute(
      sql`SELECT * FROM booking_services WHERE tenant_id = ${tenantId} AND is_active = true ORDER BY sort_order ASC`,
    );
    return (result as any).rows || [];
  }

  async createService(
    tenantId: string,
    data: {
      name: string;
      description?: string;
      durationMinutes: number;
      bufferMinutes?: number;
      price?: number;
      color?: string;
      maxBookingsPerSlot?: number;
      requiresConfirmation?: boolean;
    },
  ) {
    const slug =
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-') +
      '-' +
      Date.now().toString(36);

    const result = await this.db.execute(
      sql`INSERT INTO booking_services (tenant_id, name, slug, description, duration_minutes, buffer_minutes, price, color, max_bookings_per_slot, requires_confirmation)
          VALUES (${tenantId}, ${data.name}, ${slug}, ${data.description || null}, ${data.durationMinutes},
                  ${data.bufferMinutes || 0}, ${data.price || 0}, ${data.color || '#3b82f6'},
                  ${data.maxBookingsPerSlot || 1}, ${data.requiresConfirmation || false})
          RETURNING *`,
    );
    return (result as any).rows?.[0];
  }

  async updateService(
    tenantId: string,
    serviceId: string,
    data: Record<string, any>,
  ) {
    const setClauses = Object.entries(data)
      .filter(([_, v]) => v !== undefined)
      .map(([k, _]) => `${this.toSnakeCase(k)} = $${k}`)
      .join(', ');

    // Simple update using raw SQL
    const result = await this.db.execute(
      sql`UPDATE booking_services SET 
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
          RETURNING *`,
    );
    return (result as any).rows?.[0];
  }

  async deleteService(tenantId: string, serviceId: string) {
    await this.db.execute(
      sql`DELETE FROM booking_services WHERE id = ${serviceId} AND tenant_id = ${tenantId}`,
    );
    return true;
  }

  // ==================== AVAILABILITY ====================

  async getAvailability(tenantId: string) {
    const result = await this.db.execute(
      sql`SELECT * FROM booking_availability WHERE tenant_id = ${tenantId} ORDER BY day_of_week ASC`,
    );
    return (result as any).rows || [];
  }

  async setAvailability(
    tenantId: string,
    slots: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isActive: boolean;
    }>,
  ) {
    // Delete existing
    await this.db.execute(
      sql`DELETE FROM booking_availability WHERE tenant_id = ${tenantId}`,
    );

    // Insert new
    for (const slot of slots) {
      await this.db.execute(
        sql`INSERT INTO booking_availability (tenant_id, day_of_week, start_time, end_time, is_active)
            VALUES (${tenantId}, ${slot.dayOfWeek}, ${slot.startTime}, ${slot.endTime}, ${slot.isActive})`,
      );
    }

    return this.getAvailability(tenantId);
  }

  // ==================== BLOCKED DATES ====================

  async getBlockedDates(tenantId: string) {
    const result = await this.db.execute(
      sql`SELECT * FROM booking_blocked_dates WHERE tenant_id = ${tenantId} AND date >= CURRENT_DATE ORDER BY date ASC`,
    );
    return (result as any).rows || [];
  }

  async addBlockedDate(tenantId: string, date: string, reason?: string) {
    const result = await this.db.execute(
      sql`INSERT INTO booking_blocked_dates (tenant_id, date, reason)
          VALUES (${tenantId}, ${date}::date, ${reason || null})
          ON CONFLICT (tenant_id, date) DO UPDATE SET reason = EXCLUDED.reason
          RETURNING *`,
    );
    return (result as any).rows?.[0];
  }

  async removeBlockedDate(tenantId: string, blockedDateId: string) {
    await this.db.execute(
      sql`DELETE FROM booking_blocked_dates WHERE id = ${blockedDateId} AND tenant_id = ${tenantId}`,
    );
    return true;
  }

  // ==================== SETTINGS ====================

  async getSettings(tenantId: string) {
    const result = await this.db.execute(
      sql`SELECT * FROM booking_settings WHERE tenant_id = ${tenantId} LIMIT 1`,
    );

    if ((result as any).rows?.length === 0) {
      // Default Settings erstellen
      const insert = await this.db.execute(
        sql`INSERT INTO booking_settings (tenant_id) VALUES (${tenantId})
            ON CONFLICT (tenant_id) DO NOTHING
            RETURNING *`,
      );
      return (
        (insert as any).rows?.[0] || {
          timezone: 'Europe/Berlin',
          min_notice_hours: 24,
          max_advance_days: 60,
          slot_interval_minutes: 30,
        }
      );
    }

    return (result as any).rows[0];
  }

  async updateSettings(tenantId: string, data: Record<string, any>) {
    const result = await this.db.execute(
      sql`INSERT INTO booking_settings (tenant_id, timezone, min_notice_hours, max_advance_days, slot_interval_minutes,
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
          RETURNING *`,
    );
    return (result as any).rows?.[0];
  }

  // ==================== AVAILABLE SLOTS ====================

  /**
   * Berechnet verfügbare Zeitslots für einen bestimmten Tag und Service
   */
  async getAvailableSlots(
    tenantId: string,
    serviceId: string,
    date: string,
  ): Promise<
    Array<{
      startTime: string;
      endTime: string;
      available: boolean;
    }>
  > {
    // Service laden
    const serviceResult = await this.db.execute(
      sql`SELECT * FROM booking_services WHERE id = ${serviceId} AND tenant_id = ${tenantId} AND is_active = true LIMIT 1`,
    );
    const service = (serviceResult as any).rows?.[0];
    if (!service) throw new Error('Service nicht gefunden');

    // Settings laden
    const settings = await this.getSettings(tenantId);

    // Prüfe ob Datum geblockt
    const blockedResult = await this.db.execute(
      sql`SELECT id FROM booking_blocked_dates WHERE tenant_id = ${tenantId} AND date = ${date}::date LIMIT 1`,
    );
    if ((blockedResult as any).rows?.length > 0) return [];

    // Prüfe ob Datum in der Zukunft und innerhalb des Buchungsfensters
    const targetDate = new Date(date);
    const now = new Date();
    const minDate = new Date(
      now.getTime() + (settings.min_notice_hours || 24) * 60 * 60 * 1000,
    );
    const maxDate = new Date(
      now.getTime() + (settings.max_advance_days || 60) * 24 * 60 * 60 * 1000,
    );

    if (targetDate < new Date(now.toISOString().slice(0, 10))) return [];
    if (targetDate > maxDate) return [];

    // Verfügbarkeit für diesen Wochentag laden
    const dayOfWeek = targetDate.getDay(); // 0=Sonntag
    const availResult = await this.db.execute(
      sql`SELECT * FROM booking_availability WHERE tenant_id = ${tenantId} AND day_of_week = ${dayOfWeek} AND is_active = true LIMIT 1`,
    );
    const availability = (availResult as any).rows?.[0];
    if (!availability) return [];

    // Bestehende Appointments für diesen Tag laden
    const appointmentsResult = await this.db.execute(
      sql`SELECT start_time, end_time FROM booking_appointments
          WHERE tenant_id = ${tenantId} AND service_id = ${serviceId}
          AND date = ${date}::date AND status NOT IN ('cancelled')
          ORDER BY start_time ASC`,
    );
    const existingAppointments = (appointmentsResult as any).rows || [];

    // Slots generieren
    const slots: Array<{
      startTime: string;
      endTime: string;
      available: boolean;
    }> = [];
    const interval = settings.slot_interval_minutes || 30;
    const duration = service.duration_minutes;
    const buffer = service.buffer_minutes || 0;

    let currentMinutes = this.timeToMinutes(availability.start_time);
    const endMinutes = this.timeToMinutes(availability.end_time);

    while (currentMinutes + duration <= endMinutes) {
      const slotStart = this.minutesToTime(currentMinutes);
      const slotEnd = this.minutesToTime(currentMinutes + duration);

      // Prüfe ob Slot mit bestehenden Appointments kollidiert
      const hasConflict = existingAppointments.some((apt: any) => {
        const aptStart = this.timeToMinutes(apt.start_time);
        const aptEnd = this.timeToMinutes(apt.end_time);
        return (
          currentMinutes < aptEnd + buffer &&
          currentMinutes + duration + buffer > aptStart
        );
      });

      // Prüfe ob Slot in der Vergangenheit (für heute)
      const isToday = date === now.toISOString().slice(0, 10);
      const isPast =
        isToday &&
        currentMinutes <
          now.getHours() * 60 +
            now.getMinutes() +
            (settings.min_notice_hours || 0) * 60;

      // Prüfe ob max Bookings pro Slot erreicht
      const bookingsAtSlot = existingAppointments.filter(
        (apt: any) => apt.start_time === slotStart,
      ).length;
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

  /**
   * Verfügbare Tage für die nächsten X Tage (für Kalender)
   */
  async getAvailableDates(
    tenantId: string,
    serviceId: string,
    days: number = 60,
  ): Promise<
    Array<{
      date: string;
      available: boolean;
      slotsCount: number;
    }>
  > {
    const settings = await this.getSettings(tenantId);
    const availability = await this.getAvailability(tenantId);
    const blockedDates = await this.getBlockedDates(tenantId);
    const blockedSet = new Set(blockedDates.map((b: any) => b.date));

    const activeDays = new Set(
      availability
        .filter((a: any) => a.is_active)
        .map((a: any) => a.day_of_week),
    );

    const result: Array<{
      date: string;
      available: boolean;
      slotsCount: number;
    }> = [];
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
        slotsCount: 0, // Wird lazy geladen wenn nötig
      });
    }

    return result;
  }

  // ==================== APPOINTMENTS ====================

  /**
   * Termin buchen
   */
  async createAppointment(
    tenantId: string,
    data: {
      serviceId: string;
      date: string;
      startTime: string;
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      customerNotes?: string;
    },
  ) {
    // Service laden
    const serviceResult = await this.db.execute(
      sql`SELECT * FROM booking_services WHERE id = ${data.serviceId} AND tenant_id = ${tenantId} AND is_active = true LIMIT 1`,
    );
    const service = (serviceResult as any).rows?.[0];
    if (!service) throw new Error('Service nicht gefunden');

    // Slot-Verfügbarkeit prüfen
    const slots = await this.getAvailableSlots(
      tenantId,
      data.serviceId,
      data.date,
    );
    const slot = slots.find((s) => s.startTime === data.startTime);
    if (!slot || !slot.available) {
      throw new Error('Dieser Zeitslot ist nicht mehr verfügbar');
    }

    const endTime = this.minutesToTime(
      this.timeToMinutes(data.startTime) + service.duration_minutes,
    );
    const confirmationToken = crypto.randomBytes(16).toString('hex');
    const status = service.requires_confirmation ? 'pending' : 'confirmed';

    const result = await this.db.execute(
      sql`INSERT INTO booking_appointments (tenant_id, service_id, customer_name, customer_email, customer_phone,
            customer_notes, date, start_time, end_time, status, confirmation_token)
          VALUES (${tenantId}, ${data.serviceId}, ${data.customerName}, ${data.customerEmail},
                  ${data.customerPhone || null}, ${data.customerNotes || null}, ${data.date}::date,
                  ${data.startTime}, ${endTime}, ${status}, ${confirmationToken})
          RETURNING *`,
    );

    const appointment = (result as any).rows?.[0];
    this.logger.log(
      `Termin gebucht: ${data.customerName} → ${service.name} am ${data.date} ${data.startTime}`,
    );

    return { ...appointment, service_name: service.name };
  }

  /**
   * Termin stornieren
   */
  async cancelAppointment(
    tenantId: string,
    appointmentId: string,
    reason?: string,
  ) {
    const result = await this.db.execute(
      sql`UPDATE booking_appointments SET status = 'cancelled', cancellation_reason = ${reason || null},
            cancelled_at = NOW(), updated_at = NOW()
          WHERE id = ${appointmentId} AND tenant_id = ${tenantId} AND status NOT IN ('cancelled', 'completed')
          RETURNING *`,
    );

    const apt = (result as any).rows?.[0];
    if (!apt) throw new Error('Termin nicht gefunden oder bereits storniert');

    return apt;
  }

  /**
   * Termin stornieren via Token (für Kunden-Emails)
   */
  async cancelByToken(token: string) {
    const result = await this.db.execute(
      sql`UPDATE booking_appointments SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
          WHERE confirmation_token = ${token} AND status NOT IN ('cancelled', 'completed')
          RETURNING *`,
    );

    if ((result as any).rows?.length === 0) {
      throw new Error('Ungültiger oder bereits stornierter Termin');
    }

    return (result as any).rows[0];
  }

  /**
   * Termine eines Tenants laden (Dashboard)
   */
  async getAppointments(
    tenantId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      status?: string;
      serviceId?: string;
    },
  ) {
    let query = sql`SELECT a.*, s.name as service_name, s.color as service_color, s.duration_minutes
                    FROM booking_appointments a
                    JOIN booking_services s ON a.service_id = s.id
                    WHERE a.tenant_id = ${tenantId}`;

    if (filters?.startDate)
      query = sql`${query} AND a.date >= ${filters.startDate}::date`;
    if (filters?.endDate)
      query = sql`${query} AND a.date <= ${filters.endDate}::date`;
    if (filters?.status) query = sql`${query} AND a.status = ${filters.status}`;
    if (filters?.serviceId)
      query = sql`${query} AND a.service_id = ${filters.serviceId}`;

    query = sql`${query} ORDER BY a.date ASC, a.start_time ASC`;

    const result = await this.db.execute(query);
    return (result as any).rows || [];
  }

  /**
   * Termin-Status aktualisieren
   */
  async updateAppointmentStatus(
    tenantId: string,
    appointmentId: string,
    status: string,
  ) {
    const validStatuses = [
      'confirmed',
      'cancelled',
      'completed',
      'no_show',
      'pending',
    ];
    if (!validStatuses.includes(status)) throw new Error('Ungültiger Status');

    const result = await this.db.execute(
      sql`UPDATE booking_appointments SET status = ${status}, updated_at = NOW()
          WHERE id = ${appointmentId} AND tenant_id = ${tenantId}
          RETURNING *`,
    );

    return (result as any).rows?.[0];
  }

  /**
   * Tenant ID aus Slug
   */
  async getTenantIdBySlug(slug: string): Promise<string | null> {
    const [tenant] = await this.db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);
    return tenant?.id || null;
  }

  // ==================== HELPERS ====================

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
