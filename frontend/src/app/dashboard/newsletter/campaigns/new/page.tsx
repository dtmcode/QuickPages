'use client';

import { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SUBSCRIBER_TAGS_QUERY = gql`
  query SubscriberTags {
    subscriberTags
  }
`;

const CREATE_CAMPAIGN = gql`
  mutation CreateCampaign($input: CreateCampaignInput!) {
    createCampaign(input: $input) {
      id
      name
    }
  }
`;

export default function NewCampaignPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'preview'>('content');

  // Form State
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [htmlContent, setHtmlContent] = useState(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: #06b6d4;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: white;
      padding: 30px;
      border: 1px solid #e5e7eb;
    }
    .footer {
      background: #f3f4f6;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-radius: 0 0 8px 8px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #06b6d4;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Deine Überschrift hier</h1>
  </div>
  <div class="content">
    <h2>Hallo!</h2>
    <p>Dies ist dein Newsletter Template. Passe es nach deinen Wünschen an!</p>
    <p>Du kannst HTML und CSS verwenden um dein Design zu gestalten.</p>
    <a href="#" class="button">Call to Action</a>
    <p>Weitere Inhalte hier...</p>
  </div>
  <div class="footer">
    <p>&copy; 2025 Deine Firma. Alle Rechte vorbehalten.</p>
    <p><a href="{{unsubscribe_url}}" style="color: #666;">Abmelden</a></p>
  </div>
</body>
</html>
  `.trim());
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [excludeTags, setExcludeTags] = useState<string[]>([]);

  const { data: tagsData } = useQuery(SUBSCRIBER_TAGS_QUERY);
  const [createCampaign, { loading }] = useMutation(CREATE_CAMPAIGN);

  const availableTags = tagsData?.subscriberTags || [];

  const handleSave = async (sendNow = false) => {
    if (!name || !subject || !htmlContent) {
      alert('Bitte fülle mindestens Name, Subject und Content aus');
      return;
    }

    try {
      const result = await createCampaign({
        variables: {
          input: {
            name,
            subject,
            previewText: previewText || undefined,
            fromName: fromName || undefined,
            fromEmail: fromEmail || undefined,
            replyTo: replyTo || undefined,
            htmlContent,
            filterTags: filterTags.length > 0 ? filterTags : undefined,
            excludeTags: excludeTags.length > 0 ? excludeTags : undefined,
          },
        },
      });

      const campaignId = result.data.createCampaign.id;
      
      if (sendNow) {
        router.push(`/dashboard/newsletter/campaigns?send=${campaignId}`);
      } else {
        alert('✅ Campaign gespeichert!');
        router.push('/dashboard/newsletter/campaigns');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fehler beim Speichern';
      alert('❌ ' + message);
    }
  };

  const toggleTag = (tag: string, type: 'filter' | 'exclude') => {
    if (type === 'filter') {
      setFilterTags(prev =>
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      );
    } else {
      setExcludeTags(prev =>
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/newsletter/campaigns">
            <Button variant="ghost" size="sm">← Zurück zu Campaigns</Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            📝 Neue Campaign
          </h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => handleSave(false)}
            disabled={loading}
          >
            💾 Als Entwurf speichern
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={loading}
          >
            {loading ? 'Speichert...' : '📤 Speichern & Senden'}
          </Button>
        </div>
      </div>

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
            📝 Content
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
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preview'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            👁️ Preview
          </button>
        </nav>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Basis-Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="z.B. Newsletter Januar 2025"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Interner Name (wird nicht an Empfänger gesendet)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Subject / Betreff *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="z.B. Die besten Angebote im Januar 🎉"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview Text
                </label>
                <input
                  type="text"
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  placeholder="Text der in Email-Clients als Preview angezeigt wird"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Wird unter dem Betreff angezeigt
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Right: Sender Info */}
          <Card>
            <CardHeader>
              <CardTitle>📧 Absender-Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  💡 Wenn leer, werden die Email-Einstellungen deines Tenants verwendet
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="z.B. Deine Firma"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="z.B. newsletter@deine-firma.de"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reply-To
                </label>
                <input
                  type="email"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  placeholder="z.B. support@deine-firma.de"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Full Width: HTML Editor */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>✏️ Email Content (HTML)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bearbeite das HTML deines Newsletters
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setActiveTab('preview')}
                    >
                      👁️ Preview anzeigen
                    </Button>
                  </div>
                </div>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder="<html>...</html>"
                />
                <p className="text-xs text-gray-500">
                  💡 Tipp: Verwende <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{'{{unsubscribe_url}}'}</code> für den Abmelde-Link
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🎯 Empfänger Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Nur an Subscriber mit diesen Tags senden:
                </label>
                {availableTags.length === 0 ? (
                  <p className="text-sm text-gray-500">Keine Tags verfügbar</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag: string) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag, 'filter')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          filterTags.includes(tag)
                            ? 'bg-cyan-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Wenn leer, wird an alle aktiven Subscriber gesendet
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Subscriber mit diesen Tags ausschließen:
                </label>
                {availableTags.length === 0 ? (
                  <p className="text-sm text-gray-500">Keine Tags verfügbar</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag: string) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag, 'exclude')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          excludeTags.includes(tag)
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Vorschau</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                <div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Campaign Name:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{name || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Subject:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{subject || '-'}</p>
                </div>
                {filterTags.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Filter Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {filterTags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-400 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {excludeTags.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Exclude Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {excludeTags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Tab */}
{activeTab === 'preview' && (
  <div className="space-y-4">
    {/* Email Header Info */}
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Von:</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {fromName || 'Dein Name'} &lt;{fromEmail || 'email@example.com'}&gt;
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Betreff:</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {subject || 'Dein Subject'}
            </span>
          </div>
          {previewText && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Preview:</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{previewText}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Email Preview in iframe */}
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>📧 Email Vorschau</CardTitle>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            So sieht die Email beim Empfänger aus
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden" style={{ maxWidth: '650px', margin: '0 auto' }}>
            <iframe
              srcDoc={htmlContent}
              className="w-full border-0"
              style={{ 
                minHeight: '600px',
                height: 'auto',
              }}
              title="Email Preview"
              sandbox="allow-same-origin"
              onLoad={(e) => {
                const iframe = e.target as HTMLIFrameElement;
                if (iframe.contentWindow) {
                  const height = iframe.contentWindow.document.body.scrollHeight;
                  iframe.style.height = `${height + 40}px`;
                }
              }}
            />
          </div>
        </div>
        
        {/* Desktop/Mobile Toggle könnte hier hin */}
        <div className="mt-4 flex justify-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 Tipp: Die Email wird responsive dargestellt
          </div>
        </div>
      </CardContent>
    </Card>

    {/* HTML Code View (collapsible) */}
    <Card>
      <CardHeader>
        <CardTitle>🔍 HTML Source</CardTitle>
      </CardHeader>
      <CardContent>
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400">
            HTML Code anzeigen ▼
          </summary>
          <pre className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-x-auto text-xs">
            <code>{htmlContent}</code>
          </pre>
        </details>
      </CardContent>
    </Card>
  </div>
)}
    </div>
  );
}