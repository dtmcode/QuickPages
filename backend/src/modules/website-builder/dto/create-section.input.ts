/**
 * 🎨 SECTION INPUTS
 * GraphQL Input Types
 */

import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { SectionType } from '../entities/section.entity';

@InputType()
export class CreateSectionInput {
  @Field()
  @IsString()
  pageId: string;

  @Field()
  @IsString()
  name: string;

  @Field(() => SectionType)
  type: SectionType;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  order?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  content?: Record<string, any>;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  styling?: Record<string, any>;
}