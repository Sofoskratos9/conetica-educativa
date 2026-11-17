import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';
import { SessionUser, UserRole } from './session';

interface StoredDemoUser extends SessionUser {
    passwordHash: string;
}

export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const derived = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
    if (!storedHash.includes(':')) return false;
    const [salt, keyHex] = storedHash.split(':');
    const keyBuffer = Buffer.from(keyHex, 'hex');
    const derivedBuffer = scryptSync(password, salt, 64);
    if (keyBuffer.length !== derivedBuffer.length) return false;
    return timingSafeEqual(keyBuffer, derivedBuffer);
}

// In-memory demo store used ONLY when Supabase env vars are placeholders/unconfigured
const globalForDemoUsers = globalThis as unknown as {
    __coneticaDemoUsers?: StoredDemoUser[];
};

function getDemoUsersStore(): StoredDemoUser[] {
    if (!globalForDemoUsers.__coneticaDemoUsers) {
        const defaultHash = hashPassword('demo123');
        globalForDemoUsers.__coneticaDemoUsers = [
            {
                id: '00000000-0000-4000-8000-000000000001',
                email: 'estudiante@example.com',
                name: 'María González',
                role: 'student',
                createdAt: '2025-01-01T00:00:00.000Z',
                isPremium: false,
                passwordHash: defaultHash,
            },
            {
                id: '00000000-0000-4000-8000-000000000002',
                email: 'padre@example.com',
                name: 'Carlos González',
                role: 'parent',
                studentId: '00000000-0000-4000-8000-000000000001',
                createdAt: '2025-01-01T00:00:00.000Z',
                isPremium: false,
                passwordHash: defaultHash,
            },
            {
                id: '00000000-0000-4000-8000-000000000003',
                email: 'admin@coneticaeducativa.com',
                name: 'Miguel Neftalí López',
                role: 'admin',
                createdAt: '2025-01-01T00:00:00.000Z',
                isPremium: true,
                passwordHash: defaultHash,
            },
            {
                id: '00000000-0000-4000-8000-000000000004',
                email: 'premium@example.com',
                name: 'Ana Martínez',
                role: 'student',
                createdAt: '2025-01-01T00:00:00.000Z',
                isPremium: true,
                passwordHash: defaultHash,
            },
        ];
    }
    return globalForDemoUsers.__coneticaDemoUsers;
}

export async function authenticateUser(email: string, password: string): Promise<SessionUser | null> {
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
        const supabase = getSupabaseAdmin();
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, name, password_hash, role, is_premium, student_id, created_at')
            .eq('email', normalizedEmail)
            .single();

        if (error || !user) return null;
        if (!verifyPassword(password, user.password_hash)) return null;

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
            studentId: user.student_id || undefined,
            createdAt: user.created_at,
            isPremium: Boolean(user.is_premium),
        };
    }

    const demoUser = getDemoUsersStore().find((u) => u.email === normalizedEmail);
    if (!demoUser) return null;
    if (!verifyPassword(password, demoUser.passwordHash)) return null;

    return {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
        studentId: demoUser.studentId,
        createdAt: demoUser.createdAt,
        isPremium: demoUser.isPremium,
    };
}

export async function registerUserAccount(params: {
    email: string;
    password: string;
    name: string;
    role: 'student' | 'parent';
}): Promise<{ user?: SessionUser; error?: string }> {
    const normalizedEmail = params.email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
        const supabase = getSupabaseAdmin();
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (existing) {
            return { error: 'Ya existe una cuenta registrada con este correo.' };
        }

        const passwordHash = hashPassword(params.password);
        const { data: created, error } = await supabase
            .from('users')
            .insert({
                email: normalizedEmail,
                name: params.name,
                password_hash: passwordHash,
                role: params.role,
                is_premium: false,
            })
            .select('id, email, name, role, is_premium, student_id, created_at')
            .single();

        if (error || !created) {
            return { error: 'No se pudo crear la cuenta en la base de datos.' };
        }

        return {
            user: {
                id: created.id,
                email: created.email,
                name: created.name,
                role: created.role as UserRole,
                studentId: created.student_id || undefined,
                createdAt: created.created_at,
                isPremium: Boolean(created.is_premium),
            },
        };
    }

    const store = getDemoUsersStore();
    if (store.some((u) => u.email === normalizedEmail)) {
        return { error: 'Ya existe una cuenta registrada con este correo.' };
    }

    const newUser: StoredDemoUser = {
        id: globalThis.crypto.randomUUID(),
        email: normalizedEmail,
        name: params.name,
        role: params.role,
        createdAt: new Date().toISOString(),
        isPremium: false,
        passwordHash: hashPassword(params.password),
    };

    store.push(newUser);
    return {
        user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            studentId: newUser.studentId,
            createdAt: newUser.createdAt,
            isPremium: newUser.isPremium,
        },
    };
}
