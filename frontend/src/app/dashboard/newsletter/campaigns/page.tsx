'use client';

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const CAMPAIGNS_QUERY = gql`
  query NewsletterCampaigns($status: String, $limit: Int, $offset: Int) {
    newsletterCampaigns(status: $status, limit: $limit, offset: $offset) {
      id
      name
      subject
      status
      totalRecipients
      sentCount
      openedCount
      clickedCount
      scheduledAt
      sendAt
      createdAt
      updatedAt
    }
  }
`;

const DELETE_CAMPAIGN = gql`
  mutation DeleteCampaign($id: String!) {
    deleteCampaign(id: $id)
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

const DUPLICATE_CAMPAIGN = gql`
  mutation DuplicateCampaign($id: String!) {
    duplicateCampaign(id: $id) {
      id
      name
    }
  }
`;

export default function CampaignsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, loading, refetch } = useQuery(CAMPAIGNS_QUERY, {
    variables: {
      status: statusFilter || undefined,
      limit: 50,
    },
  });

  const [deleteCampaign] = useMutation(DELETE_CAMPAIGN);
  const [sendCampaign, { loading: sending }] = useMutation(SEND_CAMPAIGN);
  const [duplicateCampaign] = useMutation(DUPLICATE_CAMPAIGN);

  const campaigns = data?.newsletterCampaigns || [];

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Campaign "${name}" wirklich löschen?`)) {
      return;
    }

    try {
      await deleteCampaign({ variables: { id } });
      alert('✅ Campaign gelöscht!');
      refetch();
    } catch (error) {
      alert('❌ Fehler beim Löschen');
    }
  };

  const handleSend = async (id: string, name: string) => {
    if (!confirm(`Campaign "${name}" jetzt an alle Subscriber senden?`)) {
      return;
    }

    try {
      const result = await sendCampaign({ variables: { id } });
      const recipientCount = result.data.sendCampaign.recipientCount;
      alert(`✅ Campaign wird versendet an ${recipientCount} Empfänger!`);
      refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fehler beim Senden';
      alert('❌ ' + message);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const result = await duplicateCampaign({ variables: { id } });
      alert(`✅ Campaign dupliziert: ${result.data.duplicateCampaign.name}`);
      refetch();
    } catch (error) {
      alert('❌ Fehler beim Duplizieren');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-muted-foreground bg-muted border border-border';
      case 'scheduled': return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/30';
      case 'sending': return 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/30';
      case 'sent': return 'text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/30';
      case 'failed': return 'text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/30';
      default: return 'text-muted-foreground bg-muted border border-border';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return '📝 Entwurf';
      case 'scheduled': return '⏰ Geplant';
      case 'sending': return '📤 Wird versendet';
      case 'sent': return '✅ Versendet';
      case 'failed': return '❌ Fehlgeschlagen';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lädt Campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground transition-colors duration-300">
            📨 Newsletter Campaigns
          </h1>
          <p className="mt-2 text-muted-foreground transition-colors duration-300">
            Erstelle und versende Newsletter Kampagnen
          </p>
        </div>
        <Link href="/dashboard/newsletter/campaigns/new">
          <Button className="btn-glow shadow-lg">
            ➕ Neue Campaign
          </Button>
        </Link>
         <Link href="/dashboard/newsletter/settings">
          <Button className="btn-glow shadow-lg">
            ⚙️ newsletter Einstellungen
          </Button>
        </Link>
          </div>

     {/* Quick Links */}
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/newsletter/subscribers">
          <Button variant="outline" size="sm" className="shadow-sm">
            📧 Subscribers
          </Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          🔄 Aktualisieren
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-lg card-hover">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-sm font-medium text-foreground mb-2 transition-colors duration-300">
                Status filtern
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-input text-foreground focus:border-ring focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-sm"
              >
                <option value="">Alle Status</option>
                <option value="draft">📝 Entwürfe</option>
                <option value="scheduled">⏰ Geplant</option>
                <option value="sending">📤 Wird versendet</option>
                <option value="sent">✅ Versendet</option>
                <option value="failed">❌ Fehlgeschlagen</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.length === 0 ? (
          <div className="col-span-full">
            <Card className="shadow-lg">
              <CardContent className="text-center py-16">
                <div className="text-8xl mb-6">📭</div>
                <h3 className="text-2xl font-semibold text-foreground mb-3 transition-colors duration-300">
                  Noch keine Campaigns
                </h3>
                <p className="text-muted-foreground mb-8 transition-colors duration-300">
                  Erstelle deine erste Newsletter Campaign
                </p>
                <Link href="/dashboard/newsletter/campaigns/new">
                  <Button className="btn-glow shadow-lg">
                    ➕ Campaign erstellen
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          campaigns.map((campaign: any) => (
            <Card key={campaign.id} className="shadow-lg card-hover group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate group-hover:text-primary transition-colors duration-300">
                      {campaign.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 truncate transition-colors duration-300">
                      {campaign.subject}
                    </p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${getStatusColor(campaign.status)}`}>
                    {getStatusLabel(campaign.status)}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Stats */}
                {campaign.status === 'sent' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-muted rounded-lg border border-border transition-all duration-300 hover:bg-primary/5 hover:border-primary/30 text-center">
                      <div className="text-xs text-muted-foreground mb-1 transition-colors duration-300">
                        Versendet
                      </div>
                      <div className="text-xl font-bold text-foreground transition-colors duration-300">
                        {campaign.sentCount}
                      </div>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30 transition-all duration-300 hover:bg-green-500/20 text-center">
                      <div className="text-xs text-muted-foreground mb-1 transition-colors duration-300">
                        Geöffnet
                      </div>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">
                        {campaign.openedCount}
                      </div>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30 transition-all duration-300 hover:bg-blue-500/20 text-center">
                      <div className="text-xs text-muted-foreground mb-1 transition-colors duration-300">
                        Geklickt
                      </div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">
                        {campaign.clickedCount}
                      </div>
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="text-sm text-muted-foreground space-y-2 transition-colors duration-300">
                  {campaign.scheduledAt && (
                    <div className="flex items-center gap-2">
                      <span>⏰</span>
                      <span>Geplant: {new Date(campaign.scheduledAt).toLocaleString('de-DE')}</span>
                    </div>
                  )}
                  {campaign.sendAt && (
                    <div className="flex items-center gap-2">
                      <span>📤</span>
                      <span>Versendet: {new Date(campaign.sendAt).toLocaleString('de-DE')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>Erstellt: {new Date(campaign.createdAt).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border">
                  {campaign.status === 'draft' && (
                    <>
                      <Link href={`/dashboard/newsletter/campaigns/${campaign.id}`} className="col-span-2">
                        <Button size="sm" variant="outline" fullWidth className="shadow-sm">
                          ✏️ Bearbeiten
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => handleSend(campaign.id, campaign.name)}
                        disabled={sending}
                        fullWidth
                        className="col-span-2 btn-glow shadow-md"
                      >
                        {sending ? '📤 Sendet...' : '📤 Jetzt senden'}
                      </Button>
                    </>
                  )}

                  {campaign.status === 'sent' && (
                    <Link href={`/dashboard/newsletter/campaigns/${campaign.id}/stats`} className="col-span-2">
                      <Button size="sm" variant="outline" fullWidth className="shadow-sm">
                        📊 Statistiken
                      </Button>
                    </Link>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDuplicate(campaign.id)}
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    📋
                  </Button>

                  {(campaign.status === 'draft' || campaign.status === 'failed') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(campaign.id, campaign.name)}
                      className="text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                    >
                      🗑️
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}