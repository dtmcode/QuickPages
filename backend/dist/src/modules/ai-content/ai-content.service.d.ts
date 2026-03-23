import { ConfigService } from '@nestjs/config';
import type { DrizzleDB } from '../../core/database/drizzle.module';
interface AiGenerateOptions {
    type: 'blog_post' | 'product_description' | 'seo_meta' | 'email_subject' | 'social_media' | 'rewrite' | 'translate' | 'summarize' | 'custom';
    prompt?: string;
    context?: string;
    keywords?: string[];
    tone?: string;
    language?: string;
    maxLength?: number;
}
interface AiResult {
    content: string;
    title?: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    tags?: string[];
    tokensUsed: number;
}
export declare class AiContentService {
    private db;
    private configService;
    private readonly logger;
    constructor(db: DrizzleDB, configService: ConfigService);
    generate(tenantId: string, options: AiGenerateOptions): Promise<AiResult>;
    suggest(tenantId: string, type: string, input: string, count?: number): Promise<string[]>;
    improve(tenantId: string, content: string, instruction: string): Promise<string>;
    translateContent(tenantId: string, content: string, targetLanguage: string): Promise<string>;
    private checkUsageLimit;
    private logUsage;
    private buildSystemPrompt;
    private buildUserPrompt;
    private getSuggestionPrompt;
    private parseResult;
    private getMaxTokens;
}
export {};
