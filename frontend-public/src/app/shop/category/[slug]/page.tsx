import { headers } from 'next/headers';
import { getAPI } from '@/lib/api';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { notFound } from 'next/navigation';

interface CategoryProps {
  params: { slug: string };
}

export default async function CategoryPage({ params }: CategoryProps) {
 const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant') || 'demo';
  const api = getAPI(tenantSlug);

  const [products, categories] = await Promise.all([
    api.getProducts(),
    api.getCategories(),
  ]);

  const category = categories.find((c) => c.slug === params.slug);
  if (!category) notFound();

  const categoryProducts = products.filter(
    (p) => p.categoryId === category.id,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Link */}
      <Link
        href="/shop"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
      >
        ← Back to Shop
      </Link>

      {/* Category Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-xl text-gray-600">{category.description}</p>
        )}
      </div>

      {/* Products */}
      {categoryProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            No products in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoryProducts.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
            >
              {product.images && (
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <img
                    src={JSON.parse(product.images)[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition">
                  {product.name}
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}