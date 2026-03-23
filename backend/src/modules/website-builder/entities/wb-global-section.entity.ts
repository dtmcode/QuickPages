/**
 * 🌟 WB GLOBAL SECTION ENTITY
 * GraphQL Object Type für Global Template Sections
 */

import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { SectionType } from './section.entity';

@ObjectType()
export class WbGlobalSection {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => SectionType)
  type: SectionType;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field(() => Int)
  order: number;

  @Field(() => GraphQLJSON)
  content: Record<string, any>;

  @Field(() => GraphQLJSON, { nullable: true })
  styling?: Record<string, any>;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
