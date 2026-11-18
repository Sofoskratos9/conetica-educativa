import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';
import { ensurePostgresSchema, getDatabaseMode, getPgPool } from '@/lib/db';

const PatchSchema = z.object({
    id: z.string().min(1).optional(),
    markAllRead: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    try {
        if (getDatabaseMode() !== 'postgres') {
            return NextResponse.json({ notifications: [], unreadCount: 0 });
        }

        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) {
            return NextResponse.json({ notifications: [], unreadCount: 0 });
        }

        const res = await pool.query<{
            id: string;
            title: string;
            message: string;
            type: string;
            action_link: string | null;
            read: boolean;
            created_at: Date | string;
        }>(
            `SELECT id, title, message, type, action_link, read, created_at
             FROM notifications
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 50`,
            [session.user.id]
        );

        const notifications = res.rows.map((r) => ({
            id: r.id,
            title: r.title,
            message: r.message,
            type: r.type as 'info' | 'success' | 'warning' | 'premium',
            actionLink: r.action_link || undefined,
            read: Boolean(r.read),
            createdAt: new Date(r.created_at).toISOString(),
        }));

        const unreadCount = notifications.filter((n) => !n.read).length;
        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('[Notifications GET]', error);
        return NextResponse.json(
            { error: 'Error al obtener notificaciones.' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const parsed = PatchSchema.parse(body);

        if (getDatabaseMode() === 'postgres') {
            await ensurePostgresSchema();
            const pool = getPgPool();
            if (pool) {
                if (parsed.markAllRead) {
                    await pool.query(
                        `UPDATE notifications SET read = true WHERE user_id = $1`,
                        [session.user.id]
                    );
                } else if (parsed.id) {
                    await pool.query(
                        `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`,
                        [parsed.id, session.user.id]
                    );
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
        }
        console.error('[Notifications PATCH]', error);
        return NextResponse.json(
            { error: 'No se pudo actualizar la notificación.' },
            { status: 500 }
        );
    }
}
