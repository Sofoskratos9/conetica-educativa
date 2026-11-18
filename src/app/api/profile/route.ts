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
} from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sanitizeInput } from '@/lib/security/sanitization';

const UpdateProfileSchema = z.object({
    name: z.string().trim().min(2).max(100),
});

export async function PATCH(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name } = UpdateProfileSchema.parse(body);
        const cleanName = sanitizeInput(name).slice(0, 100);
        const mode = getDatabaseMode();

        if (mode === 'postgres') {
            await ensurePostgresSchema();
            const pool = getPgPool();
            if (pool) {
                await pool.query(
                    'UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2',
                    [cleanName, session.user.id]
                );
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
        const response = NextResponse.json({ user: updatedUser });
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
