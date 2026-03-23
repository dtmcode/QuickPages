export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'marketing' | 'info' | 'ecommerce' | 'other';
  preview: string;
  content: string;
  customCSS?: string;
}

export const pageTemplates: PageTemplate[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Starte mit einer leeren Seite',
    icon: '⬜',
    category: 'other',
    preview: '/templates/blank.png',
    content: `<h1>Willkommen</h1><p>Beginne hier mit deinem Content...</p>`,
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Hero + Features + CTA',
    icon: '🚀',
    category: 'marketing',
    preview: '/templates/landing.png',
    content: `
<div class="hero">
  <h1>Willkommen zu unserem Produkt</h1>
  <p class="lead">Die beste Lösung für dein Business</p>
  <a href="#" class="cta-button">Jetzt starten</a>
</div>

<div class="features">
  <h2>Features</h2>
  <div class="feature-grid">
    <div class="feature">
      <h3>⚡ Schnell</h3>
      <p>Blitzschnelle Performance</p>
    </div>
    <div class="feature">
      <h3>🔒 Sicher</h3>
      <p>Enterprise-grade Security</p>
    </div>
    <div class="feature">
      <h3>💰 Günstig</h3>
      <p>Faire Preise für alle</p>
    </div>
  </div>
</div>

<div class="cta-section">
  <h2>Bereit loszulegen?</h2>
  <p>Starte jetzt deine kostenlose Trial</p>
  <a href="#" class="cta-button">Kostenlos testen</a>
</div>
    `,
    customCSS: `
.hero {
  text-align: center;
  padding: 80px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.lead {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.cta-button {
  display: inline-block;
  padding: 15px 40px;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  transition: transform 0.2s;
}

.cta-button:hover {
  transform: scale(1.05);
}

.features {
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.features h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature {
  text-align: center;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.cta-section {
  text-align: center;
  padding: 80px 20px;
  background: #f7fafc;
}
    `,
  },
  {
    id: 'about',
    name: 'About Us',
    description: 'Team + Mission + Values',
    icon: '👥',
    category: 'info',
    preview: '/templates/about.png',
    content: `
<div class="about-hero">
  <h1>Über uns</h1>
  <p class="tagline">Wir machen das Internet besser</p>
</div>

<div class="mission">
  <h2>Unsere Mission</h2>
  <p>Wir glauben daran, dass Technologie Menschen verbinden und das Leben einfacher machen sollte. Deshalb entwickeln wir Produkte mit Leidenschaft und Fokus auf Nutzerfreundlichkeit.</p>
</div>

<div class="team">
  <h2>Unser Team</h2>
  <div class="team-grid">
    <div class="team-member">
      <div class="avatar">👤</div>
      <h3>Max Mustermann</h3>
      <p>CEO & Founder</p>
    </div>
    <div class="team-member">
      <div class="avatar">👤</div>
      <h3>Anna Schmidt</h3>
      <p>CTO</p>
    </div>
    <div class="team-member">
      <div class="avatar">👤</div>
      <h3>Tom Weber</h3>
      <p>Head of Design</p>
    </div>
  </div>
</div>

<div class="values">
  <h2>Unsere Werte</h2>
  <ul>
    <li>✨ Innovation</li>
    <li>🤝 Transparenz</li>
    <li>💚 Nachhaltigkeit</li>
    <li>🎯 Exzellenz</li>
  </ul>
</div>
    `,
    customCSS: `
.about-hero {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.mission, .team, .values {
  max-width: 1000px;
  margin: 60px auto;
  padding: 0 20px;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.team-member {
  text-align: center;
}

.avatar {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.values ul {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.values li {
  font-size: 1.2rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
}
    `,
  },
  {
    id: 'contact',
    name: 'Kontakt',
    description: 'Kontaktformular + Info',
    icon: '📧',
    category: 'info',
    preview: '/templates/contact.png',
    content: `
<div class="contact-header">
  <h1>Kontaktiere uns</h1>
  <p>Wir freuen uns auf deine Nachricht!</p>
</div>

<div class="contact-content">
  <div class="contact-info">
    <h2>Kontaktinformationen</h2>
    <div class="info-item">
      <strong>📧 Email:</strong>
      <p>info@deine-firma.de</p>
    </div>
    <div class="info-item">
      <strong>📱 Telefon:</strong>
      <p>+49 123 456789</p>
    </div>
    <div class="info-item">
      <strong>📍 Adresse:</strong>
      <p>Musterstraße 123<br>12345 Musterstadt</p>
    </div>
    <div class="info-item">
      <strong>🕐 Öffnungszeiten:</strong>
      <p>Mo-Fr: 9:00 - 18:00 Uhr</p>
    </div>
  </div>

  <div class="contact-form">
    <h2>Schreib uns</h2>
    <form>
      <div class="form-group">
        <label>Name</label>
        <input type="text" placeholder="Dein Name" required>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" placeholder="deine@email.de" required>
      </div>
      <div class="form-group">
        <label>Nachricht</label>
        <textarea rows="5" placeholder="Deine Nachricht..." required></textarea>
      </div>
      <button type="submit" class="submit-btn">Nachricht senden</button>
    </form>
  </div>
</div>
    `,
    customCSS: `
.contact-header {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.contact-content {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
}

@media (max-width: 768px) {
  .contact-content {
    grid-template-columns: 1fr;
  }
}

.info-item {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #5568d3;
}
    `,
  },
  {
    id: 'pricing',
    name: 'Pricing',
    description: 'Preistabelle mit Features',
    icon: '💰',
    category: 'ecommerce',
    preview: '/templates/pricing.png',
    content: `
<div class="pricing-header">
  <h1>Unsere Preise</h1>
  <p>Wähle den perfekten Plan für dich</p>
</div>

<div class="pricing-grid">
  <div class="pricing-card">
    <h3>Starter</h3>
    <div class="price">
      <span class="currency">€</span>
      <span class="amount">9</span>
      <span class="period">/Monat</span>
    </div>
    <ul class="features">
      <li>✓ 5 Projekte</li>
      <li>✓ 10 GB Storage</li>
      <li>✓ Email Support</li>
      <li>✗ API Access</li>
    </ul>
    <button class="select-plan">Auswählen</button>
  </div>

  <div class="pricing-card featured">
    <div class="badge">Beliebt</div>
    <h3>Business</h3>
    <div class="price">
      <span class="currency">€</span>
      <span class="amount">29</span>
      <span class="period">/Monat</span>
    </div>
    <ul class="features">
      <li>✓ 50 Projekte</li>
      <li>✓ 100 GB Storage</li>
      <li>✓ Priority Support</li>
      <li>✓ API Access</li>
    </ul>
    <button class="select-plan">Auswählen</button>
  </div>

  <div class="pricing-card">
    <h3>Enterprise</h3>
    <div class="price">
      <span class="currency">€</span>
      <span class="amount">99</span>
      <span class="period">/Monat</span>
    </div>
    <ul class="features">
      <li>✓ Unlimited Projekte</li>
      <li>✓ 1 TB Storage</li>
      <li>✓ 24/7 Support</li>
      <li>✓ Custom Integration</li>
    </ul>
    <button class="select-plan">Auswählen</button>
  </div>
</div>
    `,
    customCSS: `
.pricing-header {
  text-align: center;
  padding: 60px 20px;
}

.pricing-grid {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.pricing-card {
  position: relative;
  padding: 2rem;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pricing-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.pricing-card.featured {
  border-color: #667eea;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
}

.badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 16px;
  background: #667eea;
  color: white;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.price {
  margin: 2rem 0;
  font-weight: bold;
}

.currency {
  font-size: 1.5rem;
}

.amount {
  font-size: 3rem;
}

.period {
  font-size: 1rem;
  color: #718096;
}

.features {
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  text-align: left;
}

.features li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f7fafc;
}

.select-plan {
  width: 100%;
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.select-plan:hover {
  background: #5568d3;
}

.featured .select-plan {
  background: #764ba2;
}

.featured .select-plan:hover {
  background: #663a8f;
}
    `,
  },
  {
    id: 'faq',
    name: 'FAQ',
    description: 'Häufige Fragen',
    icon: '❓',
    category: 'info',
    preview: '/templates/faq.png',
    content: `
<div class="faq-header">
  <h1>Häufig gestellte Fragen</h1>
  <p>Hier findest du Antworten auf die wichtigsten Fragen</p>
</div>

<div class="faq-container">
  <div class="faq-item">
    <h3>Wie kann ich mich anmelden?</h3>
    <p>Klicke einfach auf den "Registrieren" Button oben rechts und folge den Anweisungen. Die Registrierung dauert nur wenige Minuten.</p>
  </div>

  <div class="faq-item">
    <h3>Welche Zahlungsmethoden werden akzeptiert?</h3>
    <p>Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, Amex), PayPal, SEPA-Lastschrift und Überweisung.</p>
  </div>

  <div class="faq-item">
    <h3>Kann ich jederzeit kündigen?</h3>
    <p>Ja, du kannst dein Abonnement jederzeit monatlich kündigen. Es gibt keine versteckten Kosten oder Kündigungsfristen.</p>
  </div>

  <div class="faq-item">
    <h3>Gibt es eine kostenlose Testphase?</h3>
    <p>Ja, wir bieten eine 14-tägige kostenlose Testphase an. Du brauchst keine Kreditkarte für die Testphase anzugeben.</p>
  </div>

  <div class="faq-item">
    <h3>Wie funktioniert der Support?</h3>
    <p>Unser Support-Team ist Mo-Fr von 9-18 Uhr per Email und Live-Chat erreichbar. Enterprise-Kunden erhalten 24/7 Support.</p>
  </div>

  <div class="faq-item">
    <h3>Sind meine Daten sicher?</h3>
    <p>Absolut! Wir nutzen modernste Verschlüsselungstechnologien und sind DSGVO-konform. Deine Daten werden niemals an Dritte weitergegeben.</p>
  </div>
</div>

<div class="faq-contact">
  <h2>Weitere Fragen?</h2>
  <p>Unser Support-Team hilft dir gerne weiter</p>
  <a href="/contact" class="contact-btn">Kontakt aufnehmen</a>
</div>
    `,
    customCSS: `
.faq-header {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.faq-container {
  max-width: 800px;
  margin: 60px auto;
  padding: 0 20px;
}

.faq-item {
  padding: 2rem;
  margin-bottom: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s;
}

.faq-item:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.faq-item h3 {
  margin-bottom: 1rem;
  color: #2d3748;
}

.faq-item p {
  color: #718096;
  line-height: 1.6;
}

.faq-contact {
  text-align: center;
  padding: 60px 20px;
  background: #f7fafc;
  margin-top: 60px;
}

.contact-btn {
  display: inline-block;
  padding: 12px 32px;
  margin-top: 1rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.2s;
}

.contact-btn:hover {
  background: #5568d3;
}
    `,
  },
];