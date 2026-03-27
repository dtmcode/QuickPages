'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// ==================== GRAPHQL ====================

const GET_PAYMENT_SETTINGS = gql`
  query GetPaymentSettings {
    paymentSettings {
      stripe {
        publishableKey
        secretKeyMasked
        webhookSecretMasked
        isActive
        mode
      }
      paypal {
        clientId
        secretMasked
        isActive
        mode
      }
      bankTransfer {
        isActive
        iban
        bic
        accountHolder
        bankName
        reference
      }
    }
  }
`;

const UPDATE_STRIPE = gql`
  mutation UpdateStripeSettings($input: StripeSettingsInput!) {
    updateStripeSettings(input: $input) {
      isActive
    }
  }
`;

const UPDATE_PAYPAL = gql`
  mutation UpdatePaypalSettings($input: PaypalSettingsInput!) {
    updatePaypalSettings(input: $input) {
      isActive
    }
  }
`;

const UPDATE_BANK = gql`
  mutation UpdateBankTransferSettings($input: BankTransferInput!) {
    updateBankTransferSettings(input: $input) {
      isActive
    }
  }
`;

// ==================== TYPES ====================

type Tab = 'stripe' | 'paypal' | 'bank';
type PaymentMode = 'test' | 'live';
type PaypalMode = 'sandbox' | 'live';

interface StripeForm {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  mode: PaymentMode;
}

interface PaypalForm {
  clientId: string;
  secret: string;
  mode: PaypalMode;
}

interface BankForm {
  iban: string;
  bic: string;
  accountHolder: string;
  bankName: string;
  reference: string;
}

// ==================== COMPONENT ====================

export default function PaymentsSettingsPage() {
  const { data, loading, refetch } = useQuery(GET_PAYMENT_SETTINGS);

  const [updateStripe, { loading: stripeLoading }] = useMutation(UPDATE_STRIPE);
  const [updatePaypal, { loading: paypalLoading }] = useMutation(UPDATE_PAYPAL);
  const [updateBank, { loading: bankLoading }] = useMutation(UPDATE_BANK);

  const [activeTab, setActiveTab] = useState<Tab>('stripe');
  const [saved, setSaved] = useState<Tab | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [stripeForm, setStripeForm] = useState<StripeForm>({
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    mode: 'test',
  });

  const [paypalForm, setPaypalForm] = useState<PaypalForm>({
    clientId: '',
    secret: '',
    mode: 'sandbox',
  });

  const [bankForm, setBankForm] = useState<BankForm>({
    iban: '',
    bic: '',
    accountHolder: '',
    bankName: '',
    reference: '',
  });

  // Prefill existing values
  useEffect(() => {
    if (!data?.paymentSettings) return;
    const { stripe, paypal, bankTransfer } = data.paymentSettings;

    if (stripe?.publishableKey) {
      setStripeForm((prev) => ({
        ...prev,
        publishableKey: stripe.publishableKey ?? '',
        mode: (stripe.mode as PaymentMode) ?? 'test',
      }));
    }
    if (paypal?.clientId) {
      setPaypalForm((prev) => ({
        ...prev,
        clientId: paypal.clientId ?? '',
        mode: (paypal.mode as PaypalMode) ?? 'sandbox',
      }));
    }
    if (bankTransfer) {
      setBankForm({
        iban: bankTransfer.iban ?? '',
        bic: bankTransfer.bic ?? '',
        accountHolder: bankTransfer.accountHolder ?? '',
        bankName: bankTransfer.bankName ?? '',
        reference: bankTransfer.reference ?? '',
      });
    }
  }, [data]);

  const showSaved = (tab: Tab) => {
    setSaved(tab);
    setTimeout(() => setSaved(null), 3000);
  };

  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await updateStripe({
        variables: {
          input: {
            publishableKey: stripeForm.publishableKey || undefined,
            secretKey: stripeForm.secretKey || undefined,
            webhookSecret: stripeForm.webhookSecret || undefined,
            mode: stripeForm.mode,
          },
        },
      });
      await refetch();
      setStripeForm((prev) => ({ ...prev, secretKey: '', webhookSecret: '' }));
      showSaved('stripe');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    }
  };

  const handlePaypalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await updatePaypal({
        variables: {
          input: {
            clientId: paypalForm.clientId || undefined,
            secret: paypalForm.secret || undefined,
            mode: paypalForm.mode,
          },
        },
      });
      await refetch();
      setPaypalForm((prev) => ({ ...prev, secret: '' }));
      showSaved('paypal');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    }
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await updateBank({
        variables: { input: bankForm },
      });
      await refetch();
      showSaved('bank');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    }
  };

  const settings = data?.paymentSettings;

  const tabs: Array<{ key: Tab; label: string; icon: string }> = [
    {
      key: 'stripe',
      label: 'Stripe',
      icon: '💳',
    },
    {
      key: 'paypal',
      label: 'PayPal',
      icon: '🅿️',
    },
    {
      key: 'bank',
      label: 'Banküberweisung',
      icon: '🏦',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="sm">
            ← Zurück
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          💳 Zahlungseinstellungen
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Konfiguriere Zahlungsmethoden für Shop, Booking und mehr.
        </p>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
        🔒 Secret Keys werden verschlüsselt gespeichert und nach dem Speichern nicht mehr angezeigt.
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
            {settings?.[
              tab.key === 'bank' ? 'bankTransfer' : tab.key
            ]?.isActive && (
              <span className="w-2 h-2 rounded-full bg-green-500" />
            )}
          </button>
        ))}
      </div>

      {/* ==================== STRIPE ==================== */}
      {activeTab === 'stripe' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>💳 Stripe</CardTitle>
              {settings?.stripe?.isActive && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                  ✓ Aktiv
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kreditkarte, SEPA, Apple Pay, Google Pay.{' '}
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Stripe Dashboard →
              </a>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStripeSubmit} className="space-y-4">
              {/* Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modus
                </label>
                <div className="flex gap-2">
                  {(['test', 'live'] as PaymentMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setStripeForm({ ...stripeForm, mode })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        stripeForm.mode === mode
                          ? mode === 'live'
                            ? 'bg-green-600 text-white'
                            : 'bg-yellow-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {mode === 'test' ? '🧪 Test' : '🚀 Live'}
                    </button>
                  ))}
                </div>
                {stripeForm.mode === 'test' && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                    Im Test-Modus werden keine echten Zahlungen verarbeitet.
                  </p>
                )}
              </div>

              {/* Publishable Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Publishable Key
                </label>
                <input
                  type="text"
                  value={stripeForm.publishableKey}
                  onChange={(e) =>
                    setStripeForm({ ...stripeForm, publishableKey: e.target.value })
                  }
                  placeholder="pk_test_... oder pk_live_..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              {/* Secret Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Secret Key
                </label>
                <input
                  type="password"
                  value={stripeForm.secretKey}
                  onChange={(e) =>
                    setStripeForm({ ...stripeForm, secretKey: e.target.value })
                  }
                  placeholder={
                    settings?.stripe?.secretKeyMasked
                      ? `Aktuell: ${settings.stripe.secretKeyMasked}`
                      : 'sk_test_... oder sk_live_...'
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                {settings?.stripe?.secretKeyMasked && (
                  <p className="text-xs text-gray-400 mt-1">
                    Gespeichert: {settings.stripe.secretKeyMasked} — leer lassen um nicht zu ändern
                  </p>
                )}
              </div>

              {/* Webhook Secret */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Webhook Secret{' '}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="password"
                  value={stripeForm.webhookSecret}
                  onChange={(e) =>
                    setStripeForm({ ...stripeForm, webhookSecret: e.target.value })
                  }
                  placeholder={
                    settings?.stripe?.webhookSecretMasked
                      ? `Aktuell: ${settings.stripe.webhookSecretMasked}`
                      : 'whsec_...'
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={stripeLoading}>
                  {stripeLoading ? 'Speichern...' : 'Stripe speichern'}
                </Button>
                {saved === 'stripe' && (
                  <span className="text-green-600 dark:text-green-400 text-sm">
                    ✓ Gespeichert!
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ==================== PAYPAL ==================== */}
      {activeTab === 'paypal' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>🅿️ PayPal</CardTitle>
              {settings?.paypal?.isActive && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                  ✓ Aktiv
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              PayPal, Kreditkarte über PayPal.{' '}
              <a
                href="https://developer.paypal.com/dashboard/applications"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                PayPal Developer Portal →
              </a>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePaypalSubmit} className="space-y-4">
              {/* Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modus
                </label>
                <div className="flex gap-2">
                  {(['sandbox', 'live'] as PaypalMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaypalForm({ ...paypalForm, mode })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        paypalForm.mode === mode
                          ? mode === 'live'
                            ? 'bg-green-600 text-white'
                            : 'bg-yellow-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {mode === 'sandbox' ? '🧪 Sandbox' : '🚀 Live'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Client ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  value={paypalForm.clientId}
                  onChange={(e) =>
                    setPaypalForm({ ...paypalForm, clientId: e.target.value })
                  }
                  placeholder={
                    settings?.paypal?.clientId
                      ? `${settings.paypal.clientId.substring(0, 20)}...`
                      : 'AaBbCcDd...'
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              {/* Client Secret */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={paypalForm.secret}
                  onChange={(e) =>
                    setPaypalForm({ ...paypalForm, secret: e.target.value })
                  }
                  placeholder={
                    settings?.paypal?.secretMasked
                      ? `Aktuell: ${settings.paypal.secretMasked}`
                      : 'EeFfGgHh...'
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                {settings?.paypal?.secretMasked && (
                  <p className="text-xs text-gray-400 mt-1">
                    Gespeichert: {settings.paypal.secretMasked} — leer lassen um nicht zu ändern
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={paypalLoading}>
                  {paypalLoading ? 'Speichern...' : 'PayPal speichern'}
                </Button>
                {saved === 'paypal' && (
                  <span className="text-green-600 dark:text-green-400 text-sm">
                    ✓ Gespeichert!
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ==================== BANK ==================== */}
      {activeTab === 'bank' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>🏦 Banküberweisung</CardTitle>
              {settings?.bankTransfer?.isActive && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                  ✓ Aktiv
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kunden überweisen manuell. Bestellungen werden erst nach Zahlungseingang bearbeitet.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBankSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kontoinhaber <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bankForm.accountHolder}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, accountHolder: e.target.value })
                  }
                  placeholder="Max Mustermann / Firma GmbH"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IBAN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bankForm.iban}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, iban: e.target.value.toUpperCase() })
                  }
                  placeholder="DE89 3704 0044 0532 0130 00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    BIC
                  </label>
                  <input
                    type="text"
                    value={bankForm.bic}
                    onChange={(e) =>
                      setBankForm({ ...bankForm, bic: e.target.value.toUpperCase() })
                    }
                    placeholder="COBADEFFXXX"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bank
                  </label>
                  <input
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) =>
                      setBankForm({ ...bankForm, bankName: e.target.value })
                    }
                    placeholder="Commerzbank"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Verwendungszweck{' '}
                  <span className="text-gray-400 font-normal text-xs">
                    ({'{orderNumber}'} wird durch Bestellnummer ersetzt)
                  </span>
                </label>
                <input
                  type="text"
                  value={bankForm.reference}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, reference: e.target.value })
                  }
                  placeholder="Bestellung {orderNumber}"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={bankLoading}>
                  {bankLoading ? 'Speichern...' : 'Bankdaten speichern'}
                </Button>
                {saved === 'bank' && (
                  <span className="text-green-600 dark:text-green-400 text-sm">
                    ✓ Gespeichert!
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Hinweise */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
          💡 Hinweise
        </p>
        <p>
          • Stripe und PayPal: Zahlungen gehen direkt auf dein Konto — wir
          erhalten keine Provision.
        </p>
        <p>
          • Banküberweisung: Bestellungen müssen nach Zahlungseingang manuell
          bestätigt werden.
        </p>
        <p>• Mehrere Methoden können gleichzeitig aktiv sein.</p>
      </div>
    </div>
  );
}