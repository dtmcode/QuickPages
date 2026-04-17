'use client';
// 📂 PFAD: frontend/src/components/auth/auth-layout.tsx

import Link from 'next/link';

const PACKAGE_LABELS: Record<string, { name: string; price: string; icon: string }> = {
  website_micro:        { name: 'Website Micro',        price: '9',   icon: '🌐' },
  website_standard:     { name: 'Website Standard',     price: '19',  icon: '🌐' },
  website_pro:          { name: 'Website Pro',          price: '29',  icon: '🌐' },
  blog_personal:        { name: 'Blog Personal',        price: '19',  icon: '✍️' },
  blog_publisher:       { name: 'Blog Publisher',       price: '39',  icon: '✍️' },
  blog_magazine:        { name: 'Blog Magazine',        price: '79',  icon: '✍️' },
  business_starter:     { name: 'Business Starter',     price: '29',  icon: '💼' },
  business_professional:{ name: 'Business Professional',price: '59',  icon: '💼' },
  business_agency:      { name: 'Business Agency',      price: '99',  icon: '💼' },
  shop_mini:            { name: 'Shop Mini',            price: '39',  icon: '🛒' },
  shop_wachstum:        { name: 'Shop Wachstum',        price: '69',  icon: '🛒' },
  shop_premium:         { name: 'Shop Premium',         price: '119', icon: '🛒' },
  members_community:    { name: 'Members Community',    price: '29',  icon: '🔐' },
  members_kurse:        { name: 'Members Kurse',        price: '59',  icon: '🔐' },
  members_academy:      { name: 'Members Academy',      price: '99',  icon: '🔐' },
};

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  selectedPackage?: string | null;
}

export function AuthLayout({ children, title, subtitle, selectedPackage }: AuthLayoutProps) {
  const pkg = selectedPackage ? PACKAGE_LABELS[selectedPackage] : null;

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden flex-col justify-between p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-600/5 blur-2xl" />
        </div>

        {/* Logo */}
        <div className="relative">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center font-black text-white text-lg shadow-lg group-hover:scale-105 transition-transform">
              Q
            </div>
            <span className="text-white font-bold text-xl tracking-tight">myquickpage</span>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative space-y-8">
          {/* Selected package badge */}
          {pkg && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3">
              <span className="text-2xl">{pkg.icon}</span>
              <div>
                <p className="text-white/60 text-xs">Ausgewähltes Paket</p>
                <p className="text-white font-bold text-sm">{pkg.name} · €{pkg.price}/Monat</p>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-white text-3xl font-bold leading-tight mb-4">
              Deine Website.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                In Minuten fertig.
              </span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Alles was du brauchst — Website Builder, Shop, Newsletter, Buchungen, Blog und mehr. DSGVO-konform. Made in Germany.
            </p>
          </div>

          {/* Trust signals */}
          <div className="space-y-3">
            {[
              { icon: '🇩🇪', text: 'Deutsche Server · DSGVO-konform' },
              { icon: '⚡', text: 'In 5 Minuten online' },
              { icon: '🔒', text: 'SSL-Zertifikat inklusive' },
              { icon: '↩️', text: 'Monatlich kündbar' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <span className="text-white/70 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative">
          <p className="text-white/30 text-xs">
            © 2025 myquickpage.de · <Link href="/impressum" className="hover:text-white/50 transition">Impressum</Link> · <Link href="/datenschutz" className="hover:text-white/50 transition">Datenschutz</Link>
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile logo */}
        <div className="lg:hidden px-6 pt-6 pb-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-black text-white">
              Q
            </div>
            <span className="font-bold text-foreground">myquickpage</span>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile package badge */}
            {pkg && (
              <div className="lg:hidden flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2 mb-6">
                <span>{pkg.icon}</span>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-semibold">{pkg.name}</span> · €{pkg.price}/Monat
                </p>
              </div>
            )}

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}