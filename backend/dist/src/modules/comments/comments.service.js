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
var CommentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
let CommentsService = CommentsService_1 = class CommentsService {
    db;
    logger = new common_1.Logger(CommentsService_1.name);
    constructor(db) {
        this.db = db;
    }
    async getPublicComments(tenantId, postId) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT id, post_id, parent_id, author_name, author_url, content, likes, is_pinned, created_at
          FROM blog_comments
          WHERE tenant_id = ${tenantId} AND post_id = ${postId} AND status = 'approved'
          ORDER BY is_pinned DESC, created_at ASC`);
        return result.rows || [];
    }
    async submitComment(tenantId, data) {
        const settings = await this.getSettings(tenantId);
        if (!settings.enabled)
            throw new Error('Kommentare sind deaktiviert');
        if (data.parentId && settings.allow_replies) {
            const depth = await this.getCommentDepth(data.parentId);
            if (depth >= (settings.max_depth || 3))
                throw new Error('Maximale Antworttiefe erreicht');
        }
        const isSpam = settings.spam_filter_enabled &&
            this.isLikelySpam(data.content, data.authorUrl);
        const status = isSpam
            ? 'spam'
            : settings.require_approval
                ? 'pending'
                : 'approved';
        const result = await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO blog_comments (tenant_id, post_id, parent_id, author_name, author_email, author_url,
            content, status, ip_address, user_agent, approved_at)
          VALUES (${tenantId}, ${data.postId}, ${data.parentId || null}, ${data.authorName}, ${data.authorEmail},
                  ${data.authorUrl || null}, ${data.content}, ${status}, ${data.ipAddress || null},
                  ${data.userAgent || null}, ${status === 'approved' ? (0, drizzle_orm_1.sql) `NOW()` : null})
          RETURNING *`);
        return result.rows?.[0];
    }
    async getComments(tenantId, filters) {
        let query = (0, drizzle_orm_1.sql) `SELECT c.*, p.title as post_title
                    FROM blog_comments c
                    LEFT JOIN posts p ON c.post_id = p.id
                    WHERE c.tenant_id = ${tenantId}`;
        if (filters?.status)
            query = (0, drizzle_orm_1.sql) `${query} AND c.status = ${filters.status}`;
        if (filters?.postId)
            query = (0, drizzle_orm_1.sql) `${query} AND c.post_id = ${filters.postId}`;
        query = (0, drizzle_orm_1.sql) `${query} ORDER BY c.created_at DESC LIMIT 100`;
        const result = await this.db.execute(query);
        return result.rows || [];
    }
    async getCommentCounts(tenantId) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT status, COUNT(*)::int as count FROM blog_comments WHERE tenant_id = ${tenantId} GROUP BY status`);
        const counts = {
            pending: 0,
            approved: 0,
            spam: 0,
            trash: 0,
        };
        for (const row of result.rows || [])
            counts[row.status] = row.count;
        return counts;
    }
    async approveComment(tenantId, commentId, userId) {
        await this.db.execute((0, drizzle_orm_1.sql) `UPDATE blog_comments SET status = 'approved', approved_at = NOW(), approved_by = ${userId || null}, updated_at = NOW()
          WHERE id = ${commentId} AND tenant_id = ${tenantId}`);
        return true;
    }
    async rejectComment(tenantId, commentId) {
        await this.db.execute((0, drizzle_orm_1.sql) `UPDATE blog_comments SET status = 'trash', updated_at = NOW()
          WHERE id = ${commentId} AND tenant_id = ${tenantId}`);
        return true;
    }
    async markAsSpam(tenantId, commentId) {
        await this.db.execute((0, drizzle_orm_1.sql) `UPDATE blog_comments SET status = 'spam', updated_at = NOW()
          WHERE id = ${commentId} AND tenant_id = ${tenantId}`);
        return true;
    }
    async deleteComment(tenantId, commentId) {
        await this.db.execute((0, drizzle_orm_1.sql) `DELETE FROM blog_comments WHERE id = ${commentId} AND tenant_id = ${tenantId}`);
        return true;
    }
    async pinComment(tenantId, commentId, pinned) {
        await this.db.execute((0, drizzle_orm_1.sql) `UPDATE blog_comments SET is_pinned = ${pinned}, updated_at = NOW()
          WHERE id = ${commentId} AND tenant_id = ${tenantId}`);
        return true;
    }
    async getSettings(tenantId) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT * FROM comment_settings WHERE tenant_id = ${tenantId} LIMIT 1`);
        if (result.rows?.length === 0) {
            await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO comment_settings (tenant_id) VALUES (${tenantId}) ON CONFLICT DO NOTHING`);
            return {
                enabled: true,
                require_approval: true,
                allow_anonymous: false,
                allow_replies: true,
                max_depth: 3,
                spam_filter_enabled: true,
            };
        }
        return result.rows[0];
    }
    async updateSettings(tenantId, data) {
        await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO comment_settings (tenant_id, enabled, require_approval, allow_anonymous, allow_replies, max_depth, close_after_days, spam_filter_enabled)
          VALUES (${tenantId}, ${data.enabled ?? true}, ${data.requireApproval ?? true}, ${data.allowAnonymous ?? false},
                  ${data.allowReplies ?? true}, ${data.maxDepth ?? 3}, ${data.closeAfterDays ?? 0}, ${data.spamFilterEnabled ?? true})
          ON CONFLICT (tenant_id) DO UPDATE SET
            enabled = EXCLUDED.enabled, require_approval = EXCLUDED.require_approval,
            allow_anonymous = EXCLUDED.allow_anonymous, allow_replies = EXCLUDED.allow_replies,
            max_depth = EXCLUDED.max_depth, close_after_days = EXCLUDED.close_after_days,
            spam_filter_enabled = EXCLUDED.spam_filter_enabled`);
        return true;
    }
    async getTenantIdBySlug(slug) {
        const [t] = await this.db
            .select({ id: schema_1.tenants.id })
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.slug, slug))
            .limit(1);
        return t?.id || null;
    }
    async getCommentDepth(commentId) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `WITH RECURSIVE depth AS (
            SELECT id, parent_id, 1 as level FROM blog_comments WHERE id = ${commentId}
            UNION ALL
            SELECT c.id, c.parent_id, d.level + 1 FROM blog_comments c JOIN depth d ON c.id = d.parent_id
          ) SELECT MAX(level) as max_depth FROM depth`);
        return parseInt(result.rows?.[0]?.max_depth) || 0;
    }
    isLikelySpam(content, url) {
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
        if (spamWords.some((w) => lower.includes(w)))
            return true;
        if ((content.match(/https?:\/\//g) || []).length > 3)
            return true;
        if (url && url.length > 200)
            return true;
        return false;
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = CommentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], CommentsService);
//# sourceMappingURL=comments.service.js.map