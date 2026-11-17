import { NextResponse } from 'next/server';
import {
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
                demoMode: false,
            });
        } catch {
            return NextResponse.json(
                {
                    status: 'error',
                    database: 'postgres',
                    persistent: false,
                    demoMode: false,
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
    });
}
