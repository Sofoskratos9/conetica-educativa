import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyPasswordResetToken } from '@/lib/session';
import { updateUserPassword } from '@/lib/auth-server';

const ResetSchema = z.object({
    token: z.string().min(10),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password } = ResetSchema.parse(body);

        const email = await verifyPasswordResetToken(token);
        if (!email) {
            return NextResponse.json(
                { error: 'El enlace de recuperación es inválido o ha expirado. Solicita uno nuevo.' },
                { status: 400 }
            );
        }

        const updated = await updateUserPassword(email, password);
        if (!updated) {
            return NextResponse.json(
                { error: 'No se encontró la cuenta asociada a este enlace.' },
                { status: 404 }
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
