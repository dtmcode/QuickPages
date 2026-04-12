'use client';

import { useQuery, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { usePackage } from '@/contexts/package-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PackageBadge } from '@/components/package-badge';
import { Button } from '@/components/ui/button';
import { UsageDashboard } from '@/components/usage-dashboard';
import Link from 'next/link';

const ME_QUERY = gql`
  query Me {
    me {
      user { id email firstName lastName role emailVerified }
      tenant { id name slug package }
    }
  }
`;

export default function DashboardPage() {
  const { user, tenant } = useAuth();
  const { data, loading } = useQuery(ME_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  const { hasFeature, getLimit, currentPackage, packageName } = usePackage();

  const stats = [
    { name: 'Gesamtumsatz', value: '€0', change: '+0%', trend: 'up' },
    { name: 'Neue Benutzer', value: '1', change: '+100%', trend: 'up' },
    { name: 'Posts', value: '0', change: '+0%', trend: 'up' },
    { name: 'Besucher', value: '0', change: '0%', trend: 'up' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lädt...</p>
        </div>
      </div>
    );
  }

  const currentUser = data?.me?.user || user;
  const currentTenant = data?.me?.tenant || tenant;

  return (
    <div className="space-y-8">
      {/* Welcome with Package Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground transition-colors duration-300">
            Willkommen zurück, {currentUser?.firstName}! 👋
          </h1>
          <p className="mt-2 text-muted-foreground transition-colors duration-300">
            Hier ist eine Übersicht deiner wichtigsten Kennzahlen.
          </p>
        </div>
        <PackageBadge />
      </div>

      {/* Package Info */}
      <Card hover>
        <CardHeader>
          <CardTitle>📦 Dein Package</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="p-4 bg-muted rounded-lg transition-all duration-300 hover:bg-primary/5 border border-border">
              <div className="text-sm text-muted-foreground">Package</div>
              <div className="text-2xl font-bold text-foreground capitalize transition-colors duration-300">
                {packageName}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg transition-all duration-300 hover:bg-primary/5 border border-border">
              <div className="text-sm text-muted-foreground">User Limit</div>
              <div className="text-2xl font-bold text-foreground transition-colors duration-300">
                {getLimit('users') === -1 ? '∞' : getLimit('users')}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg transition-all duration-300 hover:bg-primary/5 border border-border">
              <div className="text-sm text-muted-foreground">Posts Limit</div>
              <div className="text-2xl font-bold text-foreground transition-colors duration-300">
                {getLimit('posts') === -1 ? '∞' : getLimit('posts')}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg transition-all duration-300 hover:bg-primary/5 border border-border">
              <div className="text-sm text-muted-foreground">Produkte Limit</div>
              <div className="text-2xl font-bold text-foreground transition-colors duration-300">
                {getLimit('products') === -1 ? '∞' : getLimit('products') || '0'}
              </div>
            </div>
          </div>

          {currentPackage !== 'enterprise' && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between transition-all duration-300 hover:bg-primary/10 hover:border-primary/30">
              <div>
                <div className="font-semibold text-foreground transition-colors duration-300">
                  Möchtest du mehr Features?
                </div>
                <div className="text-sm text-muted-foreground transition-colors duration-300">
                  {currentPackage === 'starter' && 'Upgrade auf Business für Shop & Analytics'}
                  {currentPackage === 'business' && 'Upgrade auf Enterprise für Email System & unbegrenzte Features'}
                </div>
              </div>
              <Link href="/dashboard/packages">
                <Button className="btn-glow">Upgrade</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground transition-colors duration-300">
                  {stat.name}
                </p>
                <span className={`text-xs font-medium transition-colors duration-300 ${
                  stat.trend === 'up' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground transition-colors duration-300">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Schnellaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hasFeature('cms') && (
              <Link 
                href="/dashboard/cms/posts/new" 
                className="p-4 rounded-lg border border-border transition-all duration-300 hover:bg-primary/10 hover:border-primary/50 hover:shadow-md card-hover group"
              >
                <div className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                  📝 Neuer Post
                </div>
                <div className="text-sm text-muted-foreground transition-colors duration-300">
                  Inhalt erstellen
                </div>
              </Link>
            )}
            
            {hasFeature('shop') ? (
              <Link 
                href="/dashboard/shop/products/new" 
                className="p-4 rounded-lg border border-border transition-all duration-300 hover:bg-primary/10 hover:border-primary/50 hover:shadow-md card-hover group"
              >
                <div className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                  🛒 Neues Produkt
                </div>
                <div className="text-sm text-muted-foreground transition-colors duration-300">
                  Shop erweitern
                </div>
              </Link>
            ) : (
              <div className="p-4 rounded-lg border-2 border-dashed border-border opacity-50 transition-all duration-300">
                <div className="font-medium text-foreground">🔒 Shop</div>
                <div className="text-sm text-muted-foreground">Upgrade für Shop</div>
              </div>
            )}

            <Link 
              href="/dashboard/users" 
              className="p-4 rounded-lg border border-border transition-all duration-300 hover:bg-primary/10 hover:border-primary/50 hover:shadow-md card-hover group"
            >
              <div className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                👥 Benutzer
              </div>
              <div className="text-sm text-muted-foreground transition-colors duration-300">
                Team verwalten
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card hover>
          <CardHeader>
            <CardTitle>👤 Benutzer-Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border transition-colors duration-300">
                <span className="text-sm text-muted-foreground transition-colors duration-300">Name:</span>
                <span className="text-sm font-medium text-foreground transition-colors duration-300">
                  {currentUser?.firstName} {currentUser?.lastName}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border transition-colors duration-300">
                <span className="text-sm text-muted-foreground transition-colors duration-300">E-Mail:</span>
                <span className="text-sm font-medium text-foreground transition-colors duration-300">
                  {currentUser?.email}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border transition-colors duration-300">
                <span className="text-sm text-muted-foreground transition-colors duration-300">Rolle:</span>
                <span className="text-sm font-medium text-foreground capitalize transition-colors duration-300">
                  {currentUser?.role}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground transition-colors duration-300">E-Mail verifiziert:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full transition-colors duration-300 ${
                  currentUser?.emailVerified 
                    ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20' 
                    : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
                }`}>
                  {currentUser?.emailVerified ? 'Ja ✓' : 'Nein ✗'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <CardTitle>🏢 Workspace-Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border transition-colors duration-300">
                <span className="text-sm text-muted-foreground transition-colors duration-300">Name:</span>
                <span className="text-sm font-medium text-foreground transition-colors duration-300">
                  {currentTenant?.name}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border transition-colors duration-300">
                <span className="text-sm text-muted-foreground transition-colors duration-300">Slug:</span>
                <span className="text-sm font-medium text-primary transition-colors duration-300">
                  {currentTenant?.slug}
                </span>
              </div>
              <div className="flex justify-between items-start py-2">
                <span className="text-sm text-muted-foreground transition-colors duration-300">Aktive Features:</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                  {hasFeature('cms') && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20 transition-all duration-300 hover:bg-primary/20">
                      CMS
                    </span>
                  )}
                  {hasFeature('shop') && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20 transition-all duration-300 hover:bg-primary/20">
                      Shop
                    </span>
                  )}
                  {hasFeature('analytics') && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20 transition-all duration-300 hover:bg-primary/20">
                      Analytics
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Dashboard */}
      <UsageDashboard />
    </div>
  );
}