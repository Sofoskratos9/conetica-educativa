import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';
import { ensurePostgresSchema, getDatabaseMode, getPgPool, logActivityEvent } from '@/lib/db';
import { sanitizeInput } from '@/lib/security/sanitization';

const RIASEC_LABELS: Record<string, string> = {
    R: 'Realista',
    I: 'Investigador',
    A: 'Artístico',
    S: 'Social',
    E: 'Emprendedor',
    C: 'Convencional',
};

const PatchInquirySchema = z.object({
    id: z.string().uuid(),
    status: z.enum(['new', 'contacted', 'demo_scheduled', 'closed']),
    notes: z.string().max(600).optional(),
});

export async function GET(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Acceso restringido a administradores.' }, { status: 403 });
    }

    const rangeParam = request.nextUrl.searchParams.get('range');
    const rangeDays = rangeParam === '90d' ? 90 : rangeParam === '30d' ? 30 : 7;

    const emptyPayload = {
        range: rangeParam === '90d' ? '90d' : rangeParam === '30d' ? '30d' : '7d',
        totalStudents: 0,
        totalParents: 0,
        premiumUsersCount: 0,
        customQuestionsCount: 0,
        totalRevenueMxn: 0,
        activeUsers: 0,
        retentionRate: 0,
        completionRate: 0,
        pendingAppointments: 0,
        totalAppointments: 0,
        schoolInquiriesCount: 0,
        moduleCompletionRates: [
            { name: 'Diagnóstico', rate: 0, count: 0 },
            { name: 'EXANI-II', rate: 0, count: 0 },
            { name: 'Vocacional', rate: 0, count: 0 },
            { name: 'Plan Estudio', rate: 0, count: 0 },
            { name: 'Bienestar', rate: 0, count: 0 },
        ],
        activityTrend: [
            { week: 'Sem 1', activos: 0, sesiones: 0 },
            { week: 'Sem 2', activos: 0, sesiones: 0 },
            { week: 'Sem 3', activos: 0, sesiones: 0 },
            { week: 'Sem 4', activos: 0, sesiones: 0 },
        ],
        studentsAtRisk: [],
        vocationalResults: [],
        psychometricResults: [],
        activityLogs: [],
        recentUsers: [],
        schoolInquiries: [],
    };

    if (getDatabaseMode() !== 'postgres') {
        return NextResponse.json(emptyPayload);
    }

    try {
        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) return NextResponse.json(emptyPayload);

        const [
            usersRes,
            progressRes,
            sessionsRes,
            tasksRes,
            appointmentsRes,
            inquiriesRes,
            logsRes,
            customQRes,
            txRes,
        ] = await Promise.all([
            pool.query<{
                id: string;
                name: string;
                email: string;
                role: string;
                is_premium: boolean;
                created_at: Date | string;
            }>(
                `SELECT id, name, email, role, is_premium, created_at
                 FROM users
                 ORDER BY created_at DESC`
            ),
            pool.query<{
                id: string;
                user_id: string;
                module_id: string;
                lesson_id: string;
                completed: boolean;
                score: string | null;
                payload: any;
                updated_at: Date | string;
            }>(
                `SELECT id, user_id, module_id, lesson_id, completed, score, payload, updated_at
                 FROM user_progress
                 ORDER BY updated_at DESC`
            ),
            pool.query<{
                id: string;
                user_id: string;
                module_id: string;
                duration_minutes: number;
                score: string | null;
                created_at: Date | string;
            }>(
                `SELECT id, user_id, module_id, duration_minutes, score, created_at
                 FROM study_sessions
                 ORDER BY created_at DESC
                 LIMIT 1000`
            ),
            pool.query<{
                user_id: string;
                completed: boolean;
                updated_at: Date | string;
            }>(`SELECT user_id, completed, updated_at FROM study_tasks`),
            pool.query<{ status: string }>(`SELECT status FROM appointments`),
            pool.query<{
                id: string;
                reference_id: string;
                name: string;
                school: string;
                position: string;
                email: string;
                phone: string;
                interest: string;
                status: string | null;
                notes: string | null;
                created_at: Date | string;
            }>(
                `SELECT id, reference_id, name, school, position, email, phone, interest, status, notes, created_at
                 FROM schools_inquiries
                 ORDER BY created_at DESC
                 LIMIT 30`
            ),
            pool.query<{
                id: string;
                user_id: string | null;
                user_name: string | null;
                event_type: string;
                action: string;
                status: string;
                created_at: Date | string;
            }>(
                `SELECT id, user_id, user_name, event_type, action, status, created_at
                 FROM activity_logs
                 ORDER BY created_at DESC
                 LIMIT 50`
            ),
            pool.query<{ cnt: string }>(`SELECT COUNT(*)::text AS cnt FROM exani_questions WHERE active = true`),
            pool.query<{ total: string | null }>(
                `SELECT COALESCE(SUM(amount), 0)::text AS total FROM transactions WHERE status = 'completed'`
            ),
        ]);

        const students = usersRes.rows.filter((u) => u.role === 'student');
        const parents = usersRes.rows.filter((u) => u.role === 'parent');
        const studentIdSet = new Set(students.map((s) => s.id));
        const userById = new Map(usersRes.rows.map((u) => [u.id, u]));

        const nowMs = Date.now();
        const rangeCutoffMs = nowMs - rangeDays * 24 * 60 * 60 * 1000;

        // Track last activity & module completion per student
        const lastActiveByStudent = new Map<string, number>();
        const activeInRange = new Set<string>();
        const scoresByStudent = new Map<string, number[]>();

        const moduleUsers: Record<'diagnostic' | 'exani' | 'vocational' | 'study_plan' | 'wellness', Set<string>> = {
            diagnostic: new Set(),
            exani: new Set(),
            vocational: new Set(),
            study_plan: new Set(),
            wellness: new Set(),
        };

        const touchActivity = (userId: string, dateVal: Date | string) => {
            if (!studentIdSet.has(userId)) return;
            const ts = new Date(dateVal).getTime();
            if (Number.isNaN(ts)) return;
            const prev = lastActiveByStudent.get(userId) || 0;
            if (ts > prev) lastActiveByStudent.set(userId, ts);
            if (ts >= rangeCutoffMs) activeInRange.add(userId);
        };

        progressRes.rows.forEach((p) => {
            touchActivity(p.user_id, p.updated_at);
            if (studentIdSet.has(p.user_id) && p.completed) {
                if (p.module_id === 'diagnostic') moduleUsers.diagnostic.add(p.user_id);
                if (p.module_id === 'exani') moduleUsers.exani.add(p.user_id);
                if (p.module_id === 'vocational') moduleUsers.vocational.add(p.user_id);
                if (p.module_id === 'wellness') moduleUsers.wellness.add(p.user_id);
            }
            if (studentIdSet.has(p.user_id) && p.score !== null && p.module_id !== 'vocational') {
                const list = scoresByStudent.get(p.user_id) || [];
                list.push(Number(p.score));
                scoresByStudent.set(p.user_id, list);
            }
        });

        sessionsRes.rows.forEach((s) => {
            touchActivity(s.user_id, s.created_at);
            if (studentIdSet.has(s.user_id)) {
                if (s.module_id === 'exani') moduleUsers.exani.add(s.user_id);
                if (s.module_id === 'pomodoro') moduleUsers.study_plan.add(s.user_id);
                if (s.score !== null && s.module_id !== 'vocational') {
                    const list = scoresByStudent.get(s.user_id) || [];
                    list.push(Number(s.score));
                    scoresByStudent.set(s.user_id, list);
                }
            }
        });

        tasksRes.rows.forEach((t) => {
            if (t.completed) {
                touchActivity(t.user_id, t.updated_at);
                if (studentIdSet.has(t.user_id)) {
                    moduleUsers.study_plan.add(t.user_id);
                }
            }
        });

        const totalStudents = students.length;
        const activeUsers = activeInRange.size;
        const retentionRate =
            totalStudents > 0 ? Math.round((activeUsers / totalStudents) * 100) : 0;

        const moduleCompletionRates = [
            {
                name: 'Diagnóstico',
                count: moduleUsers.diagnostic.size,
                rate: totalStudents > 0 ? Math.round((moduleUsers.diagnostic.size / totalStudents) * 100) : 0,
            },
            {
                name: 'EXANI-II',
                count: moduleUsers.exani.size,
                rate: totalStudents > 0 ? Math.round((moduleUsers.exani.size / totalStudents) * 100) : 0,
            },
            {
                name: 'Vocacional',
                count: moduleUsers.vocational.size,
                rate: totalStudents > 0 ? Math.round((moduleUsers.vocational.size / totalStudents) * 100) : 0,
            },
            {
                name: 'Plan Estudio',
                count: moduleUsers.study_plan.size,
                rate: totalStudents > 0 ? Math.round((moduleUsers.study_plan.size / totalStudents) * 100) : 0,
            },
            {
                name: 'Bienestar',
                count: moduleUsers.wellness.size,
                rate: totalStudents > 0 ? Math.round((moduleUsers.wellness.size / totalStudents) * 100) : 0,
            },
        ];

        const completionRate =
            totalStudents > 0
                ? Math.round(
                      moduleCompletionRates.reduce((acc, m) => acc + m.rate, 0) /
                          moduleCompletionRates.length
                  )
                : 0;

        // 4-week real trend (Sem 1 = 28..21d ago, Sem 4 = last 7d)
        const activityTrend = [3, 2, 1, 0].map((weekIdx, i) => {
            const endMs = nowMs - weekIdx * 7 * 24 * 60 * 60 * 1000;
            const startMs = endMs - 7 * 24 * 60 * 60 * 1000;
            const weekActive = new Set<string>();
            let sessionCount = 0;

            sessionsRes.rows.forEach((s) => {
                const ts = new Date(s.created_at).getTime();
                if (ts >= startMs && ts < endMs) {
                    sessionCount += 1;
                    if (studentIdSet.has(s.user_id)) weekActive.add(s.user_id);
                }
            });

            progressRes.rows.forEach((p) => {
                const ts = new Date(p.updated_at).getTime();
                if (ts >= startMs && ts < endMs && studentIdSet.has(p.user_id)) {
                    weekActive.add(p.user_id);
                }
            });

            return {
                week: `Sem ${i + 1}`,
                activos: weekActive.size,
                sesiones: sessionCount,
            };
        });

        // Students at risk: inactive > 7 days OR avg score < 60%
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
        const studentsAtRisk = students
            .map((student) => {
                const lastAct = lastActiveByStudent.get(student.id);
                const createdMs = new Date(student.created_at).getTime();
                const avgScores = scoresByStudent.get(student.id) || [];
                const avg =
                    avgScores.length > 0
                        ? Math.round(avgScores.reduce((a, b) => a + b, 0) / avgScores.length)
                        : null;

                let issue: string | null = null;
                if (avg !== null && avg < 60) {
                    issue = `Promedio bajo (${avg}%)`;
                } else if (lastAct && nowMs - lastAct > sevenDaysMs) {
                    const days = Math.floor((nowMs - lastAct) / (24 * 60 * 60 * 1000));
                    issue = `Sin actividad en ${days} días`;
                } else if (!lastAct && nowMs - createdMs > threeDaysMs) {
                    issue = 'Sin módulos iniciados tras registro';
                }

                if (!issue) return null;
                return {
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    issue,
                    lastActive: lastAct
                        ? new Date(lastAct).toISOString().slice(0, 10)
                        : new Date(student.created_at).toISOString().slice(0, 10),
                };
            })
            .filter((x): x is NonNullable<typeof x> => x !== null);

        // Real RIASEC Vocational Results
        const vocationalResults = progressRes.rows
            .filter((p) => p.module_id === 'vocational' && p.payload)
            .map((p) => {
                const owner = userById.get(p.user_id);
                const rawScores = (p.payload?.scores || {}) as Record<string, number>;
                const topCodes = Array.isArray(p.payload?.topCodes)
                    ? (p.payload.topCodes as string[])
                    : ['R', 'I'];
                const primaryCode = topCodes[0] || 'R';
                const secondaryCode = topCodes[1] || 'I';

                const radarScores = ['R', 'I', 'A', 'S', 'E', 'C'].map((code) => {
                    const val = Number(rawScores[code] || 0);
                    // Raw score from 3 questions per code (0..3) -> normalize to 0..100
                    const pct = val <= 3 ? Math.round((val / 3) * 100) : Math.min(100, Math.round(val));
                    return {
                        area: RIASEC_LABELS[code] || code,
                        value: pct,
                    };
                });

                return {
                    id: p.id,
                    student: owner?.name || 'Estudiante',
                    email: owner?.email || '',
                    date: String(p.payload?.date || p.updated_at).slice(0, 10),
                    primary: RIASEC_LABELS[primaryCode] || primaryCode,
                    secondary: RIASEC_LABELS[secondaryCode] || secondaryCode,
                    topCodes,
                    scores: radarScores,
                };
            });

        const pendingAppointments = appointmentsRes.rows.filter((a) => a.status === 'pending').length;

        const activityLogs = logsRes.rows.map((l) => ({
            id: l.id,
            trigger: l.event_type,
            userId: l.user_id || 'sistema',
            userName: l.user_name || 'Sistema Conética',
            action: l.action,
            timestamp: new Date(l.created_at).toLocaleString('es-MX', {
                dateStyle: 'short',
                timeStyle: 'short',
            }),
            status: l.status === 'failed' ? ('failed' as const) : ('success' as const),
        }));

        const recentUsers = usersRes.rows
            .filter((u) => u.role !== 'admin')
            .slice(0, 20)
            .map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                isPremium: Boolean(u.is_premium),
                createdAt: new Date(u.created_at).toISOString().slice(0, 10),
            }));

        const psychometricResults = progressRes.rows
            .filter((p) => p.module_id === 'psychometric' && p.payload)
            .map((p) => {
                const owner = userById.get(p.user_id);
                return {
                    id: p.id,
                    student: owner?.name || 'Estudiante',
                    email: owner?.email || '',
                    testId: String(p.payload?.testId || p.lesson_id),
                    testName: String(p.payload?.testName || p.lesson_id),
                    date: String(p.payload?.completedAt || p.updated_at).slice(0, 10),
                    globalPercentage: Number(p.payload?.globalPercentage ?? p.score ?? 0),
                    topDimension: String(p.payload?.topDimension || 'General'),
                    dimensions: Array.isArray(p.payload?.dimensions) ? p.payload.dimensions : [],
                };
            });

        const schoolInquiries = inquiriesRes.rows.map((s) => ({
            id: s.id,
            referenceId: s.reference_id,
            name: s.name,
            school: s.school,
            position: s.position,
            email: s.email,
            phone: s.phone,
            interest: s.interest,
            status: (s.status || 'new') as 'new' | 'contacted' | 'demo_scheduled' | 'closed',
            notes: s.notes || '',
            createdAt: new Date(s.created_at).toISOString().slice(0, 10),
        }));

        const premiumUsersCount = usersRes.rows.filter((u) => u.is_premium && u.role !== 'admin').length;
        const customQuestionsCount = Number(customQRes.rows[0]?.cnt || 0);
        const totalRevenueMxn = Number(txRes.rows[0]?.total || 0);

        return NextResponse.json({
            range: rangeParam === '90d' ? '90d' : rangeParam === '30d' ? '30d' : '7d',
            totalStudents,
            totalParents: parents.length,
            premiumUsersCount,
            customQuestionsCount,
            totalRevenueMxn,
            activeUsers,
            retentionRate,
            completionRate,
            pendingAppointments,
            totalAppointments: appointmentsRes.rows.length,
            schoolInquiriesCount: inquiriesRes.rows.length,
            moduleCompletionRates,
            activityTrend,
            studentsAtRisk,
            vocationalResults,
            psychometricResults,
            activityLogs,
            recentUsers,
            schoolInquiries,
        });
    } catch (error) {
        console.error('[Admin Overview GET]', error);
        return NextResponse.json(
            { error: 'No se pudieron calcular las analíticas de la plataforma.' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Acceso restringido a administradores.' }, { status: 403 });
    }

    if (getDatabaseMode() !== 'postgres') {
        return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });
    }

    try {
        const body = await request.json();
        const parsed = PatchInquirySchema.parse(body);

        await ensurePostgresSchema();
        const pool = getPgPool();
        if (!pool) return NextResponse.json({ error: 'Base de datos no disponible.' }, { status: 503 });

        const cleanNotes = parsed.notes !== undefined ? sanitizeInput(parsed.notes) : undefined;
        const res = await pool.query<{ school: string; reference_id: string }>(
            `UPDATE schools_inquiries
             SET status = $1, notes = COALESCE($2, notes)
             WHERE id = $3
             RETURNING school, reference_id`,
            [parsed.status, cleanNotes ?? null, parsed.id]
        );

        if (res.rowCount === 0) {
            return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 });
        }

        await logActivityEvent({
            userId: session.user.id,
            userName: session.user.name,
            eventType: 'admin_inquiry_updated',
            action: `Actualizó lead B2B ${res.rows[0].school} (${res.rows[0].reference_id}) a estado "${parsed.status}"`,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Estado o datos de solicitud inválidos.' }, { status: 400 });
        }
        console.error('[Admin Overview PATCH]', error);
        return NextResponse.json({ error: 'No se pudo actualizar la solicitud B2B.' }, { status: 500 });
    }
}
