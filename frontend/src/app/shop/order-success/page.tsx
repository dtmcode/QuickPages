'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Suspense } from 'react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="py-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bestellung erfolgreich!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vielen Dank für deine Bestellung. Wir haben eine Bestätigung an deine E-Mail gesendet.
          </p>

          {orderNumber && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Bestellnummer
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {orderNumber}
              </div>
            </div>
          )}

          <div className="space-y-4 text-left mb-8">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📧</div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Bestätigung verschickt
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Du erhältst eine E-Mail mit allen Details
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">📦</div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Versand in Bearbeitung
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Wir bereiten deine Bestellung vor
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🚚</div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Lieferzeit: 2-4 Werktage
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Versand mit DHL
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/shop">
              <Button fullWidth>→ Zurück zum Shop</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" fullWidth>Zur Startseite</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Lädt...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}