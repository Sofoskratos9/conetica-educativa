import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
    authenticateUser,
    clearFailedLogins,
    isLoginBlocked,
    recordFailedLogin,
} from '@/lib/auth-server';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/session';
import { checkRateLimit, getClientIp } from '@/lib/security/sanitization';

const LoginSchema = z.object({
    email: z.string().email('Correo electrónico inválido').max(180),
    password: z.string().min(4, 'Contraseña requerida').max(128),
});

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        if (!checkRateLimit(`login:${ip}`, 15, 60_000)) {
            return NextResponse.json(
                { error: 'Demasiados intentos desde tu red. Espera un minuto antes de reintentar.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { email, password } = LoginSchema.parse(body);

        if (isLoginBlocked(email, ip)) {
            return NextResponse.json(
                { error: 'Cuenta temporalmente bloqueada por demasiados intentos fallidos. Espera 15 minutos.' },
                { status: 429 }
            );
        }

        const user = await authenticateUser(email, password);
        if (!user) {
            recordFailedLogin(email, ip);
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        clearFailedLogins(email, ip);
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
        console.error('[Auth Login]', error);
        return NextResponse.json(
            { error: 'Error interno al iniciar sesión' },
            { status: 500 }
        );
    }
}
