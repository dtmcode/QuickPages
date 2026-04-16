// 📂 PFAD: backend/src/packages/dto/subscription.types.ts

import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';

export enum AddonType {
  SHOP_MODULE = 'shop_module',
  SHOP_EXTRA = 'shop_extra',
  BOOKING_MODULE = 'booking_module',
  BLOG_MODULE = 'blog_module',
  NEWSLETTER_EXTRA = 'newsletter_extra',
  MEMBERS_MODULE = 'members_module',
  AI_CONTENT = 'ai_content',
  EXTRA_PAGES = 'extra_pages',
  EXTRA_USERS = 'extra_users',
  I18N = 'i18n',
  CUSTOM_DOMAIN = 'custom_domain',
  RESTAURANT_MODULE = 'restaurant_module',
  LOCAL_STORE_MODULE = 'local_store_module',
  FUNNELS_MODULE = 'funnels_module',
  // Legacy — für bestehende DB-Einträge
  SHOP_BUSINESS = 'shop_business',
  SHOP_PRO = 'shop_pro',
  EMAIL_STARTER = 'email_starter',
  EMAIL_BUSINESS = 'email_business',
  NEWSLETTER = 'newsletter',
  BOOKING = 'booking',
  FORM_BUILDER = 'form_builder',
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
