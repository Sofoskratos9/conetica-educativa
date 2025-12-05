export interface WeeklyProgress {
    day: string;
    minutes: number;
    tasksCompleted: number;
}

export interface PerformanceRecord {
    id: string;
    date: string;
    module: string;
    score: number;
    total: number;
    type: 'quiz' | 'simulation' | 'exercise';
}

export interface StudentMetrics {
    weeklyActivity: WeeklyProgress[];
    totalStudyHours: number;
    modulesCompleted: number;
    totalModules: number;
    currentStreak: number;
    averageScore: number;
    performanceHistory: PerformanceRecord[];
    recommendations: string[];
}

export interface AdminAnalytics {
    totalStudents: number;
    activeUsers24h: number;
    averageRetentionRate: number;
    studentsAtRisk: {
        id: string;
        name: string;
        issue: string;
        lastActive: string;
    }[];
    moduleCompletionRates: {
        name: string;
        rate: number;
    }[];
}

// Mock Data for Student
export const MOCK_STUDENT_METRICS: StudentMetrics = {
    weeklyActivity: [
        { day: 'Lun', minutes: 45, tasksCompleted: 3 },
        { day: 'Mar', minutes: 60, tasksCompleted: 4 },
        { day: 'Mié', minutes: 30, tasksCompleted: 2 },
        { day: 'Jue', minutes: 90, tasksCompleted: 6 },
        { day: 'Vie', minutes: 0, tasksCompleted: 0 },
        { day: 'Sáb', minutes: 120, tasksCompleted: 8 },
        { day: 'Dom', minutes: 45, tasksCompleted: 3 },
    ],
    totalStudyHours: 42,
    modulesCompleted: 4,
    totalModules: 10,
    currentStreak: 2,
    averageScore: 88,
    performanceHistory: [
        { id: '1', date: '2025-12-01', module: 'Pensamiento Matemático', score: 85, total: 100, type: 'simulation' },
        { id: '2', date: '2025-12-03', module: 'Comprensión Lectora', score: 92, total: 100, type: 'quiz' },
        { id: '3', date: '2025-12-04', module: 'Redacción Indirecta', score: 78, total: 100, type: 'exercise' },
    ],
    recommendations: [
        "Tu rendimiento en Redacción Indirecta bajó un poco. Repasa el tema de 'Concordancia'.",
        "¡Gran racha el jueves! Intenta mantener sesiones de 90 minutos para maximizar la retención.",
        "Estás a 2 módulos de completar la fase 1. ¡Sigue así!"
    ]
};

// Mock Data for Admin
export const MOCK_ADMIN_ANALYTICS: AdminAnalytics = {
    totalStudents: 1250,
    activeUsers24h: 450,
    averageRetentionRate: 78,
    studentsAtRisk: [
        { id: 'u1', name: 'Juan Pérez', issue: 'Inactivo por 7 días', lastActive: '2025-11-28' },
        { id: 'u2', name: 'Maria Lopez', issue: 'Promedio bajo en Matemáticas', lastActive: '2025-12-04' },
        { id: 'u3', name: 'Pedro Gomez', issue: 'No ha completado diagnóstico', lastActive: '2025-12-01' },
    ],
    moduleCompletionRates: [
        { name: 'Diagnóstico', rate: 95 },
        { name: 'Matemáticas', rate: 60 },
        { name: 'Lectura', rate: 85 },
        { name: 'Vocacional', rate: 40 },
    ]
};
