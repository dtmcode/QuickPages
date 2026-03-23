import { ObjectType, Field, InputType } from '@nestjs/graphql';

@ObjectType()
export class SeoMeta {
  @Field()
  id: string;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field({ nullable: true })
  metaKeywords?: string;

  @Field({ nullable: true })
  ogTitle?: string;

  @Field({ nullable: true })
  ogDescription?: string;

  @Field({ nullable: true })
  ogImage?: string;

  @Field({ nullable: true })
  canonicalUrl?: string;

  @Field()
  noindex: boolean;

  @Field()
  nofollow: boolean;
}

@InputType()
export class SeoMetaInput {
  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field({ nullable: true })
  metaKeywords?: string;

  @Field({ nullable: true })
  ogTitle?: string;

  @Field({ nullable: true })
  ogDescription?: string;

  @Field({ nullable: true })
  ogImage?: string;

  @Field({ nullable: true })
  canonicalUrl?: string;

  @Field({ nullable: true })
  noindex?: boolean;

  @Field({ nullable: true })
  nofollow?: boolean;
}
