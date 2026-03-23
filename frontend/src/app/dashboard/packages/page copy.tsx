'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UpgradeModal } from '@/components/upgrade-modal';
import { DowngradeModal } from '@/components/downgrade-modal';

const AVAILABLE_PACKAGES_QUERY = gql`
  query AvailablePackages {
    availablePackages {
      packages {
        type
        name
        description
        price
        limits {
          users
          posts
          pages
          products
          emailsPerMonth
        }
        features
      }
      addons {
        type
        name
        description
        price
        limits {
          users
          posts
          pages
          products
          emailsPerMonth
        }
      }
    }
  }
`;

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
      addons {
        id
        addonType
        quantity
        isActive
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

const CHANGE_PACKAGE = gql`
  mutation ChangePackage($targetPackage: String!) {
    changePackage(targetPackage: $targetPackage)
  }
`;

const ACTIVATE_ADDON = gql`
  mutation ActivateAddon($addonType: String!, $quantity: Int) {
    activateAddon(addonType: $addonType, quantity: $quantity)
  }
`;

const DEACTIVATE_ADDON = gql`
  mutation DeactivateAddon($addonType: String!) {
    deactivateAddon(addonType: $addonType)
  }
`;

export default function PackagesPage() {
  const router = useRouter();
  const { user, isAuthenticated, tenant, updateTenant } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'packages' | 'addons'>('packages');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [downgradeModalOpen, setDowngradeModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const { data: packagesData, loading: packagesLoading } = useQuery(AVAILABLE_PACKAGES_QUERY);
  const { data: subscriptionData, loading: subscriptionLoading, refetch } = useQuery(
    TENANT_SUBSCRIPTION_QUERY,
    {
      skip: !isAuthenticated,
    }
  );
  const [changePackage, { loading: changing }] = useMutation(CHANGE_PACKAGE);
  const [activateAddon, { loading: activating }] = useMutation(ACTIVATE_ADDON);
  const [deactivateAddon, { loading: deactivating }] = useMutation(DEACTIVATE_ADDON);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const isOwner = user?.role?.toUpperCase() === 'OWNER';
  const currentPackage = subscriptionData?.tenantSubscription?.currentPackage;

  const formatPrice = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  // Package Click Handler - prüft ob Upgrade oder Downgrade
  const handlePackageClick = (pkg: any) => {
    if (!isOwner) {
      alert('Nur der Owner kann das Package ändern');
      return;
    }

    const packages = packagesData?.availablePackages?.packages || [];
    const currentIndex = packages.findIndex((p: any) => p.type === currentPackage);
    const targetIndex = packages.findIndex((p: any) => p.type === pkg.type);
    
    const isDowngrade = currentIndex > targetIndex;

    setSelectedPackage(pkg);
    
    if (isDowngrade) {
      setDowngradeModalOpen(true);
    } else {
      setUpgradeModalOpen(true);
    }
  };

  // Package Change Handler - für beide Modals
  const handlePackageChange = async () => {
    try {
      await changePackage({ 
        variables: { targetPackage: selectedPackage.type } 
      });
      
      if (tenant) {
        updateTenant({
          ...tenant,
          package: selectedPackage.type,
        });
      }
      
      await refetch();
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fehler beim Ändern';
      alert('❌ ' + message);
      setUpgradeModalOpen(false);
      setDowngradeModalOpen(false);
      throw error;
    }
  };

  const handleModalClose = () => {
    setUpgradeModalOpen(false);
    setDowngradeModalOpen(false);
    setSelectedPackage(null);
    refetch();
  };

  const handleAddonToggle = async (addonType: string, isActive: boolean) => {
    if (!isOwner) {
      alert('Nur der Owner kann Add-ons verwalten');
      return;
    }

    try {
      if (isActive) {
        await deactivateAddon({ variables: { addonType } });
        alert('✅ Add-on deaktiviert!');
      } else {
        await activateAddon({ variables: { addonType, quantity: 1 } });
        alert('✅ Add-on aktiviert!');
      }
      await refetch();
      window.location.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fehler beim Aktivieren/Deaktivieren';
      alert('❌ ' + message);
    }
  };

  const isAddonActive = (addonType: string) => {
    return subscriptionData?.tenantSubscription?.addons?.some(
      (a: { addonType: string; isActive: boolean }) => a.addonType === addonType && a.isActive
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  if (packagesLoading || subscriptionLoading) {
    return <div className="text-center py-12">Lädt...</div>;
  }

  const packages = packagesData?.availablePackages?.packages || [];
  const addons = packagesData?.availablePackages?.addons || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="sm">← Zurück zu Einstellungen</Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          📦 Packages & Add-ons
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Wähle das passende Package für dein Business
        </p>
      </div>

      {!isOwner && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
              <span>⚠️</span>
              <span className="font-medium">
                Nur der Owner kann Packages und Add-ons verwalten
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setSelectedTab('packages')}
          className={`px-4 py-2 font-medium transition-colors ${
            selectedTab === 'packages'
              ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600 dark:border-cyan-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Packages
        </button>
        <button
          onClick={() => setSelectedTab('addons')}
          className={`px-4 py-2 font-medium transition-colors ${
            selectedTab === 'addons'
              ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600 dark:border-cyan-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Add-ons
        </button>
      </div>

      {/* Packages Tab */}
      {selectedTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg: { type: string; name: string; description: string; price: number; features: string[] }) => {
            const isCurrent = currentPackage === pkg.type;
            const currentIndex = packages.findIndex((p: { type: string }) => p.type === currentPackage);
            const targetIndex = packages.findIndex((p: { type: string }) => p.type === pkg.type);
            const isDowngrade = currentIndex > targetIndex;

            return (
              <Card
                key={pkg.type}
                className={`relative ${
                  isCurrent
                    ? 'border-2 border-cyan-500 ring-2 ring-cyan-200 dark:ring-cyan-800'
                    : 'border-gray-200 dark:border-gray-700'
                } ${pkg.type === 'business' ? 'md:scale-105 z-10' : ''}`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-cyan-600 text-white text-xs font-medium rounded-full">
                      Aktuell
                    </span>
                  </div>
                )}
                {pkg.type === 'business' && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                      ⭐ Beliebt
                    </span>
                  </div>
                )}

                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {pkg.description}
                    </p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(pkg.price)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">/Monat</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {pkg.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {isCurrent ? (
                      <Button fullWidth disabled>
                        Aktuelles Package
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant={isDowngrade ? 'ghost' : 'primary'}
                        onClick={() => handlePackageClick(pkg)}
                        disabled={changing || !isOwner}
                      >
                        {isDowngrade ? `Downgrade auf ${pkg.name}` : `Upgrade auf ${pkg.name}`}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add-ons Tab */}
      {selectedTab === 'addons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addons.map((addon: { type: string; name: string; description: string; price: number; limits: { products: number; emailsPerMonth: number; users: number } }) => {
            const active = isAddonActive(addon.type);

            return (
              <Card
                key={addon.type}
                className={`${
                  active
                    ? 'border-2 border-green-500 bg-green-50 dark:bg-green-900/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {addon.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {addon.description}
                      </p>
                    </div>
                    {active && (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                        Aktiv
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(addon.price)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">/Monat</span>
                  </div>

                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Zusätzliche Limits:
                    </div>
                    <div className="space-y-1">
                      {addon.limits.products > 0 && (
                        <div className="text-sm">
                          📦 {addon.limits.products === -1 ? 'Unbegrenzte' : addon.limits.products} Produkte
                        </div>
                      )}
                      {addon.limits.emailsPerMonth > 0 && (
                        <div className="text-sm">
                          📧 {addon.limits.emailsPerMonth.toLocaleString()} Emails/Monat
                        </div>
                      )}
                      {addon.limits.users > 0 && (
                        <div className="text-sm">
                          👥 +{addon.limits.users} Benutzer
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    fullWidth
                    variant={active ? 'ghost' : 'primary'}
                    onClick={() => handleAddonToggle(addon.type, active)}
                    disabled={activating || deactivating || !isOwner}
                  >
                    {active ? 'Deaktivieren' : 'Aktivieren'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <Card className="border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/10">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            ℹ️ Wichtige Informationen
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>• Upgrades und Downgrades sind jederzeit möglich</li>
            <li>• Änderungen werden sofort wirksam (Demo-Modus)</li>
            <li>• Add-ons können monatlich hinzugefügt oder entfernt werden</li>
            <li>• Alle Preise verstehen sich zzgl. MwSt.</li>
            <li>• Bei Fragen kontaktiere unseren Support</li>
          </ul>
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      {selectedPackage && (
        <UpgradeModal
          isOpen={upgradeModalOpen}
          onClose={handleModalClose}
          currentPackage={currentPackage || 'starter'}
          targetPackage={selectedPackage}
          onConfirm={handlePackageChange}
          isLoading={changing}
        />
      )}

      {/* Downgrade Modal */}
      {selectedPackage && (
        <DowngradeModal
          isOpen={downgradeModalOpen}
          onClose={handleModalClose}
          currentPackage={currentPackage || 'starter'}
          targetPackage={selectedPackage}
          onConfirm={handlePackageChange}
          isLoading={changing}
        />
      )}
    </div>
  );
}