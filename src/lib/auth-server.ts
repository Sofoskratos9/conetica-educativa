import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { getSupabaseAdmin } from './supabase';
import { SessionUser, UserRole } from './session';
import {
    PRIMARY_ADMIN_EMAIL,
    ensurePostgresSchema,
    getDatabaseMode,
    getPgPool,
} from './db';

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

const globalForDemoUsers = globalThis as unknown as {
    __coneticaDemoUsers?: StoredDemoUser[];
    __coneticaAdminSeeded?: boolean;
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
                email: PRIMARY_ADMIN_EMAIL,
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

async function ensurePrimaryAdminProvisioned(): Promise<void> {
    if (globalForDemoUsers.__coneticaAdminSeeded) return;
    const mode = getDatabaseMode();
    if (mode === 'demo') {
        globalForDemoUsers.__coneticaAdminSeeded = true;
        return;
    }

    const adminInitialPassword = process.env.ADMIN_INITIAL_PASSWORD;

    if (mode === 'postgres') {
        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) return;

        const existing = await pool.query<{ id: string; role: string }>(
            'SELECT id, role FROM users WHERE email = $1 LIMIT 1',
            [PRIMARY_ADMIN_EMAIL]
        );

        if (existing.rows.length > 0) {
            if (existing.rows[0].role !== 'admin') {
                await pool.query(
                    'UPDATE users SET role = $1, is_premium = true WHERE id = $2',
                    ['admin', existing.rows[0].id]
                );
            }
        } else {
            // Only assign a usable password if ADMIN_INITIAL_PASSWORD is provided;
            // otherwise create with a locked random hash so owner resets via email/env safely.
            const passwordHash = adminInitialPassword
                ? hashPassword(adminInitialPassword)
                : hashPassword(randomBytes(32).toString('hex'));

            await pool.query(
                `INSERT INTO users (email, name, password_hash, role, is_premium)
                 VALUES ($1, $2, $3, 'admin', true)
                 ON CONFLICT (email) DO UPDATE SET role = 'admin', is_premium = true`,
                [PRIMARY_ADMIN_EMAIL, 'Miguel Neftalí López', passwordHash]
            );
        }

        globalForDemoUsers.__coneticaAdminSeeded = true;
        return;
    }

    if (mode === 'supabase') {
        const supabase = getSupabaseAdmin();
        const { data: existing } = await supabase
            .from('users')
            .select('id, role')
            .eq('email', PRIMARY_ADMIN_EMAIL)
            .maybeSingle();

        if (existing) {
            if (existing.role !== 'admin') {
                await supabase
                    .from('users')
                    .update({ role: 'admin', is_premium: true })
                    .eq('id', existing.id);
            }
        } else {
            const passwordHash = adminInitialPassword
                ? hashPassword(adminInitialPassword)
                : hashPassword(randomBytes(32).toString('hex'));

            await supabase.from('users').insert({
                email: PRIMARY_ADMIN_EMAIL,
                name: 'Miguel Neftalí López',
                password_hash: passwordHash,
                role: 'admin',
                is_premium: true,
            });
        }

        globalForDemoUsers.__coneticaAdminSeeded = true;
    }
}

export async function authenticateUser(email: string, password: string): Promise<SessionUser | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const mode = getDatabaseMode();

    await ensurePrimaryAdminProvisioned();

    if (mode === 'postgres') {
        const pool = getPgPool();
        if (!pool) return null;

        const res = await pool.query<{
            id: string;
            email: string;
            name: string;
            password_hash: string;
            role: UserRole;
            is_premium: boolean;
            student_id: string | null;
            created_at: Date;
        }>(
            `SELECT id, email, name, password_hash, role, is_premium, student_id, created_at
             FROM users WHERE email = $1 LIMIT 1`,
            [normalizedEmail]
        );

        const user = res.rows[0];
        if (!user || !verifyPassword(password, user.password_hash)) return null;

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.email === PRIMARY_ADMIN_EMAIL ? 'admin' : user.role,
            studentId: user.student_id || undefined,
            createdAt: new Date(user.created_at).toISOString(),
            isPremium: Boolean(user.is_premium),
        };
    }

    if (mode === 'supabase') {
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
            role: user.email === PRIMARY_ADMIN_EMAIL ? 'admin' : (user.role as UserRole),
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
    const mode = getDatabaseMode();

    await ensurePrimaryAdminProvisioned();

    if (mode === 'postgres') {
        const pool = getPgPool();
        if (!pool) return { error: 'Base de datos no disponible.' };

        const existing = await pool.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [
            normalizedEmail,
        ]);
        if (existing.rows.length > 0) {
            return { error: 'Ya existe una cuenta registrada con este correo.' };
        }

        const passwordHash = hashPassword(params.password);
        const res = await pool.query<{
            id: string;
            email: string;
            name: string;
            role: UserRole;
            is_premium: boolean;
            student_id: string | null;
            created_at: Date;
        }>(
            `INSERT INTO users (email, name, password_hash, role, is_premium)
             VALUES ($1, $2, $3, $4, false)
             RETURNING id, email, name, role, is_premium, student_id, created_at`,
            [normalizedEmail, params.name, passwordHash, params.role]
        );

        const created = res.rows[0];
        if (!created) return { error: 'No se pudo crear la cuenta.' };

        return {
            user: {
                id: created.id,
                email: created.email,
                name: created.name,
                role: created.role,
                studentId: created.student_id || undefined,
                createdAt: new Date(created.created_at).toISOString(),
                isPremium: Boolean(created.is_premium),
            },
        };
    }

    if (mode === 'supabase') {
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

export async function findUserByEmail(
    email: string
): Promise<{ id: string; email: string; name: string } | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const mode = getDatabaseMode();

    await ensurePrimaryAdminProvisioned();

    if (mode === 'postgres') {
        const pool = getPgPool();
        if (!pool) return null;
        const res = await pool.query<{ id: string; email: string; name: string }>(
            'SELECT id, email, name FROM users WHERE email = $1 LIMIT 1',
            [normalizedEmail]
        );
        return res.rows[0] || null;
    }

    if (mode === 'supabase') {
        const supabase = getSupabaseAdmin();
        const { data } = await supabase
            .from('users')
            .select('id, email, name')
            .eq('email', normalizedEmail)
            .maybeSingle();

        return data ? { id: data.id, email: data.email, name: data.name } : null;
    }

    const demoUser = getDemoUsersStore().find((u) => u.email === normalizedEmail);
    return demoUser ? { id: demoUser.id, email: demoUser.email, name: demoUser.name } : null;
}

export async function updateUserPassword(email: string, newPassword: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const newHash = hashPassword(newPassword);
    const mode = getDatabaseMode();

    await ensurePrimaryAdminProvisioned();

    if (mode === 'postgres') {
        const pool = getPgPool();
        if (!pool) return false;
        const res = await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2 RETURNING id',
            [newHash, normalizedEmail]
        );
        return res.rows.length > 0;
    }

    if (mode === 'supabase') {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('users')
            .update({ password_hash: newHash })
            .eq('email', normalizedEmail)
            .select('id')
            .maybeSingle();

        return !error && Boolean(data);
    }

    const demoUser = getDemoUsersStore().find((u) => u.email === normalizedEmail);
    if (!demoUser) return false;
    demoUser.passwordHash = newHash;
    return true;
}
