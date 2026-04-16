// backend\src\modules\coupons\dto\coupons.input.ts

import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateCouponInput {
  @Field() code: string;
  @Field() type: string; // percent | fixed | free_shipping
  @Field(() => Int) value: number;
  @Field(() => Int, { nullable: true }) minOrderAmount?: number;
  @Field(() => Int, { nullable: true }) maxUses?: number;
  @Field({ nullable: true }) expiresAt?: Date;
  @Field({ nullable: true }) applicableTo?: string; // all | shop | restaurant | local
  @Field({ nullable: true }) isActive?: boolean;
}

@InputType()
export class UpdateCouponInput {
  @Field({ nullable: true }) code?: string;
  @Field({ nullable: true }) type?: string;
  @Field(() => Int, { nullable: true }) value?: number;
  @Field(() => Int, { nullable: true }) minOrderAmount?: number;
  @Field(() => Int, { nullable: true }) maxUses?: number;
  @Field({ nullable: true }) expiresAt?: Date;
  @Field({ nullable: true }) applicableTo?: string;
  @Field({ nullable: true }) isActive?: boolean;
}

@InputType()
export class ValidateCouponInput {
  @Field() code: string;
  @Field() module: string;          // shop | restaurant | local
  @Field(() => Int) orderAmount: number; // in Cent
}
