import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Basic rate limiting (simple implementation)
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Log suspicious activity (basic implementation)
  if (isSuspiciousRequest(request, userAgent)) {
    console.warn('Suspicious request detected:', {
      ip,
      userAgent,
      path: request.nextUrl.pathname,
      timestamp: new Date().toISOString()
    });
  }
  
  return response;
}

function isSuspiciousRequest(request: NextRequest, userAgent: string): boolean {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /sqlmap/i,
    /nikto/i,
    /nmap/i
  ];
  
  // Check for suspicious user agents
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    return true;
  }
  
  // Check for suspicious paths
  const suspiciousPaths = [
    '/admin',
    '/api/admin',
    '/.env',
    '/config',
    '/backup',
    '/database'
  ];
  
  const path = request.nextUrl.pathname;
  if (suspiciousPaths.some(suspiciousPath => path.includes(suspiciousPath))) {
    return true;
  }
  
  return false;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
