"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const config_1 = require("@nestjs/config");
const drizzle_module_1 = require("../database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const email_settings_service_1 = require("./email-settings.service");
const nodemailer = __importStar(require("nodemailer"));
const handlebars = __importStar(require("handlebars"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let EmailService = class EmailService {
    emailQueue;
    configService;
    emailSettingsService;
    db;
    constructor(emailQueue, configService, emailSettingsService, db) {
        this.emailQueue = emailQueue;
        this.configService = configService;
        this.emailSettingsService = emailSettingsService;
        this.db = db;
    }
    async createTransporter(tenantId) {
        const tenantSettings = await this.emailSettingsService.getSettings(tenantId);
        if (tenantSettings &&
            tenantSettings.isEnabled &&
            tenantSettings.isVerified) {
            console.log(`📧 Using TENANT SMTP for ${tenantId}`);
            return nodemailer.createTransport({
                host: tenantSettings.smtpHost,
                port: tenantSettings.smtpPort,
                secure: tenantSettings.smtpSecure,
                auth: {
                    user: tenantSettings.smtpUser,
                    pass: tenantSettings.smtpPassword,
                },
            });
        }
        console.log(`📧 Using PLATFORM SMTP for ${tenantId}`);
        const platformHost = this.configService.get('PLATFORM_SMTP_HOST');
        const platformPort = this.configService.get('PLATFORM_SMTP_PORT', '587');
        const platformSecure = this.configService.get('PLATFORM_SMTP_SECURE', 'false') === 'true';
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
        });
    }
    async getFromAddress(tenantId) {
        const tenantSettings = await this.emailSettingsService.getSettings(tenantId);
        if (tenantSettings && tenantSettings.isEnabled) {
            return {
                email: tenantSettings.fromEmail,
                name: tenantSettings.fromName || 'SaaS Platform',
            };
        }
        return {
            email: this.configService.get('PLATFORM_FROM_EMAIL', 'noreply@saas-platform.com'),
            name: this.configService.get('PLATFORM_FROM_NAME', 'SaaS Platform'),
        };
    }
    loadTemplate(templateName, data) {
        const templatePath = path.join(__dirname, '../../email-templates/emails', `${templateName}.hbs`);
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
    async logEmail(tenantId, to, from, subject, template, status, error) {
        try {
            await this.db.insert(schema_1.emailLogs).values({
                tenantId,
                to,
                from,
                subject,
                template,
                status,
                error,
            });
        }
        catch (err) {
            console.error('Failed to log email:', err);
        }
    }
    async sendWelcomeEmail(data, tenantId) {
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
            await this.logEmail(tenantId, data.email, from.email, 'Willkommen bei SaaS Platform! 🎉', 'welcome', 'sent');
        }
        catch (error) {
            console.error('❌ Failed to send welcome email:', error);
            await this.logEmail(tenantId, data.email, 'error', 'Willkommen bei SaaS Platform! 🎉', 'welcome', 'failed', error.message);
            throw error;
        }
    }
    async sendOrderConfirmation(data, tenantId) {
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
            await this.logEmail(tenantId, data.customerEmail, from.email, `Bestellbestätigung #${data.orderNumber}`, 'order-confirmation', 'sent');
        }
        catch (error) {
            console.error('❌ Failed to send order confirmation:', error);
            await this.logEmail(tenantId, data.customerEmail, 'error', `Bestellbestätigung #${data.orderNumber}`, 'order-confirmation', 'failed', error.message);
            throw error;
        }
    }
    async sendPasswordReset(data) {
        try {
            const platformHost = this.configService.get('PLATFORM_SMTP_HOST');
            const platformPort = this.configService.get('PLATFORM_SMTP_PORT', '587');
            const platformSecure = this.configService.get('PLATFORM_SMTP_SECURE', 'false') === 'true';
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
            });
            const from = {
                email: this.configService.get('PLATFORM_FROM_EMAIL', 'noreply@saas-platform.com'),
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
            await this.logEmail(null, data.email, from.email, 'Passwort zurücksetzen', 'password-reset', 'sent');
        }
        catch (error) {
            console.error('❌ Failed to send password reset email:', error);
            await this.logEmail(null, data.email, 'error', 'Passwort zurücksetzen', 'password-reset', 'failed', error.message);
            throw error;
        }
    }
    async sendVerificationEmail(data) {
        try {
            const platformHost = this.configService.get('PLATFORM_SMTP_HOST');
            const platformPort = this.configService.get('PLATFORM_SMTP_PORT', '587');
            const platformSecure = this.configService.get('PLATFORM_SMTP_SECURE', 'false') === 'true';
            const platformUser = this.configService.get('PLATFORM_SMTP_USER');
            const platformPass = this.configService.get('PLATFORM_SMTP_PASS');
            const transporter = nodemailer.createTransport({
                host: platformHost,
                port: parseInt(platformPort),
                secure: platformSecure,
                auth: { user: platformUser, pass: platformPass },
            });
            const from = {
                email: this.configService.get('PLATFORM_FROM_EMAIL', 'noreply@saas-platform.com'),
                name: this.configService.get('PLATFORM_FROM_NAME', 'SaaS Platform'),
            };
            const html = this.loadTemplate('email-verify', data);
            await transporter.sendMail({
                from: `"${from.name}" <${from.email}>`,
                to: data.email,
                subject: 'Bitte bestätige deine E-Mail-Adresse',
                html,
            });
            await this.logEmail(null, data.email, from.email, 'Bitte bestätige deine E-Mail-Adresse', 'email-verify', 'sent');
        }
        catch (error) {
            console.error('❌ Failed to send verification email:', error);
            throw error;
        }
    }
    async queueWelcomeEmail(data, tenantId) {
        await this.emailQueue.add('welcome', { data, tenantId });
    }
    async queueOrderConfirmation(data, tenantId) {
        await this.emailQueue.add('order-confirmation', { data, tenantId });
    }
    async queuePasswordReset(data) {
        await this.emailQueue.add('password-reset', { data });
    }
    async sendTestEmail(tenantId, testTo) {
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
        }
        catch (error) {
            console.error('❌ Test email failed:', error);
            return { success: false, error: error.message };
        }
    }
    async sendRawEmail({ to, subject, html, }) {
        const transporter = nodemailer.createTransport({
            host: this.configService.get('PLATFORM_SMTP_HOST'),
            port: parseInt(this.configService.get('PLATFORM_SMTP_PORT', '587')),
            secure: this.configService.get('PLATFORM_SMTP_SECURE', 'false') === 'true',
            auth: {
                user: this.configService.get('PLATFORM_SMTP_USER'),
                pass: this.configService.get('PLATFORM_SMTP_PASS'),
            },
        });
        const from = {
            email: this.configService.get('PLATFORM_FROM_EMAIL', 'noreply@saas-platform.com'),
            name: this.configService.get('PLATFORM_FROM_NAME', 'SaaS Platform'),
        };
        await transporter.sendMail({
            from: `"${from.name}" <${from.email}>`,
            to,
            subject,
            html,
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('email')),
    __param(3, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object, config_1.ConfigService,
        email_settings_service_1.EmailSettingsService, Object])
], EmailService);
//# sourceMappingURL=email.service.js.map