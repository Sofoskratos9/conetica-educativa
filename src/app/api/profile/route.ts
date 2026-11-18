import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
    SESSION_COOKIE_NAME,
    createSessionToken,
    verifySessionToken,
} from '@/lib/session';
import {
    ensurePostgresSchema,
    getDatabaseMode,
    getPgPool,
    logActivityEvent,
} from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sanitizeInput } from '@/lib/security/sanitization';

const UpdateProfileSchema = z.object({
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().max(25).optional(),
    weeklyReminders: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    try {
        let phone = '';
        let weeklyReminders = true;
        let name = session.user.name;

        if (getDatabaseMode() === 'postgres') {
            await ensurePostgresSchema();
            const pool = getPgPool();
            if (pool) {
                const res = await pool.query<{
                    name: string;
                    phone: string | null;
                    weekly_reminders: boolean | null;
                }>(
                    `SELECT name, phone, weekly_reminders FROM users WHERE id = $1 LIMIT 1`,
                    [session.user.id]
                );
                if (res.rows[0]) {
                    name = res.rows[0].name;
                    phone = res.rows[0].phone || '';
                    weeklyReminders = res.rows[0].weekly_reminders !== false;
                }
            }
        }

        return NextResponse.json({
            user: {
                ...session.user,
                name,
                phone,
                weeklyReminders,
            },
        });
    } catch (error) {
        console.error('[Profile GET]', error);
        return NextResponse.json({ error: 'Error al cargar perfil.' }, { status: 500 });
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
        const { name, phone, weeklyReminders } = UpdateProfileSchema.parse(body);
        const cleanName = sanitizeInput(name).slice(0, 100);
        const cleanPhone = phone !== undefined ? sanitizeInput(phone).slice(0, 25) : undefined;
        const mode = getDatabaseMode();

        if (mode === 'postgres') {
            await ensurePostgresSchema();
            const pool = getPgPool();
            if (pool) {
                await pool.query(
                    `UPDATE users
                     SET name = $1,
                         phone = COALESCE($2, phone),
                         weekly_reminders = COALESCE($3, weekly_reminders),
                         updated_at = NOW()
                     WHERE id = $4`,
                    [
                        cleanName,
                        cleanPhone !== undefined ? cleanPhone : null,
                        weeklyReminders !== undefined ? weeklyReminders : null,
                        session.user.id,
                    ]
                );

                await logActivityEvent({
                    userId: session.user.id,
                    userName: cleanName,
                    eventType: 'profile_updated',
                    action: 'Actualizó perfil y preferencias',
                });
            }
        } else if (mode === 'supabase') {
            const supabase = getSupabaseAdmin();
            await supabase
                .from('users')
                .update({ name: cleanName })
                .eq('id', session.user.id);
        }

        const updatedUser = { ...session.user, name: cleanName };
        const refreshedToken = await createSessionToken(updatedUser);
        const response = NextResponse.json({
            user: {
                ...updatedUser,
                phone: cleanPhone ?? '',
                weeklyReminders: weeklyReminders ?? true,
            },
        });
        response.cookies.set(SESSION_COOKIE_NAME, refreshedToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });
        return response;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Ingresa un nombre válido de al menos 2 caracteres.' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'No se pudo actualizar tu perfil.' },
            { status: 500 }
        );
    }
}
