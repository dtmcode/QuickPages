'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const TENANT_QUERY = gql`
  query GetCurrentTenant {
    currentTenant {
      user {
        id
        email
        firstName
        lastName
        role
      }
      tenant {
        id
        name
        slug
        domain
        package
        createdAt
      }
    }
  }
`;

export default function SettingsPage() {
  const { data, loading } = useQuery(TENANT_QUERY);
  const { user } = useAuth();
  
  const tenant = data?.currentTenant?.tenant;
  const isOwner = user?.role?.toUpperCase() === 'OWNER';

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return <div className="text-center py-12">Lädt...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">⚙️ Einstellungen</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Globale Workspace-Einstellungen
        </p>
      </div>

      {/* Workspace Info */}
      <Card>
        <CardHeader>
          <CardTitle>🏢 Workspace Informationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Workspace Name
              </label>
              <input
                type="text"
                value={tenant?.name || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={tenant?.slug || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Package
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={tenant?.package?.toUpperCase() || 'STARTER'}
                disabled
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <Button variant="ghost" disabled>
                Upgrade
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Package-Upgrades sind derzeit nicht verfügbar
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Domain
            </label>
            <input
              type="text"
              value={tenant?.domain || 'Nicht konfiguriert'}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Custom Domain kann nur vom Support konfiguriert werden
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Erstellt am
            </label>
            <input
              type="text"
              value={tenant?.createdAt ? formatDate(tenant.createdAt) : ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>👤 Dein Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-Mail
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rolle
              </label>
              <input
                type="text"
                value={user?.role?.toUpperCase() || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vorname
              </label>
              <input
                type="text"
                value={user?.firstName || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nachname
              </label>
              <input
                type="text"
                value={user?.lastName || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button variant="ghost" disabled>
              Passwort ändern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Module Settings Links */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Modul-Einstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <a 
            href="/dashboard/shop/settings"
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">🛒</div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Shop Einstellungen
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Templates, Zahlungen, Versand
                </div>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <a 
            href="/dashboard/packages"
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">📦</div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Packages & Add-ons
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Upgrade oder Add-ons verwalten
                </div>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <a 
            href="/dashboard/settings/email"
            className="flex items-center justify-between p-4 border border-cyan-200 dark:border-cyan-700 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">📧</div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Email Einstellungen
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  SMTP Server, Templates & Versand
                </div>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
<a 
          href="/dashboard/settings/payments"
  className="flex items-center justify-between p-4 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
>
  <div className="flex items-center gap-3">
    <div className="text-2xl">💳</div>
    <div>
      <div className="font-semibold text-gray-900 dark:text-white">
        Zahlungseinstellungen
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Stripe, PayPal, Banküberweisung
      </div>
    </div>
  </div>
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
          </a>
          <a 
href="/dashboard/settings/domain"
  className="flex items-center justify-between p-4 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
>
  <div className="flex items-center gap-3">
    <div className="text-2xl">🌐</div>
    <div>
      <div className="font-semibold text-gray-900 dark:text-white">
        Custom Domain
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Domain verbinden und verifizieren
      </div>
    </div>
  </div>
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
</a>
            <a 
          href="/dashboard/settings/white-label"
            className="flex items-center justify-between p-4 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎨</div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">White-Label</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Logo, Farben, Branding</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📝</div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  CMS Einstellungen
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  SEO, Blog Layout
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-500">Bald verfügbar</span>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {isOwner && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">⚠️ Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Workspace löschen
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Alle Daten werden permanent gelöscht
                </div>
              </div>
              <Button variant="danger" disabled>
                Löschen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}