import type { Job } from 'bull';
import { EmailService } from './email.service';
export declare class EmailProcessor {
    private readonly emailService;
    constructor(emailService: EmailService);
    handleWelcomeEmail(job: Job): Promise<void>;
    handleOrderConfirmation(job: Job): Promise<void>;
    handlePasswordReset(job: Job): Promise<void>;
}
