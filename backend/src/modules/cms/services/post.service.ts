import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../../../core/database/drizzle.module';
import type { DrizzleDB } from '../../../core/database/drizzle.module';
import { posts } from '../../../drizzle/schema';
import { eq, and, desc, like } from 'drizzle-orm';

export interface CreatePostInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  metaDescription?: string;
  status?: string;
  categoryId?: string;
  tags?: string[];
  publishedAt?: string;
}

export interface UpdatePostInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  metaDescription?: string;
  status?: string;
  categoryId?: string;
  tags?: string[];
  publishedAt?: string;
}

@Injectable()
export class PostService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async createPost(tenantId: string, input: CreatePostInput) {
    // ✅ Status handling (lowercase zu DB)
    const status = (input.status || 'draft').toLowerCase();
    const isPublished = status === 'published';

    const [post] = await this.db
      .insert(posts)
      .values({
        tenantId,
        title: input.title,
        slug: input.slug,
        content: input.content,
        excerpt: input.excerpt,
        featuredImage: input.featuredImage,
        status: status as any,
        isPublished,
        publishedAt: isPublished
          ? input.publishedAt
            ? new Date(input.publishedAt)
            : new Date()
          : null,
        categoryId: input.categoryId || null,
        // ✅ Tags werden nicht in der DB gespeichert (laut Schema fehlt das Feld)
        // Falls du Tags brauchst, musst du das Schema erweitern
      })
      .returning();

    return post;
  }

  async getPosts(
    tenantId: string,
    options?: {
      status?: string;
      search?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const conditions = [eq(posts.tenantId, tenantId)];

    if (options?.status) {
      // ✅ Status zu lowercase für DB Query
      conditions.push(eq(posts.status, options.status.toLowerCase() as any));
    }

    if (options?.search) {
      conditions.push(like(posts.title, `%${options.search}%`));
    }

    const query = this.db
      .select()
      .from(posts)
      .where(and(...conditions))
      .orderBy(desc(posts.createdAt));

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    return query;
  }

  async getPost(tenantId: string, postId: string) {
    const [post] = await this.db
      .select()
      .from(posts)
      .where(and(eq(posts.tenantId, tenantId), eq(posts.id, postId)))
      .limit(1);

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    return post;
  }

  async updatePost(tenantId: string, postId: string, input: UpdatePostInput) {
    await this.getPost(tenantId, postId);

    const updateData: any = {
      ...input,
      updatedAt: new Date(),
    };

    // ✅ Status zu lowercase
    if (input.status) {
      updateData.status = input.status.toLowerCase();

      if (updateData.status === 'published') {
        updateData.isPublished = true;
        if (input.publishedAt) {
          updateData.publishedAt = new Date(input.publishedAt);
        } else if (!updateData.publishedAt) {
          updateData.publishedAt = new Date();
        }
      } else if (
        updateData.status === 'draft' ||
        updateData.status === 'archived'
      ) {
        updateData.isPublished = false;
      }
    }

    const [updated] = await this.db
      .update(posts)
      .set(updateData)
      .where(and(eq(posts.tenantId, tenantId), eq(posts.id, postId)))
      .returning();

    return updated;
  }

  async deletePost(tenantId: string, postId: string) {
    await this.getPost(tenantId, postId);

    await this.db
      .delete(posts)
      .where(and(eq(posts.tenantId, tenantId), eq(posts.id, postId)));

    return true;
  }
}
