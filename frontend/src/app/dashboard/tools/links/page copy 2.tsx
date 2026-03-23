'use client';

import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getPublicLink } from '@/lib/public-link';
import { useAuth } from '@/context/AuthContext';
import { usePackage } from '@/contexts/package-context';

const PAGES_QUERY = gql`
  query Pages {
    pages {
      id
      title
      slug
      isPublished
      createdAt
      updatedAt
    }
  }
`;

interface Page {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LinkManagerPage() {
  const { data, loading, error } = useQuery(PAGES_QUERY);
  const { tenant } = useAuth();
  const { hasFeature } = usePackage();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const tenantSlug = tenant?.slug || 'demo';

  const pages: Page[] = data?.pages || [];
  const publishedPages = pages.filter(p => p.isPublished);

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadQR = async (link: string, filename: string) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(link)}`;
    
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${filename}.png`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('QR Code Error:', err);
      alert('❌ Fehler beim Erstellen des QR Codes');
    }
  };

  // Link Card Component
  const LinkCard = ({ 
    title, 
    slug, 
    id, 
    icon, 
    description 
  }: { 
    title: string; 
    slug: string; 
    id: string; 
    icon: string; 
    description?: string;
  }) => {
    const link = getPublicLink(tenantSlug, slug);
    const isCopied = copiedId === id;

    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-2xl">{icon}</span>
                <h3 className="text-lg font-semibold">{title}</h3>
                <Badge variant="secondary">{slug}</Badge>
              </div>
              
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {description}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg overflow-hidden">
                <span className="truncate flex-1">{link}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyLink(link, id)}
                className={isCopied ? 'bg-green-50 border-green-500 text-green-700' : ''}
              >
                {isCopied ? '✓ Kopiert' : '📋 Kopieren'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadQR(link, slug.replace('/', '-'))}
              >
                📱 QR Code
              </Button>
              
              <a href={link} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  👁️ Öffnen
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-cyan-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="rounded-xl bg-red-500 p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">❌ Fehler beim Laden</h1>
          <p className="mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/tools">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 mb-2">
                ← Zurück zu Tools
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">🔗 Link Manager</h1>
            <p className="mt-1 text-blue-100">
              Teile deine Seiten mit Links und QR Codes
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Gesamt Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Veröffentlicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {publishedPages.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Dein Tenant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">{tenantSlug}</div>
          </CardContent>
        </Card>
      </div>

      {/* Shop Ansehen */}
      {hasFeature('shop') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">🛒 Shop</h2>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Aktiv
            </Badge>
          </div>
          <LinkCard
            title="Shop Übersicht"
            slug="/shop"
            id="shop-main"
            icon="🛍️"
            description="Dein Online Shop mit allen Produkten"
          />
        </div>
      )}

      {/* Blog Ansehen */}
      {hasFeature('cms') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">📝 Blog</h2>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Aktiv
            </Badge>
          </div>
          <LinkCard
            title="Blog Übersicht"
            slug="/blog"
            id="blog-main"
            icon="📰"
            description="Alle deine Blog Posts und Artikel"
          />
        </div>
      )}

      {/* Weitere Pages */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">📄 Weitere Pages</h2>
          <Link href="/dashboard/website-builder/pages">
            <Button variant="outline" size="sm">
              + Neue Page erstellen
            </Button>
          </Link>
        </div>

        {publishedPages.length > 0 ? (
          <div className="space-y-4">
            {publishedPages.map((page) => (
              <LinkCard
                key={page.id}
                title={page.title}
                slug={`/${page.slug}`}
                id={page.id}
                icon="📄"
              />
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="p-12 text-center">
              <div className="mb-4 text-6xl">📄</div>
              <h3 className="mb-2 text-xl font-semibold">
                {pages.length > 0 ? 'Keine veröffentlichten Pages' : 'Noch keine Pages'}
              </h3>
              <p className="mb-6 text-gray-600">
                {pages.length > 0 
                  ? `Du hast ${pages.length} Pages, aber keine ist veröffentlicht. Veröffentliche eine Page um sie hier zu sehen.`
                  : 'Erstelle und veröffentliche deine erste Page'
                }
              </p>
              <Link href="/dashboard/website-builder/pages">
                <Button>Erste Page erstellen</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}