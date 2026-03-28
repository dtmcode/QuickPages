import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost') {
      const subdomain = parts[0];
      const response = NextResponse.next();
      response.headers.set('x-tenant', subdomain);
      return response;
    }

    const response = NextResponse.next();
    response.headers.set('x-tenant', 'demo');
    return response;
  }

  const subdomain = hostname.split('.')[0];

  if (subdomain === 'www' || subdomain === process.env.NEXT_PUBLIC_PLATFORM_DOMAIN) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set('x-tenant', subdomain);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};