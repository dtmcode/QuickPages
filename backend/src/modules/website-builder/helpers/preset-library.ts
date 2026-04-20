// 📂 PFAD: backend/src/modules/website-builder/helpers/preset-library.ts
/**
 * 🧱 PRESET LIBRARY
 *
 * Erzeugt Freestyle-Sections mit vordefinierten Block-Arrays.
 * Jede Preset-Funktion entspricht einem ehemaligen Section-Type
 * ('hero', 'features', 'contact' etc.), aber gibt immer freestyle zurück.
 *
 * Verwendung:
 *   import { PRESETS } from './helpers/preset-library';
 *
 *   await db.insert(wbSections).values({
 *     ...PRESETS.hero({
 *       heading: 'Willkommen bei XY',
 *       subheading: '...',
 *       buttonText: 'Jetzt starten',
 *       buttonLink: '#kontakt',
 *     }),
 *     pageId, tenantId, order: 0, name: 'Hero',
 *   });
 */

import { randomUUID } from 'crypto';

// ==================== TYPES ====================

export type BlockAlign = 'left' | 'center' | 'right';
export type ButtonStyle = 'primary' | 'secondary' | 'outline' | 'ghost';

export interface FreestyleSection {
  type: 'freestyle';
  content: { blocks: any[] };
  styling?: Record<string, any>;
}

export interface CustomSection {
  type: 'custom';
  content: { html: string; css?: string; js?: string };
  styling?: Record<string, any>;
}

// ==================== HELPERS ====================

const id = () => 'b-' + randomUUID().slice(0, 8);

function block(type: string, data: Record<string, any>, order: number) {
  return { id: id(), type, order, ...data };
}

// ==================== PRESETS ====================

interface HeroOpts {
  heading: string;
  subheading?: string;
  buttonText?: string;
  buttonLink?: string;
  badge?: string;
  imageUrl?: string;
  bgColor?: string;
  textColor?: string;
}

export const PRESETS = {
  // ──────────────────────────────────────────────────────────────────────────
  hero(opts: HeroOpts): FreestyleSection {
    const blocks: any[] = [];
    let order = 0;

    if (opts.badge) {
      blocks.push(block('badge', { text: opts.badge, align: 'center' }, order++));
    }
    blocks.push(block('heading', {
      text: opts.heading,
      level: 'h1',
      align: 'center',
      fontSize: '3rem',
    }, order++));
    if (opts.subheading) {
      blocks.push(block('text', {
        html: `<p>${opts.subheading}</p>`,
        align: 'center',
        fontSize: '1.25rem',
      }, order++));
    }
    if (opts.imageUrl) {
      blocks.push(block('image', {
        url: opts.imageUrl, alt: opts.heading, width: '100%', align: 'center',
      }, order++));
    }
    if (opts.buttonText) {
      blocks.push(block('button', {
        text: opts.buttonText,
        link: opts.buttonLink || '#',
        style: 'primary' as ButtonStyle,
        align: 'center',
        size: 'lg',
      }, order++));
    }

    return {
      type: 'freestyle',
      content: { blocks },
      styling: {
        backgroundColor: opts.bgColor || undefined,
        textColor: opts.textColor || undefined,
        padding: { top: '5rem', bottom: '5rem', left: '1.5rem', right: '1.5rem' },
        textAlign: 'center',
        containerWidth: 'normal',
      },
    };
  },

  // ──────────────────────────────────────────────────────────────────────────
  features(opts: {
    heading: string;
    subheading?: string;
    items: Array<{ icon?: string; title: string; description: string; price?: string }>;
    columns?: number;
    bgColor?: string;
  }): FreestyleSection {
    const blocks: any[] = [];
    let order = 0;

    blocks.push(block('heading', {
      text: opts.heading, level: 'h2', align: 'center',
    }, order++));
    if (opts.subheading) {
      blocks.push(block('text', {
        html: `<p>${opts.subheading}</p>`, align: 'center',
      }, order++));
    }
    blocks.push(block('feature-grid', {
      columns: opts.columns || 3,
      items: opts.items,
    }, order++));

    return {
      type: 'freestyle',
      content: { blocks },
      styling: {
        backgroundColor: opts.bgColor || undefined,
        padding: { top: '4rem', bottom: '4rem', left: '1.5rem', right: '1.5rem' },
      },
    };
  },

  // ──────────────────────────────────────────────────────────────────────────
  about(opts: {
    heading: string;
    description: string;
    buttonText?: string;
    buttonLink?: string;
    imageUrl?: string;
  }): FreestyleSection {
    const blocks: any[] = [];
    let order = 0;

    blocks.push(block('heading', { text: opts.heading, level: 'h2', align: 'left' }, order++));
    blocks.push(block('text', {
      html: `<p>${opts.description}</p>`, align: 'left',
    }, order++));
    if (opts.imageUrl) {
      blocks.push(block('image', {
        url: opts.imageUrl, alt: opts.heading, width: '100%', align: 'center',
      }, order++));
    }
    if (opts.buttonText) {
      blocks.push(block('button', {
        text: opts.buttonText,
        link: opts.buttonLink || '#',
        style: 'outline',
        align: 'left',
      }, order++));
    }

    return {
      type: 'freestyle',
      content: { blocks },
      styling: {
        padding: { top: '4rem', bottom: '4rem', left: '1.5rem', right: '1.5rem' },
        containerWidth: 'narrow',
      },
    };
  },

  // ──────────────────────────────────────────────────────────────────────────
  cta(opts: {
    heading: string;
    subheading?: string;
    buttonText: string;
    buttonLink?: string;
    bgColor?: string;
    textColor?: string;
  }): FreestyleSection {
    const blocks: any[] = [];
    let order = 0;

    blocks.push(block('heading', { text: opts.heading, level: 'h2', align: 'center' }, order++));
    if (opts.subheading) {
      blocks.push(block('text', {
        html: `<p>${opts.subheading}</p>`, align: 'center',
      }, order++));
    }
    blocks.push(block('button', {
      text: opts.buttonText,
      link: opts.buttonLink || '#',
      style: 'primary',
      align: 'center',
      size: 'lg',
    }, order++));

    return {
      type: 'freestyle',
      content: { blocks },
      styling: {
        backgroundColor: opts.bgColor || undefined,
        textColor: opts.textColor || undefined,
        padding: { top: '5rem', bottom: '5rem', left: '1.5rem', right: '1.5rem' },
        textAlign: 'center',
      },
    };
  },

  // ──────────────────────────────────────────────────────────────────────────
  contact(opts: {
    heading: string;
    subheading?: string;
    buttonText?: string;
  }): FreestyleSection {
    const blocks: any[] = [];
    let order = 0;

    blocks.push(block('heading', { text: opts.heading, level: 'h2', align: 'center' }, order++));
    if (opts.subheading) {
      blocks.push(block('text', {
        html: `<p>${opts.subheading}</p>`, align: 'center',
      }, order++));
    }
    blocks.push(block('contact-form', {
      buttonText: opts.buttonText || 'Senden',
    }, order++));

    return {
      type: 'freestyle',
      content: { blocks },
      styling: {
        padding: { top: '4rem', bottom: '4rem', left: '1.5rem', right: '1.5rem' },
      },
    };
  },

  // ──────────────────────────────────────────────────────────────────────────
  newsletter(opts: {
    heading: string;
    subheading?: string;
    buttonText?: string;
    placeholder?: string;
    bgColor?: string;
    textColor?: string;
  }): FreestyleSection {
    const blocks: any[] = [];
    let order = 0;

    blocks.push(block('heading', { text: opts.heading, level: 'h2', align: 'center' }, order++));
    if (opts.subheading) {
      blocks.push(block('text', {
        html: `<p>${opts.subheading}</p>`, align: 'center',
      }, order++));
    }
    blocks.push(block('newsletter-form', {
      buttonText: opts.buttonText || 'Abonnieren',
      placeholder: opts.placeholder || 'deine@email.de',
    }, order++));

    return {
      type: 'freestyle',
      content: { blocks },
      styling: {
        backgroundColor: opts.bgColor || undefined,
        textColor: opts.textColor || undefined,
        padding: { top: '4rem', bottom: '4rem', left: '1.5rem', right: '1.5rem' },
        textAlign: 'center',
      },
    };
  },

  // ──────────────────────────────────────────────────────────────────────────
  pricing(opts: {
    heading: string;
    subheading?: string;
    items: Array<{
      title: string; price: string; interval?: string;
      features: string[]; buttonText?: string; highlighted?: boolean;
    }>;
  }): FreestyleSection {
    const blocks: any[] = [];
    let order = 0;

    blocks.push(block('heading', { text: opts.heading, level: 'h2', align: 'center' }, order++));
    if (opts.subheading) {
      blocks.push(block('text', {
        html: `<p>${opts.subheading}</p>`, align: 'center',
      }, order++));
    }
    blocks.push(block('pricing-grid', {
      columns: opts.items.length <= 2 ? 2 : 3,
      items: opts.items,
    }, order++));

    return {
      type: 'freestyle',
      content: { blocks },
      styling: {
        padding: { top: '4rem', bottom: '4rem', left: '1.5rem', right: '1.5rem' },
      },
    };
  },

  // ──────────────────────────────────────────────────────────────────────────
  testimonials(opts: {
    heading: string;
    items: Array<{ name: string; role?: string; text: string; image?: string }>;
    columns?: number;
  }): FreestyleSection {
    const blocks: any[] = [];
    let order = 0;

    blocks.push(block('heading', { text: opts.heading, level: 'h2', align: 'center' }, order++));
    blocks.push(block('testimonial-grid', {
      columns: opts.columns || 2,
      items: opts.items,
    }, order++));

    return {
      type: 'freestyle',
      content: { blocks },
      styling: {
        padding: { top: '4rem', bottom: '4rem', left: '1.5rem', right: '1.5rem' },
      },
    };
  },

  // ──────────────────────────────────────────────────────────────────────────
  team(opts: {
    heading: string;
    items: Array<{ name: string; role?: string; bio?: string; image?: string }>;
    columns?: number;
  }): FreestyleSection {
    const blocks: any[] = [];
    let order = 0;

    blocks.push(block('heading', { text: opts.heading, level: 'h2', align: 'center' }, order++));
    blocks.push(block('team-grid', {
      columns: opts.columns || 3,
      items: opts.items,
    }, order++));

    return {
      type: 'freestyle',
      content: { blocks },
      styling: {
        padding: { top: '4rem', bottom: '4rem', left: '1.5rem', right: '1.5rem' },
      },
    };
  },

  // ──────────────────────────────────────────────────────────────────────────
  stats(opts: {
    heading?: string;
    items: Array<{ value: string; label: string; description?: string }>;
    columns?: number;
    bgColor?: string;
    textColor?: string;
  }): FreestyleSection {
    const blocks: any[] = [];
    let order = 0;

    if (opts.heading) {
      blocks.push(block('heading', { text: opts.heading, level: 'h2', align: 'center' }, order++));
    }
    blocks.push(block('stat-grid', {
      columns: opts.columns || 4,
      items: opts.items,
    }, order++));

    return {
      type: 'freestyle',
      content: { blocks },
      styling: {
        backgroundColor: opts.bgColor || undefined,
        textColor: opts.textColor || undefined,
        padding: { top: '4rem', bottom: '4rem', left: '1.5rem', right: '1.5rem' },
      },
    };
  },

  // ──────────────────────────────────────────────────────────────────────────
  faq(opts: {
    heading: string;
    items: Array<{ question: string; answer: string }>;
  }): FreestyleSection {
    const blocks: any[] = [];
    let order = 0;

    blocks.push(block('heading', { text: opts.heading, level: 'h2', align: 'center' }, order++));
    blocks.push(block('faq-list', { items: opts.items }, order++));

    return {
      type: 'freestyle',
      content: { blocks },
      styling: {
        padding: { top: '4rem', bottom: '4rem', left: '1.5rem', right: '1.5rem' },
        containerWidth: 'narrow',
      },
    };
  },

  // ──────────────────────────────────────────────────────────────────────────
  gallery(opts: {
    heading?: string;
    images: Array<{ url: string; alt?: string }>;
    columns?: number;
  }): FreestyleSection {
    const blocks: any[] = [];
    let order = 0;

    if (opts.heading) {
      blocks.push(block('heading', { text: opts.heading, level: 'h2', align: 'center' }, order++));
    }
    blocks.push(block('image-grid', {
      columns: opts.columns || 3,
      images: opts.images,
    }, order++));

    return {
      type: 'freestyle',
      content: { blocks },
      styling: {
        padding: { top: '4rem', bottom: '4rem', left: '1.5rem', right: '1.5rem' },
      },
    };
  },

  // ──────────────────────────────────────────────────────────────────────────
  text(opts: {
    heading?: string;
    text: string; // kann Markdown/HTML enthalten
    align?: BlockAlign;
  }): FreestyleSection {
    const blocks: any[] = [];
    let order = 0;

    if (opts.heading) {
      blocks.push(block('heading', {
        text: opts.heading, level: 'h2', align: opts.align || 'left',
      }, order++));
    }
    blocks.push(block('text', {
      html: opts.text, align: opts.align || 'left',
    }, order++));

    return {
      type: 'freestyle',
      content: { blocks },
      styling: {
        padding: { top: '3rem', bottom: '3rem', left: '1.5rem', right: '1.5rem' },
        containerWidth: 'narrow',
      },
    };
  },

  // ──────────────────────────────────────────────────────────────────────────
  blogFeed(opts: {
    heading?: string;
    count?: number;
  }): FreestyleSection {
    const blocks: any[] = [];
    let order = 0;

    if (opts.heading) {
      blocks.push(block('heading', { text: opts.heading, level: 'h2', align: 'center' }, order++));
    }
    blocks.push(block('blog-feed', { count: opts.count || 3 }, order++));

    return {
      type: 'freestyle',
      content: { blocks },
      styling: {
        padding: { top: '4rem', bottom: '4rem', left: '1.5rem', right: '1.5rem' },
      },
    };
  },

  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Custom Section — Raw HTML/CSS/JS.
   * Wird im Public-Renderer in iframe-sandbox gerendert.
   */
  custom(opts: { html: string; css?: string; js?: string }): CustomSection {
    return {
      type: 'custom',
      content: {
        html: opts.html,
        css: opts.css || '',
        js: opts.js || '',
      },
    };
  },
};

// ==================== LEGAL PAGES ====================

/**
 * Standard Impressum-Preset — von createDefaultTemplate() und Onboarding genutzt.
 */
export function impressumPreset(tenantName: string, data?: {
  address?: string; zip?: string; city?: string; phone?: string; email?: string;
}): FreestyleSection {
  const addr = data?.address || '[Straße und Hausnummer]';
  const plz = [data?.zip, data?.city].filter(Boolean).join(' ') || '[PLZ Ort]';
  const phone = data?.phone || '[Telefonnummer]';
  const email = data?.email || '[E-Mail-Adresse]';

  const text = `# Impressum

**Angaben gemäß § 5 TMG**

${tenantName}
${addr}
${plz}

**Kontakt:**
Telefon: ${phone}
E-Mail: ${email}

---

**Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:**
${tenantName}

---

**Haftungsausschluss:**
Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann keine Gewähr übernommen werden.

> ⚠️ Bitte ergänze fehlende Pflichtangaben (z.B. Handelsregisternummer, USt-IdNr.) und lasse das Impressum bei Bedarf rechtlich prüfen.`;

  return PRESETS.text({ text, align: 'left' });
}

export function datenschutzPreset(tenantName: string, data?: {
  address?: string; zip?: string; city?: string; email?: string;
}): FreestyleSection {
  const addr = data?.address || '[Adresse]';
  const plz = [data?.zip, data?.city].filter(Boolean).join(' ') || '';
  const email = data?.email || '[E-Mail-Adresse]';
  const fullAddr = plz ? `${addr}, ${plz}` : addr;

  const text = `# Datenschutzerklärung

## 1. Verantwortlicher

${tenantName}
${fullAddr}
E-Mail: ${email}

## 2. Erhebung und Verarbeitung personenbezogener Daten

Wir erheben personenbezogene Daten nur, soweit dies für die Bereitstellung unserer Dienste erforderlich ist.

**Server-Log-Dateien:** IP-Adresse, Browsertyp, Betriebssystem, Referrer-URL, Uhrzeit des Zugriffs.

**Kontaktformular:** Bei Kontaktaufnahme werden die übermittelten Daten zur Bearbeitung gespeichert.

## 3. Ihre Rechte

Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Widerspruch (Art. 15-21 DSGVO).

Kontakt für Datenschutzanfragen: ${email}

## 4. Cookies

Diese Website verwendet keine Tracking-Cookies.

---

> ⚠️ Passe diese Erklärung an deine tatsächliche Datenverarbeitung an und lasse sie bei Unsicherheiten rechtlich prüfen.`;

  return PRESETS.text({ text, align: 'left' });
}