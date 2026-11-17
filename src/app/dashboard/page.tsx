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
import { getCurrentUser, type User } from "@/lib/auth-service";
import { MOCK_STUDENT_METRICS } from "@/lib/metrics-data";

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [exaniScore, setExaniScore] = useState<number>(1150);
    const [diagnosticDone, setDiagnosticDone] = useState<boolean>(false);
    const [vocationalDone, setVocationalDone] = useState<boolean>(false);
    const [range, setRange] = useState<"7d" | "30d">("7d");

    useEffect(() => {
        setUser(getCurrentUser());
        try {
            const diag = localStorage.getItem("diagnostic_result");
            if (diag) setDiagnosticDone(true);
            const voc = localStorage.getItem("vocational_result");
            if (voc) setVocationalDone(true);
            const exani = localStorage.getItem("exani_last_score");
            if (exani) {
                const parsed = Number(exani);
                if (!Number.isNaN(parsed) && parsed > 0) setExaniScore(parsed);
            }
        } catch {
            // ignore storage errors
        }
    }, []);

    const chartData =
        range === "7d"
            ? MOCK_STUDENT_METRICS.weeklyActivity.map((d) => ({
                  name: d.day,
                  minutos: d.minutes,
                  tareas: d.tasksCompleted,
              }))
            : [
                  { name: "Sem 1", minutos: 240, tareas: 14 },
                  { name: "Sem 2", minutos: 310, tareas: 19 },
                  { name: "Sem 3", minutos: 355, tareas: 22 },
                  { name: "Sem 4", minutos: 390, tareas: 26 },
              ];

    const completedCount =
        3 + (diagnosticDone ? 1 : 0) + (vocationalDone ? 1 : 0);

    const firstName = user?.name?.split(" ")[0] || "Estudiante";

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-brand-900)]">
                        Hola, {firstName}
                    </h1>
                    <p className="text-[var(--color-text-muted)] mt-1">
                        Aquí tienes el resumen de tu progreso académico y próximos objetivos.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/dashboard/exani"
                        className="px-4 py-2.5 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-500)] transition-colors inline-flex items-center gap-2"
                    >
                        Practicar EXANI-II <ArrowRight size={16} />
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    {
                        label: "Puntaje Global",
                        value: exaniScore.toLocaleString("es-MX"),
                        sub: "Escala CENEVAL estimada",
                        icon: TrendingUp,
                        color: "text-emerald-700",
                        bg: "bg-emerald-50",
                    },
                    {
                        label: "Módulos Activos",
                        value: `${Math.min(completedCount, 6)}/6`,
                        sub: `${Math.round((Math.min(completedCount, 6) / 6) * 100)}% completado`,
                        icon: Brain,
                        color: "text-blue-700",
                        bg: "bg-blue-50",
                    },
                    {
                        label: "Tiempo de Estudio",
                        value: `${MOCK_STUDENT_METRICS.totalStudyHours}h`,
                        sub: "Acumulado mensual",
                        icon: Clock,
                        color: "text-indigo-700",
                        bg: "bg-indigo-50",
                    },
                    {
                        label: "Consistencia",
                        value: "85%",
                        sub: "Meta semanal en camino",
                        icon: Target,
                        color: "text-amber-700",
                        bg: "bg-amber-50",
                    },
                ].map((stat, i) => (
                    <div key={i} className="surface-card p-6 rounded-2xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-emerald-700">{stat.sub}</div>
                    </div>
                ))}
            </div>

            {/* Chart & Next Steps */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 surface-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="font-bold text-slate-900 text-lg">Actividad de Estudio</h2>
                            <p className="text-xs text-slate-500">Minutos enfocados con metodología activa</p>
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
                                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
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
                                    title: "Plan de Estudio + Pomodoro",
                                    time: "25 min",
                                    type: "Diario",
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
