import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import type { JwtPayload } from '../../core/auth/strategies/jwt.strategy';
import { SubscriberService } from './subscriber.service';
import {
  NewsletterSubscriber,
  CreateSubscriberInput,
  UpdateSubscriberInput,
  SubscriberStats,
  BulkImportResult,
} from './dto/subscriber.types';

@Resolver()
export class SubscriberResolver {
  constructor(private subscriberService: SubscriberService) {}

  @Query(() => [NewsletterSubscriber])
  @UseGuards(GqlAuthGuard)
  async newsletterSubscribers(
    @TenantId() tenantId: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('search', { nullable: true }) search?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ) {
    return this.subscriberService.getSubscribers(tenantId, {
      status,
      search,
      limit,
      offset,
    });
  }

  @Query(() => NewsletterSubscriber, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async newsletterSubscriber(
    @TenantId() tenantId: string,
    @Args('id') id: string,
  ) {
    return this.subscriberService.getSubscriber(tenantId, id);
  }

  @Query(() => SubscriberStats)
  @UseGuards(GqlAuthGuard)
  async subscriberStats(@TenantId() tenantId: string) {
    const [total, active, pending, unsubscribed] = await Promise.all([
      this.subscriberService.getSubscriberCount(tenantId),
      this.subscriberService.getSubscriberCount(tenantId, 'active'),
      this.subscriberService.getSubscriberCount(tenantId, 'pending'),
      this.subscriberService.getSubscriberCount(tenantId, 'unsubscribed'),
    ]);

    return { total, active, pending, unsubscribed };
  }

  @Query(() => [String])
  @UseGuards(GqlAuthGuard)
  async subscriberTags(@TenantId() tenantId: string) {
    return this.subscriberService.getTags(tenantId);
  }

  @Mutation(() => NewsletterSubscriber)
  @UseGuards(GqlAuthGuard)
  async createSubscriber(
    @TenantId() tenantId: string,
    @Args('input') input: CreateSubscriberInput,
  ) {
    return this.subscriberService.createSubscriber(tenantId, input);
  }

  @Mutation(() => NewsletterSubscriber)
  @UseGuards(GqlAuthGuard)
  async updateSubscriber(
    @TenantId() tenantId: string,
    @Args('id') id: string,
    @Args('input') input: UpdateSubscriberInput,
  ) {
    return this.subscriberService.updateSubscriber(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteSubscriber(@TenantId() tenantId: string, @Args('id') id: string) {
    return this.subscriberService.deleteSubscriber(tenantId, id);
  }

  @Mutation(() => BulkImportResult)
  @UseGuards(GqlAuthGuard)
  async bulkImportSubscribers(
    @TenantId() tenantId: string,
    @Args('subscribers', { type: () => [CreateSubscriberInput] })
    subscribers: CreateSubscriberInput[],
  ) {
    return this.subscriberService.bulkImport(tenantId, subscribers);
  }
}
