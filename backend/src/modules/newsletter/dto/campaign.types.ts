import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';

@ObjectType()
export class NewsletterCampaign {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  subject: string;

  @Field({ nullable: true })
  previewText?: string;

  @Field({ nullable: true })
  fromName?: string;

  @Field({ nullable: true })
  fromEmail?: string;

  @Field({ nullable: true })
  replyTo?: string;

  @Field()
  htmlContent: string;

  @Field({ nullable: true })
  plainTextContent?: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  scheduledAt?: Date;

  @Field({ nullable: true })
  sendAt?: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field(() => [String])
  filterTags: string[];

  @Field(() => [String])
  excludeTags: string[];

  @Field(() => Int)
  totalRecipients: number;

  @Field(() => Int)
  sentCount: number;

  @Field(() => Int)
  deliveredCount: number;

  @Field(() => Int)
  openedCount: number;

  @Field(() => Int)
  clickedCount: number;

  @Field(() => Int)
  bouncedCount: number;

  @Field(() => Int)
  unsubscribedCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateCampaignInput {
  @Field()
  name: string;

  @Field()
  subject: string;

  @Field({ nullable: true })
  previewText?: string;

  @Field({ nullable: true })
  fromName?: string;

  @Field({ nullable: true })
  fromEmail?: string;

  @Field({ nullable: true })
  replyTo?: string;

  @Field()
  htmlContent: string;

  @Field({ nullable: true })
  plainTextContent?: string;

  @Field(() => [String], { nullable: true })
  filterTags?: string[];

  @Field(() => [String], { nullable: true })
  excludeTags?: string[];

  @Field({ nullable: true })
  scheduledAt?: Date;
}

@InputType()
export class UpdateCampaignInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  subject?: string;

  @Field({ nullable: true })
  previewText?: string;

  @Field({ nullable: true })
  fromName?: string;

  @Field({ nullable: true })
  fromEmail?: string;

  @Field({ nullable: true })
  replyTo?: string;

  @Field({ nullable: true })
  htmlContent?: string;

  @Field({ nullable: true })
  plainTextContent?: string;

  @Field(() => [String], { nullable: true })
  filterTags?: string[];

  @Field(() => [String], { nullable: true })
  excludeTags?: string[];

  @Field({ nullable: true })
  scheduledAt?: Date;

  @Field({ nullable: true })
  status?: string;
}

@ObjectType()
export class CampaignStats {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  sent: number;

  @Field(() => Int)
  delivered: number;

  @Field(() => Int)
  opened: number;

  @Field(() => Int)
  clicked: number;

  @Field(() => Int)
  bounced: number;

  @Field(() => Int)
  unsubscribed: number;

  @Field(() => Int)
  openRate: number;

  @Field(() => Int)
  clickRate: number;
}

@ObjectType()
export class SendCampaignResult {
  @Field()
  success: boolean;

  @Field(() => Int)
  recipientCount: number;
}
