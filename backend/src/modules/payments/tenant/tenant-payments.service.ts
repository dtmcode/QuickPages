import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../../../core/database/drizzle.module';
import type { DrizzleDB } from '../../../core/database/drizzle.module';
import { tenantPaymentSettings } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';

const ENCRYPTION_KEY =
  process.env.EMAIL_ENCRYPTION_KEY || 'default-key-change-in-production-32ch';

function encrypt(text: string): string {
  if (!text) return '';
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function maskKey(key: string): string {
  if (!key || key.length < 8) return '***';
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
}

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

@Injectable()
export class TenantPaymentsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async getPaymentSettings(tenantId: string) {
    const [settings] = await this.db
      .select()
      .from(tenantPaymentSettings)
      .where(eq(tenantPaymentSettings.tenantId, tenantId))
      .limit(1);

    if (!settings) {
      return {
        stripe: { isActive: false, mode: 'test' },
        paypal: { isActive: false, mode: 'sandbox' },
        bankTransfer: { isActive: false },
      };
    }

    return {
      stripe: {
        publishableKey: settings.stripePublishableKey ?? undefined,
        secretKeyMasked: settings.stripeSecretKeyEncrypted
          ? maskKey(settings.stripeSecretKeyEncrypted)
          : undefined,
        webhookSecretMasked: settings.stripeWebhookSecretEncrypted
          ? maskKey(settings.stripeWebhookSecretEncrypted)
          : undefined,
        isActive: settings.stripeActive ?? false,
        mode: settings.stripeMode ?? 'test',
      },
      paypal: {
        clientId: settings.paypalClientId ?? undefined,
        secretMasked: settings.paypalSecretEncrypted
          ? maskKey(settings.paypalSecretEncrypted)
          : undefined,
        isActive: settings.paypalActive ?? false,
        mode: settings.paypalMode ?? 'sandbox',
      },
      bankTransfer: {
        isActive: settings.bankActive ?? false,
        iban: settings.bankIban ?? undefined,
        bic: settings.bankBic ?? undefined,
        accountHolder: settings.bankAccountHolder ?? undefined,
        bankName: settings.bankName ?? undefined,
        reference: settings.bankReference ?? undefined,
      },
    };
  }

  async updateStripeSettings(
    tenantId: string,
    input: StripeSettingsInput,
  ): Promise<{ isActive: boolean }> {
    const existing = await this.db
      .select({ id: tenantPaymentSettings.id })
      .from(tenantPaymentSettings)
      .where(eq(tenantPaymentSettings.tenantId, tenantId))
      .limit(1);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
      stripeActive: true,
      stripeMode: input.mode ?? 'test',
    };

    if (input.publishableKey) {
      updateData.stripePublishableKey = input.publishableKey;
    }
    if (input.secretKey) {
      updateData.stripeSecretKeyEncrypted = encrypt(input.secretKey);
    }
    if (input.webhookSecret) {
      updateData.stripeWebhookSecretEncrypted = encrypt(input.webhookSecret);
    }

    if (existing.length > 0) {
      await this.db
        .update(tenantPaymentSettings)
        .set(updateData)
        .where(eq(tenantPaymentSettings.tenantId, tenantId));
    } else {
      await this.db
        .insert(tenantPaymentSettings)
        .values({ tenantId, ...updateData });
    }

    return { isActive: true };
  }

  async updatePaypalSettings(
    tenantId: string,
    input: PaypalSettingsInput,
  ): Promise<{ isActive: boolean }> {
    const existing = await this.db
      .select({ id: tenantPaymentSettings.id })
      .from(tenantPaymentSettings)
      .where(eq(tenantPaymentSettings.tenantId, tenantId))
      .limit(1);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
      paypalActive: true,
      paypalMode: input.mode ?? 'sandbox',
    };

    if (input.clientId) updateData.paypalClientId = input.clientId;
    if (input.secret) updateData.paypalSecretEncrypted = encrypt(input.secret);

    if (existing.length > 0) {
      await this.db
        .update(tenantPaymentSettings)
        .set(updateData)
        .where(eq(tenantPaymentSettings.tenantId, tenantId));
    } else {
      await this.db
        .insert(tenantPaymentSettings)
        .values({ tenantId, ...updateData });
    }

    return { isActive: true };
  }

  async updateBankTransferSettings(
    tenantId: string,
    input: BankTransferInput,
  ): Promise<{ isActive: boolean }> {
    const existing = await this.db
      .select({ id: tenantPaymentSettings.id })
      .from(tenantPaymentSettings)
      .where(eq(tenantPaymentSettings.tenantId, tenantId))
      .limit(1);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
      bankActive: true,
      bankIban: input.iban,
      bankBic: input.bic,
      bankAccountHolder: input.accountHolder,
      bankName: input.bankName,
      bankReference: input.reference,
    };

    if (existing.length > 0) {
      await this.db
        .update(tenantPaymentSettings)
        .set(updateData)
        .where(eq(tenantPaymentSettings.tenantId, tenantId));
    } else {
      await this.db
        .insert(tenantPaymentSettings)
        .values({ tenantId, ...updateData });
    }

    return { isActive: true };
  }
}
