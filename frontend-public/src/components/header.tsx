import Link from 'next/link';
import { Navigation, NavigationItem } from '@/types';

interface HeaderProps {
  navigation: Navigation | null;
  tenantName: string;
}

export function Header({ navigation, tenantName }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Name */}
          <Link href="/" className="text-xl font-bold text-gray-900">
            {tenantName}
          </Link>

          {/* Navigation Items */}
          {navigation && (
            <div className="hidden md:flex space-x-8">
              {navigation.items
                .filter((item) => !item.parentId)
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <NavItem key={item.id} item={item} />
                ))}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button className="md:hidden">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
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
      className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition"
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