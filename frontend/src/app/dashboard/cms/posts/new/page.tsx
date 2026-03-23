'use client';

import { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RichTextEditor from '@/components/editor/RichTextEditor';

const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      slug
    }
  }
`;

const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      id
      name
    }
  }
`;

export default function NewPostPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [publishedAt, setPublishedAt] = useState('');

  const { data: categoriesData } = useQuery(CATEGORIES_QUERY);
  const [createPost, { loading }] = useMutation(CREATE_POST);

  const categories = categoriesData?.categories || [];

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug) {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(autoSlug);
    }
  };

  const handleSave = async (saveStatus: string) => {
    if (!title || !slug) {
      alert('Bitte fülle mindestens Titel und Slug aus');
      return;
    }

    try {
      const result = await createPost({
        variables: {
          input: {
            title,
            slug,
            content,
            excerpt: excerpt || undefined,
            featuredImage: featuredImage || undefined,
            metaDescription: metaDescription || undefined,
            categoryId: categoryId || undefined,
            tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
            status: saveStatus,
            publishedAt: publishedAt || undefined,
          },
        },
      });

      alert('✅ Post gespeichert!');
      router.push('/dashboard/cms/posts');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fehler beim Speichern';
      alert('❌ ' + message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/cms/posts">
            <Button variant="ghost" size="sm">← Zurück zu Posts</Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            📝 Neuer Blog Post
          </h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => handleSave('draft')}
            disabled={loading}
          >
            💾 Als Entwurf
          </Button>
          <Button
            onClick={() => handleSave('published')}
            disabled={loading}
          >
            {loading ? 'Speichert...' : '🚀 Veröffentlichen'}
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basis-Informationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titel *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                placeholder="z.B. 10 Tipps für besseres Marketing"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slug (URL) *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="10-tipps-marketing"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL: /blog/{slug}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kategorie
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Keine Kategorie</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kurzbeschreibung (Excerpt)
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="Kurze Zusammenfassung für die Übersicht..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (kommagetrennt)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="marketing, tipps, strategy"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Featured Image URL
              </label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Tipp: Nutze die <Link href="/dashboard/media" className="text-cyan-600 hover:underline">Media Library</Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'content'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            📝 Inhalt
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'seo'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            🔍 SEO
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            ⚙️ Einstellungen
          </button>
        </nav>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <Card>
          <CardHeader>
            <CardTitle>✏️ Post Inhalt</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Schreibe hier deinen Blog-Beitrag..."
            />
          </CardContent>
        </Card>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <Card>
          <CardHeader>
            <CardTitle>🔍 SEO Einstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                placeholder="Beschreibung für Suchmaschinen (150-160 Zeichen)"
                maxLength={160}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                {metaDescription.length} / 160 Zeichen
              </p>
            </div>

            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
              <h4 className="font-medium text-cyan-900 dark:text-cyan-400 mb-2">
                Google Vorschau
              </h4>
              <div className="space-y-1">
                <div className="text-lg text-blue-600 hover:underline">
                  {title || 'Dein Post Titel'}
                </div>
                <div className="text-xs text-green-700">
                  www.deine-domain.de/blog/{slug || 'post'}
                </div>
                <div className="text-sm text-gray-600">
                  {metaDescription || excerpt || 'Deine Meta Description erscheint hier...'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Post-Einstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="draft">📝 Entwurf</option>
                <option value="published">✅ Veröffentlicht</option>
                <option value="archived">📦 Archiviert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Veröffentlichungsdatum (Optional)
              </label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leer lassen für sofortige Veröffentlichung
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Vorschau
              </h4>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Titel:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{title || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Slug:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">/blog/{slug || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Kategorie:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {categories.find((c: any) => c.id === categoryId)?.name || 'Keine'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{status}</span>
                </div>
                {tags && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Tags:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{tags}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}