import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { checkRateLimit } from '@/lib/rate-limit';

const PROTECTED_PAGES = ['/dashboard', '/my-tasks', '/occurrences/new'];

function securityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(self), geolocation=(self)');
  return response;
}

function applyCors(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get('origin');
  const allowed = (process.env.ALLOWED_ORIGINS ?? process.env.NEXTAUTH_URL ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  if (origin && (allowed.length === 0 || allowed.includes(origin))) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    return applyCors(request, securityHeaders(new NextResponse(null, { status: 204 })));
  }

  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const { ok, retryAfter } = checkRateLimit(`api:${ip}`);

    if (!ok) {
      const response = NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter ?? 60) } }
      );
      return applyCors(request, securityHeaders(response));
    }
  }

  const isProtectedPage = PROTECTED_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  );

  if (isProtectedPage) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = securityHeaders(NextResponse.next());
  if (pathname.startsWith('/api/')) {
    return applyCors(request, response);
  }
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/my-tasks/:path*',
    '/occurrences/new',
    '/api/:path*',
  ],
};
