import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, getClientIp, sanitizeInput } from '@/lib/security/sanitization';
import { ensurePostgresSchema, getDatabaseMode, getPgPool, logActivityEvent } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';

const InquirySchema = z.object({
    name: z.string().min(2).max(120),
    school: z.string().min(2).max(160),
    position: z.string().min(2).max(100),
    email: z.string().email().max(180),
    phone: z.string().min(8).max(20),
    interest: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        if (!checkRateLimit(`school-inquiry:${ip}`, 5, 60_000)) {
            return NextResponse.json(
                { error: 'Demasiadas solicitudes. Intenta más tarde.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const data = InquirySchema.parse(body);

        const referenceId = `CON-ESC-${Date.now().toString(36).toUpperCase()}`;
        const sanitized = {
            name: sanitizeInput(data.name),
            school: sanitizeInput(data.school),
            position: sanitizeInput(data.position),
            email: data.email.toLowerCase().trim(),
            phone: sanitizeInput(data.phone),
            interest: sanitizeInput(data.interest),
            receivedAt: new Date().toISOString(),
        };

        const mode = getDatabaseMode();
        if (mode === 'postgres') {
            await ensurePostgresSchema();
            const pool = getPgPool();
            await pool?.query(
                `INSERT INTO schools_inquiries (reference_id, name, school, position, email, phone, interest)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    referenceId,
                    sanitized.name,
                    sanitized.school,
                    sanitized.position,
                    sanitized.email,
                    sanitized.phone,
                    sanitized.interest,
                ]
            );
            await logActivityEvent({
                userName: sanitized.name,
                eventType: 'school_inquiry',
                action: `Nueva solicitud B2B de ${sanitized.school} (${sanitized.interest})`,
                metadata: { referenceId, email: sanitized.email },
            });
        } else if (mode === 'supabase') {
            const supabase = getSupabaseAdmin();
            await supabase.from('schools_inquiries').insert({
                reference_id: referenceId,
                name: sanitized.name,
                school: sanitized.school,
                position: sanitized.position,
                email: sanitized.email,
                phone: sanitized.phone,
                interest: sanitized.interest,
            });
        }

        return NextResponse.json({
            success: true,
            referenceId,
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
