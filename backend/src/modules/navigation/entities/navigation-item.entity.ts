import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class NavigationItem {
  @Field(() => ID)
  id: string;

  @Field()
  navigationId: string;

  @Field()
  label: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  pageId?: string;

  @Field({ nullable: true })
  postId?: string;

  @Field({ nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  cssClass?: string;

  @Field()
  openInNewTab: boolean;

  @Field(() => Int)
  order: number;

  @Field({ nullable: true })
  parentId?: string;

  @Field(() => [NavigationItem], { nullable: true })
  children?: NavigationItem[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
