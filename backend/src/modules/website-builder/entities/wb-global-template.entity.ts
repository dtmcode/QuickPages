// 📂 PFAD: backend/src/website-builder/entities/wb-global-template.entity.ts

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
export class WbGlobalTemplate {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  category?: string;

  @Field()
  isActive: boolean;

  @Field()
  isPremium: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true })
  settings?: Record<string, any>;

  @Field({ nullable: true })
  previewUrl?: string;

  @Field({ nullable: true })
  demoUrl?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class WbGlobalTemplatePage {
  @Field(() => ID)
  id: string;

  @Field()
  templateId: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isHomepage: boolean;

  @Field()
  order: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class WbGlobalTemplateSection {
  @Field(() => ID)
  id: string;

  @Field()
  pageId: string;

  @Field()
  name: string;

  @Field()
  type: string;

  @Field()
  order: number;

  @Field(() => GraphQLJSONObject)
  content: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  styling?: Record<string, any>;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
