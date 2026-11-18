import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from './lib/session';

const PUBLIC_EXACT_ROUTES = new Set(['/']);

const PUBLIC_PREFIX_ROUTES = [
    '/auth',
    '/legal',
    '/blog',
    '/services',
    '/schools',
    '/pricing',
    '/checkout',
    '/api/auth',
    '/api/webhooks',
    '/api/checkout',
    '/api/schools',
    '/api/health',
];

const ROLE_ROUTES: Record<string, string[]> = {
    student: ['/dashboard'],
    parent: ['/parent'],
    admin: ['/admin', '/dashboard', '/parent'],
};

const BLOCKED_PROBE_PATTERNS = [
    '/.env',
    '/.git',
    '/wp-admin',
    '/wp-login.php',
    '/xmlrpc.php',
    '/phpmyadmin',
];

function applySecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    response.headers.set(
        'Strict-Transport-Security',
        'max-age=63072000; includeSubDomains; preload'
    );
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.mercadopago.com; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none';"
    );
    return response;
}

function isPublicRoute(pathname: string): boolean {
    if (PUBLIC_EXACT_ROUTES.has(pathname)) return true;
    return PUBLIC_PREFIX_ROUTES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
}

function isCrossSiteStateChange(request: NextRequest): boolean {
    const method = request.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
        return false;
    }
    const { pathname } = request.nextUrl;
    if (!pathname.startsWith('/api/') || pathname.startsWith('/api/webhooks/')) {
        return false;
    }
    const origin = request.headers.get('origin');
    if (!origin) {
        return false;
    }
    const expectedHost =
        request.headers.get('x-forwarded-host') ||
        request.headers.get('host') ||
        request.nextUrl.host;
    try {
        const originHost = new URL(origin).host;
        return Boolean(expectedHost) && originHost !== expectedHost;
    } catch {
        return true;
    }
}

const PROTECTED_PREFIXES = ['/dashboard', '/parent', '/admin'];

function isProtectedPath(pathname: string): boolean {
    if (pathname.startsWith('/api/') && !isPublicRoute(pathname)) {
        return true;
    }
    return PROTECTED_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const lowerPath = pathname.toLowerCase();

    // Block common vulnerability scanner / dotfile probes immediately
    if (BLOCKED_PROBE_PATTERNS.some((p) => lowerPath === p || lowerPath.startsWith(`${p}/`) || lowerPath.startsWith(`${p}.`))) {
        return applySecurityHeaders(new NextResponse('Not Found', { status: 404 }));
    }

    // Block cross-origin state-changing API requests (CSRF protection)
    if (isCrossSiteStateChange(request)) {
        return applySecurityHeaders(
            NextResponse.json({ error: 'Origen de solicitud no autorizado.' }, { status: 403 })
        );
    }

    // Allow static files and Next.js internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/images') ||
        pathname === '/robots.txt' ||
        pathname === '/sitemap.xml' ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Allow public routes and non-protected paths (unknown URLs hit branded 404) with security headers
    if (isPublicRoute(pathname) || !isProtectedPath(pathname)) {
        return applySecurityHeaders(NextResponse.next());
    }

    // Verify signed HMAC session cookie for protected dashboards, admin, and private APIs
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    const verifiedSession = await verifySessionToken(sessionCookie?.value);

    if (!verifiedSession) {
        if (pathname.startsWith('/api/')) {
            return applySecurityHeaders(
                NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
            );
        }
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        const redirectRes = NextResponse.redirect(loginUrl);
        if (sessionCookie) {
            redirectRes.cookies.delete(SESSION_COOKIE_NAME);
        }
        return applySecurityHeaders(redirectRes);
    }

    if (pathname.startsWith('/api/')) {
        return applySecurityHeaders(NextResponse.next());
    }

    const userRole = verifiedSession.user.role;
    const allowedPrefixes = ROLE_ROUTES[userRole] || [];
    const hasAccess = allowedPrefixes.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (!hasAccess) {
        const redirectPath =
            userRole === 'parent'
                ? '/parent/dashboard'
                : userRole === 'admin'
                    ? '/admin/analytics'
                    : '/dashboard';
        return applySecurityHeaders(NextResponse.redirect(new URL(redirectPath, request.url)));
    }

    return applySecurityHeaders(NextResponse.next());
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
