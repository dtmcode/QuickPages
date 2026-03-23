'use client';

import { useQuery, gql } from '@apollo/client';
import Link from 'next/link';
import { use } from 'react';
import { DefaultTemplate } from '@/components/page-templates/default-template';
import { LandingTemplate } from '@/components/page-templates/landing-template';
import { ContactTemplate } from '@/components/page-templates/contact-template';
import { AboutTemplate } from '@/components/page-templates/about-template';
import { BlankTemplate } from '@/components/page-templates/blank-template';
import { Card, CardContent } from '@/components/ui/card';

const PUBLIC_PAGE = gql`
  query PublicPage($slug: String!) {
    publicPage(slug: $slug) {
      id
      title
      content
      metaDescription
      template
    }
  }
`;

const templates = {
  DEFAULT: DefaultTemplate,
  LANDING: LandingTemplate,
  CONTACT: ContactTemplate,
  ABOUT: AboutTemplate,
  BLANK: BlankTemplate,
};

export default function PublicPagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, loading, error } = useQuery(PUBLIC_PAGE, {
    variables: { slug },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">Lädt...</div>
      </div>
    );
  }

  if (error || !data?.publicPage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Seite nicht gefunden
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Die angeforderte Seite existiert nicht oder wurde noch nicht veröffentlicht.
            </p>
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              → Zur Startseite
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const page = data.publicPage;
  const TemplateComponent = templates[page.template as keyof typeof templates] || DefaultTemplate;

  return <TemplateComponent page={page} />;
}