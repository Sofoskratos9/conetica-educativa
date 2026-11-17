import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, sanitizeInput } from '@/lib/security/sanitization';

const InquirySchema = z.object({
    name: z.string().min(2).max(120),
    school: z.string().min(2).max(160),
    position: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().min(8).max(20),
    interest: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'local';
        if (!checkRateLimit(`school-inquiry:${ip}`, 5, 60_000)) {
            return NextResponse.json(
                { error: 'Demasiadas solicitudes. Intenta más tarde.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const data = InquirySchema.parse(body);

        const sanitized = {
            name: sanitizeInput(data.name),
            school: sanitizeInput(data.school),
            position: sanitizeInput(data.position),
            email: data.email.toLowerCase().trim(),
            phone: sanitizeInput(data.phone),
            interest: sanitizeInput(data.interest),
            receivedAt: new Date().toISOString(),
        };

        return NextResponse.json({
            success: true,
            referenceId: `CON-ESC-${Date.now().toString(36).toUpperCase()}`,
            inquiry: sanitized,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Por favor verifica todos los campos del formulario.' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'No se pudo registrar tu solicitud.' },
            { status: 500 }
        );
    }
}
