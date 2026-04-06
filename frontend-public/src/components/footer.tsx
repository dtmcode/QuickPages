import Link from 'next/link';
import { Navigation, NavigationItem } from '@/types';

interface FooterProps {
  navigation: Navigation | null;
  tenantName: string;
  hidePoweredBy?: boolean | null;
}

export function Footer({ navigation, tenantName, hidePoweredBy }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Navigation Settings auslesen
 const s = (navigation as Navigation & { settings?: { backgroundColor?: string; textColor?: string; fontFamily?: string; itemsAlign?: string; logoText?: string } })?.settings || {};
  const navBg = s.backgroundColor || '#111827';
  const navColor = s.textColor || '#ffffff';
  const navFont = s.fontFamily || 'inherit';
  const isGradient = navBg.startsWith('linear') || navBg.startsWith('radial');

  const footerStyle: React.CSSProperties = {
    backgroundColor: isGradient ? undefined : navBg,
    backgroundImage: isGradient ? navBg : undefined,
    color: navColor,
    fontFamily: navFont,
  };

  // Muted color — etwas transparenter als navColor
  const mutedColor = `${navColor}99`;

  const footerItems = navigation?.items
    ? [...navigation.items]
        .filter((item) => !item.parentId)
        .sort((a, b) => a.order - b.order)
    : [];

  return (
    <footer className="mt-auto" style={footerStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: navColor }}>{tenantName}</h3>
            {!hidePoweredBy && (
              <p className="text-xs mt-4" style={{ color: mutedColor }}>
                Powered by{' '}
                <a
                  href="https://myquickpage.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-100 transition-opacity"
                  style={{ color: mutedColor }}
                >
                  QuickPages
                </a>
              </p>
            )}
          </div>

          {/* Footer Navigation */}
          {footerItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: mutedColor }}>
                Navigation
              </h3>
              <ul className="space-y-2">
                {footerItems.map((item) => (
                  <li key={item.id}>
                    <FooterNavItem item={item} color={mutedColor} hoverColor={navColor} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fallback Links wenn keine Footer-Nav */}
          {footerItems.length === 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: mutedColor }}>
                Links
              </h3>
              <ul className="space-y-2 text-sm">
                {[
                  { href: '/', label: 'Startseite' },
                  { href: '/blog', label: 'Blog' },
                  { href: '/shop', label: 'Shop' },
                  { href: '/contact', label: 'Kontakt' },
                ].map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-opacity hover:opacity-100" style={{ color: mutedColor }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: mutedColor }}>
              Rechtliches
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/impressum', label: 'Impressum' },
                { href: '/datenschutz', label: 'Datenschutz' },
                { href: '/agb', label: 'AGB' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-opacity hover:opacity-100" style={{ color: mutedColor }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm" style={{ borderColor: `${navColor}22`, color: mutedColor }}>
          <p>© {currentYear} {tenantName}. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterNavItem({ item, color, hoverColor }: { item: NavigationItem; color: string; hoverColor: string }) {
  const href = getItemHref(item);
  return (
    <Link
      href={href}
      target={item.openInNewTab ? '_blank' : undefined}
      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
      className="text-sm transition-opacity hover:opacity-100"
      style={{ color }}
    >
      {item.label}
    </Link>
  );
}

function getItemHref(item: NavigationItem): string {
  if (item.url) return item.url;
  if (item.pageId) return `/${item.pageId}`;
  if (item.postId) return `/blog/${item.postId}`;
  if (item.categoryId) return `/shop/category/${item.categoryId}`;
  return '#';
}