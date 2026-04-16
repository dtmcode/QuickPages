// backend\src\modules\funnels\funnels.service.ts

import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import {
  funnels,
  funnelSteps,
  funnelSubmissions,
  newsletterSubscribers,
} from '../../drizzle/schema';
import {
  CreateFunnelInput,
  UpdateFunnelInput,
  CreateFunnelStepInput,
  UpdateFunnelStepInput,
  UpdateFunnelStepContentInput,
  CreateFunnelSubmissionInput,
  TrackFunnelEventInput,
} from './dto/funnels.input';

@Injectable()
export class FunnelsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // ─── Funnels CRUD ─────────────────────────────────────────────────────────────

  async getFunnels(tenantId: string) {
    const result = await this.db
      .select()
      .from(funnels)
      .where(eq(funnels.tenantId, tenantId))
      .orderBy(desc(funnels.createdAt));

    return { funnels: result, total: result.length };
  }

  async getFunnelById(tenantId: string, id: string) {
    const [funnel] = await this.db
      .select()
      .from(funnels)
      .where(and(eq(funnels.id, id), eq(funnels.tenantId, tenantId)));

    if (!funnel) throw new NotFoundException('Funnel nicht gefunden');

    const steps = await this.db
      .select()
      .from(funnelSteps)
      .where(eq(funnelSteps.funnelId, id))
      .orderBy(asc(funnelSteps.position));

    return { ...funnel, steps };
  }

  async getFunnelBySlug(tenantId: string, slug: string) {
    const [funnel] = await this.db
      .select()
      .from(funnels)
      .where(and(
        eq(funnels.tenantId, tenantId),
        eq(funnels.slug, slug),
        eq(funnels.isPublished, true),
      ));

    if (!funnel) throw new NotFoundException('Funnel nicht gefunden');

    const steps = await this.db
      .select()
      .from(funnelSteps)
      .where(and(eq(funnelSteps.funnelId, funnel.id), eq(funnelSteps.isActive, true)))
      .orderBy(asc(funnelSteps.position));

    return { ...funnel, steps };
  }

  async createFunnel(tenantId: string, input: CreateFunnelInput) {
    const slug = this.toSlug(input.name);

    // Slug-Konflikt prüfen
    const [existing] = await this.db
      .select()
      .from(funnels)
      .where(and(eq(funnels.tenantId, tenantId), eq(funnels.slug, slug)));

    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    const [funnel] = await this.db
      .insert(funnels)
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

    // Automatisch ersten Schritt erstellen (Opt-in)
    await this.db.insert(funnelSteps).values({
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

  async updateFunnel(tenantId: string, id: string, input: UpdateFunnelInput) {
    const [updated] = await this.db
      .update(funnels)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(funnels.id, id), eq(funnels.tenantId, tenantId)))
      .returning();

    if (!updated) throw new NotFoundException('Funnel nicht gefunden');
    return this.getFunnelById(tenantId, id);
  }

  async deleteFunnel(tenantId: string, id: string) {
    const [deleted] = await this.db
      .delete(funnels)
      .where(and(eq(funnels.id, id), eq(funnels.tenantId, tenantId)))
      .returning();

    if (!deleted) throw new NotFoundException('Funnel nicht gefunden');
    return true;
  }

  async duplicateFunnel(tenantId: string, id: string) {
    const original = await this.getFunnelById(tenantId, id);
    const newSlug = `${original.slug}-kopie-${Date.now().toString().slice(-4)}`;

    const [newFunnel] = await this.db
      .insert(funnels)
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

    // Schritte duplizieren
    if (original.steps && original.steps.length > 0) {
      await this.db.insert(funnelSteps).values(
        original.steps.map((step: any) => ({
          funnelId: newFunnel.id,
          tenantId,
          title: step.title,
          slug: step.slug,
          stepType: step.stepType,
          content: step.content ?? [],
          position: step.position,
          isActive: step.isActive,
        }))
      );
    }

    return this.getFunnelById(tenantId, newFunnel.id);
  }

  // ─── Steps CRUD ───────────────────────────────────────────────────────────────

  async createStep(tenantId: string, input: CreateFunnelStepInput) {
    // Position bestimmen
    const existingSteps = await this.db
      .select()
      .from(funnelSteps)
      .where(eq(funnelSteps.funnelId, input.funnelId));

    const position = input.position ?? existingSteps.length;
    const slug = `${this.toSlug(input.title)}-${position}`;

    const [step] = await this.db
      .insert(funnelSteps)
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

  async updateStep(tenantId: string, id: string, input: UpdateFunnelStepInput) {
    const [updated] = await this.db
      .update(funnelSteps)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(funnelSteps.id, id), eq(funnelSteps.tenantId, tenantId)))
      .returning();

    if (!updated) throw new NotFoundException('Schritt nicht gefunden');
    return updated;
  }

  async updateStepContent(tenantId: string, id: string, input: UpdateFunnelStepContentInput) {
    const [updated] = await this.db
      .update(funnelSteps)
      .set({ content: input.content, updatedAt: new Date() })
      .where(and(eq(funnelSteps.id, id), eq(funnelSteps.tenantId, tenantId)))
      .returning();

    if (!updated) throw new NotFoundException('Schritt nicht gefunden');
    return updated;
  }

  async deleteStep(tenantId: string, id: string) {
    await this.db
      .delete(funnelSteps)
      .where(and(eq(funnelSteps.id, id), eq(funnelSteps.tenantId, tenantId)));
    return true;
  }

  async reorderSteps(tenantId: string, funnelId: string, stepIds: string[]) {
    await Promise.all(
      stepIds.map((stepId, index) =>
        this.db
          .update(funnelSteps)
          .set({ position: index })
          .where(and(eq(funnelSteps.id, stepId), eq(funnelSteps.tenantId, tenantId)))
      )
    );
    return this.getFunnelById(tenantId, funnelId);
  }

  // ─── Tracking (Public) ────────────────────────────────────────────────────────

  async trackEvent(tenantId: string, input: TrackFunnelEventInput) {
    if (input.eventType === 'view') {
      // Funnel-Views erhöhen
      await this.db
        .update(funnels)
        .set({ totalViews: sql`total_views + 1` })
        .where(and(eq(funnels.id, input.funnelId), eq(funnels.tenantId, tenantId)));

      // Step-Views erhöhen
      if (input.stepId) {
        await this.db
          .update(funnelSteps)
          .set({ views: sql`views + 1` })
          .where(eq(funnelSteps.id, input.stepId));
      }
    } else if (input.eventType === 'conversion') {
      await this.db
        .update(funnels)
        .set({ totalConversions: sql`total_conversions + 1` })
        .where(and(eq(funnels.id, input.funnelId), eq(funnels.tenantId, tenantId)));

      if (input.stepId) {
        await this.db
          .update(funnelSteps)
          .set({ conversions: sql`conversions + 1` })
          .where(eq(funnelSteps.id, input.stepId));
      }
    }

    return true;
  }

  // ─── Submissions (Public) ─────────────────────────────────────────────────────

  async createSubmission(tenantId: string, input: CreateFunnelSubmissionInput) {
    // Funnel prüfen
    const [funnel] = await this.db
      .select()
      .from(funnels)
      .where(and(eq(funnels.id, input.funnelId), eq(funnels.tenantId, tenantId)));

    if (!funnel) throw new NotFoundException('Funnel nicht gefunden');

    const [submission] = await this.db
      .insert(funnelSubmissions)
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

    // Conversion tracken
    await this.trackEvent(tenantId, {
      funnelId: input.funnelId,
      stepId: input.stepId,
      eventType: 'conversion',
    });

    // Optional: Lead automatisch als Newsletter-Subscriber hinzufügen
    if (input.customerEmail && funnel.conversionGoal === 'email') {
      const [existing] = await this.db
        .select()
        .from(newsletterSubscribers)
        .where(and(
          eq(newsletterSubscribers.tenantId, tenantId),
          eq(newsletterSubscribers.email, input.customerEmail),
        ));

      if (!existing) {
        await this.db.insert(newsletterSubscribers).values({
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

  async getSubmissions(tenantId: string, funnelId: string) {
    const result = await this.db
      .select()
      .from(funnelSubmissions)
      .where(and(
        eq(funnelSubmissions.tenantId, tenantId),
        eq(funnelSubmissions.funnelId, funnelId),
      ))
      .orderBy(desc(funnelSubmissions.createdAt));

    return { submissions: result, total: result.length };
  }

  // ─── Analytics ────────────────────────────────────────────────────────────────

  async getAnalytics(tenantId: string, funnelId: string) {
    const funnel = await this.getFunnelById(tenantId, funnelId);

    const stepsAnalytics = (funnel.steps as any[]).map((step, index, arr) => {
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
}
