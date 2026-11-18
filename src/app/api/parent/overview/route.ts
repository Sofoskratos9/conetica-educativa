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
import { getStudentProgressSnapshot, type StudentProgressSnapshot } from '@/lib/analytics-server';

const LinkStudentSchema = z.object({
    studentEmail: z.string().email().max(180),
});

function buildParentInsights(progress: StudentProgressSnapshot) {
    const recentAchievements: string[] = [];
    if (progress.diagnostic) {
        recentAchievements.push(
            `Diagnóstico Cognitivo-Académico completado (${progress.diagnostic.overall}% global)`
        );
    }
    if (progress.exaniLastScore !== null) {
        recentAchievements.push(
            `Último simulacro EXANI-II: ${progress.exaniLastScore} pts (estimación de práctica, no oficial)`
        );
    }
    if (progress.vocational) {
        recentAchievements.push(
            `Test Vocacional RIASEC completado (perfil ${progress.vocational.topCodes.join('-')})`
        );
    }
    if (progress.psychometricResults && progress.psychometricResults.length > 0) {
        recentAchievements.push(
            `${progress.psychometricResults.length} evaluación(es) psicométrica(s) completada(s)`
        );
    }
    if (progress.tasksCompleted > 0) {
        recentAchievements.push(
            `${progress.tasksCompleted} de ${progress.tasksTotal} metas de estudio completadas`
        );
    }
    if (progress.currentStreak > 0) {
        recentAchievements.push(`Racha activa de ${progress.currentStreak} día(s) consecutivo(s)`);
    }

    const homeSupportSuggestions: { title: string; description: string; actionItem: string }[] = [];

    if (!progress.diagnostic) {
        homeSupportSuggestions.push({
            title: 'Primer paso recomendado',
            description:
                'Aún no se ha completado el Diagnóstico Cognitivo-Académico inicial necesario para identificar fortalezas y brechas.',
            actionItem: 'Acuerda un bloque tranquilo de 10 minutos para completar el diagnóstico inicial.',
        });
    } else {
        const weakest = [...progress.academicAreas].sort((a, b) => a.score - b.score)[0];
        if (weakest && weakest.score < 70) {
            homeSupportSuggestions.push({
                title: `Acompañamiento en ${weakest.name}`,
                description: `Su desempeño actual en ${weakest.name} es de ${weakest.score}%, por lo que conviene reforzar esta área sin presión excesiva.`,
                actionItem: 'Pregúntale qué tema específico de esta materia le resultó más retador esta semana.',
            });
        }
    }

    if (progress.consistencyScore < 50) {
        homeSupportSuggestions.push({
            title: 'Construir hábito constante',
            description:
                'La consistencia semanal se fortalece con sesiones breves y predecibles más que con maratones de fin de semana.',
            actionItem: 'Ayúdale a elegir un horario fijo de 25 minutos diarios libre de distracciones.',
        });
    } else {
        homeSupportSuggestions.push({
            title: 'Refuerzo positivo del hábito',
            description: `Mantiene ${progress.consistencyScore}% de consistencia en los últimos 7 días con ${progress.totalStudyHours}h registradas.`,
            actionItem: 'Reconoce su constancia semanal antes de revisar resultados numéricos.',
        });
    }

    return { recentAchievements, homeSupportSuggestions };
}

export async function GET(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (session.user.role !== 'parent' && session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Acceso restringido a padres o administradores.' }, { status: 403 });
    }

    try {
        if (getDatabaseMode() !== 'postgres') {
            return NextResponse.json({ linked: false, student: null, progress: null });
        }

        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) {
            return NextResponse.json({ linked: false, student: null, progress: null });
        }

        const parentRes = await pool.query<{ student_id: string | null }>(
            `SELECT student_id FROM users WHERE id = $1 LIMIT 1`,
            [session.user.id]
        );
        const studentId = parentRes.rows[0]?.student_id;

        if (!studentId) {
            return NextResponse.json({ linked: false, student: null, progress: null });
        }

        const studentRes = await pool.query<{
            id: string;
            name: string;
            email: string;
            is_premium: boolean;
        }>(
            `SELECT id, name, email, is_premium FROM users WHERE id = $1 LIMIT 1`,
            [studentId]
        );

        const student = studentRes.rows[0];
        if (!student) {
            return NextResponse.json({ linked: false, student: null, progress: null });
        }

        const progress = await getStudentProgressSnapshot(student.id);
        const insights = buildParentInsights(progress);

        return NextResponse.json({
            linked: true,
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
                isPremium: Boolean(student.is_premium),
            },
            progress,
            ...insights,
        });
    } catch (error) {
        console.error('[Parent Overview GET]', error);
        return NextResponse.json(
            { error: 'Error al cargar los datos del estudiante.' },
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
    if (session.user.role !== 'parent' && session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Acceso restringido.' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { studentEmail } = LinkStudentSchema.parse(body);
        const normalizedEmail = studentEmail.toLowerCase().trim();

        if (getDatabaseMode() !== 'postgres') {
            return NextResponse.json(
                { error: 'Se requiere base de datos conectada para vincular cuentas.' },
                { status: 503 }
            );
        }

        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) {
            return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });
        }

        const studentRes = await pool.query<{
            id: string;
            name: string;
            email: string;
            is_premium: boolean;
        }>(
            `SELECT id, name, email, is_premium FROM users WHERE email = $1 AND role = 'student' LIMIT 1`,
            [normalizedEmail]
        );

        const student = studentRes.rows[0];
        if (!student) {
            return NextResponse.json(
                { error: 'No encontramos una cuenta de estudiante registrada con ese correo.' },
                { status: 404 }
            );
        }

        await pool.query(
            `UPDATE users SET student_id = $1, updated_at = NOW() WHERE id = $2`,
            [student.id, session.user.id]
        );

        await Promise.all([
            logActivityEvent({
                userId: session.user.id,
                userName: session.user.name,
                eventType: 'parent_linked_student',
                action: `Vinculó seguimiento familiar con estudiante ${student.email}`,
            }),
            createUserNotification({
                userId: student.id,
                title: 'Cuenta familiar vinculada',
                message: `${session.user.name} ahora puede consultar tu resumen de progreso académico.`,
                type: 'info',
            }),
        ]);

        const progress = await getStudentProgressSnapshot(student.id);
        const insights = buildParentInsights(progress);

        return NextResponse.json({
            linked: true,
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
                isPremium: Boolean(student.is_premium),
            },
            progress,
            ...insights,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Ingresa un correo electrónico válido.' }, { status: 400 });
        }
        console.error('[Parent Overview POST]', error);
        return NextResponse.json(
            { error: 'No se pudo vincular la cuenta del estudiante.' },
            { status: 500 }
        );
    }
}
