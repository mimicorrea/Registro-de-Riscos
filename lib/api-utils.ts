import { NextRequest, NextResponse } from 'next/server';
import type { ZodSchema } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(self), geolocation=(self)');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  return response;
}

export function applyCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
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

export function apiJson(
  request: NextRequest,
  data: unknown,
  status = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  applySecurityHeaders(response);
  return applyCorsHeaders(request, response);
}

export function apiError(
  request: NextRequest,
  message: string,
  status: number,
  extra?: Record<string, string>
): NextResponse {
  const response = NextResponse.json({ error: message }, { status, headers: extra });
  applySecurityHeaders(response);
  return applyCorsHeaders(request, response);
}

export function enforceRateLimit(request: NextRequest, scope: string): NextResponse | null {
  const ip = getClientIp(request);
  const { ok, retryAfter } = checkRateLimit(`${scope}:${ip}`);

  if (!ok) {
    return apiError(request, 'Muitas requisições. Tente novamente em instantes.', 429, {
      'Retry-After': String(retryAfter ?? 60),
    });
  }

  return null;
}

export async function parseBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { error: apiError(request, 'JSON inválido', 400) };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join('; ');
    return { error: apiError(request, message || 'Dados inválidos', 400) };
  }

  return { data: parsed.data };
}
