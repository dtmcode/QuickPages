export declare class EmailSettings {
    id: string;
    provider: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    smtpUser?: string;
    fromEmail: string;
    fromName?: string;
    replyTo?: string;
    isEnabled: boolean;
    isVerified: boolean;
    lastTestedAt?: Date;
}
export declare class EmailSettingsInput {
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
export declare class TestEmailResult {
    success: boolean;
    error?: string;
}
