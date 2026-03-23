/**
 * ==================== COMMENTS MODULE ====================
 * import { CommentsModule } from './modules/comments/comments.module';
 */
import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsResolver } from './comments.resolver';
import { CommentsPublicController } from './comments-public.controller';

@Module({
  controllers: [CommentsPublicController],
  providers: [CommentsService, CommentsResolver],
  exports: [CommentsService],
})
export class CommentsModule {}
