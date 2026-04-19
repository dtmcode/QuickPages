// 📂 PFAD: backend/src/core/auth/dto/auth.types.ts

import {
  ObjectType,
  Field,
  ID,
  registerEnumType,
  InputType,
} from '@nestjs/graphql';

// Enums
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  USER = 'user',
}

registerEnumType(UserRole, { name: 'UserRole' });

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

  @Field()
  package: string;

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
@InputType()
export class UpdateBrandingInput {
  @Field({ nullable: true })
  primaryColor?: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  platformName?: string;
}

@ObjectType()
export class BrandingResult {
  @Field({ nullable: true })
  primaryColor?: string;

  @Field({ nullable: true })
  logoUrl?: string;
}
