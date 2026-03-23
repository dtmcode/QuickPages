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
  };
  onConfirm: () => Promise<void>;
  isLoading: boolean;
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

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-lg w-full">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Downgrade auf {targetPackage.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Bist du sicher? Du verlierst Zugriff auf einige Features!
            </p>
          </div>

          {/* Current vs New */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Aktuell
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {currentPackage}
              </div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-500">
              <div className="text-sm text-red-600 dark:text-red-400 mb-1">
                Downgrade zu
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {targetPackage.name}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="text-center mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Neuer Preis
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatPrice(targetPackage.price)}
              <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                /Monat
              </span>
            </div>
          </div>

          {/* Warning Box */}
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex gap-2">
              <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
              <div>
                <div className="font-semibold text-red-800 dark:text-red-300 mb-2">
                  Was du verlierst:
                </div>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  {currentPackage === 'enterprise' && targetPackage.type === 'business' && (
                    <>
                      <li>• Unbegrenzte Benutzer → Limit: 10 Benutzer</li>
                      <li>• Unbegrenzte Posts → Limit: 100 Posts</li>
                      <li>• Unbegrenzte Produkte → Limit: 100 Produkte</li>
                      <li>• Email System (10.000/Monat) → Kein Email</li>
                      <li>• Custom Domain</li>
                    </>
                  )}
                  {currentPackage === 'enterprise' && targetPackage.type === 'starter' && (
                    <>
                      <li>• Shop-Funktionalität</li>
                      <li>• Analytics</li>
                      <li>• Email System</li>
                      <li>• Custom Domain</li>
                      <li>• Unbegrenzte Features → Stark limitiert</li>
                    </>
                  )}
                  {currentPackage === 'business' && targetPackage.type === 'starter' && (
                    <>
                      <li>• Shop (100 Produkte) → Kein Shop</li>
                      <li>• Analytics</li>
                      <li>• 10 Benutzer → Limit: 3 Benutzer</li>
                      <li>• 100 Posts → Limit: 10 Posts</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Wichtig:</strong> Der Downgrade wird sofort wirksam. Daten werden nicht gelöscht, 
              aber Features sind nicht mehr zugänglich bis du wieder upgradest.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              fullWidth
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleConfirm}
              fullWidth
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'Wird verarbeitet...' : `Ja, downgrade auf ${targetPackage.name}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}