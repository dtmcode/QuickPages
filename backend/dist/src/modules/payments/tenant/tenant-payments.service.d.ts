import type { DrizzleDB } from '../../../core/database/drizzle.module';
export interface StripeSettingsInput {
    publishableKey?: string;
    secretKey?: string;
    webhookSecret?: string;
    mode?: string;
}
export interface PaypalSettingsInput {
    clientId?: string;
    secret?: string;
    mode?: string;
}
export interface BankTransferInput {
    iban?: string;
    bic?: string;
    accountHolder?: string;
    bankName?: string;
    reference?: string;
}
export declare class TenantPaymentsService {
    private db;
    constructor(db: DrizzleDB);
    getPaymentSettings(tenantId: string): Promise<{
        stripe: {
            isActive: boolean;
            mode: string;
            publishableKey?: undefined;
            secretKeyMasked?: undefined;
            webhookSecretMasked?: undefined;
        };
        paypal: {
            isActive: boolean;
            mode: string;
            clientId?: undefined;
            secretMasked?: undefined;
        };
        bankTransfer: {
            isActive: boolean;
            iban?: undefined;
            bic?: undefined;
            accountHolder?: undefined;
            bankName?: undefined;
            reference?: undefined;
        };
    } | {
        stripe: {
            publishableKey: string | undefined;
            secretKeyMasked: string | undefined;
            webhookSecretMasked: string | undefined;
            isActive: boolean;
            mode: string;
        };
        paypal: {
            clientId: string | undefined;
            secretMasked: string | undefined;
            isActive: boolean;
            mode: string;
        };
        bankTransfer: {
            isActive: boolean;
            iban: string | undefined;
            bic: string | undefined;
            accountHolder: string | undefined;
            bankName: string | undefined;
            reference: string | undefined;
        };
    }>;
    updateStripeSettings(tenantId: string, input: StripeSettingsInput): Promise<{
        isActive: boolean;
    }>;
    updatePaypalSettings(tenantId: string, input: PaypalSettingsInput): Promise<{
        isActive: boolean;
    }>;
    updateBankTransferSettings(tenantId: string, input: BankTransferInput): Promise<{
        isActive: boolean;
    }>;
}
