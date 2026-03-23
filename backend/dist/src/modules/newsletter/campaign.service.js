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
exports.CampaignService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bull_1 = require("@nestjs/bull");
let CampaignService = class CampaignService {
    db;
    newsletterQueue;
    constructor(db, newsletterQueue) {
        this.db = db;
        this.newsletterQueue = newsletterQueue;
    }
    async createCampaign(tenantId, input) {
        const [campaign] = await this.db
            .insert(schema_1.newsletterCampaigns)
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
    async getCampaigns(tenantId, options) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.newsletterCampaigns.tenantId, tenantId)];
        if (options?.status) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.newsletterCampaigns.status, options.status));
        }
        const query = this.db
            .select()
            .from(schema_1.newsletterCampaigns)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.newsletterCampaigns.createdAt));
        if (options?.limit) {
            query.limit(options.limit);
        }
        if (options?.offset) {
            query.offset(options.offset);
        }
        return query;
    }
    async getCampaign(tenantId, campaignId) {
        const [campaign] = await this.db
            .select()
            .from(schema_1.newsletterCampaigns)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.newsletterCampaigns.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.newsletterCampaigns.id, campaignId)))
            .limit(1);
        return campaign;
    }
    async updateCampaign(tenantId, campaignId, input) {
        const updateData = {
            ...input,
            updatedAt: new Date(),
        };
        const [updated] = await this.db
            .update(schema_1.newsletterCampaigns)
            .set(updateData)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.newsletterCampaigns.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.newsletterCampaigns.id, campaignId)))
            .returning();
        return updated;
    }
    async deleteCampaign(tenantId, campaignId) {
        await this.db
            .delete(schema_1.newsletterCampaigns)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.newsletterCampaigns.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.newsletterCampaigns.id, campaignId)));
        return true;
    }
    async getCampaignRecipients(tenantId, campaignId) {
        const campaign = await this.getCampaign(tenantId, campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        const conditions = [
            (0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.tenantId, tenantId),
            (0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.status, 'active'),
        ];
        if (campaign.filterTags && campaign.filterTags.length > 0) {
            const subscribers = await this.db
                .select()
                .from(schema_1.newsletterSubscribers)
                .where((0, drizzle_orm_1.and)(...conditions));
            return subscribers.filter((sub) => {
                const subTags = sub.tags || [];
                return campaign.filterTags.some((tag) => subTags.includes(tag));
            });
        }
        if (campaign.excludeTags && campaign.excludeTags.length > 0) {
            const subscribers = await this.db
                .select()
                .from(schema_1.newsletterSubscribers)
                .where((0, drizzle_orm_1.and)(...conditions));
            return subscribers.filter((sub) => {
                const subTags = sub.tags || [];
                return !campaign.excludeTags.some((tag) => subTags.includes(tag));
            });
        }
        return this.db
            .select()
            .from(schema_1.newsletterSubscribers)
            .where((0, drizzle_orm_1.and)(...conditions));
    }
    async sendCampaign(tenantId, campaignId) {
        const campaign = await this.getCampaign(tenantId, campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        if (campaign.status === 'sent' || campaign.status === 'sending') {
            throw new Error('Campaign already sent or sending');
        }
        const recipients = await this.getCampaignRecipients(tenantId, campaignId);
        if (recipients.length === 0) {
            throw new Error('No recipients found');
        }
        await this.db
            .update(schema_1.newsletterCampaigns)
            .set({
            status: 'sending',
            totalRecipients: recipients.length,
            sendAt: new Date(),
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.newsletterCampaigns.id, campaignId));
        for (const subscriber of recipients) {
            await this.db.insert(schema_1.campaignQueue).values({
                campaignId,
                subscriberId: subscriber.id,
                status: 'pending',
                scheduledFor: new Date(),
            });
        }
        await this.newsletterQueue.add('send-campaign', {
            tenantId,
            campaignId,
        });
        return {
            success: true,
            recipientCount: recipients.length,
        };
    }
    async getCampaignStats(tenantId, campaignId) {
        const campaign = await this.getCampaign(tenantId, campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        const events = await this.db
            .select()
            .from(schema_1.campaignEvents)
            .where((0, drizzle_orm_1.eq)(schema_1.campaignEvents.campaignId, campaignId));
        const stats = {
            total: campaign.totalRecipients,
            sent: campaign.sentCount,
            delivered: campaign.deliveredCount,
            opened: campaign.openedCount,
            clicked: campaign.clickedCount,
            bounced: campaign.bouncedCount,
            unsubscribed: campaign.unsubscribedCount,
            openRate: campaign.sentCount > 0
                ? Math.round((campaign.openedCount / campaign.sentCount) * 100)
                : 0,
            clickRate: campaign.sentCount > 0
                ? Math.round((campaign.clickedCount / campaign.sentCount) * 100)
                : 0,
        };
        return stats;
    }
    async duplicateCampaign(tenantId, campaignId) {
        const original = await this.getCampaign(tenantId, campaignId);
        if (!original) {
            throw new Error('Campaign not found');
        }
        const [duplicate] = await this.db
            .insert(schema_1.newsletterCampaigns)
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
    async getCampaignCount(tenantId, status) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.newsletterCampaigns.tenantId, tenantId)];
        if (status) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.newsletterCampaigns.status, status));
        }
        const result = await this.db
            .select()
            .from(schema_1.newsletterCampaigns)
            .where((0, drizzle_orm_1.and)(...conditions));
        return result.length;
    }
};
exports.CampaignService = CampaignService;
exports.CampaignService = CampaignService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __param(1, (0, bull_1.InjectQueue)('newsletter')),
    __metadata("design:paramtypes", [Object, Object])
], CampaignService);
//# sourceMappingURL=campaign.service.js.map