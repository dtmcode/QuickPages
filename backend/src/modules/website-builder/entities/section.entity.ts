/**
 * 🎨 SECTION ENTITY
 * GraphQL Object Type
 */

import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Page } from './page.entity';

// Section Type Enum
/**
 * ✅ UNIFIED SECTION TYPES
 * Nur noch 2 Typen:
 * - freestyle: Block-basiert (Editor inline-editierbar). UI zeigt "Hero", "Features"
 *   etc. als Preset-Labels in der Sidebar, intern sind es immer freestyle-Blocks.
 * - custom: Raw HTML/CSS/JS (wird im Public-Renderer in iframe-sandbox gerendert).
 */
export enum SectionType {
  freestyle = 'freestyle',
  custom = 'custom',
}

registerEnumType(SectionType, {
  name: 'SectionType',
  description: 'freestyle (block-based) or custom (raw HTML/CSS/JS)',
});

@ObjectType()
export class Section {
  @Field(() => ID)
  id: string;

  @Field()
  tenantId: string;

  @Field()
  pageId: string;

  @Field()
  name: string;

  @Field(() => SectionType)
  type: SectionType;

  @Field(() => Int)
  order: number;

  @Field()
  isActive: boolean;

  @Field(() => GraphQLJSON)
  content: Record<string, any>;

  @Field(() => GraphQLJSON, { nullable: true })
  styling?: Record<string, any>;

  @Field(() => Page, { nullable: true })
  page?: Page;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
