export declare class CreateFunnelInput {
    name: string;
    description?: string;
    conversionGoal?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
}
export declare class UpdateFunnelInput {
    name?: string;
    description?: string;
    conversionGoal?: string;
    isActive?: boolean;
    isPublished?: boolean;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
}
export declare class CreateFunnelStepInput {
    funnelId: string;
    title: string;
    stepType: string;
    position?: number;
    nextStepId?: string;
}
export declare class UpdateFunnelStepInput {
    title?: string;
    stepType?: string;
    position?: number;
    isActive?: boolean;
    nextStepId?: string;
}
export declare class UpdateFunnelStepContentInput {
    content: any;
}
export declare class CreateFunnelSubmissionInput {
    funnelId: string;
    stepId?: string;
    customerEmail?: string;
    customerName?: string;
    data?: any;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
}
export declare class TrackFunnelEventInput {
    funnelId: string;
    stepId?: string;
    eventType: string;
}
