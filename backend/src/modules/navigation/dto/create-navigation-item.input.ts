import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsBoolean, IsOptional, IsInt } from 'class-validator';

@InputType()
export class CreateNavigationItemInput {
  @Field()
  @IsString()
  label: string;

  @Field()
  @IsString()
  type: string; // 'page', 'post', 'custom', 'category', 'external'

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

  @Field(() => Int, { defaultValue: 0 })
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

  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  openInNewTab?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  parentId?: string;
}
