"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const email_service_1 = require("../../core/email/email.service");
let NewsletterProcessor = class NewsletterProcessor {
    db;
    emailService;
    constructor(db, emailService) {
        this.db = db;
        this.emailService = emailService;
    }
    async handleSendCampaign(job) {
        const { tenantId, campaignId } = job.data;
        console.log(`📧 Starting campaign send: ${campaignId}`);
        try {
            const [campaign] = await this.db
                .select()
                .from(schema_1.newsletterCampaigns)
                .where((0, drizzle_orm_1.eq)(schema_1.newsletterCampaigns.id, campaignId))
                .limit(1);
            if (!campaign) {
                throw new Error('Campaign not found');
            }
            const queueItems = await this.db
                .select()
                .from(schema_1.campaignQueue)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.campaignQueue.campaignId, campaignId), (0, drizzle_orm_1.eq)(schema_1.campaignQueue.status, 'pending')));
            console.log(`📬 Found ${queueItems.length} recipients to send to`);
            let sentCount = 0;
            let failedCount = 0;
            for (const item of queueItems) {
                try {
                    const [subscriber] = await this.db
                        .select()
                        .from(schema_1.newsletterSubscribers)
                        .where((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.id, item.subscriberId))
                        .limit(1);
                    if (!subscriber) {
                        throw new Error('Subscriber not found');
                    }
                    let htmlContent = campaign.htmlContent;
                    htmlContent = htmlContent.replace(/\{\{first_name\}\}/g, subscriber.firstName || '');
                    htmlContent = htmlContent.replace(/\{\{last_name\}\}/g, subscriber.lastName || '');
                    htmlContent = htmlContent.replace(/\{\{email\}\}/g, subscriber.email);
                    const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe/${subscriber.unsubscribeToken}`;
                    htmlContent = htmlContent.replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl);
                    const transporter = await this.createTransporter(tenantId);
                    const from = campaign.fromEmail ||
                        process.env.PLATFORM_FROM_EMAIL ||
                        'noreply@saas-platform.com';
                    const fromName = campaign.fromName ||
                        process.env.PLATFORM_FROM_NAME ||
                        'SaaS Platform';
                    await transporter.sendMail({
                        from: `"${fromName}" <${from}>`,
                        to: subscriber.email,
                        subject: campaign.subject,
                        html: htmlContent,
                        replyTo: campaign.replyTo || undefined,
                    });
                    await this.db
                        .update(schema_1.campaignQueue)
                        .set({
                        status: 'sent',
                        sentAt: new Date(),
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.campaignQueue.id, item.id));
                    await this.db.insert(schema_1.campaignEvents).values({
                        campaignId,
                        subscriberId: subscriber.id,
                        eventType: 'sent',
                    });
                    sentCount++;
                    console.log(`✅ Sent to ${subscriber.email} (${sentCount}/${queueItems.length})`);
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }
                catch (error) {
                    console.error(`❌ Failed to send to subscriber ${item.subscriberId}:`, error);
                    await this.db
                        .update(schema_1.campaignQueue)
                        .set({
                        status: 'failed',
                        attempts: (item.attempts || 0) + 1,
                        lastAttemptAt: new Date(),
                        error: error.message,
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.campaignQueue.id, item.id));
                    failedCount++;
                }
            }
            await this.db
                .update(schema_1.newsletterCampaigns)
                .set({
                status: 'sent',
                sentCount: sentCount,
                completedAt: new Date(),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.newsletterCampaigns.id, campaignId));
            console.log(`✅ Campaign ${campaignId} completed: ${sentCount} sent, ${failedCount} failed`);
            return {
                success: true,
                sentCount,
                failedCount,
            };
        }
        catch (error) {
            console.error(`❌ Campaign ${campaignId} failed:`, error);
            await this.db
                .update(schema_1.newsletterCampaigns)
                .set({
                status: 'failed',
                lastError: error.message,
                errorCount: 1,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.newsletterCampaigns.id, campaignId));
            throw error;
        }
    }
    async createTransporter(tenantId) {
        const nodemailer = require('nodemailer');
        const { EmailSettingsService, } = require('../../core/email/email-settings.service');
        const emailSettingsService = new EmailSettingsService(this.db, null);
        const tenantSettings = await emailSettingsService.getSettings(tenantId);
        if (tenantSettings && tenantSettings.isEnabled) {
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
        return nodemailer.createTransport({
            host: process.env.PLATFORM_SMTP_HOST,
            port: parseInt(process.env.PLATFORM_SMTP_PORT || '587'),
            secure: process.env.PLATFORM_SMTP_SECURE === 'true',
            auth: {
                user: process.env.PLATFORM_SMTP_USER,
                pass: process.env.PLATFORM_SMTP_PASS,
            },
        });
    }
};
exports.NewsletterProcessor = NewsletterProcessor;
__decorate([
    (0, bull_1.Process)('send-campaign'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NewsletterProcessor.prototype, "handleSendCampaign", null);
exports.NewsletterProcessor = NewsletterProcessor = __decorate([
    (0, bull_1.Processor)('newsletter'),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object, email_service_1.EmailService])
], NewsletterProcessor);
//# sourceMappingURL=newsletter.processor.js.map