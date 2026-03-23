import {
  Resolver,
  Query,
  Mutation,
  Args,
  InputType,
  Field,
  Int,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { Navigation } from './entities/navigation.entity';
import { NavigationItem } from './entities/navigation-item.entity';
import { CreateNavigationInput } from './dto/create-navigation.input';
import { UpdateNavigationInput } from './dto/update-navigation.input';
import { CreateNavigationItemInput } from './dto/create-navigation-item.input';
import { UpdateNavigationItemInput } from './dto/update-navigation-item.input';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';

@Resolver(() => Navigation)
@UseGuards(GqlAuthGuard)
export class NavigationResolver {
  constructor(private readonly navigationService: NavigationService) {}

  // ==================== NAVIGATIONS ====================

  @Mutation(() => Navigation)
  async createNavigation(
    @Args('input') input: CreateNavigationInput,
    @TenantId() tenantId: string,
  ): Promise<Navigation> {
    return this.navigationService.createNavigation(tenantId, input) as any;
  }

  @Query(() => [Navigation])
  async navigations(@TenantId() tenantId: string): Promise<Navigation[]> {
    return this.navigationService.findAll(tenantId) as any;
  }

  @Query(() => Navigation, { nullable: true })
  async navigationByLocation(
    @Args('location') location: string,
    @TenantId() tenantId: string,
  ): Promise<Navigation | null> {
    return this.navigationService.findByLocation(tenantId, location) as any;
  }

  @Query(() => Navigation)
  async navigation(
    @Args('id') id: string,
    @TenantId() tenantId: string,
  ): Promise<Navigation> {
    return this.navigationService.findOne(id, tenantId) as any;
  }

  @Mutation(() => Navigation)
  async updateNavigation(
    @Args('id') id: string,
    @Args('input') input: UpdateNavigationInput,
    @TenantId() tenantId: string,
  ): Promise<Navigation> {
    return this.navigationService.updateNavigation(id, tenantId, input) as any;
  }

  @Mutation(() => Boolean)
  async deleteNavigation(
    @Args('id') id: string,
    @TenantId() tenantId: string,
  ): Promise<boolean> {
    return this.navigationService.deleteNavigation(id, tenantId);
  }

  // ==================== NAVIGATION ITEMS ====================

  @Mutation(() => NavigationItem)
  async createNavigationItem(
    @Args('navigationId') navigationId: string,
    @Args('input') input: CreateNavigationItemInput,
    @TenantId() tenantId: string,
  ): Promise<NavigationItem> {
    return this.navigationService.createNavigationItem(
      navigationId,
      tenantId,
      input,
    ) as any;
  }

  @Query(() => [NavigationItem])
  async navigationItems(
    @Args('navigationId') navigationId: string,
    @TenantId() tenantId: string,
  ): Promise<NavigationItem[]> {
    return this.navigationService.findNavigationItems(
      navigationId,
      tenantId,
    ) as any;
  }

  @Mutation(() => NavigationItem)
  async updateNavigationItem(
    @Args('itemId') itemId: string,
    @Args('input') input: UpdateNavigationItemInput,
    @TenantId() tenantId: string,
  ): Promise<NavigationItem> {
    return this.navigationService.updateNavigationItem(
      itemId,
      tenantId,
      input,
    ) as any;
  }

  @Mutation(() => Boolean)
  async deleteNavigationItem(
    @Args('itemId') itemId: string,
    @TenantId() tenantId: string,
  ): Promise<boolean> {
    return this.navigationService.deleteNavigationItem(itemId, tenantId);
  }

  @Mutation(() => Boolean)
  async reorderNavigationItems(
    @Args('navigationId') navigationId: string,
    @Args('itemOrders', { type: () => [ItemOrderInput] })
    itemOrders: ItemOrderInput[],
    @TenantId() tenantId: string,
  ): Promise<boolean> {
    return this.navigationService.reorderNavigationItems(
      navigationId,
      tenantId,
      itemOrders,
    );
  }
}

// Input Type for reordering
@InputType()
class ItemOrderInput {
  @Field()
  id: string;

  @Field(() => Int)
  order: number;
}
