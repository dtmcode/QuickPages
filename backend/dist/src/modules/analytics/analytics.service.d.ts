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
    getDailyStats(tenantId: string, startDate: string, endDate: string): Promise<any>;
    getTopPages(tenantId: string, startDate: string, endDate: string, limit?: number): Promise<any>;
    getTopReferrers(tenantId: string, startDate: string, endDate: string, limit?: number): Promise<any>;
    getBreakdowns(tenantId: string, startDate: string, endDate: string): Promise<{
        devices: {
            name: any;
            count: number;
        }[];
        browsers: {
            name: any;
            count: number;
        }[];
        countries: {
            name: any;
            count: number;
        }[];
    }>;
    getRealtimeVisitors(tenantId: string): Promise<number>;
    aggregateDailyStats(): Promise<void>;
    private aggregateForTenant;
    private getDailySalt;
    private parseUserAgent;
    getTenantIdBySlug(slug: string): Promise<string | null>;
}
