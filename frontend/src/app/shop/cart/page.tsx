// 📂 PFAD: frontend/src/app/shop/cart/page.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount, clearCart } = useCart();
  const router = useRouter();

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const shipping = total >= 5000 ? 0 : 499; // Kostenloser Versand ab 50€
  const grandTotal = total + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Dein Warenkorb ist leer
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Stöbere in unserem Shop und finde tolle Produkte!
            </p>
            <Link href="/shop">
              <Button>→ Zum Shop</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🛒 Warenkorb ({itemCount})
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/shop">
                <Button variant="ghost">← Weiter einkaufen</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    {item.image && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {!item.image && (
                      <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">📦</span>
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatPrice(item.price)} pro Stück
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, Math.min(item.stock || 99, item.quantity + 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        +
                      </button>
                    </div>

                    {/* Price + Remove */}
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-red-500 hover:text-red-700 mt-1"
                      >
                        Entfernen
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Clear Cart */}
            <div className="text-right">
              <button
                onClick={() => {
                  if (confirm('Warenkorb wirklich leeren?')) clearCart();
                }}
                className="text-sm text-gray-500 hover:text-red-500 transition"
              >
                🗑️ Warenkorb leeren
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Bestellübersicht</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Zwischensumme ({itemCount} Artikel)</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Versand</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Kostenlos</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                {shipping > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Noch {formatPrice(5000 - total)} bis zum kostenlosen Versand
                  </p>
                )}

                <hr className="border-gray-200 dark:border-gray-700" />

                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Gesamt</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>

                <p className="text-xs text-gray-500">inkl. MwSt.</p>

                {/* ✅ CHECKOUT BUTTON — Das fehlte! */}
                <Link href="/shop/checkout" className="block">
                  <Button className="w-full py-3 text-lg font-semibold">
                    Zur Kasse →
                  </Button>
                </Link>

                <Link href="/shop" className="block">
                  <Button variant="outline" className="w-full">
                    ← Weiter einkaufen
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}