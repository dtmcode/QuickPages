import type { DrizzleDB } from '../../core/database/drizzle.module';
export declare class CommentsService {
    private db;
    private readonly logger;
    constructor(db: DrizzleDB);
    getPublicComments(tenantId: string, postId: string): Promise<any>;
    submitComment(tenantId: string, data: {
        postId: string;
        parentId?: string;
        authorName: string;
        authorEmail: string;
        authorUrl?: string;
        content: string;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<any>;
    getComments(tenantId: string, filters?: {
        status?: string;
        postId?: string;
    }): Promise<any>;
    getCommentCounts(tenantId: string): Promise<Record<string, number>>;
    approveComment(tenantId: string, commentId: string, userId?: string): Promise<boolean>;
    rejectComment(tenantId: string, commentId: string): Promise<boolean>;
    markAsSpam(tenantId: string, commentId: string): Promise<boolean>;
    deleteComment(tenantId: string, commentId: string): Promise<boolean>;
    pinComment(tenantId: string, commentId: string, pinned: boolean): Promise<boolean>;
    getSettings(tenantId: string): Promise<any>;
    updateSettings(tenantId: string, data: Record<string, any>): Promise<boolean>;
    getTenantIdBySlug(slug: string): Promise<string | null>;
    private getCommentDepth;
    private isLikelySpam;
}
