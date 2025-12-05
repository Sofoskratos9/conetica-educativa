export interface StudentProgress {
    studentName: string;
    lastActive: string;
    studyHabits: {
        weeklyStreak: number;
        averageDailyMinutes: number;
        consistencyScore: number; // 0-100
    };
    planUsage: {
        completedModules: number;
        totalModules: number;
        weeklyTasksCompleted: number;
        weeklyTasksTotal: number;
    };
    academicAreas: {
        name: string;
        status: 'strong' | 'improving' | 'needs_focus';
        score: number; // 0-100 (simulated)
    }[];
    recentAchievements: string[];
    homeSupportSuggestions: {
        title: string;
        description: string;
        actionItem: string;
    }[];
}

export const MOCK_STUDENT_DATA: StudentProgress = {
    studentName: "Miguel López",
    lastActive: "Hace 2 horas",
    studyHabits: {
        weeklyStreak: 4,
        averageDailyMinutes: 45,
        consistencyScore: 85
    },
    planUsage: {
        completedModules: 3,
        totalModules: 6,
        weeklyTasksCompleted: 12,
        weeklyTasksTotal: 15
    },
    academicAreas: [
        { name: "Pensamiento Matemático", status: "needs_focus", score: 65 },
        { name: "Comprensión Lectora", status: "strong", score: 92 },
        { name: "Redacción Indirecta", status: "improving", score: 78 },
        { name: "Inglés", status: "strong", score: 88 }
    ],
    recentAchievements: [
        "Completó el módulo de Diagnóstico",
        "Mantuvo una racha de estudio de 4 días",
        "Mejoró 10% en simulacros de Matemáticas"
    ],
    homeSupportSuggestions: [
        {
            title: "Refuerzo Positivo",
            description: "Miguel ha sido muy consistente esta semana. Reconocer su esfuerzo ayuda a consolidar el hábito.",
            actionItem: "Comenta: 'He notado que has estudiado 4 días seguidos, ¡gran trabajo manteniendo la constancia!'"
        },
        {
            title: "Apoyo en Matemáticas",
            description: "Es el área que requiere más atención actualmente. No necesita que le enseñes, solo que facilites el ambiente.",
            actionItem: "Pregunta: '¿Tienes todo lo que necesitas para tus ejercicios de matemáticas de hoy?'"
        },
        {
            title: "Gestión del Descanso",
            description: "El descanso es parte del aprendizaje. Asegúrate de que duerma bien antes de sus simulacros.",
            actionItem: "Sugiere una actividad relajante (sin pantallas) 30 minutos antes de dormir."
        }
    ]
};
