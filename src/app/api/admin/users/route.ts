import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';
import {
    PRIMARY_ADMIN_EMAIL,
    createUserNotification,
    ensurePostgresSchema,
    getDatabaseMode,
    getPgPool,
    logActivityEvent,
} from '@/lib/db';

const PatchUserSchema = z.object({
    id: z.string().uuid(),
    isPremium: z.boolean().optional(),
    role: z.enum(['student', 'parent', 'admin']).optional(),
    studentEmail: z.string().email().max(180).nullable().optional(),
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
        return NextResponse.json({ users: [] });
    }

    try {
        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) return NextResponse.json({ users: [] });

        const [usersRes, progressRes, sessionsRes, tasksRes] = await Promise.all([
            pool.query<{
                id: string;
                name: string;
                email: string;
                phone: string | null;
                role: 'student' | 'parent' | 'admin';
                is_premium: boolean;
                student_id: string | null;
                created_at: Date | string;
            }>(
                `SELECT id, name, email, phone, role, is_premium, student_id, created_at
                 FROM users
                 ORDER BY created_at DESC`
            ),
            pool.query<{
                user_id: string;
                module_id: string;
                completed: boolean;
                score: string | null;
                payload: any;
                updated_at: Date | string;
            }>(
                `SELECT user_id, module_id, completed, score, payload, updated_at
                 FROM user_progress
                 ORDER BY updated_at DESC`
            ),
            pool.query<{
                user_id: string;
                module_id: string;
                duration_minutes: number;
                meta: any;
                created_at: Date | string;
            }>(
                `SELECT user_id, module_id, duration_minutes, meta, created_at
                 FROM study_sessions
                 ORDER BY created_at DESC`
            ),
            pool.query<{
                user_id: string;
                completed: boolean;
            }>(`SELECT user_id, completed FROM study_tasks`),
        ]);

        const emailById = new Map(usersRes.rows.map((u) => [u.id, u.email]));

        const users = usersRes.rows.map((u) => {
            const uProgress = progressRes.rows.filter((p) => p.user_id === u.id);
            const uSessions = sessionsRes.rows.filter((s) => s.user_id === u.id);
            const uTasks = tasksRes.rows.filter((t) => t.user_id === u.id);

            const studyMinutes = uSessions.reduce((acc, s) => acc + (Number(s.duration_minutes) || 0), 0);
            const tasksCompleted = uTasks.filter((t) => t.completed).length;

            const hasDiagnostic = uProgress.some((p) => p.module_id === 'diagnostic' && p.completed);
            const hasExani =
                uSessions.some((s) => s.module_id === 'exani') ||
                uProgress.some((p) => p.module_id === 'exani');
            const vocRow = uProgress.find((p) => p.module_id === 'vocational');
            const hasVocational = Boolean(vocRow);
            const hasStudyPlan = tasksCompleted > 0 || uSessions.some((s) => s.module_id === 'pomodoro');
            const hasWellness = uProgress.some((p) => p.module_id === 'wellness' && p.completed);
            const modulesCompleted = [
                hasDiagnostic,
                hasExani,
                hasVocational,
                hasStudyPlan,
                hasWellness,
            ].filter(Boolean).length;

            const latestExani = uSessions.find((s) => s.module_id === 'exani' && s.meta?.cenevalScore);
            const exaniLastScore = latestExani ? Number(latestExani.meta.cenevalScore) : null;
            const riasecCode = Array.isArray(vocRow?.payload?.topCodes)
                ? vocRow.payload.topCodes.join('-')
                : null;
            const psychometricCount = uProgress.filter((p) => p.module_id === 'psychometric').length;

            const timestamps = [
                ...uProgress.map((p) => new Date(p.updated_at).getTime()),
                ...uSessions.map((s) => new Date(s.created_at).getTime()),
            ].filter((n) => !Number.isNaN(n));
            const lastActive = timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : null;

            return {
                id: u.id,
                name: u.name,
                email: u.email,
                phone: u.phone || null,
                role: u.role,
                isPremium: Boolean(u.is_premium),
                studentId: u.student_id,
                linkedStudentEmail: u.student_id ? emailById.get(u.student_id) || null : null,
                createdAt: new Date(u.created_at).toISOString().slice(0, 10),
                modulesCompleted,
                studyMinutes,
                tasksCompleted,
                exaniLastScore,
                riasecCode,
                psychometricCount,
                lastActive,
                isPrimaryAdmin: u.email.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL,
            };
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error('[Admin Users GET]', error);
        return NextResponse.json({ error: 'No se pudieron cargar los usuarios.' }, { status: 500 });
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
        const parsed = PatchUserSchema.parse(body);

        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });

        const existingRes = await pool.query<{
            id: string;
            email: string;
            name: string;
            role: string;
            is_premium: boolean;
        }>(`SELECT id, email, name, role, is_premium FROM users WHERE id = $1 LIMIT 1`, [parsed.id]);

        const target = existingRes.rows[0];
        if (!target) {
            return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
        }

        if (target.email.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL && parsed.role && parsed.role !== 'admin') {
            return NextResponse.json(
                { error: 'No puedes degradar la cuenta del administrador principal.' },
                { status: 400 }
            );
        }

        if (typeof parsed.isPremium === 'boolean') {
            await pool.query(
                `UPDATE users SET is_premium = $1, updated_at = NOW() WHERE id = $2`,
                [parsed.isPremium, target.id]
            );
            await Promise.all([
                logActivityEvent({
                    userId: auth.session!.user.id,
                    userName: auth.session!.user.name,
                    eventType: 'admin_premium_updated',
                    action: `${parsed.isPremium ? 'Activó' : 'Desactivó'} plan PRO para ${target.email}`,
                }),
                createUserNotification({
                    userId: target.id,
                    title: parsed.isPremium ? 'Acceso Conética PRO activado' : 'Actualización de plan',
                    message: parsed.isPremium
                        ? 'Un administrador activó tu acceso Conética PRO a todos los módulos y bancos avanzados.'
                        : 'Tu cuenta cambió a acceso estándar.',
                    type: parsed.isPremium ? 'premium' : 'info',
                    actionLink: '/dashboard/exani',
                }),
            ]);
        }

        if (parsed.role && parsed.role !== target.role) {
            await pool.query(
                `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2`,
                [parsed.role, target.id]
            );
            await logActivityEvent({
                userId: auth.session!.user.id,
                userName: auth.session!.user.name,
                eventType: 'admin_role_updated',
                action: `Cambió rol de ${target.email} a ${parsed.role}`,
            });
        }

        if (parsed.studentEmail !== undefined) {
            if (parsed.studentEmail === null) {
                await pool.query(
                    `UPDATE users SET student_id = NULL, updated_at = NOW() WHERE id = $1`,
                    [target.id]
                );
            } else {
                const studentRes = await pool.query<{ id: string; email: string }>(
                    `SELECT id, email FROM users WHERE email = $1 AND role = 'student' LIMIT 1`,
                    [parsed.studentEmail.toLowerCase().trim()]
                );
                const student = studentRes.rows[0];
                if (!student) {
                    return NextResponse.json(
                        { error: 'No existe ningún estudiante con ese correo.' },
                        { status: 404 }
                    );
                }
                await pool.query(
                    `UPDATE users SET student_id = $1, updated_at = NOW() WHERE id = $2`,
                    [student.id, target.id]
                );
                await logActivityEvent({
                    userId: auth.session!.user.id,
                    userName: auth.session!.user.name,
                    eventType: 'admin_linked_family',
                    action: `Vinculó cuenta padre ${target.email} con estudiante ${student.email}`,
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 });
        }
        console.error('[Admin Users PATCH]', error);
        return NextResponse.json({ error: 'No se pudo actualizar el usuario.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'Falta el ID del usuario.' }, { status: 400 });
    }

    if (getDatabaseMode() !== 'postgres') {
        return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });
    }

    try {
        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });

        const targetRes = await pool.query<{ id: string; email: string; role: string }>(
            `SELECT id, email, role FROM users WHERE id = $1 LIMIT 1`,
            [id]
        );
        const target = targetRes.rows[0];
        if (!target) {
            return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
        }

        if (
            target.id === auth.session!.user.id ||
            target.email.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL
        ) {
            return NextResponse.json(
                { error: 'No es posible eliminar la cuenta de administrador activa.' },
                { status: 400 }
            );
        }

        // Clear any parent link referencing this student before deleting
        await pool.query(`UPDATE users SET student_id = NULL WHERE student_id = $1`, [target.id]);
        await pool.query(`DELETE FROM users WHERE id = $1`, [target.id]);

        await logActivityEvent({
            userId: auth.session!.user.id,
            userName: auth.session!.user.name,
            eventType: 'admin_user_deleted',
            action: `Eliminó cuenta ${target.email} (${target.role})`,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Admin Users DELETE]', error);
        return NextResponse.json({ error: 'No se pudo eliminar el usuario.' }, { status: 500 });
    }
}
