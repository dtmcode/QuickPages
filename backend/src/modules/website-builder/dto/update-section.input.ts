import { InputType, Field, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { SectionType } from '../entities/section.entity';

@InputType()
export class UpdateSectionInput {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  name?: string;

  @IsOptional()
  @IsEnum(SectionType)
  @Field(() => SectionType, { nullable: true })
  type?: SectionType;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  order?: number;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isActive?: boolean;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  content?: Record<string, any>;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  styling?: Record<string, any>;
}
