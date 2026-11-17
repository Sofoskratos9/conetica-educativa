import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findUserByEmail } from '@/lib/auth-server';
import { createPasswordResetToken } from '@/lib/session';
import { getDatabaseMode } from '@/lib/db';
import { checkRateLimit } from '@/lib/security/sanitization';

const ForgotSchema = z.object({
    email: z.string().email(),
});

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'local';
        if (!checkRateLimit(`forgot-pwd:${ip}`, 5, 60_000)) {
            return NextResponse.json(
                { error: 'Demasiados intentos. Espera un minuto antes de volver a intentar.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { email } = ForgotSchema.parse(body);
        const user = await findUserByEmail(email);

        let demoResetUrl: string | undefined;

        if (user) {
            const token = await createPasswordResetToken(user.email);
            const appUrl =
                process.env.NEXT_PUBLIC_APP_URL &&
                !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
                    ? process.env.NEXT_PUBLIC_APP_URL
                    : request.nextUrl.origin ||
                      process.env.NEXT_PUBLIC_APP_URL ||
                      'http://localhost:3000';
            const resetUrl = `${appUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

            const resendApiKey = process.env.RESEND_API_KEY;
            if (resendApiKey) {
                await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: process.env.EMAIL_FROM || 'Conética Educativa <no-reply@coneticaeducativa.com>',
                        to: [user.email],
                        subject: 'Recupera tu contraseña en Conética Educativa™',
                        html: `<p>Hola ${user.name},</p><p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace (válido por 30 minutos):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>`,
                    }),
                });
            } else if (getDatabaseMode() === 'demo') {
                // Only expose preview link in non-DB demo mode so flows remain testable without leaking production accounts
                demoResetUrl = resetUrl;
            }
        }

        return NextResponse.json({
            success: true,
            message:
                'Si el correo existe en nuestra plataforma, recibirás un enlace para restablecer tu contraseña (válido por 30 minutos).',
            ...(demoResetUrl ? { demoResetUrl } : {}),
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Ingresa un correo electrónico válido.' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'No se pudo procesar la solicitud de recuperación.' },
            { status: 500 }
        );
    }
}
