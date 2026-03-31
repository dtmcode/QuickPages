'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PackageTiers } from '@/components/packages/PackageTiers';

// ─── DATA ────────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: '🎨', title: 'Website Builder', desc: 'Drag & Drop mit fertigen Sections. Hero, Features, Galerie, Kontakt – kein Code.' },
  { icon: '📝', title: 'Blog & CMS', desc: 'Rich-Text-Editor, Kategorien, geplante Veröffentlichungen, Kommentare.' },
  { icon: '🛒', title: 'Online-Shop', desc: 'Produkte, Warenkorb, Checkout. Stripe-Zahlungen: Karte, SEPA, Apple Pay.' },
  { icon: '📅', title: 'Terminbuchung', desc: 'Services & Verfügbarkeiten definieren. Kunden buchen online. Bestätigungen automatisch.' },
  { icon: '📧', title: 'Newsletter', desc: 'Kampagnen versenden, Öffnungsraten tracken, Empfänger nach Tags filtern.' },
  { icon: '📋', title: 'Form Builder', desc: '10 Feldtypen: Text, E-Mail, Dropdown, Checkbox, Datum. Alle Einsendungen gespeichert.' },
  { icon: '🤖', title: 'AI Content', desc: 'KI schreibt Blogtexte, verbessert Formulierungen, übersetzt Inhalte.' },
  { icon: '📊', title: 'Analytics', desc: 'Datenschutzkonform. Keine Cookies. Referrer, Geräte, Verweildauer, CSV-Export.' },
  { icon: '🌐', title: 'Mehrsprachigkeit', desc: 'Deine Website in bis zu 13 Sprachen. Besucher wählen automatisch.' },
];

const COMPARISONS = [
  { feature: 'Website Builder', us: true, wp: '⚠ Plugins nötig', shopify: '⚠ Nur Shop' },
  { feature: 'Blog & CMS', us: true, wp: true, shopify: '⚠ Eingeschränkt' },
  { feature: 'Online-Shop', us: true, wp: '⚠ WooCommerce', shopify: true },
  { feature: 'Terminbuchung', us: true, wp: '⚠ Plugin €€€', shopify: false },
  { feature: 'Newsletter', us: true, wp: '⚠ Mailchimp extra', shopify: '⚠ Mailchimp extra' },
  { feature: 'Form Builder', us: true, wp: '⚠ Plugin', shopify: false },
  { feature: 'Analytics (DSGVO)', us: true, wp: false, shopify: false },
  { feature: 'Hosting inklusive', us: true, wp: false, shopify: true },
  { feature: 'DSGVO Made in Germany', us: true, wp: false, shopify: false },
  { feature: 'Preis ab', us: '€9/mo', wp: '€15+/mo', shopify: '€29/mo' },
];

const ADDONS = [
  { icon: '🛒', name: 'Shop Modul', price: '€15/mo', desc: 'Produkte, Warenkorb, Stripe', from: 'Business' },
  { icon: '📧', name: 'Newsletter', price: '€9/mo', desc: 'Bis 500 Empfänger', from: 'Creator' },
  { icon: '📅', name: 'Booking', price: '€9/mo', desc: 'Online-Terminbuchung', from: 'Creator' },
  { icon: '🤖', name: 'AI Content', price: '€9/mo', desc: '500 KI-Anfragen/Monat', from: 'Business' },
  { icon: '📋', name: 'Form Builder', price: '€5/mo', desc: '10 Feldtypen, unbegrenzt', from: 'Creator' },
  { icon: '🌐', name: 'Mehrsprachigkeit', price: '€5/mo', desc: 'Bis 13 Sprachen', from: 'Business' },
  { icon: '👥', name: 'Extra Benutzer', price: '€3/mo', desc: 'Pro zusätzlichem Account', from: 'Alle' },
];

const FAQS = [
  {
    q: 'Brauche ich technisches Wissen?',
    a: 'Nein. Der Drag & Drop Editor funktioniert ohne Code. Template wählen, Texte anpassen, fertig.',
  },
  {
    q: 'Was passiert nach den 14 Tagen?',
    a: 'Du kannst das Paket deiner Wahl wählen. Keine automatische Abbuchung ohne deine Bestätigung.',
  },
  {
    q: 'Kann ich meine eigene Domain verbinden?',
    a: 'Ja, ab dem Creator-Paket. DNS-Einstellungen bei deinem Anbieter, fertig in wenigen Minuten.',
  },
  {
    q: 'Ist die Plattform DSGVO-konform?',
    a: 'Ja. Server in Deutschland, keine US-Cloud-Dienste, Privacy-by-Design. Unsere Analytics tracken ohne Cookies.',
  },
  {
    q: 'Kann ich jederzeit kündigen?',
    a: 'Ja, monatlich kündbar. Keine Mindestlaufzeit, keine versteckten Gebühren.',
  },
  {
    q: 'Kann ich später auf ein größeres Paket wechseln?',
    a: 'Ja, jederzeit mit einem Klick. Alle deine Inhalte bleiben erhalten.',
  },
];

const STEPS = [
  { n: '01', title: 'Registrieren', desc: 'Account erstellen, Paket wählen. 14 Tage kostenlos testen — keine Kreditkarte.' },
  { n: '02', title: 'Gestalten', desc: 'Template wählen, Texte & Bilder einfügen, Farben anpassen — alles per Drag & Drop.' },
  { n: '03', title: 'Online gehen', desc: 'Domain verbinden und live gehen. Änderungen jederzeit, sofort sichtbar.' },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">Q</span>
            </div>
            <span className="text-base font-semibold">
              my<span className="text-primary">quickpage</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#vergleich" className="hover:text-foreground transition-colors">Vergleich</a>
            <a href="#pakete" className="hover:text-foreground transition-colors">Pakete</a>
            <a href="#addons" className="hover:text-foreground transition-colors">Add-ons</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm">Anmelden</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Kostenlos testen</Button>
            </Link>
            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menü"
            >
              <div className="w-5 flex flex-col gap-1">
                <span className={`h-0.5 bg-foreground transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`h-0.5 bg-foreground transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`h-0.5 bg-foreground transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-4 flex flex-col gap-3 text-sm">
            {['features', 'vergleich', 'pakete', 'addons', 'faq'].map(id => (
              <a
                key={id}
                href={`#${id}`}
                className="py-2 text-muted-foreground hover:text-foreground capitalize"
                onClick={() => setMobileMenuOpen(false)}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </a>
            ))}
            <Link href="/login" className="py-2 text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
              Anmelden
            </Link>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[160px] bg-primary/8" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-primary/25 bg-primary/8 text-xs text-primary font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
              DSGVO-konform · Made in Germany · Keine US-Cloud
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Eine Plattform.<br />
              <span className="text-primary">Alles was du brauchst.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Website Builder, Blog, Shop, Terminbuchung und Newsletter — ohne Plugin-Chaos, ohne Agentur, ohne Vorkenntnisse. Ab <strong className="text-foreground">€9/Monat</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12">
                  14 Tage kostenlos testen
                </Button>
              </Link>
              <a href="#pakete">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-12">
                  Pakete vergleichen →
                </Button>
              </a>
            </div>

            <p className="text-xs text-muted-foreground">
              Keine Kreditkarte · Jederzeit kündbar · Server in Deutschland
            </p>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { value: '< 5 Min', label: 'bis zur fertigen Seite' },
              { value: '€9', label: 'Einstiegspreis/Monat' },
              { value: '9 Module', label: 'in einer Plattform' },
              { value: '100%', label: 'DSGVO-konform' },
            ].map((s, i) => (
              <div key={i} className="text-center p-4 rounded-xl border border-border bg-card/50">
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{s.value}</div>
                <div className="text-xs text-muted-foreground leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-16 sm:py-24 border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Alles in einer Plattform</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Kein Plugin-Chaos. Keine 10 verschiedenen Tools. Alles funktioniert zusammen — und ist DSGVO-konform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 sm:py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">In 3 Schritten online</h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">
              Vom leeren Browser zur fertigen Website — ohne Agentur, ohne Code.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {STEPS.map((s, i) => (
              <div key={i} className="relative text-center p-6 rounded-2xl border border-border bg-card">
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border z-10" />
                )}
                <div className="text-5xl font-black text-primary/15 mb-3">{s.n}</div>
                <h3 className="text-base font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section id="vergleich" className="py-16 sm:py-24 border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">myquickpage vs. Alternativen</h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">
              WordPress braucht 12 Plugins. Shopify kann keinen Blog. Wir können alles — in einer Plattform.
            </p>
          </div>

          <div className="max-w-3xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground w-1/2">Feature</th>
                  <th className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      my<span className="font-black">quickpage</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center text-muted-foreground font-medium">WordPress</th>
                  <th className="py-3 px-4 text-center text-muted-foreground font-medium">Shopify</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISONS.map((row, i) => (
                  <tr key={i} className={`border-b border-border/50 ${i % 2 === 0 ? 'bg-muted/20' : ''}`}>
                    <td className="py-3 px-4 font-medium">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {row.us === true
                        ? <span className="text-green-500 text-base">✓</span>
                        : <span className="text-sm font-semibold text-primary">{row.us}</span>
                      }
                    </td>
                    <td className="py-3 px-4 text-center text-muted-foreground text-xs">
                      {row.wp === true ? <span className="text-green-500 text-base">✓</span>
                        : row.wp === false ? <span className="text-red-400">✗</span>
                        : row.wp}
                    </td>
                    <td className="py-3 px-4 text-center text-muted-foreground text-xs">
                      {row.shopify === true ? <span className="text-green-500 text-base">✓</span>
                        : row.shopify === false ? <span className="text-red-400">✗</span>
                        : row.shopify}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── PACKAGES ── */}
      <section id="pakete" className="py-16 sm:py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ein Paket für jeden Bedarf</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Starte klein, erweitere mit Add-ons, wechsle hoch wenn du wächst.
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

      {/* ── ADD-ONS ── */}
      <section id="addons" className="py-16 sm:py-24 border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Add-ons: Nur was du brauchst</h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">
              Aktiviere einzelne Module — jederzeit dazu buchen oder kündigen. Kein Paket-Upgrade nötig.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {ADDONS.map((a, i) => (
              <div key={i} className="relative p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 group">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{a.icon}</span>
                  <span className="text-sm font-bold text-primary">{a.price}</span>
                </div>
                <h4 className="text-sm font-semibold mb-1 group-hover:text-primary transition-colors">{a.name}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{a.desc}</p>
                <div className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground inline-block">
                  ab {a.from}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Alle Add-ons sind monatlich kündbar · Keine Mindestlaufzeit · Sofort aktiv
          </p>
        </div>
      </section>

      {/* ── DSGVO TRUST SECTION ── */}
      <section className="py-16 sm:py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">DSGVO-konform. Made in Germany.</h2>
            <p className="text-muted-foreground">
              Wir entwickeln und betreiben myquickpage in Deutschland. Deine Daten verlassen nie die EU.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { icon: '🇩🇪', title: 'Server in Deutschland', desc: 'Gehostet auf deutschen Servern. Keine US-Cloud, kein Datentransfer in Drittländer.' },
              { icon: '🔒', title: 'Privacy by Design', desc: 'Analytics ohne Cookies. Keine Tracking-Pixel. Keine Datenweitergabe an Dritte.' },
              { icon: '📋', title: 'Rechtssicher', desc: 'Impressum, Datenschutz und Cookie-Banner automatisch mitgeliefert und aktuell gehalten.' },
            ].map((t, i) => (
              <div key={i} className="p-5 rounded-2xl border border-border bg-card text-center">
                <div className="text-3xl mb-3">{t.icon}</div>
                <h4 className="text-sm font-semibold mb-2">{t.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 sm:py-24 border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Häufige Fragen</h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <button
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold">{faq.q}</span>
                  <span className={`text-primary flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 sm:py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="relative rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/8 to-primary/3 p-10 sm:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Bereit für deine Website?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                Starte heute kostenlos. Keine Kreditkarte, keine Bindung — nur deine neue Website.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12">
                    14 Tage kostenlos testen
                  </Button>
                </Link>
                <a href="#pakete">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-12">
                    Pakete ansehen
                  </Button>
                </a>
              </div>
              <p className="mt-5 text-xs text-muted-foreground">
                Page-Paket ab €9/Monat · Jederzeit kündbar · DSGVO-konform
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">Q</span>
                </div>
                <span className="text-sm font-semibold">my<span className="text-primary">quickpage</span></span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                Website Builder, CMS, Shop und mehr — eine Plattform für deutsches Business. DSGVO-konform, Made in Germany.
              </p>
            </div>

            {/* Links */}
            {[
              {
                title: 'Produkt',
                links: [
                  { label: 'Features', href: '#features' },
                  { label: 'Pakete', href: '#pakete' },
                  { label: 'Add-ons', href: '#addons' },
                  { label: 'Vergleich', href: '#vergleich' },
                ],
              },
              {
                title: 'Unternehmen',
                links: [
                  { label: 'Über uns', href: '#' },
                  { label: 'Blog', href: '#' },
                  { label: 'Kontakt', href: '#' },
                ],
              },
              {
                title: 'Legal',
                links: [
                  { label: 'Datenschutz', href: '#' },
                  { label: 'AGB', href: '#' },
                  { label: 'Impressum', href: '#' },
                  { label: 'Cookie-Einstellungen', href: '#' },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>© 2026 myquickpage. Alle Rechte vorbehalten.</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>Server in Deutschland · DSGVO-konform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}