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

  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      [data-animation] { opacity: 0; transition-property: opacity, transform; transition-timing-function: ease-out; }
      [data-animation].anim-visible { opacity: 1; transform: none !important; }
      [data-animation="fade-in"] { opacity: 0; }
      [data-animation="slide-up"] { opacity: 0; transform: translateY(40px); }
      [data-animation="slide-left"] { opacity: 0; transform: translateX(-40px); }
      [data-animation="zoom-in"] { opacity: 0; transform: scale(0.92); }
    `;
    document.head.appendChild(style);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const delay = el.dataset.delay || '0s';
          const duration = el.dataset.duration || '0.5s';
          el.style.transitionDuration = duration;
          el.style.transitionDelay = delay;
          el.classList.add('anim-visible');
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animation]').forEach(el => observer.observe(el));
    return () => { observer.disconnect(); style.remove(); };
  }, []);

  return (
    <div className="min-h-screen">
      {sortedSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}
function BeforeAfterSlider({ beforeImage, afterImage, beforeLabel, afterLabel }: {
  beforeImage: string; afterImage: string; beforeLabel: string; afterLabel: string;
}) {
  const [pos, setPos] = React.useState(50);
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPos(x);
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', borderRadius: '0.75rem', overflow: 'hidden', cursor: 'ew-resize', userSelect: 'none' }}
      onMouseMove={e => handleMove(e.clientX)}
      onTouchMove={e => handleMove(e.touches[0].clientX)}>
      {/* After (full width background) */}
      {afterImage
        ? <img src={afterImage} alt={afterLabel} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ position: 'absolute', inset: 0, background: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>Nachher-Bild</div>
      }
      {/* Before (clipped left side) */}
      <div style={{ position: 'absolute', inset: 0, width: `${pos}%`, overflow: 'hidden' }}>
        {beforeImage
          ? <img src={beforeImage} alt={beforeLabel} style={{ position: 'absolute', top: 0, left: 0, width: `${10000 / pos}%`, maxWidth: 'none', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', background: '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Vorher-Bild</div>
        }
      </div>
      {/* Labels */}
      <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px 10px', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600 }}>{beforeLabel}</div>
      <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px 10px', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600 }}>{afterLabel}</div>
      {/* Divider */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, width: 3, background: '#fff', transform: 'translateX(-50%)', zIndex: 10 }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 36, height: 36, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#374151', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>↔</div>
      </div>
    </div>
  );
}
function SectionRenderer({ section }: { section: Section }) {
  const { type, content, styling } = section;

  const bg = styling?.backgroundColor || '';
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: bg && !bg.startsWith('linear') && !bg.startsWith('radial') ? bg : undefined,
    backgroundImage: bg && (bg.startsWith('linear') || bg.startsWith('radial'))
      ? bg
      : styling?.backgroundImage ? `url(${styling.backgroundImage})` : undefined,
    backgroundSize: styling?.backgroundSize || 'cover',
    backgroundPosition: styling?.backgroundPosition || 'center',
    color: styling?.textColor || 'inherit',
    fontFamily: styling?.fontFamily || 'inherit',
    fontSize: styling?.bodySize || 'inherit',
    lineHeight: styling?.lineHeight || 'inherit',
    textAlign: (styling?.textAlign as any) || undefined,
    paddingTop: styling?.padding?.top || '3rem',
    paddingBottom: styling?.padding?.bottom || '3rem',
    paddingLeft: styling?.padding?.left || '1.5rem',
    paddingRight: styling?.padding?.right || '1.5rem',
  };

  const animProps = styling?.animation?.type && styling.animation.type !== 'none' ? {
    'data-animation': styling.animation.type,
    'data-duration': styling.animation.duration || '0.5s',
    'data-delay': styling.animation.delay || '0s',
  } : {};

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

  // Overlay und Video als Wrapper
  const WrapSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <section style={containerStyle} className={className} {...animProps}>
      {/* Hintergrundvideo */}
      {styling?.backgroundVideo && (
        <video autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
          src={styling.backgroundVideo} />
      )}
      {/* Farb-Overlay */}
      {styling?.overlayColor && (styling?.overlayOpacity ?? 0) > 0 && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: styling.overlayColor, opacity: (styling.overlayOpacity ?? 0) / 100, pointerEvents: 'none' }} />
      )}
      {/* Custom CSS */}
      {styling?.customCss && <style dangerouslySetInnerHTML={{ __html: styling.customCss }} />}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </section>
  );
  switch (type) {
    case 'hero':
      return (
       <WrapSection className="relative text-white py-20">
  <div className={`${containerWidth} px-4 text-center`}>
            {h && <h1 className="text-5xl md:text-6xl font-bold mb-4" style={headingStyle}>{h}</h1>}
            {content?.subheading && <p className="text-xl md:text-2xl mb-8 opacity-90">{content.subheading}</p>}
            {content?.text && <div className="prose prose-lg prose-invert mx-auto mb-8" dangerouslySetInnerHTML={{ __html: content.text }} />}
            {content?.buttonText && <a href={content?.buttonLink || '#'} className="inline-block px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition" style={buttonStyle}>{content.buttonText}</a>}
          </div>
        </WrapSection>
      );

    case 'features':
      return (
        <WrapSection  className="py-16">
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
       </WrapSection>
      );

    case 'about':
    case 'text':
      return (
        <WrapSection  className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold mb-6" style={headingStyle}>{h}</h2>}
            {content?.subheading && <p className="text-xl mb-6 opacity-80">{content.subheading}</p>}
            {content?.text && <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content.text }} />}
            {content?.buttonText && <div className="mt-8"><a href={content?.buttonLink || '#'} className="inline-block px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition" style={buttonStyle}>{content.buttonText}</a></div>}
          </div>
       </WrapSection>
      );

    case 'services':
      return (
        <WrapSection  className="py-16">
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
       </WrapSection>
      );

    case 'cta':
      return (
       <WrapSection className="text-white text-center py-20">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl md:text-4xl font-bold mb-4" style={headingStyle}>{h}</h2>}
            {content?.subheading && <p className="text-lg md:text-xl mb-8 opacity-90">{content.subheading}</p>}
            {content?.text && <p className="text-lg md:text-xl mb-8 opacity-90">{content.text}</p>}
            {content?.buttonText && <a href={content?.buttonLink || '#'} className="inline-block px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition" style={buttonStyle}>{content.buttonText}</a>}
          </div>
       </WrapSection>
      );

    case 'contact':
      return (
        <WrapSection  className="py-16">
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
       </WrapSection>
      );

    case 'team':
      return (
        <WrapSection  className="py-16">
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
       </WrapSection>
      );

    case 'testimonials':
      return (
        <WrapSection  className="py-16">
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
       </WrapSection>
      );

    case 'pricing':
      return (
        <WrapSection  className="py-16">
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
       </WrapSection>
      );

    case 'faq':
      return (
        <WrapSection  className="py-16">
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
       </WrapSection>
      );

    case 'stats':
      return (
        <WrapSection  className="py-16">
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
       </WrapSection>
      );

    case 'newsletter':
      return (
        <WrapSection className="text-white text-center py-16">

          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold mb-4" style={headingStyle}>{h}</h2>}
            {content?.text && <p className="text-lg mb-8 opacity-90">{content.text}</p>}
            <form className="flex gap-3 max-w-md mx-auto flex-wrap">
              <input type="email" placeholder={content?.placeholder || 'ihre@email.de'} className="flex-1 px-4 py-3 rounded text-gray-900" required />
              <button type="submit" className="px-6 py-3 rounded font-semibold hover:opacity-90 transition" style={buttonStyle}>{content?.buttonText || 'Abonnieren'}</button>
            </form>
          </div>
        </WrapSection>
      );

    case 'video':
      return (
        <WrapSection  className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold text-center mb-8" style={headingStyle}>{h}</h2>}
            {content?.videoUrl
              ? <div className="aspect-video bg-black rounded-lg overflow-hidden max-w-4xl mx-auto"><iframe src={content.videoUrl} className="w-full h-full" allowFullScreen title="Video" /></div>
              : <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-5xl opacity-40 max-w-4xl mx-auto">▶️</div>
            }
          </div>
       </WrapSection>
      );

    case 'gallery':
      return (
        <WrapSection  className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold text-center mb-8" style={headingStyle}>{h}</h2>}
            {content?.images?.length > 0
              ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{content.images.filter((img: any) => img.url).map((img: any, idx: number) => <div key={idx} className="aspect-square bg-gray-200 rounded-lg overflow-hidden"><img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover hover:scale-105 transition" /></div>)}</div>
              : <div className="text-center py-16 bg-gray-50 rounded-lg text-5xl opacity-30">🖼️</div>
            }
          </div>
       </WrapSection>
      );

    case 'booking':
      return (
        <WrapSection  className="py-16">
          <div className={`${containerWidth} px-4 text-center`}>
            {h && <h2 className="text-3xl font-bold mb-4" style={headingStyle}>{h}</h2>}
            {content?.text && <p className="text-lg opacity-80 mb-8">{content.text}</p>}
            <a href={content?.buttonLink || '/booking'} className="inline-block px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition" style={buttonStyle}>{content?.buttonText || 'Termin buchen'}</a>
          </div>
       </WrapSection>
      );

    case 'social':
      return (
        <WrapSection  className="py-16">
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
       </WrapSection>
      );

    case 'map':
      return (
        <WrapSection  className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold text-center mb-4" style={headingStyle}>{h}</h2>}
            {content?.address && <p className="text-center opacity-70 mb-6">📍 {content.address}</p>}
            {content?.embedUrl
              ? <div className="rounded-xl overflow-hidden h-96 shadow"><iframe src={content.embedUrl} className="w-full h-full border-0" title="Karte" allowFullScreen /></div>
              : <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center text-5xl opacity-40">🗺️</div>
            }
          </div>
       </WrapSection>
      );

    case 'countdown':
      return (
        <WrapSection  className="py-16">
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
       </WrapSection>
      );

    case 'html':
      return (
        <WrapSection  className="py-16">
          <div className={`${containerWidth} px-4`}>
            {content?.html && <div dangerouslySetInnerHTML={{ __html: content.html }} />}
            {!content?.html && content?.text && <div dangerouslySetInnerHTML={{ __html: content.text }} />}
          </div>
       </WrapSection>
      );
    case 'spacer':
      return (
        <WrapSection>
          <div style={{ height: content?.height || '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {content?.showLine && (
              <div style={{ width: '80%', borderTop: `${content.lineThickness || '1px'} ${content.lineStyle || 'solid'} ${content.lineColor || '#e5e7eb'}` }} />
            )}
          </div>
        </WrapSection>
      );

    case 'whatsapp':
      return (
        <>
          <style>{`
            .wa-btn { position: fixed; ${content?.position === 'left' ? 'left: 1.5rem' : 'right: 1.5rem'}; bottom: 1.5rem; z-index: 9999;
              display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.5rem;
              background: #25D366; color: #fff; border-radius: 3rem; font-weight: 600;
              text-decoration: none; box-shadow: 0 4px 20px rgba(37,211,102,0.4);
              transition: transform 0.2s, box-shadow 0.2s; }
            .wa-btn:hover { transform: scale(1.05); box-shadow: 0 6px 28px rgba(37,211,102,0.5); }
          `}</style>
          <a className="wa-btn" href={`https://wa.me/${(content?.phone || '').replace(/\s+/g, '').replace(/^\+/, '')}?text=${encodeURIComponent(content?.message || '')}`} target="_blank" rel="noopener noreferrer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {content?.label || 'WhatsApp'}
          </a>
        </>
      );

    case 'before_after':
      return (
        <WrapSection className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold text-center mb-8" style={headingStyle}>{h}</h2>}
            <div className="relative max-w-3xl mx-auto" style={{ userSelect: 'none' }}>
              <BeforeAfterSlider
                beforeImage={content?.beforeImage || ''}
                afterImage={content?.afterImage || ''}
                beforeLabel={content?.beforeLabel || 'Vorher'}
                afterLabel={content?.afterLabel || 'Nachher'}
              />
            </div>
          </div>
        </WrapSection>
      );
    case 'freestyle': {
  const blocks: any[] = (content?.blocks || []).sort((a: any, b: any) => a.order - b.order);

  const renderFreeBlock = (block: any) => {
    const align = block.align || 'center';
    const wrapStyle: React.CSSProperties = { textAlign: align as any, marginBottom: '0.75rem' };

    switch (block.type) {
     case 'heading': {
  const Tag = (block.level || 'h2') as any;
  const sizes: Record<string, string> = { h1: headingSize, h2: '1.75rem', h3: '1.25rem', h4: '1rem' };
  return (
    <div key={block.id} style={{ ...alignStyle, marginBottom: '0.75rem' }}>
      <Tag style={{ 
        fontSize: block.fontSize || sizes[block.level || 'h2'],  // ← block.fontSize hat Vorrang
        fontWeight: 700, 
        margin: 0,
        color: block.color || 'inherit',  // ← block.color
      }}>
        {block.text || 'Überschrift'}
      </Tag>
    </div>
  );
}

case 'text':
  return (
    <div key={block.id} style={{ ...alignStyle, marginBottom: '0.75rem' }}>
      <div dangerouslySetInnerHTML={{ __html: block.html || '<p>Text...</p>' }} 
        style={{ 
          lineHeight: 1.6,
          fontSize: block.fontSize || 'inherit',  // ← block.fontSize
          color: block.color || 'inherit',         // ← block.color
        }} />
    </div>
  );
      case 'button':
        return (
          <div style={wrapStyle}>
            <a href={block.link || '#'} style={{
              display: 'inline-block', padding: '0.75rem 2rem', borderRadius: buttonStyle.backgroundColor ? '0.5rem' : '0.5rem',
              fontWeight: 600, textDecoration: 'none', cursor: 'pointer',
              background: block.style === 'primary' ? buttonStyle.backgroundColor : block.style === 'outline' ? 'transparent' : 'rgba(0,0,0,0.06)',
              color: block.style === 'primary' ? buttonStyle.color : buttonStyle.backgroundColor,
              border: block.style === 'outline' ? `2px solid ${buttonStyle.backgroundColor}` : 'none',
            }}>{block.text || 'Button'}</a>
          </div>
        );
      case 'image':
        return (
          <div style={wrapStyle}>
            {block.url && <img src={block.url} alt={block.alt || ''} style={{ width: block.width || '100%', maxWidth: '100%', borderRadius: '0.5rem' }} />}
          </div>
        );
      case 'badge':
        return (
          <div style={wrapStyle}>
            <span style={{ display: 'inline-block', padding: '4px 14px', background: 'rgba(88,166,255,0.12)', color: buttonStyle.backgroundColor, borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 600 }}>
              {block.text}
            </span>
          </div>
        );
      case 'icon':
        return <div style={wrapStyle}><span style={{ fontSize: block.size || '3rem' }}>{block.emoji}</span></div>;
      case 'spacer':
        return <div style={{ height: block.height || '2rem' }} />;
      case 'divider':
        return <hr style={{ border: 'none', borderTop: `${block.thickness || '1px'} ${block.style || 'solid'} ${block.color || '#e5e7eb'}`, margin: '0.5rem 0' }} />;
      case 'list': {
        const icons: Record<string, string> = { check: '✓', bullet: '•', arrow: '→', number: '' };
        return (
          <div style={wrapStyle}>
            {(block.items || []).map((item: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
                <span style={{ color: buttonStyle.backgroundColor, fontWeight: 700, flexShrink: 0 }}>
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
          <div style={wrapStyle}>
            {block.url && <div className="aspect-video max-w-2xl inline-block w-full rounded-xl overflow-hidden"><iframe src={block.url} className="w-full h-full" allowFullScreen /></div>}
          </div>
        );
      case 'columns':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '0.75rem' }}>
            <div>{(block.leftBlocks || []).map((b: any) => renderFreeBlock(b))}</div>
            <div>{(block.rightBlocks || []).map((b: any) => renderFreeBlock(b))}</div>
          </div>
        );
      case 'feature-grid':
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`, gap: '1.5rem' }}>
        {(block.items || []).map((item: any, i: number) => (
          <div key={i} style={{ padding: '1.5rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.03)', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            {item.icon && <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{item.icon}</div>}
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{item.title}</h3>
            <p style={{ opacity: 0.75, margin: 0 }}>{item.description}</p>
            {item.price && <p style={{ fontWeight: 700, color: buttonStyle.backgroundColor, marginTop: '0.5rem' }}>{item.price}</p>}
          </div>
        ))}
      </div>
    </div>
  );

case 'stat-grid':
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(160px, 1fr))`, gap: '2rem', textAlign: 'center' }}>
        {(block.items || []).map((item: any, i: number) => (
          <div key={i}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: buttonStyle.backgroundColor, lineHeight: 1 }}>{item.value}</div>
            <div style={{ fontWeight: 600, margin: '0.4rem 0 0.2rem', fontSize: '1.1rem' }}>{item.label}</div>
            {item.description && <div style={{ opacity: 0.6 }}>{item.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );

case 'testimonial-grid':
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))`, gap: '1.5rem' }}>
        {(block.items || []).map((item: any, i: number) => (
          <div key={i} style={{ padding: '1.5rem', borderRadius: '0.75rem', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontStyle: 'italic' }}>
            <p style={{ margin: '0 0 1rem', lineHeight: 1.6 }}>„{item.text}"</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontStyle: 'normal' }}>
              {item.image && <img src={item.image} alt={item.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />}
              <div>
                <p style={{ fontWeight: 600, margin: 0 }}>{item.name}</p>
                {item.role && <p style={{ opacity: 0.6, margin: 0, fontSize: '0.875rem' }}>{item.role}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

case 'team-grid':
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`, gap: '2rem', textAlign: 'center' }}>
        {(block.items || []).map((item: any, i: number) => (
          <div key={i}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: buttonStyle.backgroundColor, margin: '0 auto 1rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem' }}>
              {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
            </div>
            <h3 style={{ fontWeight: 700, margin: '0 0 0.25rem' }}>{item.name}</h3>
            <p style={{ opacity: 0.6, margin: '0 0 0.5rem', fontSize: '0.875rem' }}>{item.role}</p>
            {item.bio && <p style={{ opacity: 0.75, fontSize: '0.875rem', margin: 0 }}>{item.bio}</p>}
          </div>
        ))}
      </div>
    </div>
  );

case 'pricing-grid':
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))`, gap: '1.5rem' }}>
        {(block.items || []).map((item: any, i: number) => (
          <div key={i} style={{ padding: '2rem', borderRadius: '0.75rem', background: item.highlighted ? buttonStyle.backgroundColor : '#fff', color: item.highlighted ? buttonStyle.color : 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <h3 style={{ fontWeight: 700, margin: '0 0 0.5rem', fontSize: '1.25rem' }}>{item.title}</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 1rem' }}>{item.price}<span style={{ fontSize: '1rem', fontWeight: 400 }}>/{item.interval}</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', textAlign: 'left' }}>
              {(item.features || []).map((f: string, fi: number) => <li key={fi} style={{ padding: '0.25rem 0', fontSize: '0.875rem' }}>✓ {f}</li>)}
            </ul>
            <a href="#" style={{ display: 'block', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 600, textDecoration: 'none', background: item.highlighted ? 'rgba(255,255,255,0.2)' : buttonStyle.backgroundColor, color: item.highlighted ? '#fff' : buttonStyle.color }}>
              {item.buttonText || 'Jetzt starten'}
            </a>
          </div>
        ))}
      </div>
    </div>
  );

case 'faq-list':
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {(block.items || []).map((item: any, i: number) => (
        <details key={i} style={{ marginBottom: '0.75rem', padding: '1rem 1.25rem', background: '#fff', borderRadius: '0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          <summary style={{ fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>{item.question}</summary>
          <p style={{ margin: '0.75rem 0 0', opacity: 0.8 }}>{item.answer}</p>
        </details>
      ))}
    </div>
  );

case 'image-grid':
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${block.columns || 3}, 1fr)`, gap: '0.75rem' }}>
        {(block.images || []).map((img: any, i: number) => (
          <div key={i} style={{ aspectRatio: '1', borderRadius: '0.5rem', overflow: 'hidden', background: '#f3f4f6' }}>
            {img.url && <img src={img.url} alt={img.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
        ))}
      </div>
    </div>
  );

case 'contact-form':
  return (
    <div style={{ maxWidth: 520, margin: '0 auto 1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {['Name', 'E-Mail'].map(f => (
          <input key={f} type={f === 'E-Mail' ? 'email' : 'text'} placeholder={f} style={{ padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} />
        ))}
        <textarea placeholder="Nachricht" rows={4} style={{ padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem', resize: 'vertical' }} />
        {block.gdprText && <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>🔒 {block.gdprText}</p>}
        <button style={{ padding: '0.75rem', borderRadius: '0.5rem', background: buttonStyle.backgroundColor, color: buttonStyle.color, fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem' }}>{block.buttonText || 'Senden'}</button>
      </div>
    </div>
  );

case 'newsletter-form':
  return (
    <div style={{ maxWidth: 480, margin: '0 auto 1.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input type="email" placeholder={block.placeholder || 'deine@email.de'} style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }} />
        <button style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: buttonStyle.backgroundColor, color: buttonStyle.color, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>{block.buttonText || 'Abonnieren'}</button>
      </div>
    </div>
  );

case 'blog-feed':
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
        {Array(block.count || 3).fill(null).map((_, i) => (
          <div key={i} style={{ borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: '#fff' }}>
            <div style={{ aspectRatio: '16/9', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', opacity: 0.3 }}>📰</div>
            <div style={{ padding: '1rem' }}>
              <h4 style={{ fontWeight: 600, margin: '0 0 0.5rem' }}>Blog-Post Titel</h4>
              <p style={{ opacity: 0.6, margin: 0, fontSize: '0.875rem' }}>Kurze Beschreibung...</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

case 'social-links':
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
      {(block.links || []).map((l: any, i: number) => (
        <a key={i} href={l.url || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', background: 'rgba(0,0,0,0.06)', borderRadius: '0.75rem', textDecoration: 'none', color: 'inherit', fontWeight: 600 }}>
          <span>{l.icon}</span><span>{l.platform}</span>
        </a>
      ))}
    </div>
  );

case 'map-embed':
  return block.embedUrl ? (
    <div style={{ marginBottom: '1.5rem', borderRadius: '0.75rem', overflow: 'hidden', aspectRatio: '16/7' }}>
      <iframe src={block.embedUrl} width="100%" height="100%" style={{ border: 'none' }} title="Karte" allowFullScreen />
    </div>
  ) : (
    <div style={{ marginBottom: '1.5rem', background: '#f3f4f6', borderRadius: '0.75rem', aspectRatio: '16/7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5, gap: '0.5rem' }}>
      <span style={{ fontSize: '2rem' }}>🗺️</span>
      <span>{block.address || 'Adresse eingeben'}</span>
    </div>
  );

case 'countdown-timer':
  return (
    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        {['Tage', 'Std', 'Min', 'Sek'].map(u => (
          <div key={u} style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '0.75rem', padding: '1rem 1.5rem', minWidth: 72 }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: buttonStyle.backgroundColor }}>00</div>
            <div style={{ opacity: 0.6, fontSize: '0.75rem' }}>{u}</div>
          </div>
        ))}
      </div>
      {block.text && <p style={{ marginTop: '1rem', opacity: 0.75 }}>{block.text}</p>}
    </div>
  );

case 'before-after':
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <BeforeAfterSlider
        beforeImage={block.beforeImage || ''}
        afterImage={block.afterImage || ''}
        beforeLabel={block.beforeLabel || 'Vorher'}
        afterLabel={block.afterLabel || 'Nachher'}
      />
    </div>
  );

case 'whatsapp-btn':
  return (
    <div style={{ textAlign: (block.position === 'left' ? 'left' : 'right'), marginBottom: '1rem' }}>
      <a href={`https://wa.me/${(block.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(block.message || '')}`}
        target="_blank" rel="noopener noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.5rem', background: '#25D366', color: '#fff', borderRadius: '3rem', fontWeight: 600, textDecoration: 'none' }}>
        💬 {block.label || 'WhatsApp schreiben'}
      </a>
    </div>
  );
      default: return null;
    }
  };

  return (
    <WrapSection className="py-16">
      <div className={`${containerWidth} px-4`}>
        {blocks.map(block => renderFreeBlock(block))}
      </div>
    </WrapSection>
  );
}

    default:
      return (
        <WrapSection  className="py-16">
          <div className={`${containerWidth} px-4`}>
            {h && <h2 className="text-3xl font-bold mb-6" style={headingStyle}>{h}</h2>}
            {content?.subheading && <p className="text-xl mb-6 opacity-80">{content.subheading}</p>}
            {content?.text && <div className="prose prose-lg max-w-none mb-6" dangerouslySetInnerHTML={{ __html: content.text }} />}
            {content?.buttonText && <a href={content?.buttonLink || '#'} className="inline-block px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition" style={buttonStyle}>{content.buttonText}</a>}
          </div>
       </WrapSection>
      );
  }
}

