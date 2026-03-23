'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPackage: string;
  targetPackage: {
    type: string;
    name: string;
    description: string;
    price: number;
    features: string[];
  };
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentPackage,
  targetPackage,
  onConfirm,
  isLoading,
}: UpgradeModalProps) {
  const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm');

  if (!isOpen) return null;

  const formatPrice = (cents: number) => `€${(cents / 100).toFixed(2)}`;

  const handleConfirm = async () => {
    setStep('processing');
    try {
      await onConfirm();
      setStep('success');
    } catch (error) {
      setStep('confirm');
      throw error;
    }
  };

  const handleClose = () => {
    setStep('confirm');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {/* Confirm Step */}
          {step === 'confirm' && (
            <div>
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🚀</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Upgrade auf {targetPackage.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Schalte neue Features frei und erweitere deine Möglichkeiten
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
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-500">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                    Neu
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {targetPackage.name}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="text-center mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Neuer Preis
                </div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(targetPackage.price)}
                  <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                    /Monat
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  ✨ Was du bekommst:
                </h3>
                <div className="space-y-2">
                  {targetPackage.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                    >
                      <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400">ℹ️</span>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Demo-Modus:</strong> Das Upgrade wird sofort aktiviert. 
                    Payment-Integration kommt später!
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  fullWidth
                  disabled={isLoading}
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleConfirm}
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? 'Wird verarbeitet...' : `Auf ${targetPackage.name} upgraden`}
                </Button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Upgrade wird durchgeführt...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Bitte warten, dein Account wird aktualisiert
              </p>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Upgrade erfolgreich!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Dein Account wurde auf <strong>{targetPackage.name}</strong> upgraded
              </p>

              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <strong>Neue Features freigeschaltet:</strong>
                </div>
                <div className="space-y-2">
                  {targetPackage.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 justify-center">
                      <span className="text-green-600 dark:text-green-400">✓</span>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleClose} fullWidth>
                Dashboard entdecken
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}