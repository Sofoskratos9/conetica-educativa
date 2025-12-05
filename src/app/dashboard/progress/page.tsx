"use client";

import { MOCK_STUDENT_METRICS } from "@/lib/metrics-data";
import { BarChart, Clock, Award, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

export default function ProgressDashboardPage() {
    const data = MOCK_STUDENT_METRICS;
    const maxMinutes = Math.max(...data.weeklyActivity.map(d => d.minutes));

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-[var(--color-brand-900)]">Mi Progreso</h1>
                <div className="text-sm text-gray-500">
                    Última actualización: Hoy
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Clock size={16} /> Horas Totales
                    </div>
                    <div className="text-2xl font-bold text-[var(--color-brand-900)]">{data.totalStudyHours}h</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <CheckCircle size={16} /> Módulos
                    </div>
                    <div className="text-2xl font-bold text-[var(--color-brand-900)]">{data.modulesCompleted}/{data.totalModules}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <TrendingUp size={16} /> Racha
                    </div>
                    <div className="text-2xl font-bold text-[var(--color-brand-900)]">{data.currentStreak} días</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Award size={16} /> Promedio
                    </div>
                    <div className="text-2xl font-bold text-[var(--color-brand-900)]">{data.averageScore}%</div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Chart: Weekly Activity */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <BarChart className="text-[var(--color-brand-500)]" size={20} /> Actividad Semanal (Minutos)
                    </h3>
                    <div className="flex items-end justify-between h-64 gap-2">
                        {data.weeklyActivity.map((day, i) => (
                            <div key={i} className="flex flex-col items-center flex-1 group">
                                <div className="relative w-full flex justify-center items-end h-full">
                                    <div
                                        className="w-full max-w-[40px] bg-[var(--color-brand-200)] rounded-t-lg group-hover:bg-[var(--color-brand-400)] transition-all relative"
                                        style={{ height: `${(day.minutes / maxMinutes) * 100}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {day.minutes} min
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs font-medium text-gray-500">{day.day}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommendations Widget */}
                <div className="space-y-6">
                    <div className="bg-[var(--color-surface-50)] p-6 rounded-xl border border-[var(--color-brand-200)] h-full">
                        <h3 className="font-bold text-[var(--color-brand-900)] mb-4 flex items-center gap-2">
                            <AlertCircle className="text-[var(--color-brand-500)]" size={20} /> Recomendaciones
                        </h3>
                        <ul className="space-y-4">
                            {data.recommendations.map((rec, i) => (
                                <li key={i} className="bg-white p-3 rounded-lg border border-gray-100 text-sm text-gray-700 shadow-sm">
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Historial de Evaluaciones</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Puntaje</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.performanceHistory.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.module}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{item.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.score >= 90 ? 'bg-green-100 text-green-800' :
                                            item.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {item.score}/{item.total}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
