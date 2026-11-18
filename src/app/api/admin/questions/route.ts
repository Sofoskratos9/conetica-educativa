import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';
import { EXANI_QUESTIONS } from '@/lib/exani-data';
import { ensurePostgresSchema, getDatabaseMode, getPgPool, logActivityEvent } from '@/lib/db';
import { sanitizeInput } from '@/lib/security/sanitization';

const CreateQuestionSchema = z.object({
    area: z.enum([
        'Pensamiento Matemático',
        'Pensamiento Analítico',
        'Estructura de la Lengua',
        'Comprensión Lectora',
    ]),
    difficulty: z.enum(['Básico', 'Intermedio', 'Avanzado']),
    question: z.string().min(8).max(1200),
    options: z.array(z.string().min(1).max(300)).length(4),
    correctIndex: z.number().int().min(0).max(3),
    explanation: z.string().min(8).max(1000),
});

const PatchQuestionSchema = CreateQuestionSchema.partial().extend({
    id: z.string().uuid(),
    active: z.boolean().optional(),
});

async function requireAdmin(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return { error: NextResponse.json({ error: 'No autenticado.' }, { status: 401 }) };
    }
    if (session.user.role !== 'admin') {
        return { error: NextResponse.json({ error: 'Acceso restringido a administradores.' }, { status: 403 }) };
    }
    return { session };
}

export async function GET(request: NextRequest) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    if (getDatabaseMode() !== 'postgres') {
        return NextResponse.json({ customQuestions: [], baseCount: EXANI_QUESTIONS.length });
    }

    try {
        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) return NextResponse.json({ customQuestions: [], baseCount: EXANI_QUESTIONS.length });

        const res = await pool.query<{
            id: string;
            area: string;
            difficulty: string;
            question: string;
            options: string[];
            correct_index: number;
            explanation: string;
            active: boolean;
            created_at: Date | string;
        }>(
            `SELECT id, area, difficulty, question, options, correct_index, explanation, active, created_at
             FROM exani_questions
             ORDER BY created_at DESC`
        );

        const customQuestions = res.rows.map((r) => ({
            id: r.id,
            area: r.area,
            difficulty: r.difficulty,
            question: r.question,
            options: Array.isArray(r.options) ? r.options : [],
            correctIndex: Number(r.correct_index),
            explanation: r.explanation,
            active: Boolean(r.active),
            createdAt: new Date(r.created_at).toISOString().slice(0, 10),
        }));

        return NextResponse.json({
            customQuestions,
            baseCount: EXANI_QUESTIONS.length,
        });
    } catch (error) {
        console.error('[Admin Questions GET]', error);
        return NextResponse.json({ error: 'No se pudo cargar el banco de reactivos.' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    if (getDatabaseMode() !== 'postgres') {
        return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });
    }

    try {
        const body = await request.json();
        const parsed = CreateQuestionSchema.parse(body);

        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });

        const cleanQuestion = sanitizeInput(parsed.question);
        const cleanOptions = parsed.options.map((o) => sanitizeInput(o));
        const cleanExplanation = sanitizeInput(parsed.explanation);

        const res = await pool.query<{
            id: string;
            area: string;
            difficulty: string;
            question: string;
            options: string[];
            correct_index: number;
            explanation: string;
            active: boolean;
            created_at: Date | string;
        }>(
            `INSERT INTO exani_questions (area, difficulty, question, options, correct_index, explanation, created_by)
             VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)
             RETURNING id, area, difficulty, question, options, correct_index, explanation, active, created_at`,
            [
                parsed.area,
                parsed.difficulty,
                cleanQuestion,
                JSON.stringify(cleanOptions),
                parsed.correctIndex,
                cleanExplanation,
                auth.session!.user.id,
            ]
        );

        const row = res.rows[0];
        await logActivityEvent({
            userId: auth.session!.user.id,
            userName: auth.session!.user.name,
            eventType: 'admin_question_created',
            action: `Creó reactivo personalizado en ${parsed.area} (${parsed.difficulty})`,
        });

        return NextResponse.json(
            {
                success: true,
                question: {
                    id: row.id,
                    area: row.area,
                    difficulty: row.difficulty,
                    question: row.question,
                    options: row.options,
                    correctIndex: Number(row.correct_index),
                    explanation: row.explanation,
                    active: Boolean(row.active),
                    createdAt: new Date(row.created_at).toISOString().slice(0, 10),
                },
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Verifica el enunciado, las 4 opciones, la respuesta correcta y la explicación.' },
                { status: 400 }
            );
        }
        console.error('[Admin Questions POST]', error);
        return NextResponse.json({ error: 'No se pudo guardar el reactivo.' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    if (getDatabaseMode() !== 'postgres') {
        return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });
    }

    try {
        const body = await request.json();
        const parsed = PatchQuestionSchema.parse(body);

        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });

        const existingRes = await pool.query<{
            area: string;
            difficulty: string;
            question: string;
            options: string[];
            correct_index: number;
            explanation: string;
            active: boolean;
        }>(
            `SELECT area, difficulty, question, options, correct_index, explanation, active FROM exani_questions WHERE id = $1 LIMIT 1`,
            [parsed.id]
        );
        const existing = existingRes.rows[0];
        if (!existing) {
            return NextResponse.json({ error: 'Reactivo no encontrado.' }, { status: 404 });
        }

        const res = await pool.query<{
            id: string;
            area: string;
            difficulty: string;
            question: string;
            options: string[];
            correct_index: number;
            explanation: string;
            active: boolean;
            created_at: Date | string;
        }>(
            `UPDATE exani_questions
             SET area = $1, difficulty = $2, question = $3, options = $4::jsonb, correct_index = $5, explanation = $6, active = $7, updated_at = NOW()
             WHERE id = $8
             RETURNING id, area, difficulty, question, options, correct_index, explanation, active, created_at`,
            [
                parsed.area ?? existing.area,
                parsed.difficulty ?? existing.difficulty,
                parsed.question ? sanitizeInput(parsed.question) : existing.question,
                JSON.stringify(parsed.options ? parsed.options.map((o) => sanitizeInput(o)) : existing.options),
                parsed.correctIndex ?? existing.correct_index,
                parsed.explanation ? sanitizeInput(parsed.explanation) : existing.explanation,
                typeof parsed.active === 'boolean' ? parsed.active : existing.active,
                parsed.id,
            ]
        );

        const row = res.rows[0];
        return NextResponse.json({
            success: true,
            question: {
                id: row.id,
                area: row.area,
                difficulty: row.difficulty,
                question: row.question,
                options: row.options,
                correctIndex: Number(row.correct_index),
                explanation: row.explanation,
                active: Boolean(row.active),
                createdAt: new Date(row.created_at).toISOString().slice(0, 10),
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 });
        }
        console.error('[Admin Questions PATCH]', error);
        return NextResponse.json({ error: 'No se pudo actualizar el reactivo.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'Falta el ID del reactivo.' }, { status: 400 });
    }

    if (getDatabaseMode() !== 'postgres') {
        return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });
    }

    try {
        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });

        await pool.query(`DELETE FROM exani_questions WHERE id = $1`, [id]);
        await logActivityEvent({
            userId: auth.session!.user.id,
            userName: auth.session!.user.name,
            eventType: 'admin_question_deleted',
            action: `Eliminó reactivo personalizado (${id.slice(0, 8)})`,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Admin Questions DELETE]', error);
        return NextResponse.json({ error: 'No se pudo eliminar el reactivo.' }, { status: 500 });
    }
}
