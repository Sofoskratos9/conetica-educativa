export type UserRole = 'student' | 'parent' | 'admin';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    studentId?: string;
    createdAt: string;
    isPremium: boolean;
}

export interface AuthSession {
    user: User;
    expiresAt?: string;
}

export const ROLE_PERMISSIONS = {
    student: {
        canAccessDashboard: true,
        canAccessModules: true,
        canBookSessions: true,
        canViewProgress: true,
        canAccessBlog: true,
        canAccessAdmin: false,
        canViewParentPanel: false,
        canManageUsers: false
    },
    parent: {
        canAccessDashboard: false,
        canAccessModules: false,
        canBookSessions: false,
        canViewProgress: true,
        canAccessBlog: true,
        canAccessAdmin: false,
        canViewParentPanel: true,
        canManageUsers: false
    },
    admin: {
        canAccessDashboard: true,
        canAccessModules: true,
        canBookSessions: true,
        canViewProgress: true,
        canAccessBlog: true,
        canAccessAdmin: true,
        canViewParentPanel: true,
        canManageUsers: true
    }
};

export const PROTECTED_ROUTES: Record<string, UserRole[]> = {
    '/dashboard': ['student', 'admin'],
    '/dashboard/diagnostic': ['student', 'admin'],
    '/dashboard/study-plan': ['student', 'admin'],
    '/dashboard/exani': ['student', 'admin'],
    '/dashboard/vocational': ['student', 'admin'],
    '/dashboard/wellness': ['student', 'admin'],
    '/dashboard/booking': ['student', 'admin'],
    '/dashboard/progress': ['student', 'admin'],
    '/dashboard/notifications': ['student', 'admin'],
    '/dashboard/settings': ['student', 'admin'],
    '/parent/dashboard': ['parent', 'admin'],
    '/admin': ['admin'],
    '/admin/analytics': ['admin'],
    '/admin/appointments': ['admin'],
    '/admin/automations': ['admin'],
    '/admin/vocational': ['admin'],
    '/admin/blog': ['admin']
};

export async function login(
    email: string,
    password: string
): Promise<{ session?: AuthSession; error?: string }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            signal: controller.signal,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            if (res.status >= 500) {
                return {
                    error:
                        data.error ||
                        'Error interno del servidor. Intenta de nuevo en unos segundos.',
                };
            }
            return {
                error:
                    data.error ||
                    'Credenciales inválidas. Verifica tu correo y contraseña.',
            };
        }

        const session: AuthSession = { user: data.user };
        saveSession(session);
        return { session };
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            return {
                error: 'El servidor tardó demasiado en responder. Intenta de nuevo.',
            };
        }
        throw err;
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function register(params: {
    email: string;
    password: string;
    name: string;
    role: 'student' | 'parent';
}): Promise<{ session?: AuthSession; error?: string }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
            signal: controller.signal,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            return { error: data.error || 'No se pudo completar el registro.' };
        }

        const session: AuthSession = { user: data.user };
        saveSession(session);
        return { session };
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            return {
                error: 'El servidor tardó demasiado en responder. Intenta de nuevo.',
            };
        }
        throw err;
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function logout(): Promise<void> {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_session');
    }
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
        // Ignore network errors during logout cleanup
    }
}

export async function fetchServerSession(): Promise<User | null> {
    try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        if (data.user) {
            saveSession({ user: data.user });
            return data.user as User;
        }
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_session');
        }
        return null;
    } catch {
        return null;
    }
}

export function getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
        const sessionData = localStorage.getItem('auth_session');
        if (sessionData) {
            try {
                const session: AuthSession = JSON.parse(sessionData);
                return session.user || null;
            } catch {
                return null;
            }
        }
    }
    return null;
}

export function saveSession(session: AuthSession): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth_session', JSON.stringify(session));
    }
}

export function hasPermission(user: User | null, permission: keyof typeof ROLE_PERMISSIONS.student): boolean {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.[permission] || false;
}

export function canAccessRoute(user: User | null, route: string): boolean {
    if (!user) return false;
    const allowedRoles = PROTECTED_ROUTES[route];
    if (!allowedRoles) return true;
    return allowedRoles.includes(user.role);
}

export function getRedirectPath(role: UserRole): string {
    switch (role) {
        case 'parent':
            return '/parent/dashboard';
        case 'admin':
            return '/admin/analytics';
        case 'student':
        default:
            return '/dashboard';
    }
}
