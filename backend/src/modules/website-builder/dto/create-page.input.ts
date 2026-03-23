/**
 * 🎨 PAGE INPUTS
 * GraphQL Input Types
 */

import { InputType, Field, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreatePageInput {
  @Field()
  templateId: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field({ nullable: true })
  metaKeywords?: string;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  isHomepage?: boolean;

  @Field(() => Int, { nullable: true })
  order?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  settings?: Record<string, any>;
}
