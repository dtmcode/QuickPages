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

  const containerWidth = styling?.containerWidth === 'full' 
    ? 'max-w-full' 
    : styling?.containerWidth === 'narrow' 
    ? 'max-w-4xl mx-auto' 
    : 'max-w-7xl mx-auto';

  switch (type) {
    case 'hero':
      return <HeroSection content={content} styling={containerStyle} containerWidth={containerWidth} />;
    case 'features':
      return <FeaturesSection content={content} styling={containerStyle} containerWidth={containerWidth} />;
    case 'about':
      return <AboutSection content={content} styling={containerStyle} containerWidth={containerWidth} />;
    case 'services':
      return <ServicesSection content={content} styling={containerStyle} containerWidth={containerWidth} />;
    case 'gallery':
      return <GallerySection content={content} styling={containerStyle} containerWidth={containerWidth} />;
    case 'testimonials':
      return <TestimonialsSection content={content} styling={containerStyle} containerWidth={containerWidth} />;
    case 'team':
      return <TeamSection content={content} styling={containerStyle} containerWidth={containerWidth} />;
    case 'pricing':
      return <PricingSection content={content} styling={containerStyle} containerWidth={containerWidth} />;
    case 'cta':
      return <CTASection content={content} styling={containerStyle} containerWidth={containerWidth} />;
    case 'contact':
      return <ContactSection content={content} styling={containerStyle} containerWidth={containerWidth} />;
    case 'faq':
      return <FAQSection content={content} styling={containerStyle} containerWidth={containerWidth} />;
    case 'stats':
      return <StatsSection content={content} styling={containerStyle} containerWidth={containerWidth} />;
    case 'video':
      return <VideoSection content={content} styling={containerStyle} containerWidth={containerWidth} />;
    case 'text':
      return <TextSection content={content} styling={containerStyle} containerWidth={containerWidth} />;
    case 'html':
      return <HTMLSection content={content} styling={containerStyle} containerWidth={containerWidth} />;
    default:
      return <div style={containerStyle} className={containerWidth}>Unbekannter Section-Typ: {type}</div>;
  }
}

// ==================== HERO SECTION ====================
function HeroSection({ content, styling, containerWidth }: any) {
  return (
    <section style={styling} className="py-20">
      <div className={`${containerWidth} px-4`}>
        <div className="text-center">
          {content.heading && <h1 className="text-5xl font-bold mb-4">{content.heading}</h1>}
          {content.subheading && <p className="text-xl mb-8 opacity-90">{content.subheading}</p>}
          {content.text && <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: content.text }} />}
          {content.buttonText && (
            <a href={content.buttonLink || '#'} className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              {content.buttonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ==================== FEATURES SECTION ====================
function FeaturesSection({ content, styling, containerWidth }: any) {
  return (
    <section style={styling} className="py-16">
      <div className={`${containerWidth} px-4`}>
        {content.heading && <h2 className="text-4xl font-bold text-center mb-12">{content.heading}</h2>}
        <div className="grid md:grid-cols-3 gap-8">
          {content.items?.map((item: any, idx: number) => (
            <div key={idx} className="text-center p-6 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
              {item.icon && <div className="text-5xl mb-4">{item.icon}</div>}
              {item.title && <h3 className="text-xl font-semibold mb-2">{item.title}</h3>}
              {item.description && <p className="opacity-80">{item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== ABOUT SECTION ====================
function AboutSection({ content, styling, containerWidth }: any) {
  return (
    <section style={styling} className="py-16">
      <div className={`${containerWidth} px-4`}>
        {content.heading && <h2 className="text-4xl font-bold mb-8">{content.heading}</h2>}
        {content.text && <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.text }} />}
      </div>
    </section>
  );
}

// ==================== SERVICES SECTION ====================
function ServicesSection({ content, styling, containerWidth }: any) {
  return (
    <section style={styling} className="py-16">
      <div className={`${containerWidth} px-4`}>
        {content.heading && <h2 className="text-4xl font-bold text-center mb-12">{content.heading}</h2>}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.items?.map((item: any, idx: number) => (
            <div key={idx} className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm hover:bg-opacity-20 transition">
              {item.icon && <div className="text-4xl mb-4">{item.icon}</div>}
              {item.title && <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>}
              {item.description && <p className="opacity-80 mb-4">{item.description}</p>}
              {item.price && <p className="font-bold text-lg">{item.price}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== GALLERY SECTION ====================
function GallerySection({ content, styling, containerWidth }: any) {
  return (
    <section style={styling} className="py-16">
      <div className={`${containerWidth} px-4`}>
        {content.heading && <h2 className="text-4xl font-bold text-center mb-12">{content.heading}</h2>}
        <div className="grid md:grid-cols-3 gap-4">
          {content.images?.map((image: any, idx: number) => (
            <div key={idx} className="aspect-square overflow-hidden rounded-lg">
              <img src={image.url} alt={image.alt || ''} className="w-full h-full object-cover hover:scale-110 transition duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== TESTIMONIALS SECTION ====================
function TestimonialsSection({ content, styling, containerWidth }: any) {
  return (
    <section style={styling} className="py-16">
      <div className={`${containerWidth} px-4`}>
        {content.heading && <h2 className="text-4xl font-bold text-center mb-12">{content.heading}</h2>}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.testimonials?.map((testimonial: any, idx: number) => (
            <div key={idx} className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
              <p className="mb-4 italic">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                {testimonial.avatar && (
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full" />
                )}
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm opacity-70">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== TEAM SECTION ====================
function TeamSection({ content, styling, containerWidth }: any) {
  return (
    <section style={styling} className="py-16">
      <div className={`${containerWidth} px-4`}>
        {content.heading && <h2 className="text-4xl font-bold text-center mb-12">{content.heading}</h2>}
        <div className="grid md:grid-cols-3 gap-8">
          {content.members?.map((member: any, idx: number) => (
            <div key={idx} className="text-center">
              {member.image && (
                <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
              )}
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="opacity-70 mb-2">{member.role}</p>
              {member.bio && <p className="text-sm opacity-60">{member.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== PRICING SECTION ====================
function PricingSection({ content, styling, containerWidth }: any) {
  return (
    <section style={styling} className="py-16">
      <div className={`${containerWidth} px-4`}>
        {content.heading && <h2 className="text-4xl font-bold text-center mb-12">{content.heading}</h2>}
        <div className="grid md:grid-cols-3 gap-8">
          {content.plans?.map((plan: any, idx: number) => (
            <div key={idx} className={`bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur-sm ${plan.highlighted ? 'ring-2 ring-white' : ''}`}>
              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <div className="text-4xl font-bold mb-6">
                {plan.price}
                {plan.interval && <span className="text-lg font-normal">/{plan.interval}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features?.map((feature: string, fIdx: number) => (
                  <li key={fIdx} className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> {feature}
                  </li>
                ))}
              </ul>
              <a href={plan.buttonLink || '#'} className="block w-full bg-white text-gray-900 px-6 py-3 rounded-lg text-center font-semibold hover:bg-gray-100 transition">
                {plan.buttonText || 'Jetzt starten'}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== CTA SECTION ====================
function CTASection({ content, styling, containerWidth }: any) {
  return (
    <section style={styling} className="py-20">
      <div className={`${containerWidth} px-4 text-center`}>
        {content.heading && <h2 className="text-4xl font-bold mb-4">{content.heading}</h2>}
        {content.text && <p className="text-xl mb-8 opacity-90">{content.text}</p>}
        {content.buttonText && (
          <a href={content.buttonLink || '#'} className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            {content.buttonText}
          </a>
        )}
      </div>
    </section>
  );
}

// ==================== CONTACT SECTION ====================
function ContactSection({ content, styling, containerWidth }: any) {
  return (
    <section style={styling} className="py-16">
      <div className={`${containerWidth} px-4`}>
        {content.heading && <h2 className="text-4xl font-bold text-center mb-12">{content.heading}</h2>}
        <div className="max-w-2xl mx-auto bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur-sm">
          <form className="space-y-4">
            <input type="text" placeholder="Name" className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm" />
            <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm" />
            <textarea placeholder="Nachricht" rows={5} className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm" />
            <button type="submit" className="w-full bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Nachricht senden
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ==================== FAQ SECTION ====================
function FAQSection({ content, styling, containerWidth }: any) {
  return (
    <section style={styling} className="py-16">
      <div className={`${containerWidth} px-4`}>
        {content.heading && <h2 className="text-4xl font-bold text-center mb-12">{content.heading}</h2>}
        <div className="max-w-3xl mx-auto space-y-4">
          {content.faqs?.map((faq: any, idx: number) => (
            <div key={idx} className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
              <p className="opacity-80">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== STATS SECTION ====================
function StatsSection({ content, styling, containerWidth }: any) {
  return (
    <section style={styling} className="py-16">
      <div className={`${containerWidth} px-4`}>
        {content.heading && <h2 className="text-4xl font-bold text-center mb-12">{content.heading}</h2>}
        <div className="grid md:grid-cols-4 gap-8">
          {content.stats?.map((stat: any, idx: number) => (
            <div key={idx} className="text-center">
              {stat.icon && <div className="text-4xl mb-2">{stat.icon}</div>}
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== VIDEO SECTION ====================
function VideoSection({ content, styling, containerWidth }: any) {
  return (
    <section style={styling} className="py-16">
      <div className={`${containerWidth} px-4`}>
        {content.heading && <h2 className="text-4xl font-bold text-center mb-12">{content.heading}</h2>}
        <div className="aspect-video max-w-4xl mx-auto">
          <video 
            src={content.videoUrl} 
            poster={content.videoPoster}
            controls 
            className="w-full h-full rounded-lg"
          />
        </div>
      </div>
    </section>
  );
}

// ==================== TEXT SECTION ====================
function TextSection({ content, styling, containerWidth }: any) {
  return (
    <section style={styling} className="py-16">
      <div className={`${containerWidth} px-4`}>
        {content.heading && <h2 className="text-4xl font-bold mb-8">{content.heading}</h2>}
        {content.text && <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.text }} />}
      </div>
    </section>
  );
}

// ==================== HTML SECTION ====================
function HTMLSection({ content, styling, containerWidth }: any) {
  return (
    <section style={styling} className="py-16">
      <div className={`${containerWidth} px-4`}>
        {content.html && <div dangerouslySetInnerHTML={{ __html: content.html }} />}
      </div>
    </section>
  );
}