import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../../../core/database/drizzle.module';
import type { DrizzleDB } from '../../../core/database/drizzle.module';
import { seoMeta } from '../../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export interface SeoMetaInput {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

@Injectable()
export class SeoService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async getSeoMeta(entityType: string, entityId: string) {
    const [meta] = await this.db
      .select()
      .from(seoMeta)
      .where(
        and(eq(seoMeta.entityType, entityType), eq(seoMeta.entityId, entityId)),
      )
      .limit(1);

    return meta;
  }

  async upsertSeoMeta(
    entityType: string,
    entityId: string,
    input: SeoMetaInput,
  ) {
    const existing = await this.getSeoMeta(entityType, entityId);

    if (existing) {
      const [updated] = await this.db
        .update(seoMeta)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(seoMeta.id, existing.id))
        .returning();

      return updated;
    }

    const [created] = await this.db
      .insert(seoMeta)
      .values({
        entityType,
        entityId,
        ...input,
      })
      .returning();

    return created;
  }

  async deleteSeoMeta(entityType: string, entityId: string) {
    await this.db
      .delete(seoMeta)
      .where(
        and(eq(seoMeta.entityType, entityType), eq(seoMeta.entityId, entityId)),
      );

    return true;
  }
}
