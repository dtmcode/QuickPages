export declare enum StepType {
    OPTIN = "optin",
    SALES = "sales",
    UPSELL = "upsell",
    DOWNSELL = "downsell",
    THANKYOU = "thankyou",
    VIDEO = "video"
}
export declare enum ConversionGoal {
    EMAIL = "email",
    PURCHASE = "purchase",
    BOOKING = "booking"
}
export declare class FunnelStep {
    id: string;
    funnelId: string;
    title: string;
    slug: string;
    stepType: string;
    position: number;
    isActive: boolean;
    nextStepId: string | null;
    views: number;
    conversions: number;
    content: unknown;
    createdAt: Date | null;
    updatedAt: Date | null;
}
export declare class FunnelStepsResponse {
    steps: FunnelStep[];
    total: number;
}
export declare class Funnel {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
    isPublished: boolean;
    conversionGoal: string;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    totalViews: number;
    totalConversions: number;
    steps?: FunnelStep[];
    createdAt: Date | null;
    updatedAt: Date | null;
}
export declare class FunnelsResponse {
    funnels: Funnel[];
    total: number;
}
export declare class FunnelSubmission {
    id: string;
    funnelId: string;
    stepId: string | null;
    customerEmail: string | null;
    customerName: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    convertedAt: Date | null;
    createdAt: Date | null;
}
export declare class FunnelSubmissionsResponse {
    submissions: FunnelSubmission[];
    total: number;
}
export declare class FunnelStepAnalytics {
    stepId: string;
    stepTitle: string;
    stepType: string;
    position: number;
    views: number;
    conversions: number;
    conversionRate: string;
    dropOffRate: string;
}
export declare class FunnelAnalytics {
    funnelId: string;
    funnelName: string;
    totalViews: number;
    totalConversions: number;
    overallConversionRate: string;
    steps: FunnelStepAnalytics[];
}
