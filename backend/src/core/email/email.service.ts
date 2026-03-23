import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { DRIZZLE } from '../database/drizzle.module';
import type { DrizzleDB } from '../database/drizzle.module';
import { emailLogs } from '../../drizzle/schema';
import { EmailSettingsService } from './email-settings.service';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface WelcomeEmailData {
  firstName: string;
  email: string;
  tenantName: string;
  package: string;
  dashboardUrl: string;
}

export interface OrderConfirmationData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  totalAmount: string;
  shippingAddress: {
    name: string;
    street: string;
    zip: string;
    city: string;
  };
  orderUrl: string;
}

export interface PasswordResetData {
  firstName: string;
  email: string;
  resetUrl: string;
}
export interface VerificationEmailData {
  firstName: string;
  email: string;
  verifyUrl: string;
}
@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    private readonly configService: ConfigService,
    private readonly emailSettingsService: EmailSettingsService,
    @Inject(DRIZZLE) private db: DrizzleDB,
  ) {}

  // 🔥 HYBRID: Erstellt Transporter (Platform oder Tenant)
  private async createTransporter(tenantId: string): Promise<Transporter> {
    // 1. Prüfe ob Tenant eigene Settings hat
    const tenantSettings =
      await this.emailSettingsService.getSettings(tenantId);

    if (
      tenantSettings &&
      tenantSettings.isEnabled &&
      tenantSettings.isVerified
    ) {
      console.log(`📧 Using TENANT SMTP for ${tenantId}`);

      // Tenant SMTP
      return nodemailer.createTransport({
        host: tenantSettings.smtpHost,
        port: tenantSettings.smtpPort,
        secure: tenantSettings.smtpSecure,
        auth: {
          user: tenantSettings.smtpUser,
          pass: tenantSettings.smtpPassword,
        },
      } as any);
    }

    // 2. Fallback: Platform SMTP (DEIN Gmail/Outlook/etc.)
    console.log(`📧 Using PLATFORM SMTP for ${tenantId}`);

    const platformHost = this.configService.get('PLATFORM_SMTP_HOST');
    const platformPort = this.configService.get('PLATFORM_SMTP_PORT', '587');
    const platformSecure =
      this.configService.get('PLATFORM_SMTP_SECURE', 'false') === 'true';
    const platformUser = this.configService.get('PLATFORM_SMTP_USER');
    const platformPass = this.configService.get('PLATFORM_SMTP_PASS');

    if (!platformHost || !platformUser || !platformPass) {
      throw new Error('Platform SMTP not configured in .env');
    }

    return nodemailer.createTransport({
      host: platformHost,
      port: parseInt(platformPort),
      secure: platformSecure,
      auth: {
        user: platformUser,
        pass: platformPass,
      },
    } as any);
  }

  // Get FROM address
  private async getFromAddress(tenantId: string) {
    const tenantSettings =
      await this.emailSettingsService.getSettings(tenantId);

    if (tenantSettings && tenantSettings.isEnabled) {
      return {
        email: tenantSettings.fromEmail,
        name: tenantSettings.fromName || 'SaaS Platform',
      };
    }

    // Platform default
    return {
      email: this.configService.get(
        'PLATFORM_FROM_EMAIL',
        'noreply@saas-platform.com',
      ),
      name: this.configService.get('PLATFORM_FROM_NAME', 'SaaS Platform'),
    };
  }

  // Load & compile Handlebars template
  private loadTemplate(templateName: string, data: any): string {
    const templatePath = path.join(
      __dirname,
      '../../email-templates/emails',
      `${templateName}.hbs`,
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);

    return template({
      ...data,
      appName: this.configService.get('APP_NAME', 'SaaS Platform'),
    });
  }

  // Log email to database
  private async logEmail(
    tenantId: string | null,
    to: string,
    from: string,
    subject: string,
    template: string,
    status: 'sent' | 'failed',
    error?: string,
  ) {
    try {
      await this.db.insert(emailLogs).values({
        tenantId,
        to,
        from,
        subject,
        template,
        status,
        error,
      });
    } catch (err) {
      console.error('Failed to log email:', err);
    }
  }

  // 📧 WELCOME EMAIL
  async sendWelcomeEmail(data: WelcomeEmailData, tenantId: string) {
    try {
      const transporter = await this.createTransporter(tenantId);
      const from = await this.getFromAddress(tenantId);
      const html = this.loadTemplate('welcome', data);

      await transporter.sendMail({
        from: `"${from.name}" <${from.email}>`,
        to: data.email,
        subject: `Willkommen bei SaaS Platform! 🎉`,
        html,
      });

      console.log(`✅ Welcome email sent to ${data.email}`);

      await this.logEmail(
        tenantId,
        data.email,
        from.email,
        'Willkommen bei SaaS Platform! 🎉',
        'welcome',
        'sent',
      );
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      await this.logEmail(
        tenantId,
        data.email,
        'error',
        'Willkommen bei SaaS Platform! 🎉',
        'welcome',
        'failed',
        error.message,
      );
      throw error;
    }
  }

  // 📧 ORDER CONFIRMATION
  async sendOrderConfirmation(data: OrderConfirmationData, tenantId: string) {
    try {
      const transporter = await this.createTransporter(tenantId);
      const from = await this.getFromAddress(tenantId);
      const html = this.loadTemplate('order-confirmation', data);

      await transporter.sendMail({
        from: `"${from.name}" <${from.email}>`,
        to: data.customerEmail,
        subject: `Bestellbestätigung #${data.orderNumber}`,
        html,
      });

      console.log(`✅ Order confirmation sent to ${data.customerEmail}`);

      await this.logEmail(
        tenantId,
        data.customerEmail,
        from.email,
        `Bestellbestätigung #${data.orderNumber}`,
        'order-confirmation',
        'sent',
      );
    } catch (error) {
      console.error('❌ Failed to send order confirmation:', error);
      await this.logEmail(
        tenantId,
        data.customerEmail,
        'error',
        `Bestellbestätigung #${data.orderNumber}`,
        'order-confirmation',
        'failed',
        error.message,
      );
      throw error;
    }
  }

  // 📧 PASSWORD RESET
  async sendPasswordReset(data: PasswordResetData) {
    try {
      // Password Reset hat keinen tenantId, nutze Platform SMTP
      const platformHost = this.configService.get('PLATFORM_SMTP_HOST');
      const platformPort = this.configService.get('PLATFORM_SMTP_PORT', '587');
      const platformSecure =
        this.configService.get('PLATFORM_SMTP_SECURE', 'false') === 'true';
      const platformUser = this.configService.get('PLATFORM_SMTP_USER');
      const platformPass = this.configService.get('PLATFORM_SMTP_PASS');

      const transporter = nodemailer.createTransport({
        host: platformHost,
        port: parseInt(platformPort),
        secure: platformSecure,
        auth: {
          user: platformUser,
          pass: platformPass,
        },
      } as any);

      const from = {
        email: this.configService.get(
          'PLATFORM_FROM_EMAIL',
          'noreply@saas-platform.com',
        ),
        name: this.configService.get('PLATFORM_FROM_NAME', 'SaaS Platform'),
      };

      const html = this.loadTemplate('password-reset', data);

      await transporter.sendMail({
        from: `"${from.name}" <${from.email}>`,
        to: data.email,
        subject: 'Passwort zurücksetzen',
        html,
      });

      console.log(`✅ Password reset email sent to ${data.email}`);

      await this.logEmail(
        null,
        data.email,
        from.email,
        'Passwort zurücksetzen',
        'password-reset',
        'sent',
      );
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      await this.logEmail(
        null,
        data.email,
        'error',
        'Passwort zurücksetzen',
        'password-reset',
        'failed',
        error.message,
      );
      throw error;
    }
  }
  async sendVerificationEmail(data: VerificationEmailData) {
    try {
      const platformHost = this.configService.get('PLATFORM_SMTP_HOST');
      const platformPort = this.configService.get('PLATFORM_SMTP_PORT', '587');
      const platformSecure =
        this.configService.get('PLATFORM_SMTP_SECURE', 'false') === 'true';
      const platformUser = this.configService.get('PLATFORM_SMTP_USER');
      const platformPass = this.configService.get('PLATFORM_SMTP_PASS');

      const transporter = nodemailer.createTransport({
        host: platformHost,
        port: parseInt(platformPort),
        secure: platformSecure,
        auth: { user: platformUser, pass: platformPass },
      } as any);

      const from = {
        email: this.configService.get(
          'PLATFORM_FROM_EMAIL',
          'noreply@saas-platform.com',
        ),
        name: this.configService.get('PLATFORM_FROM_NAME', 'SaaS Platform'),
      };

      const html = this.loadTemplate('email-verify', data);
      await transporter.sendMail({
        from: `"${from.name}" <${from.email}>`,
        to: data.email,
        subject: 'Bitte bestätige deine E-Mail-Adresse',
        html,
      });

      await this.logEmail(
        null,
        data.email,
        from.email,
        'Bitte bestätige deine E-Mail-Adresse',
        'email-verify',
        'sent',
      );
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw error;
    }
  }
  // 🔄 Queue-basiertes Senden (async)
  async queueWelcomeEmail(data: WelcomeEmailData, tenantId: string) {
    await this.emailQueue.add('welcome', { data, tenantId });
  }

  async queueOrderConfirmation(data: OrderConfirmationData, tenantId: string) {
    await this.emailQueue.add('order-confirmation', { data, tenantId });
  }

  async queuePasswordReset(data: PasswordResetData) {
    await this.emailQueue.add('password-reset', { data });
  }

  // 🧪 Test Email (für Settings Page)
  async sendTestEmail(
    tenantId: string,
    testTo: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const transporter = await this.createTransporter(tenantId);
      const from = await this.getFromAddress(tenantId);

      await transporter.sendMail({
        from: `"${from.name}" <${from.email}>`,
        to: testTo,
        subject: '✅ Test Email - Konfiguration erfolgreich!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #06b6d4;">🎉 Deine Email-Konfiguration funktioniert!</h2>
            <p>Diese Test-Email wurde erfolgreich von deinem SMTP Server gesendet.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Von:</strong> ${from.email}</p>
              <p style="margin: 5px 0;"><strong>An:</strong> ${testTo}</p>
              <p style="margin: 5px 0;"><strong>Zeit:</strong> ${new Date().toLocaleString('de-DE')}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">SaaS Platform - Email System Test</p>
          </div>
        `,
      });

      console.log(`✅ Test email sent to ${testTo}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Test email failed:', error);
      return { success: false, error: error.message };
    }
  }
  async sendRawEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    const transporter = nodemailer.createTransport({
      host: this.configService.get('PLATFORM_SMTP_HOST'),
      port: parseInt(this.configService.get('PLATFORM_SMTP_PORT', '587')),
      secure:
        this.configService.get('PLATFORM_SMTP_SECURE', 'false') === 'true',
      auth: {
        user: this.configService.get('PLATFORM_SMTP_USER'),
        pass: this.configService.get('PLATFORM_SMTP_PASS'),
      },
    } as any);

    const from = {
      email: this.configService.get(
        'PLATFORM_FROM_EMAIL',
        'noreply@saas-platform.com',
      ),
      name: this.configService.get('PLATFORM_FROM_NAME', 'SaaS Platform'),
    };

    await transporter.sendMail({
      from: `"${from.name}" <${from.email}>`,
      to,
      subject,
      html,
    });
  }
}
