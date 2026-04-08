/**
 * 🎨 SECTION ENTITY
 * GraphQL Object Type
 */

import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Page } from './page.entity';

// Section Type Enum
export enum SectionType {
  hero = 'hero',
  features = 'features',
  about = 'about',
  services = 'services',
  gallery = 'gallery',
  testimonials = 'testimonials',
  team = 'team',
  pricing = 'pricing',
  cta = 'cta',
  contact = 'contact',
  faq = 'faq',
  blog = 'blog',
  stats = 'stats',
  video = 'video',
  text = 'text',
  html = 'html',
  custom = 'custom',
  newsletter = 'newsletter',
  booking = 'booking',
  map = 'map',
  countdown = 'countdown',
  social = 'social',
  spacer = 'spacer',
  before_after = 'before_after',
  whatsapp = 'whatsapp',
}

registerEnumType(SectionType, {
  name: 'SectionType',
  description: 'Type of section',
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
