import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, MaxLength, Min } from 'class-validator';

@InputType()
export class CreateCategoryInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @Field({ nullable: true })
  @MaxLength(1000)
  description?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ defaultValue: true })
  isActive: boolean;
}

@InputType()
export class UpdateCategoryInput {
  @Field({ nullable: true })
  @MaxLength(200)
  name?: string;

  @Field({ nullable: true })
  @MaxLength(1000)
  description?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class CreateProductInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(500)
  name: string;

  @Field({ nullable: true })
  @MaxLength(5000)
  description?: string;

  @Field(() => Int)
  @Min(0)
  price: number;

  @Field(() => Int, { nullable: true })
  compareAtPrice?: number;

  @Field(() => Int, { defaultValue: 0 })
  @Min(0)
  stock: number;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field({ nullable: true })
  categoryId?: string;

  @Field({ defaultValue: true })
  isActive: boolean;

  @Field({ defaultValue: false })
  isFeatured: boolean;
}

@InputType()
export class UpdateProductInput {
  @Field({ nullable: true })
  @MaxLength(500)
  name?: string;

  @Field({ nullable: true })
  @MaxLength(5000)
  description?: string;

  @Field(() => Int, { nullable: true })
  price?: number;

  @Field(() => Int, { nullable: true })
  compareAtPrice?: number;

  @Field(() => Int, { nullable: true })
  stock?: number;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field({ nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  isFeatured?: boolean;
}
