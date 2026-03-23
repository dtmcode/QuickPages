/**
 * ==================== COMMENTS SERVICE ====================
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { tenants } from '../../drizzle/schema';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // ===== PUBLIC: Get approved comments for a post =====
  async getPublicComments(tenantId: string, postId: string) {
    const result = await this.db.execute(
      sql`SELECT id, post_id, parent_id, author_name, author_url, content, likes, is_pinned, created_at
          FROM blog_comments
          WHERE tenant_id = ${tenantId} AND post_id = ${postId} AND status = 'approved'
          ORDER BY is_pinned DESC, created_at ASC`,
    );
    return (result as any).rows || [];
  }

  // ===== PUBLIC: Submit comment =====
  async submitComment(
    tenantId: string,
    data: {
      postId: string;
      parentId?: string;
      authorName: string;
      authorEmail: string;
      authorUrl?: string;
      content: string;
      ipAddress?: string;
      userAgent?: string;
    },
  ) {
    // Check settings
    const settings = await this.getSettings(tenantId);
    if (!settings.enabled) throw new Error('Kommentare sind deaktiviert');

    // Depth check
    if (data.parentId && settings.allow_replies) {
      const depth = await this.getCommentDepth(data.parentId);
      if (depth >= (settings.max_depth || 3))
        throw new Error('Maximale Antworttiefe erreicht');
    }

    // Simple spam check
    const isSpam =
      settings.spam_filter_enabled &&
      this.isLikelySpam(data.content, data.authorUrl);
    const status = isSpam
      ? 'spam'
      : settings.require_approval
        ? 'pending'
        : 'approved';

    const result = await this.db.execute(
      sql`INSERT INTO blog_comments (tenant_id, post_id, parent_id, author_name, author_email, author_url,
            content, status, ip_address, user_agent, approved_at)
          VALUES (${tenantId}, ${data.postId}, ${data.parentId || null}, ${data.authorName}, ${data.authorEmail},
                  ${data.authorUrl || null}, ${data.content}, ${status}, ${data.ipAddress || null},
                  ${data.userAgent || null}, ${status === 'approved' ? sql`NOW()` : null})
          RETURNING *`,
    );
    return (result as any).rows?.[0];
  }

  // ===== DASHBOARD: All comments with filters =====
  async getComments(
    tenantId: string,
    filters?: { status?: string; postId?: string },
  ) {
    let query = sql`SELECT c.*, p.title as post_title
                    FROM blog_comments c
                    LEFT JOIN posts p ON c.post_id = p.id
                    WHERE c.tenant_id = ${tenantId}`;
    if (filters?.status) query = sql`${query} AND c.status = ${filters.status}`;
    if (filters?.postId)
      query = sql`${query} AND c.post_id = ${filters.postId}`;
    query = sql`${query} ORDER BY c.created_at DESC LIMIT 100`;

    const result = await this.db.execute(query);
    return (result as any).rows || [];
  }

  // ===== DASHBOARD: Comment counts =====
  async getCommentCounts(tenantId: string) {
    const result = await this.db.execute(
      sql`SELECT status, COUNT(*)::int as count FROM blog_comments WHERE tenant_id = ${tenantId} GROUP BY status`,
    );
    const counts: Record<string, number> = {
      pending: 0,
      approved: 0,
      spam: 0,
      trash: 0,
    };
    for (const row of (result as any).rows || [])
      counts[row.status] = row.count;
    return counts;
  }

  // ===== DASHBOARD: Approve/Reject/Delete =====
  async approveComment(tenantId: string, commentId: string, userId?: string) {
    await this.db.execute(
      sql`UPDATE blog_comments SET status = 'approved', approved_at = NOW(), approved_by = ${userId || null}, updated_at = NOW()
          WHERE id = ${commentId} AND tenant_id = ${tenantId}`,
    );
    return true;
  }

  async rejectComment(tenantId: string, commentId: string) {
    await this.db.execute(
      sql`UPDATE blog_comments SET status = 'trash', updated_at = NOW()
          WHERE id = ${commentId} AND tenant_id = ${tenantId}`,
    );
    return true;
  }

  async markAsSpam(tenantId: string, commentId: string) {
    await this.db.execute(
      sql`UPDATE blog_comments SET status = 'spam', updated_at = NOW()
          WHERE id = ${commentId} AND tenant_id = ${tenantId}`,
    );
    return true;
  }

  async deleteComment(tenantId: string, commentId: string) {
    await this.db.execute(
      sql`DELETE FROM blog_comments WHERE id = ${commentId} AND tenant_id = ${tenantId}`,
    );
    return true;
  }

  async pinComment(tenantId: string, commentId: string, pinned: boolean) {
    await this.db.execute(
      sql`UPDATE blog_comments SET is_pinned = ${pinned}, updated_at = NOW()
          WHERE id = ${commentId} AND tenant_id = ${tenantId}`,
    );
    return true;
  }

  // ===== SETTINGS =====
  async getSettings(tenantId: string) {
    const result = await this.db.execute(
      sql`SELECT * FROM comment_settings WHERE tenant_id = ${tenantId} LIMIT 1`,
    );
    if ((result as any).rows?.length === 0) {
      await this.db.execute(
        sql`INSERT INTO comment_settings (tenant_id) VALUES (${tenantId}) ON CONFLICT DO NOTHING`,
      );
      return {
        enabled: true,
        require_approval: true,
        allow_anonymous: false,
        allow_replies: true,
        max_depth: 3,
        spam_filter_enabled: true,
      };
    }
    return (result as any).rows[0];
  }

  async updateSettings(tenantId: string, data: Record<string, any>) {
    await this.db.execute(
      sql`INSERT INTO comment_settings (tenant_id, enabled, require_approval, allow_anonymous, allow_replies, max_depth, close_after_days, spam_filter_enabled)
          VALUES (${tenantId}, ${data.enabled ?? true}, ${data.requireApproval ?? true}, ${data.allowAnonymous ?? false},
                  ${data.allowReplies ?? true}, ${data.maxDepth ?? 3}, ${data.closeAfterDays ?? 0}, ${data.spamFilterEnabled ?? true})
          ON CONFLICT (tenant_id) DO UPDATE SET
            enabled = EXCLUDED.enabled, require_approval = EXCLUDED.require_approval,
            allow_anonymous = EXCLUDED.allow_anonymous, allow_replies = EXCLUDED.allow_replies,
            max_depth = EXCLUDED.max_depth, close_after_days = EXCLUDED.close_after_days,
            spam_filter_enabled = EXCLUDED.spam_filter_enabled`,
    );
    return true;
  }

  // ===== HELPERS =====
  async getTenantIdBySlug(slug: string): Promise<string | null> {
    const [t] = await this.db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);
    return t?.id || null;
  }

  private async getCommentDepth(commentId: string): Promise<number> {
    const result = await this.db.execute(
      sql`WITH RECURSIVE depth AS (
            SELECT id, parent_id, 1 as level FROM blog_comments WHERE id = ${commentId}
            UNION ALL
            SELECT c.id, c.parent_id, d.level + 1 FROM blog_comments c JOIN depth d ON c.id = d.parent_id
          ) SELECT MAX(level) as max_depth FROM depth`,
    );
    return parseInt((result as any).rows?.[0]?.max_depth) || 0;
  }

  private isLikelySpam(content: string, url?: string): boolean {
    const spamWords = [
      'viagra',
      'casino',
      'lottery',
      'bitcoin',
      'crypto earn',
      'click here',
      'buy now',
      'free money',
    ];
    const lower = content.toLowerCase();
    if (spamWords.some((w) => lower.includes(w))) return true;
    if ((content.match(/https?:\/\//g) || []).length > 3) return true;
    if (url && url.length > 200) return true;
    return false;
  }
}
