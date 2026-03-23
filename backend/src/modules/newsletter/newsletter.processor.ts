import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Inject } from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import {
  newsletterCampaigns,
  newsletterSubscribers,
  campaignQueue,
  campaignEvents,
} from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { EmailService } from '../../core/email/email.service';

@Processor('newsletter')
export class NewsletterProcessor {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private emailService: EmailService,
  ) {}

  @Process('send-campaign')
  async handleSendCampaign(job: Job) {
    const { tenantId, campaignId } = job.data;

    console.log(`📧 Starting campaign send: ${campaignId}`);

    try {
      // Get campaign
      const [campaign] = await this.db
        .select()
        .from(newsletterCampaigns)
        .where(eq(newsletterCampaigns.id, campaignId))
        .limit(1);

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Get all pending queue items
      const queueItems = await this.db
        .select()
        .from(campaignQueue)
        .where(
          and(
            eq(campaignQueue.campaignId, campaignId),
            eq(campaignQueue.status, 'pending'),
          ),
        );

      console.log(`📬 Found ${queueItems.length} recipients to send to`);

      let sentCount = 0;
      let failedCount = 0;

      // Process each recipient
      for (const item of queueItems) {
        try {
          // Get subscriber
          const [subscriber] = await this.db
            .select()
            .from(newsletterSubscribers)
            .where(eq(newsletterSubscribers.id, item.subscriberId))
            .limit(1);

          if (!subscriber) {
            throw new Error('Subscriber not found');
          }

          // Prepare email content with personalization
          let htmlContent = campaign.htmlContent;

          // Replace variables
          htmlContent = htmlContent.replace(
            /\{\{first_name\}\}/g,
            subscriber.firstName || '',
          );
          htmlContent = htmlContent.replace(
            /\{\{last_name\}\}/g,
            subscriber.lastName || '',
          );
          htmlContent = htmlContent.replace(/\{\{email\}\}/g, subscriber.email);

          // Unsubscribe link
          const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe/${subscriber.unsubscribeToken}`;
          htmlContent = htmlContent.replace(
            /\{\{unsubscribe_url\}\}/g,
            unsubscribeUrl,
          );

          // Send email using EmailService
          const transporter = await this.createTransporter(tenantId);
          const from =
            campaign.fromEmail ||
            process.env.PLATFORM_FROM_EMAIL ||
            'noreply@saas-platform.com';
          const fromName =
            campaign.fromName ||
            process.env.PLATFORM_FROM_NAME ||
            'SaaS Platform';

          await transporter.sendMail({
            from: `"${fromName}" <${from}>`,
            to: subscriber.email,
            subject: campaign.subject,
            html: htmlContent,
            replyTo: campaign.replyTo || undefined,
          });

          // Update queue item
          await this.db
            .update(campaignQueue)
            .set({
              status: 'sent',
              sentAt: new Date(),
            })
            .where(eq(campaignQueue.id, item.id));

          // Log event
          await this.db.insert(campaignEvents).values({
            campaignId,
            subscriberId: subscriber.id,
            eventType: 'sent',
          });

          sentCount++;
          console.log(
            `✅ Sent to ${subscriber.email} (${sentCount}/${queueItems.length})`,
          );

          // Rate limiting - 10 emails per second max
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(
            `❌ Failed to send to subscriber ${item.subscriberId}:`,
            error,
          );

          // Update queue item with error
          await this.db
            .update(campaignQueue)
            .set({
              status: 'failed',
              attempts: (item.attempts || 0) + 1,
              lastAttemptAt: new Date(),
              error: error.message,
            })
            .where(eq(campaignQueue.id, item.id));

          failedCount++;
        }
      }

      // Update campaign stats
      await this.db
        .update(newsletterCampaigns)
        .set({
          status: 'sent',
          sentCount: sentCount,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(newsletterCampaigns.id, campaignId));

      console.log(
        `✅ Campaign ${campaignId} completed: ${sentCount} sent, ${failedCount} failed`,
      );

      return {
        success: true,
        sentCount,
        failedCount,
      };
    } catch (error) {
      console.error(`❌ Campaign ${campaignId} failed:`, error);

      // Mark campaign as failed
      await this.db
        .update(newsletterCampaigns)
        .set({
          status: 'failed',
          lastError: error.message,
          errorCount: 1,
          updatedAt: new Date(),
        })
        .where(eq(newsletterCampaigns.id, campaignId));

      throw error;
    }
  }

  // Create transporter helper
  private async createTransporter(tenantId: string) {
    const nodemailer = require('nodemailer');

    // Check if tenant has email settings
    const {
      EmailSettingsService,
    } = require('../../core/email/email-settings.service');
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
      } as any);
    }

    // Platform SMTP
    return nodemailer.createTransport({
      host: process.env.PLATFORM_SMTP_HOST,
      port: parseInt(process.env.PLATFORM_SMTP_PORT || '587'),
      secure: process.env.PLATFORM_SMTP_SECURE === 'true',
      auth: {
        user: process.env.PLATFORM_SMTP_USER,
        pass: process.env.PLATFORM_SMTP_PASS,
      },
    } as any);
  }
}
