'use client';

import { useQuery, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const USERS_QUERY = gql`
  query GetUsers {
    users {
      users {
        id
        email
        firstName
        lastName
        role
        isActive
        emailVerified
        createdAt
      }
      total
    }
  }
`;

export default function UsersPage() {
  const { data, loading, error } = useQuery(USERS_QUERY);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lädt Benutzer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground transition-colors duration-300">
            👥 Benutzer Verwaltung
          </h1>
          <p className="mt-2 text-muted-foreground transition-colors duration-300">
            Verwalte alle Benutzer deines Workspaces
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">
            ← Zurück zum Dashboard
          </Button>
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <span className="text-destructive text-xl">⚠️</span>
              <div>
                <p className="font-semibold text-destructive">Fehler beim Laden</p>
                <p className="text-sm text-destructive/80">{error.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      {data && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Alle Benutzer ({data.users.total})</CardTitle>
              <Button className="btn-glow">
                + Benutzer einladen
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border transition-colors duration-300">
                <thead className="bg-muted/50 transition-colors duration-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider transition-colors duration-300">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider transition-colors duration-300">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider transition-colors duration-300">
                      Rolle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider transition-colors duration-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider transition-colors duration-300">
                      Verifiziert
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider transition-colors duration-300">
                      Erstellt
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border transition-colors duration-300">
                  {data.users.users.map((user: any) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-muted/50 transition-all duration-300 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                            <span className="text-primary-foreground font-semibold text-sm">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                          </div>
                          <div className="font-medium text-foreground transition-colors duration-300">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground transition-colors duration-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-300 ${
                          user.role === 'OWNER' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                          user.role === 'ADMIN' 
                            ? 'bg-primary/10 text-primary border border-primary/20' :
                          'bg-muted text-foreground border border-border'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-300 ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {user.isActive ? '✓ Aktiv' : '✗ Inaktiv'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.emailVerified ? (
                          <span className="text-green-600 dark:text-green-400 transition-colors duration-300">
                            ✓ Verifiziert
                          </span>
                        ) : (
                          <span className="text-muted-foreground transition-colors duration-300">
                            ⏳ Ausstehend
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground transition-colors duration-300">
                        {new Date(user.createdAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card hover>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1 transition-colors duration-300">
                Gesamt
              </div>
              <div className="text-3xl font-bold text-foreground transition-colors duration-300">
                {data.users.total}
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1 transition-colors duration-300">
                Aktiv
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">
                {data.users.users.filter((u: any) => u.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1 transition-colors duration-300">
                Verifiziert
              </div>
              <div className="text-3xl font-bold text-primary transition-colors duration-300">
                {data.users.users.filter((u: any) => u.emailVerified).length}
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1 transition-colors duration-300">
                Admins
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 transition-colors duration-300">
                {data.users.users.filter((u: any) => u.role === 'ADMIN' || u.role === 'OWNER').length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}