//frontend-public\src\app\[slug]\page.tsx
import { headers } from 'next/headers';
import { getAPI } from '@/lib/api';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';

interface TemplateSection {
  id: string;
  orderIndex: number;
  overrideConfig?: Record<string, unknown>;
  section: {
    id: string;
    name: string;
    type: string;
    component: string;
    config?: Record<string, unknown>;
  };
}

interface SectionConfig {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  companyName?: string;
  features?: Array<{
    icon?: string;
    title: string;
    description: string;
  }>;
  [key: string]: unknown;
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant') || 'demo';
  const api = getAPI(tenantSlug);

  try {
    // ✅ Suche nach einer Page mit slug "home" oder "index"
    const page = await api.getPage('home').catch(() => api.getPage('index'));
    
    return {
      title: page.seo?.metaTitle || page.title,
      description: page.seo?.metaDescription || page.excerpt,
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
    };
  } catch {
    return {
      title: 'Home',
    };
  }
}

function renderSection(ts: TemplateSection) {
  const config: SectionConfig = {
    ...(ts.section.config || {}),
    ...(ts.overrideConfig || {}),
  };

  const sectionType = ts.section.type;

  switch (sectionType) {
    case 'hero':
      return (
        <section key={ts.id} className="relative flex min-h-[600px] items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-6 text-5xl font-bold">{config.title || 'Welcome'}</h1>
            <p className="mb-8 text-xl">{config.subtitle || 'Your amazing website'}</p>
            {config.ctaText && (
              <a href={config.ctaLink || '#'} className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-semibold text-cyan-600">
                {config.ctaText}
              </a>
            )}
          </div>
        </section>
      );

    case 'features':
      const features = config.features || [];
      return (
        <section key={ts.id} className="container mx-auto px-4 py-24">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">{config.title || 'Our Features'}</h2>
            <p className="text-xl text-gray-600">{config.subtitle || 'Everything you need'}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div key={i} className="rounded-lg bg-white p-6 shadow-md">
                {f.icon && <div className="mb-4 text-4xl">{f.icon}</div>}
                <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
                <p className="text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      );

    case 'cta':
      return (
        <section key={ts.id} className="container mx-auto px-4 py-24 text-center">
          <h2 className="mb-4 text-4xl font-bold">{config.title || 'Ready to Get Started?'}</h2>
          <p className="mb-8 text-xl text-gray-600">{config.subtitle || 'Join us today'}</p>
          <a href={config.primaryButtonLink || '#'} className="inline-block rounded-lg bg-blue-600 px-8 py-4 text-white font-semibold">
            {config.primaryButtonText || 'Get Started'}
          </a>
        </section>
      );

    case 'footer':
      return (
        <footer key={ts.id} className="border-t bg-gray-50">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center text-gray-600">
              © {new Date().getFullYear()} {config.companyName || 'Your Company'}
            </div>
          </div>
        </footer>
      );

    default:
      return null;
  }
}

export default async function HomePage() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant') || 'demo';
  const api = getAPI(tenantSlug);

  let page;
  try {
    // ✅ Versuche "home" oder "index" Page zu laden
    page = await api.getPage('home').catch(() => api.getPage('index'));
  } catch {
    // ✅ Fallback wenn keine Home Page existiert
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Willkommen</h1>
          <p className="text-gray-600 mb-8">
            Erstelle eine Page mit dem Slug &quot;home&quot; im Website Builder um diese Homepage anzupassen.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Wenn Page ein Template hat, rendere Sections
  if (page.templateData?.sections && page.templateData.sections.length > 0) {
    return (
      <div>
        {page.templateData.sections.map((section: TemplateSection) =>
          renderSection(section)
        )}
      </div>
    );
  }

  // ✅ Fallback: Rendere HTML Content
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article>
        {page.featuredImage && (
          <div className="mb-8 rounded-lg overflow-hidden relative h-96">
            <Image
              src={page.featuredImage}
              alt={page.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
          {page.title}
        </h1>
        {page.excerpt && (
          <p className="text-xl text-gray-600 mb-8 italic">{page.excerpt}</p>
        )}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
    </div>
  );
}