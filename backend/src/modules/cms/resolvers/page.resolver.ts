import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../../core/auth/decorators/tenant-id.decorator';
import { PageService } from '../services/page.service';
import { Page, CreatePageInput, UpdatePageInput } from '../dto/page.types';

@Resolver()
export class PageResolver {
  constructor(private pageService: PageService) {}

  @Query(() => [Page])
  @UseGuards(GqlAuthGuard)
  async pages(
    @TenantId() tenantId: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('search', { nullable: true }) search?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ) {
    return this.pageService.getPages(tenantId, {
      status,
      search,
      limit,
      offset,
    });
  }

  @Query(() => Page, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async page(@TenantId() tenantId: string, @Args('id') id: string) {
    return this.pageService.getPage(tenantId, id);
  }

  @Query(() => Page, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async pageBySlug(@TenantId() tenantId: string, @Args('slug') slug: string) {
    return this.pageService.getPageBySlug(tenantId, slug);
  }

  @Mutation(() => Page)
  @UseGuards(GqlAuthGuard)
  async createPage(
    @TenantId() tenantId: string,
    @Args('input') input: CreatePageInput,
  ) {
    return this.pageService.createPage(tenantId, input);
  }

  @Mutation(() => Page)
  @UseGuards(GqlAuthGuard)
  async updatePage(
    @TenantId() tenantId: string,
    @Args('id') id: string,
    @Args('input') input: UpdatePageInput,
  ) {
    return this.pageService.updatePage(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deletePage(@TenantId() tenantId: string, @Args('id') id: string) {
    return this.pageService.deletePage(tenantId, id);
  }

  @Mutation(() => Page)
  @UseGuards(GqlAuthGuard)
  async duplicatePage(@TenantId() tenantId: string, @Args('id') id: string) {
    return this.pageService.duplicatePage(tenantId, id);
  }
}
