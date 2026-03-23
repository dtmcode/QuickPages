'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CTASectionProps {
  config?: {
    title?: string;
    subtitle?: string;
    primaryButtonText?: string;
    primaryButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    backgroundColor?: string;
    variant?: 'default' | 'card';
  };
}

export function CTASection({ config }: CTASectionProps) {
  const {
    title = 'Ready to Get Started?',
    subtitle = 'Join thousands of satisfied customers today',
    primaryButtonText = 'Get Started',
    primaryButtonLink = '#',
    secondaryButtonText = 'Learn More',
    secondaryButtonLink = '#',
    backgroundColor,
    variant = 'default',
  } = config || {};

  const content = (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mb-8 text-lg text-muted-foreground">{subtitle}</p>
      <div className="flex flex-wrap justify-center gap-4">
        <a href={primaryButtonLink}>
          <Button size="lg">
            {primaryButtonText}
            <span className="ml-2">→</span>
          </Button>
        </a>
        {secondaryButtonText && (
          <a href={secondaryButtonLink}>
            <Button size="lg" variant="outline">
              {secondaryButtonText}
            </Button>
          </a>
        )}
      </div>
    </div>
  );

  if (variant === 'card') {
    return (
      <section className="container mx-auto px-4 py-24" style={{ backgroundColor }}>
        <Card className="p-12">{content}</Card>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-24" style={{ backgroundColor }}>
      {content}
    </section>
  );
}