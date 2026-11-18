import { ensurePostgresSchema, getDatabaseMode, getPgPool } from './db';
import { DIAGNOSTIC_AREA_META, type DiagnosticArea } from './diagnostic-data';

export interface StudentProgressSnapshot {
    totalStudyHours: number;
    totalStudyMinutes: number;
    modulesCompleted: number;
    totalModules: number;
    currentStreak: number;
    averageScore: number | null;
    consistencyScore: number;
    exaniLastScore: number | null;
    pomodoroCyclesToday: number;
    lastActive: string | null;
    diagnostic: {
        completedAt: string;
        overall: number;
        scores: Record<DiagnosticArea, number>;
    } | null;
    vocational: {
        date: string;
        scores: Record<string, number>;
        topCodes: string[];
        suggestedCareers: unknown[];
    } | null;
    wellnessCompletedIds: string[];
    tasksTotal: number;
    tasksCompleted: number;
    weeklyActivity: {
        day: string;
        minutes: number;
        tasksCompleted: number;
    }[];
    monthlyActivity: {
        name: string;
        minutos: number;
        tareas: number;
    }[];
    academicAreas: {
        name: string;
        score: number;
        status: 'strong' | 'improving' | 'needs_focus';
    }[];
    performanceHistory: {
        id: string;
        date: string;
        module: string;
        score: number;
        total: number;
        type: string;
    }[];
    psychometricResults: {
        testId: string;
        testName: string;
        completedAt: string;
        globalPercentage: number;
        topDimension: string;
        recommendation: string;
        dimensions: {
            dimension: string;
            label: string;
            percentage: number;
            level: 'alto' | 'medio' | 'bajo';
            interpretation: string;
        }[];
    }[];
    recommendations: string[];
}

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function computeStreakDays(dateKeys: Set<string>): number {
    if (dateKeys.size === 0) return 0;
    const today = new Date();
    const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    const keyFor = (d: Date) => d.toISOString().slice(0, 10);
    if (!dateKeys.has(keyFor(cursor))) {
        cursor.setUTCDate(cursor.getUTCDate() - 1);
        if (!dateKeys.has(keyFor(cursor))) return 0;
    }

    let streak = 0;
    while (dateKeys.has(keyFor(cursor))) {
        streak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return streak;
}

export async function getStudentProgressSnapshot(userId: string): Promise<StudentProgressSnapshot> {
    const emptySnapshot: StudentProgressSnapshot = {
        totalStudyHours: 0,
        totalStudyMinutes: 0,
        modulesCompleted: 0,
        totalModules: 5,
        currentStreak: 0,
        averageScore: null,
        consistencyScore: 0,
        exaniLastScore: null,
        pomodoroCyclesToday: 0,
        lastActive: null,
        diagnostic: null,
        vocational: null,
        wellnessCompletedIds: [],
        tasksTotal: 0,
        tasksCompleted: 0,
        weeklyActivity: Array.from({ length: 7 }, (_, idx) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - idx));
            return { day: DAY_LABELS[d.getDay()], minutes: 0, tasksCompleted: 0 };
        }),
        monthlyActivity: [
            { name: 'Sem 1', minutos: 0, tareas: 0 },
            { name: 'Sem 2', minutos: 0, tareas: 0 },
            { name: 'Sem 3', minutos: 0, tareas: 0 },
            { name: 'Sem 4', minutos: 0, tareas: 0 },
        ],
        academicAreas: [],
        performanceHistory: [],
        psychometricResults: [],
        recommendations: [
            'Completa tu Diagnóstico Cognitivo-Académico inicial para obtener métricas y prioridades reales.',
            'Realiza una práctica en el Simulador EXANI-II para estimar tu puntaje CENEVAL.',
            'Registra tus metas semanales en Plan de Estudio y usa el temporizador Pomodoro.',
        ],
    };

    if (getDatabaseMode() !== 'postgres') {
        return emptySnapshot;
    }

    await ensurePostgresSchema();
    const pool = getPgPool();
    if (!pool) return emptySnapshot;

    const [progressRes, sessionsRes, tasksRes] = await Promise.all([
        pool.query<{
            id: string;
            module_id: string;
            lesson_id: string;
            completed: boolean;
            score: string | null;
            payload: any;
            updated_at: Date | string;
        }>(
            `SELECT id, module_id, lesson_id, completed, score, payload, updated_at
             FROM user_progress
             WHERE user_id = $1
             ORDER BY updated_at DESC`,
            [userId]
        ),
        pool.query<{
            id: string;
            module_id: string;
            duration_minutes: number;
            session_type: string;
            score: string | null;
            meta: any;
            created_at: Date | string;
        }>(
            `SELECT id, module_id, duration_minutes, session_type, score, meta, created_at
             FROM study_sessions
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 200`,
            [userId]
        ),
        pool.query<{
            id: string;
            completed: boolean;
            updated_at: Date | string;
        }>(
            `SELECT id, completed, updated_at FROM study_tasks WHERE user_id = $1`,
            [userId]
        ),
    ]);

    const diagnosticRow = progressRes.rows.find((r) => r.module_id === 'diagnostic');
    const vocationalRow = progressRes.rows.find((r) => r.module_id === 'vocational');
    const wellnessRows = progressRes.rows.filter((r) => r.module_id === 'wellness' && r.completed);
    const exaniProgressRows = progressRes.rows.filter((r) => r.module_id === 'exani');
    const psychometricRows = progressRes.rows.filter((r) => r.module_id === 'psychometric' && r.payload);

    const psychometricResults: StudentProgressSnapshot['psychometricResults'] = psychometricRows.map((row) => ({
        testId: String(row.payload?.testId || row.lesson_id),
        testName: String(row.payload?.testName || row.lesson_id),
        completedAt: String(row.payload?.completedAt || new Date(row.updated_at).toISOString()),
        globalPercentage: Number(row.payload?.globalPercentage ?? row.score ?? 0),
        topDimension: String(row.payload?.topDimension || 'General'),
        recommendation: String(row.payload?.recommendation || ''),
        dimensions: Array.isArray(row.payload?.dimensions) ? row.payload.dimensions : [],
    }));

    const diagnostic = diagnosticRow?.payload
        ? {
              completedAt: String(diagnosticRow.payload.completedAt || new Date(diagnosticRow.updated_at).toISOString()),
              overall: Number(diagnosticRow.payload.overall ?? diagnosticRow.score ?? 0),
              scores: diagnosticRow.payload.scores as Record<DiagnosticArea, number>,
          }
        : null;

    const vocational = vocationalRow?.payload
        ? {
              date: String(vocationalRow.payload.date || new Date(vocationalRow.updated_at).toISOString()),
              scores: vocationalRow.payload.scores || {},
              topCodes: Array.isArray(vocationalRow.payload.topCodes) ? vocationalRow.payload.topCodes : [],
              suggestedCareers: Array.isArray(vocationalRow.payload.suggestedCareers)
                  ? vocationalRow.payload.suggestedCareers
                  : [],
          }
        : null;

    const exaniSessions = sessionsRes.rows.filter((s) => s.module_id === 'exani');
    const latestExani = exaniSessions[0];
    const exaniLastScore = latestExani?.meta?.cenevalScore
        ? Number(latestExani.meta.cenevalScore)
        : null;

    const todayKey = new Date().toISOString().slice(0, 10);
    const pomodoroCyclesToday = sessionsRes.rows.filter(
        (s) =>
            s.module_id === 'pomodoro' &&
            new Date(s.created_at).toISOString().slice(0, 10) === todayKey
    ).length;

    const totalStudyMinutes = sessionsRes.rows.reduce(
        (acc, s) => acc + (Number(s.duration_minutes) || 0),
        0
    );
    const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;

    const tasksTotal = tasksRes.rows.length;
    const tasksCompleted = tasksRes.rows.filter((t) => t.completed).length;

    const hasDiagnostic = Boolean(diagnostic);
    const hasExani = exaniSessions.length > 0 || exaniProgressRows.length > 0;
    const hasVocational = Boolean(vocational);
    const hasStudyPlan = tasksCompleted > 0 || sessionsRes.rows.some((s) => s.module_id === 'pomodoro');
    const hasWellness = wellnessRows.length > 0;

    const modulesCompleted = [
        hasDiagnostic,
        hasExani,
        hasVocational,
        hasStudyPlan,
        hasWellness,
    ].filter(Boolean).length;

    // Active days for streak & 7-day consistency
    const activeDates = new Set<string>();
    const minutesByDate = new Map<string, number>();
    const tasksByDate = new Map<string, number>();

    sessionsRes.rows.forEach((s) => {
        const key = new Date(s.created_at).toISOString().slice(0, 10);
        activeDates.add(key);
        minutesByDate.set(key, (minutesByDate.get(key) || 0) + (Number(s.duration_minutes) || 0));
    });
    progressRes.rows.forEach((p) => {
        const key = new Date(p.updated_at).toISOString().slice(0, 10);
        activeDates.add(key);
    });
    tasksRes.rows.forEach((t) => {
        if (t.completed) {
            const key = new Date(t.updated_at).toISOString().slice(0, 10);
            activeDates.add(key);
            tasksByDate.set(key, (tasksByDate.get(key) || 0) + 1);
        }
    });

    const currentStreak = computeStreakDays(activeDates);

    const now = new Date();
    const weeklyActivity = Array.from({ length: 7 }, (_, idx) => {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (6 - idx)));
        const key = d.toISOString().slice(0, 10);
        return {
            day: DAY_LABELS[d.getUTCDay()],
            minutes: minutesByDate.get(key) || 0,
            tasksCompleted: tasksByDate.get(key) || 0,
        };
    });

    const activeDaysLast7 = Array.from({ length: 7 }, (_, idx) => {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - idx));
        return activeDates.has(d.toISOString().slice(0, 10));
    }).filter(Boolean).length;
    const consistencyScore = Math.round((activeDaysLast7 / 7) * 100);

    // 4-week breakdown (Sem 1 = oldest .. Sem 4 = most recent 7 days)
    const monthlyActivity = [3, 2, 1, 0].map((weekOffset, idx) => {
        let mins = 0;
        let tCount = 0;
        for (let dayOff = 0; dayOff < 7; dayOff++) {
            const d = new Date(
                Date.UTC(
                    now.getUTCFullYear(),
                    now.getUTCMonth(),
                    now.getUTCDate() - (weekOffset * 7 + dayOff)
                )
            );
            const key = d.toISOString().slice(0, 10);
            mins += minutesByDate.get(key) || 0;
            tCount += tasksByDate.get(key) || 0;
        }
        return {
            name: `Sem ${idx + 1}`,
            minutos: mins,
            tareas: tCount,
        };
    });

    // Average score across completed diagnostics and EXANI attempts (0-100%)
    const scoreSamples: number[] = [];
    if (diagnostic) scoreSamples.push(diagnostic.overall);
    exaniSessions.forEach((s) => {
        if (s.score !== null && s.score !== undefined) {
            scoreSamples.push(Number(s.score));
        }
    });
    const averageScore =
        scoreSamples.length > 0
            ? Math.round(scoreSamples.reduce((a, b) => a + b, 0) / scoreSamples.length)
            : null;

    // Academic areas breakdown from real diagnostic & EXANI sessions
    const academicAreas: StudentProgressSnapshot['academicAreas'] = [];
    if (diagnostic?.scores) {
        (Object.entries(diagnostic.scores) as [DiagnosticArea, number][]).forEach(([area, val]) => {
            academicAreas.push({
                name: DIAGNOSTIC_AREA_META[area].label,
                score: Math.round(val),
                status: val >= 75 ? 'strong' : val >= 55 ? 'improving' : 'needs_focus',
            });
        });
    }
    exaniProgressRows.forEach((row) => {
        if (row.score !== null) {
            const val = Math.round(Number(row.score));
            academicAreas.push({
                name: `EXANI: ${row.lesson_id}`,
                score: val,
                status: val >= 75 ? 'strong' : val >= 55 ? 'improving' : 'needs_focus',
            });
        }
    });

    // Real evaluation history
    const performanceHistory: StudentProgressSnapshot['performanceHistory'] = [];
    if (diagnostic) {
        performanceHistory.push({
            id: diagnosticRow!.id,
            date: diagnostic.completedAt.slice(0, 10),
            module: 'Diagnóstico Cognitivo-Académico',
            score: diagnostic.overall,
            total: 100,
            type: 'diagnóstico',
        });
    }
    exaniSessions.slice(0, 20).forEach((s) => {
        const pct = Math.round(Number(s.score ?? 0));
        performanceHistory.push({
            id: s.id,
            date: new Date(s.created_at).toISOString().slice(0, 10),
            module: s.meta?.area ? `EXANI-II (${s.meta.area})` : 'Simulador EXANI-II',
            score: pct,
            total: 100,
            type: 'simulador',
        });
    });
    if (vocational) {
        performanceHistory.push({
            id: vocationalRow!.id,
            date: vocational.date.slice(0, 10),
            module: `Test Vocacional RIASEC (${vocational.topCodes.join('-')})`,
            score: 100,
            total: 100,
            type: 'vocacional',
        });
    }
    psychometricRows.forEach((row) => {
        performanceHistory.push({
            id: row.id,
            date: String(row.payload?.completedAt || row.updated_at).slice(0, 10),
            module: String(row.payload?.testName || row.lesson_id),
            score: Math.round(Number(row.payload?.globalPercentage ?? row.score ?? 0)),
            total: 100,
            type: 'psicometría',
        });
    });
    performanceHistory.sort((a, b) => (a.date < b.date ? 1 : -1));

    // Real recommendations based on actual user state
    const recommendations: string[] = [];
    if (!diagnostic) {
        recommendations.push('Completa el Diagnóstico Cognitivo-Académico para detectar tus áreas prioritarias.');
    } else {
        const lowestArea = (Object.entries(diagnostic.scores) as [DiagnosticArea, number][]).sort(
            ([, a], [, b]) => a - b
        )[0];
        if (lowestArea) {
            recommendations.push(
                `Tu área con mayor oportunidad es ${DIAGNOSTIC_AREA_META[lowestArea[0]].label} (${lowestArea[1]}%): ${DIAGNOSTIC_AREA_META[lowestArea[0]].recommendation}`
            );
        }
    }
    if (exaniSessions.length === 0) {
        recommendations.push('Realiza tu primer simulacro EXANI-II para estimar tu puntaje en escala CENEVAL.');
    } else if (exaniLastScore !== null && exaniLastScore < 1100) {
        recommendations.push(`Tu último puntaje estimado fue ${exaniLastScore}. Practica reactivos específicos por área para subir arriba de 1,150.`);
    }
    if (!vocational) {
        recommendations.push('Responde el Test Vocacional RIASEC para descubrir carreras afines a tu perfil.');
    }
    if (tasksTotal === 0) {
        recommendations.push('Agrega metas semanales en Plan de Estudio y completa ciclos Pomodoro para construir tu racha.');
    }

    const latestTimestamps = [
        ...sessionsRes.rows.map((r) => new Date(r.created_at).getTime()),
        ...progressRes.rows.map((r) => new Date(r.updated_at).getTime()),
    ].filter((n) => !Number.isNaN(n));

    const lastActive =
        latestTimestamps.length > 0
            ? new Date(Math.max(...latestTimestamps)).toISOString()
            : null;

    return {
        totalStudyHours,
        totalStudyMinutes,
        modulesCompleted,
        totalModules: 5,
        currentStreak,
        averageScore,
        consistencyScore,
        exaniLastScore,
        pomodoroCyclesToday,
        lastActive,
        diagnostic,
        vocational,
        wellnessCompletedIds: wellnessRows.map((w) => w.lesson_id),
        tasksTotal,
        tasksCompleted,
        weeklyActivity,
        monthlyActivity,
        academicAreas,
        performanceHistory,
        psychometricResults,
        recommendations,
    };
}
