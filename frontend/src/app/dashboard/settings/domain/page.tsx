'use client';

/**frontend\src\app\dashboard\settings\domain\page.tsx
 * ==================== DOMAIN MANAGEMENT PAGE ====================
 * Dashboard → Einstellungen → Domain
 * 
 * Features:
 * - Custom Domain eingeben
 * - DNS-Anweisungen anzeigen (copy-to-clipboard)
 * - Verifizierung auslösen
 * - Status-Anzeige (DNS, SSL)
 * - Domain entfernen
 * 
 * Pfad: /frontend/src/app/dashboard/settings/domain/page.tsx
 * ODER: Als Component in /dashboard/settings/page.tsx einbinden
 */

import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

// ========== GRAPHQL ==========

const GET_DOMAIN_STATUS = gql`
  query DomainStatus {
    domainStatus {
      customDomain
      verified
      dnsValid
      sslStatus
      sslExpiresAt
      verificationToken
      lastDnsCheck
      dnsInstructions {
        type
        name
        value
        purpose
        required
      }
    }
  }
`;

const ADD_DOMAIN = gql`
  mutation AddCustomDomain($domain: String!) {
    addCustomDomain(domain: $domain) {
      domain
      verificationToken
      dnsInstructions {
        type
        name
        value
        purpose
        required
      }
    }
  }
`;

const REMOVE_DOMAIN = gql`
  mutation RemoveCustomDomain {
    removeCustomDomain
  }
`;

const VERIFY_DOMAIN = gql`
  mutation VerifyDomain {
    verifyDomain {
      verified
      txtValid
      cnameValid
      aValid
      errors
    }
  }
`;

// ========== COMPONENT ==========

export default function DomainSettingsPage() {
  const [newDomain, setNewDomain] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const { data, loading, refetch } = useQuery(GET_DOMAIN_STATUS);
  const [addDomain, { loading: addLoading }] = useMutation(ADD_DOMAIN);
  const [removeDomain, { loading: removeLoading }] = useMutation(REMOVE_DOMAIN);
  const [verifyDomain, { loading: verifyLoading }] = useMutation(VERIFY_DOMAIN);

  const status = data?.domainStatus;
  const hasDomain = !!status?.customDomain;

  // ========== HANDLERS ==========

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    try {
      await addDomain({ variables: { domain: newDomain.trim() } });
      setNewDomain('');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Fehler beim Hinzufügen der Domain');
    }
  };

  const handleRemoveDomain = async () => {
    try {
      await removeDomain();
      setShowRemoveConfirm(false);
      setVerifyResult(null);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Fehler beim Entfernen der Domain');
    }
  };

  const handleVerify = async () => {
    try {
      const { data } = await verifyDomain();
      setVerifyResult(data?.verifyDomain);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Fehler bei der Verifizierung');
    }
  };

  // ========== RENDER ==========

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Custom Domain</h1>
        <p className="text-gray-500 mt-1">Verbinde deine eigene Domain mit deiner Website</p>
      </div>

      {/* Status Overview */}
      {hasDomain && (
        <div className="mb-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Aktuelle Domain</p>
              <p className="text-xl font-bold text-gray-900">{status.customDomain}</p>
            </div>
            <button
              onClick={() => setShowRemoveConfirm(true)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Entfernen
            </button>
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-3 gap-3">
            <StatusBadge
              label="DNS"
              status={status.dnsValid ? 'success' : 'pending'}
              text={status.dnsValid ? 'Verbunden' : 'Ausstehend'}
            />
            <StatusBadge
              label="Verifizierung"
              status={status.verified ? 'success' : 'pending'}
              text={status.verified ? 'Bestätigt' : 'Ausstehend'}
            />
            <StatusBadge
              label="SSL"
              status={
                status.sslStatus === 'active' ? 'success' :
                status.sslStatus === 'pending' ? 'pending' : 'inactive'
              }
              text={
                status.sslStatus === 'active' ? 'Aktiv' :
                status.sslStatus === 'pending' ? 'Wird erstellt...' : 'Nicht aktiv'
              }
            />
          </div>

          {status.lastDnsCheck && (
            <p className="text-xs text-gray-400 mt-3">
              Letzter Check: {new Date(status.lastDnsCheck).toLocaleString('de-DE')}
            </p>
          )}
        </div>
      )}

      {/* Add Domain Form */}
      {!hasDomain && (
        <form onSubmit={handleAddDomain} className="mb-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Domain hinzufügen</h3>
          <p className="text-sm text-gray-500 mb-4">
            Gib deine Domain ein (z.B. meine-website.de). Du kannst sie danach per DNS-Records verbinden.
          </p>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="meine-website.de"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 
                       focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              type="submit"
              disabled={addLoading || !newDomain.trim()}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       transition-colors disabled:opacity-50 font-medium"
            >
              {addLoading ? 'Wird hinzugefügt...' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      )}

      {/* DNS Instructions */}
      {hasDomain && status.dnsInstructions?.length > 0 && (
        <div className="mb-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">DNS-Einstellungen</h3>
          <p className="text-sm text-gray-500 mb-4">
            Setze diese DNS-Records bei deinem Domain-Anbieter (z.B. Hetzner, IONOS, Cloudflare)
          </p>

          <div className="space-y-3">
            {status.dnsInstructions.map((instruction: any, i: number) => (
              <div
                key={i}
                className={`p-4 rounded-lg border ${
                  instruction.required 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    instruction.type === 'TXT' ? 'bg-purple-100 text-purple-700' :
                    instruction.type === 'CNAME' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {instruction.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {instruction.required ? '(Pflicht)' : '(Optional)'}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">{instruction.purpose}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 block mb-0.5">Name / Host</span>
                    <CopyField value={instruction.name} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-0.5">Wert / Value</span>
                    <CopyField value={instruction.value} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Verify Button */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleVerify}
              disabled={verifyLoading}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 
                       transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {verifyLoading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <span>🔍</span>
              )}
              DNS überprüfen
            </button>
            
            <p className="text-xs text-gray-400">
              DNS-Änderungen können bis zu 48 Stunden dauern
            </p>
          </div>

          {/* Verify Result */}
          {verifyResult && (
            <div className={`mt-4 p-4 rounded-lg border ${
              verifyResult.verified 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              {verifyResult.verified ? (
                <div className="flex items-center gap-2 text-green-700">
                  <span className="text-lg">✅</span>
                  <span className="font-medium">Domain erfolgreich verifiziert! SSL wird automatisch eingerichtet.</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-yellow-700 mb-2">
                    <span className="text-lg">⚠️</span>
                    <span className="font-medium">Verifizierung noch nicht abgeschlossen</span>
                  </div>
                  <div className="space-y-1 text-sm text-yellow-600">
                    <p>TXT Record: {verifyResult.txtValid ? '✅' : '❌'}</p>
                    <p>CNAME Record: {verifyResult.cnameValid ? '✅' : '❌'}</p>
                    {verifyResult.errors?.length > 0 && (
                      <div className="mt-2 text-xs">
                        {verifyResult.errors.map((err: string, i: number) => (
                          <p key={i} className="text-yellow-700">• {err}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Remove Confirmation */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Domain entfernen?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Die Domain <strong>{status?.customDomain}</strong> wird getrennt. 
              Deine Website ist danach nur noch über die Subdomain erreichbar.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Abbrechen
              </button>
              <button
                onClick={handleRemoveDomain}
                disabled={removeLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {removeLoading ? 'Wird entfernt...' : 'Entfernen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">💡 So funktioniert's</p>
        <p>
          1. Gib deine Domain ein → 2. Setze die DNS-Records bei deinem Anbieter → 
          3. Klick auf "DNS überprüfen" → 4. SSL wird automatisch eingerichtet. 
          Deine Website ist danach unter deiner eigenen Domain erreichbar.
        </p>
      </div>
    </div>
  );
}

// ========== SUB-COMPONENTS ==========

function StatusBadge({ label, status, text }: {
  label: string;
  status: 'success' | 'pending' | 'inactive';
  text: string;
}) {
  const colors = {
    success: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    inactive: 'bg-gray-100 text-gray-500 border-gray-200',
  };
  const dots = {
    success: 'bg-green-500',
    pending: 'bg-yellow-500 animate-pulse',
    inactive: 'bg-gray-400',
  };

  return (
    <div className={`p-3 rounded-lg border ${colors[status]}`}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className={`w-2 h-2 rounded-full ${dots[status]}`} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold">{text}</span>
    </div>
  );
}

function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-200 
                 rounded cursor-pointer hover:border-gray-300 transition-colors group"
    >
      <code className="text-xs text-gray-800 truncate flex-1">{value}</code>
      <span className="text-xs text-gray-400 group-hover:text-blue-500 flex-shrink-0">
        {copied ? '✓' : '📋'}
      </span>
    </div>
  );
}