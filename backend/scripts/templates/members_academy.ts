// 📂 PFAD: backend/scripts/templates/members_academy.ts
// Paket: members_academy — "CodeCraft Academy" — Web Dev Bootcamp von Elena Vogel
// Run: npx ts-node -r tsconfig-paths/register scripts/templates/members_academy.ts [--force]

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { wbGlobalTemplates, wbGlobalTemplatePages, wbGlobalTemplateSections } from '../../src/drizzle/website-builder.schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);
const TEMPLATE_NAME = 'Demo — Coding Academy (members_academy)';

async function main() {
  const force = process.argv.includes('--force');
  const [ex] = await db.select({ id: wbGlobalTemplates.id }).from(wbGlobalTemplates).where(eq(wbGlobalTemplates.name, TEMPLATE_NAME)).limit(1);
  if (ex && !force) { console.log('⏭️  Existiert bereits. --force zum Überschreiben.'); await pool.end(); return; }
  if (ex) await db.delete(wbGlobalTemplates).where(eq(wbGlobalTemplates.id, ex.id));

  const [t] = await db.insert(wbGlobalTemplates).values({
    name: TEMPLATE_NAME,
    description: 'Full-Stack Web Dev Bootcamp mit Kursen, Projekten, Live-Coaching und Job-Garantie',
    category: 'members_academy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop',
    isActive: true, isPremium: false,
    settings: {
      package: 'members_academy', niche: 'coding-bootcamp',
      colors: { primary: '#18181b', secondary: '#09090b', accent: '#22d3ee', background: '#09090b', text: '#f4f4f5' },
    },
  }).returning();

  // STARTSEITE
  const [home] = await db.insert(wbGlobalTemplatePages).values({
    templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0,
  }).returning();

  await db.insert(wbGlobalTemplateSections).values([
    {
      pageId: home.id, name: 'Hero', type: 'hero', order: 0,
      content: {
        heading: 'CodeCraft Academy — Werde Full-Stack Developer in 6 Monaten',
        subheading: 'HTML bis React, Node.js bis Datenbanken. Praxisorientiertes Online-Bootcamp mit Live-Coaching, echten Projekten und Job-Garantie.',
        buttonText: 'Jetzt bewerben', buttonLink: '#bewerbung',
        secondaryButtonText: 'Curriculum', secondaryButtonLink: '/curriculum',
        imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1400&h=600&fit=crop',
        badge: '💼 Job-Garantie · 94% Vermittlungsquote · Ø Startgehalt 58.000€',
      },
      styling: { backgroundColor: '#09090b', textColor: '#f4f4f5' },
    },
    {
      pageId: home.id, name: 'Ergebnisse', type: 'stats', order: 1,
      content: {
        items: [
          { value: '94%', label: 'Vermittlungsquote', description: 'Innerhalb von 3 Monaten' },
          { value: '58k€', label: 'Ø Startgehalt', description: 'Unserer Absolventen' },
          { value: '320+', label: 'Absolventen', description: 'Seit 2022' },
          { value: '6 Mo', label: 'Bootcamp-Dauer', description: 'Vollzeit oder Teilzeit' },
        ],
      },
      styling: { backgroundColor: '#18181b', textColor: '#22d3ee' },
    },
    {
      pageId: home.id, name: 'Was du lernst', type: 'features', order: 2,
      content: {
        heading: 'Der Full-Stack Stack 2024',
        subtitle: 'Alle Technologien die Arbeitgeber wirklich suchen',
        items: [
          { icon: '🌐', title: 'Frontend', description: 'HTML, CSS, JavaScript, React. Responsive Design, State Management, Performance.', imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=250&fit=crop' },
          { icon: '⚙️', title: 'Backend', description: 'Node.js, Express, REST APIs, GraphQL. Authentifizierung, Middleware, Deployment.', imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop' },
          { icon: '🗄️', title: 'Datenbanken', description: 'SQL mit PostgreSQL, NoSQL mit MongoDB. Datenbankdesign, Queries, Optimierung.', imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=250&fit=crop' },
          { icon: '🚀', title: 'DevOps & Deployment', description: 'Git, Docker, CI/CD, AWS. Vom lokalen Code in die Produktion — sauber und automatisiert.', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop' },
        ],
      },
    },
    {
      pageId: home.id, name: 'Über Elena', type: 'about', order: 3,
      content: {
        heading: 'Elena Vogel — Gründerin & Lead Instructor',
        text: `<p>Elena Vogel war 8 Jahre Senior Engineer bei Spotify und Zalando bevor sie 2022 die CodeCraft Academy gründete. Ihr Ziel: Ein Bootcamp das nicht nur Coding beibringt, sondern echte Engineers formt.</p>
<p>Kein Copy-Paste-Tutorial-Chaos. Jedes Projekt ist ein reales Problem — von echten APIs über Datenbankdesign bis zum Deploy auf AWS. Wer die Academy abschließt, hat ein Portfolio das Arbeitgeber überzeugt.</p>
<p>Elena coacht jeden Samstag live. Ihre Direktheit und Detailtiefe sind legendär unter Absolventen.</p>`,
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
        highlights: ['Ex-Spotify Senior Engineer', 'Ex-Zalando Tech Lead', '320 Absolventen', '94% Vermittlungsquote'],
      },
    },
    {
      pageId: home.id, name: 'Job-Garantie', type: 'cta', order: 4,
      content: {
        heading: '💼 Job-Garantie — oder Geld zurück',
        subheading: 'Wenn du das Bootcamp abschließt und innerhalb von 6 Monaten keine Stelle findest, erstatteten wir dir 100% des Kurspreises. Kein Kleingedrucktes.',
        buttonText: 'Mehr zur Job-Garantie', buttonLink: '/job-garantie',
      },
      styling: { backgroundColor: '#22d3ee', textColor: '#09090b' },
    },
    {
      pageId: home.id, name: 'Bewertungen', type: 'testimonials', order: 5,
      content: {
        heading: 'Absolventenstimmen',
        items: [
          { title: 'Tobias H., 28 — jetzt React Developer bei n26', subtitle: '⭐⭐⭐⭐⭐', description: 'Ich war Bürokaufmann, null Coding-Erfahrung. 6 Monate CodeCraft, 2 Monate Jobsuche, dann das Angebot von n26. Startgehalt: 62.000€. Beste Investition meines Lebens.', date: 'April 2024' },
          { title: 'Aisha M., 34 — jetzt Fullstack Engineer bei Scout24', subtitle: '⭐⭐⭐⭐⭐', description: 'Als Quereinsteigerin aus dem Lehrberuf war ich skeptisch. Elena hat mich von Woche 1 ernst genommen. Das Portfolio-Projekt hat mir den Job gebracht — noch vor Bootcamp-Ende.', date: 'Februar 2024' },
          { title: 'Stefan R., 41 — jetzt Freelance Developer', subtitle: '⭐⭐⭐⭐⭐', description: 'Mit 41 nochmal umschulen — alle haben gesagt ich bin verrückt. CodeCraft hat mir nicht nur Coding beigebracht, sondern wie ich als Developer denke. 95€/h als Freelancer, 8 Monate nach Start.', date: 'Januar 2024' },
        ],
      },
      styling: { backgroundColor: '#18181b', textColor: '#f4f4f5' },
    },
    {
      pageId: home.id, name: 'Preise & Bewerbung', type: 'features', order: 6,
      content: {
        heading: 'Preise & Formate',
        items: [
          { icon: '⏰', title: 'Vollzeit (6 Monate)', description: '40h/Woche · Täglich Live-Sessions + Projektarbeit · Schnellste Route in den Job', price: '6.900€ oder ab 115€/Monat' },
          { icon: '🌙', title: 'Teilzeit (12 Monate)', description: '20h/Woche · Abends + Wochenende · Ideal für Berufstätige', price: '7.900€ oder ab 66€/Monat' },
          { icon: '🎯', title: 'Self-Paced + Coaching', description: 'Eigenes Tempo · Wöchentliche 1:1 Sessions · Für autodidaktische Lerner', price: '4.900€' },
        ],
        ctaText: 'Jetzt bewerben →', ctaLink: '#bewerbung',
      },
    },
    {
      pageId: home.id, name: 'Bewerbung', type: 'contact', order: 7,
      content: {
        heading: 'Bewerbung einreichen',
        subheading: 'Kein Vorwissen nötig. Wir prüfen Motivation und Lernbereitschaft — nicht Vorkenntnisse.',
        buttonText: 'Bewerbung absenden',
        details: { email: 'hallo@codecraft-academy.de' },
      },
      styling: { backgroundColor: '#22d3ee', textColor: '#09090b' },
    },
  ]);

  // CURRICULUM
  const [curriculum] = await db.insert(wbGlobalTemplatePages).values({
    templateId: t.id, name: 'Curriculum', slug: '/curriculum', isHomepage: false, order: 1,
  }).returning();

  await db.insert(wbGlobalTemplateSections).values([
    {
      pageId: curriculum.id, name: 'Header', type: 'hero', order: 0,
      content: { heading: 'Curriculum', subheading: '6 Monate · 12 Projekte · 480+ Stunden Lerninhalt', minimal: true },
      styling: { backgroundColor: '#09090b', textColor: '#f4f4f5' },
    },
    {
      pageId: curriculum.id, name: 'Phase 1', type: 'features', order: 1,
      content: {
        heading: 'Phase 1 — Foundations (Monate 1–2)',
        items: [
          { title: 'Web Fundamentals', description: 'HTML5, CSS3, Flexbox, Grid, Responsive Design · Projekt: Portfolio Website' },
          { title: 'JavaScript Essentials', description: 'Syntax, DOM, Async/Await, Fetch API · Projekt: Todo App' },
          { title: 'Git & Versionskontrolle', description: 'Git Flow, GitHub, Branching, Pull Requests' },
        ],
      },
    },
    {
      pageId: curriculum.id, name: 'Phase 2', type: 'features', order: 2,
      content: {
        heading: 'Phase 2 — Frontend (Monate 3–4)',
        items: [
          { title: 'React & State Management', description: 'Hooks, Context, Redux Toolkit · Projekt: E-Commerce Frontend' },
          { title: 'TypeScript', description: 'Type Safety, Interfaces, Generics für skalierbare Apps' },
          { title: 'Testing', description: 'Jest, React Testing Library, E2E mit Playwright' },
        ],
      },
    },
    {
      pageId: curriculum.id, name: 'Phase 3', type: 'features', order: 3,
      content: {
        heading: 'Phase 3 — Backend & Abschlussprojekt (Monate 5–6)',
        items: [
          { title: 'Node.js & Express', description: 'REST APIs, Middleware, Auth mit JWT · Projekt: API für E-Commerce Backend' },
          { title: 'Datenbanken', description: 'PostgreSQL, Prisma ORM, MongoDB · Datenbankdesign und Optimierung' },
          { title: 'Abschlussprojekt', description: 'Vollständige Full-Stack App — eigene Idee, echte Nutzer, Live-Deployment' },
        ],
      },
    },
  ]);

  // JOB GARANTIE SEITE
  const [jobPage] = await db.insert(wbGlobalTemplatePages).values({
    templateId: t.id, name: 'Job-Garantie', slug: '/job-garantie', isHomepage: false, order: 2,
  }).returning();

  await db.insert(wbGlobalTemplateSections).values({
    pageId: jobPage.id, name: 'Job Garantie', type: 'about', order: 0,
    content: {
      heading: '💼 Die CodeCraft Job-Garantie',
      text: `<p>Wir sind so überzeugt von unserem Programm, dass wir eine vollständige Geld-zurück-Garantie anbieten: Wenn du das Bootcamp erfolgreich abschließt (alle Projekte eingereicht, 80% Anwesenheit bei Live-Sessions) und innerhalb von 6 Monaten keine Stelle als Developer findest, erstatteten wir dir 100% des Kurspreises.</p>
<p>Bisher haben wir diese Garantie 3× eingelöst — und alle drei Absolventen haben danach Stellen gefunden. Wir stehen hinter unserem Versprechen.</p>
<p><strong>Voraussetzungen für die Garantie:</strong> Alle 12 Projekte abgeschlossen · 80% Anwesenheit bei Live-Sessions · 50+ Bewerbungen nachweislich versendet · Lebenslauf-Review durch unser Career-Team</p>`,
      imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=400&fit=crop',
    },
    styling: { backgroundColor: '#09090b', textColor: '#f4f4f5' },
  });

  console.log('✅ members_academy — CodeCraft Academy Web Dev Bootcamp');
  console.log('   Seiten: Startseite (8 Sections) + Curriculum (4 Sections) + Job-Garantie');
  await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
