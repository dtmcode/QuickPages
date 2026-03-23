import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../../core/auth/guards/gql-auth.guard';
import { SeoService } from '../services/seo.service';
import { SeoMeta, SeoMetaInput } from '../dto/seo.types';

@Resolver()
export class SeoResolver {
  constructor(private seoService: SeoService) {}

  @Query(() => SeoMeta, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async seoMeta(
    @Args('entityType') entityType: string,
    @Args('entityId') entityId: string,
  ) {
    return this.seoService.getSeoMeta(entityType, entityId);
  }

  @Mutation(() => SeoMeta)
  @UseGuards(GqlAuthGuard)
  async updateSeoMeta(
    @Args('entityType') entityType: string,
    @Args('entityId') entityId: string,
    @Args('input') input: SeoMetaInput,
  ) {
    return this.seoService.upsertSeoMeta(entityType, entityId, input);
  }
}
