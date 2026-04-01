// 📂 PFAD: frontend-public/src/app/PublicSiteRenderer.tsx{{{{{}}}}}

'use client';

import { useState } from 'react';
import Image from 'next/image';

// ==================== TYPES ====================
interface SectionStyling {
  backgroundColor?: string;
  textColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  padding?: string | { top?: string; bottom?: string; left?: string; right?: string };
  fontFamily?: string;
  bodySize?: string;
  headingSize?: string;
  headingColor?: string;
  subheadingSize?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  cardBackground?: string;
  cardTextColor?: string;
  textAlign?: string;
  containerWidth?: string;
}

interface ContentItem {
  icon?: string;
  title: string;
  subtitle?: string;
  description: string;
  price?: string;
  value?: string;
  image?: string;
  name?: string;
  role?: string;
  quote?: string;
  buttonText?: string;
  features?: string[];
}

interface SectionContent {
  heading?: string;
  title?: string;
  subheading?: string;
  text?: string;
  buttonText?: string;
  buttonLink?: string;
  placeholder?: string;
  address?: string;
  embedUrl?: string;
  videoUrl?: string;
  html?: string;
  email?: string;
  phone?: string;
  count?: number;
  targetDate?: string;
  items?: Record<string, unknown>[];
  plans?: Record<string, unknown>[];
  members?: Record<string, unknown>[];
  testimonials?: Record<string, unknown>[];
  faqs?: Record<string, unknown>[];
  stats?: Record<string, unknown>[];
  images?: Array<{ url: string; alt?: string }>;
  links?: Array<{ platform: string; url: string; icon?: string }>;
}
interface SectionData {
  id: string;
  name: string;
  type: string;
  content: SectionContent;
  styling?: SectionStyling;
  isActive: boolean;
  order: number;
}

interface PageData {
  name: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  description?: string;
  sections?: SectionData[];
}

interface SectionComponentProps {
  content: SectionContent;
  styling: SectionStyling;
  containerStyle: React.CSSProperties;
  headingStyle: React.CSSProperties;
  buttonStyle: React.CSSProperties;
  apiUrl: string;
  tenant: string;
}

interface Props {
  page: PageData;
  tenantSlug?: string;
}

export default function PublicSiteRenderer({ page, tenantSlug }: Props) {
  // Resolve tenant slug from prop or from hostname
  const resolvedTenant = tenantSlug || (typeof window !== 'undefined'
    ? window.location.hostname.split('.')[0]
    : 'demo');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Sort sections by order
  const sections = page.sections?.sort((a, b) => a.order - b.order) || [];
  const activeSections = sections.filter((s) => s.isActive);

  const renderSection = (section: SectionData) => {
    const { content, type } = section;
    const styling: SectionStyling = section.styling || {};

    // Default styles
    const bg = styling.backgroundColor;
const pad = typeof styling.padding === 'object' && styling.padding !== null
  ? styling.padding as { top?: string; bottom?: string; left?: string; right?: string }
  : null;

const containerStyle: React.CSSProperties = {
  backgroundColor: bg?.startsWith('linear') ? undefined : (bg || 'transparent'),
  backgroundImage: bg?.startsWith('linear')
    ? bg
    : styling.backgroundImage
      ? `url(${styling.backgroundImage})`
      : undefined,
  backgroundSize: styling.backgroundSize || 'cover',
  backgroundPosition: styling.backgroundPosition || 'center',
  color: styling.textColor || 'inherit',
  paddingTop: pad?.top || '3rem',
  paddingBottom: pad?.bottom || '3rem',
  paddingLeft: pad?.left || '1.5rem',
  paddingRight: pad?.right || '1.5rem',
  fontFamily: styling.fontFamily || 'inherit',
  fontSize: styling.bodySize || 'inherit',
  textAlign: (styling.textAlign as any) || undefined,
};

    const headingStyle: React.CSSProperties = {
      fontSize: styling.headingSize || '2.25rem',
      color: styling.headingColor || 'inherit',
    };

    const buttonStyle: React.CSSProperties = {
      backgroundColor: styling.buttonColor || '#3b82f6',
      color: styling.buttonTextColor || '#ffffff',
    };

  const h = content?.heading || content?.title || '';
    const getItems = (): any[] => content?.items || content?.plans || content?.members || content?.testimonials || content?.faqs || content?.stats || [];

    switch (type) {
      case 'hero':
        return (
          <section className="relative text-white" style={{ ...containerStyle, background: styling.backgroundColor || 'linear-gradient(to right, #2563eb, #7c3aed)' }}>
            <div className="max-w-5xl mx-auto text-center">
              {h && <h1 className="text-5xl md:text-6xl font-bold mb-4" style={headingStyle}>{h}</h1>}
              {content?.subheading && <p className="text-xl md:text-2xl mb-8 opacity-90" style={{ fontSize: styling.subheadingSize || '1.25rem' }}>{content.subheading}</p>}
              {content?.text && <div className="prose prose-lg prose-invert mx-auto mb-8" dangerouslySetInnerHTML={{ __html: content.text }} />}
              {content?.buttonText && <a href={content.buttonLink || '#'} className="inline-block px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition" style={buttonStyle}>{content.buttonText}</a>}
            </div>
          </section>
        );

      case 'features':
        return (
          <section style={containerStyle}>
            <div className="max-w-6xl mx-auto">
              {h && <h2 className="text-4xl font-bold text-center mb-12" style={headingStyle}>{h}</h2>}
              {getItems().length > 0 && (
                <div className="grid md:grid-cols-3 gap-8">
                  {getItems().map((item: any, idx: number) => (
                    <div key={idx} className="p-6 rounded-lg shadow hover:shadow-lg transition" style={{ backgroundColor: styling.cardBackground || '#ffffff', color: styling.cardTextColor || 'inherit' }}>
                      {item.icon && <div className="text-4xl mb-4">{item.icon}</div>}
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="opacity-80">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case 'about':
      case 'text':
        return (
          <section style={containerStyle}>
            <div className="max-w-4xl mx-auto">
              {h && <h2 className="text-3xl font-bold mb-6" style={headingStyle}>{h}</h2>}
              {content?.subheading && <p className="text-xl mb-6 opacity-80">{content.subheading}</p>}
              {content?.text && <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content.text }} />}
              {content?.buttonText && <div className="mt-8"><a href={content.buttonLink || '#'} className="inline-block px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition" style={buttonStyle}>{content.buttonText}</a></div>}
            </div>
          </section>
        );

      case 'services':
        return (
          <section style={containerStyle}>
            <div className="max-w-6xl mx-auto">
              {h && <h2 className="text-3xl font-bold text-center mb-12" style={headingStyle}>{h}</h2>}
              {content?.subheading && <p className="text-xl text-center mb-12 opacity-80">{content.subheading}</p>}
              {getItems().length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {getItems().map((item: any, idx: number) => (
                    <div key={idx} className="p-6 rounded-lg shadow hover:shadow-lg transition" style={{ backgroundColor: styling.cardBackground || '#ffffff', color: styling.cardTextColor || 'inherit' }}>
                      {item.icon && <div className="text-3xl mb-4">{item.icon}</div>}
                      <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                      <p className="opacity-80 mb-4">{item.description}</p>
                      {item.price && <p className="text-2xl font-bold" style={{ color: styling.headingColor }}>{item.price}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case 'cta':
        return (
          <section className="text-white text-center" style={{ ...containerStyle, background: styling.backgroundColor || '#2563eb' }}>
            <div className="max-w-4xl mx-auto">
              {h && <h2 className="text-3xl md:text-4xl font-bold mb-4" style={headingStyle}>{h}</h2>}
              {content?.subheading && <p className="text-lg md:text-xl mb-8 opacity-90">{content.subheading}</p>}
              {content?.text && <p className="text-lg md:text-xl mb-8 opacity-90">{content.text}</p>}
              {content?.buttonText && <a href={content.buttonLink || '#'} className="inline-block px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition" style={buttonStyle}>{content.buttonText}</a>}
            </div>
          </section>
        );

      case 'contact':
        return <ContactSection content={content} styling={styling} containerStyle={containerStyle} headingStyle={headingStyle} buttonStyle={buttonStyle} apiUrl={API_URL} tenant={resolvedTenant} />;

      case 'team':
        return (
          <section style={containerStyle}>
            <div className="max-w-6xl mx-auto">
              {h && <h2 className="text-3xl font-bold text-center mb-12" style={headingStyle}>{h}</h2>}
              {getItems().length > 0 && (
                <div className="grid md:grid-cols-3 gap-8">
                  {getItems().map((item: any, idx: number) => (
                    <div key={idx} className="text-center">
                      {item.image && (
                        <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200 relative">
                          <Image src={item.image} alt={item.title || item.name || ''} fill className="object-cover" />
                        </div>
                      )}
                      <h3 className="text-xl font-semibold mb-1">{item.title || item.name}</h3>
                      <p className="text-sm opacity-75 mb-2">{item.subtitle || item.role}</p>
                      <p className="opacity-80">{item.description || item.bio}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case 'testimonials':
        return (
          <section style={containerStyle}>
            <div className="max-w-6xl mx-auto">
              {h && <h2 className="text-3xl font-bold text-center mb-12" style={headingStyle}>{h}</h2>}
              {getItems().length > 0 && (
                <div className="grid md:grid-cols-2 gap-8">
                  {getItems().map((item: any, idx: number) => (
                    <div key={idx} className="p-6 rounded-lg shadow" style={{ backgroundColor: styling.cardBackground || '#ffffff', color: styling.cardTextColor || 'inherit' }}>
                      <p className="text-lg mb-4 italic">&ldquo;{item.description || item.text}&rdquo;</p>
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 relative">
                            <Image src={item.image} alt={item.title || item.name || ''} fill className="object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{item.title || item.name}</p>
                          <p className="text-sm opacity-75">{item.subtitle || item.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case 'pricing':
        return (
          <section style={containerStyle}>
            <div className="max-w-6xl mx-auto">
              {h && <h2 className="text-3xl font-bold text-center mb-12" style={headingStyle}>{h}</h2>}
              {getItems().length > 0 && (
                <div className="grid md:grid-cols-3 gap-8">
                  {getItems().map((item: any, idx: number) => (
                    <div key={idx} className="p-8 rounded-lg shadow hover:shadow-lg transition text-center" style={{ backgroundColor: styling.cardBackground || '#ffffff', color: styling.cardTextColor || 'inherit' }}>
                      <h3 className="text-2xl font-bold mb-4">{item.title || item.name}</h3>
                      <div className="text-4xl font-bold mb-6" style={{ color: styling.headingColor }}>{item.price}{item.interval && <span className="text-lg font-normal">/{item.interval}</span>}</div>
                      {item.description && <p className="mb-6 opacity-80">{item.description}</p>}
                      {item.features && <ul className="space-y-2 mb-6 text-left">{item.features.map((f: string, i: number) => <li key={i} className="flex items-center gap-2"><span className="text-green-500">✓</span><span>{f}</span></li>)}</ul>}
                      <button className="w-full py-3 rounded hover:opacity-90 transition" style={buttonStyle}>{item.buttonText || 'Wählen'}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case 'faq':
        return (
          <section style={containerStyle}>
            <div className="max-w-4xl mx-auto">
              {h && <h2 className="text-3xl font-bold text-center mb-12" style={headingStyle}>{h}</h2>}
              {getItems().length > 0 && (
                <div className="space-y-4">
                  {getItems().map((item: any, idx: number) => (
                    <details key={idx} className="p-6 rounded-lg shadow" style={{ backgroundColor: styling.cardBackground || '#ffffff', color: styling.cardTextColor || 'inherit' }}>
                      <summary className="font-semibold cursor-pointer">{item.title || item.question}</summary>
                      <p className="mt-4 opacity-80">{item.description || item.answer}</p>
                    </details>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case 'stats':
        return (
          <section style={containerStyle}>
            <div className="max-w-6xl mx-auto">
              {h && <h2 className="text-3xl font-bold text-center mb-12" style={headingStyle}>{h}</h2>}
              {getItems().length > 0 && (
                <div className="grid md:grid-cols-4 gap-8 text-center">
                  {getItems().map((item: any, idx: number) => (
                    <div key={idx}>
                      <div className="text-5xl font-bold mb-2" style={{ color: styling.headingColor }}>{item.value}</div>
                      <p className="text-lg font-semibold mb-1">{item.title || item.label}</p>
                      {item.description && <p className="text-sm opacity-75">{item.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case 'newsletter':
        return <NewsletterSection content={content} styling={styling} containerStyle={containerStyle} headingStyle={headingStyle} buttonStyle={buttonStyle} apiUrl={API_URL} tenant={resolvedTenant} />;

      case 'video':
        return (
          <section style={containerStyle}>
            <div className="max-w-4xl mx-auto">
              {h && <h2 className="text-3xl font-bold text-center mb-8" style={headingStyle}>{h}</h2>}
              {content?.videoUrl
                ? <div className="aspect-video bg-black rounded-lg overflow-hidden"><iframe src={content.videoUrl} className="w-full h-full" allowFullScreen title="Video" /></div>
                : <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-5xl opacity-40">▶️</div>
              }
              {content?.text && <div className="mt-6 prose prose-lg mx-auto" dangerouslySetInnerHTML={{ __html: content.text }} />}
            </div>
          </section>
        );

      case 'gallery':
        return (
          <section style={containerStyle}>
            <div className="max-w-6xl mx-auto">
              {h && <h2 className="text-3xl font-bold text-center mb-8" style={headingStyle}>{h}</h2>}
              {content?.images && content.images.filter((img: any) => img.url).length > 0 ? (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {content.images.filter((img: any) => img.url).map((img: any, idx: number) => (
                    <div key={idx} className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
                      <Image src={img.url} alt={img.alt || ''} fill className="object-cover hover:scale-105 transition" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg text-5xl opacity-30">🖼️</div>
              )}
            </div>
          </section>
        );

      case 'booking':
        return (
          <section style={containerStyle}>
            <div className="max-w-2xl mx-auto text-center">
              {h && <h2 className="text-3xl font-bold mb-4" style={headingStyle}>{h}</h2>}
              {content?.text && <p className="text-lg opacity-80 mb-8">{content.text}</p>}
              <a href={content?.buttonLink || '/booking'} className="inline-block px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition" style={buttonStyle}>{content?.buttonText || 'Termin buchen'}</a>
            </div>
          </section>
        );

      case 'social':
        return (
          <section style={containerStyle}>
            <div className="max-w-2xl mx-auto text-center">
              {h && <h2 className="text-3xl font-bold mb-8" style={headingStyle}>{h}</h2>}
              <div className="flex gap-4 justify-center flex-wrap">
                {(content?.links || []).map((link: any, idx: number) => (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 hover:bg-gray-200 transition font-semibold text-gray-800 no-underline">
                    <span>{link.icon}</span><span>{link.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        );

      case 'map':
        return (
          <section style={containerStyle}>
            <div className="max-w-4xl mx-auto">
              {h && <h2 className="text-3xl font-bold text-center mb-4" style={headingStyle}>{h}</h2>}
              {content?.address && <p className="text-center opacity-70 mb-6">📍 {content.address}</p>}
              {content?.embedUrl
                ? <div className="rounded-xl overflow-hidden h-96 shadow"><iframe src={content.embedUrl} className="w-full h-full border-0" title="Karte" allowFullScreen /></div>
                : <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center text-5xl opacity-40">🗺️</div>
              }
            </div>
          </section>
        );

      case 'countdown':
        return (
          <section style={containerStyle}>
            <div className="max-w-xl mx-auto text-center">
              {h && <h2 className="text-3xl font-bold mb-8" style={headingStyle}>{h}</h2>}
              <div className="flex gap-6 justify-center">
                {['TT','STD','MIN','SEK'].map(u => (
                  <div key={u}>
                    <div className="text-5xl font-black" style={{ color: buttonStyle.backgroundColor }}>00</div>
                    <div className="text-xs opacity-60 uppercase tracking-widest mt-1">{u}</div>
                  </div>
                ))}
              </div>
              {content?.text && <p className="opacity-70 mt-6">{content.text}</p>}
            </div>
          </section>
        );

      case 'html':
        return (
          <section style={containerStyle}>
            <div className="max-w-6xl mx-auto">
              {content?.html && <div dangerouslySetInnerHTML={{ __html: content.html }} />}
              {!content?.html && content?.text && <div dangerouslySetInnerHTML={{ __html: content.text }} />}
            </div>
          </section>
        );

      default:
        return (
          <section style={containerStyle}>
            <div className="max-w-6xl mx-auto">
              {h && <h2 className="text-3xl font-bold mb-6" style={headingStyle}>{h}</h2>}
              {content?.subheading && <p className="text-xl mb-6 opacity-80">{content.subheading}</p>}
              {content?.text && <div className="prose prose-lg max-w-none mb-6" dangerouslySetInnerHTML={{ __html: content.text }} />}
              {content?.buttonText && <a href={content.buttonLink || '#'} className="inline-block px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition" style={buttonStyle}>{content.buttonText}</a>}
            </div>
          </section>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {activeSections.length > 0 ? (
        activeSections.map((section) => (
          <div key={section.id}>{renderSection(section)}</div>
        ))
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-2xl font-bold mb-2">Noch keine Inhalte</h2>
            <p className="text-gray-600">Diese Seite hat noch keine Sections</p>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// NEWSLETTER SECTION COMPONENT (mit Submit)
// =====================================================
function NewsletterSection({ content, styling, containerStyle, headingStyle, buttonStyle, apiUrl, tenant }: SectionComponentProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch(`${apiUrl}/api/public/${tenant}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };

      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Erfolgreich angemeldet!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Ein Fehler ist aufgetreten.');
      }
    } catch {
      setStatus('error');
      setMessage('Verbindungsfehler. Bitte später erneut versuchen.');
    }

    // Auto-Reset nach 5 Sekunden
    setTimeout(() => { setStatus('idle'); setMessage(''); }, 5000);
  };

  return (
    <section 
      className="text-white text-center"
      style={{
        ...containerStyle,
        background: styling.backgroundColor || 'linear-gradient(to right, #7c3aed, #2563eb)',
      }}
    >
      <div className="max-w-2xl mx-auto">
        {content?.heading && <h2 className="text-3xl font-bold mb-4" style={headingStyle}>{content.heading}</h2>}
        {content?.text && <p className="text-lg mb-8 opacity-90">{content.text}</p>}

        {status === 'success' ? (
          <div className="bg-white/20 backdrop-blur rounded-lg p-4 max-w-md mx-auto">
            <div className="text-2xl mb-2">🎉</div>
            <p className="font-semibold">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="ihre@email.de"
              className="flex-1 px-4 py-3 rounded text-gray-900"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
            />
            <button 
              type="submit" 
              className="px-6 py-3 rounded font-semibold hover:opacity-90 transition disabled:opacity-50"
              style={buttonStyle}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? '...' : 'Abonnieren'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-3 text-red-200 text-sm">{message}</p>
        )}
      </div>
    </section>
  );
}

// =====================================================
// CONTACT SECTION COMPONENT (mit Submit)
// =====================================================
function ContactSection({ content, containerStyle, headingStyle, buttonStyle, apiUrl, tenant }: SectionComponentProps) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resultMessage, setResultMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('loading');
    try {
      const res = await fetch(`${apiUrl}/api/public/${tenant}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };

      if (res.ok && data.success) {
        setStatus('success');
        setResultMessage(data.message || 'Nachricht gesendet!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setResultMessage(data.message || 'Ein Fehler ist aufgetreten.');
      }
    } catch {
      setStatus('error');
      setResultMessage('Verbindungsfehler. Bitte später erneut versuchen.');
    }
  };

  return (
    <section style={containerStyle}>
      <div className="max-w-2xl mx-auto">
        {content?.heading && <h2 className="text-3xl font-bold text-center mb-2" style={headingStyle}>{content.heading}</h2>}
        {content?.subheading && <p className="text-center opacity-75 mb-8">{content.subheading}</p>}

        {status === 'success' ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">{resultMessage}</h3>
            <button 
              onClick={() => setStatus('idle')}
              className="text-sm text-green-600 hover:text-green-700 underline mt-2"
            >
              Weitere Nachricht senden
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Ihr Name"
                  className="w-full border rounded px-4 py-2"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={status === 'loading'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  placeholder="ihre@email.de"
                  className="w-full border rounded px-4 py-2"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={status === 'loading'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nachricht</label>
                <textarea
                  rows={4}
                  placeholder="Ihre Nachricht..."
                  className="w-full border rounded px-4 py-2"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  disabled={status === 'loading'}
                />
              </div>

              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                  {resultMessage}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-3 rounded hover:opacity-90 transition disabled:opacity-50"
                style={buttonStyle}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Wird gesendet...' : (content?.buttonText || 'Senden')}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}