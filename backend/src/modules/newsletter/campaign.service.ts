import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import {
  newsletterCampaigns,
  newsletterSubscribers,
  campaignQueue,
  campaignEvents,
} from '../../drizzle/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

export interface CreateCampaignInput {
  name: string;
  subject: string;
  previewText?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  htmlContent: string;
  plainTextContent?: string;
  filterTags?: string[];
  excludeTags?: string[];
  scheduledAt?: Date;
}

export interface UpdateCampaignInput {
  name?: string;
  subject?: string;
  previewText?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  htmlContent?: string;
  plainTextContent?: string;
  filterTags?: string[];
  excludeTags?: string[];
  scheduledAt?: Date;
  status?: string;
}

@Injectable()
export class CampaignService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    @InjectQueue('newsletter') private newsletterQueue: Queue,
  ) {}

  // Create campaign
  async createCampaign(tenantId: string, input: CreateCampaignInput) {
    const [campaign] = await this.db
      .insert(newsletterCampaigns)
      .values({
        tenantId,
        name: input.name,
        subject: input.subject,
        previewText: input.previewText,
        fromName: input.fromName,
        fromEmail: input.fromEmail,
        replyTo: input.replyTo,
        htmlContent: input.htmlContent,
        plainTextContent: input.plainTextContent,
        filterTags: input.filterTags || [],
        excludeTags: input.excludeTags || [],
        scheduledAt: input.scheduledAt,
        status: input.scheduledAt ? 'scheduled' : 'draft',
      })
      .returning();

    return campaign;
  }

  // Get all campaigns
  async getCampaigns(
    tenantId: string,
    options?: {
      status?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const conditions = [eq(newsletterCampaigns.tenantId, tenantId)];

    if (options?.status) {
      conditions.push(eq(newsletterCampaigns.status, options.status as any));
    }

    const query = this.db
      .select()
      .from(newsletterCampaigns)
      .where(and(...conditions))
      .orderBy(desc(newsletterCampaigns.createdAt));

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    return query;
  }

  // Get campaign by ID
  async getCampaign(tenantId: string, campaignId: string) {
    const [campaign] = await this.db
      .select()
      .from(newsletterCampaigns)
      .where(
        and(
          eq(newsletterCampaigns.tenantId, tenantId),
          eq(newsletterCampaigns.id, campaignId),
        ),
      )
      .limit(1);

    return campaign;
  }

  // Update campaign
  async updateCampaign(
    tenantId: string,
    campaignId: string,
    input: UpdateCampaignInput,
  ) {
    const updateData: any = {
      ...input,
      updatedAt: new Date(),
    };

    const [updated] = await this.db
      .update(newsletterCampaigns)
      .set(updateData)
      .where(
        and(
          eq(newsletterCampaigns.tenantId, tenantId),
          eq(newsletterCampaigns.id, campaignId),
        ),
      )
      .returning();

    return updated;
  }

  // Delete campaign
  async deleteCampaign(tenantId: string, campaignId: string) {
    await this.db
      .delete(newsletterCampaigns)
      .where(
        and(
          eq(newsletterCampaigns.tenantId, tenantId),
          eq(newsletterCampaigns.id, campaignId),
        ),
      );

    return true;
  }

  // Get recipients for campaign
  async getCampaignRecipients(tenantId: string, campaignId: string) {
    const campaign = await this.getCampaign(tenantId, campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Base condition: active subscribers only
    const conditions = [
      eq(newsletterSubscribers.tenantId, tenantId),
      eq(newsletterSubscribers.status, 'active'),
    ];

    // Filter by tags if specified
    if (campaign.filterTags && campaign.filterTags.length > 0) {
      // Get subscribers that have at least one of the filter tags
      const subscribers = await this.db
        .select()
        .from(newsletterSubscribers)
        .where(and(...conditions));

      return subscribers.filter((sub) => {
        const subTags = sub.tags || [];
        return campaign.filterTags!.some((tag) => subTags.includes(tag));
      });
    }

    // Exclude tags if specified
    if (campaign.excludeTags && campaign.excludeTags.length > 0) {
      const subscribers = await this.db
        .select()
        .from(newsletterSubscribers)
        .where(and(...conditions));

      return subscribers.filter((sub) => {
        const subTags = sub.tags || [];
        return !campaign.excludeTags!.some((tag) => subTags.includes(tag));
      });
    }

    // No filters - return all active subscribers
    return this.db
      .select()
      .from(newsletterSubscribers)
      .where(and(...conditions));
  }

  // Send campaign (prepare for sending)
  async sendCampaign(tenantId: string, campaignId: string) {
    const campaign = await this.getCampaign(tenantId, campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status === 'sent' || campaign.status === 'sending') {
      throw new Error('Campaign already sent or sending');
    }

    // Get recipients
    const recipients = await this.getCampaignRecipients(tenantId, campaignId);

    if (recipients.length === 0) {
      throw new Error('No recipients found');
    }

    // Update campaign status
    await this.db
      .update(newsletterCampaigns)
      .set({
        status: 'sending',
        totalRecipients: recipients.length,
        sendAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(newsletterCampaigns.id, campaignId));

    // Add recipients to queue
    for (const subscriber of recipients) {
      await this.db.insert(campaignQueue).values({
        campaignId,
        subscriberId: subscriber.id,
        status: 'pending',
        scheduledFor: new Date(),
      });
    }

    // Trigger queue processing
    await this.newsletterQueue.add('send-campaign', {
      tenantId,
      campaignId,
    });

    return {
      success: true,
      recipientCount: recipients.length,
    };
  }

  // Get campaign stats
  async getCampaignStats(tenantId: string, campaignId: string) {
    const campaign = await this.getCampaign(tenantId, campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Get event counts
    const events = await this.db
      .select()
      .from(campaignEvents)
      .where(eq(campaignEvents.campaignId, campaignId));

    const stats = {
      total: campaign.totalRecipients,
      sent: campaign.sentCount,
      delivered: campaign.deliveredCount,
      opened: campaign.openedCount,
      clicked: campaign.clickedCount,
      bounced: campaign.bouncedCount,
      unsubscribed: campaign.unsubscribedCount,
      openRate:
        campaign.sentCount > 0
          ? Math.round((campaign.openedCount / campaign.sentCount) * 100)
          : 0,
      clickRate:
        campaign.sentCount > 0
          ? Math.round((campaign.clickedCount / campaign.sentCount) * 100)
          : 0,
    };

    return stats;
  }

  // Duplicate campaign
  async duplicateCampaign(tenantId: string, campaignId: string) {
    const original = await this.getCampaign(tenantId, campaignId);

    if (!original) {
      throw new Error('Campaign not found');
    }

    const [duplicate] = await this.db
      .insert(newsletterCampaigns)
      .values({
        tenantId,
        name: `${original.name} (Kopie)`,
        subject: original.subject,
        previewText: original.previewText,
        fromName: original.fromName,
        fromEmail: original.fromEmail,
        replyTo: original.replyTo,
        htmlContent: original.htmlContent,
        plainTextContent: original.plainTextContent,
        filterTags: original.filterTags,
        excludeTags: original.excludeTags,
        status: 'draft',
      })
      .returning();

    return duplicate;
  }

  // Get campaign count by status
  async getCampaignCount(tenantId: string, status?: string) {
    const conditions = [eq(newsletterCampaigns.tenantId, tenantId)];

    if (status) {
      conditions.push(eq(newsletterCampaigns.status, status as any));
    }

    const result = await this.db
      .select()
      .from(newsletterCampaigns)
      .where(and(...conditions));

    return result.length;
  }
}
