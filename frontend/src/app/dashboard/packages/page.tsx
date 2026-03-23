'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UpgradeModal } from '@/components/upgrade-modal';
import { DowngradeModal } from '@/components/downgrade-modal';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql';

interface PackageDef {
  type: string;
  name: string;
  price: number;
  target: string;
  description: string;
  features: string[];
  limits: {
    users: number;
    posts: number;
    pages: number;
    products: number;
    subscribers: number;
    storage: string;
  };
}

interface AddonDef {
  type: string;
  name: string;
  price: number;
  description: string;
  availableFrom: string[];
}

const PACKAGES: PackageDef[] = [
  {
    type: 'page',
    name: 'Page',
    price: 900,
    target: 'Freelancer, Einzelpersonen',
    description: 'Eine professionelle Landing Page mit eigenem Design.',
    features: [
      '1 Landing Page',
      'Website Builder (Drag & Drop)',
      '1 Kontaktformular',
      'Basis-Analytics',
      'SEO Grundlagen',
      'SSL Zertifikat',
    ],
    limits: { users: 1, posts: 0, pages: 1, products: 0, subscribers: 0, storage: '100 MB' },
  },
  {
    type: 'landing',
    name: 'Landing',
    price: 1900,
    target: 'Startups, Kampagnen',
    description: 'Bis zu 3 Seiten mit eigenem Design und Domain.',
    features: [
      '3 Landing Pages',
      'Eigene Domain',
      'Kontaktformular',
      'Basis-Analytics',
      'SEO Grundlagen',
      'SSL Zertifikat',
    ],
    limits: { users: 1, posts: 0, pages: 3, products: 0, subscribers: 0, storage: '500 MB' },
  },
  {
    type: 'creator',
    name: 'Creator',
    price: 2900,
    target: 'Blogger, Berater, Portfolios',
    description: 'Mehrere Seiten, Blog mit Kommentaren und eigene Domain.',
    features: [
      'Bis zu 10 Seiten',
      'Blog mit 50 Beiträgen',
      'Blog-Kommentare',
      'Eigene Domain',
      '3 Kontaktformulare',
      'Kein QuickPages-Branding',
    ],
    limits: { users: 2, posts: 50, pages: 10, products: 0, subscribers: 0, storage: '1 GB' },
  },
  {
    type: 'business',
    name: 'Business',
    price: 4900,
    target: 'Dienstleister, Coaches, Handwerker',
    description: 'Blog, Newsletter, Terminbuchung, Formulare und E-Mail-System.',
    features: [
      '30 Seiten',
      '200 Blog-Beiträge',
      'Newsletter (1.000 Abonnenten)',
      'Booking System',
      'Form Builder',
      'E-Mail-System (SMTP)',
      'Erweiterte Analytics',
    ],
    limits: { users: 5, posts: 200, pages: 30, products: 0, subscribers: 1000, storage: '5 GB' },
  },
  {
    type: 'shop',
    name: 'Shop',
    price: 7900,
    target: 'Online-Shops, Händler',
    description: 'Vollständiges Shop-System mit Stripe-Zahlungen.',
    features: [
      '200 Produkte',
      'Stripe Payments',
      'Bestellverwaltung',
      'Newsletter (3.000 Abonnenten)',
      '50 Seiten',
      '500 Blog-Beiträge',
    ],
    limits: { users: 10, posts: 500, pages: 50, products: 200, subscribers: 3000, storage: '10 GB' },
  },
  {
    type: 'professional',
    name: 'Professional',
    price: 12900,
    target: 'Agenturen, wachsende Unternehmen',
    description: 'Alle Features inklusive: AI, Mehrsprachigkeit, großer Shop.',
    features: [
      'AI Content (500 Anfragen/Monat)',
      'Mehrsprachigkeit (13 Sprachen)',
      '1.000 Produkte',
      '10.000 Newsletter-Abonnenten',
      '100 Seiten',
      'Eigene Templates',
      'Dedizierter Support',
    ],
    limits: { users: 25, posts: 1000, pages: 100, products: 1000, subscribers: 10000, storage: '25 GB' },
  },
  {
    type: 'enterprise',
    name: 'Enterprise',
    price: 24900,
    target: 'Agenturen, Konzerne',
    description: 'Unbegrenzte Ressourcen, White-Label, dedizierter Account Manager.',
    features: [
      'Alles aus Professional',
      'White-Label (kein Branding)',
      'Unbegrenzte Seiten & Produkte',
      '100.000 Newsletter-Abonnenten',
      '2.000 AI Credits/Monat',
      'Unbegrenzter Speicher',
      'Dedizierter Account Manager',
    ],
    limits: { users: -1, posts: -1, pages: -1, products: -1, subscribers: -1, storage: 'Unbegrenzt' },
  },
];

const ADDONS: AddonDef[] = [
  { type: 'shop_module', name: 'Shop Modul', price: 1500, description: 'Produkte verkaufen mit Warenkorb und Bestellverwaltung.', availableFrom: ['business'] },
  { type: 'newsletter', name: 'Newsletter', price: 900, description: 'E-Mail-Kampagnen an bis zu 500 Empfänger.', availableFrom: ['creator'] },
  { type: 'booking', name: 'Booking System', price: 900, description: 'Online-Terminbuchung mit Kalender und Bestätigungen.', availableFrom: ['creator'] },
  { type: 'ai_content', name: 'AI Content', price: 900, description: 'KI-Texte, Verbesserungen, Übersetzungen.', availableFrom: ['business', 'shop'] },
  { type: 'form_builder', name: 'Form Builder', price: 500, description: 'Beliebige Formulare mit 10 Feldtypen.', availableFrom: ['creator'] },
  { type: 'i18n', name: 'Mehrsprachigkeit', price: 500, description: 'Website in bis zu 13 Sprachen.', availableFrom: ['business', 'shop'] },
  { type: 'extra_users', name: 'Extra Benutzer', price: 300, description: 'Zusätzlicher Team-Account.', availableFrom: ['page', 'landing', 'creator', 'business', 'shop', 'professional'] },
];

const PACKAGE_ORDER = ['page', 'landing', 'creator', 'business', 'shop', 'professional', 'enterprise'];

function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

function getPackageIndex(type: string): number {
  return PACKAGE_ORDER.indexOf(type);
}

export default function PackagesPage() {
  const router = useRouter();
  const { user, isAuthenticated, tenant, updateTenant } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'packages' | 'addons'>('packages');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [downgradeModalOpen, setDowngradeModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageDef | null>(null);
  const [changing, setChanging] = useState(false);
  const [activeAddons, setActiveAddons] = useState<string[]>([]);
  const [addonLoading, setAddonLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const rawPackage = tenant?.package || 'page';
  const currentPackage = PACKAGE_ORDER.includes(rawPackage) ? rawPackage : 'page';
  const isOwner = user?.role?.toUpperCase() === 'OWNER';

  const handlePackageClick = (pkg: PackageDef) => {
    if (!isOwner) {
      alert('Nur der Owner kann das Package ändern');
      return;
    }
    if (pkg.type === currentPackage) return;
    setSelectedPackage(pkg);
    if (getPackageIndex(pkg.type) < getPackageIndex(currentPackage)) {
      setDowngradeModalOpen(true);
    } else {
      setUpgradeModalOpen(true);
    }
  };

  const handlePackageChange = async () => {
    if (!selectedPackage) return;
    setChanging(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: `mutation ChangePackage($targetPackage: String!) { changePackage(targetPackage: $targetPackage) }`,
          variables: { targetPackage: selectedPackage.type },
        }),
      });
      const data = await res.json();
      if (data.errors) throw new Error(data.errors[0]?.message || 'Fehler');
      if (tenant) updateTenant({ ...tenant, package: selectedPackage.type });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fehler beim Ändern';
      alert('❌ ' + message);
      setUpgradeModalOpen(false);
      setDowngradeModalOpen(false);
      throw error;
    } finally {
      setChanging(false);
    }
  };

  const handleModalClose = () => {
    setUpgradeModalOpen(false);
    setDowngradeModalOpen(false);
    setSelectedPackage(null);
  };

  const handleAddonToggle = async (addonType: string) => {
    if (!isOwner) {
      alert('Nur der Owner kann Add-ons verwalten');
      return;
    }
    const isActive = activeAddons.includes(addonType);
    setAddonLoading(addonType);
    try {
      const token = localStorage.getItem('accessToken');
      const mutation = isActive
        ? `mutation { deactivateAddon(addonType: "${addonType}") }`
        : `mutation { activateAddon(addonType: "${addonType}", quantity: 1) }`;
      const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: mutation }),
      });
      const data = await res.json();
      if (data.errors) throw new Error(data.errors[0]?.message || 'Fehler');
      if (isActive) {
        setActiveAddons((prev) => prev.filter((a) => a !== addonType));
      } else {
        setActiveAddons((prev) => [...prev, addonType]);
      }
      alert(isActive ? '✅ Add-on deaktiviert!' : '✅ Add-on aktiviert!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fehler';
      alert('❌ ' + message);
    } finally {
      setAddonLoading(null);
    }
  };

  const isAddonAvailable = (addon: AddonDef): boolean => {
    const currentIdx = getPackageIndex(currentPackage);
    return addon.availableFrom.some((pkg) => getPackageIndex(pkg) <= currentIdx);
  };

  const formatLimit = (val: number, unit: string) =>
    val === -1 ? `Unbegrenzte ${unit}` : `${val.toLocaleString()} ${unit}`;

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="sm">← Zurück zu Einstellungen</Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          Pakete &amp; Add-ons
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Wähle das passende Paket für dein Business. Aktuell:{' '}
          <strong className="capitalize">{currentPackage}</strong>
        </p>
      </div>

      {!isOwner && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
              <span>⚠️</span>
              <span className="font-medium">Nur der Owner kann Pakete und Add-ons verwalten</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        {(['packages', 'addons'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab === 'packages' ? 'Pakete' : 'Add-ons'}
          </button>
        ))}
      </div>

      {/* Packages Tab */}
      {selectedTab === 'packages' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {PACKAGES.map((pkg) => {
            const isCurrent = currentPackage === pkg.type;
            const isDowngrade = getPackageIndex(pkg.type) < getPackageIndex(currentPackage);
            const isHighlighted = pkg.type === 'business';

            return (
              <Card
                key={pkg.type}
                className={`relative flex flex-col ${
                  isCurrent
                    ? 'border-2 border-primary ring-2 ring-primary/20'
                    : isHighlighted
                      ? 'border-2 border-primary/40'
                      : ''
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap">
                      Aktuell
                    </span>
                  </div>
                )}
                {isHighlighted && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-0.5 bg-primary/80 text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap">
                      Beliebt
                    </span>
                  </div>
                )}

                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{pkg.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{pkg.target}</p>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">{formatPrice(pkg.price)}</span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{pkg.description}</p>
                  </div>

                  <div className="flex-1 border-t border-border pt-3 mb-4">
                    <ul className="space-y-1.5">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex gap-2 text-xs">
                          <span className="text-primary flex-shrink-0">✓</span>
                          <span className="text-gray-700 dark:text-gray-300">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-[10px] text-muted-foreground mb-3 p-2 bg-muted/30 rounded space-y-0.5">
                    <div>{formatLimit(pkg.limits.users, 'Benutzer')} · {pkg.limits.storage}</div>
                    {pkg.limits.products !== 0 && (
                      <div>{formatLimit(pkg.limits.products, 'Produkte')}</div>
                    )}
                    {pkg.limits.subscribers !== 0 && (
                      <div>{formatLimit(pkg.limits.subscribers, 'Abonnenten')}</div>
                    )}
                  </div>

                  {isCurrent ? (
                    <Button fullWidth disabled className="text-xs">Aktuelles Paket</Button>
                  ) : (
                    <Button
                      fullWidth
                      variant={isDowngrade ? 'ghost' : isHighlighted ? 'default' : 'outline'}
                      onClick={() => handlePackageClick(pkg)}
                      disabled={changing || !isOwner}
                      className="text-xs"
                    >
                      {isDowngrade ? 'Downgrade' : 'Upgrade'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add-ons Tab */}
      {selectedTab === 'addons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ADDONS.map((addon) => {
            const active = activeAddons.includes(addon.type);
            const available = isAddonAvailable(addon);
            const loading = addonLoading === addon.type;
            const minPackage = addon.availableFrom[0] || 'creator';

            return (
              <Card
                key={addon.type}
                className={`${
                  active
                    ? 'border-2 border-green-500 bg-green-50 dark:bg-green-900/10'
                    : !available
                      ? 'opacity-60'
                      : ''
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{addon.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{addon.description}</p>
                    </div>
                    {active && (
                      <span className="px-2 py-0.5 bg-green-600 text-white text-[10px] rounded-full">Aktiv</span>
                    )}
                  </div>
                  <div className="mb-3">
                    <span className="text-2xl font-bold">{formatPrice(addon.price)}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  {!available && (
                    <p className="text-xs text-muted-foreground mb-3 italic">
                      Verfügbar ab: <span className="capitalize font-medium">{minPackage}</span>
                    </p>
                  )}
                  <Button
                    fullWidth
                    variant={active ? 'ghost' : 'default'}
                    onClick={() => handleAddonToggle(addon.type)}
                    disabled={loading || !isOwner || !available}
                    className="text-sm"
                  >
                    {loading ? 'Wird verarbeitet...' : active ? 'Deaktivieren' : 'Aktivieren'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info */}
      <Card className="bg-muted/30">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-2">Wichtige Informationen</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>&bull; Upgrades und Downgrades sind jederzeit möglich</li>
            <li>&bull; Änderungen werden sofort wirksam</li>
            <li>&bull; Add-ons können monatlich hinzugefügt oder entfernt werden</li>
            <li>&bull; Alle Preise verstehen sich zzgl. MwSt.</li>
          </ul>
        </CardContent>
      </Card>

      {selectedPackage && (
        <>
          <UpgradeModal
            isOpen={upgradeModalOpen}
            onClose={handleModalClose}
            currentPackage={currentPackage}
            targetPackage={selectedPackage}
            onConfirm={handlePackageChange}
            isLoading={changing}
          />
          <DowngradeModal
            isOpen={downgradeModalOpen}
            onClose={handleModalClose}
            currentPackage={currentPackage}
            targetPackage={selectedPackage}
            onConfirm={handlePackageChange}
            isLoading={changing}
          />
        </>
      )}
    </div>
  );
}