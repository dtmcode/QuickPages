import { CommentsService } from './comments.service';
export declare class CommentsResolver {
    private commentsService;
    constructor(commentsService: CommentsService);
    comments(tid: string, status?: string, postId?: string): Promise<any>;
    commentCounts(tid: string): Promise<Record<string, number>>;
    approveComment(id: string, tid: string, user: any): Promise<boolean>;
    rejectComment(id: string, tid: string): Promise<boolean>;
    markCommentAsSpam(id: string, tid: string): Promise<boolean>;
    deleteComment(id: string, tid: string): Promise<boolean>;
    pinComment(id: string, pinned: boolean, tid: string): Promise<boolean>;
}
