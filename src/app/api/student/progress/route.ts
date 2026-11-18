import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';
import {
    createUserNotification,
    ensurePostgresSchema,
    getDatabaseMode,
    getPgPool,
    logActivityEvent,
} from '@/lib/db';
import { getStudentProgressSnapshot } from '@/lib/analytics-server';
import { sanitizeInput } from '@/lib/security/sanitization';

const DiagnosticActionSchema = z.object({
    action: z.literal('save_diagnostic'),
    overall: z.number().min(0).max(100),
    scores: z.object({
        math: z.number().min(0).max(100),
        reading: z.number().min(0).max(100),
        executive: z.number().min(0).max(100),
        self_regulation: z.number().min(0).max(100),
    }),
    completedAt: z.string().optional(),
});

const ResetDiagnosticSchema = z.object({
    action: z.literal('reset_diagnostic'),
});

const ExaniActionSchema = z.object({
    action: z.literal('save_exani'),
    area: z.string().min(1).max(100),
    correctCount: z.number().int().min(0),
    totalQuestions: z.number().int().min(1),
    percentage: z.number().min(0).max(100),
    cenevalScore: z.number().min(700).max(1300),
    durationMinutes: z.number().int().min(1).max(240).optional(),
});

const VocationalActionSchema = z.object({
    action: z.literal('save_vocational'),
    scores: z.record(z.string(), z.number().min(0).max(100)),
    topCodes: z.array(z.string().min(1).max(4)).min(1).max(6),
    suggestedCareers: z.array(z.unknown()),
    date: z.string().optional(),
});

const PomodoroActionSchema = z.object({
    action: z.literal('log_pomodoro'),
    durationMinutes: z.number().int().min(1).max(120),
});

const WellnessActionSchema = z.object({
    action: z.literal('complete_wellness'),
    strategyId: z.string().min(1).max(80),
    strategyTitle: z.string().max(140).optional(),
    durationMinutes: z.number().int().min(1).max(120).optional(),
    completed: z.boolean().optional(),
});

const PsychometricActionSchema = z.object({
    action: z.literal('save_psychometric'),
    testId: z.enum([
        'habitos_estudio_edaom',
        'estilos_aprendizaje_vak',
        'orientacion_vocacional_chaside',
        'inteligencia_emocional_baron',
    ]),
    testName: z.string().min(2).max(160),
    globalPercentage: z.number().min(0).max(100),
    topDimension: z.string().min(1).max(120),
    recommendation: z.string().max(500),
    dimensions: z.array(
        z.object({
            dimension: z.string().max(80),
            label: z.string().max(120),
            percentage: z.number().min(0).max(100),
            level: z.enum(['alto', 'medio', 'bajo']),
            interpretation: z.string().max(500),
        })
    ),
    durationMinutes: z.number().int().min(1).max(60).optional(),
});

const ProgressPostSchema = z.discriminatedUnion('action', [
    DiagnosticActionSchema,
    ResetDiagnosticSchema,
    ExaniActionSchema,
    VocationalActionSchema,
    PomodoroActionSchema,
    WellnessActionSchema,
    PsychometricActionSchema,
]);

export async function GET(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    try {
        const progress = await getStudentProgressSnapshot(session.user.id);
        return NextResponse.json({ progress });
    } catch (error) {
        console.error('[Student Progress GET]', error);
        return NextResponse.json(
            { error: 'No se pudo cargar tu progreso.' },
            { status: 500 }
        );
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
        const parsed = ProgressPostSchema.parse(body);
        const mode = getDatabaseMode();

        if (mode === 'postgres') {
            await ensurePostgresSchema();
            const pool = getPgPool();
            if (!pool) {
                return NextResponse.json(
                    { error: 'Base de datos no disponible.' },
                    { status: 503 }
                );
            }

            if (parsed.action === 'save_diagnostic') {
                const completedAt = parsed.completedAt || new Date().toISOString();
                const payload = {
                    completedAt,
                    overall: Math.round(parsed.overall),
                    scores: parsed.scores,
                };

                await pool.query(
                    `INSERT INTO user_progress (user_id, module_id, lesson_id, completed, score, time_spent_minutes, payload, completed_at)
                     VALUES ($1, 'diagnostic', 'initial', true, $2, 10, $3::jsonb, NOW())
                     ON CONFLICT (user_id, module_id, lesson_id)
                     DO UPDATE SET completed = true, score = EXCLUDED.score, payload = EXCLUDED.payload, completed_at = NOW(), updated_at = NOW()`,
                    [session.user.id, Math.round(parsed.overall), JSON.stringify(payload)]
                );

                await pool.query(
                    `INSERT INTO study_sessions (user_id, module_id, duration_minutes, session_type, score, meta)
                     VALUES ($1, 'diagnostic', 10, 'assessment', $2, $3::jsonb)`,
                    [session.user.id, Math.round(parsed.overall), JSON.stringify(payload)]
                );

                await Promise.all([
                    logActivityEvent({
                        userId: session.user.id,
                        userName: session.user.name,
                        eventType: 'diagnostic_completed',
                        action: `Completó Diagnóstico Cognitivo-Académico (${Math.round(parsed.overall)}%)`,
                        metadata: { overall: Math.round(parsed.overall) },
                    }),
                    createUserNotification({
                        userId: session.user.id,
                        title: 'Diagnóstico completado',
                        message: `Tu índice inicial de preparación fue ${Math.round(parsed.overall)}%. Revisa tus prioridades en tu Plan de Estudio.`,
                        type: 'success',
                        actionLink: '/dashboard/diagnostic',
                    }),
                ]);
            } else if (parsed.action === 'reset_diagnostic') {
                await pool.query(
                    `DELETE FROM user_progress WHERE user_id = $1 AND module_id = 'diagnostic'`,
                    [session.user.id]
                );
            } else if (parsed.action === 'save_exani') {
                const cleanArea = sanitizeInput(parsed.area).slice(0, 80);
                const duration = parsed.durationMinutes ?? Math.max(5, Math.round(parsed.totalQuestions * 1.5));
                const meta = {
                    area: cleanArea,
                    correctCount: parsed.correctCount,
                    totalQuestions: parsed.totalQuestions,
                    cenevalScore: Math.round(parsed.cenevalScore),
                };

                await pool.query(
                    `INSERT INTO user_progress (user_id, module_id, lesson_id, completed, score, time_spent_minutes, payload, completed_at)
                     VALUES ($1, 'exani', $2, true, $3, $4, $5::jsonb, NOW())
                     ON CONFLICT (user_id, module_id, lesson_id)
                     DO UPDATE SET completed = true, score = EXCLUDED.score, time_spent_minutes = user_progress.time_spent_minutes + EXCLUDED.time_spent_minutes, payload = EXCLUDED.payload, completed_at = NOW(), updated_at = NOW()`,
                    [session.user.id, cleanArea, Math.round(parsed.percentage), duration, JSON.stringify(meta)]
                );

                await pool.query(
                    `INSERT INTO study_sessions (user_id, module_id, duration_minutes, session_type, score, meta)
                     VALUES ($1, 'exani', $2, 'simulator', $3, $4::jsonb)`,
                    [session.user.id, duration, Math.round(parsed.percentage), JSON.stringify(meta)]
                );

                await Promise.all([
                    logActivityEvent({
                        userId: session.user.id,
                        userName: session.user.name,
                        eventType: 'exani_completed',
                        action: `Simulador EXANI-II (${cleanArea}): ${Math.round(parsed.cenevalScore)} pts (${Math.round(parsed.percentage)}%)`,
                        metadata: meta,
                    }),
                    createUserNotification({
                        userId: session.user.id,
                        title: 'Resultado EXANI-II guardado',
                        message: `Obtuviste ${Math.round(parsed.cenevalScore)} pts en escala CENEVAL (${parsed.correctCount}/${parsed.totalQuestions} aciertos en ${cleanArea}).`,
                        type: 'success',
                        actionLink: '/dashboard/progress',
                    }),
                ]);
            } else if (parsed.action === 'save_vocational') {
                const dateStr = parsed.date || new Date().toISOString();
                const payload = {
                    date: dateStr,
                    scores: parsed.scores,
                    topCodes: parsed.topCodes,
                    suggestedCareers: parsed.suggestedCareers,
                };

                await pool.query(
                    `INSERT INTO user_progress (user_id, module_id, lesson_id, completed, score, time_spent_minutes, payload, completed_at)
                     VALUES ($1, 'vocational', 'riasec', true, 100, 15, $2::jsonb, NOW())
                     ON CONFLICT (user_id, module_id, lesson_id)
                     DO UPDATE SET completed = true, payload = EXCLUDED.payload, completed_at = NOW(), updated_at = NOW()`,
                    [session.user.id, JSON.stringify(payload)]
                );

                await pool.query(
                    `INSERT INTO study_sessions (user_id, module_id, duration_minutes, session_type, score, meta)
                     VALUES ($1, 'vocational', 15, 'assessment', 100, $2::jsonb)`,
                    [session.user.id, JSON.stringify({ topCodes: parsed.topCodes })]
                );

                await Promise.all([
                    logActivityEvent({
                        userId: session.user.id,
                        userName: session.user.name,
                        eventType: 'vocational_completed',
                        action: `Completó Test Vocacional RIASEC (${parsed.topCodes.join('-')})`,
                        metadata: { topCodes: parsed.topCodes },
                    }),
                    createUserNotification({
                        userId: session.user.id,
                        title: 'Perfil Vocacional RIASEC listo',
                        message: `Tu código principal es ${parsed.topCodes.join('-')}. Explora las carreras compatibles en tu reporte.`,
                        type: 'info',
                        actionLink: '/dashboard/vocational/results',
                    }),
                ]);
            } else if (parsed.action === 'log_pomodoro') {
                await pool.query(
                    `INSERT INTO study_sessions (user_id, module_id, duration_minutes, session_type, meta)
                     VALUES ($1, 'pomodoro', $2, 'pomodoro', $3::jsonb)`,
                    [session.user.id, parsed.durationMinutes, JSON.stringify({ minutes: parsed.durationMinutes })]
                );

                await logActivityEvent({
                    userId: session.user.id,
                    userName: session.user.name,
                    eventType: 'pomodoro_completed',
                    action: `Completó bloque Pomodoro de ${parsed.durationMinutes} min`,
                });
            } else if (parsed.action === 'complete_wellness') {
                const cleanId = sanitizeInput(parsed.strategyId).slice(0, 80);
                const cleanTitle = parsed.strategyTitle
                    ? sanitizeInput(parsed.strategyTitle).slice(0, 140)
                    : cleanId;
                const duration = parsed.durationMinutes ?? 5;
                const markCompleted = parsed.completed !== false;

                if (markCompleted) {
                    await pool.query(
                        `INSERT INTO user_progress (user_id, module_id, lesson_id, completed, score, time_spent_minutes, payload, completed_at)
                         VALUES ($1, 'wellness', $2, true, 100, $3, $4::jsonb, NOW())
                         ON CONFLICT (user_id, module_id, lesson_id)
                         DO UPDATE SET completed = true, time_spent_minutes = user_progress.time_spent_minutes + EXCLUDED.time_spent_minutes, payload = EXCLUDED.payload, completed_at = NOW(), updated_at = NOW()`,
                        [session.user.id, cleanId, duration, JSON.stringify({ title: cleanTitle })]
                    );

                    await pool.query(
                        `INSERT INTO study_sessions (user_id, module_id, duration_minutes, session_type, meta)
                         VALUES ($1, 'wellness', $2, 'wellness', $3::jsonb)`,
                        [session.user.id, duration, JSON.stringify({ strategyId: cleanId, title: cleanTitle })]
                    );

                    await logActivityEvent({
                        userId: session.user.id,
                        userName: session.user.name,
                        eventType: 'wellness_practiced',
                        action: `Practicó estrategia de bienestar: ${cleanTitle}`,
                    });
                } else {
                    await pool.query(
                        `DELETE FROM user_progress WHERE user_id = $1 AND module_id = 'wellness' AND lesson_id = $2`,
                        [session.user.id, cleanId]
                    );
                }
            } else if (parsed.action === 'save_psychometric') {
                const duration = parsed.durationMinutes ?? 6;
                const payload = {
                    testId: parsed.testId,
                    testName: sanitizeInput(parsed.testName),
                    completedAt: new Date().toISOString(),
                    globalPercentage: Math.round(parsed.globalPercentage),
                    topDimension: sanitizeInput(parsed.topDimension),
                    recommendation: sanitizeInput(parsed.recommendation),
                    dimensions: parsed.dimensions,
                };

                await pool.query(
                    `INSERT INTO user_progress (user_id, module_id, lesson_id, completed, score, time_spent_minutes, payload, completed_at)
                     VALUES ($1, 'psychometric', $2, true, $3, $4, $5::jsonb, NOW())
                     ON CONFLICT (user_id, module_id, lesson_id)
                     DO UPDATE SET completed = true, score = EXCLUDED.score, payload = EXCLUDED.payload, completed_at = NOW(), updated_at = NOW()`,
                    [
                        session.user.id,
                        parsed.testId,
                        Math.round(parsed.globalPercentage),
                        duration,
                        JSON.stringify(payload),
                    ]
                );

                await pool.query(
                    `INSERT INTO study_sessions (user_id, module_id, duration_minutes, session_type, score, meta)
                     VALUES ($1, 'psychometric', $2, 'assessment', $3, $4::jsonb)`,
                    [
                        session.user.id,
                        duration,
                        Math.round(parsed.globalPercentage),
                        JSON.stringify({ testId: parsed.testId, topDimension: payload.topDimension }),
                    ]
                );

                await Promise.all([
                    logActivityEvent({
                        userId: session.user.id,
                        userName: session.user.name,
                        eventType: 'psychometric_completed',
                        action: `Completó evaluación psicométrica: ${payload.testName} (${payload.topDimension})`,
                        metadata: { testId: parsed.testId, globalPercentage: payload.globalPercentage },
                    }),
                    createUserNotification({
                        userId: session.user.id,
                        title: `Resultados listos: ${payload.testName}`,
                        message: `Tu dimensión principal fue ${payload.topDimension}. Consulta tus gráficas e interpretación en Psicometría.`,
                        type: 'success',
                        actionLink: '/dashboard/psychometrics',
                    }),
                ]);
            }
        }

        const progress = await getStudentProgressSnapshot(session.user.id);
        return NextResponse.json({ success: true, progress });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos de progreso inválidos.' },
                { status: 400 }
            );
        }
        console.error('[Student Progress POST]', error);
        return NextResponse.json(
            { error: 'No se pudo guardar tu progreso.' },
            { status: 500 }
        );
    }
}
