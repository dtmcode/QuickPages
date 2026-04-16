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
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const crypto = __importStar(require("crypto"));
const drizzle_module_1 = require("../../core/database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    db;
    logger = new common_1.Logger(AnalyticsService_1.name);
    constructor(db) {
        this.db = db;
    }
    async trackPageView(data) {
        try {
            const ipHash = data.ip
                ? crypto
                    .createHash('sha256')
                    .update(data.ip + this.getDailySalt())
                    .digest('hex')
                    .slice(0, 16)
                : null;
            const ua = this.parseUserAgent(data.userAgent || '');
            const sessionId = data.sessionId ||
                (ipHash
                    ? crypto
                        .createHash('sha256')
                        .update(`${ipHash}:${data.userAgent || ''}:${new Date().toISOString().slice(0, 10)}`)
                        .digest('hex')
                        .slice(0, 32)
                    : crypto.randomUUID().replace(/-/g, '').slice(0, 32));
            const existingSession = await this.db.execute((0, drizzle_orm_1.sql) `SELECT id FROM page_views 
            WHERE tenant_id = ${data.tenantId} 
            AND session_id = ${sessionId}
            AND created_at >= CURRENT_DATE
            LIMIT 1`);
            const isUnique = existingSession.rows?.length === 0;
            await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO page_views (tenant_id, path, referrer, user_agent, ip_hash, device_type, browser, os, session_id, is_unique)
            VALUES (${data.tenantId}, ${data.path}, ${data.referrer || null}, ${data.userAgent || null}, 
                    ${ipHash}, ${ua.deviceType}, ${ua.browser}, ${ua.os}, ${sessionId}, ${isUnique})`);
        }
        catch (error) {
            this.logger.error(`Tracking-Fehler: ${error.message}`);
        }
    }
    async updateDuration(sessionId, path, durationSeconds) {
        try {
            await this.db.execute((0, drizzle_orm_1.sql) `UPDATE page_views 
            SET duration_seconds = ${Math.min(durationSeconds, 3600)}
            WHERE session_id = ${sessionId} AND path = ${path}
            AND created_at >= CURRENT_DATE
            ORDER BY created_at DESC LIMIT 1`);
        }
        catch (error) {
            this.logger.error(`Duration-Update-Fehler: ${error.message}`);
        }
    }
    async getOverview(tenantId, startDate, endDate) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT 
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
            AND date <= ${endDate}::date`);
        const row = result.rows?.[0] || {};
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
    async getDailyStats(tenantId, startDate, endDate) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT date, page_views, unique_visitors, sessions, revenue
          FROM analytics_daily
          WHERE tenant_id = ${tenantId}
            AND date >= ${startDate}::date
            AND date <= ${endDate}::date
          ORDER BY date ASC`);
        return (result.rows || []).map((row) => ({
            date: row.date,
            pageViews: parseInt(row.page_views) || 0,
            uniqueVisitors: parseInt(row.unique_visitors) || 0,
            sessions: parseInt(row.sessions) || 0,
            revenue: parseInt(row.revenue) || 0,
        }));
    }
    async getTopPages(tenantId, startDate, endDate, limit = 10) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT path, 
            COUNT(*) as views,
            COUNT(DISTINCT session_id) as unique_views
          FROM page_views
          WHERE tenant_id = ${tenantId}
            AND created_at >= ${startDate}::date
            AND created_at < (${endDate}::date + INTERVAL '1 day')
          GROUP BY path
          ORDER BY views DESC
          LIMIT ${limit}`);
        return (result.rows || []).map((row) => ({
            path: row.path,
            views: parseInt(row.views) || 0,
            uniqueViews: parseInt(row.unique_views) || 0,
        }));
    }
    async getTopReferrers(tenantId, startDate, endDate, limit = 10) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT 
            COALESCE(referrer, 'Direkt') as referrer,
            COUNT(*) as visits
          FROM page_views
          WHERE tenant_id = ${tenantId}
            AND created_at >= ${startDate}::date
            AND created_at < (${endDate}::date + INTERVAL '1 day')
          GROUP BY referrer
          ORDER BY visits DESC
          LIMIT ${limit}`);
        return (result.rows || []).map((row) => ({
            referrer: row.referrer || 'Direkt',
            visits: parseInt(row.visits) || 0,
        }));
    }
    async getBreakdowns(tenantId, startDate, endDate) {
        const [devicesResult, browsersResult, countriesResult] = await Promise.all([
            this.db.execute((0, drizzle_orm_1.sql) `SELECT COALESCE(device_type, 'unknown') as name, COUNT(*) as count
            FROM page_views WHERE tenant_id = ${tenantId}
            AND created_at >= ${startDate}::date AND created_at < (${endDate}::date + INTERVAL '1 day')
            GROUP BY device_type ORDER BY count DESC LIMIT 5`),
            this.db.execute((0, drizzle_orm_1.sql) `SELECT COALESCE(browser, 'unknown') as name, COUNT(*) as count
            FROM page_views WHERE tenant_id = ${tenantId}
            AND created_at >= ${startDate}::date AND created_at < (${endDate}::date + INTERVAL '1 day')
            GROUP BY browser ORDER BY count DESC LIMIT 5`),
            this.db.execute((0, drizzle_orm_1.sql) `SELECT COALESCE(country, 'unknown') as name, COUNT(*) as count
            FROM page_views WHERE tenant_id = ${tenantId}
            AND created_at >= ${startDate}::date AND created_at < (${endDate}::date + INTERVAL '1 day')
            GROUP BY country ORDER BY count DESC LIMIT 10`),
        ]);
        const mapRows = (rows) => rows.map((r) => ({
            name: r.name || 'Unbekannt',
            count: parseInt(r.count) || 0,
        }));
        return {
            devices: mapRows(devicesResult.rows || []),
            browsers: mapRows(browsersResult.rows || []),
            countries: mapRows(countriesResult.rows || []),
        };
    }
    async getRealtimeVisitors(tenantId) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT COUNT(DISTINCT session_id) as active
          FROM page_views
          WHERE tenant_id = ${tenantId}
            AND created_at >= NOW() - INTERVAL '5 minutes'`);
        return parseInt(result.rows?.[0]?.active) || 0;
    }
    async aggregateDailyStats() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().slice(0, 10);
        this.logger.log(`📊 Starte Aggregation für ${dateStr}...`);
        try {
            const tenantsWithViews = await this.db.execute((0, drizzle_orm_1.sql) `SELECT DISTINCT tenant_id FROM page_views
            WHERE created_at >= ${dateStr}::date
            AND created_at < (${dateStr}::date + INTERVAL '1 day')`);
            for (const row of tenantsWithViews.rows || []) {
                await this.aggregateForTenant(row.tenant_id, dateStr);
            }
            this.logger.log(`✅ Aggregation abgeschlossen für ${dateStr}`);
        }
        catch (error) {
            this.logger.error(`Aggregation-Fehler: ${error.message}`);
        }
    }
    async aggregateForTenant(tenantId, dateStr) {
        const statsResult = await this.db.execute((0, drizzle_orm_1.sql) `SELECT 
            COUNT(*) as page_views,
            COUNT(DISTINCT session_id) as unique_visitors,
            COUNT(DISTINCT session_id) as sessions,
            COALESCE(AVG(NULLIF(duration_seconds, 0)), 0) as avg_duration
          FROM page_views
          WHERE tenant_id = ${tenantId}
            AND created_at >= ${dateStr}::date
            AND created_at < (${dateStr}::date + INTERVAL '1 day')`);
        const stats = statsResult.rows?.[0] || {};
        const bounceResult = await this.db.execute((0, drizzle_orm_1.sql) `SELECT 
            COUNT(*) FILTER (WHERE view_count = 1) as bounced,
            COUNT(*) as total
          FROM (
            SELECT session_id, COUNT(*) as view_count
            FROM page_views
            WHERE tenant_id = ${tenantId}
              AND created_at >= ${dateStr}::date
              AND created_at < (${dateStr}::date + INTERVAL '1 day')
            GROUP BY session_id
          ) sessions`);
        const bounceData = bounceResult.rows?.[0] || {};
        const bounceRate = bounceData.total > 0
            ? (parseInt(bounceData.bounced) / parseInt(bounceData.total)) * 100
            : 0;
        const topPagesResult = await this.db.execute((0, drizzle_orm_1.sql) `SELECT path, COUNT(*) as views
          FROM page_views
          WHERE tenant_id = ${tenantId}
            AND created_at >= ${dateStr}::date
            AND created_at < (${dateStr}::date + INTERVAL '1 day')
          GROUP BY path ORDER BY views DESC LIMIT 10`);
        const topRefResult = await this.db.execute((0, drizzle_orm_1.sql) `SELECT COALESCE(referrer, 'Direkt') as referrer, COUNT(*) as visits
          FROM page_views
          WHERE tenant_id = ${tenantId}
            AND created_at >= ${dateStr}::date
            AND created_at < (${dateStr}::date + INTERVAL '1 day')
          GROUP BY referrer ORDER BY visits DESC LIMIT 10`);
        const devicesResult = await this.db.execute((0, drizzle_orm_1.sql) `SELECT COALESCE(device_type, 'unknown') as device, COUNT(*) as count
          FROM page_views WHERE tenant_id = ${tenantId}
          AND created_at >= ${dateStr}::date AND created_at < (${dateStr}::date + INTERVAL '1 day')
          GROUP BY device_type`);
        const revenueResult = await this.db.execute((0, drizzle_orm_1.sql) `SELECT COUNT(*) as orders_count, COALESCE(SUM(total), 0) as revenue
          FROM orders
          WHERE tenant_id = ${tenantId}
            AND created_at >= ${dateStr}::date
            AND created_at < (${dateStr}::date + INTERVAL '1 day')
            AND status != 'cancelled'`);
        const revData = revenueResult.rows?.[0] || {};
        await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO analytics_daily (tenant_id, date, page_views, unique_visitors, sessions, 
            avg_duration, bounce_rate, top_pages, top_referrers, devices, orders_count, revenue)
          VALUES (
            ${tenantId}, ${dateStr}::date, 
            ${parseInt(stats.page_views) || 0},
            ${parseInt(stats.unique_visitors) || 0},
            ${parseInt(stats.sessions) || 0},
            ${Math.round(parseFloat(stats.avg_duration)) || 0},
            ${Math.round(bounceRate * 10) / 10},
            ${JSON.stringify(topPagesResult.rows || [])},
            ${JSON.stringify(topRefResult.rows || [])},
            ${JSON.stringify(Object.fromEntries((devicesResult.rows || []).map((r) => [r.device, parseInt(r.count)])))},
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
            revenue = EXCLUDED.revenue`);
    }
    getDailySalt() {
        return `analytics-salt-${new Date().toISOString().slice(0, 10)}`;
    }
    parseUserAgent(ua) {
        const uaLower = ua.toLowerCase();
        let deviceType = 'desktop';
        if (/mobile|android.*mobile|iphone|ipod/.test(uaLower))
            deviceType = 'mobile';
        else if (/tablet|ipad|android(?!.*mobile)/.test(uaLower))
            deviceType = 'tablet';
        let browser = 'other';
        if (uaLower.includes('firefox'))
            browser = 'Firefox';
        else if (uaLower.includes('edg'))
            browser = 'Edge';
        else if (uaLower.includes('chrome') && !uaLower.includes('edg'))
            browser = 'Chrome';
        else if (uaLower.includes('safari') && !uaLower.includes('chrome'))
            browser = 'Safari';
        else if (uaLower.includes('opera') || uaLower.includes('opr'))
            browser = 'Opera';
        let os = 'other';
        if (uaLower.includes('windows'))
            os = 'Windows';
        else if (uaLower.includes('mac os'))
            os = 'macOS';
        else if (uaLower.includes('linux'))
            os = 'Linux';
        else if (uaLower.includes('android'))
            os = 'Android';
        else if (uaLower.includes('iphone') || uaLower.includes('ipad'))
            os = 'iOS';
        return { deviceType, browser, os };
    }
    async getTenantIdBySlug(slug) {
        const [tenant] = await this.db
            .select({ id: schema_1.tenants.id })
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.slug, slug))
            .limit(1);
        return tenant?.id || null;
    }
};
exports.AnalyticsService = AnalyticsService;
__decorate([
    (0, schedule_1.Cron)('5 0 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsService.prototype, "aggregateDailyStats", null);
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], AnalyticsService);
//# sourceMappingURL=analytics.service%20copy.js.map