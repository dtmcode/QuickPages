import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ObjectType,
  Field,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import { CommentsService } from './comments.service';

@ObjectType()
class CommentType {
  @Field() id: string;
  @Field() postId: string;
  @Field({ nullable: true }) parentId?: string;
  @Field() authorName: string;
  @Field() authorEmail: string;
  @Field({ nullable: true }) authorUrl?: string;
  @Field() content: string;
  @Field() status: string;
  @Field(() => Int) likes: number;
  @Field() isPinned: boolean;
  @Field({ nullable: true }) postTitle?: string;
  @Field() createdAt: Date;
}

@ObjectType()
class CommentCountsType {
  @Field(() => Int) pending: number;
  @Field(() => Int) approved: number;
  @Field(() => Int) spam: number;
  @Field(() => Int) trash: number;
}

@Resolver()
export class CommentsResolver {
  constructor(private commentsService: CommentsService) {}

  @Query(() => [CommentType])
  @UseGuards(GqlAuthGuard)
  async comments(
    @TenantId() tid: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('postId', { nullable: true }) postId?: string,
  ) {
    const rows = await this.commentsService.getComments(tid, {
      status,
      postId,
    });
    return rows.map((r: any) => ({
      id: r.id,
      postId: r.post_id,
      parentId: r.parent_id,
      authorName: r.author_name,
      authorEmail: r.author_email,
      authorUrl: r.author_url,
      content: r.content,
      status: r.status,
      likes: r.likes,
      isPinned: r.is_pinned,
      postTitle: r.post_title,
      createdAt: r.created_at,
    }));
  }

  @Query(() => CommentCountsType)
  @UseGuards(GqlAuthGuard)
  async commentCounts(@TenantId() tid: string) {
    return this.commentsService.getCommentCounts(tid);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async approveComment(
    @Args('id') id: string,
    @TenantId() tid: string,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.approveComment(tid, id, user.userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async rejectComment(@Args('id') id: string, @TenantId() tid: string) {
    return this.commentsService.rejectComment(tid, id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async markCommentAsSpam(@Args('id') id: string, @TenantId() tid: string) {
    return this.commentsService.markAsSpam(tid, id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteComment(@Args('id') id: string, @TenantId() tid: string) {
    return this.commentsService.deleteComment(tid, id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async pinComment(
    @Args('id') id: string,
    @Args('pinned') pinned: boolean,
    @TenantId() tid: string,
  ) {
    return this.commentsService.pinComment(tid, id, pinned);
  }
}
