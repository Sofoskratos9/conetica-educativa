"use client";

import { MOCK_STUDENT_DATA } from "@/lib/parent-data";
import {
    TrendingUp,
    Calendar,
    CheckCircle,
    AlertCircle,
    MessageCircle,
    Award
} from "lucide-react";

export default function ParentDashboardPage() {
    const data = MOCK_STUDENT_DATA;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Progreso de {data.studentName}</h1>
                    <p className="text-gray-500">Última actividad: {data.lastActive}</p>
                </div>
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <CheckCircle size={16} /> Plan Activo y al Día
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-8">

                {/* Column 1: Habits & Usage */}
                <div className="space-y-6">
                    {/* Study Habits Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="text-[var(--color-brand-500)]" size={20} /> Hábitos de Estudio
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">Racha Actual</span>
                                <span className="font-bold text-gray-900">{data.studyHabits.weeklyStreak} días</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">Promedio Diario</span>
                                <span className="font-bold text-gray-900">{data.studyHabits.averageDailyMinutes} min</span>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Consistencia</span>
                                    <span>{data.studyHabits.consistencyScore}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--color-brand-500)] rounded-full"
                                        style={{ width: `${data.studyHabits.consistencyScore}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Plan Usage Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle className="text-emerald-500" size={20} /> Uso del Plan
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900">{data.planUsage.completedModules}/{data.planUsage.totalModules}</div>
                                <div className="text-xs text-gray-500">Módulos</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900">{data.planUsage.weeklyTasksCompleted}/{data.planUsage.weeklyTasksTotal}</div>
                                <div className="text-xs text-gray-500">Tareas Semanales</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Academic Areas */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="text-blue-500" size={20} /> Áreas Académicas
                        </h3>
                        <div className="space-y-6">
                            {data.academicAreas.map((area) => (
                                <div key={area.name}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-gray-700">{area.name}</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${area.status === 'strong' ? 'bg-green-100 text-green-700' :
                                                area.status === 'improving' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {area.status === 'strong' ? 'Fortaleza' :
                                                area.status === 'improving' ? 'Mejorando' :
                                                    'Requiere Foco'}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${area.status === 'strong' ? 'bg-green-500' :
                                                    area.status === 'improving' ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                }`}
                                            style={{ width: `${area.score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Award size={16} className="text-purple-500" /> Avances Recientes
                            </h4>
                            <ul className="space-y-2">
                                {data.recentAchievements.map((achievement, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0"></span>
                                        {achievement}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Column 3: Home Support */}
                <div className="space-y-6">
                    <div className="bg-[var(--color-surface-50)] p-6 rounded-xl border border-[var(--color-brand-200)] h-full">
                        <h3 className="font-bold text-[var(--color-brand-900)] mb-6 flex items-center gap-2">
                            <MessageCircle className="text-[var(--color-brand-500)]" size={20} /> Sugerencias de Apoyo
                        </h3>
                        <div className="space-y-4">
                            {data.homeSupportSuggestions.map((suggestion, i) => (
                                <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <h4 className="font-bold text-gray-800 mb-1">{suggestion.title}</h4>
                                    <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                                    <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                                        <p className="text-xs font-bold text-blue-800 uppercase mb-1">Acción Recomendada</p>
                                        <p className="text-sm text-blue-900 italic">"{suggestion.actionItem}"</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                Estas sugerencias se basan en el rendimiento de esta semana.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
