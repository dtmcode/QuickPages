/**
 * ==================== BOOKING RESOLVER ====================
 * Dashboard API (Auth required)
 */

import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';
import { BookingService } from './booking.service';
import {
  BookingServiceType,
  BookingAvailabilityType,
  BookingSlotType,
  BookingDateType,
  AppointmentType,
  BookingSettingsType,
  CreateBookingServiceInput,
  AvailabilitySlotInput,
  BookingSettingsInput,
} from './dto/booking.types';

@Resolver()
export class BookingResolver {
  constructor(private bookingService: BookingService) {}

  // ===== SERVICES =====
  @Query(() => [BookingServiceType])
  @UseGuards(GqlAuthGuard)
  async bookingServices(@TenantId() tenantId: string) {
    const rows = await this.bookingService.getServices(tenantId);
    return rows.map(this.mapService);
  }

  @Mutation(() => BookingServiceType)
  @UseGuards(GqlAuthGuard)
  async createBookingService(
    @Args('input') input: CreateBookingServiceInput,
    @TenantId() tenantId: string,
  ) {
    return this.mapService(
      await this.bookingService.createService(tenantId, input),
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteBookingService(
    @Args('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.bookingService.deleteService(tenantId, id);
  }

  // ===== AVAILABILITY =====
  @Query(() => [BookingAvailabilityType])
  @UseGuards(GqlAuthGuard)
  async bookingAvailability(@TenantId() tenantId: string) {
    const rows = await this.bookingService.getAvailability(tenantId);
    return rows.map((r: any) => ({
      dayOfWeek: r.day_of_week,
      startTime: r.start_time,
      endTime: r.end_time,
      isActive: r.is_active,
    }));
  }

  @Mutation(() => [BookingAvailabilityType])
  @UseGuards(GqlAuthGuard)
  async setBookingAvailability(
    @Args({ name: 'slots', type: () => [AvailabilitySlotInput] })
    slots: AvailabilitySlotInput[],
    @TenantId() tenantId: string,
  ) {
    const rows = await this.bookingService.setAvailability(tenantId, slots);
    return rows.map((r: any) => ({
      dayOfWeek: r.day_of_week,
      startTime: r.start_time,
      endTime: r.end_time,
      isActive: r.is_active,
    }));
  }

  // ===== BLOCKED DATES =====
  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async addBookingBlockedDate(
    @Args('date') date: string,
    @Args('reason', { nullable: true }) reason: string,
    @TenantId() tenantId: string,
  ) {
    await this.bookingService.addBlockedDate(tenantId, date, reason);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async removeBookingBlockedDate(
    @Args('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.bookingService.removeBlockedDate(tenantId, id);
  }

  // ===== APPOINTMENTS =====
  @Query(() => [AppointmentType])
  @UseGuards(GqlAuthGuard)
  async bookingAppointments(
    @TenantId() tenantId: string,
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
    @Args('status', { nullable: true }) status?: string,
  ) {
    const rows = await this.bookingService.getAppointments(tenantId, {
      startDate,
      endDate,
      status,
    });
    return rows.map(this.mapAppointment);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async cancelBookingAppointment(
    @Args('id') id: string,
    @Args('reason', { nullable: true }) reason: string,
    @TenantId() tenantId: string,
  ) {
    await this.bookingService.cancelAppointment(tenantId, id, reason);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async updateAppointmentStatus(
    @Args('id') id: string,
    @Args('status') status: string,
    @TenantId() tenantId: string,
  ) {
    await this.bookingService.updateAppointmentStatus(tenantId, id, status);
    return true;
  }

  // ===== SETTINGS =====
  @Query(() => BookingSettingsType)
  @UseGuards(GqlAuthGuard)
  async bookingSettings(@TenantId() tenantId: string) {
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

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async updateBookingSettings(
    @Args('input') input: BookingSettingsInput,
    @TenantId() tenantId: string,
  ) {
    await this.bookingService.updateSettings(tenantId, input);
    return true;
  }

  // ===== HELPERS =====
  private mapService(r: any): BookingServiceType {
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

  private mapAppointment(r: any): AppointmentType {
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
}
