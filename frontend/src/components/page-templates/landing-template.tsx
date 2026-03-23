import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TemplateProps {
  page: {
    title: string;
    content?: string;
    metaDescription?: string;
  };
}

export function LandingTemplate({ page }: TemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {page.title}
          </h1>
          {page.metaDescription && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              {page.metaDescription}
            </p>
          )}
          <div className="flex gap-4 justify-center">
            <Button size="lg">Jetzt starten</Button>
            <Button size="lg" variant="ghost">Mehr erfahren</Button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      {page.content && (
        <section className="px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                    {page.content}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="px-4 py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Schnell</h3>
                <p className="text-gray-600 dark:text-gray-400">Blitzschnelle Performance</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Sicher</h3>
                <p className="text-gray-600 dark:text-gray-400">Höchste Sicherheitsstandards</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">💎</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Premium</h3>
                <p className="text-gray-600 dark:text-gray-400">Erstklassige Qualität</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}