import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class NewsletterSubscriber {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field()
  status: string;

  @Field(() => [String])
  tags: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  customFields?: any;

  @Field({ nullable: true })
  source?: string;

  @Field({ nullable: true })
  subscribedAt?: Date;

  @Field({ nullable: true })
  confirmedAt?: Date;

  @Field({ nullable: true })
  unsubscribedAt?: Date;

  @Field()
  createdAt: Date;
}

@InputType()
export class CreateSubscriberInput {
  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  customFields?: any;

  @Field({ nullable: true })
  source?: string;
}

@InputType()
export class UpdateSubscriberInput {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  customFields?: any;

  @Field({ nullable: true })
  status?: string;
}

@ObjectType()
export class SubscriberStats {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  active: number;

  @Field(() => Int)
  pending: number;

  @Field(() => Int)
  unsubscribed: number;
}

@ObjectType()
export class BulkImportResult {
  @Field(() => Int)
  success: number;

  @Field(() => Int)
  failed: number;

  @Field(() => Int)
  skipped: number;

  @Field(() => [String])
  errors: string[];
}
