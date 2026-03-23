'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const CAMPAIGN_QUERY = gql`
  query NewsletterCampaign($id: String!) {
    newsletterCampaign(id: $id) {
      id
      name
      subject
      previewText
      fromName
      fromEmail
      replyTo
      htmlContent
      plainTextContent
      filterTags
      excludeTags
      status
      scheduledAt
      createdAt
      updatedAt
    }
  }
`;

const SUBSCRIBER_TAGS_QUERY = gql`
  query SubscriberTags {
    subscriberTags
  }
`;

const UPDATE_CAMPAIGN = gql`
  mutation UpdateCampaign($id: String!, $input: UpdateCampaignInput!) {
    updateCampaign(id: $id, input: $input) {
      id
      name
      status
    }
  }
`;

const SEND_CAMPAIGN = gql`
  mutation SendCampaign($id: String!) {
    sendCampaign(id: $id) {
      success
      recipientCount
    }
  }
`;

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'preview'>('content');

  // Form State
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [excludeTags, setExcludeTags] = useState<string[]>([]);
  const [campaignStatus, setCampaignStatus] = useState('');

  const { data, loading } = useQuery(CAMPAIGN_QUERY, {
    variables: { id: campaignId },
  });

  const { data: tagsData } = useQuery(SUBSCRIBER_TAGS_QUERY);
  const [updateCampaign, { loading: updating }] = useMutation(UPDATE_CAMPAIGN);
  const [sendCampaign, { loading: sending }] = useMutation(SEND_CAMPAIGN);

  const campaign = data?.newsletterCampaign;
  const availableTags = tagsData?.subscriberTags || [];

  // Load campaign data
  useEffect(() => {
    if (campaign) {
      setName(campaign.name || '');
      setSubject(campaign.subject || '');
      setPreviewText(campaign.previewText || '');
      setFromName(campaign.fromName || '');
      setFromEmail(campaign.fromEmail || '');
      setReplyTo(campaign.replyTo || '');
      setHtmlContent(campaign.htmlContent || '');
      setFilterTags(campaign.filterTags || []);
      setExcludeTags(campaign.excludeTags || []);
      setCampaignStatus(campaign.status || '');
    }
  }, [campaign]);

  const handleSave = async () => {
    if (!name || !subject || !htmlContent) {
      alert('Bitte fülle mindestens Name, Subject und Content aus');
      return;
    }

    try {
      await updateCampaign({
        variables: {
          id: campaignId,
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

      alert('✅ Campaign aktualisiert!');
      router.push('/dashboard/newsletter/campaigns');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fehler beim Speichern';
      alert('❌ ' + message);
    }
  };

  const handleSend = async () => {
    if (!confirm('Campaign jetzt an alle Subscriber senden?')) {
      return;
    }

    try {
      const result = await sendCampaign({ variables: { id: campaignId } });
      const recipientCount = result.data.sendCampaign.recipientCount;
      alert(`✅ Campaign wird versendet an ${recipientCount} Empfänger!`);
      router.push('/dashboard/newsletter/campaigns');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fehler beim Senden';
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

  if (loading) {
    return <div className="text-center py-12">Lädt Campaign...</div>;
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Campaign nicht gefunden
        </h3>
        <Link href="/dashboard/newsletter/campaigns">
          <Button>← Zurück zu Campaigns</Button>
        </Link>
      </div>
    );
  }

  const canEdit = campaignStatus === 'draft' || campaignStatus === 'scheduled';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/newsletter/campaigns">
            <Button variant="ghost" size="sm">← Zurück zu Campaigns</Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            ✏️ Campaign bearbeiten
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Status: <span className="font-semibold">{campaignStatus}</span>
          </p>
        </div>
        <div className="flex gap-3">
          {canEdit && (
            <>
              <Button
                variant="ghost"
                onClick={handleSave}
                disabled={updating}
              >
                💾 Speichern
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? 'Sendet...' : '📤 Senden'}
              </Button>
            </>
          )}
        </div>
      </div>

      {!canEdit && (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-400">
              <span>⚠️</span>
              <span className="font-medium">
                Diese Campaign kann nicht mehr bearbeitet werden (Status: {campaignStatus})
              </span>
            </div>
          </CardContent>
        </Card>
      )}

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
                  disabled={!canEdit}
                  required
                  placeholder="z.B. Newsletter Januar 2025"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Subject / Betreff *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={!canEdit}
                  required
                  placeholder="z.B. Die besten Angebote im Januar 🎉"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
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
                  disabled={!canEdit}
                  placeholder="Text der in Email-Clients als Preview angezeigt wird"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                />
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
                  disabled={!canEdit}
                  placeholder="z.B. Deine Firma"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
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
                  disabled={!canEdit}
                  placeholder="z.B. newsletter@deine-firma.de"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
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
                  disabled={!canEdit}
                  placeholder="z.B. support@deine-firma.de"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
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
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveTab('preview')}
                  >
                    👁️ Preview anzeigen
                  </Button>
                </div>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  disabled={!canEdit}
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-50"
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
                        onClick={() => canEdit && toggleTag(tag, 'filter')}
                        disabled={!canEdit}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
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
                        onClick={() => canEdit && toggleTag(tag, 'exclude')}
                        disabled={!canEdit}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
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
              <CardTitle>📊 Campaign Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                <div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Status:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{campaignStatus}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Erstellt:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(campaign.createdAt).toLocaleString('de-DE')}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Zuletzt bearbeitet:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(campaign.updatedAt).toLocaleString('de-DE')}
                  </p>
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
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Tab - Gleich wie in new/page.tsx */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}