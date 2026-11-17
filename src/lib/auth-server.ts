import { createHash, scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
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

const LOCKED_PREFIX = 'locked:';
const BLOCKED_WEAK_PASSWORDS = new Set([
    'demo123',
    'demo1234',
    '123456',
    '12345678',
    '123456789',
    'password',
    'password1',
    'admin123',
    'qwerty123',
    'conetica123',
]);

export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const derived = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
    if (!storedHash || storedHash.startsWith(LOCKED_PREFIX) || !storedHash.includes(':')) {
        return false;
    }
    const [salt, keyHex] = storedHash.split(':');
    if (!salt || !keyHex) return false;
    const keyBuffer = Buffer.from(keyHex, 'hex');
    const derivedBuffer = scryptSync(password, salt, 64);
    if (keyBuffer.length !== derivedBuffer.length) return false;
    return timingSafeEqual(keyBuffer, derivedBuffer);
}

export function getPasswordFingerprint(storedHash: string): string {
    return createHash('sha256').update(storedHash).digest('hex').slice(0, 16);
}

export function validateStrongPassword(password: string): string | null {
    if (password.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (password.length > 128) {
        return 'La contraseña excede la longitud máxima permitida.';
    }
    if (BLOCKED_WEAK_PASSWORDS.has(password.toLowerCase())) {
        return 'Elige una contraseña más segura; esa contraseña común no está permitida.';
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        return 'La contraseña debe incluir al menos una letra y un número.';
    }
    return null;
}

function getConfiguredAdminInitialPassword(): string {
    const raw = process.env.ADMIN_INITIAL_PASSWORD?.trim() || '';
    if (!raw || raw.includes('REPLACE_WITH') || raw.length < 8) {
        return '';
    }
    return raw;
}

const globalForDemoUsers = globalThis as unknown as {
    __coneticaDemoUsers?: StoredDemoUser[];
    __coneticaAdminSeeded?: boolean;
};

function getDemoUsersStore(): StoredDemoUser[] {
    if (!globalForDemoUsers.__coneticaDemoUsers) {
        const nonAdminDemoHash = hashPassword('demo123');
        const adminPwd = getConfiguredAdminInitialPassword();
        const adminHash = adminPwd
            ? hashPassword(adminPwd)
            : `${LOCKED_PREFIX}${hashPassword(randomBytes(32).toString('hex'))}`;

        globalForDemoUsers.__coneticaDemoUsers = [
            {
                id: '00000000-0000-4000-8000-000000000001',
                email: 'estudiante@example.com',
                name: 'María González',
                role: 'student',
                createdAt: '2025-01-01T00:00:00.000Z',
                isPremium: false,
                passwordHash: nonAdminDemoHash,
            },
            {
                id: '00000000-0000-4000-8000-000000000002',
                email: 'padre@example.com',
                name: 'Carlos González',
                role: 'parent',
                studentId: '00000000-0000-4000-8000-000000000001',
                createdAt: '2025-01-01T00:00:00.000Z',
                isPremium: false,
                passwordHash: nonAdminDemoHash,
            },
            {
                id: '00000000-0000-4000-8000-000000000003',
                email: PRIMARY_ADMIN_EMAIL,
                name: 'Miguel Neftalí López',
                role: 'admin',
                createdAt: '2025-01-01T00:00:00.000Z',
                isPremium: true,
                passwordHash: adminHash,
            },
            {
                id: '00000000-0000-4000-8000-000000000004',
                email: 'premium@example.com',
                name: 'Ana Martínez',
                role: 'student',
                createdAt: '2025-01-01T00:00:00.000Z',
                isPremium: true,
                passwordHash: nonAdminDemoHash,
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

    const adminInitialPassword = getConfiguredAdminInitialPassword();

    if (mode === 'postgres') {
        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) return;

        const existing = await pool.query<{ id: string; role: string; password_hash: string }>(
            'SELECT id, role, password_hash FROM users WHERE email = $1 LIMIT 1',
            [PRIMARY_ADMIN_EMAIL]
        );

        if (existing.rows.length > 0) {
            const row = existing.rows[0];
            if (row.role !== 'admin') {
                await pool.query(
                    'UPDATE users SET role = $1, is_premium = true WHERE id = $2',
                    ['admin', row.id]
                );
            }
            if (row.password_hash.startsWith(LOCKED_PREFIX) && adminInitialPassword) {
                await pool.query(
                    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
                    [hashPassword(adminInitialPassword), row.id]
                );
            }
        } else {
            const passwordHash = adminInitialPassword
                ? hashPassword(adminInitialPassword)
                : `${LOCKED_PREFIX}${hashPassword(randomBytes(32).toString('hex'))}`;

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
            .select('id, role, password_hash')
            .eq('email', PRIMARY_ADMIN_EMAIL)
            .maybeSingle();

        if (existing) {
            if (existing.role !== 'admin') {
                await supabase
                    .from('users')
                    .update({ role: 'admin', is_premium: true })
                    .eq('id', existing.id);
            }
            if (
                typeof existing.password_hash === 'string' &&
                existing.password_hash.startsWith(LOCKED_PREFIX) &&
                adminInitialPassword
            ) {
                await supabase
                    .from('users')
                    .update({ password_hash: hashPassword(adminInitialPassword) })
                    .eq('id', existing.id);
            }
        } else {
            const passwordHash = adminInitialPassword
                ? hashPassword(adminInitialPassword)
                : `${LOCKED_PREFIX}${hashPassword(randomBytes(32).toString('hex'))}`;

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
    if (normalizedEmail === PRIMARY_ADMIN_EMAIL) {
        return { error: 'No es posible registrar este correo electrónico.' };
    }

    const passwordError = validateStrongPassword(params.password);
    if (passwordError) {
        return { error: passwordError };
    }

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
): Promise<{ id: string; email: string; name: string; passwordFingerprint: string } | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const mode = getDatabaseMode();

    await ensurePrimaryAdminProvisioned();

    if (mode === 'postgres') {
        const pool = getPgPool();
        if (!pool) return null;
        const res = await pool.query<{ id: string; email: string; name: string; password_hash: string }>(
            'SELECT id, email, name, password_hash FROM users WHERE email = $1 LIMIT 1',
            [normalizedEmail]
        );
        const row = res.rows[0];
        return row
            ? {
                  id: row.id,
                  email: row.email,
                  name: row.name,
                  passwordFingerprint: getPasswordFingerprint(row.password_hash),
              }
            : null;
    }

    if (mode === 'supabase') {
        const supabase = getSupabaseAdmin();
        const { data } = await supabase
            .from('users')
            .select('id, email, name, password_hash')
            .eq('email', normalizedEmail)
            .maybeSingle();

        return data
            ? {
                  id: data.id,
                  email: data.email,
                  name: data.name,
                  passwordFingerprint: getPasswordFingerprint(data.password_hash),
              }
            : null;
    }

    const demoUser = getDemoUsersStore().find((u) => u.email === normalizedEmail);
    return demoUser
        ? {
              id: demoUser.id,
              email: demoUser.email,
              name: demoUser.name,
              passwordFingerprint: getPasswordFingerprint(demoUser.passwordHash),
          }
        : null;
}

export async function updateUserPassword(
    email: string,
    newPassword: string,
    expectedFingerprint?: string
): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const newHash = hashPassword(newPassword);
    const mode = getDatabaseMode();

    await ensurePrimaryAdminProvisioned();

    if (expectedFingerprint) {
        const current = await findUserByEmail(normalizedEmail);
        if (!current || current.passwordFingerprint !== expectedFingerprint) {
            return false;
        }
    }

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

const failedLoginStore = new Map<string, { count: number; blockedUntil: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function isLoginBlocked(email: string, ip: string): boolean {
    const key = `${email.toLowerCase().trim()}:${ip}`;
    const entry = failedLoginStore.get(key);
    if (!entry) return false;
    if (Date.now() > entry.blockedUntil && entry.count >= MAX_FAILED_ATTEMPTS) {
        failedLoginStore.delete(key);
        return false;
    }
    return entry.count >= MAX_FAILED_ATTEMPTS && Date.now() <= entry.blockedUntil;
}

export function recordFailedLogin(email: string, ip: string): void {
    const key = `${email.toLowerCase().trim()}:${ip}`;
    const now = Date.now();
    const current = failedLoginStore.get(key);
    if (!current || now > current.blockedUntil) {
        failedLoginStore.set(key, { count: 1, blockedUntil: now + LOCKOUT_WINDOW_MS });
        return;
    }
    current.count += 1;
    current.blockedUntil = now + LOCKOUT_WINDOW_MS;
}

export function clearFailedLogins(email: string, ip: string): void {
    const key = `${email.toLowerCase().trim()}:${ip}`;
    failedLoginStore.delete(key);
}
