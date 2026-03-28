/**
 * 🎨 TEMPLATE ENTITY
 * GraphQL Object Type
 */

import { ObjectType, Field, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Page } from './page.entity';

@ObjectType()
export class Template {
  @Field(() => ID)
  id: string;

  @Field()
  tenantId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field()
  isActive: boolean;

  @Field()
  isDefault: boolean;

  @Field({ nullable: true })
  globalTemplateId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  settings?: Record<string, any>;

  @Field(() => [Page], { nullable: true })
  pages?: Page[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
