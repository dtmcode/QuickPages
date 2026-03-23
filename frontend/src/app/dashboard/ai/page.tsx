'use client';

import { useState } from 'react';

// ==================== TYPES ====================
interface GenerateResult {
  title: string | null;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  tokensUsed: number;
}

interface SuggestResult {
  suggestions: string[];
}

interface Toast {
  message: string;
  type: 'success' | 'error';
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

// ==================== CONSTANTS ====================
const CONTENT_TYPES = [
  { value: 'blog_post', label: 'Blog-Artikel' },
  { value: 'product_description', label: 'Produktbeschreibung' },
  { value: 'seo_meta', label: 'SEO Meta-Tags' },
  { value: 'email_subject', label: 'E-Mail Betreff' },
  { value: 'social_media', label: 'Social Media Post' },
  { value: 'summarize', label: 'Zusammenfassung' },
];

const TONES = [
  { value: 'professional', label: 'Professionell' },
  { value: 'casual', label: 'Locker' },
  { value: 'witty', label: 'Witzig' },
  { value: 'formal', label: 'Formell' },
];

const LANGUAGES = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
];

// ==================== COMPONENT ====================
export default function AiContentDashboardPage() {
  const [tab, setTab] = useState<'generate' | 'suggest' | 'improve' | 'translate'>('generate');
  const [toast, setToast] = useState<Toast | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate state
  const [contentType, setContentType] = useState('blog_post');
  const [tone, setTone] = useState('professional');
  const [language, setLanguage] = useState('de');
  const [maxLength, setMaxLength] = useState(500);
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [keywords, setKeywords] = useState('');
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(null);

  // Suggest state
  const [suggestTopic, setSuggestTopic] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Improve state
  const [improveText, setImproveText] = useState('');
  const [improveInstructions, setImproveInstructions] = useState('');
  const [improvedResult, setImprovedResult] = useState('');

  // Translate state
  const [translateText, setTranslateText] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [translatedResult, setTranslatedResult] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('In die Zwischenablage kopiert');
  };

  // ==================== ACTIONS ====================
  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const data = await gqlRequest<{ aiGenerate: GenerateResult }>(`
        mutation($input: AiGenerateInput!) {
          aiGenerate(input: $input) {
            title content metaTitle metaDescription keywords tokensUsed
          }
        }
      `, {
        input: {
          contentType,
          prompt,
          context: context || undefined,
          keywords: keywords ? keywords.split(',').map((k: string) => k.trim()) : undefined,
          tone,
          language,
          maxLength,
        },
      });
      setGenerateResult(data.aiGenerate);
    } catch {
      showToast('Fehler bei der Generierung', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = async () => {
    if (!suggestTopic) return;
    setLoading(true);
    try {
      const data = await gqlRequest<{ aiSuggest: SuggestResult }>(`
        mutation($topic: String!, $count: Int) {
          aiSuggest(topic: $topic, count: $count) { suggestions }
        }
      `, { topic: suggestTopic, count: 5 });
      setSuggestions(data.aiSuggest.suggestions);
    } catch {
      showToast('Fehler bei den Vorschlägen', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!improveText) return;
    setLoading(true);
    try {
      const data = await gqlRequest<{ aiImprove: { content: string } }>(`
        mutation($text: String!, $instructions: String) {
          aiImprove(text: $text, instructions: $instructions) { content }
        }
      `, { text: improveText, instructions: improveInstructions || undefined });
      setImprovedResult(data.aiImprove.content);
    } catch {
      showToast('Fehler beim Verbessern', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!translateText) return;
    setLoading(true);
    try {
      const data = await gqlRequest<{ aiTranslate: { content: string } }>(`
        mutation($text: String!, $targetLanguage: String!) {
          aiTranslate(text: $text, targetLanguage: $targetLanguage) { content }
        }
      `, { text: translateText, targetLanguage: targetLang });
      setTranslatedResult(data.aiTranslate.content);
    } catch {
      showToast('Fehler beim Übersetzen', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900">KI-Inhalte</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {([
            ['generate', 'Generieren'],
            ['suggest', 'Vorschläge'],
            ['improve', 'Verbessern'],
            ['translate', 'Übersetzen'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === key ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* ==================== GENERATE TAB ==================== */}
      {tab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inhaltstyp</label>
                <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                  {CONTENT_TYPES.map((ct) => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ton</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                  {TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sprache</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                  {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max. Länge</label>
                <input type="number" value={maxLength} onChange={(e) => setMaxLength(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prompt / Thema *</label>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Worüber soll geschrieben werden?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kontext (optional)</label>
              <textarea value={context} onChange={(e) => setContext(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Zusätzliche Infos..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (kommagetrennt)</label>
              <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="SEO, Marketing, KI" />
            </div>
            <button onClick={handleGenerate} disabled={!prompt || loading} className="w-full py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50">
              {loading ? 'Generiere...' : '✨ Generieren'}
            </button>
          </div>

          {/* Result */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Ergebnis</h3>
            {!generateResult ? (
              <p className="text-gray-400 text-sm py-8 text-center">Noch kein Ergebnis. Starten Sie die Generierung.</p>
            ) : (
              <>
                {generateResult.title && (
                  <div>
                    <label className="text-xs text-gray-400">Titel</label>
                    <p className="font-semibold text-gray-900">{generateResult.title}</p>
                  </div>
                )}
                {generateResult.metaTitle && (
                  <div>
                    <label className="text-xs text-gray-400">Meta-Titel</label>
                    <p className="text-sm text-gray-700">{generateResult.metaTitle}</p>
                  </div>
                )}
                {generateResult.metaDescription && (
                  <div>
                    <label className="text-xs text-gray-400">Meta-Beschreibung</label>
                    <p className="text-sm text-gray-700">{generateResult.metaDescription}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-400">Inhalt</label>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap mt-1 bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {generateResult.content}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{generateResult.tokensUsed} Tokens verwendet</span>
                  <button onClick={() => copyToClipboard(generateResult.content)} className="text-purple-600 hover:underline">
                    Kopieren
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ==================== SUGGEST TAB ==================== */}
      {tab === 'suggest' && (
        <div className="max-w-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thema</label>
            <input type="text" value={suggestTopic} onChange={(e) => setSuggestTopic(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="z.B. Nachhaltigkeit im E-Commerce" />
          </div>
          <button onClick={handleSuggest} disabled={!suggestTopic || loading} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
            {loading ? 'Lade...' : '💡 Vorschläge generieren'}
          </button>
          {suggestions.length > 0 && (
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <div key={i} className="bg-white border rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm text-gray-800">{s}</span>
                  <button onClick={() => copyToClipboard(s)} className="text-xs text-purple-600 hover:underline shrink-0 ml-2">
                    Kopieren
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== IMPROVE TAB ==================== */}
      {tab === 'improve' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Originaltext</label>
              <textarea value={improveText} onChange={(e) => setImproveText(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={8} placeholder="Text zum Verbessern..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anweisungen (optional)</label>
              <input type="text" value={improveInstructions} onChange={(e) => setImproveInstructions(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="z.B. formeller machen, kürzen..." />
            </div>
            <button onClick={handleImprove} disabled={!improveText || loading} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
              {loading ? 'Verbessere...' : '✏️ Verbessern'}
            </button>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Verbesserter Text</h3>
            {improvedResult ? (
              <>
                <div className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                  {improvedResult}
                </div>
                <button onClick={() => copyToClipboard(improvedResult)} className="text-xs text-purple-600 hover:underline mt-2">
                  Kopieren
                </button>
              </>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">Ergebnis erscheint hier</p>
            )}
          </div>
        </div>
      )}

      {/* ==================== TRANSLATE TAB ==================== */}
      {tab === 'translate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text zum Übersetzen</label>
              <textarea value={translateText} onChange={(e) => setTranslateText(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={8} placeholder="Quelltext..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zielsprache</label>
              <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <button onClick={handleTranslate} disabled={!translateText || loading} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
              {loading ? 'Übersetze...' : '🌍 Übersetzen'}
            </button>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Übersetzung</h3>
            {translatedResult ? (
              <>
                <div className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                  {translatedResult}
                </div>
                <button onClick={() => copyToClipboard(translatedResult)} className="text-xs text-purple-600 hover:underline mt-2">
                  Kopieren
                </button>
              </>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">Ergebnis erscheint hier</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}