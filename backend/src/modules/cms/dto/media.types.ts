import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

@ObjectType()
export class MediaFile {
  @Field()
  id: string;

  @Field()
  filename: string;

  @Field()
  originalFilename: string;

  @Field()
  mimeType: string;

  @Field(() => Int)
  fileSize: number;

  @Field()
  type: string;

  @Field()
  url: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  alt?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  folder?: string;

  @Field(() => [String])
  tags: string[];

  @Field(() => Int, { nullable: true })
  width?: number;

  @Field(() => Int, { nullable: true })
  height?: number;

  @Field()
  createdAt: Date;
}

@InputType()
export class UpdateMediaInput {
  @Field({ nullable: true })
  alt?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  folder?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}
