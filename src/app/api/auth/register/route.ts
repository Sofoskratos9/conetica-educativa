import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { registerUserAccount } from '@/lib/auth-server';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/session';
import { checkRateLimit, getClientIp, sanitizeInput } from '@/lib/security/sanitization';

const RegisterSchema = z.object({
    name: z.string().min(2, 'Nombre requerido').max(120),
    email: z.string().email('Correo electrónico inválido').max(180),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128),
    role: z.enum(['student', 'parent']),
});

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        if (!checkRateLimit(`register:${ip}`, 10, 60_000)) {
            return NextResponse.json(
                { error: 'Demasiadas solicitudes. Por favor espera un minuto.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const parsed = RegisterSchema.parse(body);
        const safeName = sanitizeInput(parsed.name);

        const result = await registerUserAccount({
            email: parsed.email,
            password: parsed.password,
            name: safeName,
            role: parsed.role,
        });

        if (result.error || !result.user) {
            return NextResponse.json(
                { error: result.error || 'No se pudo crear la cuenta.' },
                { status: 409 }
            );
        }

        const token = await createSessionToken(result.user);
        const response = NextResponse.json({ user: result.user }, { status: 201 });

        response.cookies.set(SESSION_COOKIE_NAME, token, {
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
                { error: error.issues[0]?.message || 'Datos de registro inválidos' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Error interno al registrar usuario' },
            { status: 500 }
        );
    }
}
