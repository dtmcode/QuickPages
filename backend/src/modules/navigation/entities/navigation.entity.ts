import { ObjectType, Field, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { NavigationItem } from './navigation-item.entity';

@ObjectType()
export class Navigation {
  @Field(() => ID)
  id: string;

  @Field()
  tenantId: string;

  @Field()
  name: string;

  @Field()
  location: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isActive: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  settings?: Record<string, any>;

  @Field(() => [NavigationItem], { nullable: true })
  items?: NavigationItem[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}