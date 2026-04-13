/**
 * ==================== ANALYTICS SERVICE ====================
 *
 * Handles:
 * - Page view tracking (privacy-friendly, no cookies)
 * - Session detection via IP hash + User Agent
 * - Daily aggregation (cron job)
 * - Dashboard data queries
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { tenants, orders } from '../../drizzle/schema';
import { eq, and, gte, lte, sql, desc, count } from 'drizzle-orm';

// Import these from your schema after adding them:
// import { pageViews, analyticsDaily } from '../../drizzle/schema';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // ==================== TRACKING ====================

  /**
   * Trackt einen Page View (privacy-friendly)
   * Kein Cookie, keine personenbezogenen Daten
   */
  async trackPageView(data: {
    tenantId: string;
    path: string;
    referrer?: string;
    userAgent?: string;
    ip?: string;
    sessionId?: string;
  }): Promise<void> {
    try {
      // IP hashen (privacy: original IP wird nicht gespeichert)
      const ipHash = data.ip
        ? crypto
            .createHash('sha256')
            .update(data.ip + this.getDailySalt())
            .digest('hex')
            .slice(0, 16)
        : null;

      // Device/Browser/OS aus User-Agent parsen
      const ua = this.parseUserAgent(data.userAgent || '');

      // Session ID: Hash aus IP + UA + Datum (identifiziert unique visitors pro Tag)
      const sessionId =
        data.sessionId ||
        (ipHash
          ? crypto
              .createHash('sha256')
              .update(
                `${ipHash}:${data.userAgent || ''}:${new Date().toISOString().slice(0, 10)}`,
              )
              .digest('hex')
              .slice(0, 32)
          : crypto.randomUUID().replace(/-/g, '').slice(0, 32));

      // Prüfe ob Session heute schon gezählt wurde (für isUnique)
      const existingSession = await this.db.execute(
        sql`SELECT id FROM page_views 
            WHERE tenant_id = ${data.tenantId} 
            AND session_id = ${sessionId}
            AND created_at >= CURRENT_DATE
            LIMIT 1`,
      );

      const isUnique = (existingSession as any).rows?.length === 0;

      await this.db.execute(
        sql`INSERT INTO page_views (tenant_id, path, referrer, user_agent, ip_hash, device_type, browser, os, session_id, is_unique)
            VALUES (${data.tenantId}, ${data.path}, ${data.referrer || null}, ${data.userAgent || null}, 
                    ${ipHash}, ${ua.deviceType}, ${ua.browser}, ${ua.os}, ${sessionId}, ${isUnique})`,
      );
    } catch (error: any) {
      // Tracking darf niemals die Seite blockieren
      this.logger.error(`Tracking-Fehler: ${error.message}`);
    }
  }

  /**
   * Update session duration (beacon on page unload)
   */
  async updateDuration(
    sessionId: string,
    path: string,
    durationSeconds: number,
  ): Promise<void> {
    try {
      await this.db.execute(
        sql`UPDATE page_views 
            SET duration_seconds = ${Math.min(durationSeconds, 3600)}
            WHERE session_id = ${sessionId} AND path = ${path}
            AND created_at >= CURRENT_DATE
            ORDER BY created_at DESC LIMIT 1`,
      );
    } catch (error: any) {
      this.logger.error(`Duration-Update-Fehler: ${error.message}`);
    }
  }

  // ==================== DASHBOARD QUERIES ====================

  /**
   * Holt die Übersichts-Statistiken für einen Zeitraum
   */
  async getOverview(
    tenantId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    totalPageViews: number;
    uniqueVisitors: number;
    totalSessions: number;
    avgDuration: number;
    bounceRate: number;
    ordersCount: number;
    revenue: number;
  }> {
    const result = await this.db.execute(
      sql`SELECT 
            COALESCE(SUM(page_views), 0) as total_page_views,
            COALESCE(SUM(unique_visitors), 0) as unique_visitors,
            COALESCE(SUM(sessions), 0) as total_sessions,
            COALESCE(AVG(avg_duration), 0) as avg_duration,
            COALESCE(AVG(bounce_rate), 0) as bounce_rate,
            COALESCE(SUM(orders_count), 0) as orders_count,
            COALESCE(SUM(revenue), 0) as revenue
          FROM analytics_daily
          WHERE tenant_id = ${tenantId}
            AND date >= ${startDate}::date
            AND date <= ${endDate}::date`,
    );

    const row = (result as any).rows?.[0] || {};
    return {
      totalPageViews: parseInt(row.total_page_views) || 0,
      uniqueVisitors: parseInt(row.unique_visitors) || 0,
      totalSessions: parseInt(row.total_sessions) || 0,
      avgDuration: Math.round(parseFloat(row.avg_duration)) || 0,
      bounceRate: Math.round(parseFloat(row.bounce_rate) * 10) / 10 || 0,
      ordersCount: parseInt(row.orders_count) || 0,
      revenue: parseInt(row.revenue) || 0,
    };
  }

  /**
   * Holt die tägliche Zeitreihe für Charts
   */
  async getDailyStats(
    tenantId: string,
    startDate: string,
    endDate: string,
  ): Promise<
    Array<{
      date: string;
      pageViews: number;
      uniqueVisitors: number;
      sessions: number;
      revenue: number;
    }>
  > {
    const result = await this.db.execute(
      sql`SELECT date, page_views, unique_visitors, sessions, revenue
          FROM analytics_daily
          WHERE tenant_id = ${tenantId}
            AND date >= ${startDate}::date
            AND date <= ${endDate}::date
          ORDER BY date ASC`,
    );

    return ((result as any).rows || []).map((row: any) => ({
      date: row.date,
      pageViews: parseInt(row.page_views) || 0,
      uniqueVisitors: parseInt(row.unique_visitors) || 0,
      sessions: parseInt(row.sessions) || 0,
      revenue: parseInt(row.revenue) || 0,
    }));
  }

  /**
   * Top Seiten
   */
  async getTopPages(
    tenantId: string,
    startDate: string,
    endDate: string,
    limit: number = 10,
  ): Promise<Array<{ path: string; views: number; uniqueViews: number }>> {
    const result = await this.db.execute(
      sql`SELECT path, 
            COUNT(*) as views,
            COUNT(DISTINCT session_id) as unique_views
          FROM page_views
          WHERE tenant_id = ${tenantId}
            AND created_at >= ${startDate}::date
            AND created_at < (${endDate}::date + INTERVAL '1 day')
          GROUP BY path
          ORDER BY views DESC
          LIMIT ${limit}`,
    );

    return ((result as any).rows || []).map((row: any) => ({
      path: row.path,
      views: parseInt(row.views) || 0,
      uniqueViews: parseInt(row.unique_views) || 0,
    }));
  }

  /**
   * Top Referrer
   */
  async getTopReferrers(
    tenantId: string,
    startDate: string,
    endDate: string,
    limit: number = 10,
  ): Promise<Array<{ referrer: string; visits: number }>> {
    const result = await this.db.execute(
      sql`SELECT 
            COALESCE(referrer, 'Direkt') as referrer,
            COUNT(*) as visits
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
      visits: parseInt(row.visits) || 0,
    }));
  }

  /**
   * Device/Browser/Country Breakdown
   */
  async getBreakdowns(
    tenantId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    devices: Array<{ name: string; count: number }>;
    browsers: Array<{ name: string; count: number }>;
    countries: Array<{ name: string; count: number }>;
  }> {
    const [devicesResult, browsersResult, countriesResult] = await Promise.all([
      this.db.execute(
        sql`SELECT COALESCE(device_type, 'unknown') as name, COUNT(*) as count
            FROM page_views WHERE tenant_id = ${tenantId}
            AND created_at >= ${startDate}::date AND created_at < (${endDate}::date + INTERVAL '1 day')
            GROUP BY device_type ORDER BY count DESC LIMIT 5`,
      ),
      this.db.execute(
        sql`SELECT COALESCE(browser, 'unknown') as name, COUNT(*) as count
            FROM page_views WHERE tenant_id = ${tenantId}
            AND created_at >= ${startDate}::date AND created_at < (${endDate}::date + INTERVAL '1 day')
            GROUP BY browser ORDER BY count DESC LIMIT 5`,
      ),
      this.db.execute(
        sql`SELECT COALESCE(country, 'unknown') as name, COUNT(*) as count
            FROM page_views WHERE tenant_id = ${tenantId}
            AND created_at >= ${startDate}::date AND created_at < (${endDate}::date + INTERVAL '1 day')
            GROUP BY country ORDER BY count DESC LIMIT 10`,
      ),
    ]);

    const mapRows = (rows: any[]) =>
      rows.map((r: any) => ({
        name: r.name || 'Unbekannt',
        count: parseInt(r.count) || 0,
      }));

    return {
      devices: mapRows((devicesResult as any).rows || []),
      browsers: mapRows((browsersResult as any).rows || []),
      countries: mapRows((countriesResult as any).rows || []),
    };
  }

  /**
   * Realtime: Aktive Besucher in den letzten 5 Minuten
   */
  async getRealtimeVisitors(tenantId: string): Promise<number> {
    const result = await this.db.execute(
      sql`SELECT COUNT(DISTINCT session_id) as active
          FROM page_views
          WHERE tenant_id = ${tenantId}
            AND created_at >= NOW() - INTERVAL '5 minutes'`,
    );

    return parseInt((result as any).rows?.[0]?.active) || 0;
  }

  // ==================== DAILY AGGREGATION (CRON) ====================

  /**
   * Aggregiert die Tagesstatistiken um 00:05 Uhr
   * Fasst raw page_views zu analytics_daily zusammen
   */
  @Cron('5 0 * * *') // Jeden Tag um 00:05
  async aggregateDailyStats(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().slice(0, 10);

    this.logger.log(`📊 Starte Aggregation für ${dateStr}...`);

    try {
      // Alle Tenants mit Page Views von gestern
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

  private async aggregateForTenant(
    tenantId: string,
    dateStr: string,
  ): Promise<void> {
    // Basis-Stats
    const statsResult = await this.db.execute(
      sql`SELECT 
            COUNT(*) as page_views,
            COUNT(DISTINCT session_id) as unique_visitors,
            COUNT(DISTINCT session_id) as sessions,
            COALESCE(AVG(NULLIF(duration_seconds, 0)), 0) as avg_duration
          FROM page_views
          WHERE tenant_id = ${tenantId}
            AND created_at >= ${dateStr}::date
            AND created_at < (${dateStr}::date + INTERVAL '1 day')`,
    );

    const stats = (statsResult as any).rows?.[0] || {};

    // Bounce Rate: Sessions mit nur 1 Page View / Gesamt Sessions
    const bounceResult = await this.db.execute(
      sql`SELECT 
            COUNT(*) FILTER (WHERE view_count = 1) as bounced,
            COUNT(*) as total
          FROM (
            SELECT session_id, COUNT(*) as view_count
            FROM page_views
            WHERE tenant_id = ${tenantId}
              AND created_at >= ${dateStr}::date
              AND created_at < (${dateStr}::date + INTERVAL '1 day')
            GROUP BY session_id
          ) sessions`,
    );

    const bounceData = (bounceResult as any).rows?.[0] || {};
    const bounceRate =
      bounceData.total > 0
        ? (parseInt(bounceData.bounced) / parseInt(bounceData.total)) * 100
        : 0;

    // Top Pages
    const topPagesResult = await this.db.execute(
      sql`SELECT path, COUNT(*) as views
          FROM page_views
          WHERE tenant_id = ${tenantId}
            AND created_at >= ${dateStr}::date
            AND created_at < (${dateStr}::date + INTERVAL '1 day')
          GROUP BY path ORDER BY views DESC LIMIT 10`,
    );

    // Top Referrers
    const topRefResult = await this.db.execute(
      sql`SELECT COALESCE(referrer, 'Direkt') as referrer, COUNT(*) as visits
          FROM page_views
          WHERE tenant_id = ${tenantId}
            AND created_at >= ${dateStr}::date
            AND created_at < (${dateStr}::date + INTERVAL '1 day')
          GROUP BY referrer ORDER BY visits DESC LIMIT 10`,
    );

    // Device Breakdown
    const devicesResult = await this.db.execute(
      sql`SELECT COALESCE(device_type, 'unknown') as device, COUNT(*) as count
          FROM page_views WHERE tenant_id = ${tenantId}
          AND created_at >= ${dateStr}::date AND created_at < (${dateStr}::date + INTERVAL '1 day')
          GROUP BY device_type`,
    );

    // Revenue (Orders von diesem Tag)
    const revenueResult = await this.db.execute(
      sql`SELECT COUNT(*) as orders_count, COALESCE(SUM(total), 0) as revenue
          FROM orders
          WHERE tenant_id = ${tenantId}
            AND created_at >= ${dateStr}::date
            AND created_at < (${dateStr}::date + INTERVAL '1 day')
            AND status != 'cancelled'`,
    );

    const revData = (revenueResult as any).rows?.[0] || {};

    // Upsert in analytics_daily
    await this.db.execute(
      sql`INSERT INTO analytics_daily (tenant_id, date, page_views, unique_visitors, sessions, 
            avg_duration, bounce_rate, top_pages, top_referrers, devices, orders_count, revenue)
          VALUES (
            ${tenantId}, ${dateStr}::date, 
            ${parseInt(stats.page_views) || 0},
            ${parseInt(stats.unique_visitors) || 0},
            ${parseInt(stats.sessions) || 0},
            ${Math.round(parseFloat(stats.avg_duration)) || 0},
            ${Math.round(bounceRate * 10) / 10},
            ${JSON.stringify((topPagesResult as any).rows || [])},
            ${JSON.stringify((topRefResult as any).rows || [])},
            ${JSON.stringify(Object.fromEntries(((devicesResult as any).rows || []).map((r: any) => [r.device, parseInt(r.count)])))},
            ${parseInt(revData.orders_count) || 0},
            ${parseInt(revData.revenue) || 0}
          )
          ON CONFLICT (tenant_id, date) DO UPDATE SET
            page_views = EXCLUDED.page_views,
            unique_visitors = EXCLUDED.unique_visitors,
            sessions = EXCLUDED.sessions,
            avg_duration = EXCLUDED.avg_duration,
            bounce_rate = EXCLUDED.bounce_rate,
            top_pages = EXCLUDED.top_pages,
            top_referrers = EXCLUDED.top_referrers,
            devices = EXCLUDED.devices,
            orders_count = EXCLUDED.orders_count,
            revenue = EXCLUDED.revenue`,
    );
  }

  // ==================== HELPERS ====================

  /** Täglicher Salt für IP-Hashing (ändert sich täglich → kein Tracking über Tage) */
  private getDailySalt(): string {
    return `analytics-salt-${new Date().toISOString().slice(0, 10)}`;
  }

  /** Einfacher User-Agent Parser */
  private parseUserAgent(ua: string): {
    deviceType: string;
    browser: string;
    os: string;
  } {
    const uaLower = ua.toLowerCase();

    // Device Type
    let deviceType = 'desktop';
    if (/mobile|android.*mobile|iphone|ipod/.test(uaLower))
      deviceType = 'mobile';
    else if (/tablet|ipad|android(?!.*mobile)/.test(uaLower))
      deviceType = 'tablet';

    // Browser
    let browser = 'other';
    if (uaLower.includes('firefox')) browser = 'Firefox';
    else if (uaLower.includes('edg')) browser = 'Edge';
    else if (uaLower.includes('chrome') && !uaLower.includes('edg'))
      browser = 'Chrome';
    else if (uaLower.includes('safari') && !uaLower.includes('chrome'))
      browser = 'Safari';
    else if (uaLower.includes('opera') || uaLower.includes('opr'))
      browser = 'Opera';

    // OS
    let os = 'other';
    if (uaLower.includes('windows')) os = 'Windows';
    else if (uaLower.includes('mac os')) os = 'macOS';
    else if (uaLower.includes('linux')) os = 'Linux';
    else if (uaLower.includes('android')) os = 'Android';
    else if (uaLower.includes('iphone') || uaLower.includes('ipad')) os = 'iOS';

    return { deviceType, browser, os };
  }

  /**
   * Resolve tenant ID from slug
   */
  async getTenantIdBySlug(slug: string): Promise<string | null> {
    const [tenant] = await this.db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);

    return tenant?.id || null;
  }
}
