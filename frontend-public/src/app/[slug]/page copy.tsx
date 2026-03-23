import { headers } from 'next/headers';
import { getAPI } from '@/lib/api';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant') || 'demo';
  const api = getAPI(tenantSlug);

  try {
    const page = await api.getPage(params.slug);
    
    return {
      title: page.seo?.metaTitle || page.title,
      description: page.seo?.metaDescription || page.excerpt || page.metaDescription,
      keywords: page.seo?.metaKeywords,
      openGraph: {
        title: page.seo?.ogTitle || page.title,
        description: page.seo?.ogDescription || page.excerpt,
        images: page.seo?.ogImage ? [page.seo.ogImage] : page.featuredImage ? [page.featuredImage] : [],
      },
      robots: {
        index: !page.seo?.noindex,
        follow: !page.seo?.nofollow,
      },
      alternates: {
        canonical: page.seo?.canonicalUrl,
      },
    };
  } catch {
    return {
      title: 'Page Not Found',
    };
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant') || 'demo';
  const api = getAPI(tenantSlug);

  let page;
  try {
    page = await api.getPage(params.slug);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article>
        {/* Featured Image */}
        {page.featuredImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={page.featuredImage}
              alt={page.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
          {page.title}
        </h1>

        {/* Excerpt */}
        {page.excerpt && (
          <p className="text-xl text-gray-600 mb-8 italic">
            {page.excerpt}
          </p>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
    </div>
  );
}