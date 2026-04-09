// 📂 PFAD: frontend-public/src/app/PublicSiteRenderer.tsx{{{{{}}}}}

'use client';

import React, { useState, useEffect } from 'react';
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
const bg = styling?.backgroundColor || '';
const pad = typeof styling?.padding === 'object' && styling?.padding !== null
  ? styling.padding as { top?: string; bottom?: string; left?: string; right?: string }
  : null;

const containerStyle: React.CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: bg && !bg.startsWith('linear') && !bg.startsWith('radial') ? bg : undefined,
  backgroundImage: bg && (bg.startsWith('linear') || bg.startsWith('radial'))
    ? bg
    : (styling as any)?.backgroundImage ? `url(${(styling as any).backgroundImage})` : undefined,
  backgroundSize: (styling as any)?.backgroundSize || 'cover',
  backgroundPosition: (styling as any)?.backgroundPosition || 'center',
  color: styling?.textColor || 'inherit',
  paddingTop: pad?.top || '3rem',
  paddingBottom: pad?.bottom || '3rem',
  paddingLeft: pad?.left || '1.5rem',
  paddingRight: pad?.right || '1.5rem',
  fontFamily: styling?.fontFamily || 'inherit',
  fontSize: styling?.bodySize || 'inherit',
  textAlign: (styling?.textAlign as any) || undefined,
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
        <section className="relative text-white" style={containerStyle}>
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
          <section className="text-white text-center" style={containerStyle}>

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
  return <CountdownSection key={section.id} content={content} headingStyle={headingStyle} buttonStyle={buttonStyle} containerStyle={containerStyle} />;
      case 'html':
        return (
          <section style={containerStyle}>
            <div className="max-w-6xl mx-auto">
              {content?.html && <div dangerouslySetInnerHTML={{ __html: content.html }} />}
              {!content?.html && content?.text && <div dangerouslySetInnerHTML={{ __html: content.text }} />}
            </div>
          </section>
        );
      case 'before_after':
  return (
    <section style={containerStyle}>
      <div className="max-w-4xl mx-auto px-4">
        {h && <h2 className="text-3xl font-bold text-center mb-8" style={headingStyle}>{h}</h2>}
        <BeforeAfterSlider
          beforeImage={content?.beforeImage as string || ''}
          afterImage={content?.afterImage as string || ''}
          beforeLabel={content?.beforeLabel as string || 'Vorher'}
          afterLabel={content?.afterLabel as string || 'Nachher'}
        />
      </div>
    </section>
  );

case 'spacer':
  return (
    <section style={containerStyle}>
      <div style={{ height: (content as any)?.height || '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {(content as any)?.showLine && (
          <div style={{ width: '80%', borderTop: `${(content as any).lineThickness || '1px'} ${(content as any).lineStyle || 'solid'} ${(content as any).lineColor || '#e5e7eb'}` }} />
        )}
      </div>
    </section>
  );

case 'whatsapp':
  return (
    <>
      <style>{`
        .wa-btn { position: fixed; ${(content as any)?.position === 'left' ? 'left: 1.5rem' : 'right: 1.5rem'}; bottom: 1.5rem; z-index: 9999;
          display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.5rem;
          background: #25D366; color: #fff; border-radius: 3rem; font-weight: 600;
          text-decoration: none; box-shadow: 0 4px 20px rgba(37,211,102,0.4);
          transition: transform 0.2s, box-shadow 0.2s; }
        .wa-btn:hover { transform: scale(1.05); box-shadow: 0 6px 28px rgba(37,211,102,0.5); }
      `}</style>
      <a className="wa-btn"
        href={`https://wa.me/${((content as any)?.phone || '').replace(/\s+/g, '').replace(/^\+/, '')}?text=${encodeURIComponent((content as any)?.message || '')}`}
        target="_blank" rel="noopener noreferrer">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        {(content as any)?.label || 'WhatsApp'}
      </a>
    </>
        );
      case 'freestyle': {
  const blocks: any[] = ((content as any)?.blocks || []).sort((a: any, b: any) => a.order - b.order);
  const cw = styling?.containerWidth;
  const maxW = cw === 'full' ? '100%' : cw === 'narrow' ? '768px' : '1200px';

  const renderFreeBlock = (block: any): React.ReactNode => {
    const align = block.align || 'center';
    const ws: React.CSSProperties = { textAlign: align as any, marginBottom: '0.75rem' };

    switch (block.type) {
      case 'heading': {
        const sizes: Record<string, string> = { h1: '2.5rem', h2: '1.875rem', h3: '1.375rem', h4: '1.125rem' };
        const Tag = (block.level || 'h2') as any;
        return <div style={ws}><Tag style={{ fontSize: sizes[block.level || 'h2'], fontWeight: 700, margin: 0 }}>{block.text}</Tag></div>;
      }
      case 'text':
        return <div style={ws} dangerouslySetInnerHTML={{ __html: block.html || '' }} />;
      case 'button':
        return (
          <div style={ws}>
            <a href={block.link || '#'} style={{
              display: 'inline-block', padding: '0.75rem 2rem', borderRadius: '0.5rem',
              fontWeight: 600, textDecoration: 'none',
              background: block.style === 'primary' ? (buttonStyle.backgroundColor || '#3b82f6') : block.style === 'outline' ? 'transparent' : 'rgba(0,0,0,0.06)',
              color: block.style === 'primary' ? (buttonStyle.color || '#fff') : (buttonStyle.backgroundColor || '#3b82f6'),
              border: block.style === 'outline' ? `2px solid ${buttonStyle.backgroundColor || '#3b82f6'}` : 'none',
            }}>{block.text || 'Button'}</a>
          </div>
        );
      case 'image':
        return (
          <div style={ws}>
            {block.url && <img src={block.url} alt={block.alt || ''} style={{ width: block.width || '100%', maxWidth: '100%', borderRadius: '0.5rem' }} />}
          </div>
        );
      case 'badge':
        return (
          <div style={ws}>
            <span style={{ display: 'inline-block', padding: '4px 14px', background: 'rgba(88,166,255,0.12)', color: buttonStyle.backgroundColor || '#3b82f6', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 600 }}>
              {block.text}
            </span>
          </div>
        );
      case 'icon':
        return <div style={ws}><span style={{ fontSize: block.size || '3rem' }}>{block.emoji}</span></div>;
      case 'spacer':
        return <div style={{ height: block.height || '2rem' }} />;
      case 'divider':
        return <hr style={{ border: 'none', borderTop: `${block.thickness || '1px'} ${block.style || 'solid'} ${block.color || '#e5e7eb'}`, margin: '0.5rem 0' }} />;
      case 'list': {
        const icons: Record<string, string> = { check: '✓', bullet: '•', arrow: '→', number: '' };
        return (
          <div style={ws}>
            {(block.items || []).map((item: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
                <span style={{ color: buttonStyle.backgroundColor || '#3b82f6', fontWeight: 700, flexShrink: 0 }}>
                  {block.style === 'number' ? `${i + 1}.` : icons[block.style || 'check']}
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        );
      }
      case 'video':
        return (
          <div style={ws}>
            {block.url && (
              <div style={{ aspectRatio: '16/9', maxWidth: '42rem', display: 'inline-block', width: '100%', borderRadius: '0.75rem', overflow: 'hidden' }}>
                <iframe src={block.url} style={{ width: '100%', height: '100%' }} allowFullScreen />
              </div>
            )}
          </div>
        );
      case 'columns':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '0.75rem' }}>
            <div>{(block.leftBlocks || []).map((b: any, i: number) => <div key={i}>{renderFreeBlock(b)}</div>)}</div>
            <div>{(block.rightBlocks || []).map((b: any, i: number) => <div key={i}>{renderFreeBlock(b)}</div>)}</div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <section style={containerStyle}>
      <div style={{ maxWidth: maxW, margin: '0 auto', padding: '0 1.5rem' }}>
        {blocks.map((block, i) => <div key={block.id || i}>{renderFreeBlock(block)}</div>)}
      </div>
    </section>
  );
}

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
function CountdownSection({ content, headingStyle, buttonStyle, containerStyle }: any) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = content?.targetDate ? new Date(content.targetDate).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000;
    const calc = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [content?.targetDate]);

  const h = content?.heading || content?.title || '';
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section style={containerStyle}>
      <div className="max-w-xl mx-auto text-center">
        {h && <h2 className="text-3xl font-bold mb-8" style={headingStyle}>{h}</h2>}
        <div className="flex gap-6 justify-center">
          {[{ v: pad(timeLeft.days), l: 'Tage' }, { v: pad(timeLeft.hours), l: 'Std' },
            { v: pad(timeLeft.minutes), l: 'Min' }, { v: pad(timeLeft.seconds), l: 'Sek' }].map(({ v, l }) => (
            <div key={l}>
              <div className="text-5xl font-black tabular-nums" style={{ color: buttonStyle.backgroundColor }}>{v}</div>
              <div className="text-xs opacity-60 uppercase tracking-widest mt-1">{l}</div>
            </div>
          ))}
        </div>
        {content?.text && <p className="opacity-70 mt-6">{content.text}</p>}
      </div>
    </section>
  );
}
function BeforeAfterSlider({ beforeImage, afterImage, beforeLabel, afterLabel }: {
  beforeImage: string; afterImage: string; beforeLabel: string; afterLabel: string;
}) {
  const [pos, setPos] = useState(50);
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPos(x);
  };

  return (
    <div ref={ref}
      style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', borderRadius: '0.75rem', overflow: 'hidden', cursor: 'ew-resize', userSelect: 'none' }}
      onMouseMove={e => handleMove(e.clientX)}
      onTouchMove={e => handleMove(e.touches[0].clientX)}>
      {afterImage
        ? <img src={afterImage} alt={afterLabel} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ position: 'absolute', inset: 0, background: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>Nachher-Bild</div>}
      <div style={{ position: 'absolute', inset: 0, width: `${pos}%`, overflow: 'hidden' }}>
        {beforeImage
          ? <img src={beforeImage} alt={beforeLabel} style={{ position: 'absolute', top: 0, left: 0, width: `${10000 / pos}%`, maxWidth: 'none', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', background: '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Vorher-Bild</div>}
      </div>
      <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px 10px', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600 }}>{beforeLabel}</div>
      <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px 10px', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600 }}>{afterLabel}</div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, width: 3, background: '#fff', transform: 'translateX(-50%)', zIndex: 10 }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 36, height: 36, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#374151', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>↔</div>
      </div>
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
  style={containerStyle}

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