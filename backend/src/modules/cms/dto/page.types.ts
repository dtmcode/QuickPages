import {
  ObjectType,
  Field,
  ID,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';

// ✅ KORRIGIERT: PageTemplate Keys lowercase
export enum PageTemplate {
  default = 'default',
  landing = 'landing',
  contact = 'contact',
  about = 'about',
  blank = 'blank',
}

registerEnumType(PageTemplate, { name: 'PageTemplate' });

// ✅ PageStatus Keys lowercase
export enum PageStatus {
  draft = 'draft',
  published = 'published',
  archived = 'archived',
}

registerEnumType(PageStatus, { name: 'PageStatus' });

// Page ObjectType
@ObjectType()
export class Page {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  excerpt?: string;

  @Field({ nullable: true })
  featuredImage?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field(() => PageTemplate)
  template: PageTemplate;

  @Field(() => PageStatus)
  status: PageStatus;

  @Field()
  isPublished: boolean;

  @Field({ nullable: true })
  publishedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// Pages Response
@ObjectType()
export class PagesResponse {
  @Field(() => [Page])
  pages: Page[];

  @Field()
  total: number;
}

// Input Types für GraphQL Mutations
@InputType()
export class CreatePageInput {
  @Field()
  title: string;

  @Field()
  slug: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  excerpt?: string;

  @Field({ nullable: true })
  featuredImage?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field(() => PageStatus, { nullable: true })
  status?: PageStatus;

  @Field(() => PageTemplate, { nullable: true })
  template?: PageTemplate;
}

@InputType()
export class UpdatePageInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  excerpt?: string;

  @Field({ nullable: true })
  featuredImage?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field(() => PageStatus, { nullable: true })
  status?: PageStatus;

  @Field(() => PageTemplate, { nullable: true })
  template?: PageTemplate;
}
