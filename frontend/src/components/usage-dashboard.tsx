'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const TENANT_SUBSCRIPTION_QUERY = gql`
  query TenantSubscription {
    tenantSubscription {
      currentPackage
      limits {
        users
        posts
        pages
        products
        emailsPerMonth
      }
      currentUsage {
        month
        emailsSent
        productsCreated
        postsCreated
        apiCalls
        storageUsedMb
      }
    }
  }
`;

export function UsageDashboard() {
  const { data, loading } = useQuery(TENANT_SUBSCRIPTION_QUERY);

  if (loading) {
    return <div>Lädt...</div>;
  }

  const limits = data?.tenantSubscription?.limits;
  const usage = data?.tenantSubscription?.currentUsage;
  const currentPackage = data?.tenantSubscription?.currentPackage;

  const getPercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // unlimited
    if (limit === 0) return 100; // not available
    return Math.min((current / limit) * 100, 100);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const formatLimit = (limit: number) => {
    return limit === -1 ? '∞' : limit.toLocaleString();
  };

  const usageItems = [
    {
      label: 'Blog Posts',
      current: usage?.postsCreated || 0,
      limit: limits?.posts || 0,
      icon: '📝',
    },
    {
      label: 'Produkte',
      current: usage?.productsCreated || 0,
      limit: limits?.products || 0,
      icon: '🛒',
    },
    {
      label: 'Emails',
      current: usage?.emailsSent || 0,
      limit: limits?.emailsPerMonth || 0,
      icon: '📧',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>📊 Aktuelle Nutzung</CardTitle>
          <Link href="/dashboard/packages">
            <Button size="sm" variant="ghost">
              Packages verwalten →
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Monat: {usage?.month} • Package: {currentPackage?.toUpperCase()}
        </div>

        {usageItems.map((item) => {
          const percentage = getPercentage(item.current, item.limit);
          const isNearLimit = percentage >= 80;

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                </div>
                <div className={`text-sm font-medium ${getStatusColor(percentage)}`}>
                  {item.current.toLocaleString()} / {formatLimit(item.limit)}
                </div>
              </div>
              <Progress value={percentage} className="h-2" />
              {isNearLimit && item.limit !== -1 && item.limit > 0 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  ⚠️ Limit fast erreicht! Erwäge ein Upgrade.
                </p>
              )}
            </div>
          );
        })}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Storage: {(usage?.storageUsedMb || 0).toLocaleString()} MB verwendet
          </div>
        </div>
      </CardContent>
    </Card>
  );
}