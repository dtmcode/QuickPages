'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Feature {
  title: string;
  description: string;
  icon?: string;
}

interface FeaturesSectionProps {
  config?: {
    title?: string;
    subtitle?: string;
    features?: Feature[];
    columns?: 2 | 3 | 4;
  };
}

export function FeaturesSection({ config }: FeaturesSectionProps) {
  const {
    title = 'Our Features',
    subtitle = 'Everything you need to succeed',
    features = [
      { title: 'Fast Performance', description: 'Lightning fast load times', icon: '⚡' },
      { title: 'Secure', description: 'Enterprise-grade security', icon: '🔒' },
      { title: 'Scalable', description: 'Grows with your business', icon: '📈' },
      { title: '24/7 Support', description: 'Always here to help', icon: '💬' },
    ],
    columns = 3,
  } = config || {};

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        <p className="text-lg text-muted-foreground">{subtitle}</p>
      </div>

      <div className={`grid gap-6 ${gridCols[columns]}`}>
        {features.map((feature, index) => (
          <Card key={index} className="text-center transition-all hover:shadow-lg">
            <CardHeader>
              {feature.icon && (
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-4 text-4xl">
                  {feature.icon}
                </div>
              )}
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}