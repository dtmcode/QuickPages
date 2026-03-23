'use client';

import { usePackage } from '@/contexts/package-context';
import { Card, CardContent } from '@/components/ui/card';

export function PackageBadge() {
  const { currentPackage, packageName } = usePackage();

  const colors = {
    starter: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    business: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    enterprise: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  };

  const icons = {
    starter: '📦',
    business: '💼',
    enterprise: '🚀',
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium" 
         style={{ backgroundColor: 'transparent' }}>
      <span className={`px-3 py-1 rounded-full ${colors[currentPackage as keyof typeof colors]}`}>
        <span className="mr-1">{icons[currentPackage as keyof typeof icons]}</span>
        {packageName} Plan
      </span>
    </div>
  );
}

export function UpgradePrompt({ feature }: { feature: string }) {
  const featureNames = {
    shop: 'Shop',
    email: 'Email System',
    analytics: 'Analytics',
    customDomain: 'Custom Domain',
  };

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
      <CardContent className="p-6 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {featureNames[feature as keyof typeof featureNames]} nicht verfügbar
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Upgrade auf BUSINESS oder ENTERPRISE um diese Funktion freizuschalten
        </p>
        <div className="flex gap-3 justify-center">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Upgrade auf Business
          </button>
          <a 
            href="mailto:sales@yourcompany.com" 
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Kontakt
          </a>
        </div>
      </CardContent>
    </Card>
  );
}