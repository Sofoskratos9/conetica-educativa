import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';
import {
    createUserNotification,
    ensurePostgresSchema,
    getDatabaseMode,
    getPgPool,
    logActivityEvent,
} from '@/lib/db';
import { sanitizeInput } from '@/lib/security/sanitization';

const SendNotificationSchema = z.object({
    audience: z.enum(['user', 'students', 'parents', 'all']),
    userId: z.string().uuid().optional(),
    title: z.string().min(2).max(140),
    message: z.string().min(3).max(600),
    type: z.enum(['info', 'success', 'warning', 'premium']).optional(),
    actionLink: z.string().max(180).optional(),
});

export async function POST(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Acceso restringido a administradores.' }, { status: 403 });
    }

    if (getDatabaseMode() !== 'postgres') {
        return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });
    }

    try {
        const body = await request.json();
        const parsed = SendNotificationSchema.parse(body);

        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });

        const cleanTitle = sanitizeInput(parsed.title);
        const cleanMessage = sanitizeInput(parsed.message);
        const cleanLink = parsed.actionLink ? parsed.actionLink.trim() : undefined;
        const notifType = parsed.type || 'info';

        let recipientIds: string[] = [];

        if (parsed.audience === 'user') {
            if (!parsed.userId) {
                return NextResponse.json({ error: 'Selecciona un destinatario.' }, { status: 400 });
            }
            recipientIds = [parsed.userId];
        } else if (parsed.audience === 'students') {
            const res = await pool.query<{ id: string }>(`SELECT id FROM users WHERE role = 'student'`);
            recipientIds = res.rows.map((r) => r.id);
        } else if (parsed.audience === 'parents') {
            const res = await pool.query<{ id: string }>(`SELECT id FROM users WHERE role = 'parent'`);
            recipientIds = res.rows.map((r) => r.id);
        } else {
            const res = await pool.query<{ id: string }>(`SELECT id FROM users WHERE role != 'admin'`);
            recipientIds = res.rows.map((r) => r.id);
        }

        if (recipientIds.length === 0) {
            return NextResponse.json(
                { error: 'No hay usuarios registrados en esa audiencia todavía.' },
                { status: 404 }
            );
        }

        await Promise.all(
            recipientIds.map((uid) =>
                createUserNotification({
                    userId: uid,
                    title: cleanTitle,
                    message: cleanMessage,
                    type: notifType,
                    actionLink: cleanLink,
                })
            )
        );

        await logActivityEvent({
            userId: session.user.id,
            userName: session.user.name,
            eventType: 'admin_notification_sent',
            action: `Envió notificación "${cleanTitle}" a ${recipientIds.length} usuario(s) (${parsed.audience})`,
        });

        return NextResponse.json({ success: true, deliveredCount: recipientIds.length });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Revisa el título y mensaje de la notificación.' }, { status: 400 });
        }
        console.error('[Admin Notifications POST]', error);
        return NextResponse.json({ error: 'No se pudo enviar la notificación.' }, { status: 500 });
    }
}
