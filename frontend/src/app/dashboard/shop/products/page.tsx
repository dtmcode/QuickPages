'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PRODUCTS_QUERY = gql`
  query GetProducts {
    products {
      products {
        id
        name
        slug
        price
        stock
        images
        isActive
        isFeatured
        createdAt
      }
      total
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: String!) {
    deleteProduct(id: $id)
  }
`;

export default function ProductsPage() {
  const { data, loading, refetch } = useQuery(PRODUCTS_QUERY);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);
  const router = useRouter();

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Produkt wirklich löschen?')) return;
    try {
      await deleteProduct({ variables: { id } });
      refetch();
    } catch (error) {
      alert('Fehler beim Löschen');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📦 Produkte</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Verwalte deine Produkte
          </p>
        </div>
        <Link href="/dashboard/shop/products/new">
          <Button>+ Neues Produkt</Button>
        </Link>
      </div>

      {loading && <div className="text-center py-12">Lädt...</div>}

      {data && data.products.total === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Noch keine Produkte
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Erstelle dein erstes Produkt!
            </p>
            <Link href="/dashboard/shop/products/new">
              <Button>+ Erstes Produkt erstellen</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {data && data.products.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alle Produkte ({data.products.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Produkt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Preis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Bestand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data.products.products.map((product: any) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                              📦
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </div>
                            {product.isFeatured && (
                              <span className="text-xs text-yellow-600">⭐ Featured</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${
                          product.stock < 10 
                            ? 'text-red-600 dark:text-red-400 font-semibold'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {product.stock} Stk.
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {product.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/shop/products/edit/${product.id}`)}
                          >
                            Bearbeiten
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            Löschen
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}