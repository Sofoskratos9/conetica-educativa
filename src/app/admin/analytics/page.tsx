"use client";

import { useState } from "react";
import { MOCK_ADMIN_ANALYTICS } from "@/lib/metrics-data";
import { Users, Activity, UserMinus, AlertTriangle, TrendingUp, Download, X } from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

const RANGE_MULTIPLIERS = {
    "7d": { label: "Últimos 7 días", activeFactor: 1, retentionOffset: 0 },
    "30d": { label: "Últimos 30 días", activeFactor: 1.4, retentionOffset: 4 },
    "90d": { label: "Últimos 90 días", activeFactor: 1.85, retentionOffset: 7 },
} as const;

const RETENTION_SERIES = [
    { week: "Sem 1", activos: 340, retencion: 72 },
    { week: "Sem 2", activos: 380, retencion: 74 },
    { week: "Sem 3", activos: 410, retencion: 76 },
    { week: "Sem 4", activos: 450, retencion: 78 },
];

const EXTENDED_RISK_STUDENTS = [
    ...MOCK_ADMIN_ANALYTICS.studentsAtRisk,
    { id: "u4", name: "Lucía Hernández", issue: "Sin simulacros en 10 días", lastActive: "2025-11-26" },
    { id: "u5", name: "Diego Morales", issue: "Puntaje < 60% en Lectura", lastActive: "2025-12-02" },
];

export default function AdminAnalyticsPage() {
    const data = MOCK_ADMIN_ANALYTICS;
    const [range, setRange] = useState<keyof typeof RANGE_MULTIPLIERS>("7d");
    const [showAllModal, setShowAllModal] = useState(false);

    const cfg = RANGE_MULTIPLIERS[range];
    const displayedActive = Math.min(data.totalStudents, Math.round(data.activeUsers24h * cfg.activeFactor));
    const displayedRetention = Math.min(99, data.averageRetentionRate + cfg.retentionOffset);

    const handleExportCSV = () => {
        const rows = [
            "Metrica,Valor",
            `Rango,"${cfg.label}"`,
            `Estudiantes Totales,${data.totalStudents}`,
            `Usuarios Activos,${displayedActive}`,
            `Tasa de Retencion,${displayedRetention}%`,
            "",
            "Modulo,Finalizacion (%)",
            ...data.moduleCompletionRates.map((m) => `"${m.name}",${m.rate}`),
        ];
        const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `conetica-analytics-${range}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analíticas de la Plataforma</h1>
                    <p className="text-sm text-slate-500">Métricas de retención, finalización y alertas tempranas.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value as keyof typeof RANGE_MULTIPLIERS)}
                        aria-label="Seleccionar rango de fechas"
                        className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
                    >
                        <option value="7d">Últimos 7 días</option>
                        <option value="30d">Últimos 30 días</option>
                        <option value="90d">Últimos 90 días</option>
                    </select>
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[var(--color-brand-600)] text-white rounded-xl hover:bg-[var(--color-brand-700)] transition-colors"
                    >
                        <Download size={16} /> Exportar Reporte
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="surface-card p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-sm text-slate-500 font-medium">Estudiantes Totales</div>
                            <div className="text-3xl font-bold text-slate-900 mt-1">{data.totalStudents.toLocaleString()}</div>
                        </div>
                        <div className="p-2.5 bg-blue-50 text-[var(--color-brand-600)] rounded-xl">
                            <Users size={22} />
                        </div>
                    </div>
                    <div className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                        <TrendingUp size={14} /> +12% vs periodo anterior
                    </div>
                </div>

                <div className="surface-card p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-sm text-slate-500 font-medium">Usuarios Activos ({cfg.label})</div>
                            <div className="text-3xl font-bold text-slate-900 mt-1">{displayedActive}</div>
                        </div>
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Activity size={22} />
                        </div>
                    </div>
                    <div className="text-sm text-slate-500">
                        {Math.round((displayedActive / data.totalStudents) * 100)}% de la matrícula total
                    </div>
                </div>

                <div className="surface-card p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-sm text-slate-500 font-medium">Tasa de Retención</div>
                            <div className="text-3xl font-bold text-slate-900 mt-1">{displayedRetention}%</div>
                        </div>
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                            <UserMinus size={22} />
                        </div>
                    </div>
                    <div className="text-sm text-slate-500">
                        Promedio del sector EdTech: 65%
                    </div>
                </div>
            </div>

            {/* Interactive Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="surface-card p-6">
                    <h2 className="font-bold text-slate-900 mb-1">Finalización por Módulo</h2>
                    <p className="text-xs text-slate-500 mb-6">Porcentaje de estudiantes que completan cada etapa.</p>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.moduleCompletionRates} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#475569" }} unit="%" />
                                <Tooltip
                                    formatter={(v) => [`${v ?? 0}%`, "Finalización"]}
                                    contentStyle={{ borderRadius: "0.75rem", borderColor: "#e2e8f0" }}
                                />
                                <Bar dataKey="rate" fill="#2563eb" radius={[8, 8, 0, 0]} maxBarSize={48} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="surface-card p-6">
                    <h2 className="font-bold text-slate-900 mb-1">Tendencia de Retención Semanal</h2>
                    <p className="text-xs text-slate-500 mb-6">Evolución de estudiantes activos y retención (%).</p>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={RETENTION_SERIES} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="retentionFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#475569" }} />
                                <YAxis domain={[50, 100]} tick={{ fontSize: 12, fill: "#475569" }} unit="%" />
                                <Tooltip
                                    formatter={(v) => [`${v ?? 0}%`, "Retención"]}
                                    contentStyle={{ borderRadius: "0.75rem", borderColor: "#e2e8f0" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="retencion"
                                    stroke="#10b981"
                                    strokeWidth={2.5}
                                    fill="url(#retentionFill)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Students At Risk Table */}
            <div className="surface-card overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-bold text-slate-900 flex items-center gap-2">
                        <AlertTriangle className="text-red-500" size={20} /> Estudiantes en Riesgo
                    </h2>
                    <button
                        type="button"
                        onClick={() => setShowAllModal(true)}
                        className="text-sm text-[var(--color-brand-600)] font-semibold hover:underline"
                    >
                        Ver todos ({EXTENDED_RISK_STUDENTS.length})
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <tbody className="bg-white divide-y divide-slate-100">
                            {data.studentsAtRisk.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-slate-900">{student.name}</div>
                                        <div className="text-xs text-slate-500">ID: {student.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            {student.issue}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs text-slate-500">
                                        Último acceso: {student.lastActive}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAllModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
                            <h3 className="text-lg font-bold text-slate-900">
                                Lista Completa de Alertas Tempranas
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowAllModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                                aria-label="Cerrar"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                            {EXTENDED_RISK_STUDENTS.map((s) => (
                                <div key={s.id} className="py-3.5 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-sm text-slate-900">{s.name}</p>
                                        <p className="text-xs text-slate-500">ID: {s.id} · Último acceso: {s.lastActive}</p>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        {s.issue}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
