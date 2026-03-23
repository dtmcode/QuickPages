import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import type { JwtPayload } from '../../core/auth/strategies/jwt.strategy';
import { CampaignService } from './campaign.service';
import {
  NewsletterCampaign,
  CreateCampaignInput,
  UpdateCampaignInput,
  CampaignStats,
  SendCampaignResult,
} from './dto/campaign.types';

@Resolver()
export class CampaignResolver {
  constructor(private campaignService: CampaignService) {}

  @Query(() => [NewsletterCampaign])
  @UseGuards(GqlAuthGuard)
  async newsletterCampaigns(
    @TenantId() tenantId: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ) {
    return this.campaignService.getCampaigns(tenantId, {
      status,
      limit,
      offset,
    });
  }

  @Query(() => NewsletterCampaign, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async newsletterCampaign(
    @TenantId() tenantId: string,
    @Args('id') id: string,
  ) {
    return this.campaignService.getCampaign(tenantId, id);
  }

  @Query(() => CampaignStats)
  @UseGuards(GqlAuthGuard)
  async campaignStats(@TenantId() tenantId: string, @Args('id') id: string) {
    return this.campaignService.getCampaignStats(tenantId, id);
  }

  @Mutation(() => NewsletterCampaign)
  @UseGuards(GqlAuthGuard)
  async createCampaign(
    @TenantId() tenantId: string,
    @Args('input') input: CreateCampaignInput,
  ) {
    return this.campaignService.createCampaign(tenantId, input);
  }

  @Mutation(() => NewsletterCampaign)
  @UseGuards(GqlAuthGuard)
  async updateCampaign(
    @TenantId() tenantId: string,
    @Args('id') id: string,
    @Args('input') input: UpdateCampaignInput,
  ) {
    return this.campaignService.updateCampaign(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteCampaign(@TenantId() tenantId: string, @Args('id') id: string) {
    return this.campaignService.deleteCampaign(tenantId, id);
  }

  @Mutation(() => SendCampaignResult)
  @UseGuards(GqlAuthGuard)
  async sendCampaign(@TenantId() tenantId: string, @Args('id') id: string) {
    return this.campaignService.sendCampaign(tenantId, id);
  }

  @Mutation(() => NewsletterCampaign)
  @UseGuards(GqlAuthGuard)
  async duplicateCampaign(
    @TenantId() tenantId: string,
    @Args('id') id: string,
  ) {
    return this.campaignService.duplicateCampaign(tenantId, id);
  }
}
