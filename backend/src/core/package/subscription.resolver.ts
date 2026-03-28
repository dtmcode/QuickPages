// 📂 PFAD: backend/src/core/package/subscription.resolver.ts

import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { TenantId } from '../auth/decorators/tenant-id.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { SubscriptionService } from './subscription.service';
import {
  TenantSubscriptionInfo,
  AvailablePackagesResponse,
  PackageDefinitionType,
  AddonDefinitionType,
  AddonType,
} from './dto/subscription.types';
import { PACKAGES, ADDONS, PackageType } from './package.helper';


@Resolver()
export class SubscriptionResolver {
  constructor(private subscriptionService: SubscriptionService) {}

  // ===== PUBLIC QUERIES =====

@Query(() => AvailablePackagesResponse)
availablePackages(): AvailablePackagesResponse {
  const packages: PackageDefinitionType[] = Object.values(PACKAGES).map(pkg => ({
    type: pkg.type,
    name: pkg.name,
    description: pkg.description,
    price: pkg.priceMonthly,
    limits: {
      users:          pkg.features.maxUsers,
      posts:          pkg.features.maxPosts,
      pages:          pkg.features.maxPages,
      products:       pkg.features.maxProducts,
      emailsPerMonth: pkg.features.maxSubscribers,
      subscribers:    pkg.features.maxSubscribers,
      aiCredits:      pkg.features.aiCreditsPerMonth,
      storageMb:      pkg.features.storageMb,
    },
    features: pkg.highlightFeatures,
  }));

  const addons: AddonDefinitionType[] = Object.values(ADDONS).map(def => ({
    type: def.type as any,
    name: def.name,
    description: def.description,
    price: def.priceMonthly,
    limits: {
      users:          def.adds.maxUsers          ?? 0,
      posts:          def.adds.maxPosts          ?? 0,
      pages:          def.adds.maxPages          ?? 0,
      products:       def.adds.maxProducts       ?? 0,
      emailsPerMonth: def.adds.maxSubscribers    ?? 0,
      subscribers:    def.adds.maxSubscribers    ?? 0,
      aiCredits:      def.adds.aiCreditsPerMonth ?? 0,
      storageMb:      0,
    },
  }));

  return { packages, addons };
}
  // ===== PROTECTED QUERIES =====

  @Query(() => TenantSubscriptionInfo)
  @UseGuards(GqlAuthGuard)
  async tenantSubscription(
    @TenantId() tenantId: string,
  ): Promise<TenantSubscriptionInfo> {
    return await this.subscriptionService.getTenantSubscriptionInfo(tenantId);
  }

  // ===== MUTATIONS =====

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async activateAddon(
    @Args('addonType', { type: () => String }) addonType: string,
    @Args('quantity', { nullable: true, defaultValue: 1 }) quantity: number,
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    if (user.role !== 'owner') {
      throw new Error('Nur der Owner kann Add-ons aktivieren');
    }

    const validAddons = Object.values(AddonType) as string[];
    if (!validAddons.includes(addonType)) {
      throw new Error(`Ungültiger Add-on Typ: ${addonType}`);
    }

    await this.subscriptionService.activateAddon(
      tenantId,
      addonType as AddonType,
      quantity,
    );
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deactivateAddon(
    @Args('addonType', { type: () => String }) addonType: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    if (user.role !== 'owner') {
      throw new Error('Nur der Owner kann Add-ons deaktivieren');
    }

    await this.subscriptionService.deactivateAddon(
      tenantId,
      addonType as AddonType,
    );
    return true;
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async changePackage(
    @Args('targetPackage') targetPackage: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<string> {
    if (user.role !== 'owner') {
      throw new Error('Nur der Owner kann das Package ändern');
    }

    await this.subscriptionService.changePackage(tenantId, targetPackage);
    return targetPackage;
  }
}
