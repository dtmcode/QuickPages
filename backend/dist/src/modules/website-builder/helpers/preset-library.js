"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRESETS = void 0;
exports.impressumPreset = impressumPreset;
exports.datenschutzPreset = datenschutzPreset;
const crypto_1 = require("crypto");
const id = () => 'b-' + (0, crypto_1.randomUUID)().slice(0, 8);
function block(type, data, order) {
    return { id: id(), type, order, ...data };
}
exports.PRESETS = {
    hero(opts) {
        const blocks = [];
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
                style: 'primary',
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
    features(opts) {
        const blocks = [];
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
    about(opts) {
        const blocks = [];
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
    cta(opts) {
        const blocks = [];
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
    contact(opts) {
        const blocks = [];
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
    newsletter(opts) {
        const blocks = [];
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
    pricing(opts) {
        const blocks = [];
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
    testimonials(opts) {
        const blocks = [];
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
    team(opts) {
        const blocks = [];
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
    stats(opts) {
        const blocks = [];
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
    faq(opts) {
        const blocks = [];
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
    gallery(opts) {
        const blocks = [];
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
    text(opts) {
        const blocks = [];
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
    blogFeed(opts) {
        const blocks = [];
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
    custom(opts) {
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
function impressumPreset(tenantName, data) {
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
    return exports.PRESETS.text({ text, align: 'left' });
}
function datenschutzPreset(tenantName, data) {
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
    return exports.PRESETS.text({ text, align: 'left' });
}
//# sourceMappingURL=preset-library.js.map