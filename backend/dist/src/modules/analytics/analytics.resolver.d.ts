import { AnalyticsService } from './analytics.service';
import { AnalyticsOverview, AnalyticsDailyPoint, TopPageEntry, AnalyticsDashboardData } from './dto/analytics.types';
export declare class AnalyticsResolver {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    analyticsDashboard(startDate: string, endDate: string, tenantId: string): Promise<AnalyticsDashboardData>;
    analyticsOverview(startDate: string, endDate: string, tenantId: string): Promise<AnalyticsOverview>;
    analyticsDailyStats(startDate: string, endDate: string, tenantId: string): Promise<AnalyticsDailyPoint[]>;
    analyticsTopPages(startDate: string, endDate: string, limit: number, tenantId: string): Promise<TopPageEntry[]>;
    analyticsRealtimeVisitors(tenantId: string): Promise<number>;
    private validateDateRange;
}
