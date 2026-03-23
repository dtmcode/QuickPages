import { headers } from 'next/headers';
import { getAPI } from '@/lib/api';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse our products',
};

export default async function ShopPage() {
  const headersList = await headers(); 

  const tenantSlug = headersList.get('x-tenant') || 'demo';
  const api = getAPI(tenantSlug);

  const [products, categories] = await Promise.all([
    api.getProducts(),
    api.getCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Shop</h1>
        <p className="text-xl text-gray-600">
          Discover our amazing products
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar - Categories */}
        {categories.length > 0 && (
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/shop"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  All Products
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/shop/category/${category.slug}`}
                    className="text-gray-700 hover:text-blue-600 transition"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* Products Grid */}
        <div className="flex-grow">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products available yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                >
                  {/* Product Image */}
                  {product.images && (
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      <img
                        src={JSON.parse(product.images)[0] || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPrice(product.price)}
                        </p>
                        {product.compareAtPrice && (
                          <p className="text-sm text-gray-500 line-through">
                            {formatPrice(product.compareAtPrice)}
                          </p>
                        )}
                      </div>

                      {product.stock === 0 && (
                        <span className="text-red-600 text-sm font-medium">
                          Out of stock
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}