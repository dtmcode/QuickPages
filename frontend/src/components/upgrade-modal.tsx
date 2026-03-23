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

  const formatPrice = (cents: number) => `\u20ac${(cents / 100).toFixed(2)}`;

  const handleConfirm = async () => {
    setStep('processing');
    try {
      await onConfirm();
      setStep('success');
    } catch {
      setStep('confirm');
    }
  };

  const handleClose = () => {
    setStep('confirm');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">

          {step === 'confirm' && (
            <div>
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">&#128640;</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Upgrade auf {targetPackage.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Schalte neue Features frei und erweitere deine M&ouml;glichkeiten
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Aktuell</div>
                  <div className="text-base font-semibold capitalize">{currentPackage}</div>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary">
                  <div className="text-xs text-primary mb-1">Neu</div>
                  <div className="text-base font-semibold">{targetPackage.name}</div>
                </div>
              </div>

              <div className="text-center mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Neuer Preis</div>
                <div className="text-3xl font-bold">
                  {formatPrice(targetPackage.price)}
                  <span className="text-base font-normal text-muted-foreground">/Monat</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Was du bekommst:</h3>
                <div className="space-y-2">
                  {targetPackage.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-green-600 dark:text-green-400">&#10003;</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6 p-3 bg-muted/30 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Hinweis:</strong> Das Upgrade wird sofort aktiviert. Die Abrechnung erfolgt anteilig f&uuml;r den restlichen Monat.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={handleClose} fullWidth disabled={isLoading}>
                  Abbrechen
                </Button>
                <Button onClick={handleConfirm} fullWidth disabled={isLoading}>
                  {isLoading ? 'Wird verarbeitet...' : `Auf ${targetPackage.name} upgraden`}
                </Button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Upgrade wird durchgef&uuml;hrt...</h3>
              <p className="text-muted-foreground">Bitte warten, dein Account wird aktualisiert</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">&#127881;</div>
              <h2 className="text-2xl font-bold mb-2">Upgrade erfolgreich!</h2>
              <p className="text-muted-foreground mb-6">
                Dein Account wurde auf <strong>{targetPackage.name}</strong> upgraded. Die Seite l&auml;dt gleich neu.
              </p>
              <Button onClick={handleClose} fullWidth>Weiter zum Dashboard</Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}