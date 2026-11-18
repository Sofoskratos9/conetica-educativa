// Adapted from Sofoskratos9/Odisea-del-pensamiento (GameContext.jsx) & Historia-pensamiento (gamification.js)
// Strictly computed from real persisted Postgres telemetry — never fabricated.
import type { StudentProgressSnapshot } from './analytics-server';

export interface BadgeItem {
    id: string;
    name: string;
    description: string;
    category: 'academico' | 'habitos' | 'bienestar' | 'exploracion';
    unlocked: boolean;
    xpBonus: number;
}

export interface GamificationSummary {
    totalXp: number;
    level: number;
    levelName: string;
    nextLevelXp: number | null;
    progressToNextPct: number;
    unlockedCount: number;
    badges: BadgeItem[];
}

const LEVEL_THRESHOLDS = [0, 100, 250, 450, 750, 1100] as const;

const LEVEL_NAMES = [
    'Aprendiz Navegante',
    'Explorador Curioso',
    'Estratega Académico',
    'Pensador Crítico',
    'Dominio EXANI',
    'Maestro Conética',
] as const;

export function computeRealGamification(progress: StudentProgressSnapshot): GamificationSummary {
    const psychometricCount = progress.psychometricResults?.length ?? 0;

    const badges: BadgeItem[] = [
        {
            id: 'first_diagnostic',
            name: 'Mapa Cognitivo',
            description: 'Completaste tu Diagnóstico Cognitivo-Académico inicial.',
            category: 'academico',
            unlocked: Boolean(progress.diagnostic),
            xpBonus: 60,
        },
        {
            id: 'exani_rookie',
            name: 'Primer Simulacro EXANI',
            description: 'Completaste al menos una evaluación en el simulador EXANI-II.',
            category: 'academico',
            unlocked: progress.exaniLastScore !== null,
            xpBonus: 70,
        },
        {
            id: 'exani_competitive',
            name: 'Puntaje Competitivo UAA',
            description: 'Alcanzaste 1,050+ puntos proyectados en escala CENEVAL.',
            category: 'academico',
            unlocked: (progress.exaniLastScore ?? 0) >= 1050,
            xpBonus: 120,
        },
        {
            id: 'vocational_explorer',
            name: 'Brújula Vocacional',
            description: 'Descubriste tu código de afinidad profesional RIASEC.',
            category: 'exploracion',
            unlocked: Boolean(progress.vocational),
            xpBonus: 60,
        },
        {
            id: 'psychometric_insight',
            name: 'Autoconocimiento Psicométrico',
            description: 'Completaste al menos un inventario psicométrico validado (EDAOM/VAK/CHASIDE/Bar-On).',
            category: 'exploracion',
            unlocked: psychometricCount >= 1,
            xpBonus: 80,
        },
        {
            id: 'planner_starter',
            name: 'Estratega de Metas',
            description: 'Completaste 3 o más metas reales en tu Plan de Estudio.',
            category: 'habitos',
            unlocked: progress.tasksCompleted >= 3,
            xpBonus: 55,
        },
        {
            id: 'pomodoro_focus',
            name: 'Enfoque Profundo',
            description: 'Acumulaste 60+ minutos reales de estudio cronometrado.',
            category: 'habitos',
            unlocked: progress.totalStudyMinutes >= 60,
            xpBonus: 75,
        },
        {
            id: 'streak_3',
            name: 'Racha Imparable (3+ días)',
            description: 'Mantuviste actividad real al menos 3 días consecutivos.',
            category: 'habitos',
            unlocked: progress.currentStreak >= 3,
            xpBonus: 90,
        },
        {
            id: 'wellness_calm',
            name: 'Mente Regulada',
            description: 'Practicaste estrategias de autorregulación y calma pre-examen.',
            category: 'bienestar',
            unlocked: progress.wellnessCompletedIds.length >= 1,
            xpBonus: 50,
        },
        {
            id: 'conetica_route',
            name: 'Ruta Completa Conética',
            description: 'Completaste los 5 módulos esenciales de preparación.',
            category: 'academico',
            unlocked: progress.modulesCompleted >= progress.totalModules,
            xpBonus: 150,
        },
    ];

    const badgeXp = badges.filter((b) => b.unlocked).reduce((s, b) => s + b.xpBonus, 0);
    const activityXp =
        progress.tasksCompleted * 15 +
        Math.floor(progress.totalStudyMinutes / 10) * 5 +
        psychometricCount * 40 +
        progress.wellnessCompletedIds.length * 15;

    const totalXp = badgeXp + activityXp;

    let levelIdx = 0;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalXp >= LEVEL_THRESHOLDS[i]) {
            levelIdx = i;
            break;
        }
    }

    const currentFloor = LEVEL_THRESHOLDS[levelIdx];
    const nextFloor = levelIdx < LEVEL_THRESHOLDS.length - 1 ? LEVEL_THRESHOLDS[levelIdx + 1] : null;
    const progressToNextPct =
        nextFloor !== null
            ? Math.min(100, Math.round(((totalXp - currentFloor) / (nextFloor - currentFloor)) * 100))
            : 100;

    return {
        totalXp,
        level: levelIdx + 1,
        levelName: LEVEL_NAMES[levelIdx],
        nextLevelXp: nextFloor,
        progressToNextPct,
        unlockedCount: badges.filter((b) => b.unlocked).length,
        badges,
    };
}
