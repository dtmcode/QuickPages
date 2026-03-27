'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Navigation, NavigationItem } from '@/types';

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
  const color = primaryColor || '#3b82f6';
  const initial = logoInitial || tenantName?.[0] || 'S';

  const topLevelItems = navigation?.items
    ? [...navigation.items]
        .filter((item) => !item.parentId)
        .sort((a, b) => a.order - b.order)
    : [];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
              style={{ backgroundColor: color }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={tenantName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {initial}
                </span>
              )}
            </div>
            <span className="text-lg font-bold text-gray-900">{tenantName}</span>
          </Link>

          {/* Desktop Navigation */}
          {topLevelItems.length > 0 && (
            <div className="hidden md:flex items-center space-x-1">
              {topLevelItems.map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
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

        {/* Mobile Menu */}
        {mobileOpen && topLevelItems.length > 0 && (
          <div className="md:hidden border-t border-gray-100 py-3">
            {topLevelItems.map((item) => (
              <MobileNavItem
                key={item.id}
                item={item}
                onClose={() => setMobileOpen(false)}
              />
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}

function NavItem({ item }: { item: NavigationItem }) {
  const href = getItemHref(item);
  return (
    <Link
      href={href}
      target={item.openInNewTab ? '_blank' : undefined}
      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
      className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      {item.label}
    </Link>
  );
}

function MobileNavItem({
  item,
  onClose,
}: {
  item: NavigationItem;
  onClose: () => void;
}) {
  const href = getItemHref(item);
  return (
    <Link
      href={href}
      target={item.openInNewTab ? '_blank' : undefined}
      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
      onClick={onClose}
      className="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-sm font-medium transition-colors rounded-lg"
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