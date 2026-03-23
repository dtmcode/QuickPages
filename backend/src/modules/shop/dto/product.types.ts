import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Category {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  image?: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class Product {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  price: number;

  @Field(() => Int, { nullable: true })
  compareAtPrice?: number;

  @Field(() => Int)
  stock: number;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field({ nullable: true })
  categoryId?: string; // ← NEU HINZUFÜGEN

  @Field({ nullable: true })
  category?: Category;

  @Field()
  isActive: boolean;

  @Field()
  isFeatured: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class ProductsResponse {
  @Field(() => [Product])
  products: Product[];

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class CategoriesResponse {
  @Field(() => [Category])
  categories: Category[];

  @Field(() => Int)
  total: number;
}
