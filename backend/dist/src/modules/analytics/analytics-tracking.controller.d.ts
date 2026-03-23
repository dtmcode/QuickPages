import type { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
export declare class AnalyticsTrackingController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    trackPageView(tenantSlug: string, body: {
        path: string;
        referrer?: string;
        sessionId?: string;
    }, req: Request): Promise<{
        ok: boolean;
    }>;
    updateDuration(tenantSlug: string, body: {
        sessionId: string;
        path: string;
        duration: number;
    }): Promise<{
        ok: boolean;
    }>;
    trackPixel(tenantSlug: string, req: Request, res: Response): Promise<void>;
    private getClientIp;
}
