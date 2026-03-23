import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../database/drizzle.module';
import type { DrizzleDB } from '../database/drizzle.module';
import { tenantEmailSettings } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
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

@Injectable()
export class EmailSettingsService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private cryptoService: EmailCryptoService,
  ) {}

  async getSettings(tenantId: string) {
    const [settings] = await this.db
      .select()
      .from(tenantEmailSettings)
      .where(eq(tenantEmailSettings.tenantId, tenantId))
      .limit(1);

    if (!settings) {
      return null;
    }

    // Decrypt password
    return {
      ...settings,
      smtpPassword: settings.smtpPassword
        ? this.cryptoService.decrypt(settings.smtpPassword)
        : null,
    };
  }

  async upsertSettings(tenantId: string, input: EmailSettingsInput) {
    const existing = await this.getSettings(tenantId);

    // Encrypt password
    const encryptedPassword = input.smtpPassword
      ? this.cryptoService.encrypt(input.smtpPassword)
      : existing?.smtpPassword; // Keep existing if not provided

    const data = {
      tenantId,
      provider: input.provider as any,
      smtpHost: input.smtpHost,
      smtpPort: input.smtpPort || 587,
      smtpSecure: input.smtpSecure || false,
      smtpUser: input.smtpUser,
      smtpPassword: encryptedPassword,
      fromEmail: input.fromEmail,
      fromName: input.fromName,
      replyTo: input.replyTo,
      isEnabled: true,
      isVerified: false,
      updatedAt: new Date(),
    };

    if (existing) {
      await this.db
        .update(tenantEmailSettings)
        .set(data)
        .where(eq(tenantEmailSettings.tenantId, tenantId));
    } else {
      await this.db.insert(tenantEmailSettings).values(data);
    }

    return this.getSettings(tenantId);
  }

  async deleteSettings(tenantId: string) {
    await this.db
      .delete(tenantEmailSettings)
      .where(eq(tenantEmailSettings.tenantId, tenantId));
  }

  async testConnection(
    tenantId: string,
  ): Promise<{ success: boolean; error?: string }> {
    const settings = await this.getSettings(tenantId);

    if (!settings) {
      return { success: false, error: 'Keine Email-Einstellungen gefunden' };
    }

    try {
      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: settings.smtpPort,
        secure: settings.smtpSecure,
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPassword,
        },
      });

      await transporter.verify();

      // Update last tested
      await this.db
        .update(tenantEmailSettings)
        .set({
          isVerified: true,
          lastTestedAt: new Date(),
          errorCount: 0,
          lastError: null,
        })
        .where(eq(tenantEmailSettings.tenantId, tenantId));

      return { success: true };
    } catch (error) {
      // Log error
      await this.db
        .update(tenantEmailSettings)
        .set({
          isVerified: false,
          lastError: error.message,
          errorCount: (settings.errorCount || 0) + 1,
        })
        .where(eq(tenantEmailSettings.tenantId, tenantId));

      return { success: false, error: error.message };
    }
  }
}
