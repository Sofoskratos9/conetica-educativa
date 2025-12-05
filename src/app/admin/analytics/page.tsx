"use client";

import { MOCK_ADMIN_ANALYTICS } from "@/lib/metrics-data";
import { Users, Activity, UserMinus, AlertTriangle, TrendingUp } from "lucide-react";

export default function AdminAnalyticsPage() {
    const data = MOCK_ADMIN_ANALYTICS;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Analíticas de la Plataforma</h1>
                <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        Últimos 7 días
                    </button>
                    <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        Exportar Reporte
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-sm text-gray-500 font-medium">Estudiantes Totales</div>
                            <div className="text-3xl font-bold text-gray-900 mt-1">{data.totalStudents}</div>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Users size={24} />
                        </div>
                    </div>
                    <div className="text-sm text-green-600 flex items-center gap-1">
                        <TrendingUp size={14} /> +12% vs mes anterior
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-sm text-gray-500 font-medium">Usuarios Activos (24h)</div>
                            <div className="text-3xl font-bold text-gray-900 mt-1">{data.activeUsers24h}</div>
                        </div>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <Activity size={24} />
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">
                        {Math.round((data.activeUsers24h / data.totalStudents) * 100)}% del total
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-sm text-gray-500 font-medium">Tasa de Retención</div>
                            <div className="text-3xl font-bold text-gray-900 mt-1">{data.averageRetentionRate}%</div>
                        </div>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <UserMinus size={24} />
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">
                        Promedio de la industria: 65%
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Module Completion Rates */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6">Tasas de Finalización por Módulo</h3>
                    <div className="space-y-4">
                        {data.moduleCompletionRates.map((mod) => (
                            <div key={mod.name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{mod.name}</span>
                                    <span className="font-bold text-gray-900">{mod.rate}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--color-brand-500)] rounded-full"
                                        style={{ width: `${mod.rate}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Students At Risk Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="text-red-500" size={20} /> Estudiantes en Riesgo
                        </h3>
                        <button className="text-sm text-[var(--color-brand-600)] font-medium hover:underline">Ver todos</button>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.studentsAtRisk.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                        <div className="text-xs text-gray-500">ID: {student.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            {student.issue}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs text-gray-500">
                                        Último acceso: {student.lastActive}
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
