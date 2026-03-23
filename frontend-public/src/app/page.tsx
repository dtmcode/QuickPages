import { headers } from 'next/headers';
import { getAPI } from '@/lib/api';
import PublicSiteRenderer from './PublicSiteRenderer';

export default async function HomePage() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant') || 'demo';

  const api = getAPI(tenantSlug);

  try {
    // Versuche Website Builder Homepage zu laden
    const wbHomepage = await api.getWbHomepage().catch(() => null);

    // ✅ DEBUG: Log was zurückkommt
    console.log('🏠 WB Homepage:', {
      exists: !!wbHomepage,
      hasSections: !!wbHomepage?.sections,
      sectionsLength: wbHomepage?.sections?.length || 0,
      pageData: wbHomepage,
    });

    // ✅ BESSERE PRÜFUNG: Wenn Homepage existiert UND Sections hat
    if (wbHomepage?.sections && wbHomepage.sections.length > 0) {
      console.log('✅ Rendering Website Builder Homepage');
      return <PublicSiteRenderer page={wbHomepage} />;
    }

    // ✅ FALLBACK: Wenn Homepage existiert aber KEINE Sections
    if (wbHomepage && (!wbHomepage.sections || wbHomepage.sections.length === 0)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-2xl px-4">
            <div className="text-6xl mb-6">📄</div>
            <h1 className="text-4xl font-bold mb-4">Homepage gefunden, aber leer!</h1>
            <p className="text-gray-600 mb-8">
              Die Homepage <strong>"{wbHomepage.name}"</strong> existiert, hat aber noch keine Sections.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
              <h3 className="font-semibold mb-2">🎯 So fügst du Sections hinzu:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Gehe zum <strong>Dashboard → Website Builder</strong></li>
                <li>Wähle dein Template</li>
                <li>Klicke auf die Homepage</li>
                <li>Füge Sections hinzu (Hero, Features, etc.)</li>
                <li>Benutze den <strong>Visual Editor</strong> für Styles</li>
                <li>Speichern & fertig! 🎉</li>
              </ol>
            </div>
            <a
              href="/dashboard/website-builder"
              className="inline-block mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Zum Website Builder
            </a>
          </div>
        </div>
      );
    }

    // ✅ Ansonsten: Standard Homepage mit Posts/Products
    console.log('⚠️ No WB Homepage, showing default');
    const [tenant, posts, products] = await Promise.all([
      api.getSettings(),
      api.getPosts().catch(() => []),
      api.getProducts().catch(() => []),
    ]);

    const featuredProducts = products.filter((p: any) => p.isFeatured).slice(0, 3);

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
              <a
                href="/shop"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Shop Now
              </a>
              <a
                href="/blog"
                className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Read Blog
              </a>
            </div>
          </div>
        </section>

        {(tenant.settings as any)?.modules?.shop && featuredProducts.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {featuredProducts.map((product: any) => (
                  <a
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
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {(tenant.settings as any)?.modules?.cms && posts.length > 0 && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold mb-8">Latest Posts</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {posts.slice(0, 3).map((post: any) => (
                  <a
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
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ✅ HINWEIS: Website Builder verfügbar */}
        <section className="py-16 bg-blue-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="text-5xl mb-4">🎨</div>
            <h2 className="text-3xl font-bold mb-4">Erstelle deine eigene Homepage!</h2>
            <p className="text-gray-600 mb-6">
              Nutze den Website Builder um eine professionelle Homepage mit dem Visual Editor zu erstellen.
            </p>
            <a
              href="/dashboard/website-builder"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Website Builder öffnen
            </a>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('❌ Error loading homepage:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-4xl font-bold mb-4">Fehler beim Laden</h1>
          <p className="text-gray-600 mb-4">Die Homepage konnte nicht geladen werden.</p>
          <pre className="text-sm text-left bg-gray-100 p-4 rounded max-w-2xl mx-auto overflow-auto">
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
        </div>
      </div>
    );
  }
}