// backend\src\modules\coupons\dto\coupons.types.ts

import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Coupon {
  @Field(() => ID) id: string;
  @Field() tenantId: string;
  @Field() code: string;
  @Field() type: string;
  @Field(() => Int) value: number;
  @Field(() => Int, { nullable: true }) minOrderAmount: number | null;
  @Field(() => Int, { nullable: true }) maxUses: number | null;
  @Field(() => Int) usedCount: number;
  @Field() isActive: boolean;
  @Field(() => Date, { nullable: true }) expiresAt: Date | null;
  @Field() applicableModule: string;
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
  @Field(() => Date, { nullable: true }) updatedAt: Date | null;
}

@ObjectType()
export class CouponsResponse {
  @Field(() => [Coupon]) coupons: Coupon[];
  @Field(() => Int) total: number;
}

@ObjectType()
export class CouponUse {
  @Field(() => ID) id: string;
  @Field() couponId: string;
  @Field() tenantId: string;
  @Field() customerEmail: string;
  @Field(() => String, { nullable: true }) referenceId: string | null;
  @Field() referenceType: string;
  @Field(() => Int) discountAmount: number;
  @Field(() => Date, { nullable: true }) usedAt: Date | null;
}

@ObjectType()
export class CouponUsesResponse {
  @Field(() => [CouponUse]) uses: CouponUse[];
  @Field(() => Int) total: number;
}

@ObjectType()
export class CouponValidationResult {
  @Field() valid: boolean;
  @Field(() => String, { nullable: true }) message: string | null;
  @Field(() => String, { nullable: true }) discountType: string | null;
  @Field(() => Int, { nullable: true }) discountValue: number | null;
  @Field(() => Int, { nullable: true }) discountAmount: number | null;
}