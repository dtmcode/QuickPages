import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../../../core/database/drizzle.module';
import type { DrizzleDB } from '../../../core/database/drizzle.module';
import { pages } from '../../../drizzle/schema';
import { eq, and, desc, like } from 'drizzle-orm';
import { PageStatus, PageTemplate } from '../dto/page.types';

export interface CreatePageInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  metaDescription?: string;
  status?: PageStatus;
  template?: PageTemplate;
}

export interface UpdatePageInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  metaDescription?: string;
  status?: PageStatus;
  template?: PageTemplate;
}

@Injectable()
export class PageService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async createPage(tenantId: string, input: CreatePageInput) {
    const [page] = await this.db
      .insert(pages)
      .values({
        tenantId,
        title: input.title,
        slug: input.slug,
        content: input.content,
        excerpt: input.excerpt,
        featuredImage: input.featuredImage,
        metaDescription: input.metaDescription,
        status: (input.status || PageStatus.draft) as any, // ✅ KORRIGIERT
        template: (input.template || PageTemplate.default) as any, // ✅ KORRIGIERT
        isPublished: input.status === PageStatus.published, // ✅ KORRIGIERT
        publishedAt: input.status === PageStatus.published ? new Date() : null, // ✅ KORRIGIERT
      })
      .returning();

    return page;
  }

  async getPages(
    tenantId: string,
    options?: {
      status?: string;
      search?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const conditions = [eq(pages.tenantId, tenantId)];

    if (options?.status) {
      conditions.push(eq(pages.status, options.status as any));
    }

    if (options?.search) {
      conditions.push(like(pages.title, `%${options.search}%`));
    }

    const query = this.db
      .select()
      .from(pages)
      .where(and(...conditions))
      .orderBy(desc(pages.createdAt));

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    return query;
  }

  async getPage(tenantId: string, pageId: string) {
    const [page] = await this.db
      .select()
      .from(pages)
      .where(and(eq(pages.tenantId, tenantId), eq(pages.id, pageId)))
      .limit(1);

    return page;
  }

  async getPageBySlug(tenantId: string, slug: string) {
    const [page] = await this.db
      .select()
      .from(pages)
      .where(and(eq(pages.tenantId, tenantId), eq(pages.slug, slug)))
      .limit(1);

    return page;
  }

  async updatePage(tenantId: string, pageId: string, input: UpdatePageInput) {
    const updateData: any = {
      ...input,
      updatedAt: new Date(),
    };

    if (input.status === PageStatus.published) {
      // ✅ KORRIGIERT
      updateData.isPublished = true;
      updateData.publishedAt = new Date();
    } else if (
      input.status === PageStatus.draft ||
      input.status === PageStatus.archived
    ) {
      // ✅ KORRIGIERT
      updateData.isPublished = false;
    }

    const [updated] = await this.db
      .update(pages)
      .set(updateData)
      .where(and(eq(pages.tenantId, tenantId), eq(pages.id, pageId)))
      .returning();

    return updated;
  }

  async deletePage(tenantId: string, pageId: string) {
    await this.db
      .delete(pages)
      .where(and(eq(pages.tenantId, tenantId), eq(pages.id, pageId)));

    return true;
  }

  async duplicatePage(tenantId: string, pageId: string) {
    const original = await this.getPage(tenantId, pageId);

    if (!original) {
      throw new Error('Page not found');
    }

    const [duplicate] = await this.db
      .insert(pages)
      .values({
        tenantId,
        title: `${original.title} (Copy)`,
        slug: `${original.slug}-copy-${Date.now()}`,
        content: original.content,
        excerpt: original.excerpt,
        featuredImage: original.featuredImage,
        metaDescription: original.metaDescription,
        status: PageStatus.draft as any, // ✅ KORRIGIERT
        template: original.template as any,
        isPublished: false,
        publishedAt: null,
      })
      .returning();

    return duplicate;
  }
}
