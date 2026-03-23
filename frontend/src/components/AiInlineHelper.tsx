'use client';

import { useState } from 'react';

// ==================== TYPES ====================
interface AiInlineHelperProps {
  currentContent: string;
  contentType?: string;
  onInsert?: (text: string) => void;
  onSetTitle?: (title: string) => void;
  onSetMeta?: (metaTitle: string, metaDescription: string) => void;
}

interface AiResult {
  content: string;
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
}

// ==================== GRAPHQL HELPER ====================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

// ==================== ACTIONS ====================
const ACTIONS = [
  { key: 'generate', label: '✨ Generieren', description: 'Neuen Text erstellen' },
  { key: 'improve', label: '✏️ Verbessern', description: 'Text umformulieren' },
  { key: 'shorten', label: '✂️ Kürzen', description: 'Text kompakter machen' },
  { key: 'extend', label: '📝 Erweitern', description: 'Text ausführlicher machen' },
  { key: 'seo', label: '🔍 SEO optimieren', description: 'Meta-Tags generieren' },
  { key: 'translate_en', label: '🌍 Englisch', description: 'Ins Englische übersetzen' },
];

// ==================== COMPONENT ====================
export default function AiInlineHelper({
  currentContent,
  contentType = 'blog_post',
  onInsert,
  onSetTitle,
  onSetMeta,
}: AiInlineHelperProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);

  const executeAction = async (action: string) => {
    setLoading(true);
    setResult(null);
    try {
      let data: AiResult;

      switch (action) {
        case 'generate':
          data = (await gqlRequest<{ aiGenerate: AiResult }>(`
            mutation($input: AiGenerateInput!) {
              aiGenerate(input: $input) { title content metaTitle metaDescription }
            }
          `, {
            input: {
              contentType,
              prompt: currentContent || 'Erstelle einen ansprechenden Inhalt',
              tone: 'professional',
              language: 'de',
            },
          })).aiGenerate;
          break;

        case 'improve':
          data = (await gqlRequest<{ aiImprove: { content: string } }>(`
            mutation($text: String!) { aiImprove(text: $text) { content } }
          `, { text: currentContent })).aiImprove;
          break;

        case 'shorten':
          data = (await gqlRequest<{ aiImprove: { content: string } }>(`
            mutation($text: String!, $instructions: String) {
              aiImprove(text: $text, instructions: $instructions) { content }
            }
          `, { text: currentContent, instructions: 'Kürze den Text auf ca. 50% der Länge' })).aiImprove;
          break;

        case 'extend':
          data = (await gqlRequest<{ aiImprove: { content: string } }>(`
            mutation($text: String!, $instructions: String) {
              aiImprove(text: $text, instructions: $instructions) { content }
            }
          `, { text: currentContent, instructions: 'Erweitere den Text um ca. 50% mit mehr Details' })).aiImprove;
          break;

        case 'seo':
          data = (await gqlRequest<{ aiGenerate: AiResult }>(`
            mutation($input: AiGenerateInput!) {
              aiGenerate(input: $input) { title content metaTitle metaDescription }
            }
          `, {
            input: {
              contentType: 'seo_meta',
              prompt: currentContent,
              language: 'de',
            },
          })).aiGenerate;
          break;

        case 'translate_en':
          data = (await gqlRequest<{ aiTranslate: { content: string } }>(`
            mutation($text: String!, $targetLanguage: String!) {
              aiTranslate(text: $text, targetLanguage: $targetLanguage) { content }
            }
          `, { text: currentContent, targetLanguage: 'en' })).aiTranslate;
          break;

        default:
          return;
      }

      setResult(data);
    } catch {
      setResult({ content: 'Fehler bei der KI-Anfrage. Bitte erneut versuchen.' });
    } finally {
      setLoading(false);
    }
  };

  const applyResult = () => {
    if (!result) return;
    if (result.content && onInsert) onInsert(result.content);
    if (result.title && onSetTitle) onSetTitle(result.title);
    if (result.metaTitle && result.metaDescription && onSetMeta) {
      onSetMeta(result.metaTitle, result.metaDescription);
    }
    setResult(null);
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors border border-purple-200"
        title="KI-Assistent"
      >
        ✨ KI
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setResult(null); }} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-purple-50 px-4 py-3 border-b">
              <p className="text-sm font-semibold text-purple-900">KI-Assistent</p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">KI arbeitet...</p>
              </div>
            )}

            {/* Result */}
            {result && !loading && (
              <div className="p-4 space-y-3">
                {result.title && (
                  <div>
                    <label className="text-xs text-gray-400">Titel</label>
                    <p className="text-sm font-medium">{result.title}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-400">Inhalt</label>
                  <div className="text-sm text-gray-800 bg-gray-50 rounded p-2 max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {result.content}
                  </div>
                </div>
                {result.metaTitle && (
                  <div>
                    <label className="text-xs text-gray-400">Meta: {result.metaTitle}</label>
                    {result.metaDescription && (
                      <p className="text-xs text-gray-500">{result.metaDescription}</p>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={applyResult} className="flex-1 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700">
                    Übernehmen
                  </button>
                  <button onClick={() => setResult(null)} className="flex-1 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200">
                    Verwerfen
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            {!result && !loading && (
              <div className="p-2">
                {ACTIONS.map((action) => (
                  <button
                    key={action.key}
                    onClick={() => executeAction(action.key)}
                    disabled={!currentContent && action.key !== 'generate'}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-between"
                  >
                    <span>{action.label}</span>
                    <span className="text-xs text-gray-400">{action.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}