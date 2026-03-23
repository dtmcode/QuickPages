import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { newsletterSubscribers } from '../../drizzle/schema';
import { eq, and, inArray, desc, like, or } from 'drizzle-orm';
import * as crypto from 'crypto';

export interface CreateSubscriberInput {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  customFields?: any;
  source?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UpdateSubscriberInput {
  firstName?: string;
  lastName?: string;
  tags?: string[];
  customFields?: any;
  status?: string;
}

@Injectable()
export class SubscriberService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // Generate unique token
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create subscriber
  async createSubscriber(tenantId: string, input: CreateSubscriberInput) {
    // Check if already exists
    const [existing] = await this.db
      .select()
      .from(newsletterSubscribers)
      .where(
        and(
          eq(newsletterSubscribers.tenantId, tenantId),
          eq(newsletterSubscribers.email, input.email.toLowerCase()),
        ),
      )
      .limit(1);

    if (existing) {
      // If unsubscribed, reactivate
      if (existing.status === 'unsubscribed') {
        return this.updateSubscriber(tenantId, existing.id, {
          status: 'pending',
        });
      }
      throw new Error('Subscriber already exists');
    }

    // Create new subscriber
    const [subscriber] = await this.db
      .insert(newsletterSubscribers)
      .values({
        tenantId,
        email: input.email.toLowerCase(),
        firstName: input.firstName,
        lastName: input.lastName,
        tags: input.tags || [],
        customFields: input.customFields,
        source: input.source || 'manual',
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        status: 'pending',
        subscribedAt: new Date(),
        unsubscribeToken: this.generateToken(),
        confirmToken: this.generateToken(),
      })
      .returning();

    return subscriber;
  }

  // Get all subscribers
  async getSubscribers(
    tenantId: string,
    options?: {
      status?: string;
      tags?: string[];
      search?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const conditions = [eq(newsletterSubscribers.tenantId, tenantId)];

    // Filter by status
    if (options?.status) {
      conditions.push(eq(newsletterSubscribers.status, options.status as any));
    }

    // Filter by tags
    if (options?.tags && options.tags.length > 0) {
      // PostgreSQL array overlap operator
      conditions.push(eq(newsletterSubscribers.tags, options.tags as any));
    }

    // Search by email or name
    if (options?.search) {
      conditions.push(
        or(
          like(newsletterSubscribers.email, `%${options.search}%`),
          like(newsletterSubscribers.firstName, `%${options.search}%`),
          like(newsletterSubscribers.lastName, `%${options.search}%`),
        ) as any,
      );
    }

    const query = this.db
      .select()
      .from(newsletterSubscribers)
      .where(and(...conditions))
      .orderBy(desc(newsletterSubscribers.createdAt));

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    return query;
  }

  // Get subscriber by ID
  async getSubscriber(tenantId: string, subscriberId: string) {
    const [subscriber] = await this.db
      .select()
      .from(newsletterSubscribers)
      .where(
        and(
          eq(newsletterSubscribers.tenantId, tenantId),
          eq(newsletterSubscribers.id, subscriberId),
        ),
      )
      .limit(1);

    return subscriber;
  }

  // Get subscriber by email
  async getSubscriberByEmail(tenantId: string, email: string) {
    const [subscriber] = await this.db
      .select()
      .from(newsletterSubscribers)
      .where(
        and(
          eq(newsletterSubscribers.tenantId, tenantId),
          eq(newsletterSubscribers.email, email.toLowerCase()),
        ),
      )
      .limit(1);

    return subscriber;
  }

  // Update subscriber
  // Update subscriber
  async updateSubscriber(
    tenantId: string,
    subscriberId: string,
    input: UpdateSubscriberInput,
  ) {
    const updateData = {
      firstName: input.firstName,
      lastName: input.lastName,
      tags: input.tags,
      customFields: input.customFields,
      ...(input.status && { status: input.status as any }),
      updatedAt: new Date(),
    };

    const [updated] = await this.db
      .update(newsletterSubscribers)
      .set(updateData)
      .where(
        and(
          eq(newsletterSubscribers.tenantId, tenantId),
          eq(newsletterSubscribers.id, subscriberId),
        ),
      )
      .returning();

    return updated;
  }

  // Delete subscriber
  async deleteSubscriber(tenantId: string, subscriberId: string) {
    await this.db
      .delete(newsletterSubscribers)
      .where(
        and(
          eq(newsletterSubscribers.tenantId, tenantId),
          eq(newsletterSubscribers.id, subscriberId),
        ),
      );

    return true;
  }

  // Confirm subscription (Double Opt-In)
  async confirmSubscription(tenantId: string, confirmToken: string) {
    const [subscriber] = await this.db
      .select()
      .from(newsletterSubscribers)
      .where(
        and(
          eq(newsletterSubscribers.tenantId, tenantId),
          eq(newsletterSubscribers.confirmToken, confirmToken),
        ),
      )
      .limit(1);

    if (!subscriber) {
      throw new Error('Invalid confirmation token');
    }

    if (subscriber.status === 'active') {
      throw new Error('Already confirmed');
    }

    const [updated] = await this.db
      .update(newsletterSubscribers)
      .set({
        status: 'active',
        confirmedAt: new Date(),
        confirmToken: null, // Clear token after use
        updatedAt: new Date(),
      })
      .where(eq(newsletterSubscribers.id, subscriber.id))
      .returning();

    return updated;
  }

  // Unsubscribe
  async unsubscribe(tenantId: string, unsubscribeToken: string) {
    const [subscriber] = await this.db
      .select()
      .from(newsletterSubscribers)
      .where(
        and(
          eq(newsletterSubscribers.tenantId, tenantId),
          eq(newsletterSubscribers.unsubscribeToken, unsubscribeToken),
        ),
      )
      .limit(1);

    if (!subscriber) {
      throw new Error('Invalid unsubscribe token');
    }

    const [updated] = await this.db
      .update(newsletterSubscribers)
      .set({
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(newsletterSubscribers.id, subscriber.id))
      .returning();

    return updated;
  }

  // Get subscriber count
  async getSubscriberCount(tenantId: string, status?: string) {
    const conditions = [eq(newsletterSubscribers.tenantId, tenantId)];

    if (status) {
      conditions.push(eq(newsletterSubscribers.status, status as any));
    }

    const result = await this.db
      .select()
      .from(newsletterSubscribers)
      .where(and(...conditions));

    return result.length;
  }

  // Bulk import subscribers
  async bulkImport(tenantId: string, subscribers: CreateSubscriberInput[]) {
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const sub of subscribers) {
      try {
        await this.createSubscriber(tenantId, sub);
        results.success++;
      } catch (error) {
        if (error.message === 'Subscriber already exists') {
          results.skipped++;
        } else {
          results.failed++;
          results.errors.push(`${sub.email}: ${error.message}`);
        }
      }
    }

    return results;
  }

  // Get all unique tags
  async getTags(tenantId: string) {
    const subscribers = await this.db
      .select({ tags: newsletterSubscribers.tags })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.tenantId, tenantId));

    // Flatten and deduplicate tags
    const allTags = subscribers
      .flatMap((s) => s.tags || [])
      .filter((tag, index, self) => self.indexOf(tag) === index);

    return allTags;
  }
}
