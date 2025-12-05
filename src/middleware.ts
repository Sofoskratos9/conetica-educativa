import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
    '/',
    '/auth/login',
    '/auth/register',
    '/legal/privacy',
    '/legal/terms',
    '/legal/ethics',
    '/blog',
    '/services',
    '/schools',
    '/pricing',
    '/api/webhooks/stripe',
    '/api/webhooks/mercadopago'
];

// Route access control by role
const ROLE_ROUTES: Record<string, string[]> = {
    student: [
        '/dashboard',
        '/dashboard/vocational',
        '/dashboard/wellness',
        '/dashboard/booking',
        '/dashboard/progress',
        '/dashboard/notifications'
    ],
    parent: [
        '/parent/dashboard'
    ],
    admin: [
        '/admin',
        '/admin/analytics',
        '/admin/appointments',
        '/admin/automations',
        '/admin/vocational',
        '/admin/blog'
    ]
};

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Allow static files and Next.js internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Get session from cookie (in production, use proper session management)
    const sessionCookie = request.cookies.get('auth_session');

    if (!sessionCookie) {
        // Redirect to login if not authenticated
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        // Parse session (in production, verify JWT signature)
        const session = JSON.parse(sessionCookie.value);
        const userRole = session.user?.role;

        if (!userRole) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }

        // Check role-based access
        let hasAccess = false;

        // Check if route is allowed for user's role
        for (const [role, routes] of Object.entries(ROLE_ROUTES)) {
            if (userRole === role || userRole === 'admin') {
                if (routes.some(route => pathname.startsWith(route))) {
                    hasAccess = true;
                    break;
                }
            }
        }

        if (!hasAccess) {
            // Redirect to appropriate dashboard based on role
            const redirectPath = userRole === 'parent'
                ? '/parent/dashboard'
                : userRole === 'admin'
                    ? '/admin/analytics'
                    : '/dashboard';

            return NextResponse.redirect(new URL(redirectPath, request.url));
        }

        // Add security headers
        const response = NextResponse.next();

        // Security headers
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        response.headers.set(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.mercadopago.com;"
        );

        return response;

    } catch (error) {
        console.error('Middleware error:', error);
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
