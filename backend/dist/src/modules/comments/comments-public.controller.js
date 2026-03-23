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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsPublicController = void 0;
const common_1 = require("@nestjs/common");
const comments_service_1 = require("./comments.service");
let CommentsPublicController = class CommentsPublicController {
    commentsService;
    constructor(commentsService) {
        this.commentsService = commentsService;
    }
    async getComments(slug, postId) {
        const tid = await this.commentsService.getTenantIdBySlug(slug);
        if (!tid)
            throw new common_1.HttpException('Nicht gefunden', common_1.HttpStatus.NOT_FOUND);
        return this.commentsService.getPublicComments(tid, postId);
    }
    async submitComment(slug, postId, body, req) {
        const tid = await this.commentsService.getTenantIdBySlug(slug);
        if (!tid)
            throw new common_1.HttpException('Nicht gefunden', common_1.HttpStatus.NOT_FOUND);
        if (!body.authorName || !body.authorEmail || !body.content)
            throw new common_1.HttpException('Pflichtfelder fehlen', common_1.HttpStatus.BAD_REQUEST);
        if (body.content.length > 5000)
            throw new common_1.HttpException('Kommentar zu lang (max 5000 Zeichen)', common_1.HttpStatus.BAD_REQUEST);
        try {
            const comment = await this.commentsService.submitComment(tid, {
                postId,
                ...body,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            return {
                success: true,
                comment,
                needsApproval: comment.status === 'pending',
            };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
            throw new common_1.HttpException(message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.CommentsPublicController = CommentsPublicController;
__decorate([
    (0, common_1.Get)(':postId'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CommentsPublicController.prototype, "getComments", null);
__decorate([
    (0, common_1.Post)(':postId'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], CommentsPublicController.prototype, "submitComment", null);
exports.CommentsPublicController = CommentsPublicController = __decorate([
    (0, common_1.Controller)('api/public/:tenant/comments'),
    __metadata("design:paramtypes", [comments_service_1.CommentsService])
], CommentsPublicController);
//# sourceMappingURL=comments-public.controller.js.map