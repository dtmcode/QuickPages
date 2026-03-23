// ==================== ai-content.resolver.ts ====================
import {
  Resolver,
  Mutation,
  Args,
  ObjectType,
  Field,
  Int,
  InputType,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';
import { AiContentService } from './ai-content.service';

@ObjectType()
class AiResultType {
  @Field() content: string;
  @Field({ nullable: true }) title?: string;
  @Field({ nullable: true }) excerpt?: string;
  @Field({ nullable: true }) metaTitle?: string;
  @Field({ nullable: true }) metaDescription?: string;
  @Field(() => [String], { nullable: true }) tags?: string[];
  @Field(() => Int) tokensUsed: number;
}

@InputType()
class AiGenerateInput {
  @Field() type: string; // blog_post, product_description, seo_meta, email_subject, social_media, rewrite, translate, summarize, custom
  @Field({ nullable: true }) prompt?: string;
  @Field({ nullable: true }) context?: string;
  @Field(() => [String], { nullable: true }) keywords?: string[];
  @Field({ nullable: true }) tone?: string; // professional, casual, witty, formal
  @Field({ nullable: true }) language?: string; // de, en, fr
  @Field(() => Int, { nullable: true }) maxLength?: number;
}

@Resolver()
export class AiContentResolver {
  constructor(private aiService: AiContentService) {}

  /** Generiert Content (Blog-Post, Produktbeschreibung, SEO etc.) */
  @Mutation(() => AiResultType)
  @UseGuards(GqlAuthGuard)
  async aiGenerate(
    @Args('input') input: AiGenerateInput,
    @TenantId() tid: string,
  ): Promise<AiResultType> {
    return this.aiService.generate(tid, input as any);
  }

  /** Schnelle Vorschläge (Titel, Hashtags, Keywords) */
  @Mutation(() => [String])
  @UseGuards(GqlAuthGuard)
  async aiSuggest(
    @Args('type') type: string,
    @Args('input') input: string,
    @Args('count', { defaultValue: 5 }) count: number,
    @TenantId() tid: string,
  ): Promise<string[]> {
    return this.aiService.suggest(tid, type, input, count);
  }

  /** Content verbessern / umschreiben */
  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async aiImprove(
    @Args('content') content: string,
    @Args('instruction') instruction: string,
    @TenantId() tid: string,
  ): Promise<string> {
    return this.aiService.improve(tid, content, instruction);
  }

  /** Content übersetzen */
  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async aiTranslate(
    @Args('content') content: string,
    @Args('targetLanguage') lang: string,
    @TenantId() tid: string,
  ): Promise<string> {
    return this.aiService.translateContent(tid, content, lang);
  }
}
