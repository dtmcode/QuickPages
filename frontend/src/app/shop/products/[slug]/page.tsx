'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { use, useState } from 'react';
import { useCart } from '@/contexts/cart-context'; // ← NEU
import { useRouter } from 'next/navigation'; // ← NEU

const PRODUCT_QUERY = gql`
  query GetProductBySlug($slug: String!) {
    publicProducts {
      id
      name
      slug
      description
      price
      compareAtPrice
      stock
      images
      isFeatured
    }
  }
`;

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, loading, error } = useQuery(PRODUCT_QUERY);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart(); // ← NEU
  const router = useRouter(); // ← NEU

  const product = data?.publicProducts.find((p: any) => p.slug === slug);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.images?.[0],
        stock: product.stock,
      });
      
      // Show success message
     
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-lg">Lädt...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Produkt nicht gefunden
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Das angeforderte Produkt existiert nicht.
            </p>
            <Link href="/shop">
              <Button>→ Zurück zum Shop</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const discount = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/shop">
            <Button variant="ghost">← Zurück zum Shop</Button>
          </Link>
          <Link href="/shop/cart">
            <Button variant="ghost">🛒 Warenkorb</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="mb-4">
              {product.images?.[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-96 lg:h-[500px] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-9xl">📦</span>
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-blue-500'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h1>
                {product.isFeatured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                    ⭐ Featured
                  </span>
                )}
              </div>
              {product.stock > 0 ? (
                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  ✓ Auf Lager
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  ✗ Ausverkauft
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {product.description}
              </p>
            )}

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {product.compareAtPrice && (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg text-gray-500 line-through">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                          <span className="px-2 py-1 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-xs font-semibold rounded">
                            -{discount}%
                          </span>
                        </div>
                      </>
                    )}
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(product.price)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Lagerbestand</div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {product.stock}
                    </div>
                  </div>
                </div>

                {product.stock > 0 && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Anzahl
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={product.stock}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                          className="w-20 text-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <Button onClick={handleAddToCart} fullWidth size="lg">
                      🛒 In den Warenkorb • {formatPrice(product.price * quantity)}
                    </Button>
                  </>
                )}

                {product.stock === 0 && (
                  <Button disabled fullWidth size="lg">
                    Ausverkauft
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Product Features */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Produktdetails
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📦</div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Kostenloser Versand
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Ab 50€ Bestellwert
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🔄</div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        14 Tage Rückgaberecht
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Kostenlose Rücksendung
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✅</div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        2 Jahre Garantie
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Herstellergarantie inklusive
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}