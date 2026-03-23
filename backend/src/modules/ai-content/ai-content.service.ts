/**
 * ==================== AI CONTENT SERVICE ====================
 * KI-gestützte Content-Generierung für Blog-Posts, Produktbeschreibungen, SEO etc.
 *
 * Nutzt OpenAI-kompatible API (OpenAI, Anthropic, lokale LLMs via OpenRouter)
 * Tenant kann eigenen API-Key hinterlegen oder Platform-Key nutzen
 *
 * npm install openai
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { sql } from 'drizzle-orm';

interface AiGenerateOptions {
  type:
    | 'blog_post'
    | 'product_description'
    | 'seo_meta'
    | 'email_subject'
    | 'social_media'
    | 'rewrite'
    | 'translate'
    | 'summarize'
    | 'custom';
  prompt?: string;
  context?: string; // Bestehender Content als Kontext
  keywords?: string[];
  tone?: string; // professional, casual, witty, formal
  language?: string; // de, en, fr, etc.
  maxLength?: number; // Ungefähre Wortanzahl
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

@Injectable()
export class AiContentService {
  private readonly logger = new Logger(AiContentService.name);

  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private configService: ConfigService,
  ) {}

  /**
   * Generiert Content basierend auf Typ und Optionen
   */
  async generate(
    tenantId: string,
    options: AiGenerateOptions,
  ): Promise<AiResult> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const apiUrl =
      this.configService.get<string>('AI_API_URL') ||
      'https://api.openai.com/v1';
    const model = this.configService.get<string>('AI_MODEL') || 'gpt-4o-mini';

    if (!apiKey)
      throw new Error(
        'AI ist nicht konfiguriert. Setze OPENAI_API_KEY in .env',
      );

    // Usage Check (Optional: Limit pro Tenant)
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

      // Parse result
      const result = this.parseResult(rawContent, options.type);

      // Log usage
      await this.logUsage(tenantId, options.type, tokensUsed);

      return { content: '', ...result, tokensUsed };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unbekannt';
      this.logger.error(`AI Generation fehlgeschlagen: ${msg}`);
      throw new Error(`Content-Generierung fehlgeschlagen: ${msg}`);
    }
  }

  /**
   * Schnelle Vorschläge (z.B. Blog-Titel, SEO Snippets)
   */
  async suggest(
    tenantId: string,
    type: string,
    input: string,
    count: number = 5,
  ): Promise<string[]> {
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

  /**
   * Content verbessern / umschreiben
   */
  async improve(
    tenantId: string,
    content: string,
    instruction: string,
  ): Promise<string> {
    const result = await this.generate(tenantId, {
      type: 'rewrite',
      context: content,
      prompt: instruction,
    });
    return result.content;
  }

  /**
   * Content übersetzen
   */
  async translateContent(
    tenantId: string,
    content: string,
    targetLanguage: string,
  ): Promise<string> {
    const result = await this.generate(tenantId, {
      type: 'translate',
      context: content,
      language: targetLanguage,
    });
    return result.content;
  }

  // ==================== USAGE TRACKING ====================

  private async checkUsageLimit(tenantId: string) {
    const month = new Date().toISOString().slice(0, 7);
    const result = await this.db.execute(
      sql`SELECT COALESCE(SUM(tokens_used), 0)::int as total
          FROM ai_usage_log WHERE tenant_id = ${tenantId} AND month = ${month}`,
    );
    const total = (result as any).rows?.[0]?.total || 0;
    const limit = parseInt(
      this.configService.get<string>('AI_MONTHLY_TOKEN_LIMIT') || '500000',
      10,
    );
    if (total >= limit)
      throw new Error(
        `Monatliches AI-Limit erreicht (${limit.toLocaleString()} Tokens)`,
      );
  }

  private async logUsage(tenantId: string, type: string, tokensUsed: number) {
    const month = new Date().toISOString().slice(0, 7);
    try {
      await this.db.execute(
        sql`CREATE TABLE IF NOT EXISTS ai_usage_log (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              tenant_id UUID NOT NULL, month VARCHAR(7) NOT NULL,
              type VARCHAR(50), tokens_used INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW())`,
      );
      await this.db.execute(
        sql`INSERT INTO ai_usage_log (tenant_id, month, type, tokens_used) VALUES (${tenantId}, ${month}, ${type}, ${tokensUsed})`,
      );
    } catch {
      /* silent */
    }
  }

  // ==================== PROMPT BUILDING ====================

  private buildSystemPrompt(options: AiGenerateOptions): string {
    const lang = options.language || 'de';
    const langName =
      lang === 'de' ? 'Deutsch' : lang === 'en' ? 'English' : lang;
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

  private buildUserPrompt(options: AiGenerateOptions): string {
    let prompt = options.prompt || '';

    if (options.context)
      prompt += `\n\nBestehender Content:\n${options.context}`;
    if (options.keywords?.length)
      prompt += `\n\nWichtige Keywords: ${options.keywords.join(', ')}`;
    if (options.maxLength)
      prompt += `\n\nUngefähre Länge: ${options.maxLength} Wörter`;

    return prompt;
  }

  private getSuggestionPrompt(
    type: string,
    input: string,
    count: number,
  ): string {
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

  private parseResult(content: string, type: string): Partial<AiResult> {
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

  private getMaxTokens(options: AiGenerateOptions): number {
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
}
