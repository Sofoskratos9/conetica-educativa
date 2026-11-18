import { Pool } from 'pg';
import { isSupabaseConfigured } from './supabase';

export type DatabaseMode = 'postgres' | 'supabase' | 'demo';

export const PRIMARY_ADMIN_EMAIL = (
    process.env.ADMIN_EMAIL || 'miguel.neftali95@gmail.com'
).toLowerCase().trim();

function normalizePostgresUrl(val: string | undefined): string {
    if (!val) return '';
    let cleaned = val.trim();
    if (cleaned.startsWith('psql ')) {
        cleaned = cleaned.slice(5).trim();
    }
    if (
        (cleaned.startsWith("'") && cleaned.endsWith("'")) ||
        (cleaned.startsWith('"') && cleaned.endsWith('"'))
    ) {
        cleaned = cleaned.slice(1, -1).trim();
    }
    return cleaned;
}

function isValidPostgresUrl(val: string | undefined): val is string {
    const cleaned = normalizePostgresUrl(val);
    if (!cleaned || cleaned.includes('REPLACE_WITH') || cleaned.includes('dummy')) {
        return false;
    }
    return cleaned.startsWith('postgres://') || cleaned.startsWith('postgresql://');
}

export function getPostgresConnectionString(): string {
    const directCandidates = [
        process.env.DATABASE_URL,
        process.env.POSTGRES_URL,
        process.env.POSTGRES_PRISMA_URL,
        process.env.DATABASE_URL_UNPOOLED,
        process.env.POSTGRES_URL_NON_POOLING,
        process.env.NEON_DATABASE_URL,
    ];

    for (const candidate of directCandidates) {
        if (isValidPostgresUrl(candidate)) {
            return normalizePostgresUrl(candidate);
        }
    }

    // Fallback: detect prefixed Vercel Marketplace Storage env vars (e.g., STORAGE_DATABASE_URL, CONETICA_POSTGRES_URL)
    for (const [key, value] of Object.entries(process.env)) {
        if (
            (key.endsWith('_DATABASE_URL') ||
                key.endsWith('_POSTGRES_URL') ||
                key.endsWith('_DATABASE_URL_UNPOOLED') ||
                key.endsWith('_POSTGRES_URL_NON_POOLING')) &&
            isValidPostgresUrl(value)
        ) {
            return normalizePostgresUrl(value);
        }
    }

    return '';
}

export function getDatabaseMode(): DatabaseMode {
    if (getPostgresConnectionString()) return 'postgres';
    if (isSupabaseConfigured()) return 'supabase';
    return 'demo';
}

const globalForPg = globalThis as unknown as {
    __coneticaPgPool?: Pool;
    __coneticaPgSchemaReady?: Promise<void>;
};

export function getPgPool(): Pool | null {
    const connectionString = getPostgresConnectionString();
    if (!connectionString) return null;

    if (!globalForPg.__coneticaPgPool) {
        const isLocal =
            connectionString.includes('localhost') ||
            connectionString.includes('127.0.0.1');

        // Strip sslmode and channel_binding so pg@8.x does not override `ssl: { rejectUnauthorized: false }`
        let safeConnString = connectionString;
        try {
            const parsedUrl = new URL(connectionString);
            parsedUrl.searchParams.delete('sslmode');
            parsedUrl.searchParams.delete('channel_binding');
            safeConnString = parsedUrl.toString();
        } catch {
            // Keep original string if URL parsing fails
        }

        globalForPg.__coneticaPgPool = new Pool({
            connectionString: safeConnString,
            max: 5,
            connectionTimeoutMillis: 8000,
            ssl: isLocal ? false : { rejectUnauthorized: false },
        });
    }

    return globalForPg.__coneticaPgPool;
}

export async function ensurePostgresSchema(): Promise<void> {
    const pool = getPgPool();
    if (!pool) return;

    if (!globalForPg.__coneticaPgSchemaReady) {
        globalForPg.__coneticaPgSchemaReady = (async () => {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    email TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT NOT NULL CHECK (role IN ('student', 'parent', 'admin')),
                    is_premium BOOLEAN DEFAULT FALSE,
                    premium_expires_at TIMESTAMPTZ,
                    student_id UUID REFERENCES users(id),
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

                CREATE TABLE IF NOT EXISTS transactions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    product_id TEXT NOT NULL,
                    product_name TEXT NOT NULL,
                    amount DECIMAL(10, 2) NOT NULL,
                    currency TEXT NOT NULL DEFAULT 'MXN',
                    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
                    payment_provider TEXT NOT NULL CHECK (payment_provider IN ('stripe', 'mercadopago')),
                    provider_payment_id TEXT UNIQUE,
                    provider_customer_id TEXT,
                    metadata JSONB,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS subscriptions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    product_id TEXT NOT NULL,
                    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
                    payment_provider TEXT NOT NULL CHECK (payment_provider IN ('stripe', 'mercadopago')),
                    provider_subscription_id TEXT UNIQUE NOT NULL,
                    current_period_start TIMESTAMPTZ NOT NULL,
                    current_period_end TIMESTAMPTZ NOT NULL,
                    cancel_at_period_end BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS module_access (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    module_id TEXT NOT NULL,
                    access_type TEXT NOT NULL CHECK (access_type IN ('free', 'premium', 'purchased')),
                    granted_by_transaction_id UUID REFERENCES transactions(id),
                    expires_at TIMESTAMPTZ,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    UNIQUE(user_id, module_id)
                );

                CREATE TABLE IF NOT EXISTS user_progress (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    module_id TEXT NOT NULL,
                    lesson_id TEXT NOT NULL,
                    completed BOOLEAN DEFAULT FALSE,
                    score DECIMAL(5, 2),
                    time_spent_minutes INTEGER DEFAULT 0,
                    payload JSONB,
                    completed_at TIMESTAMPTZ,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    UNIQUE(user_id, module_id, lesson_id)
                );

                CREATE TABLE IF NOT EXISTS appointments (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    student_name TEXT,
                    service_id TEXT NOT NULL,
                    service_name TEXT NOT NULL,
                    scheduled_date TEXT NOT NULL,
                    scheduled_time TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'pending',
                    notes TEXT,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS schools_inquiries (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    reference_id TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    school TEXT NOT NULL,
                    position TEXT NOT NULL,
                    email TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    interest TEXT NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS webhook_events (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    provider TEXT NOT NULL CHECK (provider IN ('stripe', 'mercadopago')),
                    event_type TEXT NOT NULL,
                    event_id TEXT UNIQUE NOT NULL,
                    payload JSONB NOT NULL,
                    processed BOOLEAN DEFAULT FALSE,
                    error TEXT,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS study_tasks (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    title TEXT NOT NULL,
                    area TEXT NOT NULL,
                    duration_min INTEGER NOT NULL DEFAULT 25,
                    day TEXT NOT NULL DEFAULT 'Hoy',
                    completed BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_study_tasks_user ON study_tasks(user_id);

                CREATE TABLE IF NOT EXISTS study_sessions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    module_id TEXT NOT NULL,
                    duration_minutes INTEGER NOT NULL DEFAULT 0,
                    session_type TEXT NOT NULL DEFAULT 'practice',
                    score DECIMAL(5, 2),
                    meta JSONB,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_study_sessions_user_created ON study_sessions(user_id, created_at DESC);

                CREATE TABLE IF NOT EXISTS notifications (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    type TEXT NOT NULL DEFAULT 'info',
                    action_link TEXT,
                    read BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

                CREATE TABLE IF NOT EXISTS activity_logs (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                    user_name TEXT,
                    event_type TEXT NOT NULL,
                    action TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'success',
                    metadata JSONB,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

                CREATE TABLE IF NOT EXISTS blog_posts (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    slug TEXT UNIQUE NOT NULL,
                    title TEXT NOT NULL,
                    excerpt TEXT NOT NULL,
                    content TEXT NOT NULL,
                    category TEXT NOT NULL,
                    author TEXT NOT NULL DEFAULT 'Equipo Conética',
                    read_time TEXT NOT NULL DEFAULT '5 min',
                    tags TEXT[] NOT NULL DEFAULT '{}',
                    featured BOOLEAN NOT NULL DEFAULT FALSE,
                    published_at TIMESTAMPTZ DEFAULT NOW(),
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );

                ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS weekly_reminders BOOLEAN DEFAULT TRUE;
                ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS payload JSONB;
            `);
        })().catch((err) => {
            globalForPg.__coneticaPgSchemaReady = undefined;
            throw err;
        });
    }

    await globalForPg.__coneticaPgSchemaReady;
}

export async function logActivityEvent(params: {
    userId?: string | null;
    userName?: string | null;
    eventType: string;
    action: string;
    status?: 'success' | 'failed';
    metadata?: Record<string, unknown>;
}): Promise<void> {
    if (getDatabaseMode() !== 'postgres') return;
    try {
        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) return;
        await pool.query(
            `INSERT INTO activity_logs (user_id, user_name, event_type, action, status, metadata)
             VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
            [
                params.userId || null,
                params.userName || null,
                params.eventType,
                params.action,
                params.status || 'success',
                params.metadata ? JSON.stringify(params.metadata) : null,
            ]
        );
    } catch {
        // Non-fatal logging failure
    }
}

export async function createUserNotification(params: {
    userId: string;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'premium';
    actionLink?: string;
}): Promise<void> {
    if (getDatabaseMode() !== 'postgres') return;
    try {
        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) return;
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, action_link)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                params.userId,
                params.title,
                params.message,
                params.type || 'info',
                params.actionLink || null,
            ]
        );
    } catch {
        // Non-fatal notification failure
    }
}

