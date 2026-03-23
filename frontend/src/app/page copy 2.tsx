'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

export default function HomePage() {
  const packages = [
    {
      name: 'Starter',
      price: '€29',
      period: '/Monat',
      description: 'Perfekt für kleine Projekte',
      features: [
        '✅ Website Builder',
        '✅ 3 Benutzer',
        '✅ Basic Support',
        '✅ SSL Zertifikat',
        '❌ CMS',
        '❌ Shop System',
      ],
      color: 'from-blue-500 to-cyan-500',
      popular: false,
    },
    {
      name: 'Business',
      price: '€79',
      period: '/Monat',
      description: 'Für wachsende Unternehmen',
      features: [
        '✅ Website Builder',
        '✅ CMS System',
        '✅ 10 Benutzer',
        '✅ Priority Support',
        '✅ Analytics',
        '❌ Shop System',
      ],
      color: 'from-cyan-500 to-teal-500',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '€199',
      period: '/Monat',
      description: 'All-in-One Lösung',
      features: [
        '✅ Website Builder',
        '✅ CMS System',
        '✅ Shop System',
        '✅ Unbegrenzte Benutzer',
        '✅ 24/7 Support',
        '✅ Alle Apps inklusive',
      ],
      color: 'from-teal-500 to-emerald-500',
      popular: false,
    },
  ];

  const apps = [
    {
      name: '📊 Analytics Pro',
      description: 'Erweiterte Statistiken und Reports',
      price: '€19/Monat',
      included: ['Business', 'Enterprise'],
    },
    {
      name: '📧 Email Marketing',
      description: 'Newsletter und Kampagnen',
      price: '€29/Monat',
      included: ['Enterprise'],
    },
    {
      name: '🔒 Advanced Security',
      description: '2FA, IP-Whitelist, Audit Logs',
      price: '€39/Monat',
      included: ['Enterprise'],
    },
    {
      name: '🤖 AI Assistant',
      description: 'KI-gestützte Content-Erstellung',
      price: '€49/Monat',
      included: [],
    },
  ];

  const features = [
    {
      icon: '🎨',
      title: 'Website Builder',
      description: 'Drag & Drop Editor für moderne Websites ohne Code-Kenntnisse',
    },
    {
      icon: '📝',
      title: 'Content Management',
      description: 'Professionelles CMS für Blogs, News und dynamische Inhalte',
    },
    {
      icon: '🛒',
      title: 'E-Commerce',
      description: 'Vollständiges Shop-System mit Zahlungsabwicklung',
    },
    {
      icon: '📱',
      title: 'Responsive Design',
      description: 'Perfekte Darstellung auf allen Geräten automatisch',
    },
    {
      icon: '⚡',
      title: 'Blitzschnell',
      description: 'Optimierte Performance und schnelle Ladezeiten',
    },
    {
      icon: '🔧',
      title: 'Erweiterbar',
      description: 'Apps und Integrationen nach Bedarf hinzufügen',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-foreground">SaaS Platform</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-foreground hover:text-primary transition-colors duration-300">
                Features
              </a>
              <a href="#pricing" className="text-foreground hover:text-primary transition-colors duration-300">
                Preise
              </a>
              <a href="#apps" className="text-foreground hover:text-primary transition-colors duration-300">
                Apps
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost">Anmelden</Button>
              </Link>
              <Link href="/register">
                <Button className="btn-glow">Kostenlos starten</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 transition-colors duration-300">
              Die All-in-One Lösung für
              <span className="text-primary"> dein Online Business</span>
            </h1>
            <p className="text-xl text-foreground mb-8 transition-colors duration-300">
              Website Builder, CMS und Shop-System in einer Plattform. 
              Erweitere deine Möglichkeiten mit leistungsstarken Apps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="btn-glow text-lg px-8 py-6">
                  Jetzt kostenlos testen
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Mehr erfahren
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-foreground">
              Keine Kreditkarte erforderlich • 14 Tage kostenlos testen
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 transition-colors duration-300">
              Alles was du brauchst
            </h2>
            <p className="text-xl text-foreground transition-colors duration-300">
              Eine Plattform, unendliche Möglichkeiten
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="text-center">
                <CardContent className="p-6">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-foreground mb-2 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-foreground transition-colors duration-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 transition-colors duration-300">
              Wähle dein Package
            </h2>
            <p className="text-xl text-foreground transition-colors duration-300">
              Transparent und fair – wachse mit deinen Anforderungen
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <Card 
                key={index} 
                hover 
                className={`relative ${pkg.popular ? 'border-primary border-2 shadow-lg' : ''}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Beliebt
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-center">
                    <div className={`text-3xl font-bold bg-gradient-to-r ${pkg.color} bg-clip-text text-transparent mb-2`}>
                      {pkg.name}
                    </div>
                    <div className="text-4xl font-bold text-foreground transition-colors duration-300">
                      {pkg.price}
                      <span className="text-lg font-normal text-foreground">
                        {pkg.period}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-2 transition-colors duration-300">
                      {pkg.description}
                    </p>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="text-foreground transition-colors duration-300">
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button 
                      fullWidth 
                      className={pkg.popular ? 'btn-glow' : ''}
                      variant={pkg.popular ? 'default' : 'outline'}
                    >
                      Jetzt starten
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Apps Section */}
      <section id="apps" className="py-20 bg-muted/50 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 transition-colors duration-300">
              Erweitere deine Plattform
            </h2>
            <p className="text-xl text-foreground transition-colors duration-300">
              Leistungsstarke Apps für jeden Bedarf
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {apps.map((app, index) => (
              <Card key={index} hover>
                <CardContent className="p-6">
                  <div className="text-3xl mb-3">{app.name.split(' ')[0]}</div>
                  <h3 className="text-lg font-bold text-foreground mb-2 transition-colors duration-300">
                    {app.name.substring(3)}
                  </h3>
                  <p className="text-sm text-foreground mb-4 transition-colors duration-300">
                    {app.description}
                  </p>
                  <div className="text-lg font-semibold text-primary mb-3">
                    {app.price}
                  </div>
                  {app.included.length > 0 && (
                    <div className="text-xs text-foreground transition-colors duration-300">
                      ✨ Inkl. bei: {app.included.join(', ')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 transition-colors duration-300">
                Bereit durchzustarten?
              </h2>
              <p className="text-xl text-foreground mb-8 transition-colors duration-300">
                Starte noch heute und bringe dein Business auf das nächste Level
              </p>
              <Link href="/register">
                <Button size="lg" className="btn-glow text-lg px-8 py-6">
                  Kostenlos registrieren
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">S</span>
                </div>
                <span className="font-bold text-foreground">SaaS Platform</span>
              </div>
              <p className="text-sm text-foreground transition-colors duration-300">
                Die All-in-One Lösung für dein Online Business
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4 transition-colors duration-300">Produkt</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-foreground hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-foreground hover:text-primary transition-colors">Preise</a></li>
                <li><a href="#apps" className="text-foreground hover:text-primary transition-colors">Apps</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4 transition-colors duration-300">Unternehmen</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-foreground hover:text-primary transition-colors">Über uns</a></li>
                <li><a href="#" className="text-foreground hover:text-primary transition-colors">Kontakt</a></li>
                <li><a href="#" className="text-foreground hover:text-primary transition-colors">Karriere</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4 transition-colors duration-300">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-foreground hover:text-primary transition-colors">Datenschutz</a></li>
                <li><a href="#" className="text-foreground hover:text-primary transition-colors">AGB</a></li>
                <li><a href="#" className="text-foreground hover:text-primary transition-colors">Impressum</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-foreground transition-colors duration-300">
            © 2025 SaaS Platform. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
}