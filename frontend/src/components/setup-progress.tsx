'use client';

import { useQuery, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState } from 'react';

const SETUP_QUERY = gql`
  query SetupProgress($tenantId: String!) {
    wbTemplates(tenantId: $tenantId) {
      id
      isDefault
      pages {
        id
        slug
        name
      }
    }
    me {
      tenant { id name slug }
      user { firstName lastName phone }
    }
  }
`;

interface Step {
  id: string;
  label: string;
  desc: string;
  href: string;
  icon: string;
  done: boolean;
  priority: 'high' | 'medium' | 'low';
}

export function SetupProgress() {
  const { tenant } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  const { data, loading } = useQuery(SETUP_QUERY, {
    variables: { tenantId: tenant?.id },
    skip: !tenant?.id,
  });

  if (loading || dismissed) return null;

  const templates = data?.wbTemplates || [];
  const defaultTemplate = templates.find((t: any) => t.isDefault);
  const allPages = defaultTemplate?.pages || [];

  const hasImpressum = allPages.some((p: any) =>
    p.slug === 'impressum' || p.name?.toLowerCase().includes('impressum'),
  );
  const hasDatenschutz = allPages.some((p: any) =>
    p.slug === 'datenschutz' || p.name?.toLowerCase().includes('datenschutz'),
  );
  const hasWebsite = templates.length > 0;
  const hasLiveWebsite = !!defaultTemplate;
  const tenantInfo = data?.me?.tenant;
  const userInfo = data?.me?.user;
  const hasPhone = !!userInfo?.phone;

  const steps: Step[] = [
    {
      id: 'website',
      label: 'Website erstellen',
      desc: 'Erste Website anlegen und konfigurieren',
      href: '/dashboard/website-builder/create',
      icon: '🎨',
      done: hasWebsite,
      priority: 'high',
    },
    {
      id: 'live',
      label: 'Website aktivieren',
      desc: 'Eine Website als Standard (Live) setzen',
      href: '/dashboard/website-builder',
      icon: '🌐',
      done: hasLiveWebsite,
      priority: 'high',
    },
    {
      id: 'impressum',
      label: 'Impressum ausfüllen',
      desc: 'Pflichtangaben nach deutschem Recht eintragen',
      href: defaultTemplate
        ? `/dashboard/website-builder/website-templates/${defaultTemplate.id}`
        : '/dashboard/website-builder',
      icon: '⚖️',
      done: hasImpressum,
      priority: 'high',
    },
    {
      id: 'datenschutz',
      label: 'Datenschutz ausfüllen',
      desc: 'DSGVO-konforme Datenschutzerklärung anlegen',
      href: defaultTemplate
        ? `/dashboard/website-builder/website-templates/${defaultTemplate.id}`
        : '/dashboard/website-builder',
      icon: '🔒',
      done: hasDatenschutz,
      priority: 'high',
    },
    {
      id: 'navigation',
      label: 'Navigation einrichten',
      desc: 'Header- und Footer-Menü konfigurieren',
      href: '/dashboard/website-builder/navigation',
      icon: '🧭',
      done: false, // TODO: query navigations
      priority: 'medium',
    },
    {
      id: 'domain',
      label: 'Custom Domain',
      desc: 'Eigene Domain verbinden (optional)',
      href: '/dashboard/settings/domain',
      icon: '🌍',
      done: !!tenantInfo?.customDomain,
      priority: 'low',
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const totalCount = steps.length;
  const pct = Math.round((doneCount / totalCount) * 100);
  const isComplete = doneCount === totalCount;

  if (isComplete) return null;

  const nextStep = steps.find((s) => !s.done);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-bold text-foreground">
              🚀 Website-Einrichtung
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
              {doneCount}/{totalCount}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {pct < 50
              ? 'Deine Website ist fast fertig — ein paar Schritte fehlen noch.'
              : pct < 100
              ? 'Fast geschafft! Letzte Schritte ausstehend.'
              : 'Alles erledigt! 🎉'}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none ml-3 flex-shrink-0"
          title="Ausblenden"
        >
          ×
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-primary w-8 text-right">{pct}%</span>
        </div>
      </div>

      {/* Steps */}
      <div className="px-5 pb-5 space-y-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              step.done
                ? 'opacity-50'
                : step.id === nextStep?.id
                ? 'bg-primary/5 border border-primary/20'
                : 'hover:bg-muted/50'
            }`}
          >
            {/* Check Circle */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all ${
              step.done
                ? 'bg-green-500 text-white'
                : step.id === nextStep?.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}>
              {step.done ? '✓' : step.icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold leading-tight ${
                step.done ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}>
                {step.label}
              </p>
              {!step.done && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{step.desc}</p>
              )}
            </div>

            {/* CTA */}
            {!step.done && (
              <Link
                href={step.href}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  step.id === nextStep?.id
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-foreground hover:bg-muted/70'
                }`}
              >
                {step.id === nextStep?.id ? 'Jetzt →' : 'Öffnen'}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 border-t border-border pt-3">
        <p className="text-[11px] text-muted-foreground text-center">
          ⚖️ Impressum und Datenschutz sind gesetzlich vorgeschrieben — bitte ausfüllen bevor du live gehst.
        </p>
      </div>
    </div>
  );
}