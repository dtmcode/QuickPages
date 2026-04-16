// backend\src\modules\coupons\coupons.resolver.ts

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';
import { CouponsService } from './coupons.service';
import {
  Coupon,
  CouponsResponse,
  CouponUsesResponse,
  CouponValidationResult,
} from './dto/coupons.types';
import {
  CreateCouponInput,
  UpdateCouponInput,
  ValidateCouponInput,
} from './dto/coupons.input';

@Resolver()
export class CouponsResolver {
  constructor(private readonly couponsService: CouponsService) {}

  // ─── Queries ──────────────────────────────────────────────────────────────

  @Query(() => CouponsResponse)
  @UseGuards(GqlAuthGuard)
  async coupons(@TenantId() tenantId: string) {
    return this.couponsService.getCoupons(tenantId);
  }

  @Query(() => Coupon)
  @UseGuards(GqlAuthGuard)
  async coupon(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.couponsService.getCouponById(tenantId, id);
  }

  @Query(() => CouponUsesResponse)
  @UseGuards(GqlAuthGuard)
  async couponUses(
    @TenantId() tenantId: string,
    @Args('couponId', { type: () => ID }) couponId: string,
  ) {
    return this.couponsService.getCouponUses(tenantId, couponId);
  }

  // Public — Kunden können Codes validieren ohne Login
  @Query(() => CouponValidationResult)
  async validateCoupon(
    @TenantId() tenantId: string,
    @Args('input') input: ValidateCouponInput,
  ) {
    return this.couponsService.validateCoupon(tenantId, input);
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  @Mutation(() => Coupon)
  @UseGuards(GqlAuthGuard)
  async createCoupon(
    @TenantId() tenantId: string,
    @Args('input') input: CreateCouponInput,
  ) {
    return this.couponsService.createCoupon(tenantId, input);
  }

  @Mutation(() => Coupon)
  @UseGuards(GqlAuthGuard)
  async updateCoupon(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCouponInput,
  ) {
    return this.couponsService.updateCoupon(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteCoupon(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.couponsService.deleteCoupon(tenantId, id);
  }
}
