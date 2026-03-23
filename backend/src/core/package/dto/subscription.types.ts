// 📂 PFAD: backend/src/packages/dto/subscription.types.ts

import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';

export enum AddonType {
  // Legacy (Backwards-Compat — in DB vorhanden)
  SHOP_BUSINESS = 'shop_business',
  SHOP_PRO = 'shop_pro',
  EMAIL_STARTER = 'email_starter',
  EMAIL_BUSINESS = 'email_business',
  EXTRA_USERS = 'extra_users',
  // Neue Add-ons
  SHOP_MODULE = 'shop_module',
  NEWSLETTER = 'newsletter',
  BOOKING = 'booking',
  AI_CONTENT = 'ai_content',
  FORM_BUILDER = 'form_builder',
  I18N = 'i18n',
  EXTRA_PRODUCTS = 'extra_products',
  EXTRA_AI_CREDITS = 'extra_ai_credits',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
}

registerEnumType(AddonType, { name: 'AddonType' });
registerEnumType(SubscriptionStatus, { name: 'SubscriptionStatus' });

@ObjectType()
export class Subscription {
  @Field(() => ID)
  id: string;

  @Field()
  package: string;

  @Field(() => SubscriptionStatus)
  status: SubscriptionStatus;

  @Field()
  currentPeriodStart: Date;

  @Field()
  currentPeriodEnd: Date;

  @Field()
  cancelAtPeriodEnd: boolean;

  @Field({ nullable: true })
  stripeSubscriptionId?: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class TenantAddon {
  @Field(() => ID)
  id: string;

  @Field(() => AddonType)
  addonType: AddonType;

  @Field(() => Int)
  quantity: number;

  @Field()
  isActive: boolean;

  @Field()
  activatedAt: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class UsageStats {
  @Field()
  month: string;

  @Field(() => Int)
  emailsSent: number;

  @Field(() => Int)
  productsCreated: number;

  @Field(() => Int)
  postsCreated: number;

  @Field(() => Int)
  apiCalls: number;

  @Field(() => Int)
  storageUsedMb: number;
}

@ObjectType()
export class PackageLimitsType {
  @Field(() => Int)
  users: number;

  @Field(() => Int)
  posts: number;

  @Field(() => Int)
  pages: number;

  @Field(() => Int)
  products: number;

  @Field(() => Int)
  emailsPerMonth: number;

  @Field(() => Int)
  subscribers: number;

  @Field(() => Int)
  aiCredits: number;

  @Field(() => Int)
  storageMb: number;
}

@ObjectType()
export class TenantSubscriptionInfo {
  @Field()
  currentPackage: string;

  @Field(() => PackageLimitsType)
  limits: PackageLimitsType;

  @Field(() => [TenantAddon])
  addons: TenantAddon[];

  @Field(() => UsageStats)
  currentUsage: UsageStats;

  @Field({ nullable: true })
  subscription?: Subscription;
}

@ObjectType()
export class AddonDefinitionType {
  @Field(() => AddonType)
  type: AddonType;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Int)
  price: number;

  @Field(() => PackageLimitsType)
  limits: PackageLimitsType;
}

@ObjectType()
export class PackageDefinitionType {
  @Field()
  type: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Int)
  price: number;

  @Field(() => PackageLimitsType)
  limits: PackageLimitsType;

  @Field(() => [String])
  features: string[];
}

@ObjectType()
export class AvailablePackagesResponse {
  @Field(() => [PackageDefinitionType])
  packages: PackageDefinitionType[];

  @Field(() => [AddonDefinitionType])
  addons: AddonDefinitionType[];
}
