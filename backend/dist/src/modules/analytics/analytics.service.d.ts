import type { DrizzleDB } from '../../core/database/drizzle.module';
export declare class AnalyticsService {
    private db;
    private readonly logger;
    constructor(db: DrizzleDB);
    trackPageView(data: {
        tenantId: string;
        path: string;
        referrer?: string;
        userAgent?: string;
        ip?: string;
        sessionId?: string;
    }): Promise<void>;
    updateDuration(sessionId: string, path: string, durationSeconds: number): Promise<void>;
    getOverview(tenantId: string, startDate: string, endDate: string): Promise<{
        totalPageViews: number;
        uniqueVisitors: number;
        totalSessions: number;
        avgDuration: number;
        bounceRate: number;
        ordersCount: number;
        revenue: number;
    }>;
    getDailyStats(tenantId: string, startDate: string, endDate: string): Promise<Array<{
        date: string;
        pageViews: number;
        uniqueVisitors: number;
        sessions: number;
        revenue: number;
    }>>;
    getTopPages(tenantId: string, startDate: string, endDate: string, limit?: number): Promise<Array<{
        path: string;
        views: number;
        uniqueViews: number;
    }>>;
    getTopReferrers(tenantId: string, startDate: string, endDate: string, limit?: number): Promise<Array<{
        referrer: string;
        visits: number;
    }>>;
    getBreakdowns(tenantId: string, startDate: string, endDate: string): Promise<{
        devices: Array<{
            name: string;
            count: number;
        }>;
        browsers: Array<{
            name: string;
            count: number;
        }>;
        countries: Array<{
            name: string;
            count: number;
        }>;
    }>;
    getRealtimeVisitors(tenantId: string): Promise<number>;
    aggregateDailyStats(): Promise<void>;
    private aggregateForTenant;
    private getDailySalt;
    private parseUserAgent;
    getTenantIdBySlug(slug: string): Promise<string | null>;
}
