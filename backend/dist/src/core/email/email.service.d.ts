import type { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import type { DrizzleDB } from '../database/drizzle.module';
import { EmailSettingsService } from './email-settings.service';
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
export declare class EmailService {
    private readonly emailQueue;
    private readonly configService;
    private readonly emailSettingsService;
    private db;
    constructor(emailQueue: Queue, configService: ConfigService, emailSettingsService: EmailSettingsService, db: DrizzleDB);
    private createTransporter;
    private getFromAddress;
    private loadTemplate;
    private logEmail;
    sendWelcomeEmail(data: WelcomeEmailData, tenantId: string): Promise<void>;
    sendOrderConfirmation(data: OrderConfirmationData, tenantId: string): Promise<void>;
    sendPasswordReset(data: PasswordResetData): Promise<void>;
    sendVerificationEmail(data: VerificationEmailData): Promise<void>;
    queueWelcomeEmail(data: WelcomeEmailData, tenantId: string): Promise<void>;
    queueOrderConfirmation(data: OrderConfirmationData, tenantId: string): Promise<void>;
    queuePasswordReset(data: PasswordResetData): Promise<void>;
    sendTestEmail(tenantId: string, testTo: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    sendRawEmail({ to, subject, html, }: {
        to: string;
        subject: string;
        html: string;
    }): Promise<void>;
}
