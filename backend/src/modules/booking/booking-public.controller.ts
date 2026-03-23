/**
 * ==================== BOOKING PUBLIC CONTROLLER ====================
 * REST API für öffentliche Buchungsseite (kein Auth nötig)
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('api/public/:tenant/booking')
export class BookingPublicController {
  constructor(private bookingService: BookingService) {}

  /** GET /api/public/:tenant/booking/services */
  @Get('services')
  async getServices(@Param('tenant') slug: string) {
    const tenantId = await this.bookingService.getTenantIdBySlug(slug);
    if (!tenantId)
      throw new HttpException('Nicht gefunden', HttpStatus.NOT_FOUND);
    return this.bookingService.getActiveServices(tenantId);
  }

  /** GET /api/public/:tenant/booking/settings */
  @Get('settings')
  async getSettings(@Param('tenant') slug: string) {
    const tenantId = await this.bookingService.getTenantIdBySlug(slug);
    if (!tenantId)
      throw new HttpException('Nicht gefunden', HttpStatus.NOT_FOUND);
    const s = await this.bookingService.getSettings(tenantId);
    return {
      title: s.booking_page_title,
      description: s.booking_page_description,
      cancellationPolicy: s.cancellation_policy,
      timezone: s.timezone,
    };
  }

  /** GET /api/public/:tenant/booking/dates?serviceId=xxx */
  @Get('dates')
  async getAvailableDates(
    @Param('tenant') slug: string,
    @Query('serviceId') serviceId: string,
  ) {
    const tenantId = await this.bookingService.getTenantIdBySlug(slug);
    if (!tenantId)
      throw new HttpException('Nicht gefunden', HttpStatus.NOT_FOUND);
    return this.bookingService.getAvailableDates(tenantId, serviceId);
  }

  /** GET /api/public/:tenant/booking/slots?serviceId=xxx&date=2025-03-15 */
  @Get('slots')
  async getSlots(
    @Param('tenant') slug: string,
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    const tenantId = await this.bookingService.getTenantIdBySlug(slug);
    if (!tenantId)
      throw new HttpException('Nicht gefunden', HttpStatus.NOT_FOUND);
    return this.bookingService.getAvailableSlots(tenantId, serviceId, date);
  }

  /** POST /api/public/:tenant/booking/book */
  @Post('book')
  async createBooking(
    @Param('tenant') slug: string,
    @Body()
    body: {
      serviceId: string;
      date: string;
      startTime: string;
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      customerNotes?: string;
    },
  ) {
    const tenantId = await this.bookingService.getTenantIdBySlug(slug);
    if (!tenantId)
      throw new HttpException('Nicht gefunden', HttpStatus.NOT_FOUND);

    if (
      !body.serviceId ||
      !body.date ||
      !body.startTime ||
      !body.customerName ||
      !body.customerEmail
    ) {
      throw new HttpException(
        'Alle Pflichtfelder ausfüllen',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const appointment = await this.bookingService.createAppointment(
        tenantId,
        body,
      );
      return { success: true, appointment };
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  /** POST /api/public/:tenant/booking/cancel?token=xxx */
  @Post('cancel')
  async cancelByToken(@Query('token') token: string) {
    if (!token) throw new HttpException('Token fehlt', HttpStatus.BAD_REQUEST);
    try {
      await this.bookingService.cancelByToken(token);
      return { success: true, message: 'Termin storniert' };
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
