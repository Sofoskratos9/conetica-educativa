import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';
import {
    ensurePostgresSchema,
    getDatabaseMode,
    getPgPool,
    logActivityEvent,
} from '@/lib/db';
import { sanitizeInput } from '@/lib/security/sanitization';

export interface StudyTaskRecord {
    id: string;
    title: string;
    area: string;
    durationMin: number;
    day: string;
    completed: boolean;
    createdAt: string;
}

const CreateTaskSchema = z.object({
    action: z.literal('create').optional(),
    title: z.string().trim().min(2).max(160),
    area: z.string().trim().min(2).max(80),
    durationMin: z.number().int().min(5).max(180).optional(),
    day: z.string().trim().min(1).max(30).optional(),
});

const SeedRecommendedSchema = z.object({
    action: z.literal('seed_recommended'),
});

const UpdateTaskSchema = z.object({
    id: z.string().min(1),
    completed: z.boolean(),
});

async function fetchUserTasks(userId: string): Promise<StudyTaskRecord[]> {
    const mode = getDatabaseMode();
    if (mode !== 'postgres') return [];

    await ensurePostgresSchema();
    const pool = getPgPool();
    if (!pool) return [];

    const res = await pool.query<{
        id: string;
        title: string;
        area: string;
        duration_min: number;
        day: string;
        completed: boolean;
        created_at: Date | string;
    }>(
        `SELECT id, title, area, duration_min, day, completed, created_at
         FROM study_tasks
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
    );

    return res.rows.map((r) => ({
        id: r.id,
        title: r.title,
        area: r.area,
        durationMin: Number(r.duration_min) || 25,
        day: r.day,
        completed: Boolean(r.completed),
        createdAt: new Date(r.created_at).toISOString(),
    }));
}

export async function GET(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    try {
        const tasks = await fetchUserTasks(session.user.id);
        return NextResponse.json({ tasks });
    } catch (error) {
        console.error('[Student Tasks GET]', error);
        return NextResponse.json({ error: 'No se pudieron cargar las tareas.' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const mode = getDatabaseMode();
        if (mode !== 'postgres') {
            return NextResponse.json(
                { error: 'Se requiere base de datos conectada.' },
                { status: 503 }
            );
        }

        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) {
            return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });
        }

        if (body?.action === 'seed_recommended') {
            SeedRecommendedSchema.parse(body);
            // Inspect real diagnostic scores if available to prioritize lowest areas
            const diagRes = await pool.query<{ payload: any }>(
                `SELECT payload FROM user_progress WHERE user_id = $1 AND module_id = 'diagnostic' LIMIT 1`,
                [session.user.id]
            );
            const scores = diagRes.rows[0]?.payload?.scores as Record<string, number> | undefined;

            const recommended: { title: string; area: string; durationMin: number; day: string }[] = [
                {
                    title: 'Resolver 15 reactivos de proporcionalidad y álgebra lineal',
                    area: 'Pensamiento Matemático',
                    durationMin: 40,
                    day: 'Lunes',
                },
                {
                    title: 'Lectura crítica: tesis y argumentos en 2 textos académicos',
                    area: 'Comprensión Lectora',
                    durationMin: 30,
                    day: 'Martes',
                },
                {
                    title: 'Práctica cronometrada de Pensamiento Analítico',
                    area: 'Pensamiento Analítico',
                    durationMin: 40,
                    day: 'Miércoles',
                },
                {
                    title: 'Repaso espaciado de Estructura de la Lengua',
                    area: 'Estructura de la Lengua',
                    durationMin: 25,
                    day: 'Jueves',
                },
            ];

            if (scores && typeof scores.math === 'number' && scores.math < 70) {
                recommended[0].durationMin = 50;
            }
            if (scores && typeof scores.reading === 'number' && scores.reading < 70) {
                recommended[1].durationMin = 45;
            }

            for (const item of recommended) {
                await pool.query(
                    `INSERT INTO study_tasks (user_id, title, area, duration_min, day, completed)
                     VALUES ($1, $2, $3, $4, $5, false)`,
                    [session.user.id, item.title, item.area, item.durationMin, item.day]
                );
            }

            await logActivityEvent({
                userId: session.user.id,
                userName: session.user.name,
                eventType: 'study_plan_generated',
                action: 'Generó plan de estudio recomendado',
            });

            const tasks = await fetchUserTasks(session.user.id);
            return NextResponse.json({ tasks }, { status: 201 });
        }

        const parsed = CreateTaskSchema.parse(body);
        const cleanTitle = sanitizeInput(parsed.title).slice(0, 160);
        const cleanArea = sanitizeInput(parsed.area).slice(0, 80);
        const cleanDay = sanitizeInput(parsed.day || 'Hoy').slice(0, 30);
        const duration = parsed.durationMin ?? 25;

        const inserted = await pool.query<{
            id: string;
            title: string;
            area: string;
            duration_min: number;
            day: string;
            completed: boolean;
            created_at: Date | string;
        }>(
            `INSERT INTO study_tasks (user_id, title, area, duration_min, day, completed)
             VALUES ($1, $2, $3, $4, $5, false)
             RETURNING id, title, area, duration_min, day, completed, created_at`,
            [session.user.id, cleanTitle, cleanArea, duration, cleanDay]
        );

        const row = inserted.rows[0];
        return NextResponse.json(
            {
                task: {
                    id: row.id,
                    title: row.title,
                    area: row.area,
                    durationMin: Number(row.duration_min),
                    day: row.day,
                    completed: Boolean(row.completed),
                    createdAt: new Date(row.created_at).toISOString(),
                },
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Datos de tarea inválidos.' }, { status: 400 });
        }
        console.error('[Student Tasks POST]', error);
        return NextResponse.json({ error: 'No se pudo guardar la tarea.' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, completed } = UpdateTaskSchema.parse(body);
        const mode = getDatabaseMode();

        if (mode !== 'postgres') {
            return NextResponse.json({ success: true });
        }

        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) {
            return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });
        }

        const updated = await pool.query<{
            id: string;
            title: string;
            area: string;
            duration_min: number;
            day: string;
            completed: boolean;
            created_at: Date | string;
        }>(
            `UPDATE study_tasks
             SET completed = $1, updated_at = NOW()
             WHERE id = $2 AND user_id = $3
             RETURNING id, title, area, duration_min, day, completed, created_at`,
            [completed, id, session.user.id]
        );

        if (updated.rows.length === 0) {
            return NextResponse.json({ error: 'Tarea no encontrada.' }, { status: 404 });
        }

        const row = updated.rows[0];
        if (completed) {
            await logActivityEvent({
                userId: session.user.id,
                userName: session.user.name,
                eventType: 'task_completed',
                action: `Completó tarea: ${row.title}`,
            });
        }

        return NextResponse.json({
            task: {
                id: row.id,
                title: row.title,
                area: row.area,
                durationMin: Number(row.duration_min),
                day: row.day,
                completed: Boolean(row.completed),
                createdAt: new Date(row.created_at).toISOString(),
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
        }
        console.error('[Student Tasks PATCH]', error);
        return NextResponse.json({ error: 'No se pudo actualizar la tarea.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    try {
        const id = request.nextUrl.searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'ID de tarea requerido.' }, { status: 400 });
        }

        const mode = getDatabaseMode();
        if (mode === 'postgres') {
            await ensurePostgresSchema();
            const pool = getPgPool();
            await pool?.query(
                `DELETE FROM study_tasks WHERE id = $1 AND user_id = $2`,
                [id, session.user.id]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Student Tasks DELETE]', error);
        return NextResponse.json({ error: 'No se pudo eliminar la tarea.' }, { status: 500 });
    }
}
