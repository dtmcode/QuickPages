"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AiContentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiContentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const drizzle_orm_1 = require("drizzle-orm");
let AiContentService = AiContentService_1 = class AiContentService {
    db;
    configService;
    logger = new common_1.Logger(AiContentService_1.name);
    constructor(db, configService) {
        this.db = db;
        this.configService = configService;
    }
    async generate(tenantId, options) {
        const apiKey = this.configService.get('OPENAI_API_KEY');
        const apiUrl = this.configService.get('AI_API_URL') ||
            'https://api.openai.com/v1';
        const model = this.configService.get('AI_MODEL') || 'gpt-4o-mini';
        if (!apiKey)
            throw new Error('AI ist nicht konfiguriert. Setze OPENAI_API_KEY in .env');
        await this.checkUsageLimit(tenantId);
        const systemPrompt = this.buildSystemPrompt(options);
        const userPrompt = this.buildUserPrompt(options);
        try {
            const response = await fetch(`${apiUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature: options.type === 'seo_meta' ? 0.3 : 0.7,
                    max_tokens: this.getMaxTokens(options),
                }),
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(`AI API Fehler: ${response.status} — ${err}`);
            }
            const data = await response.json();
            const rawContent = data.choices?.[0]?.message?.content || '';
            const tokensUsed = data.usage?.total_tokens || 0;
            const result = this.parseResult(rawContent, options.type);
            await this.logUsage(tenantId, options.type, tokensUsed);
            return { content: '', ...result, tokensUsed };
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : 'Unbekannt';
            this.logger.error(`AI Generation fehlgeschlagen: ${msg}`);
            throw new Error(`Content-Generierung fehlgeschlagen: ${msg}`);
        }
    }
    async suggest(tenantId, type, input, count = 5) {
        const result = await this.generate(tenantId, {
            type: 'custom',
            prompt: this.getSuggestionPrompt(type, input, count),
            maxLength: 200,
        });
        return result.content
            .split('\n')
            .filter((l) => l.trim())
            .map((l) => l.replace(/^\d+[\.\)]\s*/, '').trim())
            .slice(0, count);
    }
    async improve(tenantId, content, instruction) {
        const result = await this.generate(tenantId, {
            type: 'rewrite',
            context: content,
            prompt: instruction,
        });
        return result.content;
    }
    async translateContent(tenantId, content, targetLanguage) {
        const result = await this.generate(tenantId, {
            type: 'translate',
            context: content,
            language: targetLanguage,
        });
        return result.content;
    }
    async checkUsageLimit(tenantId) {
        const month = new Date().toISOString().slice(0, 7);
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT COALESCE(SUM(tokens_used), 0)::int as total
          FROM ai_usage_log WHERE tenant_id = ${tenantId} AND month = ${month}`);
        const total = result.rows?.[0]?.total || 0;
        const limit = parseInt(this.configService.get('AI_MONTHLY_TOKEN_LIMIT') || '500000', 10);
        if (total >= limit)
            throw new Error(`Monatliches AI-Limit erreicht (${limit.toLocaleString()} Tokens)`);
    }
    async logUsage(tenantId, type, tokensUsed) {
        const month = new Date().toISOString().slice(0, 7);
        try {
            await this.db.execute((0, drizzle_orm_1.sql) `CREATE TABLE IF NOT EXISTS ai_usage_log (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              tenant_id UUID NOT NULL, month VARCHAR(7) NOT NULL,
              type VARCHAR(50), tokens_used INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW())`);
            await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO ai_usage_log (tenant_id, month, type, tokens_used) VALUES (${tenantId}, ${month}, ${type}, ${tokensUsed})`);
        }
        catch {
        }
    }
    buildSystemPrompt(options) {
        const lang = options.language || 'de';
        const langName = lang === 'de' ? 'Deutsch' : lang === 'en' ? 'English' : lang;
        const tone = options.tone || 'professional';
        const base = `Du bist ein erfahrener Content-Writer. Schreibe immer in ${langName}. Ton: ${tone}. Gib NUR den Content zurück, keine Erklärungen.`;
        switch (options.type) {
            case 'blog_post':
                return `${base} Schreibe einen Blog-Post. Format: Erste Zeile = Titel (ohne #), dann eine Leerzeile, dann der Content in Markdown.`;
            case 'product_description':
                return `${base} Schreibe eine überzeugende Produktbeschreibung die zum Kauf motiviert. Kurz, knackig, benefit-orientiert.`;
            case 'seo_meta':
                return `${base} Generiere SEO-optimierte Meta-Daten. Format:\nTITLE: (max 60 Zeichen)\nDESCRIPTION: (max 155 Zeichen)\nKEYWORDS: (kommagetrennt)`;
            case 'email_subject':
                return `${base} Generiere E-Mail-Betreffzeilen. Eine pro Zeile. Kurz, klickstark, ohne Clickbait.`;
            case 'social_media':
                return `${base} Schreibe Social-Media Posts. Kurz, engaging, mit Emojis. Füge Hashtag-Vorschläge hinzu.`;
            case 'rewrite':
                return `${base} Überarbeite den folgenden Text gemäß der Anweisung. Behalte die Kernaussage bei.`;
            case 'translate':
                return `Du bist ein professioneller Übersetzer. Übersetze den Text nach ${langName}. Behalte Formatierung und Ton bei. Gib NUR die Übersetzung zurück.`;
            case 'summarize':
                return `${base} Fasse den Text zusammen. Maximal 3 Sätze.`;
            default:
                return base;
        }
    }
    buildUserPrompt(options) {
        let prompt = options.prompt || '';
        if (options.context)
            prompt += `\n\nBestehender Content:\n${options.context}`;
        if (options.keywords?.length)
            prompt += `\n\nWichtige Keywords: ${options.keywords.join(', ')}`;
        if (options.maxLength)
            prompt += `\n\nUngefähre Länge: ${options.maxLength} Wörter`;
        return prompt;
    }
    getSuggestionPrompt(type, input, count) {
        switch (type) {
            case 'blog_titles':
                return `Generiere ${count} kreative Blog-Titel zum Thema: "${input}". Nummeriere sie.`;
            case 'seo_titles':
                return `Generiere ${count} SEO-optimierte Titel (max 60 Zeichen) für: "${input}". Nummeriere sie.`;
            case 'hashtags':
                return `Generiere ${count} relevante Hashtags für: "${input}". Jeder in einer neuen Zeile.`;
            case 'keywords':
                return `Generiere ${count} relevante SEO-Keywords für: "${input}". Kommagetrennt.`;
            default:
                return `Generiere ${count} Vorschläge für: "${input}". Nummeriere sie.`;
        }
    }
    parseResult(content, type) {
        switch (type) {
            case 'blog_post': {
                const lines = content.split('\n');
                const title = lines[0]?.replace(/^#+\s*/, '').trim();
                const body = lines.slice(1).join('\n').trim();
                const excerpt = body.slice(0, 200).replace(/\n/g, ' ').trim();
                return { content: body, title, excerpt };
            }
            case 'seo_meta': {
                const titleMatch = content.match(/TITLE:\s*(.+)/i);
                const descMatch = content.match(/DESCRIPTION:\s*(.+)/i);
                const kwMatch = content.match(/KEYWORDS:\s*(.+)/i);
                return {
                    content,
                    metaTitle: titleMatch?.[1]?.trim(),
                    metaDescription: descMatch?.[1]?.trim(),
                    tags: kwMatch?.[1]?.split(',').map((k) => k.trim()) || [],
                };
            }
            default:
                return { content: content.trim() };
        }
    }
    getMaxTokens(options) {
        switch (options.type) {
            case 'blog_post':
                return 2000;
            case 'product_description':
                return 500;
            case 'seo_meta':
                return 200;
            case 'email_subject':
                return 200;
            case 'social_media':
                return 300;
            case 'translate':
                return 2000;
            case 'summarize':
                return 300;
            default:
                return 1000;
        }
    }
};
exports.AiContentService = AiContentService;
exports.AiContentService = AiContentService = AiContentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object, config_1.ConfigService])
], AiContentService);
//# sourceMappingURL=ai-content.service.js.map