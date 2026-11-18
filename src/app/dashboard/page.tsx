"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Brain,
    TrendingUp,
    Clock,
    Target,
    ArrowRight,
    Compass,
    BookOpen,
    Calendar,
    Trophy,
    ClipboardCheck,
    GraduationCap,
} from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import { getCurrentUser, fetchServerSession, type User } from "@/lib/auth-service";
import type { StudentProgressSnapshot } from "@/lib/analytics-server";
import { computeRealGamification } from "@/lib/gamification";
import { getUaaCycleContext } from "@/lib/exam-cycle";

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [progress, setProgress] = useState<StudentProgressSnapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<"7d" | "30d">("7d");

    useEffect(() => {
        setUser(getCurrentUser());
        fetchServerSession().then((u) => {
            if (u) setUser(u);
        });

        fetch("/api/student/progress")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data?.progress) setProgress(data.progress);
            })
            .finally(() => setLoading(false));
    }, []);

    const chartData =
        range === "7d"
            ? (progress?.weeklyActivity || []).map((d) => ({
                  name: d.day,
                  minutos: d.minutes,
                  tareas: d.tasksCompleted,
              }))
            : progress?.monthlyActivity || [];

    const diagnosticDone = Boolean(progress?.diagnostic);
    const vocationalDone = Boolean(progress?.vocational);
    const psychometricCount = progress?.psychometricResults?.length ?? 0;
    const completedCount = progress?.modulesCompleted ?? 0;
    const totalModules = progress?.totalModules ?? 5;
    const pctModules = Math.round((completedCount / totalModules) * 100);

    const gamification = progress ? computeRealGamification(progress) : null;
    const uaaCycle = getUaaCycleContext();

    const firstName = user?.name?.split(" ")[0] || "Estudiante";

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[var(--color-brand-700)] text-xs font-bold mb-2 border border-blue-100">
                        <GraduationCap size={14} />
                        {uaaCycle.uaaPhaseLabel}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-brand-900)]">
                        Hola, {firstName}
                    </h1>
                    <p className="text-[var(--color-text-muted)] mt-1">
                        Aquí tienes el resumen real de tu progreso académico y próximos objetivos.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/dashboard/psychometrics"
                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                    >
                        <ClipboardCheck size={16} className="text-indigo-600" />
                        Psicometría ({psychometricCount}/4)
                    </Link>
                    <Link
                        href="/dashboard/exani"
                        className="px-4 py-2.5 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-500)] transition-colors inline-flex items-center gap-2"
                    >
                        Practicar EXANI-II <ArrowRight size={16} />
                    </Link>
                </div>
            </div>

            {/* Real XP & Level Banner */}
            {gamification && (
                <div className="surface-card p-5 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50/60 via-white to-blue-50/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                                        Nivel {gamification.level}
                                    </span>
                                    <h2 className="font-bold text-slate-900">{gamification.levelName}</h2>
                                </div>
                                <p className="text-xs text-slate-600 mt-1">
                                    <strong>{gamification.totalXp} XP reales</strong> acumulados ·{" "}
                                    <strong>{gamification.unlockedCount}/10</strong> insignias desbloqueadas
                                    {gamification.nextLevelXp !== null
                                        ? ` · Siguiente nivel a los ${gamification.nextLevelXp} XP`
                                        : " · Nivel máximo alcanzado"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 md:w-72">
                            <div className="flex-1">
                                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-500 to-blue-600 rounded-full transition-all"
                                        style={{ width: `${gamification.progressToNextPct}%` }}
                                    />
                                </div>
                            </div>
                            <Link
                                href="/dashboard/progress"
                                className="text-xs font-bold text-[var(--color-brand-600)] hover:underline whitespace-nowrap"
                            >
                                Ver logros →
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    {
                        label: "Puntaje EXANI-II",
                        value: loading
                            ? "—"
                            : progress?.exaniLastScore !== null && progress?.exaniLastScore !== undefined
                              ? progress.exaniLastScore.toLocaleString("es-MX")
                              : "Sin intento",
                        sub:
                            progress?.exaniLastScore !== null && progress?.exaniLastScore !== undefined
                                ? "Última escala CENEVAL estimada"
                                : "Realiza un simulacro para calcularlo",
                        icon: TrendingUp,
                        color: "text-emerald-700",
                        bg: "bg-emerald-50",
                    },
                    {
                        label: "Módulos Completados",
                        value: loading ? "—" : `${completedCount}/${totalModules}`,
                        sub: `${pctModules}% de tu ruta completada`,
                        icon: Brain,
                        color: "text-blue-700",
                        bg: "bg-blue-50",
                    },
                    {
                        label: "Tiempo de Estudio",
                        value: loading ? "—" : `${progress?.totalStudyHours ?? 0}h`,
                        sub: `${progress?.totalStudyMinutes ?? 0} minutos acumulados`,
                        icon: Clock,
                        color: "text-indigo-700",
                        bg: "bg-indigo-50",
                    },
                    {
                        label: "Consistencia (7 días)",
                        value: loading ? "—" : `${progress?.consistencyScore ?? 0}%`,
                        sub:
                            (progress?.currentStreak ?? 0) > 0
                                ? `Racha actual: ${progress?.currentStreak} día(s)`
                                : "Completa una sesión hoy para iniciar racha",
                        icon: Target,
                        color: "text-amber-700",
                        bg: "bg-amber-50",
                    },
                ].map((stat, i) => (
                    <div key={i} className="surface-card p-6 rounded-2xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-slate-600">{stat.sub}</div>
                    </div>
                ))}
            </div>

            {/* Chart & Next Steps */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 surface-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="font-bold text-slate-900 text-lg">Actividad de Estudio</h2>
                            <p className="text-xs text-slate-500">Minutos registrados en simulacros, evaluaciones y Pomodoro</p>
                        </div>
                        <select
                            value={range}
                            onChange={(e) => setRange(e.target.value as "7d" | "30d")}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 bg-white"
                            aria-label="Rango de tiempo"
                        >
                            <option value="7d">Últimos 7 días</option>
                            <option value="30d">Últimos 30 días</option>
                        </select>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0",
                                        boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="minutos"
                                    name="Minutos"
                                    stroke="#2563eb"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#studyGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="surface-card p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                        <h2 className="font-bold text-slate-900 text-lg mb-4">Siguientes Pasos</h2>
                        <div className="space-y-3">
                            {[
                                {
                                    title: diagnosticDone ? "Revisar Diagnóstico" : "Completar Diagnóstico",
                                    time: "10 min",
                                    type: diagnosticDone ? "Completado" : "Prioritario",
                                    href: "/dashboard/diagnostic",
                                    icon: Brain,
                                },
                                {
                                    title: "Batería Psicométrica Validada",
                                    time: "8 min",
                                    type: `${psychometricCount}/4 pruebas`,
                                    href: "/dashboard/psychometrics",
                                    icon: ClipboardCheck,
                                },
                                {
                                    title: "Plan de Estudio + Pomodoro",
                                    time: "25 min",
                                    type: `${progress?.tasksCompleted ?? 0}/${progress?.tasksTotal ?? 0} metas`,
                                    href: "/dashboard/study-plan",
                                    icon: BookOpen,
                                },
                                {
                                    title: vocationalDone ? "Ver Perfil Vocacional" : "Test Vocacional RIASEC",
                                    time: "15 min",
                                    type: vocationalDone ? "Completado" : "Recomendado",
                                    href: vocationalDone ? "/dashboard/vocational/results" : "/dashboard/vocational",
                                    icon: Compass,
                                },
                                {
                                    title: "Agendar Mentoría 1:1",
                                    time: "60 min",
                                    type: "Opcional",
                                    href: "/dashboard/booking",
                                    icon: Calendar,
                                },
                            ].map((item, i) => (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className="flex items-center gap-3.5 p-3.5 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100 hover:border-[var(--color-brand-200)]"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center flex-shrink-0">
                                        <item.icon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-slate-900 truncate">{item.title}</h3>
                                        <p className="text-xs text-slate-500">
                                            {item.time} • {item.type}
                                        </p>
                                    </div>
                                    <ArrowRight size={16} className="text-slate-400 flex-shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

