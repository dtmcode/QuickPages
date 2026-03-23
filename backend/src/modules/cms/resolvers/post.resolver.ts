import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../../core/auth/decorators/tenant-id.decorator';
import { PostService } from '../services/post.service';
import {
  Post,
  PostsResponse,
  CreatePostInput,
  UpdatePostInput,
} from '../dto/post.types';

@Resolver(() => Post)
export class PostResolver {
  constructor(private postService: PostService) {}

  @Query(() => PostsResponse)
  @UseGuards(GqlAuthGuard)
  async posts(
    @TenantId() tenantId: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('search', { nullable: true }) search?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ) {
    const posts = await this.postService.getPosts(tenantId, {
      status,
      search,
      limit,
      offset,
    });

    return {
      posts,
      total: posts.length,
    };
  }

  @Query(() => Post, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async post(@TenantId() tenantId: string, @Args('id') id: string) {
    return this.postService.getPost(tenantId, id);
  }

  @Mutation(() => Post)
  @UseGuards(GqlAuthGuard)
  async createPost(
    @TenantId() tenantId: string,
    @Args('input') input: CreatePostInput,
  ) {
    return this.postService.createPost(tenantId, input);
  }

  @Mutation(() => Post)
  @UseGuards(GqlAuthGuard)
  async updatePost(
    @TenantId() tenantId: string,
    @Args('id') id: string,
    @Args('input') input: UpdatePostInput,
  ) {
    return this.postService.updatePost(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deletePost(@TenantId() tenantId: string, @Args('id') id: string) {
    return this.postService.deletePost(tenantId, id);
  }
}
