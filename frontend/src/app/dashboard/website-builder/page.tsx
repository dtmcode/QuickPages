'use client';

import { useQuery, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const DASHBOARD_STATS = gql`
  query DashboardStats($tenantId: String!) {
    wbTemplates(tenantId: $tenantId) {
      id
      name
      isDefault
      isActive
      thumbnailUrl
      createdAt
    }
  }
`;

export default function WebsiteBuilderDashboard() {
  const { tenant } = useAuth();

  const { data, loading } = useQuery(DASHBOARD_STATS, {
    variables: { tenantId: tenant?.id },
    skip: !tenant?.id,
  });

  const templates = data?.wbTemplates || [];
  const activeTemplates = templates.filter((t: any) => t.isActive);
  const defaultTemplate = templates.find((t: any) => t.isDefault);

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2 text-foreground transition-colors duration-300">
          🎨 Website Builder
        </h1>
        <p className="text-muted-foreground transition-colors duration-300">
          Erstelle professionelle Websites mit Templates, Pages und Sections
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Templates */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 border-0 shadow-lg card-hover overflow-hidden relative group">
          <CardContent className="p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-blue-100 text-sm font-medium">Templates</p>
                <p className="text-4xl font-bold mt-1">{templates.length}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                📄
              </div>
            </div>
            <Link 
              href="/dashboard/website-builder/website-templates" 
              className="text-sm text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-1"
            >
              Alle ansehen <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </CardContent>
        </Card>

        {/* Active Templates */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 border-0 shadow-lg card-hover overflow-hidden relative group">
          <CardContent className="p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-green-100 text-sm font-medium">Aktive Templates</p>
                <p className="text-4xl font-bold mt-1">{activeTemplates.length}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                ✅
              </div>
            </div>
            <p className="text-sm text-green-100">{templates.length - activeTemplates.length} inaktiv</p>
          </CardContent>
        </Card>

        {/* Default Template */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 border-0 shadow-lg card-hover overflow-hidden relative group">
          <CardContent className="p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-purple-100 text-sm font-medium">Standard Template</p>
                <p className="text-xl font-bold mt-1 truncate">{defaultTemplate?.name || 'Nicht gesetzt'}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shrink-0 ml-2">
                ⭐
              </div>
            </div>
            {defaultTemplate && (
              <Link 
                href={`/dashboard/website-builder/website-templates/${defaultTemplate.id}`} 
                className="text-sm text-purple-100 hover:text-white transition-colors duration-300 flex items-center gap-1"
              >
                Öffnen <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 border-0 shadow-lg card-hover overflow-hidden relative group">
          <CardContent className="p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-orange-100 text-sm font-medium">Navigation</p>
                <p className="text-xl font-bold mt-1">Menüs</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                🧭
              </div>
            </div>
            <Link 
              href="/dashboard/website-builder/navigation" 
              className="text-sm text-orange-100 hover:text-white transition-colors duration-300 flex items-center gap-1"
            >
              Menüs verwalten <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Templates - MITTLERE GRÖSSE */}
      {templates.length > 0 ? (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-foreground transition-colors duration-300">
              📋 Deine Templates
            </h2>
            <Link 
              href="/dashboard/website-builder/website-templates" 
              className="text-primary hover:text-primary/80 font-medium transition-colors duration-300 flex items-center gap-1"
            >
              Alle ansehen <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {templates.slice(0, 6).map((template: any) => (
              <Link
                key={template.id}
                href={`/dashboard/website-builder/website-templates/${template.id}`}
              >
                <Card className="shadow-md hover:shadow-lg card-hover group overflow-hidden">
                  {template.thumbnailUrl ? (
                    <div className="h-40 bg-muted overflow-hidden">
                      <img 
                        src={template.thumbnailUrl} 
                        alt={template.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-5xl">
                      🎨
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-300 mb-3 line-clamp-1">
                      {template.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {template.isDefault && (
                        <span className="px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 rounded-full text-xs font-medium transition-all duration-300">
                          ⭐ Standard
                        </span>
                      )}
                      {template.isActive && (
                        <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30 rounded-full text-xs font-medium transition-all duration-300">
                          ✓ Aktiv
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="text-8xl mb-6">🎨</div>
            <h3 className="text-2xl font-bold mb-3 text-foreground transition-colors duration-300">
              Willkommen beim Website Builder!
            </h3>
            <p className="text-muted-foreground mb-8 transition-colors duration-300">
              Erstelle dein erstes Template
            </p>
            <Link href="/dashboard/website-builder/website-templates">
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 shadow-lg btn-glow transition-all duration-300">
                Erstes Template erstellen
              </button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Guide */}
      <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20 shadow-lg">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold mb-6 text-foreground transition-colors duration-300 flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            So geht's:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex gap-3 group">
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-foreground transition-colors duration-300">
                  Template erstellen
                </h4>
                <p className="text-sm text-muted-foreground transition-colors duration-300">
                  Basis für deine Website
                </p>
              </div>
            </div>
            <div className="flex gap-3 group">
              <div className="w-10 h-10 bg-purple-600 dark:bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-foreground transition-colors duration-300">
                  Pages hinzufügen
                </h4>
                <p className="text-sm text-muted-foreground transition-colors duration-300">
                  Homepage, About, Contact...
                </p>
              </div>
            </div>
            <div className="flex gap-3 group">
              <div className="w-10 h-10 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-foreground transition-colors duration-300">
                  Sections erstellen
                </h4>
                <p className="text-sm text-muted-foreground transition-colors duration-300">
                  Hero, Features, CTA...
                </p>
              </div>
            </div>
            <div className="flex gap-3 group">
              <div className="w-10 h-10 bg-orange-600 dark:bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-foreground transition-colors duration-300">
                  Navigation einrichten
                </h4>
                <p className="text-sm text-muted-foreground transition-colors duration-300">
                  Menüs verwalten
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}