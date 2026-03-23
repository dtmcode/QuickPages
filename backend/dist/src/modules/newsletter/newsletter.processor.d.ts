import type { Job } from 'bull';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { EmailService } from '../../core/email/email.service';
export declare class NewsletterProcessor {
    private db;
    private emailService;
    constructor(db: DrizzleDB, emailService: EmailService);
    handleSendCampaign(job: Job): Promise<{
        success: boolean;
        sentCount: number;
        failedCount: number;
    }>;
    private createTransporter;
}
