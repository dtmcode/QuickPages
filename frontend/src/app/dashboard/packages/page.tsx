// 📂 PFAD: frontend/src/app/dashboard/packages/page.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePackage } from '@/contexts/package-context';
import { useMutation, gql } from '@apollo/client';
import { PackageTiers, TierDef, CategoryDef, PACKAGE_CATEGORIES } from '@/components/packages/PackageTiers';

const CHANGE_PACKAGE = gql`
  mutation ChangePackage($targetPackage: String!, $successUrl: String, $cancelUrl: String) {
    changePackage(targetPackage: $targetPackage, successUrl: $successUrl, cancelUrl: $cancelUrl) {
      url
      isDirect
    }
  }
`;

const CREATE_ADDON_CHECKOUT = gql`
  mutation CreateAddonCheckout($addonType: String!, $successUrl: String, $cancelUrl: String) {
    createAddonCheckout(addonType: $addonType, successUrl: $successUrl, cancelUrl: $cancelUrl) {
      url
      isDirect
    }
  }
`;

const CREATE_BILLING_PORTAL = gql`
  mutation CreateBillingPortalSession($returnUrl: String!) {
    createBillingPortalSession(returnUrl: $returnUrl)
  }
`;

const ADDONS = [
  { type: 'shop_module',      name: 'Shop-Modul',        icon: '🛒', price: 1900, description: '100 Produkte, Warenkorb, Stripe-Zahlung',   for: 'Website, Blog, Business, Mitglieder' },
  { type: 'booking_module',   name: 'Booking-Modul',     icon: '📅', price: 1200, description: '5 Services, Kalender, Bestätigungs-Mails', for: 'Website, Blog, Shop, Mitglieder' },
  { type: 'blog_module',      name: 'Blog-Modul',        icon: '✍️', price: 900,  description: '100 Blog-Beiträge mit Kommentaren',        for: 'Website, Shop, Mitglieder' },
  { type: 'members_module',   name: 'Mitglieder-Modul',  icon: '🔐', price: 1900, description: '100 Mitglieder + Download-Bereich',         for: 'Alle Pakete' },
  { type: 'newsletter_extra', name: 'Newsletter +1.000', icon: '📧', price: 900,  description: '+1.000 Newsletter-Abonnenten',              for: 'Alle Pakete' },
  { type: 'ai_content',       name: 'AI Content',        icon: '🤖', price: 1400, description: '200 AI-Credits/Monat',                      for: 'Alle Pakete' },
  { type: 'extra_pages',      name: '+10 Seiten',         icon: '📄', price: 500,  description: '10 weitere Seiten',                         for: 'Alle Pakete' },
  { type: 'extra_users',      name: '+1 Benutzer',        icon: '👤', price: 400,  description: 'Weiteres Team-Mitglied',                    for: 'Alle Pakete' },
  { type: 'i18n',             name: 'Mehrsprachigkeit',  icon: '🌍', price: 900,  description: 'Website in bis zu 13 Sprachen',             for: 'Alle Pakete' },
];

export default function PackagesPage() {
  const { user, tenant, updateTenant } = useAuth();
  const { currentPackage, isSuperAdmin } = usePackage();

  const [activeTab, setActiveTab] = useState<'packages' | 'addons'>('packages');
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);
  const [loadingAddon, setLoadingAddon] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ tier: TierDef; category: CategoryDef } | null>(null);

  const [changePackageMutation] = useMutation(CHANGE_PACKAGE);
  const [createAddonCheckout] = useMutation(CREATE_ADDON_CHECKOUT);
  const [createBillingPortal] = useMutation(CREATE_BILLING_PORTAL);

  const isOwner = user?.role?.toUpperCase() === 'OWNER';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // Success/Cancel aus URL
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const showSuccess = params?.get('success') === 'true';
  const showCancelled = params?.get('cancelled') === 'true';
  const showAddonSuccess = params?.get('addon_success') === 'true';

  // ==================== HANDLERS ====================

  const handleSelectPackage = (tier: TierDef, category: CategoryDef) => {
    if (!isOwner || tier.type === currentPackage) return;
    setConfirmModal({ tier, category });
  };

  const handleConfirmPackage = async () => {
    if (!confirmModal) return;
    const { tier } = confirmModal;
    setLoadingPackage(tier.type);
    setConfirmModal(null);

    try {
      const { data } = await changePackageMutation({
        variables: {
          targetPackage: tier.type,
          successUrl: `${baseUrl}/dashboard/packages?success=true&package=${tier.type}`,
          cancelUrl: `${baseUrl}/dashboard/packages?cancelled=true`,
        },
      });

      const result = data.changePackage;

      if (result.isDirect) {
        // Super-Admin / Demo → direkt gewechselt
        if (tenant) updateTenant({ ...tenant, package: tier.type as any });
        setTimeout(() => window.location.reload(), 500);
      } else {
        // → Stripe Checkout
        window.location.href = result.url;
      }
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setLoadingPackage(null);
    }
  };

  const handleAddonCheckout = async (addonType: string) => {
    if (!isOwner) return;
    setLoadingAddon(addonType);
    try {
      const { data } = await createAddonCheckout({
        variables: {
          addonType,
          successUrl: `${baseUrl}/dashboard/packages?addon_success=true&addon=${addonType}`,
          cancelUrl: `${baseUrl}/dashboard/packages`,
        },
      });
      const result = data.createAddonCheckout;
      if (result.isDirect) {
        alert('✅ Add-on aktiviert!');
        window.location.reload();
      } else {
        window.location.href = result.url;
      }
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setLoadingAddon(null);
    }
  };

  const handleBillingPortal = async () => {
    try {
      const { data } = await createBillingPortal({
        variables: { returnUrl: `${baseUrl}/dashboard/packages` },
      });
      window.location.href = data.createBillingPortalSession;
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">

      {/* BANNERS */}
      {showSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-xl text-green-800 dark:text-green-300 font-semibold">
          🎉 Zahlung erfolgreich! Dein neues Paket ist aktiv.
        </div>
      )}
      {showAddonSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-xl text-green-800 dark:text-green-300 font-semibold">
          ✅ Add-on erfolgreich aktiviert!
        </div>
      )}
      {showCancelled && (
        <div className="p-4 bg-muted border border-border rounded-xl text-muted-foreground">
          Bezahlung abgebrochen — dein Paket bleibt unverändert.
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Pakete & Add-ons</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Aktuell:{' '}
            <strong className="text-foreground capitalize">
              {currentPackage.replace('_', ' ')}
            </strong>
            {isSuperAdmin && (
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                ⭐ Platform Admin
              </span>
            )}
          </p>
        </div>
        {!isSuperAdmin && (
          <button
            onClick={handleBillingPortal}
            className="text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl px-4 py-2.5 hover:bg-muted transition-all"
          >
            🧾 Rechnungen & Zahlungsmethode
          </button>
        )}
      </div>

      {!isOwner && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-amber-800 dark:text-amber-300 text-sm">
          ⚠️ Nur der Owner kann Pakete und Add-ons verwalten.
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {(['packages', 'addons'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === tab
                ? 'bg-card text-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'packages' ? '📦 Pakete' : '➕ Add-ons'}
          </button>
        ))}
      </div>

      {/* ===== PACKAGES TAB — shared component ===== */}
      {activeTab === 'packages' && (
        <PackageTiers
          mode="dashboard"
          currentPackage={currentPackage}
          isSuperAdmin={isSuperAdmin}
          isOwner={isOwner}
          onSelectPackage={handleSelectPackage}
          loadingPackage={loadingPackage}
          showAlwaysIncluded
        />
      )}

      {/* ===== ADD-ONS TAB ===== */}
      {activeTab === 'addons' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">Add-ons</h2>
            <p className="text-muted-foreground">
              Erweitere jedes Paket mit den Modulen die du brauchst — monatlich kündbar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADDONS.map(addon => (
              <div
                key={addon.type}
                className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{addon.icon}</span>
                    <div>
                      <h3 className="font-bold text-foreground text-sm">{addon.name}</h3>
                      <p className="text-xs text-muted-foreground">{addon.for}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-foreground">€{(addon.price / 100).toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">/Monat</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{addon.description}</p>
                <button
                  onClick={() => handleAddonCheckout(addon.type)}
                  disabled={!isOwner || loadingAddon !== null}
                  className="w-full py-2 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingAddon === addon.type ? (
                    <>
                      <div className="w-3 h-3 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                      Weiterleitung…
                    </>
                  ) : (
                    'Hinzufügen →'
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-5 bg-muted/30 rounded-2xl text-sm text-muted-foreground">
            <strong className="text-foreground">Beispiel:</strong> Du hast das Website Starter-Paket
            und willst auch Termine anbieten? Buche das{' '}
            <strong className="text-foreground">Booking-Modul (+€12/Monat)</strong> dazu.
          </div>
        </div>
      )}

      {/* INFO */}
      <div className="border border-border rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-3">ℹ️ Wichtige Informationen</h3>
        <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div>• Upgrades jederzeit möglich</div>
          <div>• Kündigung zum Ende des Monats</div>
          <div>• Add-ons monatlich kündbar</div>
          <div>• Alle Preise zzgl. MwSt.</div>
          <div>• Sichere Zahlung via Stripe</div>
          <div>• Rechnungen im Billing Portal</div>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-foreground mb-2">Paket wählen</h3>
            <p className="text-muted-foreground mb-1">
              Du wählst:{' '}
              <strong className="text-foreground">
                {confirmModal.category.label} {confirmModal.tier.name}
              </strong>
            </p>
            <p className="text-3xl font-bold text-foreground mb-1">
              €{(confirmModal.tier.priceMonthly / 100).toFixed(0)}
              <span className="text-base font-normal text-muted-foreground">/Monat</span>
            </p>
            <p className="text-xs text-muted-foreground mb-6">zzgl. MwSt. · monatlich kündbar</p>

            {!isSuperAdmin && (
              <div className="bg-muted/50 rounded-xl p-3 mb-6 text-sm text-muted-foreground">
                Du wirst zu Stripe weitergeleitet. Das Paket wird sofort nach erfolgreicher Zahlung aktiviert.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirmPackage}
                className={`flex-1 py-3 bg-gradient-to-r ${confirmModal.category.gradient} text-white rounded-xl font-bold hover:opacity-90 transition-all`}
              >
                {isSuperAdmin ? 'Direkt aktivieren' : '🔒 Weiter zu Stripe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}