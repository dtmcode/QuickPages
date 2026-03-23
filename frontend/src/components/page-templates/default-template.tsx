import { Card, CardContent } from '@/components/ui/card';

interface TemplateProps {
  page: {
    title: string;
    content?: string;
    metaDescription?: string;
  };
}

export function DefaultTemplate({ page }: TemplateProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {page.title}
          </h1>
          {page.metaDescription && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {page.metaDescription}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {page.content}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}