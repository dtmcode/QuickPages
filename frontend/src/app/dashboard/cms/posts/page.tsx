'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const POSTS_QUERY = gql`
  query GetPosts {
    posts {
      posts {
        id
        title
        slug
        excerpt
        status
        publishedAt
        createdAt
        updatedAt
      }
      total
    }
  }
`;

const DELETE_POST = gql`
  mutation DeletePost($id: String!) {
    deletePost(id: $id)
  }
`;

export default function CmsPage() {
  const { data, loading, refetch } = useQuery(POSTS_QUERY);
  const [deletePost] = useMutation(DELETE_POST);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm('Post wirklich löschen?')) return;
    
    try {
      await deletePost({ variables: { id } });
      refetch();
    } catch (error) {
      alert('Fehler beim Löschen');
    }
  };

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PUBLISHED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'DRAFT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'ARCHIVED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PUBLISHED': return 'Veröffentlicht';
    case 'DRAFT': return 'Entwurf';
    case 'ARCHIVED': return 'Archiviert';
    default: return status;
  }
};


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📝 CMS</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Verwalte deine Blog-Posts und Inhalte
          </p>
        </div>
        <Link href="/dashboard/cms/posts/new">
          <Button>+ Neuer Post</Button>
        </Link>
      </div>

      {loading && (
        <div className="text-center py-12">Lädt...</div>
      )}

      {data && data.posts.total === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Noch keine Posts
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Erstelle deinen ersten Blog-Post!
            </p>
            <Link href="/dashboard/cms/new">
              <Button>+ Ersten Post erstellen</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {data && data.posts.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alle Posts ({data.posts.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.posts.posts.map((post: any) => (
                <div
                  key={post.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {post.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                          {getStatusLabel(post.status)}
                        </span>
                      </div>
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Slug: {post.slug}</span>
                        <span>•</span>
                        <span>Erstellt: {new Date(post.createdAt).toLocaleDateString('de-DE')}</span>
                        {post.publishedAt && (
                          <>
                            <span>•</span>
                            <span>Veröffentlicht: {new Date(post.publishedAt).toLocaleDateString('de-DE')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/cms/edit/${post.id}`)}
                      >
                        Bearbeiten
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}