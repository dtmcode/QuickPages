/**
 * ==================== ANALYTICS SERVICE ====================
 * Tabellen: page_views + analytics_daily (beide jetzt im Schema)
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as crypto from 'crypto';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { tenants } from '../../drizzle/schema';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // ==================== TRACKING ====================

  async trackPageView(data: {
    tenantId: string;
    path: string;
    referrer?: string;
    userAgent?: string;
    ip?: string;
    sessionId?: string;
  }): Promise<void> {
    try {
      const ipHash = data.ip
        ? crypto
            .createHash('sha256')
            .update(data.ip + this.getDailySalt())
            .digest('hex')
            .slice(0, 16)
        : null;

      const ua = this.parseUserAgent(data.userAgent || '');

      const sessionId =
        data.sessionId ||
        (ipHash
          ? crypto
              .createHash('sha256')
              .update(`${ipHash}:${data.userAgent || ''}:${new Date().toISOString().slice(0, 10)}`)
              .digest('hex')
              .slice(0, 32)
          : crypto.randomUUID().replace(/-/g, '').slice(0, 32));

      const existingSession = await this.db.execute(
        sql`SELECT id FROM page_views
            WHERE tenant_id = ${data.tenantId}
            AND session_id = ${sessionId}
            AND created_at >= CURRENT_DATE
            LIMIT 1`,
      );

      const isUnique = (existingSession as any).rows?.length === 0;

      await this.db.execute(
        sql`INSERT INTO page_views
              (tenant_id, path, referrer, user_agent, ip_hash, device_type, browser, os, session_id, is_unique)
            VALUES
              (${data.tenantId}, ${data.path}, ${data.referrer || null}, ${data.userAgent || null},
               ${ipHash}, ${ua.deviceType}, ${ua.browser}, ${ua.os}, ${sessionId}, ${isUnique})`,
      );
    } catch (error: any) {
      this.logger.error(`Tracking-Fehler: ${error.message}`);
    }
  }

  async updateDuration(sessionId: string, path: string, durationSeconds: number): Promise<void> {
    try {
      await this.db.execute(
        sql`UPDATE page_views
            SET duration_seconds = ${Math.min(durationSeconds, 3600)}
            WHERE session_id = ${sessionId}
              AND path = ${path}
              AND created_at >= CURRENT_DATE
            ORDER BY created_at DESC LIMIT 1`,
      );
    } catch (error: any) {
      this.logger.error(`Duration-Update-Fehler: ${error.message}`);
    }
  }

  // ==================== DASHBOARD QUERIES ====================

  async getOverview(tenantId: string, startDate: string, endDate: string) {
    // Aus analytics_daily lesen (aggregierte Daten)
    const result = await this.db.execute(
      sql`SELECT
            COALESCE(SUM(page_views), 0)       AS total_page_views,
            COALESCE(SUM(unique_visitors), 0)  AS unique_visitors,
            COALESCE(SUM(sessions), 0)         AS total_sessions,
            COALESCE(AVG(avg_duration), 0)     AS avg_duration,
            COALESCE(AVG(bounce_rate), 0)      AS bounce_rate,
            COALESCE(SUM(orders_count), 0)     AS orders_count,
            COALESCE(SUM(revenue), 0)          AS revenue
          FROM analytics_daily
          WHERE tenant_id = ${tenantId}
            AND date >= ${startDate}
            AND date <= ${endDate}`,
    );

    const row = (result as any).rows?.[0] || {};
    return {
      totalPageViews:  parseInt(row.total_page_views)  || 0,
      uniqueVisitors:  parseInt(row.unique_visitors)   || 0,
      totalSessions:   parseInt(row.total_sessions)    || 0,
      avgDuration:     Math.round(parseFloat(row.avg_duration)) || 0,
      bounceRate:      Math.round(parseFloat(row.bounce_rate) * 10) / 10 || 0,
      ordersCount:     parseInt(row.orders_count)      || 0,
      revenue:         parseInt(row.revenue)           || 0,
    };
  }

  async getDailyStats(tenantId: string, startDate: string, endDate: string) {
    const result = await this.db.execute(
      sql`SELECT date, page_views, unique_visitors, sessions, revenue
          FROM analytics_daily
          WHERE tenant_id = ${tenantId}
            AND date >= ${startDate}
            AND date <= ${endDate}
          ORDER BY date ASC`,
    );

    return ((result as any).rows || []).map((row: any) => ({
      date:           row.date,
      pageViews:      parseInt(row.page_views)      || 0,
      uniqueVisitors: parseInt(row.unique_visitors) || 0,
      sessions:       parseInt(row.sessions)        || 0,
      revenue:        parseInt(row.revenue)         || 0,
    }));
  }

  async getTopPages(tenantId: string, startDate: string, endDate: string, limit = 10) {
    const result = await this.db.execute(
      sql`SELECT path,
              COUNT(*) AS views,
              COUNT(DISTINCT session_id) AS unique_views
          FROM page_views
          WHERE tenant_id = ${tenantId}
            AND created_at >= ${startDate}::date
            AND created_at < (${endDate}::date + INTERVAL '1 day')
          GROUP BY path
          ORDER BY views DESC
          LIMIT ${limit}`,
    );

    return ((result as any).rows || []).map((row: any) => ({
      path:       row.path,
      views:      parseInt(row.views)       || 0,
      uniqueViews: parseInt(row.unique_views) || 0,
    }));
  }

  async getTopReferrers(tenantId: string, startDate: string, endDate: string, limit = 10) {
    const result = await this.db.execute(
      sql`SELECT COALESCE(referrer, 'Direkt') AS referrer, COUNT(*) AS visits
          FROM page_views
          WHERE tenant_id = ${tenantId}
            AND created_at >= ${startDate}::date
            AND created_at < (${endDate}::date + INTERVAL '1 day')
          GROUP BY referrer
          ORDER BY visits DESC
          LIMIT ${limit}`,
    );

    return ((result as any).rows || []).map((row: any) => ({
      referrer: row.referrer || 'Direkt',
      visits:   parseInt(row.visits) || 0,
    }));
  }

  async getBreakdowns(tenantId: string, startDate: string, endDate: string) {
    const [devResult, brResult, coResult] = await Promise.all([
      this.db.execute(
        sql`SELECT COALESCE(device_type, 'Unbekannt') AS name, COUNT(*) AS count
            FROM page_views
            WHERE tenant_id = ${tenantId}
              AND created_at >= ${startDate}::date
              AND created_at < (${endDate}::date + INTERVAL '1 day')
            GROUP BY device_type ORDER BY count DESC LIMIT 5`,
      ),
      this.db.execute(
        sql`SELECT COALESCE(browser, 'Unbekannt') AS name, COUNT(*) AS count
            FROM page_views
            WHERE tenant_id = ${tenantId}
              AND created_at >= ${startDate}::date
              AND created_at < (${endDate}::date + INTERVAL '1 day')
            GROUP BY browser ORDER BY count DESC LIMIT 5`,
      ),
      this.db.execute(
        sql`SELECT COALESCE(country, 'Unbekannt') AS name, COUNT(*) AS count
            FROM page_views
            WHERE tenant_id = ${tenantId}
              AND created_at >= ${startDate}::date
              AND created_at < (${endDate}::date + INTERVAL '1 day')
            GROUP BY country ORDER BY count DESC LIMIT 10`,
      ),
    ]);

    const mapRows = (rows: any[]) =>
      rows.map((r: any) => ({ name: r.name || 'Unbekannt', count: parseInt(r.count) || 0 }));

    return {
      devices:   mapRows((devResult as any).rows || []),
      browsers:  mapRows((brResult as any).rows  || []),
      countries: mapRows((coResult as any).rows  || []),
    };
  }

  async getRealtimeVisitors(tenantId: string): Promise<number> {
    const result = await this.db.execute(
      sql`SELECT COUNT(DISTINCT session_id) AS active
          FROM page_views
          WHERE tenant_id = ${tenantId}
            AND created_at >= NOW() - INTERVAL '5 minutes'`,
    );
    return parseInt((result as any).rows?.[0]?.active) || 0;
  }

  // ==================== DAILY AGGREGATION (CRON 00:05) ====================

  @Cron('5 0 * * *')
  async aggregateDailyStats(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().slice(0, 10);
    this.logger.log(`📊 Aggregation für ${dateStr}...`);

    try {
      const tenantsWithViews = await this.db.execute(
        sql`SELECT DISTINCT tenant_id FROM page_views
            WHERE created_at >= ${dateStr}::date
              AND created_at < (${dateStr}::date + INTERVAL '1 day')`,
      );

      for (const row of (tenantsWithViews as any).rows || []) {
        await this.aggregateForTenant(row.tenant_id, dateStr);
      }
      this.logger.log(`✅ Aggregation abgeschlossen für ${dateStr}`);
    } catch (error: any) {
      this.logger.error(`Aggregation-Fehler: ${error.message}`);
    }
  }

  private async aggregateForTenant(tenantId: string, dateStr: string): Promise<void> {
    const [statsRes, bounceRes, topPagesRes, topRefRes, devicesRes, revenueRes] =
      await Promise.all([
        this.db.execute(
          sql`SELECT
                COUNT(*) AS page_views,
                COUNT(DISTINCT session_id) AS unique_visitors,
                COUNT(DISTINCT session_id) AS sessions,
                COALESCE(AVG(NULLIF(duration_seconds, 0)), 0) AS avg_duration
              FROM page_views
              WHERE tenant_id = ${tenantId}
                AND created_at >= ${dateStr}::date
                AND created_at < (${dateStr}::date + INTERVAL '1 day')`,
        ),
        this.db.execute(
          sql`SELECT
                COUNT(*) FILTER (WHERE view_count = 1) AS bounced,
                COUNT(*) AS total
              FROM (
                SELECT session_id, COUNT(*) AS view_count
                FROM page_views
                WHERE tenant_id = ${tenantId}
                  AND created_at >= ${dateStr}::date
                  AND created_at < (${dateStr}::date + INTERVAL '1 day')
                GROUP BY session_id
              ) s`,
        ),
        this.db.execute(
          sql`SELECT path, COUNT(*) AS views
              FROM page_views
              WHERE tenant_id = ${tenantId}
                AND created_at >= ${dateStr}::date
                AND created_at < (${dateStr}::date + INTERVAL '1 day')
              GROUP BY path ORDER BY views DESC LIMIT 10`,
        ),
        this.db.execute(
          sql`SELECT COALESCE(referrer, 'Direkt') AS referrer, COUNT(*) AS visits
              FROM page_views
              WHERE tenant_id = ${tenantId}
                AND created_at >= ${dateStr}::date
                AND created_at < (${dateStr}::date + INTERVAL '1 day')
              GROUP BY referrer ORDER BY visits DESC LIMIT 10`,
        ),
        this.db.execute(
          sql`SELECT COALESCE(device_type, 'unknown') AS device, COUNT(*) AS count
              FROM page_views
              WHERE tenant_id = ${tenantId}
                AND created_at >= ${dateStr}::date
                AND created_at < (${dateStr}::date + INTERVAL '1 day')
              GROUP BY device_type`,
        ),
        this.db.execute(
          sql`SELECT COUNT(*) AS orders_count, COALESCE(SUM(total), 0) AS revenue
              FROM orders
              WHERE tenant_id = ${tenantId}
                AND created_at >= ${dateStr}::date
                AND created_at < (${dateStr}::date + INTERVAL '1 day')
                AND status != 'cancelled'`,
        ),
      ]);

    const stats    = (statsRes as any).rows?.[0]   || {};
    const bounce   = (bounceRes as any).rows?.[0]  || {};
    const revData  = (revenueRes as any).rows?.[0] || {};

    const bounceRate = bounce.total > 0
      ? (parseInt(bounce.bounced) / parseInt(bounce.total)) * 100
      : 0;

    const devices = Object.fromEntries(
      ((devicesRes as any).rows || []).map((r: any) => [r.device, parseInt(r.count)]),
    );

    await this.db.execute(
      sql`INSERT INTO analytics_daily
            (tenant_id, date, page_views, unique_visitors, sessions, avg_duration,
             bounce_rate, top_pages, top_referrers, devices, orders_count, revenue)
          VALUES (
            ${tenantId}, ${dateStr}::date,
            ${parseInt(stats.page_views)      || 0},
            ${parseInt(stats.unique_visitors) || 0},
            ${parseInt(stats.sessions)        || 0},
            ${Math.round(parseFloat(stats.avg_duration)) || 0},
            ${Math.round(bounceRate * 10) / 10},
            ${JSON.stringify((topPagesRes as any).rows   || [])}::jsonb,
            ${JSON.stringify((topRefRes as any).rows     || [])}::jsonb,
            ${JSON.stringify(devices)}::jsonb,
            ${parseInt(revData.orders_count) || 0},
            ${parseInt(revData.revenue)      || 0}
          )
          ON CONFLICT (tenant_id, date) DO UPDATE SET
            page_views      = EXCLUDED.page_views,
            unique_visitors = EXCLUDED.unique_visitors,
            sessions        = EXCLUDED.sessions,
            avg_duration    = EXCLUDED.avg_duration,
            bounce_rate     = EXCLUDED.bounce_rate,
            top_pages       = EXCLUDED.top_pages,
            top_referrers   = EXCLUDED.top_referrers,
            devices         = EXCLUDED.devices,
            orders_count    = EXCLUDED.orders_count,
            revenue         = EXCLUDED.revenue,
            updated_at      = NOW()`,
    );
  }

  // ==================== HELPERS ====================

  private getDailySalt(): string {
    return `analytics-salt-${new Date().toISOString().slice(0, 10)}`;
  }

  private parseUserAgent(ua: string): { deviceType: string; browser: string; os: string } {
    const low = ua.toLowerCase();
    let deviceType = 'desktop';
    if (/mobile|android.*mobile|iphone|ipod/.test(low)) deviceType = 'mobile';
    else if (/tablet|ipad|android(?!.*mobile)/.test(low))  deviceType = 'tablet';

    let browser = 'other';
    if (low.includes('firefox'))                              browser = 'Firefox';
    else if (low.includes('edg'))                            browser = 'Edge';
    else if (low.includes('chrome') && !low.includes('edg')) browser = 'Chrome';
    else if (low.includes('safari') && !low.includes('chrome')) browser = 'Safari';
    else if (low.includes('opera') || low.includes('opr'))   browser = 'Opera';

    let os = 'other';
    if (low.includes('windows'))                             os = 'Windows';
    else if (low.includes('mac os'))                         os = 'macOS';
    else if (low.includes('linux'))                          os = 'Linux';
    else if (low.includes('android'))                        os = 'Android';
    else if (low.includes('iphone') || low.includes('ipad')) os = 'iOS';

    return { deviceType, browser, os };
  }

  async getTenantIdBySlug(slug: string): Promise<string | null> {
    const [tenant] = await this.db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);
    return tenant?.id || null;
  }
}