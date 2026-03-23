'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { navigationApi } from '@/lib/api/navigation';

export function SiteNavigation({ slug }: { slug: string }) {
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigationApi.getMenu(slug)
      .then(setMenu)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (!menu) return null;

  return (
    <nav className="flex space-x-6">
      {menu.items?.map((item: any) => (
        <NavItem key={item.id} item={item} />
      ))}
    </nav>
  );
}

function NavItem({ item }: { item: any }) {
  const href = item.url || (item.pageId ? `/pages/${item.pageId}` : '#');
  
  if (!item.isActive) return null;

  return (
    <div className="relative group">
      <Link 
        href={href}
        target={item.target}
        className="flex items-center space-x-1 hover:text-blue-600"
      >
        {item.icon && <span>{item.icon}</span>}
        <span>{item.title}</span>
      </Link>
      
      {item.children && item.children.length > 0 && (
        <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md mt-2">
          {item.children.map((child: any) => (
            <Link
              key={child.id}
              href={child.url || '#'}
              target={child.target}
              className="block px-4 py-2 hover:bg-gray-100"
            >
              {child.icon && <span className="mr-2">{child.icon}</span>}
              {child.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}