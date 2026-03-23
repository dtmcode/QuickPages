/**
 * 🎨 UPDATE TEMPLATE INPUT
 * GraphQL Input Type
 */

import { InputType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class UpdateTemplateInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  isDefault?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  settings?: Record<string, any>;
}
