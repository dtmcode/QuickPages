'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const CAMPAIGN_STATS_QUERY = gql`
  query CampaignStats($id: String!) {
    newsletterCampaign(id: $id) {
      id
      name
      subject
      status
      totalRecipients
      sentCount
      deliveredCount
      openedCount
      clickedCount
      bouncedCount
      unsubscribedCount
      sendAt
    }
    campaignStats(id: $id) {
      total
      sent
      delivered
      opened
      clicked
      bounced
      unsubscribed
      openRate
      clickRate
    }
  }
`;

export default function CampaignStatsPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const { data, loading } = useQuery(CAMPAIGN_STATS_QUERY, {
    variables: { id: campaignId },
  });

  const campaign = data?.newsletterCampaign;
  const stats = data?.campaignStats;

  if (loading) {
    return <div className="text-center py-12">Lädt Statistiken...</div>;
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/newsletter/campaigns">
          <Button variant="ghost" size="sm">← Zurück zu Campaigns</Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          📊 Campaign Statistiken
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {campaign.name}
        </p>
      </div>

      {/* Campaign Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Subject</div>
              <div className="font-semibold text-gray-900 dark:text-white mt-1">
                {campaign.subject}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
              <div className="font-semibold text-gray-900 dark:text-white mt-1">
                {campaign.status}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Versendet am</div>
              <div className="font-semibold text-gray-900 dark:text-white mt-1">
                {campaign.sendAt ? new Date(campaign.sendAt).toLocaleString('de-DE') : '-'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {stats?.sent || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              📤 Versendet
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-green-600">
              {stats?.opened || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              👁️ Geöffnet
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats?.openRate || 0}% Rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-blue-600">
              {stats?.clicked || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              🔗 Geklickt
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats?.clickRate || 0}% Rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-red-600">
              {stats?.unsubscribed || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              🚫 Abgemeldet
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📈 Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Zugestellt</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats?.delivered || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Bounces</span>
                <span className="font-semibold text-red-600">
                  {stats?.bounced || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Open Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${stats?.openRate || 0}%` }}
                    />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {stats?.openRate || 0}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Click Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${stats?.clickRate || 0}%` }}
                    />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {stats?.clickRate || 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Zusammenfassung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Erfolgreich</div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {stats?.opened || 0} / {stats?.sent || 0}
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Engagement</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {stats?.clicked || 0} Klicks
                </div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Verluste</div>
                <div className="text-2xl font-bold text-red-600 mt-1">
                  {(stats?.bounced || 0) + (stats?.unsubscribed || 0)} Total
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}