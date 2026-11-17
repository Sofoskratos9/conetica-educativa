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
];

const ROLE_ROUTES: Record<string, string[]> = {
    student: ['/dashboard'],
    parent: ['/parent'],
    admin: ['/admin', '/dashboard', '/parent'],
};

function applySecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.mercadopago.com;"
    );
    return response;
}

function isPublicRoute(pathname: string): boolean {
    if (PUBLIC_EXACT_ROUTES.has(pathname)) return true;
    return PUBLIC_PREFIX_ROUTES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow static files and Next.js internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/images') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Allow public routes with security headers
    if (isPublicRoute(pathname)) {
        return applySecurityHeaders(NextResponse.next());
    }

    // Verify signed HMAC session cookie
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    const verifiedSession = await verifySessionToken(sessionCookie?.value);

    if (!verifiedSession) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        const redirectRes = NextResponse.redirect(loginUrl);
        if (sessionCookie) {
            redirectRes.cookies.delete(SESSION_COOKIE_NAME);
        }
        return applySecurityHeaders(redirectRes);
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
