export declare class AnalyticsOverview {
    totalPageViews: number;
    uniqueVisitors: number;
    totalSessions: number;
    avgDuration: number;
    bounceRate: number;
    ordersCount: number;
    revenue: number;
}
export declare class AnalyticsDailyPoint {
    date: string;
    pageViews: number;
    uniqueVisitors: number;
    sessions: number;
    revenue: number;
}
export declare class TopPageEntry {
    path: string;
    views: number;
    uniqueViews: number;
}
export declare class TopReferrerEntry {
    referrer: string;
    visits: number;
}
export declare class BreakdownEntry {
    name: string;
    count: number;
}
export declare class AnalyticsBreakdowns {
    devices: BreakdownEntry[];
    browsers: BreakdownEntry[];
    countries: BreakdownEntry[];
}
export declare class AnalyticsDashboardData {
    overview: AnalyticsOverview;
    dailyStats: AnalyticsDailyPoint[];
    topPages: TopPageEntry[];
    topReferrers: TopReferrerEntry[];
    breakdowns: AnalyticsBreakdowns;
    realtimeVisitors: number;
}
