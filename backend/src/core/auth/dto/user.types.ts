import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserRole } from './auth.types';

@ObjectType()
export class UserListItem {
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

@ObjectType()
export class UsersResponse {
  @Field(() => [UserListItem])
  users: UserListItem[];

  @Field()
  total: number;
}
