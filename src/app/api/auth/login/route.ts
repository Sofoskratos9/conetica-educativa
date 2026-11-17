import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateUser } from '@/lib/auth-server';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/session';
import { checkRateLimit } from '@/lib/security/sanitization';

const LoginSchema = z.object({
    email: z.string().email('Correo electrónico inválido'),
    password: z.string().min(4, 'Contraseña requerida'),
});

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'local';
        if (!checkRateLimit(`login:${ip}`, 20, 60_000)) {
            return NextResponse.json(
                { error: 'Demasiados intentos. Por favor espera un minuto.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { email, password } = LoginSchema.parse(body);

        const user = await authenticateUser(email, password);
        if (!user) {
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        const token = await createSessionToken(user);
        const response = NextResponse.json({ user });

        response.cookies.set(SESSION_COOKIE_NAME, token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos de inicio de sesión inválidos', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Error interno al iniciar sesión' },
            { status: 500 }
        );
    }
}
