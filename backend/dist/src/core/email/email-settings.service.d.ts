import type { DrizzleDB } from '../database/drizzle.module';
import { EmailCryptoService } from './email-crypto.service';
export interface EmailSettingsInput {
    provider: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    smtpUser?: string;
    smtpPassword?: string;
    fromEmail: string;
    fromName?: string;
    replyTo?: string;
}
export declare class EmailSettingsService {
    private db;
    private cryptoService;
    constructor(db: DrizzleDB, cryptoService: EmailCryptoService);
    getSettings(tenantId: string): Promise<{
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
    upsertSettings(tenantId: string, input: EmailSettingsInput): Promise<{
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
    deleteSettings(tenantId: string): Promise<void>;
    testConnection(tenantId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
}
