"use client";

import { MOCK_STUDENT_METRICS } from "@/lib/metrics-data";
import { BarChart as BarIcon, Clock, Award, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

export default function ProgressDashboardPage() {
    const data = MOCK_STUDENT_METRICS;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-brand-900)]">Mi Progreso</h1>
                    <p className="text-sm text-slate-500">Métricas acumuladas de estudio y simulacros</p>
                </div>
                <div className="text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 w-fit">
                    Actualizado hoy
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="surface-card p-5 rounded-2xl">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                        <Clock size={15} className="text-blue-600" /> Horas Totales
                    </div>
                    <div className="text-3xl font-extrabold text-[var(--color-brand-900)]">{data.totalStudyHours}h</div>
                </div>
                <div className="surface-card p-5 rounded-2xl">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                        <CheckCircle size={15} className="text-emerald-600" /> Módulos
                    </div>
                    <div className="text-3xl font-extrabold text-[var(--color-brand-900)]">
                        {data.modulesCompleted}/{data.totalModules}
                    </div>
                </div>
                <div className="surface-card p-5 rounded-2xl">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                        <TrendingUp size={15} className="text-amber-600" /> Racha
                    </div>
                    <div className="text-3xl font-extrabold text-[var(--color-brand-900)]">{data.currentStreak} días</div>
                </div>
                <div className="surface-card p-5 rounded-2xl">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                        <Award size={15} className="text-indigo-600" /> Promedio
                    </div>
                    <div className="text-3xl font-extrabold text-[var(--color-brand-900)]">{data.averageScore}%</div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Interactive Weekly Bar Chart */}
                <div className="md:col-span-2 surface-card p-6 rounded-2xl">
                    <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <BarIcon className="text-[var(--color-brand-600)]" size={20} /> Actividad Semanal (Minutos)
                    </h2>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.weeklyActivity} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0",
                                        boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
                                    }}
                                />
                                <Bar dataKey="minutes" name="Minutos" fill="#2563eb" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="surface-card p-6 rounded-2xl">
                    <h2 className="font-bold text-[var(--color-brand-900)] mb-4 flex items-center gap-2">
                        <AlertCircle className="text-[var(--color-brand-600)]" size={20} /> Recomendaciones
                    </h2>
                    <ul className="space-y-3">
                        {data.recommendations.map((rec, i) => (
                            <li
                                key={i}
                                className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-sm text-slate-700"
                            >
                                {rec}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* History Table */}
            <div className="surface-card rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="font-bold text-slate-900">Historial de Evaluaciones</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Módulo</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Puntaje</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {data.performanceHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{item.module}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">{item.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                item.score >= 90
                                                    ? "bg-emerald-100 text-emerald-800"
                                                    : item.score >= 70
                                                        ? "bg-amber-100 text-amber-800"
                                                        : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {item.score}/{item.total}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
