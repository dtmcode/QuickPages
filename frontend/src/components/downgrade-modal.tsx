'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DowngradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPackage: string;
  targetPackage: {
    type: string;
    name: string;
    description: string;
    price: number;
    features?: string[];
  };
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

interface PkgInfo {
  features: string[];
  users: number;
  posts: number;
  pages: number;
  products: number;
  subscribers: number;
  storage: string;
}

const PKG_INFO: Record<string, PkgInfo> = {
  page: {
    features: ['Landing Page', 'Basis-Analytics'],
    users: 1, posts: 0, pages: 1, products: 0, subscribers: 0, storage: '100 MB',
  },
  landing: {
    features: ['3 Landing Pages', 'Eigene Domain', 'Kontaktformular'],
    users: 1, posts: 0, pages: 3, products: 0, subscribers: 0, storage: '500 MB',
  },
  creator: {
    features: ['Blog', 'Kommentare', 'Eigene Domain'],
    users: 2, posts: 50, pages: 10, products: 0, subscribers: 0, storage: '1 GB',
  },
  business: {
    features: ['Newsletter', 'Booking', 'Form Builder', 'E-Mail-System', 'Erweiterte Analytics'],
    users: 5, posts: 200, pages: 30, products: 0, subscribers: 1000, storage: '5 GB',
  },
  shop: {
    features: ['Shop System', 'Stripe Payments', 'Bestellverwaltung'],
    users: 10, posts: 500, pages: 50, products: 200, subscribers: 3000, storage: '10 GB',
  },
  professional: {
    features: ['AI Content', 'Mehrsprachigkeit', 'Eigene Templates', 'Dedizierter Support'],
    users: 25, posts: 1000, pages: 100, products: 1000, subscribers: 10000, storage: '25 GB',
  },
  enterprise: {
    features: ['White-Label', 'Unbegrenzte Ressourcen', 'Dedizierter Account Manager'],
    users: -1, posts: -1, pages: -1, products: -1, subscribers: -1, storage: 'Unbegrenzt',
  },
};

const PACKAGE_ORDER = ['page', 'landing', 'creator', 'business', 'shop', 'professional', 'enterprise'];

function getLostFeatures(from: string, to: string): string[] {
  const losses: string[] = [];
  const fromInfo = PKG_INFO[from];
  const toInfo = PKG_INFO[to];
  if (!fromInfo || !toInfo) return ['Einige Features werden nicht mehr verfügbar sein'];

  const fromIdx = PACKAGE_ORDER.indexOf(from);
  const toIdx = PACKAGE_ORDER.indexOf(to);

  for (let i = fromIdx; i > toIdx; i--) {
    const info = PKG_INFO[PACKAGE_ORDER[i]];
    if (info) {
      losses.push(...info.features);
    }
  }

  // Limit-Reduktionen
  if (fromInfo.users !== -1 && toInfo.users !== -1 && fromInfo.users > toInfo.users) {
    losses.push(`${fromInfo.users} Benutzer → ${toInfo.users} Benutzer`);
  }
  if (fromInfo.posts > toInfo.posts && fromInfo.posts > 0) {
    losses.push(`${fromInfo.posts} Posts → ${toInfo.posts === 0 ? 'Kein Blog' : toInfo.posts + ' Posts'}`);
  }
  if (fromInfo.products > toInfo.products && fromInfo.products > 0) {
    losses.push(`${fromInfo.products} Produkte → ${toInfo.products === 0 ? 'Kein Shop' : toInfo.products + ' Produkte'}`);
  }
  if (fromInfo.subscribers > toInfo.subscribers && fromInfo.subscribers > 0) {
    losses.push(`${fromInfo.subscribers.toLocaleString()} Newsletter-Abonnenten → ${toInfo.subscribers === 0 ? 'Kein Newsletter' : toInfo.subscribers.toLocaleString()}`);
  }

  return losses.length > 0 ? losses : ['Einige Features werden eingeschränkt'];
}

export function DowngradeModal({
  isOpen,
  onClose,
  currentPackage,
  targetPackage,
  onConfirm,
  isLoading,
}: DowngradeModalProps) {
  if (!isOpen) return null;

  const formatPrice = (cents: number) => `€${(cents / 100).toFixed(2)}`;
  const losses = getLostFeatures(currentPackage, targetPackage.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Downgrade auf {targetPackage.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Bist du sicher? Du verlierst Zugriff auf einige Features.
            </p>
          </div>

          {/* Current vs New */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Aktuell</div>
              <div className="text-base font-semibold capitalize">{currentPackage}</div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-400">
              <div className="text-xs text-red-600 dark:text-red-400 mb-1">Downgrade zu</div>
              <div className="text-base font-semibold">{targetPackage.name}</div>
            </div>
          </div>

          {/* Price */}
          <div className="text-center mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Neuer Preis</div>
            <div className="text-3xl font-bold">
              {formatPrice(targetPackage.price)}
              <span className="text-base font-normal text-muted-foreground">/Monat</span>
            </div>
          </div>

          {/* Losses */}
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex gap-2">
              <span className="text-red-500 text-lg">⚠️</span>
              <div>
                <div className="font-semibold text-red-800 dark:text-red-300 mb-2">
                  Was du verlierst:
                </div>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  {losses.map((loss: string, i: number) => (
                    <li key={i}>&bull; {loss}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mb-6 p-3 bg-muted/30 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Wichtig:</strong> Der Downgrade wird sofort wirksam. Deine Daten werden nicht gelöscht,
              aber Features sind nicht mehr zugänglich bis du wieder upgradest.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} fullWidth disabled={isLoading}>
              Abbrechen
            </Button>
            <Button
              onClick={onConfirm}
              fullWidth
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'Wird verarbeitet...' : `Ja, auf ${targetPackage.name} downgraden`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}