'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const tools = [
  {
    name: 'Link Manager',
    description: 'Verwalte und teile deine Page-Links',
    icon: '🔗',
    href: '/dashboard/tools/links',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'QR Code Generator',
    description: 'Erstelle QR Codes für deine Pages',
    icon: '📱',
    href: '/dashboard/tools/qr-codes',
    color: 'from-purple-500 to-pink-500',
    soon: true,
  },
  {
    name: 'Analytics',
    description: 'Sehe Page-Statistiken',
    icon: '📊',
    href: '/dashboard/tools/analytics',
    color: 'from-green-500 to-emerald-500',
    soon: true,
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">🔧 Apps & Tools</h1>
        <p className="mt-1 text-purple-100">
          Nützliche Tools für deine Website
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.name}
            href={tool.href}
            className={`group block ${tool.soon ? 'pointer-events-none opacity-60' : ''}`}
          >
            <Card className="transition-all hover:shadow-lg hover:scale-105">
              <CardHeader>
                <div className={`mb-4 inline-flex rounded-full bg-gradient-to-r ${tool.color} p-4 text-4xl`}>
                  {tool.icon}
                </div>
                <CardTitle className="flex items-center gap-2">
                  {tool.name}
                  {tool.soon && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Soon
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  {tool.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}