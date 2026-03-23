import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ShopTemplateProps {
  products: any[];
  featuredProducts: any[];
  categories: any[];
  selectedCategory: string | null;
  onCategorySelect: (id: string | null) => void;
  onAddToCart: (product: any, e: React.MouseEvent) => void;
  formatPrice: (cents: number) => string;
  itemCount: number;
}

export function DefaultTemplate({
  products,
  featuredProducts,
  categories,
  selectedCategory,
  onCategorySelect,
  onAddToCart,
  formatPrice,
  itemCount,
}: ShopTemplateProps) {
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

      <main className="max-w-7xl mx-auto px-4 py-8">
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
                        ⭐
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(product.price)}
                      </span>
                      {product.stock > 0 && <span className="text-xs text-green-600">Auf Lager</span>}
                    </div>
                    <Button onClick={(e) => onAddToCart(product, e)} fullWidth size="sm" className="mt-auto">
                      🛒 Kaufen
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onCategorySelect(null)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Alle
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => onCategorySelect(cat.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <Link href={`/shop/products/${product.slug}`}>
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
                ) : (
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-center justify-center">
                    <span className="text-6xl">📦</span>
                  </div>
                )}
              </Link>
              <CardContent className="p-4 flex-1 flex flex-col">
                <Link href={`/shop/products/${product.slug}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{product.name}</h3>
                </Link>
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {formatPrice(product.price)}
                </div>
                <Button onClick={(e) => onAddToCart(product, e)} fullWidth size="sm" className="mt-auto">
                  🛒 Kaufen
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}