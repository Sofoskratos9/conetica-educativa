"use client";

import { useState } from "react";
import { MOCK_STUDENT_DATA } from "@/lib/parent-data";
import {
    TrendingUp,
    Calendar,
    CheckCircle,
    MessageCircle,
    Award,
    Download,
    ChevronDown,
    ChevronUp,
    Flame,
} from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from "recharts";

export default function ParentDashboardPage() {
    const data = MOCK_STUDENT_DATA;
    const [showDetailedTable, setShowDetailedTable] = useState(true);

    const chartData = data.academicAreas.map((area) => ({
        name: area.name.replace("Pensamiento ", "P. ").replace("Comprensión ", "C. "),
        fullName: area.name,
        score: area.score,
        status: area.status,
    }));

    const handleDownloadReport = () => {
        const lines = [
            "Area Academica,Puntaje,Estado",
            ...data.academicAreas.map((a) => `"${a.name}",${a.score},${a.status}`),
        ];
        const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `reporte-familiar-${data.studentName.toLowerCase().replace(/\s+/g, "-")}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-brand-900)]">
                        Progreso de {data.studentName}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Última actividad: {data.lastActive}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                        <CheckCircle size={16} /> Plan Activo y al Día
                    </div>
                    <button
                        type="button"
                        onClick={handleDownloadReport}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                        <Download size={16} /> Exportar CSV
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Column 1: Habits & Usage */}
                <div className="space-y-6">
                    {/* Study Habits Card */}
                    <div className="surface-card p-6">
                        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Calendar className="text-[var(--color-brand-600)]" size={20} /> Hábitos de Estudio
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                                <span className="text-slate-700 text-sm flex items-center gap-1.5 font-medium">
                                    <Flame size={16} className="text-amber-500" /> Racha Actual
                                </span>
                                <span className="font-bold text-slate-900">{data.studyHabits.weeklyStreak} días</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 text-sm">Promedio Diario</span>
                                <span className="font-bold text-slate-900">{data.studyHabits.averageDailyMinutes} min</span>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                    <span>Consistencia semanal</span>
                                    <span className="font-semibold text-slate-700">{data.studyHabits.consistencyScore}%</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--color-brand-600)] rounded-full transition-all"
                                        style={{ width: `${data.studyHabits.consistencyScore}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Plan Usage Card */}
                    <div className="surface-card p-6">
                        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <CheckCircle className="text-emerald-600" size={20} /> Uso del Plan
                        </h2>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-2xl font-bold text-slate-900">
                                    {data.planUsage.completedModules}/{data.planUsage.totalModules}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Módulos</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-2xl font-bold text-slate-900">
                                    {data.planUsage.weeklyTasksCompleted}/{data.planUsage.weeklyTasksTotal}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Tareas Semanales</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Academic Areas */}
                <div className="space-y-6">
                    <div className="surface-card p-6 h-full flex flex-col">
                        <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
                            <TrendingUp className="text-[var(--color-brand-600)]" size={20} /> Áreas Académicas
                        </h2>
                        <div className="space-y-5 flex-1">
                            {data.academicAreas.map((area) => (
                                <div key={area.name}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="font-medium text-sm text-slate-700">{area.name}</span>
                                        <span
                                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                                area.status === "strong"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : area.status === "improving"
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {area.status === "strong"
                                                ? "Fortaleza"
                                                : area.status === "improving"
                                                ? "Mejorando"
                                                : "Requiere Foco"}
                                        </span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${
                                                area.status === "strong"
                                                    ? "bg-emerald-500"
                                                    : area.status === "improving"
                                                    ? "bg-amber-500"
                                                    : "bg-red-500"
                                            }`}
                                            style={{ width: `${area.score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-7 pt-5 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <Award size={16} className="text-purple-600" /> Avances Recientes
                            </h3>
                            <ul className="space-y-2">
                                {data.recentAchievements.map((achievement, i) => (
                                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                        {achievement}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Column 3: Home Support */}
                <div className="space-y-6">
                    <div className="bg-[var(--color-brand-50)] p-6 rounded-2xl border border-blue-200/70 h-full flex flex-col">
                        <h2 className="font-bold text-[var(--color-brand-900)] mb-5 flex items-center gap-2">
                            <MessageCircle className="text-[var(--color-brand-600)]" size={20} /> Sugerencias de Apoyo
                        </h2>
                        <div className="space-y-4 flex-1">
                            {data.homeSupportSuggestions.map((suggestion, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                                    <h3 className="font-bold text-slate-900 mb-1 text-sm">{suggestion.title}</h3>
                                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">{suggestion.description}</p>
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <p className="text-[11px] font-bold text-blue-800 uppercase mb-1">
                                            Acción Recomendada
                                        </p>
                                        <p className="text-xs text-blue-900 italic">
                                            &ldquo;{suggestion.actionItem}&rdquo;
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-5 text-center text-xs text-slate-500">
                            Basado en las sesiones y simulacros de esta semana.
                        </p>
                    </div>
                </div>
            </div>

            {/* Detailed Chart & Weekly Report Section */}
            <section id="reporte-detallado" className="surface-card p-6 md:p-8">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Reporte Detallado de Competencias
                        </h2>
                        <p className="text-sm text-slate-500">
                            Comparativa cuantitativa por área evaluada (escala 0–100%).
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowDetailedTable((v) => !v)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        {showDetailedTable ? (
                            <>
                                Ocultar detalle <ChevronUp size={14} />
                            </>
                        ) : (
                            <>
                                Mostrar detalle <ChevronDown size={14} />
                            </>
                        )}
                    </button>
                </div>

                {showDetailedTable && (
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#475569" }} unit="%" />
                                <Tooltip
                                    formatter={(value) => [`${value ?? 0}%`, "Dominio"]}
                                    labelFormatter={(_, payload) =>
                                        payload?.[0]?.payload?.fullName || ""
                                    }
                                    contentStyle={{
                                        borderRadius: "0.75rem",
                                        borderColor: "#e2e8f0",
                                        fontSize: "0.875rem",
                                    }}
                                />
                                <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={56}>
                                    {chartData.map((entry, idx) => (
                                        <Cell
                                            key={idx}
                                            fill={
                                                entry.status === "strong"
                                                    ? "#10b981"
                                                    : entry.status === "improving"
                                                    ? "#f59e0b"
                                                    : "#ef4444"
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </section>
        </div>
    );
}
