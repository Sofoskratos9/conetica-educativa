// Authentication and Authorization Service
// Mock implementation - In production, integrate with NextAuth.js or similar

export type UserRole = 'student' | 'parent' | 'admin';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    studentId?: string; // For parents, links to their child's account
    createdAt: string;
    isPremium: boolean;
}

export interface AuthSession {
    user: User;
    token: string;
    expiresAt: string;
}

// Mock users for development
const MOCK_USERS: User[] = [
    {
        id: '1',
        email: 'estudiante@example.com',
        name: 'María González',
        role: 'student',
        createdAt: '2025-01-01',
        isPremium: false
    },
    {
        id: '2',
        email: 'padre@example.com',
        name: 'Carlos González',
        role: 'parent',
        studentId: '1', // Linked to María
        createdAt: '2025-01-01',
        isPremium: false
    },
    {
        id: '3',
        email: 'admin@coneticaeducativa.com',
        name: 'Miguel Neftalí López',
        role: 'admin',
        createdAt: '2025-01-01',
        isPremium: true
    },
    {
        id: '4',
        email: 'premium@example.com',
        name: 'Ana Martínez',
        role: 'student',
        createdAt: '2025-01-01',
        isPremium: true
    }
];

// Role-based permissions
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
        canViewProgress: true, // Can view child's progress
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

// Route access control
export const PROTECTED_ROUTES = {
    '/dashboard': ['student', 'admin'],
    '/dashboard/vocational': ['student', 'admin'],
    '/dashboard/wellness': ['student', 'admin'],
    '/dashboard/booking': ['student', 'admin'],
    '/dashboard/progress': ['student', 'admin'],
    '/dashboard/notifications': ['student', 'admin'],
    '/parent/dashboard': ['parent', 'admin'],
    '/admin': ['admin'],
    '/admin/analytics': ['admin'],
    '/admin/appointments': ['admin'],
    '/admin/automations': ['admin'],
    '/admin/vocational': ['admin'],
    '/admin/blog': ['admin']
};

// Mock authentication functions
export async function login(email: string, password: string): Promise<AuthSession | null> {
    // In production: validate credentials against database
    const user = MOCK_USERS.find(u => u.email === email);

    if (!user) {
        return null;
    }

    // Mock password validation (in production: use bcrypt)
    if (password !== 'demo123') {
        return null;
    }

    return {
        user,
        token: `mock_token_${user.id}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
}

export async function register(
    email: string,
    password: string,
    name: string,
    role: UserRole
): Promise<AuthSession | null> {
    // In production: hash password, save to database
    const newUser: User = {
        id: `${MOCK_USERS.length + 1}`,
        email,
        name,
        role,
        createdAt: new Date().toISOString(),
        isPremium: false
    };

    MOCK_USERS.push(newUser);

    return {
        user: newUser,
        token: `mock_token_${newUser.id}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
}

export function logout(): void {
    // In production: invalidate token, clear session
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_session');
    }
}

export function getCurrentUser(): User | null {
    // In production: validate JWT token, fetch from session
    if (typeof window !== 'undefined') {
        const sessionData = localStorage.getItem('auth_session');
        if (sessionData) {
            try {
                const session: AuthSession = JSON.parse(sessionData);
                return session.user;
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
    return ROLE_PERMISSIONS[user.role][permission] || false;
}

export function canAccessRoute(user: User | null, route: string): boolean {
    if (!user) return false;

    // Check if route is protected
    const allowedRoles = PROTECTED_ROUTES[route as keyof typeof PROTECTED_ROUTES];
    if (!allowedRoles) return true; // Public route

    return allowedRoles.includes(user.role);
}

export function getRedirectPath(role: UserRole): string {
    switch (role) {
        case 'student':
            return '/dashboard';
        case 'parent':
            return '/parent/dashboard';
        case 'admin':
            return '/admin/analytics';
        default:
            return '/';
    }
}
