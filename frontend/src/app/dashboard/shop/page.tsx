'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const SHOP_OVERVIEW = gql`
  query ShopOverview {
    products {
      products {
        id
        name
        price
        stock
        isActive
      }
      total
    }
    categories {
      categories {
        id
        name
        isActive
      }
      total
    }
  }
`;

export default function ShopPage() {
  const { data, loading } = useQuery(SHOP_OVERVIEW);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const getTotalValue = () => {
    if (!data?.products.products) return 0;
    return data.products.products.reduce((sum: number, p: any) => sum + (p.price * p.stock), 0);
  };

  const getLowStock = () => {
    if (!data?.products.products) return 0;
    return data.products.products.filter((p: any) => p.stock < 10).length;
  };

  const getActiveProducts = () => {
    if (!data?.products.products) return 0;
    return data.products.products.filter((p: any) => p.isActive).length;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🛒 Shop</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Verwalte deine Produkte und Kategorien
        </p>
      </div>


      {loading && <div className="text-center py-12">Lädt...</div>}
      <div className="flex justify-end mb-6">
  <Link href="/dashboard/shop/settings">
    <Button variant="ghost">
      ⚙️ Shop Einstellungen
    </Button>
  </Link>
</div>

      {data && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">Produkte gesamt</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {data.products.total}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {getActiveProducts()} aktiv
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">Kategorien</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {data.categories.total}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">Lagerwert</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatPrice(getTotalValue())}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">Niedriger Bestand</div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {getLowStock()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  unter 10 Stück
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      📦 Produkte
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Verwalte dein Produktsortiment
                    </p>
                  </div>
                  <div className="text-4xl">🏷️</div>
                </div>
                <div className="flex gap-2">
                  <Link href="/dashboard/shop/products/new" className="flex-1">
                    <Button fullWidth>+ Neues Produkt</Button>
                  </Link>
                  <Link href="/dashboard/shop/products" className="flex-1">
                    <Button variant="ghost" fullWidth>Alle ansehen</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      📂 Kategorien
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Organisiere deine Produkte
                    </p>
                  </div>
                  <div className="text-4xl">🗂️</div>
                </div>
                <div className="flex gap-2">
                  <Link href="/dashboard/shop/categories/new" className="flex-1">
                    <Button fullWidth>+ Neue Kategorie</Button>
                  </Link>
                  <Link href="/dashboard/shop/categories" className="flex-1">
                    <Button variant="ghost" fullWidth>Alle ansehen</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Products */}
          <Card>
            <CardHeader>
              <CardTitle>📦 Neueste Produkte</CardTitle>
            </CardHeader>
            <CardContent>
              {data.products.products.length === 0 ? (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Noch keine Produkte erstellt
                </p>
              ) : (
                <div className="space-y-3">
                  {data.products.products.slice(0, 5).map((product: any) => (
                    <Link
                      key={product.id}
                      href={`/dashboard/shop/products/edit/${product.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Bestand: {product.stock} • {formatPrice(product.price)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {product.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
  <CardContent className="p-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          📦 Bestellungen
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Verwalte deine Shop-Bestellungen
        </p>
      </div>
      <div className="text-4xl">📋</div>
    </div>
    <Link href="/dashboard/shop/orders">
      <Button fullWidth>Alle Bestellungen ansehen</Button>
    </Link>
  </CardContent>
</Card>
        </>        
      )}
    </div>
  );
}