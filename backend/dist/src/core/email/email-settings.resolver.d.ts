import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { EmailSettingsService } from './email-settings.service';
import { EmailService } from './email.service';
import { EmailSettingsInput } from './dto/email-settings.types';
export declare class EmailSettingsResolver {
    private emailSettingsService;
    private emailService;
    constructor(emailSettingsService: EmailSettingsService, emailService: EmailService);
    emailSettings(tenantId: string): Promise<{
        smtpPassword: string | null;
        id: string;
        tenantId: string;
        provider: "custom" | "gmail" | "outlook" | "netcup" | "ionos" | "strato" | "sendgrid" | "mailgun" | "resend";
        smtpHost: string | null;
        smtpPort: number | null;
        smtpSecure: boolean;
        smtpUser: string | null;
        fromEmail: string;
        fromName: string | null;
        replyTo: string | null;
        isEnabled: boolean;
        isVerified: boolean;
        lastTestedAt: Date | null;
        lastUsedAt: Date | null;
        lastError: string | null;
        errorCount: number;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    updateEmailSettings(input: EmailSettingsInput, tenantId: string, user: JwtPayload): Promise<{
        smtpPassword: string | null;
        id: string;
        tenantId: string;
        provider: "custom" | "gmail" | "outlook" | "netcup" | "ionos" | "strato" | "sendgrid" | "mailgun" | "resend";
        smtpHost: string | null;
        smtpPort: number | null;
        smtpSecure: boolean;
        smtpUser: string | null;
        fromEmail: string;
        fromName: string | null;
        replyTo: string | null;
        isEnabled: boolean;
        isVerified: boolean;
        lastTestedAt: Date | null;
        lastUsedAt: Date | null;
        lastError: string | null;
        errorCount: number;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    deleteEmailSettings(tenantId: string, user: JwtPayload): Promise<boolean>;
    testEmailSettings(testTo: string, tenantId: string, user: JwtPayload): Promise<{
        success: boolean;
        error?: string;
    }>;
}
