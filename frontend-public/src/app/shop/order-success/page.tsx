'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-sm border border-gray-100 py-12 px-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bestellung erfolgreich!
        </h1>
        <p className="text-gray-600 mb-6">
          Vielen Dank für deine Bestellung. Wir haben eine Bestätigung an
          deine E-Mail gesendet.
        </p>

        {orderNumber && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-500 mb-1">Bestellnummer</div>
            <div className="text-xl font-bold text-gray-900">{orderNumber}</div>
          </div>
        )}

        <div className="space-y-4 text-left mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📧</span>
            <div>
              <div className="font-semibold text-gray-900">
                Bestätigung verschickt
              </div>
              <div className="text-sm text-gray-500">
                Du erhältst eine E-Mail mit allen Details
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <div className="font-semibold text-gray-900">
                Versand in Bearbeitung
              </div>
              <div className="text-sm text-gray-500">
                Wir bereiten deine Bestellung vor
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚚</span>
            <div>
              <div className="font-semibold text-gray-900">
                Lieferzeit: 2-4 Werktage
              </div>
              <div className="text-sm text-gray-500">Versand mit DHL</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/shop"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center"
          >
            → Zurück zum Shop
          </Link>
          <Link
            href="/"
            className="block w-full border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition text-center"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Lädt...
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}