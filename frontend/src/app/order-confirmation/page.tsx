// 📂 PFAD: frontend/src/app/shop/order-confirmation/page.tsx

'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Suspense } from 'react';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <Card className="max-w-lg w-full">
        <CardContent className="py-12 text-center">
          {/* Success Animation */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Bestellung aufgegeben!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Vielen Dank für deine Bestellung.
            </p>
          </div>

          {/* Order Number */}
          {orderNumber && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bestellnummer</p>
              <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                {orderNumber}
              </p>
            </div>
          )}

          {/* Info */}
          <div className="text-left space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">📧</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Bestätigung per Email</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Du erhältst in Kürze eine Bestellbestätigung per Email.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">📦</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Versand</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Wir bereiten deine Bestellung vor und informieren dich über den Versand.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">💬</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Fragen?</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Kontaktiere uns jederzeit mit deiner Bestellnummer.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/shop">
              <Button variant="outline" className="w-full sm:w-auto">
                Weiter einkaufen
              </Button>
            </Link>
            <Link href="/">
              <Button className="w-full sm:w-auto">
                Zur Startseite
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Lädt...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}