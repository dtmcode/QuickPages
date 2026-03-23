import {
  ObjectType,
  Field,
  ID,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';

// ✅ KORRIGIERT: Keys sind jetzt lowercase!
export enum PostStatus {
  draft = 'draft',
  published = 'published',
  archived = 'archived',
}

registerEnumType(PostStatus, { name: 'PostStatus' });

// ✅ Post ObjectType
@ObjectType()
export class Post {
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

  @Field(() => PostStatus)
  status: PostStatus;

  @Field()
  isPublished: boolean;

  @Field({ nullable: true })
  publishedAt?: Date;

  @Field({ nullable: true })
  categoryId?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// ✅ Posts Response
@ObjectType()
export class PostsResponse {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  total: number;
}

// ✅ CreatePostInput
@InputType()
export class CreatePostInput {
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

  @Field(() => PostStatus, { nullable: true })
  status?: PostStatus;

  @Field({ nullable: true })
  categoryId?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  publishedAt?: string;
}

// ✅ UpdatePostInput
@InputType()
export class UpdatePostInput {
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

  @Field(() => PostStatus, { nullable: true })
  status?: PostStatus;

  @Field({ nullable: true })
  categoryId?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  publishedAt?: string;
}
