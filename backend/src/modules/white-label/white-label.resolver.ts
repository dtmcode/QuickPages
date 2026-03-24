// 📂 PFAD: backend/src/modules/white-label/white-label.resolver.ts
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ObjectType,
  Field,
  InputType,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';
import { PackageGuard } from '../../core/package/guards/package.guard';
import { RequireFeature } from '../../core/package/decorators/require-feature.decorator';
import { WhiteLabelService } from './white-label.service';

@ObjectType()
class BrandingSettingsType {
  @Field({ nullable: true }) platformName?: string;
  @Field({ nullable: true }) logoUrl?: string;
  @Field({ nullable: true }) logoInitial?: string;
  @Field({ nullable: true }) primaryColor?: string;
  @Field({ nullable: true }) hidePoweredBy?: boolean;
  @Field({ nullable: true }) faviconUrl?: string;
}

@InputType()
class UpdateBrandingInput {
  @Field({ nullable: true }) platformName?: string;
  @Field({ nullable: true }) logoUrl?: string;
  @Field({ nullable: true }) logoInitial?: string;
  @Field({ nullable: true }) primaryColor?: string;
  @Field({ nullable: true }) hidePoweredBy?: boolean;
  @Field({ nullable: true }) faviconUrl?: string;
}

@Resolver()
export class WhiteLabelResolver {
  constructor(private whiteLabelService: WhiteLabelService) {}

  @Query(() => BrandingSettingsType)
  @UseGuards(GqlAuthGuard)
  async brandingSettings(
    @TenantId() tenantId: string,
  ): Promise<BrandingSettingsType> {
    return this.whiteLabelService.getSettings(tenantId);
  }

  @Mutation(() => BrandingSettingsType)
  @UseGuards(GqlAuthGuard, PackageGuard)
  @RequireFeature('whiteLabel')
  async updateBranding(
    @Args('input') input: UpdateBrandingInput,
    @TenantId() tenantId: string,
  ): Promise<BrandingSettingsType> {
    return this.whiteLabelService.updateSettings(tenantId, input);
  }
}
