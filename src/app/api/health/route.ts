import { NextResponse } from 'next/server';
import {
    PRIMARY_ADMIN_EMAIL,
    ensurePostgresSchema,
    getDatabaseMode,
    getPgPool,
} from '@/lib/db';

export async function GET() {
    const mode = getDatabaseMode();

    if (mode === 'postgres') {
        try {
            await ensurePostgresSchema();
            const pool = getPgPool();
            await pool?.query('SELECT 1');
            return NextResponse.json({
                status: 'ok',
                database: 'postgres',
                persistent: true,
                adminEmail: PRIMARY_ADMIN_EMAIL,
            });
        } catch {
            return NextResponse.json(
                {
                    status: 'error',
                    database: 'postgres',
                    persistent: false,
                    error: 'Error conectando con PostgreSQL. Revisa DATABASE_URL.',
                },
                { status: 500 }
            );
        }
    }

    return NextResponse.json({
        status: 'ok',
        database: mode,
        persistent: mode === 'supabase',
        adminEmail: PRIMARY_ADMIN_EMAIL,
    });
}
