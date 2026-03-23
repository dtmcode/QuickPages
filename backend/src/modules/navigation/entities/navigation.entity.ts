import { ObjectType, Field, ID } from '@nestjs/graphql';
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

  @Field(() => [NavigationItem], { nullable: true })
  items?: NavigationItem[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
