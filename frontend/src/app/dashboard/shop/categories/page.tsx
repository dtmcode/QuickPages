'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const CATEGORIES_QUERY = gql`
  query GetCategories {
    categories {
      categories {
        id
        name
        slug
        description
        image
        isActive
        createdAt
      }
      total
    }
  }
`;

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: String!) {
    deleteCategory(id: $id)
  }
`;

export default function CategoriesPage() {
  const { data, loading, refetch } = useQuery(CATEGORIES_QUERY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm('Kategorie wirklich löschen?')) return;
    try {
      await deleteCategory({ variables: { id } });
      refetch();
    } catch (error) {
      alert('Fehler beim Löschen');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📂 Kategorien</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Verwalte deine Produktkategorien
          </p>
        </div>
        <Link href="/dashboard/shop/categories/new">
          <Button>+ Neue Kategorie</Button>
        </Link>
      </div>

      {loading && <div className="text-center py-12">Lädt...</div>}

      {data && data.categories.total === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Noch keine Kategorien
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Erstelle deine erste Produktkategorie!
            </p>
            <Link href="/dashboard/shop/categories/new">
              <Button>+ Erste Kategorie erstellen</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {data && data.categories.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.categories.categories.map((category: any) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    category.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {category.isActive ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
                {category.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/dashboard/shop/categories/edit/${category.id}`)}
                    fullWidth
                  >
                    Bearbeiten
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                  >
                    Löschen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}