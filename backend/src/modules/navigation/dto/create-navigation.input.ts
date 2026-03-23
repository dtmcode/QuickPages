import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class CreateNavigationInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  location: string; // 'header', 'footer', 'sidebar', 'mobile'

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
