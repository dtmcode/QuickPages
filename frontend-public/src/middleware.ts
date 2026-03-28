import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || '';
const BACKEND_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace('/graphql', '') || 'http://localhost:3000';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const host = hostname.split(':')[0];

  // Localhost Dev
  if (host === 'localhost' || host === '127.0.0.1') {
    const response = NextResponse.next();
    response.headers.set('x-tenant', 'demo');
    return response;
  }

  // Subdomain der Platform? (z.B. shop.quickpages.de)
  if (PLATFORM_DOMAIN && host.endsWith(`.${PLATFORM_DOMAIN}`)) {
    const subdomain = host.replace(`.${PLATFORM_DOMAIN}`, '');
    if (subdomain && subdomain !== 'www') {
      const response = NextResponse.next();
      response.headers.set('x-tenant', subdomain);
      return response;
    }
    return NextResponse.next();
  }

  // Custom Domain → Backend fragen
  try {
    const res = await fetch(`${BACKEND_URL}/api/domains/lookup?domain=${host}`, {
      next: { revalidate: 300 }, // 5 min Cache
    });
    if (res.ok) {
      const data = await res.json();
      const response = NextResponse.next();
      response.headers.set('x-tenant', data.slug);
      return response;
    }
  } catch {
    // Backend nicht erreichbar, ignore
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};