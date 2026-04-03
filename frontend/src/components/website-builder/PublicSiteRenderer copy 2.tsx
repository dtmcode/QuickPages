// 📂 PFAD: frontend/src/components/website-builder/PublicSiteRenderer.tsx?????

'use client';

import React from 'react';

interface Section {
  id: string;
  name: string;
  type: string;
  order: number;
  isActive: boolean;
  content: any;
  styling?: any;
}

interface Page {
  id: string;
  name: string;
  slug: string;
  sections: Section[];
}

interface PublicSiteRendererProps {
  page: Page;
}

export default function PublicSiteRenderer({ page }: PublicSiteRendererProps) {
  const sortedSections = [...page.sections]
    .filter(s => s.isActive)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen">
      {sortedSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}

function SectionRenderer({ section }: { section: Section }) {
  const { type, content, styling } = section;

  const containerStyle = {
    backgroundColor: styling?.backgroundColor,
    color: styling?.textColor,
    backgroundImage: styling?.backgroundImage ? `url(${styling.backgroundImage})` : undefined,
    paddingTop: styling?.padding?.top || '4rem',
    paddingBottom: styling?.padding?.bottom || '4rem',
    paddingLeft: styling?.padding?.left || '1rem',
    paddingRight: styling?.padding?.right || '1rem',
  };

  const headingStyle = {
    fontSize: styling?.headingSize || '2.25rem',
    color: styling?.headingColor || 'inherit',
  };

  const buttonStyle = {
    backgroundColor: styling?.buttonColor || '#3b82f6',
    color: styling?.buttonTextColor || '#ffffff',
  };

  const containerWidth = styling?.containerWidth === 'full'
    ? 'max-w-full'
    : styling?.containerWidth === 'narrow'
    ? 'max-w-4xl mx-auto'
    : 'max-w-7xl mx-auto';

  const h = content?.heading || content?.title || '';
  const getItems = (): any[] => content?.items || content?.plans || content?.members || content?.testimonials || content?.faqs || content?.stats || [];

  switch (type) {
    case 'hero':
      return (
        <section className="relative text-white" style={{ ...containerStyle, background: styling?.backgroundColor || 'linear-gradient(to right, #2563eb, #7c3aed)' }}>
          <div className={`${containerWidth} px-4 py-20 text-center`}>
            {h && <h1 className="text-5xl md:text-6xl font-bold mb-4" style={headingStyle}>{h}</h1>}
            {content?.subheading && <p className="text-xl md:text-2xl mb-8 opacity-90">{content.subheading}</p>}
            {content?.text && <div className="prose prose-lg prose-invert mx-auto mb-8" dangerouslySetInnerHTML={{ __html: content.text }} />}
            {content?.buttonText && <a href={content?.buttonLink || '#'} className="inline-block px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition" style={buttonStyle}>{content.buttonText}</a>}
          </div>
        </section>
      );

    case 'features':
      return (
        <section style={containerStyle} className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-4xl font-bold text-center mb-12" style={headingStyle}>{h}</h2>}
            <div className="grid md:grid-cols-3 gap-8">
              {getItems().map((item: any, idx: number) => (
                <div key={idx} className="p-6 rounded-lg shadow hover:shadow-lg transition" style={{ backgroundColor: styling?.cardBackground || '#ffffff', color: styling?.cardTextColor || 'inherit' }}>
                  {item.icon && <div className="text-4xl mb-4">{item.icon}</div>}
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="opacity-80">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'about':
    case 'text':
      return (
        <section style={containerStyle} className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold mb-6" style={headingStyle}>{h}</h2>}
            {content?.subheading && <p className="text-xl mb-6 opacity-80">{content.subheading}</p>}
            {content?.text && <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content.text }} />}
            {content?.buttonText && <div className="mt-8"><a href={content?.buttonLink || '#'} className="inline-block px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition" style={buttonStyle}>{content.buttonText}</a></div>}
          </div>
        </section>
      );

    case 'services':
      return (
        <section style={containerStyle} className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold text-center mb-12" style={headingStyle}>{h}</h2>}
            {content?.subheading && <p className="text-xl text-center mb-12 opacity-80">{content.subheading}</p>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getItems().map((item: any, idx: number) => (
                <div key={idx} className="p-6 rounded-lg shadow hover:shadow-lg transition" style={{ backgroundColor: styling?.cardBackground || '#ffffff', color: styling?.cardTextColor || 'inherit' }}>
                  {item.icon && <div className="text-3xl mb-4">{item.icon}</div>}
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="opacity-80 mb-4">{item.description}</p>
                  {item.price && <p className="text-2xl font-bold" style={{ color: styling?.headingColor }}>{item.price}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'cta':
      return (
        <section className="text-white text-center py-20" style={{ ...containerStyle, background: styling?.backgroundColor || '#2563eb' }}>
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl md:text-4xl font-bold mb-4" style={headingStyle}>{h}</h2>}
            {content?.subheading && <p className="text-lg md:text-xl mb-8 opacity-90">{content.subheading}</p>}
            {content?.text && <p className="text-lg md:text-xl mb-8 opacity-90">{content.text}</p>}
            {content?.buttonText && <a href={content?.buttonLink || '#'} className="inline-block px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition" style={buttonStyle}>{content.buttonText}</a>}
          </div>
        </section>
      );

    case 'contact':
      return (
        <section style={containerStyle} className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold text-center mb-2" style={headingStyle}>{h}</h2>}
            {content?.subheading && <p className="text-center opacity-75 mb-8">{content.subheading}</p>}
            <form className="bg-white p-8 rounded-lg shadow max-w-2xl mx-auto">
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" placeholder="Ihr Name" className="w-full border rounded px-4 py-2" required /></div>
                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" placeholder="ihre@email.de" className="w-full border rounded px-4 py-2" required /></div>
                <div><label className="block text-sm font-medium mb-1">Nachricht</label><textarea rows={4} placeholder="Ihre Nachricht..." className="w-full border rounded px-4 py-2" required /></div>
                <button type="submit" className="w-full py-3 rounded hover:opacity-90 transition" style={buttonStyle}>{content?.buttonText || 'Senden'}</button>
              </div>
            </form>
          </div>
        </section>
      );

    case 'team':
      return (
        <section style={containerStyle} className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold text-center mb-12" style={headingStyle}>{h}</h2>}
            <div className="grid md:grid-cols-3 gap-8">
              {getItems().map((item: any, idx: number) => (
                <div key={idx} className="text-center">
                  {item.image && <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200"><img src={item.image} alt={item.title || item.name} className="w-full h-full object-cover" /></div>}
                  <h3 className="text-xl font-semibold mb-1">{item.title || item.name}</h3>
                  <p className="text-sm opacity-75 mb-2">{item.subtitle || item.role}</p>
                  <p className="opacity-80">{item.description || item.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'testimonials':
      return (
        <section style={containerStyle} className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold text-center mb-12" style={headingStyle}>{h}</h2>}
            <div className="grid md:grid-cols-2 gap-8">
              {getItems().map((item: any, idx: number) => (
                <div key={idx} className="p-6 rounded-lg shadow" style={{ backgroundColor: styling?.cardBackground || '#ffffff', color: styling?.cardTextColor || 'inherit' }}>
                  <p className="text-lg mb-4 italic">&ldquo;{item.description || item.text}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    {item.image && <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200"><img src={item.image} alt={item.title || item.name} className="w-full h-full object-cover" /></div>}
                    <div>
                      <p className="font-semibold">{item.title || item.name}</p>
                      <p className="text-sm opacity-75">{item.subtitle || item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'pricing':
      return (
        <section style={containerStyle} className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold text-center mb-12" style={headingStyle}>{h}</h2>}
            <div className="grid md:grid-cols-3 gap-8">
              {getItems().map((item: any, idx: number) => (
                <div key={idx} className="p-8 rounded-lg shadow hover:shadow-lg transition text-center" style={{ backgroundColor: styling?.cardBackground || '#ffffff', color: styling?.cardTextColor || 'inherit' }}>
                  <h3 className="text-2xl font-bold mb-4">{item.title || item.name}</h3>
                  <div className="text-4xl font-bold mb-6" style={{ color: styling?.headingColor }}>{item.price}{item.interval && <span className="text-lg font-normal">/{item.interval}</span>}</div>
                  {item.description && <p className="mb-6 opacity-80">{item.description}</p>}
                  {item.features && <ul className="space-y-2 mb-6 text-left">{item.features.map((f: string, i: number) => <li key={i} className="flex items-center gap-2"><span className="text-green-500">✓</span><span>{f}</span></li>)}</ul>}
                  <button className="w-full py-3 rounded hover:opacity-90 transition" style={buttonStyle}>{item.buttonText || 'Wählen'}</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'faq':
      return (
        <section style={containerStyle} className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold text-center mb-12" style={headingStyle}>{h}</h2>}
            <div className="space-y-4 max-w-4xl mx-auto">
              {getItems().map((item: any, idx: number) => (
                <details key={idx} className="p-6 rounded-lg shadow" style={{ backgroundColor: styling?.cardBackground || '#ffffff', color: styling?.cardTextColor || 'inherit' }}>
                  <summary className="font-semibold cursor-pointer">{item.title || item.question}</summary>
                  <p className="mt-4 opacity-80">{item.description || item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      );

    case 'stats':
      return (
        <section style={containerStyle} className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold text-center mb-12" style={headingStyle}>{h}</h2>}
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {getItems().map((item: any, idx: number) => (
                <div key={idx}>
                  <div className="text-5xl font-bold mb-2" style={{ color: styling?.headingColor }}>{item.value}</div>
                  <p className="text-lg font-semibold mb-1">{item.title || item.label}</p>
                  {item.description && <p className="text-sm opacity-75">{item.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'newsletter':
      return (
        <section className="text-white text-center py-16" style={{ ...containerStyle, background: styling?.backgroundColor || 'linear-gradient(to right, #7c3aed, #2563eb)' }}>
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold mb-4" style={headingStyle}>{h}</h2>}
            {content?.text && <p className="text-lg mb-8 opacity-90">{content.text}</p>}
            <form className="flex gap-3 max-w-md mx-auto flex-wrap">
              <input type="email" placeholder={content?.placeholder || 'ihre@email.de'} className="flex-1 px-4 py-3 rounded text-gray-900" required />
              <button type="submit" className="px-6 py-3 rounded font-semibold hover:opacity-90 transition" style={buttonStyle}>{content?.buttonText || 'Abonnieren'}</button>
            </form>
          </div>
        </section>
      );

    case 'video':
      return (
        <section style={containerStyle} className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold text-center mb-8" style={headingStyle}>{h}</h2>}
            {content?.videoUrl
              ? <div className="aspect-video bg-black rounded-lg overflow-hidden max-w-4xl mx-auto"><iframe src={content.videoUrl} className="w-full h-full" allowFullScreen title="Video" /></div>
              : <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-5xl opacity-40 max-w-4xl mx-auto">▶️</div>
            }
          </div>
        </section>
      );

    case 'gallery':
      return (
        <section style={containerStyle} className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold text-center mb-8" style={headingStyle}>{h}</h2>}
            {content?.images?.length > 0
              ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{content.images.filter((img: any) => img.url).map((img: any, idx: number) => <div key={idx} className="aspect-square bg-gray-200 rounded-lg overflow-hidden"><img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover hover:scale-105 transition" /></div>)}</div>
              : <div className="text-center py-16 bg-gray-50 rounded-lg text-5xl opacity-30">🖼️</div>
            }
          </div>
        </section>
      );

    case 'booking':
      return (
        <section style={containerStyle} className="py-16">
          <div className={`${containerWidth} px-4 text-center`}>
            {h && <h2 className="text-3xl font-bold mb-4" style={headingStyle}>{h}</h2>}
            {content?.text && <p className="text-lg opacity-80 mb-8">{content.text}</p>}
            <a href={content?.buttonLink || '/booking'} className="inline-block px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition" style={buttonStyle}>{content?.buttonText || 'Termin buchen'}</a>
          </div>
        </section>
      );

    case 'social':
      return (
        <section style={containerStyle} className="py-16">
          <div className={`${containerWidth} px-4 text-center`}>
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
        <section style={containerStyle} className="py-16">
          <div className={`${containerWidth} px-4`}>
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
        <section style={containerStyle} className="py-16">
          <div className={`${containerWidth} px-4 text-center`}>
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
        <section style={containerStyle} className="py-16">
          <div className={`${containerWidth} px-4`}>
            {content?.html && <div dangerouslySetInnerHTML={{ __html: content.html }} />}
            {!content?.html && content?.text && <div dangerouslySetInnerHTML={{ __html: content.text }} />}
          </div>
        </section>
      );

    default:
      return (
        <section style={containerStyle} className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold mb-6" style={headingStyle}>{h}</h2>}
            {content?.subheading && <p className="text-xl mb-6 opacity-80">{content.subheading}</p>}
            {content?.text && <div className="prose prose-lg max-w-none mb-6" dangerouslySetInnerHTML={{ __html: content.text }} />}
            {content?.buttonText && <a href={content?.buttonLink || '#'} className="inline-block px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition" style={buttonStyle}>{content.buttonText}</a>}
          </div>
        </section>
      );
  }
}

