import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyPasswordResetToken } from '@/lib/session';
import { updateUserPassword, validateStrongPassword } from '@/lib/auth-server';
import { checkRateLimit, getClientIp } from '@/lib/security/sanitization';

const ResetSchema = z.object({
    token: z.string().min(10).max(1024),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128),
});

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        if (!checkRateLimit(`reset-pwd:${ip}`, 10, 60_000)) {
            return NextResponse.json(
                { error: 'Demasiados intentos. Espera un minuto.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { token, password } = ResetSchema.parse(body);

        const passwordError = validateStrongPassword(password);
        if (passwordError) {
            return NextResponse.json({ error: passwordError }, { status: 400 });
        }

        const verified = await verifyPasswordResetToken(token);
        if (!verified) {
            return NextResponse.json(
                { error: 'El enlace de recuperación es inválido o ha expirado. Solicita uno nuevo.' },
                { status: 400 }
            );
        }

        const updated = await updateUserPassword(verified.email, password, verified.fp);
        if (!updated) {
            return NextResponse.json(
                { error: 'Este enlace ya fue utilizado o ha expirado. Solicita uno nuevo.' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0]?.message || 'Datos inválidos.' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'No se pudo restablecer la contraseña.' },
            { status: 500 }
        );
    }
}
