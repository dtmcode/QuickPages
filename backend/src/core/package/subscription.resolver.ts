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
import {
  PACKAGE_LIMITS,
  PACKAGE_PRICES,
  ADDON_DEFINITIONS,
  PackageType,
  type AddonDefinition,
} from './package.helper';

@Resolver()
export class SubscriptionResolver {
  constructor(private subscriptionService: SubscriptionService) {}

  // ===== PUBLIC QUERIES =====

  @Query(() => AvailablePackagesResponse)
  availablePackages(): AvailablePackagesResponse {
    const packages: PackageDefinitionType[] = [
      {
        type: 'page',
        name: 'Page',
        description: 'Eine professionelle Landing Page',
        price: PACKAGE_PRICES[PackageType.PAGE],
        limits: {
          ...PACKAGE_LIMITS[PackageType.PAGE],
        },
        features: ['1 Landing Page', 'Website Builder', 'Basis-Analytics'],
      },
      {
        type: 'landing',
        name: 'Landing',
        description: 'Bis zu 3 Landing Pages mit Domain',
        price: PACKAGE_PRICES[PackageType.LANDING],
        limits: {
          ...PACKAGE_LIMITS[PackageType.LANDING],
        },
        features: ['3 Landing Pages', 'Eigene Domain', 'Kontaktformular'],
      },
      {
        type: 'creator',
        name: 'Creator',
        description: 'Blog und mehrere Seiten',
        price: PACKAGE_PRICES[PackageType.CREATOR],
        limits: {
          ...PACKAGE_LIMITS[PackageType.CREATOR],
        },
        features: ['10 Seiten', 'Blog (50 Posts)', 'Eigene Domain'],
      },
      {
        type: 'business',
        name: 'Business',
        description: 'Newsletter, Booking, Forms',
        price: PACKAGE_PRICES[PackageType.BUSINESS],
        limits: {
          ...PACKAGE_LIMITS[PackageType.BUSINESS],
        },
        features: ['30 Seiten', 'Newsletter', 'Booking', 'Form Builder'],
      },
      {
        type: 'shop',
        name: 'Shop',
        description: 'Vollständiges Shop-System',
        price: PACKAGE_PRICES[PackageType.SHOP],
        limits: {
          ...PACKAGE_LIMITS[PackageType.SHOP],
        },
        features: ['200 Produkte', 'Stripe Payments', 'Bestellverwaltung'],
      },
      {
        type: 'professional',
        name: 'Professional',
        description: 'AI, Mehrsprachigkeit, großer Shop',
        price: PACKAGE_PRICES[PackageType.PROFESSIONAL],
        limits: {
          ...PACKAGE_LIMITS[PackageType.PROFESSIONAL],
        },
        features: ['AI Content', 'Mehrsprachigkeit', '1.000 Produkte'],
      },
      {
        type: 'enterprise',
        name: 'Enterprise',
        description: 'Unbegrenzte Ressourcen, White-Label',
        price: PACKAGE_PRICES[PackageType.ENTERPRISE],
        limits: {
          ...PACKAGE_LIMITS[PackageType.ENTERPRISE],
        },
        features: ['White-Label', 'Unbegrenzte Ressourcen', 'Account Manager'],
      },
    ];

    const addons: AddonDefinitionType[] = Object.entries(ADDON_DEFINITIONS).map(
      ([key, def]: [string, AddonDefinition]) => ({
        type: key as AddonType,
        name: def.name,
        description: def.description,
        price: def.price,
        limits: {
          users: def.limits.users ?? 0,
          posts: def.limits.posts ?? 0,
          pages: def.limits.pages ?? 0,
          products: def.limits.products ?? 0,
          emailsPerMonth: def.limits.emailsPerMonth ?? 0,
          subscribers: def.limits.subscribers ?? 0,
          aiCredits: def.limits.aiCredits ?? 0,
          storageMb: def.limits.storageMb ?? 0,
        },
      }),
    );

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
