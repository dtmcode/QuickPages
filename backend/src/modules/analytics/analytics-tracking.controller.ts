/**
 * ==================== ANALYTICS TRACKING CONTROLLER ====================
 * Public REST endpoints for tracking page views
 *
 * Privacy-First:
 * - Kein Cookie, kein localStorage
 * - IP wird gehasht + täglicher Salt → kein Cross-Day Tracking
 * - User Agent nur für Device/Browser Stats
 * - DSGVO-konform: Keine personenbezogenen Daten
 *
 * Endpoints:
 * POST /api/analytics/:tenant/track          → Page View tracken
 * POST /api/analytics/:tenant/duration       → Session-Dauer updaten
 * GET  /api/analytics/:tenant/pixel          → Tracking Pixel (1x1 GIF)
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Res,
  HttpStatus,
  Header,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';

@Controller('api/analytics')
export class AnalyticsTrackingController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * POST /api/analytics/:tenant/track
   * Trackt einen Page View via JavaScript
   */
  @Post(':tenant/track')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Cache-Control', 'no-store')
  async trackPageView(
    @Param('tenant') tenantSlug: string,
    @Body() body: { path: string; referrer?: string; sessionId?: string },
    @Req() req: Request,
  ) {
    const tenantId = await this.analyticsService.getTenantIdBySlug(tenantSlug);
    if (!tenantId) {
      return { ok: false };
    }

    await this.analyticsService.trackPageView({
      tenantId,
      path: body.path || '/',
      referrer: body.referrer || req.headers.referer,
      userAgent: req.headers['user-agent'],
      ip: this.getClientIp(req),
      sessionId: body.sessionId,
    });

    return { ok: true };
  }

  /**
   * POST /api/analytics/:tenant/duration
   * Aktualisiert die Verweildauer (sent via sendBeacon on page unload)
   */
  @Post(':tenant/duration')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Cache-Control', 'no-store')
  async updateDuration(
    @Param('tenant') tenantSlug: string,
    @Body() body: { sessionId: string; path: string; duration: number },
  ) {
    if (!body.sessionId || !body.path || !body.duration) {
      return { ok: false };
    }

    await this.analyticsService.updateDuration(
      body.sessionId,
      body.path,
      Math.round(body.duration),
    );

    return { ok: true };
  }

  /**
   * GET /api/analytics/:tenant/pixel
   * Tracking Pixel (1x1 transparent GIF)
   * Für Clients ohne JavaScript (z.B. Email-Tracking, RSS)
   */
  @Get(':tenant/pixel')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  @Header('Content-Type', 'image/gif')
  async trackPixel(
    @Param('tenant') tenantSlug: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const tenantId = await this.analyticsService.getTenantIdBySlug(tenantSlug);

    if (tenantId) {
      // Async tracking (fire and forget)
      this.analyticsService
        .trackPageView({
          tenantId,
          path: (req.query.p as string) || '/',
          referrer: req.headers.referer,
          userAgent: req.headers['user-agent'],
          ip: this.getClientIp(req),
        })
        .catch(() => {});
    }

    // 1x1 transparent GIF
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64',
    );

    res.status(HttpStatus.OK).end(pixel);
  }

  /**
   * Extrahiert die Client-IP (hinter Proxy)
   */
  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}
