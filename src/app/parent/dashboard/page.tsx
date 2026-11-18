"use client";

import { useEffect, useState } from "react";
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
    Link2,
    RefreshCw,
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
import type { StudentProgressSnapshot } from "@/lib/analytics-server";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ParentOverviewResponse {
    linked: boolean;
    student: {
        id: string;
        name: string;
        email: string;
        isPremium: boolean;
    } | null;
    progress: StudentProgressSnapshot | null;
    recentAchievements?: string[];
    homeSupportSuggestions?: { title: string; description: string; actionItem: string }[];
}

export default function ParentDashboardPage() {
    const [overview, setOverview] = useState<ParentOverviewResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDetailedTable, setShowDetailedTable] = useState(true);
    const [studentEmail, setStudentEmail] = useState("");
    const [linking, setLinking] = useState(false);
    const [linkError, setLinkError] = useState("");
    const [showRelink, setShowRelink] = useState(false);

    const loadOverview = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/parent/overview");
            if (res.ok) {
                const data = await res.json();
                setOverview(data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOverview();
    }, []);

    const handleLinkStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentEmail.trim()) return;
        setLinkError("");
        setLinking(true);
        try {
            const res = await fetch("/api/parent/overview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentEmail: studentEmail.trim() }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setLinkError(data.error || "No se pudo vincular la cuenta del estudiante.");
                return;
            }
            setOverview(data);
            setShowRelink(false);
            setStudentEmail("");
        } catch {
            setLinkError("Error de conexión al vincular cuenta.");
        } finally {
            setLinking(false);
        }
    };

    if (loading) {
        return (
            <div className="py-20 text-center text-sm text-slate-500">
                Cargando seguimiento familiar...
            </div>
        );
    }

    if (!overview?.linked || !overview.student || !overview.progress) {
        return (
            <div className="max-w-xl mx-auto py-12">
                <div className="surface-card p-8 rounded-2xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-[var(--color-brand-50)] text-[var(--color-brand-600)]">
                            <Link2 size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--color-brand-900)]">
                                Vincular Cuenta de Estudiante
                            </h1>
                            <p className="text-sm text-slate-500">
                                Ingresa el correo con el que se registró el estudiante para ver sus métricas reales.
                            </p>
                        </div>
                    </div>

                    {linkError && (
                        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                            {linkError}
                        </div>
                    )}

                    <form onSubmit={handleLinkStudent} className="space-y-4">
                        <Input
                            label="Correo del estudiante"
                            type="email"
                            required
                            placeholder="estudiante@correo.com"
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                        />
                        <Button type="submit" disabled={linking} className="w-full">
                            {linking ? "Vinculando..." : "Vincular y Ver Progreso"}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    const { student, progress } = overview;
    const avgDailyMinutes = Math.round(
        progress.weeklyActivity.reduce((a, b) => a + b.minutes, 0) / 7
    );

    const chartData = progress.academicAreas.map((area) => ({
        name: area.name.replace("Pensamiento ", "P. ").replace("Comprensión ", "C. "),
        fullName: area.name,
        score: area.score,
        status: area.status,
    }));

    const handleDownloadReport = () => {
        const lines = [
            `Estudiante,"${student.name}"`,
            `Modulos,${progress.modulesCompleted}/${progress.totalModules}`,
            `Racha,${progress.currentStreak} dias`,
            `Consistencia,${progress.consistencyScore}%`,
            "",
            "Area Academica,Puntaje,Estado",
            ...progress.academicAreas.map((a) => `"${a.name}",${a.score},${a.status}`),
        ];
        const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `reporte-familiar-${student.name.toLowerCase().replace(/\s+/g, "-")}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-brand-900)]">
                        Progreso de {student.name}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {progress.lastActive
                            ? `Última actividad: ${new Date(progress.lastActive).toLocaleString("es-MX", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                              })}`
                            : "Aún sin actividad registrada en la plataforma"}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={loadOverview}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
                    >
                        <RefreshCw size={15} /> Actualizar
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowRelink((v) => !v)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
                    >
                        <Link2 size={15} /> Cambiar estudiante
                    </button>
                    <button
                        type="button"
                        onClick={handleDownloadReport}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                        <Download size={16} /> Exportar CSV
                    </button>
                </div>
            </div>

            {showRelink && (
                <form onSubmit={handleLinkStudent} className="surface-card p-5 rounded-2xl flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1 w-full">
                        <Input
                            label="Vincular otro correo de estudiante"
                            type="email"
                            required
                            placeholder="otro-estudiante@correo.com"
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={linking}>
                        {linking ? "Vinculando..." : "Actualizar vínculo"}
                    </Button>
                    {linkError && <p className="text-xs text-red-600">{linkError}</p>}
                </form>
            )}

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Column 1: Habits & Usage */}
                <div className="space-y-6">
                    <div className="surface-card p-6">
                        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Calendar className="text-[var(--color-brand-600)]" size={20} /> Hábitos de Estudio
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                                <span className="text-slate-700 text-sm flex items-center gap-1.5 font-medium">
                                    <Flame size={16} className="text-amber-500" /> Racha Actual
                                </span>
                                <span className="font-bold text-slate-900">{progress.currentStreak} días</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 text-sm">Promedio Diario (7d)</span>
                                <span className="font-bold text-slate-900">{avgDailyMinutes} min</span>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                    <span>Consistencia semanal</span>
                                    <span className="font-semibold text-slate-700">{progress.consistencyScore}%</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--color-brand-600)] rounded-full transition-all"
                                        style={{ width: `${progress.consistencyScore}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="surface-card p-6">
                        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <CheckCircle className="text-emerald-600" size={20} /> Uso del Plan
                        </h2>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-2xl font-bold text-slate-900">
                                    {progress.modulesCompleted}/{progress.totalModules}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Módulos</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-2xl font-bold text-slate-900">
                                    {progress.tasksCompleted}/{progress.tasksTotal}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Metas Plan</div>
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
                        {progress.academicAreas.length === 0 ? (
                            <p className="text-sm text-slate-500 flex-1">
                                El estudiante aún no ha completado evaluaciones diagnósticas ni simulacros EXANI-II.
                            </p>
                        ) : (
                            <div className="space-y-5 flex-1">
                                {progress.academicAreas.map((area) => (
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
                                                {area.score}% ·{" "}
                                                {area.status === "strong"
                                                    ? "Fortaleza"
                                                    : area.status === "improving"
                                                    ? "En proceso"
                                                    : "Requiere foco"}
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
                        )}

                        <div className="mt-7 pt-5 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <Award size={16} className="text-purple-600" /> Avances Recientes
                            </h3>
                            {(overview.recentAchievements?.length ?? 0) === 0 ? (
                                <p className="text-xs text-slate-500">Sin logros registrados todavía.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {overview.recentAchievements?.map((achievement, i) => (
                                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                            {achievement}
                                        </li>
                                    ))}
                                </ul>
                            )}
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
                            {(overview.homeSupportSuggestions || []).map((suggestion, i) => (
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
                            Calculado directamente con la actividad del estudiante en Conética.
                        </p>
                    </div>
                </div>
            </div>

            {chartData.length > 0 && (
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
            )}
        </div>
    );
}
