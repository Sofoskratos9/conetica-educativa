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

// Nota (18 Nov 2026): los datos de ejemplo MOCK_* que vivían aquí se retiraron.
// Eran código muerto (ningún dashboard los importaba desde el commit 10a3290 del remoto);
// los dashboards leen de Postgres real vía /api/*. Las interfaces de arriba se conservan.
