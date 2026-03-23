/**
 * 🎨 UPDATE SECTION INPUT
 * GraphQL Input Type
 */

import { InputType, Field, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { SectionType } from '../entities/section.entity';

@InputType()
export class UpdateSectionInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => SectionType, { nullable: true })
  type?: SectionType;

  @Field(() => Int, { nullable: true })
  order?: number;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  content?: Record<string, any>;

  @Field(() => GraphQLJSON, { nullable: true })
  styling?: Record<string, any>;
}
