'use client';
// 📂 PFAD: frontend/src/app/dashboard/settings/white-label/page.tsx

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql';

interface BrandingSettings {
  platformName: string;
  logoUrl: string;
  logoInitial: string;
  primaryColor: string;
  hidePoweredBy: boolean;
  faviconUrl: string;
}

async function gql(query: string, variables?: Record<string, unknown>) {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(GRAPHQL_URL, {
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

export default function WhiteLabelPage() {
  const { tenant } = useAuth();
  const isEnterprise = tenant?.package === 'enterprise';

  const [settings, setSettings] = useState<BrandingSettings>({
    platformName: '',
    logoUrl: '',
    logoInitial: '',
    primaryColor: '#3b82f6',
    hidePoweredBy: false,
    faviconUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    gql(`query { brandingSettings { platformName logoUrl logoInitial primaryColor hidePoweredBy faviconUrl } }`)
      .then((d) => {
        if (d.brandingSettings) {
          setSettings((prev) => ({ ...prev, ...d.brandingSettings }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await gql(
        `mutation UpdateBranding($input: UpdateBrandingInput!) {
          updateBranding(input: $input) { platformName logoInitial primaryColor hidePoweredBy }
        }`,
        { input: settings },
      );
      showToast('Branding gespeichert! Seite wird neu geladen...');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Fehler beim Speichern', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <Link href="/dashboard/settings" className="text-sm text-blue-600 hover:underline">← Zurück zu Einstellungen</Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">🎨 White-Label</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Ersetze das QuickPages-Branding durch dein eigenes Logo und Farben.
        </p>
      </div>

      {!isEnterprise && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-300">Enterprise-Feature</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                White-Label ist ab dem <strong>Enterprise</strong>-Paket (€249/mo) verfügbar.
                Du kannst die Einstellungen hier konfigurieren, sie werden aber erst nach einem Upgrade aktiv.
              </p>
              <Link
                href="/dashboard/packages"
                className="inline-block mt-3 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
              >
                Auf Enterprise upgraden →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 dark:text-white text-lg">Dashboard Branding</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Plattform-Name
          </label>
          <input
            type="text"
            value={settings.platformName}
            onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
            placeholder="SaaS"
            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">Wird im Sidebar angezeigt. Standard: "SaaS"</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Logo-Buchstabe
            </label>
            <input
              type="text"
              value={settings.logoInitial}
              onChange={(e) => setSettings({ ...settings, logoInitial: e.target.value.slice(0, 2) })}
              placeholder="S"
              maxLength={2}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Fallback wenn kein Logo-URL</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Primärfarbe
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm font-mono bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Logo-URL
          </label>
          <input
            type="url"
            value={settings.logoUrl}
            onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
            placeholder="https://deinedomain.de/logo.png"
            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">Empfohlen: 40×40px PNG/SVG mit transparentem Hintergrund</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Favicon-URL
          </label>
          <input
            type="url"
            value={settings.faviconUrl}
            onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
            placeholder="https://deinedomain.de/favicon.ico"
            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <input
            type="checkbox"
            id="hidePoweredBy"
            checked={settings.hidePoweredBy}
            onChange={(e) => setSettings({ ...settings, hidePoweredBy: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <label htmlFor="hidePoweredBy" className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">"Powered by QuickPages"</span> ausblenden
          </label>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-4">Vorschau</h2>
        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 w-48">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ backgroundColor: settings.primaryColor || '#3b82f6' }}
            >
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-white font-bold text-xl">
                  {settings.logoInitial || 'S'}
                </span>
              )}
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              {settings.platformName || 'SaaS'}
            </span>
          </div>
          {!settings.hidePoweredBy && (
            <p className="text-[10px] text-gray-400 mt-3">Powered by QuickPages</p>
          )}
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving || !isEnterprise}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Wird gespeichert...' : isEnterprise ? 'Branding speichern' : '🔒 Enterprise erforderlich'}
      </button>
    </div>
  );
}