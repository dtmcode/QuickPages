'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PackageTiers } from '@/components/packages/PackageTiers';

/* ═══════════════════════════════════════════════════════════
   QuickPages Landing Page
   Nutzt: ThemeProvider, ThemeToggle, Button, Card
   CSS-Variablen: bg-background, text-foreground, bg-primary, etc.
   ═══════════════════════════════════════════════════════════ */

interface PackageFeature {
  label: string;
  detail?: string;
}

interface PackageDef {
  name: string;
  price: number;
  target: string;
  description: string;
  highlight?: boolean;
  features: PackageFeature[];
  addons?: { name: string; price: string }[];
  upgradeTip?: string;
}

const PACKAGES: PackageDef[] = [
  {
    name: 'Page',
    price: 9,
    target: 'Freelancer, Einzelpersonen',
    description:
      'Eine professionelle Landing Page mit eigenem Design. Template wählen, Texte anpassen, online gehen.',
    features: [
      { label: '1 Landing Page' },
      { label: 'Website Builder', detail: 'Drag & Drop mit Sections: Hero, Features, Kontakt, Galerie und mehr' },
      { label: '1 Kontaktformular' },
      { label: 'Basis-Analytics', detail: 'Seitenaufrufe pro Tag, datenschutzkonform' },
      { label: 'SEO Grundlagen', detail: 'Meta-Titel, Beschreibung, Open Graph' },
      { label: 'SSL Zertifikat' },
      { label: '1 Benutzer' },
      { label: '100 MB Speicher' },
    ],
    upgradeTip: 'Mehr Seiten oder Blog? \u2192 Creator',
  },
  {
    name: 'Creator',
    price: 19,
    target: 'Blogger, Berater, Portfolios',
    description:
      'Mehrere Seiten, Blog mit Kommentaren und eigene Domain. F\u00fcr alle, die regelm\u00e4\u00dfig Inhalte ver\u00f6ffentlichen.',
    features: [
      { label: 'Bis zu 10 Seiten' },
      { label: 'Blog mit 50 Beitr\u00e4gen', detail: 'Rich-Text-Editor, Kategorien, geplante Ver\u00f6ffentlichung' },
      { label: 'Blog-Kommentare', detail: 'Moderation: Freigeben, Spam, L\u00f6schen, Anpinnen' },
      { label: 'Eigene Domain', detail: 'deine-firma.de statt deine-firma.quickpages.de' },
      { label: '3 Kontaktformulare' },
      { label: '2 Benutzer' },
      { label: '1 GB Speicher' },
      { label: 'Kein QuickPages-Branding' },
    ],
    addons: [
      { name: 'Newsletter', price: '+\u20ac9' },
      { name: 'Booking', price: '+\u20ac9' },
      { name: 'Form Builder', price: '+\u20ac5' },
    ],
    upgradeTip: 'Newsletter + Booking inklusive? \u2192 Business',
  },
  {
    name: 'Business',
    price: 39,
    target: 'Dienstleister, Coaches, Handwerker',
    description:
      'Blog, Newsletter, Terminbuchung, Formulare und eigenes E-Mail-System. Alles was ein Dienstleister braucht.',
    highlight: true,
    features: [
      { label: '30 Seiten' },
      { label: '200 Blog-Beitr\u00e4ge' },
      { label: 'Newsletter', detail: 'Kampagnen an 1.000 Abonnenten, Tracking, Tags' },
      { label: 'Booking System', detail: 'Services, Verf\u00fcgbarkeiten, Puffer, Best\u00e4tigungs-E-Mails' },
      { label: 'Form Builder', detail: '10 Feldtypen: Text, E-Mail, Dropdown, Datum und mehr' },
      { label: 'E-Mail-System (SMTP)', detail: 'Gmail, Outlook, Strato \u2014 f\u00fcr Benachrichtigungen' },
      { label: 'Erweiterte Analytics', detail: 'Referrer, Ger\u00e4te, Verweildauer, CSV-Export' },
      { label: '5 Benutzer' },
      { label: '5 GB Speicher' },
    ],
    addons: [
      { name: 'Shop Modul', price: '+\u20ac15' },
      { name: 'AI Content', price: '+\u20ac9' },
      { name: 'Mehrsprachigkeit', price: '+\u20ac5' },
    ],
    upgradeTip: 'Produkte verkaufen? \u2192 Shop',
  },
  {
    name: 'Shop',
    price: 59,
    target: 'Online-Shops, H\u00e4ndler, Gastronomen',
    description:
      'Vollst\u00e4ndiges Shop-System mit Stripe-Zahlungen. Produkte, Bestellungen, Kunden \u2014 alles in einer Plattform.',
    features: [
      { label: '200 Produkte', detail: 'Bilder, Preise, Kategorien, Warenkorb, Checkout' },
      { label: 'Stripe Payments', detail: 'Kreditkarte, SEPA, Apple Pay, Google Pay' },
      { label: 'Bestellverwaltung', detail: 'Status: Offen \u2192 In Bearbeitung \u2192 Versendet' },
      { label: 'Newsletter mit 3.000 Abonnenten' },
      { label: '50 Seiten' },
      { label: '500 Blog-Beitr\u00e4ge' },
      { label: '10 Benutzer' },
      { label: '10 GB Speicher' },
    ],
    addons: [
      { name: 'AI Content', price: '+\u20ac9' },
      { name: 'Mehrsprachigkeit', price: '+\u20ac5' },
      { name: 'Extra Produkte (200)', price: '+\u20ac10' },
    ],
    upgradeTip: 'AI + i18n inklusive? \u2192 Professional',
  },
  {
    name: 'Professional',
    price: 99,
    target: 'Agenturen, wachsende Unternehmen',
    description:
      'Alle Features inklusive: AI-Content, Mehrsprachigkeit, gro\u00dfer Shop. F\u00fcr Teams die keine Kompromisse machen.',
    features: [
      { label: 'AI Content inklusive', detail: 'Texte generieren, verbessern, \u00fcbersetzen. 500 Anfragen/Monat' },
      { label: 'Mehrsprachigkeit', detail: 'Website, Blog und Shop in bis zu 13 Sprachen' },
      { label: '1.000 Produkte' },
      { label: '10.000 Newsletter-Abonnenten' },
      { label: '100 Seiten' },
      { label: '1.000 Blog-Beitr\u00e4ge' },
      { label: '25 Benutzer' },
      { label: '25 GB Speicher' },
      { label: 'Eigene Templates', detail: 'Vorlagen erstellen und im Team teilen' },
      { label: 'Dedizierter Support', detail: 'Pers\u00f6nlicher Ansprechpartner, Antwort in 4h' },
    ],
    addons: [
      { name: 'Extra Produkte (500)', price: '+\u20ac15' },
      { name: 'Extra AI Credits (500)', price: '+\u20ac9' },
      { name: 'Extra Benutzer', price: '+\u20ac3/User' },
    ],
  },
];

const FEATURES = [
  { icon: '\uD83C\uDFA8', title: 'Website Builder', desc: 'Drag & Drop Editor mit fertigen Sections: Hero, Features, Galerie, Testimonials, Kontakt, Preise und mehr. Kein Code n\u00f6tig.' },
  { icon: '\uD83D\uDCDD', title: 'Blog & CMS', desc: 'Schreibe Artikel mit dem Rich-Text-Editor. Kategorien, geplante Ver\u00f6ffentlichungen. Besucher k\u00f6nnen kommentieren.' },
  { icon: '\uD83D\uDED2', title: 'Online-Shop', desc: 'Produkte mit Bildern und Kategorien. Warenkorb, Checkout, Stripe-Zahlungen. Bestellungen verwalten.' },
  { icon: '\uD83D\uDCC5', title: 'Terminbuchung', desc: 'Kunden buchen online Termine. Du legst Services, Zeiten und Puffer fest. Automatische Best\u00e4tigungs-E-Mails.' },
  { icon: '\uD83D\uDCE7', title: 'Newsletter', desc: 'E-Mail-Adressen sammeln, Kampagnen versenden, \u00d6ffnungsraten tracken. Empf\u00e4nger nach Tags filtern.' },
  { icon: '\uD83D\uDCCB', title: 'Form Builder', desc: 'Erstelle Formulare mit 10 Feldtypen: Text, E-Mail, Dropdown, Checkbox, Datum und mehr. Alle Einsendungen gespeichert.' },
  { icon: '\uD83E\uDD16', title: 'AI Content', desc: 'KI schreibt Blogtexte, verbessert Formulierungen, \u00fcbersetzt Inhalte und schl\u00e4gt SEO-Titel vor. Direkt im Editor.' },
  { icon: '\uD83D\uDCCA', title: 'Analytics', desc: 'Seitenaufrufe, Referrer, Ger\u00e4te, Verweildauer. Datenschutzkonform ohne Cookies. CSV-Export.' },
  { icon: '\uD83C\uDF10', title: 'Mehrsprachigkeit', desc: 'Deine Website in bis zu 13 Sprachen. Besucher w\u00e4hlen ihre Sprache. Jeder Text \u00fcbersetzbar.' },
];

const ADDONS = [
  { name: 'Shop Modul', price: '\u20ac15/mo', desc: 'Produkte verkaufen mit Warenkorb und Bestellverwaltung.', from: 'Business' },
  { name: 'Newsletter', price: '\u20ac9/mo', desc: 'E-Mail-Kampagnen an bis zu 500 Empf\u00e4nger.', from: 'Creator' },
  { name: 'Booking', price: '\u20ac9/mo', desc: 'Online-Terminbuchung mit Kalender und Best\u00e4tigungen.', from: 'Creator' },
  { name: 'AI Content', price: '\u20ac9/mo', desc: 'KI-Texte, Verbesserungen, \u00dcbersetzungen.', from: 'Business' },
  { name: 'Form Builder', price: '\u20ac5/mo', desc: 'Beliebige Formulare mit 10 Feldtypen.', from: 'Creator' },
  { name: 'Mehrsprachigkeit', price: '\u20ac5/mo', desc: 'Website in bis zu 13 Sprachen.', from: 'Business' },
  { name: 'Extra Benutzer', price: '\u20ac3/mo', desc: 'Zus\u00e4tzliche Team-Accounts mit Rollen.', from: 'Alle Pakete' },
];

export default function HomePage() {
  const [expandedPkg, setExpandedPkg] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">Q</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Quick<span className="text-primary">Pages</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pakete" className="hover:text-foreground transition-colors">Pakete</a>
            <a href="#addons" className="hover:text-foreground transition-colors">Add-ons</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">Anmelden</Button>
            </Link>
            <Link href="/register">
              <Button>Kostenlos starten</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] pointer-events-none bg-primary/10" />

        <div className="relative container mx-auto px-4 sm:px-6 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Website Builder + CMS + Shop + Booking + Newsletter
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Deine Website.
            <br />
            <span className="text-primary">In Minuten.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Landing Pages, Blog, Online-Shop, Terminbuchung und Newsletter &mdash;
            alles in einer Plattform. W&auml;hle was du brauchst, erweitere wenn du w&auml;chst.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-base px-8 py-6">
                14 Tage kostenlos testen
              </Button>
            </Link>
            <a href="#pakete">
              <Button size="lg" variant="outline" className="text-base px-8 py-6">
                Pakete vergleichen
              </Button>
            </a>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Keine Kreditkarte n&ouml;tig &middot; Jederzeit k&uuml;ndbar &middot; DSGVO-konform
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 border-t border-border bg-muted/30 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Alles in einer Plattform</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Keine 10 verschiedenen Tools. Kein Plugin-Chaos. Alles funktioniert zusammen.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <Card key={i} hover>
                <CardContent className="p-6">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
 <section id="pakete" className="py-16 sm:py-24 border-t border-border transition-colors duration-300">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ein Paket für jeden Bedarf</h2>
      <p className="text-muted-foreground text-lg max-w-xl mx-auto">
        Starte klein, erweitere mit Add-ons, steige auf wenn du bereit bist.
      </p>
    </div>
    <PackageTiers
      mode="homepage"
      ctaHref="/register"
      ctaLabel="Jetzt starten"
      defaultCategory="website"
      showAlwaysIncluded
    />
  </div>
</section>

      {/* Add-ons */}
      <section id="addons" className="py-16 sm:py-24 border-t border-border bg-muted/30 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Add-ons</h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">
              Buche einzelne Features zu deinem Paket dazu. Jederzeit aktivieren und k&uuml;ndigen.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {ADDONS.map((a, i) => (
              <Card key={i} hover>
                <CardContent className="p-5 flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    <h4 className="text-sm font-semibold">{a.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.desc}</p>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      Verf&uuml;gbar ab: <span className="font-medium">{a.from}</span>
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-primary whitespace-nowrap">{a.price}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 border-t border-border transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">In 3 Schritten online</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Registrieren', desc: 'Account erstellen, Paket w\u00e4hlen. Keine Kreditkarte f\u00fcr die Testphase.' },
              { step: '02', title: 'Anpassen', desc: 'Template w\u00e4hlen, Texte und Bilder einf\u00fcgen, Farben anpassen. Alles per Drag & Drop.' },
              { step: '03', title: 'Ver\u00f6ffentlichen', desc: 'Domain verbinden und live gehen. \u00c4nderungen jederzeit. Updates sofort online.' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-primary/20 mb-3">{s.step}</div>
                <h3 className="text-base font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 border-t border-border bg-muted/30 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-10 sm:p-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Bereit f&uuml;r deine Website?</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                Starte mit dem Page-Paket f&uuml;r &euro;9/Monat und erweitere jederzeit.
              </p>
              <Link href="/register">
                <Button size="lg" className="text-base px-8 py-6">Jetzt 14 Tage kostenlos testen</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">Q</span>
                </div>
                <span className="text-sm font-semibold">Quick<span className="text-primary">Pages</span></span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Website Builder, CMS, Shop und mehr &mdash; eine Plattform f&uuml;r dein Business.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-3">Produkt</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pakete" className="hover:text-foreground transition-colors">Pakete</a></li>
                <li><a href="#addons" className="hover:text-foreground transition-colors">Add-ons</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-3">Unternehmen</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">&Uuml;ber uns</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Kontakt</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Datenschutz</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">AGB</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Impressum</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-border text-center text-xs text-muted-foreground">
            &copy; 2026 QuickPages. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
}