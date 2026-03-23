'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/contexts/cart-context';

const SHOP_DATA = gql`
  query ShopData {
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
    publicCategories {
      id
      name
      slug
    }
  }
`;

export default function ShopPage() {
  const { data, loading } = useQuery(SHOP_DATA);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { itemCount, addItem } = useCart();

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0],
      stock: product.stock,
    });
    
    // Kein Dialog - Badge wird automatisch aktualisiert! ✅
  };

  const filteredProducts = data?.publicProducts.filter((product: any) => {
    if (!selectedCategory) return true;
    return product.categoryId === selectedCategory;
  }) || [];

  const featuredProducts = data?.publicProducts.filter((p: any) => p.isFeatured) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🛒 Shop</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Entdecke unsere Produkte
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/shop/cart">
                <Button variant="ghost" className="relative">
                  🛒 Warenkorb
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost">← Zurück</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {loading && (
        <div className="text-center py-20">Lädt...</div>
      )}

      {data && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                ⭐ Featured Produkte
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.slice(0, 3).map((product: any) => (
                  <Card key={product.id} className="hover:shadow-xl transition-shadow h-full flex flex-col">
                    <Link href={`/shop/products/${product.slug}`}>
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-56 object-cover rounded-t-lg cursor-pointer"
                        />
                      )}
                    </Link>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <Link href={`/shop/products/${product.slug}`}>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 cursor-pointer">
                            {product.name}
                          </h3>
                        </Link>
                        <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-1 rounded">
                          ⭐ Featured
                        </span>
                      </div>
                      {product.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          {product.compareAtPrice && (
                            <span className="text-sm text-gray-500 line-through mr-2">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                        {product.stock > 0 ? (
                          <span className="text-xs text-green-600">Auf Lager</span>
                        ) : (
                          <span className="text-xs text-red-600">Ausverkauft</span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-auto">
                        {product.stock > 0 ? (
                          <Button 
                            onClick={(e) => handleAddToCart(product, e)} 
                            fullWidth
                            size="sm"
                          >
                            🛒 In den Warenkorb
                          </Button>
                        ) : (
                          <Button disabled fullWidth size="sm">
                            Ausverkauft
                          </Button>
                        )}
                        <Link href={`/shop/products/${product.slug}`}>
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          {data.publicCategories.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Alle Produkte
                </button>
                {data.publicCategories.map((category: any) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All Products */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {selectedCategory ? 'Gefilterte Produkte' : 'Alle Produkte'}
            </h2>
            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="py-20 text-center">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Keine Produkte verfügbar
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product: any) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                    <Link href={`/shop/products/${product.slug}`}>
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-t-lg cursor-pointer"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-center justify-center cursor-pointer">
                          <span className="text-6xl">📦</span>
                        </div>
                      )}
                    </Link>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <Link href={`/shop/products/${product.slug}`}>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          {product.compareAtPrice && (
                            <span className="text-xs text-gray-500 line-through mr-1">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatPrice(product.price)}
                          </div>
                        </div>
                        {product.stock > 0 ? (
                          <span className="text-xs text-green-600">✓</span>
                        ) : (
                          <span className="text-xs text-red-600">✗</span>
                        )}
                      </div>
                      {product.stock > 0 ? (
                        <Button 
                          onClick={(e) => handleAddToCart(product, e)} 
                          fullWidth
                          size="sm"
                          className="mt-auto"
                        >
                          🛒 Kaufen
                        </Button>
                      ) : (
                        <Button disabled fullWidth size="sm" className="mt-auto">
                          Ausverkauft
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}