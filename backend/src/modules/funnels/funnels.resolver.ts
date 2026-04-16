// backend\src\modules\funnels\funnels.resolver.ts

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';
import { FunnelsService } from './funnels.service';
import {
  Funnel,
  FunnelsResponse,
  FunnelStep,
  FunnelSubmission,
  FunnelSubmissionsResponse,
  FunnelAnalytics,
} from './dto/funnels.types';
import {
  CreateFunnelInput,
  UpdateFunnelInput,
  CreateFunnelStepInput,
  UpdateFunnelStepInput,
  UpdateFunnelStepContentInput,
  CreateFunnelSubmissionInput,
  TrackFunnelEventInput,
} from './dto/funnels.input';

@Resolver()
export class FunnelsResolver {
  constructor(private readonly funnelsService: FunnelsService) {}

  // ─── Funnels ──────────────────────────────────────────────────────────────────

  @Query(() => FunnelsResponse)
  @UseGuards(GqlAuthGuard)
  async funnels(@TenantId() tenantId: string) {
    return this.funnelsService.getFunnels(tenantId);
  }

  @Query(() => Funnel)
  @UseGuards(GqlAuthGuard)
  async funnel(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.funnelsService.getFunnelById(tenantId, id);
  }

  // Public — für Public Renderer
  @Query(() => Funnel)
  async publicFunnel(
    @TenantId() tenantId: string,
    @Args('slug') slug: string,
  ) {
    return this.funnelsService.getFunnelBySlug(tenantId, slug);
  }

  @Mutation(() => Funnel)
  @UseGuards(GqlAuthGuard)
  async createFunnel(
    @TenantId() tenantId: string,
    @Args('input') input: CreateFunnelInput,
  ) {
    return this.funnelsService.createFunnel(tenantId, input);
  }

  @Mutation(() => Funnel)
  @UseGuards(GqlAuthGuard)
  async updateFunnel(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateFunnelInput,
  ) {
    return this.funnelsService.updateFunnel(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteFunnel(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.funnelsService.deleteFunnel(tenantId, id);
  }

  @Mutation(() => Funnel)
  @UseGuards(GqlAuthGuard)
  async duplicateFunnel(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.funnelsService.duplicateFunnel(tenantId, id);
  }

  // ─── Steps ────────────────────────────────────────────────────────────────────

  @Mutation(() => FunnelStep)
  @UseGuards(GqlAuthGuard)
  async createFunnelStep(
    @TenantId() tenantId: string,
    @Args('input') input: CreateFunnelStepInput,
  ) {
    return this.funnelsService.createStep(tenantId, input);
  }

  @Mutation(() => FunnelStep)
  @UseGuards(GqlAuthGuard)
  async updateFunnelStep(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateFunnelStepInput,
  ) {
    return this.funnelsService.updateStep(tenantId, id, input);
  }

  @Mutation(() => FunnelStep)
  @UseGuards(GqlAuthGuard)
  async updateFunnelStepContent(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateFunnelStepContentInput,
  ) {
    return this.funnelsService.updateStepContent(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteFunnelStep(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.funnelsService.deleteStep(tenantId, id);
  }

  @Mutation(() => Funnel)
  @UseGuards(GqlAuthGuard)
  async reorderFunnelSteps(
    @TenantId() tenantId: string,
    @Args('funnelId', { type: () => ID }) funnelId: string,
    @Args('stepIds', { type: () => [ID] }) stepIds: string[],
  ) {
    return this.funnelsService.reorderSteps(tenantId, funnelId, stepIds);
  }

  // ─── Submissions (Public) ─────────────────────────────────────────────────────

  @Mutation(() => FunnelSubmission)
  async submitFunnel(
    @TenantId() tenantId: string,
    @Args('input') input: CreateFunnelSubmissionInput,
  ) {
    return this.funnelsService.createSubmission(tenantId, input);
  }

  @Query(() => FunnelSubmissionsResponse)
  @UseGuards(GqlAuthGuard)
  async funnelSubmissions(
    @TenantId() tenantId: string,
    @Args('funnelId', { type: () => ID }) funnelId: string,
  ) {
    return this.funnelsService.getSubmissions(tenantId, funnelId);
  }

  // ─── Tracking (Public) ────────────────────────────────────────────────────────

  @Mutation(() => Boolean)
  async trackFunnelEvent(
    @TenantId() tenantId: string,
    @Args('input') input: TrackFunnelEventInput,
  ) {
    return this.funnelsService.trackEvent(tenantId, input);
  }

  // ─── Analytics ────────────────────────────────────────────────────────────────

  @Query(() => FunnelAnalytics)
  @UseGuards(GqlAuthGuard)
  async funnelAnalytics(
    @TenantId() tenantId: string,
    @Args('funnelId', { type: () => ID }) funnelId: string,
  ) {
    return this.funnelsService.getAnalytics(tenantId, funnelId);
  }
}
