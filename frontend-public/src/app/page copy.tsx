import { headers } from 'next/headers';
import { getAPI } from '@/lib/api';
import Link from 'next/link';

export default async function HomePage() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant') || 'demo';

  const api = getAPI(tenantSlug);

  const [tenant, posts, products] = await Promise.all([
    api.getSettings(),
    api.getPosts().catch(() => []),
    api.getProducts().catch(() => []),
  ]);

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 3);

  return (
    <div>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to {tenant.name}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Discover our amazing products and services
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/shop"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Shop Now
            </Link>
            <Link
              href="/blog"
              className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Read Blog
            </Link>
          </div>
        </div>
      </section>

      {tenant.settings.modules.shop && featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                >
                  {product.images && (
                    <div className="aspect-square relative">
                      <img
                        src={JSON.parse(product.images)[0] || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {product.name}
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                      €{(product.price / 100).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {tenant.settings.modules.cms && posts.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8">Latest Posts</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {posts.slice(0, 3).map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group"
                >
                  {post.featuredImage && (
                    <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}