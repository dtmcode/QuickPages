/**
 * 🎨 PAGE ENTITY
 * GraphQL Object Type
 */

import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Template } from './template.entity';
import { Section } from './section.entity';

@ObjectType('WbPage')
export class Page {
  @Field(() => ID)
  id: string;

  @Field()
  tenantId: string;

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

  @Field()
  isActive: boolean;

  @Field()
  isHomepage: boolean;

  @Field(() => Int)
  order: number;

  @Field(() => GraphQLJSON, { nullable: true })
  settings?: Record<string, any>;

  @Field(() => Template, { nullable: true })
  template?: Template;

  @Field(() => [Section], { nullable: true })
  sections?: Section[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
