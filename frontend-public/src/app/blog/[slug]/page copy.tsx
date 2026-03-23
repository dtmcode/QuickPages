import { headers } from 'next/headers';
import { getAPI } from '@/lib/api';
import { notFound } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { Metadata } from 'next';

interface PostProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PostProps): Promise<Metadata> {
  const headersList = await headers(); // ← Zeile 14

  const tenantSlug = headersList.get('x-tenant') || 'demo';
  const api = getAPI(tenantSlug);

  try {
    const post = await api.getPost(params.slug);
    
    return {
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || post.excerpt,
      keywords: post.seo?.metaKeywords,
      openGraph: {
        title: post.seo?.ogTitle || post.title,
        description: post.seo?.ogDescription || post.excerpt,
        images: post.seo?.ogImage ? [post.seo.ogImage] : post.featuredImage ? [post.featuredImage] : [],
        type: 'article',
        publishedTime: post.publishedAt,
      },
      robots: {
        index: !post.seo?.noindex,
        follow: !post.seo?.nofollow,
      },
      alternates: {
        canonical: post.seo?.canonicalUrl,
      },
    };
  } catch {
    return {
      title: 'Post Not Found',
    };
  }
}

export default async function BlogPostPage({ params }: PostProps) {
  const headersList = await headers(); // ← Zeile 14

  const tenantSlug = headersList.get('x-tenant') || 'demo';
  const api = getAPI(tenantSlug);

  let post;
  try {
    post = await api.getPost(params.slug);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Link */}
      <Link
        href="/blog"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
      >
        ← Back to Blog
      </Link>

      <article>
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Meta */}
        <div className="mb-6">
          <time
            dateTime={post.publishedAt}
            className="text-gray-600"
          >
            {formatDate(post.publishedAt)}
          </time>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-gray-600 mb-8 italic">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}