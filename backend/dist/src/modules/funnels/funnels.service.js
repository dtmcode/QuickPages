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
exports.FunnelsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../drizzle/schema");
let FunnelsService = class FunnelsService {
    db;
    constructor(db) {
        this.db = db;
    }
    toSlug(name) {
        return name
            .toLowerCase()
            .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    async getFunnels(tenantId) {
        const result = await this.db
            .select()
            .from(schema_1.funnels)
            .where((0, drizzle_orm_1.eq)(schema_1.funnels.tenantId, tenantId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.funnels.createdAt));
        return { funnels: result, total: result.length };
    }
    async getFunnelById(tenantId, id) {
        const [funnel] = await this.db
            .select()
            .from(schema_1.funnels)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.funnels.id, id), (0, drizzle_orm_1.eq)(schema_1.funnels.tenantId, tenantId)));
        if (!funnel)
            throw new common_1.NotFoundException('Funnel nicht gefunden');
        const steps = await this.db
            .select()
            .from(schema_1.funnelSteps)
            .where((0, drizzle_orm_1.eq)(schema_1.funnelSteps.funnelId, id))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.funnelSteps.position));
        return { ...funnel, steps };
    }
    async getFunnelBySlug(tenantId, slug) {
        const [funnel] = await this.db
            .select()
            .from(schema_1.funnels)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.funnels.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.funnels.slug, slug), (0, drizzle_orm_1.eq)(schema_1.funnels.isPublished, true)));
        if (!funnel)
            throw new common_1.NotFoundException('Funnel nicht gefunden');
        const steps = await this.db
            .select()
            .from(schema_1.funnelSteps)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.funnelSteps.funnelId, funnel.id), (0, drizzle_orm_1.eq)(schema_1.funnelSteps.isActive, true)))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.funnelSteps.position));
        return { ...funnel, steps };
    }
    async createFunnel(tenantId, input) {
        const slug = this.toSlug(input.name);
        const [existing] = await this.db
            .select()
            .from(schema_1.funnels)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.funnels.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.funnels.slug, slug)));
        const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;
        const [funnel] = await this.db
            .insert(schema_1.funnels)
            .values({
            tenantId,
            name: input.name,
            slug: finalSlug,
            description: input.description,
            conversionGoal: input.conversionGoal ?? 'email',
            utmSource: input.utmSource,
            utmMedium: input.utmMedium,
            utmCampaign: input.utmCampaign,
        })
            .returning();
        await this.db.insert(schema_1.funnelSteps).values({
            funnelId: funnel.id,
            tenantId,
            title: 'Opt-in Seite',
            slug: 'optin',
            stepType: 'optin',
            position: 0,
            content: [],
        });
        return this.getFunnelById(tenantId, funnel.id);
    }
    async updateFunnel(tenantId, id, input) {
        const [updated] = await this.db
            .update(schema_1.funnels)
            .set({ ...input, updatedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.funnels.id, id), (0, drizzle_orm_1.eq)(schema_1.funnels.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Funnel nicht gefunden');
        return this.getFunnelById(tenantId, id);
    }
    async deleteFunnel(tenantId, id) {
        const [deleted] = await this.db
            .delete(schema_1.funnels)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.funnels.id, id), (0, drizzle_orm_1.eq)(schema_1.funnels.tenantId, tenantId)))
            .returning();
        if (!deleted)
            throw new common_1.NotFoundException('Funnel nicht gefunden');
        return true;
    }
    async duplicateFunnel(tenantId, id) {
        const original = await this.getFunnelById(tenantId, id);
        const newSlug = `${original.slug}-kopie-${Date.now().toString().slice(-4)}`;
        const [newFunnel] = await this.db
            .insert(schema_1.funnels)
            .values({
            tenantId,
            name: `${original.name} (Kopie)`,
            slug: newSlug,
            description: original.description,
            conversionGoal: original.conversionGoal,
            isActive: false,
            isPublished: false,
        })
            .returning();
        if (original.steps && original.steps.length > 0) {
            await this.db.insert(schema_1.funnelSteps).values(original.steps.map((step) => ({
                funnelId: newFunnel.id,
                tenantId,
                title: step.title,
                slug: step.slug,
                stepType: step.stepType,
                content: step.content ?? [],
                position: step.position,
                isActive: step.isActive,
            })));
        }
        return this.getFunnelById(tenantId, newFunnel.id);
    }
    async createStep(tenantId, input) {
        const existingSteps = await this.db
            .select()
            .from(schema_1.funnelSteps)
            .where((0, drizzle_orm_1.eq)(schema_1.funnelSteps.funnelId, input.funnelId));
        const position = input.position ?? existingSteps.length;
        const slug = `${this.toSlug(input.title)}-${position}`;
        const [step] = await this.db
            .insert(schema_1.funnelSteps)
            .values({
            funnelId: input.funnelId,
            tenantId,
            title: input.title,
            slug,
            stepType: input.stepType,
            position,
            nextStepId: input.nextStepId,
            content: [],
        })
            .returning();
        return step;
    }
    async updateStep(tenantId, id, input) {
        const [updated] = await this.db
            .update(schema_1.funnelSteps)
            .set({ ...input, updatedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.funnelSteps.id, id), (0, drizzle_orm_1.eq)(schema_1.funnelSteps.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Schritt nicht gefunden');
        return updated;
    }
    async updateStepContent(tenantId, id, input) {
        const [updated] = await this.db
            .update(schema_1.funnelSteps)
            .set({ content: input.content, updatedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.funnelSteps.id, id), (0, drizzle_orm_1.eq)(schema_1.funnelSteps.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Schritt nicht gefunden');
        return updated;
    }
    async deleteStep(tenantId, id) {
        await this.db
            .delete(schema_1.funnelSteps)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.funnelSteps.id, id), (0, drizzle_orm_1.eq)(schema_1.funnelSteps.tenantId, tenantId)));
        return true;
    }
    async reorderSteps(tenantId, funnelId, stepIds) {
        await Promise.all(stepIds.map((stepId, index) => this.db
            .update(schema_1.funnelSteps)
            .set({ position: index })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.funnelSteps.id, stepId), (0, drizzle_orm_1.eq)(schema_1.funnelSteps.tenantId, tenantId)))));
        return this.getFunnelById(tenantId, funnelId);
    }
    async trackEvent(tenantId, input) {
        if (input.eventType === 'view') {
            await this.db
                .update(schema_1.funnels)
                .set({ totalViews: (0, drizzle_orm_1.sql) `total_views + 1` })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.funnels.id, input.funnelId), (0, drizzle_orm_1.eq)(schema_1.funnels.tenantId, tenantId)));
            if (input.stepId) {
                await this.db
                    .update(schema_1.funnelSteps)
                    .set({ views: (0, drizzle_orm_1.sql) `views + 1` })
                    .where((0, drizzle_orm_1.eq)(schema_1.funnelSteps.id, input.stepId));
            }
        }
        else if (input.eventType === 'conversion') {
            await this.db
                .update(schema_1.funnels)
                .set({ totalConversions: (0, drizzle_orm_1.sql) `total_conversions + 1` })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.funnels.id, input.funnelId), (0, drizzle_orm_1.eq)(schema_1.funnels.tenantId, tenantId)));
            if (input.stepId) {
                await this.db
                    .update(schema_1.funnelSteps)
                    .set({ conversions: (0, drizzle_orm_1.sql) `conversions + 1` })
                    .where((0, drizzle_orm_1.eq)(schema_1.funnelSteps.id, input.stepId));
            }
        }
        return true;
    }
    async createSubmission(tenantId, input) {
        const [funnel] = await this.db
            .select()
            .from(schema_1.funnels)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.funnels.id, input.funnelId), (0, drizzle_orm_1.eq)(schema_1.funnels.tenantId, tenantId)));
        if (!funnel)
            throw new common_1.NotFoundException('Funnel nicht gefunden');
        const [submission] = await this.db
            .insert(schema_1.funnelSubmissions)
            .values({
            funnelId: input.funnelId,
            stepId: input.stepId,
            tenantId,
            customerEmail: input.customerEmail,
            customerName: input.customerName,
            data: input.data ?? {},
            utmSource: input.utmSource,
            utmMedium: input.utmMedium,
            utmCampaign: input.utmCampaign,
            convertedAt: new Date(),
        })
            .returning();
        await this.trackEvent(tenantId, {
            funnelId: input.funnelId,
            stepId: input.stepId,
            eventType: 'conversion',
        });
        if (input.customerEmail && funnel.conversionGoal === 'email') {
            const [existing] = await this.db
                .select()
                .from(schema_1.newsletterSubscribers)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.email, input.customerEmail)));
            if (!existing) {
                await this.db.insert(schema_1.newsletterSubscribers).values({
                    tenantId,
                    email: input.customerEmail,
                    firstName: input.customerName?.split(' ')[0],
                    lastName: input.customerName?.split(' ').slice(1).join(' ') || undefined,
                    status: 'active',
                    source: `funnel:${funnel.slug}`,
                    subscribedAt: new Date(),
                    confirmedAt: new Date(),
                    tags: [`funnel-${funnel.slug}`],
                });
            }
        }
        return submission;
    }
    async getSubmissions(tenantId, funnelId) {
        const result = await this.db
            .select()
            .from(schema_1.funnelSubmissions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.funnelSubmissions.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.funnelSubmissions.funnelId, funnelId)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.funnelSubmissions.createdAt));
        return { submissions: result, total: result.length };
    }
    async getAnalytics(tenantId, funnelId) {
        const funnel = await this.getFunnelById(tenantId, funnelId);
        const stepsAnalytics = funnel.steps.map((step, index, arr) => {
            const prevViews = index === 0 ? funnel.totalViews : arr[index - 1]?.views ?? 0;
            const convRate = step.views > 0
                ? ((step.conversions / step.views) * 100).toFixed(1)
                : '0.0';
            const dropOff = step.views > 0 && prevViews > 0
                ? (((prevViews - step.views) / prevViews) * 100).toFixed(1)
                : '0.0';
            return {
                stepId: step.id,
                stepTitle: step.title,
                stepType: step.stepType,
                position: step.position,
                views: step.views,
                conversions: step.conversions,
                conversionRate: `${convRate}%`,
                dropOffRate: `${dropOff}%`,
            };
        });
        const overallRate = funnel.totalViews > 0
            ? ((funnel.totalConversions / funnel.totalViews) * 100).toFixed(1)
            : '0.0';
        return {
            funnelId: funnel.id,
            funnelName: funnel.name,
            totalViews: funnel.totalViews,
            totalConversions: funnel.totalConversions,
            overallConversionRate: `${overallRate}%`,
            steps: stepsAnalytics,
        };
    }
};
exports.FunnelsService = FunnelsService;
exports.FunnelsService = FunnelsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], FunnelsService);
//# sourceMappingURL=funnels.service.js.map