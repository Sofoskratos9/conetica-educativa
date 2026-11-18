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

// Nota (18 Nov 2026): los datos de ejemplo MOCK_* que vivían aquí se retiraron.
// Eran código muerto (ningún dashboard los importaba desde el commit 10a3290 del remoto);
// los dashboards leen de Postgres real vía /api/*. Las interfaces de arriba se conservan.
