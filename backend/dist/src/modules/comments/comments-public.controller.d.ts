import type { Request } from 'express';
import { CommentsService } from './comments.service';
export declare class CommentsPublicController {
    private commentsService;
    constructor(commentsService: CommentsService);
    getComments(slug: string, postId: string): Promise<any>;
    submitComment(slug: string, postId: string, body: {
        authorName: string;
        authorEmail: string;
        authorUrl?: string;
        content: string;
        parentId?: string;
    }, req: Request): Promise<{
        success: boolean;
        comment: any;
        needsApproval: boolean;
    }>;
}
