// 📂 PFAD: backend/src/core/auth/dto/auth.types.ts

import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

// Enums
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  USER = 'user',
}

export enum PackageType {
  STARTER = 'starter',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise',
}

registerEnumType(UserRole, { name: 'UserRole' });
registerEnumType(PackageType, { name: 'PackageType' });

// User Type
@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field()
  isActive: boolean;

  @Field()
  emailVerified: boolean;

  @Field({ nullable: true })
  lastLoginAt?: Date;

  @Field()
  createdAt: Date;
}

// Tenant Type
@ObjectType()
export class Tenant {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  domain?: string;

  @Field(() => PackageType)
  package: PackageType;

  @Field({ nullable: true })
  shopTemplate?: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;
}

// Auth Response
@ObjectType()
export class AuthResponse {
  @Field(() => User)
  user: User;

  @Field(() => Tenant)
  tenant: Tenant;

  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}

@ObjectType()
export class CurrentUserResponse {
  @Field(() => User)
  user: User;

  @Field(() => Tenant)
  tenant: Tenant;
}

// ✅ NEU: Generische Erfolgs-Response für Password Reset
@ObjectType()
export class SuccessResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
