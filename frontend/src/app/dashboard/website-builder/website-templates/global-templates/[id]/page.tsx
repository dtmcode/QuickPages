'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

const GET_GLOBAL_TEMPLATE = gql`
  query GetGlobalTemplate($id: String!) {
    wbGlobalTemplate(id: $id) {
      id name description category thumbnailUrl isPremium previewUrl demoUrl settings createdAt
    }
  }
`;

const CLONE_GLOBAL_TEMPLATE = gql`
  mutation CloneGlobalTemplate($globalTemplateId: String!, $tenantId: String!) {
    cloneGlobalTemplate(globalTemplateId: $globalTemplateId, tenantId: $tenantId) {
      id name
      pages { id name slug }
    }
  }
`;

const CREATE_PAGE = gql`
  mutation CreateLegalPage($input: CreatePageInput!, $tenantId: String!) {
    createPage(input: $input, tenantId: $tenantId) { id slug }
  }
`;

const CREATE_SECTION = gql`
  mutation CreateLegalSection($input: CreateSectionInput!, $tenantId: String!) {
    createSection(input: $input, tenantId: $tenantId) { id }
  }
`;

// ─── Default Legal-Texte (Platzhalter) ───────────────────────────────────────
const IMPRESSUM_TEXT = `# Impressum

**Angaben gemäß § 5 TMG**

[Firmenname]
[Straße und Hausnummer]
[PLZ Ort]

**Kontakt:**
Telefon: [Telefonnummer]
E-Mail: [E-Mail-Adresse]

---

**Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:**
[Vorname Nachname]
[Adresse wie oben]

---

**Haftungsausschluss:**
Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann keine Gewähr übernommen werden.

> ⚠️ Bitte ersetze alle Angaben in eckigen Klammern mit deinen echten Daten.`;

const DATENSCHUTZ_TEXT = `# Datenschutzerklärung

## 1. Verantwortlicher

[Firmenname]
[Adresse]
E-Mail: [E-Mail-Adresse]

## 2. Erhebung und Verarbeitung personenbezogener Daten

Wir erheben personenbezogene Daten nur, soweit dies für die Bereitstellung unserer Dienste erforderlich ist.

**Server-Log-Dateien:**
Beim Aufruf dieser Website speichert der Hosting-Anbieter automatisch folgende Daten: IP-Adresse, Browsertyp, Betriebssystem, Referrer-URL, Uhrzeit des Zugriffs.

**Kontaktformular:**
Bei Kontaktaufnahme werden die übermittelten Daten zur Bearbeitung Ihrer Anfrage gespeichert.

## 3. Ihre Rechte

Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17) und Widerspruch (Art. 21).

Kontakt für Datenschutzanfragen: [E-Mail-Adresse]

## 4. Cookies

Diese Website verwendet keine Tracking-Cookies.

---

> ⚠️ Bitte passe diese Erklärung an deine tatsächliche Datenverarbeitung an und lasse sie bei Bedarf rechtlich prüfen.`;

const LEGAL_PAGES = [
  { slug: 'impressum',  name: 'Impressum',  text: IMPRESSUM_TEXT },
  { slug: 'datenschutz', name: 'Datenschutz', text: DATENSCHUTZ_TEXT },
];

export default function GlobalTemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tenant } = useAuth();
  const templateId = params.id as string;
  const [toast, setToast] = useState<string | null>(null);

  const { data, loading } = useQuery(GET_GLOBAL_TEMPLATE, {
    variables: { id: templateId },
  });

  const [cloneTemplate, { loading: cloning }] = useMutation(CLONE_GLOBAL_TEMPLATE);
  const [createPage] = useMutation(CREATE_PAGE);
  const [createSection] = useMutation(CREATE_SECTION);

  const template = data?.wbGlobalTemplate;

  const handleClone = async () => {
    if (!tenant?.id) return;
    if (!confirm(`Template "${template.name}" verwenden?`)) return;

    try {
      // 1. Klon erstellen
      const result = await cloneTemplate({
        variables: { globalTemplateId: templateId, tenantId: tenant.id },
      });

      const cloned = result.data.cloneGlobalTemplate;
      const newTemplateId: string = cloned.id;
      const existingPages: { id: string; slug: string }[] = cloned.pages || [];

      // 2. Impressum + Datenschutz anlegen falls noch nicht vorhanden
      for (let i = 0; i < LEGAL_PAGES.length; i++) {
        const lp = LEGAL_PAGES[i];
        const alreadyExists = existingPages.some(p => p.slug === lp.slug);

        let pageId: string | null = null;

        if (!alreadyExists) {
          try {
            const pageRes = await createPage({
              variables: {
                input: {
                  templateId: newTemplateId,
                  name: lp.name,
                  slug: lp.slug,
                  isActive: true,
                  isHomepage: false,
                  order: 100 + i,
                },
                tenantId: tenant.id,
              },
            });
            pageId = pageRes.data?.createPage?.id ?? null;
          } catch {
            // Slug conflict — überspringen
          }
        } else {
          pageId = existingPages.find(p => p.slug === lp.slug)?.id ?? null;
        }

        if (pageId) {
          try {
            await createSection({
              variables: {
                input: {
                  pageId,
                  templateId: newTemplateId,
                  name: lp.name,
                  type: 'text',
                  order: 0,
                  isActive: true,
                  content: { text: lp.text },
                },
                tenantId: tenant.id,
              },
            });
          } catch {
            // Section-Fehler nicht kritisch
          }
        }
      }

      router.push(`/dashboard/website-builder/website-templates/${newTemplateId}`);
    } catch (error: any) {
      setToast(`Fehler: ${error.message}`);
      setTimeout(() => setToast(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold mb-4">Template nicht gefunden</h2>
        <Link href="/dashboard/website-builder/website-templates/global-templates" className="text-primary hover:underline">
          ← Zurück zur Galerie
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl bg-red-600 text-white text-sm shadow-lg">
          {toast}
        </div>
      )}

      {/* Breadcrumb */}
      <Link href="/dashboard/website-builder/website-templates/global-templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
        ← Zurück zur Galerie
      </Link>

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h1 className="text-3xl font-bold">{template.name}</h1>
              {template.isPremium && (
                <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-lg text-xs font-bold">⭐ Premium</span>
              )}
            </div>
            {template.category && (
              <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-sm font-medium mb-4">
                {template.category}
              </span>
            )}
            <p className="text-white/90 text-sm leading-relaxed max-w-2xl">{template.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={handleClone}
            disabled={cloning}
            className="flex items-center gap-2 bg-white text-purple-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition font-bold text-sm disabled:opacity-50 disabled:cursor-wait shadow-lg"
          >
            {cloning ? (
              <><div className="w-4 h-4 border-2 border-purple-400 border-t-purple-700 rounded-full animate-spin" />Wird erstellt…</>
            ) : '✨ Template verwenden'}
          </button>
          {template.demoUrl && (
            <a
              href={template.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/15 text-white px-6 py-3 rounded-xl hover:bg-white/25 transition font-semibold text-sm"
            >
              👁️ Live Demo
            </a>
          )}
        </div>
      </div>

      {/* Preview */}
      {template.thumbnailUrl && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-bold text-foreground">Vorschau</h2>
          </div>
          <div className="aspect-video bg-muted overflow-hidden">
            <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Colors & Fonts */}
      {template.settings && Object.keys(template.settings).length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-bold text-foreground mb-4">🎨 Design</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {template.settings.colors && (
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Farben</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(template.settings.colors).map(([key, value]: [string, any]) => (
                    <div key={key} className="text-center">
                      <div className="w-10 h-10 rounded-lg border border-border shadow-sm" style={{ backgroundColor: value }} />
                      <p className="text-[10px] mt-1 text-muted-foreground">{key}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {template.settings.fonts && (
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Schriftarten</p>
                <div className="space-y-1">
                  {Object.entries(template.settings.fonts).map(([key, value]: [string, any]) => (
                    <p key={key} className="text-sm"><span className="font-medium capitalize">{key}:</span> <span className="text-muted-foreground">{value}</span></p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">💡</span>
          <div>
            <h3 className="font-bold text-foreground mb-3">Was passiert beim Verwenden?</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Template wird in deinen Account kopiert</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Alle Seiten und Sections werden übernommen</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> <strong className="text-foreground">Impressum & Datenschutz</strong> werden automatisch mit Platzhalter-Text angelegt</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Du kannst alle Inhalte frei anpassen</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Das Original-Template bleibt unverändert</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}