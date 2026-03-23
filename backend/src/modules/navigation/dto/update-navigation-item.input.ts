import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsBoolean, IsOptional, IsInt } from 'class-validator';

@InputType()
export class UpdateNavigationItemInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  label?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  type?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  url?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  pageId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  postId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  order?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  icon?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cssClass?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  openInNewTab?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  parentId?: string;
}
