import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { CommentsService } from './comments.service';

@Controller('api/public/:tenant/comments')
export class CommentsPublicController {
  constructor(private commentsService: CommentsService) {}

  @Get(':postId')
  async getComments(
    @Param('tenant') slug: string,
    @Param('postId') postId: string,
  ) {
    const tid = await this.commentsService.getTenantIdBySlug(slug);
    if (!tid) throw new HttpException('Nicht gefunden', HttpStatus.NOT_FOUND);
    return this.commentsService.getPublicComments(tid, postId);
  }

  @Post(':postId')
  async submitComment(
    @Param('tenant') slug: string,
    @Param('postId') postId: string,
    @Body()
    body: {
      authorName: string;
      authorEmail: string;
      authorUrl?: string;
      content: string;
      parentId?: string;
    },
    @Req() req: Request,
  ) {
    const tid = await this.commentsService.getTenantIdBySlug(slug);
    if (!tid) throw new HttpException('Nicht gefunden', HttpStatus.NOT_FOUND);
    if (!body.authorName || !body.authorEmail || !body.content)
      throw new HttpException('Pflichtfelder fehlen', HttpStatus.BAD_REQUEST);
    if (body.content.length > 5000)
      throw new HttpException(
        'Kommentar zu lang (max 5000 Zeichen)',
        HttpStatus.BAD_REQUEST,
      );

    try {
      const comment = await this.commentsService.submitComment(tid, {
        postId,
        ...body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string | undefined,
      });
      return {
        success: true,
        comment,
        needsApproval:
          (comment as Record<string, unknown>).status === 'pending',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }
}
