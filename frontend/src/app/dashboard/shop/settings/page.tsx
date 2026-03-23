'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const TENANT_QUERY = gql`
  query GetCurrentTenant {
    currentTenant {
      user {
        id
        role
      }
      tenant {
        id
        name
        shopTemplate
      }
    }
  }
`;

const UPDATE_SHOP_TEMPLATE = gql`
  mutation UpdateShopTemplate($template: String!) {
    updateShopTemplate(template: $template) {
      tenant {
        id
        shopTemplate
      }
    }
  }
`;

const shopTemplates = [
  {
    value: 'default',
    name: 'Standard',
    description: 'Klassisches Shop-Layout mit allen Features',
    preview: '🛒',
    features: ['Produktgrid', 'Featured Produkte', 'Kategorie-Filter', 'Warenkorb'],
  },
  {
    value: 'minimalist',
    name: 'Minimalist',
    description: 'Clean und modern mit Fokus auf Produkte',
    preview: '⚪',
    features: ['Minimales Design', 'Große Produktbilder', 'Viel Weißraum', 'Modern'],
  },
  {
    value: 'fashion',
    name: 'Fashion',
    description: 'Bildlastig für Mode und Lifestyle',
    preview: '👗',
    features: ['Große Bilder', 'Instagram-Style', 'Lookbooks', 'Fashion-Focus'],
  },
  {
    value: 'tech',
    name: 'Tech',
    description: 'Modern für Elektronik und Gadgets',
    preview: '💻',
    features: ['Dunkles Theme', 'Tech-Specs', 'Vergleichstabellen', 'Modern'],
  },
];

export default function ShopSettingsPage() {
  const { data, loading, refetch } = useQuery(TENANT_QUERY);
  const [updateTemplate, { loading: updating }] = useMutation(UPDATE_SHOP_TEMPLATE);
  const { user } = useAuth();
  
  const tenant = data?.currentTenant?.tenant;
  const isOwner = user?.role?.toUpperCase() === 'OWNER';

 console.log('🔍 Shop Settings Debug:', {
    user: user,
    role: user?.role,
    roleType: typeof user?.role,
    isOwner: isOwner,
  });
  const handleTemplateChange = async (template: string) => {
    if (!isOwner) {
      alert('Nur der Owner kann das Template ändern');
      return;
    }

    try {
      await updateTemplate({ variables: { template } });
      await refetch();
      alert('✅ Shop-Template erfolgreich geändert!');
    } catch (error: any) {
      alert('❌ ' + (error.message || 'Fehler beim Ändern des Templates'));
    }
  };

  if (loading) {
    return <div className="text-center py-12">Lädt...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/shop">
            <Button variant="ghost" size="sm">← Zurück zum Shop</Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            🛒 Shop Einstellungen
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Konfiguriere deinen Online-Shop
          </p>
        </div>
      </div>

      {/* Shop Template */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>🎨 Shop Template</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Wähle das Design für deinen Shop
              </p>
            </div>
            {!isOwner && (
              <span className="text-sm text-red-600 dark:text-red-400">
                Nur Owner können ändern
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shopTemplates.map((template) => (
              <button
                key={template.value}
                onClick={() => handleTemplateChange(template.value)}
                disabled={updating || !isOwner}
                className={`p-6 border-2 rounded-lg text-left transition-all ${
                  tenant?.shopTemplate === template.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                } ${(!isOwner || updating) && 'opacity-50 cursor-not-allowed'}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">{template.preview}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-semibold text-lg text-gray-900 dark:text-white">
                        {template.name}
                      </div>
                      {tenant?.shopTemplate === template.value && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                          ✓ Aktiv
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {template.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {tenant?.shopTemplate && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600 dark:text-blue-400">ℹ️</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Aktuelles Template: {shopTemplates.find(t => t.value === tenant.shopTemplate)?.name}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Änderungen sind sofort sichtbar auf deiner Shop-Seite unter{' '}
                <Link href="/shop" className="text-blue-600 hover:underline">
                  /shop
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle>💳 Zahlungsmethoden</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Konfiguriere verfügbare Zahlungsoptionen
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <span className="text-4xl mb-2 block">🚧</span>
            Bald verfügbar
          </div>
        </CardContent>
      </Card>

      {/* Shipping Settings */}
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle>📦 Versandoptionen</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Konfiguriere Versandmethoden und -kosten
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <span className="text-4xl mb-2 block">🚧</span>
            Bald verfügbar
          </div>
        </CardContent>
      </Card>

      {/* General Shop Settings */}
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle>⚙️ Allgemeine Einstellungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <span className="text-4xl mb-2 block">🚧</span>
            Bald verfügbar
          </div>
        </CardContent>
      </Card>
    </div>
  );
}