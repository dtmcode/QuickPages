import { headers } from 'next/headers';
import { getAPI } from '@/lib/api';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import type { Metadata } from 'next';

interface ProductProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductProps): Promise<Metadata> {
  const headersList = await headers(); // ← Zeile 14

  const tenantSlug = headersList.get('x-tenant') || 'demo';
  const api = getAPI(tenantSlug);

  try {
    const product = await api.getProduct(params.slug);
    
    return {
      title: product.seo?.metaTitle || product.name,
      description: product.seo?.metaDescription || product.description,
      keywords: product.seo?.metaKeywords,
      openGraph: {
        title: product.seo?.ogTitle || product.name,
        description: product.seo?.ogDescription || product.description,
        images: product.seo?.ogImage
          ? [product.seo.ogImage]
          : product.images
          ? JSON.parse(product.images).slice(0, 1)
          : [],
      },
      robots: {
        index: !product.seo?.noindex,
        follow: !product.seo?.nofollow,
      },
      alternates: {
        canonical: product.seo?.canonicalUrl,
      },
    };
  } catch {
    return {
      title: 'Product Not Found',
    };
  }
}

export default async function ProductPage({ params }: ProductProps) {
  const headersList = await headers(); // ← Zeile 14

  const tenantSlug = headersList.get('x-tenant') || 'demo';
  const api = getAPI(tenantSlug);

  let product;
  try {
    product = await api.getProduct(params.slug);
  } catch {
    notFound();
  }

  const images = product.images ? JSON.parse(product.images) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Link */}
      <Link
        href="/shop"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
      >
        ← Back to Shop
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          {images.length > 0 ? (
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.slice(1).map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
              <p className="text-gray-400">No image available</p>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <p className="text-4xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </p>
              {product.compareAtPrice && (
                <p className="text-2xl text-gray-500 line-through">
                  {formatPrice(product.compareAtPrice)}
                </p>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <p className="text-green-600 font-medium">
                ✓ In stock ({product.stock} available)
              </p>
            ) : (
              <p className="text-red-600 font-medium">
                ✗ Out of stock
              </p>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <div
                className="prose prose-lg"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            disabled={product.stock === 0}
            className="w-full bg-blue-600 text-white py-4 px-8 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}