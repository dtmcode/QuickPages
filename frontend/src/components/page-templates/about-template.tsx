import { Card, CardContent } from '@/components/ui/card';

interface TemplateProps {
  page: {
    title: string;
    content?: string;
    metaDescription?: string;
  };
}

export function AboutTemplate({ page }: TemplateProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {page.title}
          </h1>
          {page.metaDescription && (
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {page.metaDescription}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Story Section */}
        {page.content && (
          <Card className="mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Unsere Geschichte
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                  {page.content}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Unser Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">👤</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    Team Mitglied {i}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Position</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Kurze Beschreibung der Person
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Unsere Werte
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl mb-3">💡</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Innovation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Wir denken voraus und entwickeln zukunftsorientierte Lösungen.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl mb-3">🤝</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Zusammenarbeit
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Gemeinsam erreichen wir mehr als allein.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl mb-3">⭐</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Qualität
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Exzellenz in allem was wir tun.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Fokus
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Klar definierte Ziele und konsequente Umsetzung.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}