import { NextResponse } from 'next/server';
import {
    ensurePostgresSchema,
    getDatabaseMode,
    getPgPool,
} from '@/lib/db';

function hasStrongAdminPasswordEnv(): boolean {
    const pwd = process.env.ADMIN_INITIAL_PASSWORD?.trim() || '';
    return Boolean(pwd && !pwd.includes('REPLACE_WITH') && pwd.length >= 8);
}

function hasSessionSecretEnv(): boolean {
    const sec = (process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || '').trim();
    return Boolean(sec && !sec.includes('REPLACE_WITH') && sec.length >= 16);
}

export async function GET() {
    const mode = getDatabaseMode();
    const adminConfigured = hasStrongAdminPasswordEnv();
    const sessionSecretConfigured = hasSessionSecretEnv();

    if (mode === 'postgres') {
        try {
            await ensurePostgresSchema();
            const pool = getPgPool();
            await pool?.query('SELECT 1');
            return NextResponse.json({
                status: 'ok',
                database: 'postgres',
                persistent: true,
                demoMode: false,
                adminConfigured,
                sessionSecretConfigured,
            });
        } catch {
            return NextResponse.json(
                {
                    status: 'error',
                    database: 'postgres',
                    persistent: false,
                    demoMode: false,
                    adminConfigured,
                    sessionSecretConfigured,
                    error: 'Error conectando con la base de datos.',
                },
                { status: 500 }
            );
        }
    }

    return NextResponse.json({
        status: 'ok',
        database: mode,
        persistent: mode === 'supabase',
        demoMode: mode === 'demo',
        adminConfigured,
        sessionSecretConfigured,
    });
}
