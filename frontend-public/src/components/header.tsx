'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Navigation, NavigationItem } from '@/types';
import { LanguageSwitcher } from '@/components/I18nProvider';
import Image from 'next/image';

interface HeaderProps {
  navigation: Navigation | null;
  tenantName: string;
  logoUrl?: string | null;
  logoInitial?: string | null;
  primaryColor?: string | null;
}

export function Header({
  navigation,
  tenantName,
  logoUrl,
  logoInitial,
  primaryColor,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Navigation Settings auslesen
  const s = (navigation as Navigation & { settings?: { backgroundColor?: string; textColor?: string; fontFamily?: string; itemsAlign?: string; logoText?: string } })?.settings || {};
  const navBg = s.backgroundColor || '#ffffff';
  const navColor = s.textColor || '#111827';
  const navAlign = s.itemsAlign || 'right';
  const navLogoText = s.logoText || tenantName;
  const navFont = s.fontFamily || 'inherit';
  const isGradient = navBg.startsWith('linear') || navBg.startsWith('radial');

  const logoColor = primaryColor || '#3b82f6';
  const initial = logoInitial || tenantName?.[0] || 'S';

  const topLevelItems = navigation?.items
    ? [...navigation.items]
        .filter((item) => !item.parentId)
        .sort((a, b) => a.order - b.order)
    : [];

  const headerStyle: React.CSSProperties = {
    backgroundColor: isGradient ? undefined : navBg,
    backgroundImage: isGradient ? navBg : undefined,
    color: navColor,
    fontFamily: navFont,
  };

  const justifyClass =
    navAlign === 'center' ? 'justify-center' :
    navAlign === 'left' ? 'justify-start' :
    'justify-end';

  return (
    <header className="shadow-sm sticky top-0 z-50" style={headerStyle}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 transition-transform duration-200 group-hover:scale-105 relative"
              style={{ backgroundColor: logoColor }}
            >
              {logoUrl ? (
                <Image src={logoUrl} alt={navLogoText} fill className="object-contain" />
              ) : (
                <span className="text-white font-bold text-sm">
                  {(navLogoText[0] || initial).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-lg font-bold" style={{ color: navColor }}>{navLogoText}</span>
          </Link>

          {/* Desktop Navigation */}
          {topLevelItems.length > 0 && (
            <div className={`hidden md:flex flex-1 items-center gap-1 mx-6 ${justifyClass}`}>
              {topLevelItems.map((item) => (
                <NavItem key={item.id} item={item} color={navColor} />
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: navColor }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menü öffnen"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && topLevelItems.length > 0 && (
          <div className="md:hidden border-t py-3" style={{ borderColor: `${navColor}22` }}>
            {topLevelItems.map((item) => (
              <MobileNavItem
                key={item.id}
                item={item}
                color={navColor}
                onClose={() => setMobileOpen(false)}
              />
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}

function NavItem({ item, color }: { item: NavigationItem; color: string }) {
  const href = getItemHref(item);
  return (
    <Link
      href={href}
      target={item.openInNewTab ? '_blank' : undefined}
      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
      className="px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-70"
      style={{ color }}
    >
      {item.label}
    </Link>
  );
}

function MobileNavItem({ item, color, onClose }: { item: NavigationItem; color: string; onClose: () => void }) {
  const href = getItemHref(item);
  return (
    <Link
      href={href}
      target={item.openInNewTab ? '_blank' : undefined}
      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
      onClick={onClose}
      className="block px-4 py-3 text-sm font-medium transition-opacity hover:opacity-70 rounded-lg"
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