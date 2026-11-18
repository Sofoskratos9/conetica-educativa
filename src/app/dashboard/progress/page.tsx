"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    BarChart as BarIcon,
    Clock,
    Award,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    ArrowRight,
    Trophy,
    Lock,
    ClipboardCheck,
} from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import type { StudentProgressSnapshot } from "@/lib/analytics-server";
import { computeRealGamification } from "@/lib/gamification";

export default function ProgressDashboardPage() {
    const [data, setData] = useState<StudentProgressSnapshot | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/student/progress")
            .then((r) => (r.ok ? r.json() : null))
            .then((body) => {
                if (body?.progress) setData(body.progress);
            })
            .finally(() => setLoading(false));
    }, []);

    const gamification = data ? computeRealGamification(data) : null;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-brand-900)]">Mi Progreso</h1>
                    <p className="text-sm text-slate-500">Métricas reales acumuladas de estudio y evaluaciones</p>
                </div>
                <div className="text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 w-fit">
                    {data?.lastActive
                        ? `Última actividad: ${new Date(data.lastActive).toLocaleDateString("es-MX")}`
                        : "Sin actividad registrada"}
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="surface-card p-5 rounded-2xl">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                        <Clock size={15} className="text-blue-600" /> Horas Totales
                    </div>
                    <div className="text-3xl font-extrabold text-[var(--color-brand-900)]">
                        {loading ? "—" : `${data?.totalStudyHours ?? 0}h`}
                    </div>
                </div>
                <div className="surface-card p-5 rounded-2xl">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                        <CheckCircle size={15} className="text-emerald-600" /> Módulos
                    </div>
                    <div className="text-3xl font-extrabold text-[var(--color-brand-900)]">
                        {loading ? "—" : `${data?.modulesCompleted ?? 0}/${data?.totalModules ?? 5}`}
                    </div>
                </div>
                <div className="surface-card p-5 rounded-2xl">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                        <TrendingUp size={15} className="text-amber-600" /> Racha
                    </div>
                    <div className="text-3xl font-extrabold text-[var(--color-brand-900)]">
                        {loading ? "—" : `${data?.currentStreak ?? 0} días`}
                    </div>
                </div>
                <div className="surface-card p-5 rounded-2xl">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                        <Award size={15} className="text-indigo-600" /> Promedio
                    </div>
                    <div className="text-3xl font-extrabold text-[var(--color-brand-900)]">
                        {loading ? "—" : data?.averageScore !== null && data?.averageScore !== undefined ? `${data.averageScore}%` : "—"}
                    </div>
                </div>
            </div>

            {/* Real XP & Badges Section */}
            {gamification && (
                <div className="surface-card p-6 rounded-2xl space-y-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
                                <Trophy size={22} />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900 text-lg">
                                    Logros, Nivel XP e Insignias Desbloqueadas
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Nivel {gamification.level}: <strong>{gamification.levelName}</strong> ·{" "}
                                    <strong>{gamification.totalXp} XP reales</strong> ({gamification.unlockedCount}/10 insignias)
                                </p>
                            </div>
                        </div>
                        <div className="md:w-64">
                            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                                <span>Avance al siguiente nivel</span>
                                <span>{gamification.progressToNextPct}%</span>
                            </div>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-blue-600 rounded-full"
                                    style={{ width: `${gamification.progressToNextPct}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {gamification.badges.map((badge) => (
                            <div
                                key={badge.id}
                                className={`p-4 rounded-xl border transition-all ${
                                    badge.unlocked
                                        ? "bg-amber-50/70 border-amber-200 text-slate-900"
                                        : "bg-slate-50/70 border-slate-200/80 text-slate-400"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                                        +{badge.xpBonus} XP
                                    </span>
                                    {badge.unlocked ? (
                                        <CheckCircle size={16} className="text-emerald-600" />
                                    ) : (
                                        <Lock size={15} className="text-slate-400" />
                                    )}
                                </div>
                                <h3 className={`text-sm font-bold ${badge.unlocked ? "text-slate-900" : "text-slate-500"}`}>
                                    {badge.name}
                                </h3>
                                <p className="text-xs mt-1 leading-snug">{badge.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                {/* Interactive Weekly Bar Chart */}
                <div className="md:col-span-2 surface-card p-6 rounded-2xl">
                    <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <BarIcon className="text-[var(--color-brand-600)]" size={20} /> Actividad Semanal (Minutos)
                    </h2>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.weeklyActivity || []} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
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
                        {(data?.recommendations || []).map((rec, i) => (
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

            {/* Psychometric Results Summary */}
            <div className="surface-card p-6 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className="font-bold text-slate-900 flex items-center gap-2">
                        <ClipboardCheck className="text-indigo-600" size={20} /> Evaluaciones Psicométricas Validadas
                    </h2>
                    <Link
                        href="/dashboard/psychometrics"
                        className="text-xs font-bold text-[var(--color-brand-600)] hover:underline inline-flex items-center gap-1"
                    >
                        Ir a Batería Psicométrica <ArrowRight size={14} />
                    </Link>
                </div>

                {!data?.psychometricResults || data.psychometricResults.length === 0 ? (
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span>Aún no has completado ninguna evaluación psicométrica (EDAOM, VAK, CHASIDE o Bar-On).</span>
                        <Link
                            href="/dashboard/psychometrics"
                            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 w-fit"
                        >
                            Realizar evaluación
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {data.psychometricResults.map((res) => (
                            <div key={res.testId} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-sm">{res.testName}</h3>
                                        <p className="text-xs text-slate-500">
                                            Fortaleza principal: <strong className="text-indigo-700">{res.topDimension}</strong>
                                        </p>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800">
                                        {res.globalPercentage}%
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600">{res.recommendation}</p>
                            </div>
                        ))}
                    </div>
                )}
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
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                                        Cargando historial...
                                    </td>
                                </tr>
                            ) : !data || data.performanceHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500 space-y-3">
                                        <p>Aún no has completado evaluaciones ni simulacros.</p>
                                        <Link
                                            href="/dashboard/diagnostic"
                                            className="inline-flex items-center gap-1.5 text-[var(--color-brand-600)] font-semibold hover:underline"
                                        >
                                            Comenzar Diagnóstico Inicial <ArrowRight size={15} />
                                        </Link>
                                    </td>
                                </tr>
                            ) : (
                                data.performanceHistory.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{item.module}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">{item.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    item.score >= 85
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : item.score >= 65
                                                            ? "bg-amber-100 text-amber-800"
                                                            : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {item.score}/{item.total}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

