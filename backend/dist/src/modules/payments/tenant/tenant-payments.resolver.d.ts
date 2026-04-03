import type { DrizzleDB } from '../../../core/database/drizzle.module';
declare class StripeSettingsType {
    publishableKey?: string;
    secretKeyMasked?: string;
    webhookSecretMasked?: string;
    isActive: boolean;
    mode: string;
}
declare class PaypalSettingsType {
    clientId?: string;
    secretMasked?: string;
    isActive: boolean;
    mode: string;
}
declare class BankTransferType {
    isActive: boolean;
    iban?: string;
    bic?: string;
    accountHolder?: string;
    bankName?: string;
    reference?: string;
}
declare class TenantPaymentSettingsType {
    stripe?: StripeSettingsType;
    paypal?: PaypalSettingsType;
    bankTransfer?: BankTransferType;
}
declare class PaymentUpdateResult {
    isActive: boolean;
}
declare class StripeSettingsInput {
    publishableKey?: string;
    secretKey?: string;
    webhookSecret?: string;
    mode?: string;
}
declare class PaypalSettingsInput {
    clientId?: string;
    secret?: string;
    mode?: string;
}
declare class BankTransferInput {
    iban?: string;
    bic?: string;
    accountHolder?: string;
    bankName?: string;
    reference?: string;
}
export declare class TenantPaymentsResolver {
    private db;
    constructor(db: DrizzleDB);
    paymentSettings(tenantId: string): Promise<TenantPaymentSettingsType>;
    updateStripeSettings(input: StripeSettingsInput, tenantId: string): Promise<PaymentUpdateResult>;
    updatePaypalSettings(input: PaypalSettingsInput, tenantId: string): Promise<PaymentUpdateResult>;
    updateBankTransferSettings(input: BankTransferInput, tenantId: string): Promise<PaymentUpdateResult>;
}
export {};
