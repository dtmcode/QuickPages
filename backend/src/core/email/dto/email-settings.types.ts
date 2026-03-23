import { ObjectType, Field, InputType } from '@nestjs/graphql';

@ObjectType()
export class EmailSettings {
  @Field()
  id: string;

  @Field()
  provider: string;

  @Field({ nullable: true })
  smtpHost?: string;

  @Field({ nullable: true })
  smtpPort?: number;

  @Field({ nullable: true })
  smtpSecure?: boolean;

  @Field({ nullable: true })
  smtpUser?: string;

  // Password wird NICHT exposed!

  @Field()
  fromEmail: string;

  @Field({ nullable: true })
  fromName?: string;

  @Field({ nullable: true })
  replyTo?: string;

  @Field()
  isEnabled: boolean;

  @Field()
  isVerified: boolean;

  @Field({ nullable: true })
  lastTestedAt?: Date;
}

@InputType()
export class EmailSettingsInput {
  @Field()
  provider: string;

  @Field({ nullable: true })
  smtpHost?: string;

  @Field({ nullable: true })
  smtpPort?: number;

  @Field({ nullable: true })
  smtpSecure?: boolean;

  @Field({ nullable: true })
  smtpUser?: string;

  @Field({ nullable: true })
  smtpPassword?: string;

  @Field()
  fromEmail: string;

  @Field({ nullable: true })
  fromName?: string;

  @Field({ nullable: true })
  replyTo?: string;
}

@ObjectType()
export class TestEmailResult {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;
}
