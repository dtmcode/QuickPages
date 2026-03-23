'use client';

import { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const EMAIL_SETTINGS_QUERY = gql`
  query EmailSettings {
    emailSettings {
      id
      provider
      smtpHost
      smtpPort
      smtpSecure
      smtpUser
      fromEmail
      fromName
      replyTo
      isEnabled
      isVerified
      lastTestedAt
    }
  }
`;

const UPDATE_EMAIL_SETTINGS = gql`
  mutation UpdateEmailSettings($input: EmailSettingsInput!) {
    updateEmailSettings(input: $input) {
      id
      isEnabled
      isVerified
    }
  }
`;

const TEST_EMAIL_SETTINGS = gql`
  mutation TestEmailSettings($testTo: String!) {
    testEmailSettings(testTo: $testTo) {
      success
      error
    }
  }
`;

const DELETE_EMAIL_SETTINGS = gql`
  mutation DeleteEmailSettings {
    deleteEmailSettings
  }
`;

export default function EmailSettingsPage() {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  const { data, loading, refetch } = useQuery(EMAIL_SETTINGS_QUERY);
  const [updateSettings, { loading: updating }] = useMutation(UPDATE_EMAIL_SETTINGS);
  const [testSettings, { loading: testing }] = useMutation(TEST_EMAIL_SETTINGS);
  const [deleteSettings, { loading: deleting }] = useMutation(DELETE_EMAIL_SETTINGS);

  const isOwner = user?.role?.toUpperCase() === 'OWNER';
  const settings = data?.emailSettings;

  // Form State
  const [provider, setProvider] = useState(settings?.provider || 'custom');
  const [smtpHost, setSmtpHost] = useState(settings?.smtpHost || '');
  const [smtpPort, setSmtpPort] = useState(settings?.smtpPort || 587);
  const [smtpSecure, setSmtpSecure] = useState(settings?.smtpSecure || false);
  const [smtpUser, setSmtpUser] = useState(settings?.smtpUser || '');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [fromEmail, setFromEmail] = useState(settings?.fromEmail || '');
  const [fromName, setFromName] = useState(settings?.fromName || '');
  const [replyTo, setReplyTo] = useState(settings?.replyTo || '');

  // Provider Presets
  const providerPresets = {
    gmail: { host: 'smtp.gmail.com', port: 587, secure: false },
    outlook: { host: 'smtp-mail.outlook.com', port: 587, secure: false },
    netcup: { host: 'mail.netcup.net', port: 587, secure: false },
    ionos: { host: 'smtp.ionos.de', port: 587, secure: false },
    strato: { host: 'smtp.strato.de', port: 465, secure: true },
    custom: { host: '', port: 587, secure: false },
  };

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const preset = providerPresets[newProvider as keyof typeof providerPresets];
    if (preset) {
      setSmtpHost(preset.host);
      setSmtpPort(preset.port);
      setSmtpSecure(preset.secure);
    }
  };

  const handleSave = async () => {
    try {
      await updateSettings({
        variables: {
          input: {
            provider,
            smtpHost,
            smtpPort: parseInt(smtpPort.toString()),
            smtpSecure,
            smtpUser,
            smtpPassword: smtpPassword || undefined,
            fromEmail,
            fromName,
            replyTo,
          },
        },
      });
      alert('✅ Email-Einstellungen gespeichert!');
      await refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fehler beim Speichern';
      alert('❌ ' + message);
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      alert('Bitte gib eine Test-Email-Adresse ein');
      return;
    }

    try {
      const result = await testSettings({
        variables: { testTo: testEmail },
      });
      setTestResult(result.data.testEmailSettings);
      
      if (result.data.testEmailSettings.success) {
        alert('✅ Test-Email erfolgreich gesendet!');
        await refetch();
      } else {
        alert(`❌ Test fehlgeschlagen: ${result.data.testEmailSettings.error}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fehler beim Test';
      alert('❌ ' + message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Möchtest du die Email-Einstellungen wirklich löschen?')) {
      return;
    }

    try {
      await deleteSettings();
      alert('✅ Email-Einstellungen gelöscht. Platform SMTP wird verwendet.');
      await refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fehler beim Löschen';
      alert('❌ ' + message);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Lädt...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="sm">← Zurück zu Einstellungen</Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          📧 Email-Einstellungen
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Konfiguriere deinen eigenen SMTP Server oder nutze unseren Platform SMTP
        </p>
      </div>

      {!isOwner && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
              <span>⚠️</span>
              <span className="font-medium">
                Nur der Owner kann Email-Einstellungen verwalten
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Card className="border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/10">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            ℹ️ SMTP Konfiguration
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>• <strong>Ohne Konfiguration:</strong> Platform SMTP wird verwendet (kostenlos)</li>
            <li>• <strong>Mit Konfiguration:</strong> Dein eigener SMTP Server wird verwendet</li>
            <li>• <strong>Empfohlen:</strong> Gmail, Outlook, oder dein Hosting-Provider</li>
            <li>• <strong>Passwörter:</strong> Werden verschlüsselt gespeichert (AES-256)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Current Status */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">Status</div>
                <div className={`text-sm font-semibold ${settings.isEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                  {settings.isEnabled ? '✅ Aktiv' : '⏸️ Inaktiv'}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">Verifiziert</div>
                <div className={`text-sm font-semibold ${settings.isVerified ? 'text-green-600' : 'text-orange-600'}`}>
                  {settings.isVerified ? '✅ Ja' : '⚠️ Nein'}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">Provider</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                  {settings.provider}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">Letzter Test</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {settings.lastTestedAt 
                    ? new Date(settings.lastTestedAt).toLocaleDateString('de-DE')
                    : 'Nie'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ SMTP Konfiguration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              disabled={!isOwner}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="gmail">Gmail</option>
              <option value="outlook">Outlook / Office365</option>
              <option value="netcup">Netcup</option>
              <option value="ionos">IONOS</option>
              <option value="strato">Strato</option>
              <option value="custom">Custom SMTP</option>
            </select>
          </div>

          {/* SMTP Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                disabled={!isOwner}
                placeholder="smtp.gmail.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Port
              </label>
              <input
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(parseInt(e.target.value))}
                disabled={!isOwner}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Secure */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={smtpSecure}
              onChange={(e) => setSmtpSecure(e.target.checked)}
              disabled={!isOwner}
              className="w-4 h-4"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              SSL/TLS verwenden (Port 465)
            </label>
          </div>

          {/* Auth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Benutzername / Email
              </label>
              <input
                type="text"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                disabled={!isOwner}
                placeholder="deine-email@gmail.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Passwort / App-Passwort
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  disabled={!isOwner}
                  placeholder="••••••••••••••••"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </div>

          {/* From Settings */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Absender-Einstellungen
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Absender Email *
                </label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  disabled={!isOwner}
                  required
                  placeholder="noreply@deine-firma.de"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Absender Name
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  disabled={!isOwner}
                  placeholder="Deine Firma"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reply-To (optional)
              </label>
              <input
                type="email"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                disabled={!isOwner}
                placeholder="support@deine-firma.de"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleSave}
              disabled={!isOwner || updating || !fromEmail}
              fullWidth
            >
              {updating ? 'Speichert...' : '💾 Speichern'}
            </Button>
            
            {settings && (
              <Button
                variant="ghost"
                onClick={handleDelete}
                disabled={!isOwner || deleting}
              >
                {deleting ? 'Löscht...' : '🗑️ Löschen'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Email */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Email-Konfiguration testen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test-Email-Adresse
            </label>
           <input
  type="email"
  value={testEmail}
  onChange={(e) => setTestEmail(e.target.value)}
  disabled={!isOwner}  // ← NUR Owner-Check!
  placeholder="deine-email@example.com"
  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
/>
            <p className="text-xs text-gray-500 mt-1">
              Eine Test-Email wird an diese Adresse gesendet
            </p>
          </div>

         <Button
  onClick={handleTest}
  disabled={!isOwner || testing || !testEmail}  // ← !settings weg!
  fullWidth
>
  {testing ? 'Sendet...' : '✉️ Test-Email senden'}
</Button>

          {testResult && (
            <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
              <div className={`font-medium ${testResult.success ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
                {testResult.success ? '✅ Test erfolgreich!' : '❌ Test fehlgeschlagen'}
              </div>
              {testResult.error && (
                <div className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {testResult.error}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}