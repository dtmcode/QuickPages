export declare class NewsletterSubscriber {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    status: string;
    tags: string[];
    customFields?: any;
    source?: string;
    subscribedAt?: Date;
    confirmedAt?: Date;
    unsubscribedAt?: Date;
    createdAt: Date;
}
export declare class CreateSubscriberInput {
    email: string;
    firstName?: string;
    lastName?: string;
    tags?: string[];
    customFields?: any;
    source?: string;
}
export declare class UpdateSubscriberInput {
    firstName?: string;
    lastName?: string;
    tags?: string[];
    customFields?: any;
    status?: string;
}
export declare class SubscriberStats {
    total: number;
    active: number;
    pending: number;
    unsubscribed: number;
}
export declare class BulkImportResult {
    success: number;
    failed: number;
    skipped: number;
    errors: string[];
}
