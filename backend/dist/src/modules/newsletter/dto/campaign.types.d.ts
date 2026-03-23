export declare class NewsletterCampaign {
    id: string;
    name: string;
    subject: string;
    previewText?: string;
    fromName?: string;
    fromEmail?: string;
    replyTo?: string;
    htmlContent: string;
    plainTextContent?: string;
    status: string;
    scheduledAt?: Date;
    sendAt?: Date;
    completedAt?: Date;
    filterTags: string[];
    excludeTags: string[];
    totalRecipients: number;
    sentCount: number;
    deliveredCount: number;
    openedCount: number;
    clickedCount: number;
    bouncedCount: number;
    unsubscribedCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CreateCampaignInput {
    name: string;
    subject: string;
    previewText?: string;
    fromName?: string;
    fromEmail?: string;
    replyTo?: string;
    htmlContent: string;
    plainTextContent?: string;
    filterTags?: string[];
    excludeTags?: string[];
    scheduledAt?: Date;
}
export declare class UpdateCampaignInput {
    name?: string;
    subject?: string;
    previewText?: string;
    fromName?: string;
    fromEmail?: string;
    replyTo?: string;
    htmlContent?: string;
    plainTextContent?: string;
    filterTags?: string[];
    excludeTags?: string[];
    scheduledAt?: Date;
    status?: string;
}
export declare class CampaignStats {
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    openRate: number;
    clickRate: number;
}
export declare class SendCampaignResult {
    success: boolean;
    recipientCount: number;
}
