import { AiContentService } from './ai-content.service';
declare class AiResultType {
    content: string;
    title?: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    tags?: string[];
    tokensUsed: number;
}
declare class AiGenerateInput {
    type: string;
    prompt?: string;
    context?: string;
    keywords?: string[];
    tone?: string;
    language?: string;
    maxLength?: number;
}
export declare class AiContentResolver {
    private aiService;
    constructor(aiService: AiContentService);
    aiGenerate(input: AiGenerateInput, tid: string): Promise<AiResultType>;
    aiSuggest(type: string, input: string, count: number, tid: string): Promise<string[]>;
    aiImprove(content: string, instruction: string, tid: string): Promise<string>;
    aiTranslate(content: string, lang: string, tid: string): Promise<string>;
}
export {};
