'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const CMS_STATS_QUERY = gql`
  query CmsStats {
    pages(limit: 5) {
      id
      title
      status
      updatedAt
    }
    posts(limit: 5) {
      id
      title
      status
      updatedAt
    }
    mediaFiles(limit: 1) {
      id
    }
  }
`;

export default function CmsDashboardPage() {
  const { data, loading } = useQuery(CMS_STATS_QUERY);

  const pages = data?.pages || [];
  const posts = data?.posts || [];
  const mediaCount = data?.mediaFiles?.length || 0;

  if (loading) {
    return <div className="text-center py-12">Lädt CMS Dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          📝 Content Management System
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Verwalte deine Inhalte zentral
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pages
            </CardTitle>
            <span className="text-2xl">📄</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {pages.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Statische Seiten
            </p>
            <Link href="/dashboard/cms/pages">
              <Button variant="ghost" size="sm" className="mt-4 w-full">
                Verwalten →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Posts
            </CardTitle>
            <span className="text-2xl">📝</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {posts.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Blog Beiträge
            </p>
            <Link href="/dashboard/cms/posts">
              <Button variant="ghost" size="sm" className="mt-4 w-full">
                Verwalten →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Media
            </CardTitle>
            <span className="text-2xl">🖼️</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {mediaCount}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Bilder & Dateien
            </p>
            <Link href="/dashboard/media">
              <Button variant="ghost" size="sm" className="mt-4 w-full">
                Verwalten →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/cms/pages/new">
              <button className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors text-center group">
                <div className="text-4xl mb-2">📄</div>
                <div className="font-medium text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                  Neue Page
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Erstelle eine statische Seite
                </div>
              </button>
            </Link>

            <Link href="/dashboard/cms/posts/new">
              <button className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors text-center group">
                <div className="text-4xl mb-2">📝</div>
                <div className="font-medium text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                  Neuer Post
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Schreibe einen Blog-Artikel
                </div>
              </button>
            </Link>

            <Link href="/dashboard/media">
              <button className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors text-center group">
                <div className="text-4xl mb-2">📤</div>
                <div className="font-medium text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                  Upload Media
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Lade Bilder & Dateien hoch
                </div>
              </button>
            </Link>

            <Link href="/dashboard/cms/navigation">
              <button className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors text-center group">
                <div className="text-4xl mb-2">📍</div>
                <div className="font-medium text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                  Navigation
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Verwalte deine Menüs
                </div>
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>📄 Letzte Pages</CardTitle>
            <Link href="/dashboard/cms/pages">
              <Button variant="ghost" size="sm">Alle →</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-sm">Noch keine Pages erstellt</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pages.map((page: any) => (
                  <Link key={page.id} href={`/dashboard/cms/pages/${page.id}`}>
                    <div className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {page.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(page.updatedAt).toLocaleDateString('de-DE', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <span className={`ml-3 inline-flex items-center px-2 py-1 rounded text-xs ${
                          page.status === 'published' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {page.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>📝 Letzte Posts</CardTitle>
            <Link href="/dashboard/cms/posts">
              <Button variant="ghost" size="sm">Alle →</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-sm">Noch keine Posts erstellt</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post: any) => (
                  <Link key={post.id} href={`/dashboard/cms/posts/${post.id}`}>
                    <div className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {post.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(post.updatedAt).toLocaleDateString('de-DE', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <span className={`ml-3 inline-flex items-center px-2 py-1 rounded text-xs ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}