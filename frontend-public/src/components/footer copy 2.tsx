import Link from 'next/link';
import { Navigation, NavigationItem } from '@/types';

interface FooterProps {
  navigation: Navigation | null;
  tenantName: string;
  hidePoweredBy?: boolean | null;
}

export function Footer({ navigation, tenantName, hidePoweredBy }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerItems = navigation?.items
    ? [...navigation.items]
        .filter((item) => !item.parentId)
        .sort((a, b) => a.order - b.order)
    : [];

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{tenantName}</h3>
            {!hidePoweredBy && (
              <p className="text-gray-400 text-xs mt-4">
                Powered by{' '}
                <a
                  href="https://myquickpage.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  QuickPages
                </a>
              </p>
            )}
          </div>

          {/* Footer Navigation */}
          {footerItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Navigation
              </h3>
              <ul className="space-y-2">
                {footerItems.map((item) => (
                  <li key={item.id}>
                    <FooterNavItem item={item} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fallback Links wenn keine Footer-Nav */}
          {footerItems.length === 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Links
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Startseite
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-gray-400 hover:text-white transition-colors">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Kontakt
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Rechtliches
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/impressum" className="text-gray-400 hover:text-white transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-gray-400 hover:text-white transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/agb" className="text-gray-400 hover:text-white transition-colors">
                  AGB
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© {currentYear} {tenantName}. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterNavItem({ item }: { item: NavigationItem }) {
  const href = getItemHref(item);
  return (
    <Link
      href={href}
      target={item.openInNewTab ? '_blank' : undefined}
      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
      className="text-gray-400 hover:text-white text-sm transition-colors"
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