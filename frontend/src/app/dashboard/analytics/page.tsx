'use client';

/**
 * ==================== ANALYTICS DASHBOARD ====================
 * Dashboard → Analytics
 * 
 * Features:
 * - Übersichts-KPIs (Page Views, Visitors, Bounce Rate, Revenue)
 * - Zeitreihen-Chart (Line Chart)
 * - Top Pages & Top Referrers Tabellen
 * - Device/Browser Breakdown
 * - Realtime Visitors Counter
 * - Zeitraum-Auswahl (7d, 30d, 90d, custom)
 * 
 * Pfad: /frontend/src/app/dashboard/analytics/page.tsx
 */

import { useState, useEffect, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';

// ========== GRAPHQL QUERY ==========

const GET_ANALYTICS = gql`
  query AnalyticsDashboard($startDate: String!, $endDate: String!) {
    analyticsDashboard(startDate: $startDate, endDate: $endDate) {
      overview {
        totalPageViews
        uniqueVisitors
        totalSessions
        avgDuration
        bounceRate
        ordersCount
        revenue
      }
      dailyStats {
        date
        pageViews
        uniqueVisitors
        sessions
        revenue
      }
      topPages {
        path
        views
        uniqueViews
      }
      topReferrers {
        referrer
        visits
      }
      breakdowns {
        devices { name count }
        browsers { name count }
        countries { name count }
      }
      realtimeVisitors
    }
  }
`;

// ========== TYPES ==========

interface DailyPoint {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  revenue: number;
}

// ========== DATE HELPERS ==========

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDateRange(period: string): { start: string; end: string } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case '7d': start.setDate(end.getDate() - 7); break;
    case '30d': start.setDate(end.getDate() - 30); break;
    case '90d': start.setDate(end.getDate() - 90); break;
    case '365d': start.setDate(end.getDate() - 365); break;
    default: start.setDate(end.getDate() - 30);
  }

  return { start: formatDate(start), end: formatDate(end) };
}

// ========== COMPONENT ==========

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  const { start, end } = useMemo(() => getDateRange(period), [period]);

  const { data, loading, error, refetch } = useQuery(GET_ANALYTICS, {
    variables: { startDate: start, endDate: end },
    pollInterval: 60000, // Auto-refresh jede Minute
  });

  const dashboard = data?.analyticsDashboard;
  const overview = dashboard?.overview;
  const dailyStats: DailyPoint[] = dashboard?.dailyStats || [];

  if (loading && !data) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-72 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">
            {dashboard?.realtimeVisitors > 0 && (
              <span className="inline-flex items-center gap-1.5 mr-3">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-700 font-medium">{dashboard.realtimeVisitors} live</span>
              </span>
            )}
            {start} — {end}
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: '7d', label: '7 Tage' },
            { key: '30d', label: '30 Tage' },
            { key: '90d', label: '90 Tage' },
            { key: '365d', label: '1 Jahr' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                period === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Seitenaufrufe"
          value={overview?.totalPageViews || 0}
          icon="👁️"
          color="blue"
        />
        <KpiCard
          label="Besucher"
          value={overview?.uniqueVisitors || 0}
          icon="👤"
          color="green"
        />
        <KpiCard
          label="Bounce Rate"
          value={`${overview?.bounceRate || 0}%`}
          icon="↩️"
          color="yellow"
        />
        <KpiCard
          label="Umsatz"
          value={`€${((overview?.revenue || 0) / 100).toFixed(0)}`}
          icon="💰"
          color="purple"
          subtitle={`${overview?.ordersCount || 0} Bestellungen`}
        />
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Verlauf</h3>
        {dailyStats.length > 0 ? (
          <SimpleLineChart data={dailyStats} />
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400">
            Noch keine Daten für diesen Zeitraum
          </div>
        )}
      </div>

      {/* Tables & Breakdowns */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Top Pages */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Seiten</h3>
          {dashboard?.topPages?.length > 0 ? (
            <div className="space-y-2">
              {dashboard.topPages.map((page: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                    <span className="text-sm text-gray-700 truncate">{page.path}</span>
                  </div>
                  <div className="flex gap-4 text-sm flex-shrink-0">
                    <span className="text-gray-900 font-medium">{page.views}</span>
                    <span className="text-gray-400 w-12 text-right">{page.uniqueViews} unique</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Keine Daten</p>
          )}
        </div>

        {/* Top Referrers */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Referrer</h3>
          {dashboard?.topReferrers?.length > 0 ? (
            <div className="space-y-2">
              {dashboard.topReferrers.map((ref: any, i: number) => {
                const maxVisits = dashboard.topReferrers[0].visits;
                return (
                  <div key={i} className="relative">
                    <div
                      className="absolute inset-y-0 left-0 bg-blue-50 rounded"
                      style={{ width: `${(ref.visits / maxVisits) * 100}%` }}
                    />
                    <div className="relative flex items-center justify-between py-2 px-2">
                      <span className="text-sm text-gray-700 truncate">{ref.referrer}</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{ref.visits}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Keine Daten</p>
          )}
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid lg:grid-cols-3 gap-6">
        <BreakdownCard title="Geräte" icon="📱" data={dashboard?.breakdowns?.devices || []} />
        <BreakdownCard title="Browser" icon="🌐" data={dashboard?.breakdowns?.browsers || []} />
        <BreakdownCard title="Länder" icon="🌍" data={dashboard?.breakdowns?.countries || []} />
      </div>
    </div>
  );
}

// ========== SUB-COMPONENTS ==========

function KpiCard({ label, value, icon, color, subtitle }: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-green-50 border-green-100',
    yellow: 'bg-yellow-50 border-yellow-100',
    purple: 'bg-purple-50 border-purple-100',
  };

  return (
    <div className={`p-5 rounded-xl border ${colors[color] || colors.blue}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString('de-DE') : value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function BreakdownCard({ title, icon, data }: {
  title: string;
  icon: string;
  data: Array<{ name: string; count: number }>;
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="font-semibold text-gray-900 mb-4">
        <span className="mr-2">{icon}</span>{title}
      </h3>
      {data.length > 0 ? (
        <div className="space-y-3">
          {data.map((entry, i) => {
            const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
            return (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{entry.name}</span>
                  <span className="text-gray-500">{pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">Keine Daten</p>
      )}
    </div>
  );
}

/**
 * Simple SVG Line Chart (keine externe Dependency)
 */
function SimpleLineChart({ data }: { data: DailyPoint[] }) {
  if (data.length === 0) return null;

  const width = 800;
  const height = 200;
  const padding = { top: 20, right: 10, bottom: 30, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxViews = Math.max(...data.map(d => d.pageViews), 1);
  const maxVisitors = Math.max(...data.map(d => d.uniqueVisitors), 1);
  const maxY = Math.max(maxViews, maxVisitors);

  const xScale = (i: number) => padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
  const yScale = (v: number) => padding.top + chartH - (v / maxY) * chartH;

  const viewsPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.pageViews)}`).join(' ');
  const visitorsPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.uniqueVisitors)}`).join(' ');

  // Y-axis labels
  const yTicks = [0, Math.round(maxY / 2), maxY];

  // X-axis labels (show ~5-7 dates)
  const step = Math.max(1, Math.floor(data.length / 6));
  const xLabels = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  return (
    <div>
      {/* Legend */}
      <div className="flex gap-4 mb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-blue-500 rounded" /> Seitenaufrufe
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-green-500 rounded" /> Besucher
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Grid Lines */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left} y1={yScale(tick)}
              x2={width - padding.right} y2={yScale(tick)}
              stroke="#f0f0f0" strokeWidth="1"
            />
            <text x={padding.left - 8} y={yScale(tick) + 4} textAnchor="end" fontSize="10" fill="#999">
              {tick.toLocaleString('de-DE')}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {xLabels.map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <text
              key={i}
              x={xScale(idx)}
              y={height - 5}
              textAnchor="middle"
              fontSize="10"
              fill="#999"
            >
              {new Date(d.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
            </text>
          );
        })}

        {/* Page Views Line */}
        <path d={viewsPath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Visitors Line */}
        <path d={visitorsPath} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {data.length <= 31 && data.map((d, i) => (
          <g key={i}>
            <circle cx={xScale(i)} cy={yScale(d.pageViews)} r="3" fill="#3b82f6" />
            <circle cx={xScale(i)} cy={yScale(d.uniqueVisitors)} r="3" fill="#22c55e" />
          </g>
        ))}
      </svg>
    </div>
  );
}