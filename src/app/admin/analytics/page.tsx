"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Users,
    Activity,
    UserCheck,
    AlertTriangle,
    Download,
    X,
    RefreshCw,
    Calendar,
    Building2,
} from "lucide-react";
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

type DateRange = "7d" | "30d" | "90d";

const RANGE_LABELS: Record<DateRange, string> = {
    "7d": "Últimos 7 días",
    "30d": "Últimos 30 días",
    "90d": "Últimos 90 días",
};

interface AdminOverviewData {
    range: DateRange;
    totalStudents: number;
    totalParents: number;
    activeUsers: number;
    retentionRate: number;
    completionRate: number;
    pendingAppointments: number;
    totalAppointments: number;
    schoolInquiriesCount: number;
    moduleCompletionRates: { name: string; rate: number; count: number }[];
    activityTrend: { week: string; activos: number; sesiones: number }[];
    studentsAtRisk: { id: string; name: string; email: string; issue: string; lastActive: string }[];
    recentUsers: { id: string; name: string; email: string; role: string; isPremium: boolean; createdAt: string }[];
    schoolInquiries: {
        id: string;
        referenceId: string;
        name: string;
        school: string;
        position: string;
        email: string;
        phone: string;
        interest: string;
        createdAt: string;
    }[];
}

export default function AdminAnalyticsPage() {
    const [range, setRange] = useState<DateRange>("7d");
    const [data, setData] = useState<AdminOverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [showAllModal, setShowAllModal] = useState(false);

    const loadOverview = useCallback(async (selectedRange: DateRange) => {
        setLoading(true);
        setErrorMessage("");
        try {
            const res = await fetch(`/api/admin/overview?range=${selectedRange}`);
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                setErrorMessage(body.error || "No se pudieron cargar las analíticas reales.");
                return;
            }
            setData(body);
        } catch {
            setErrorMessage("Error de conexión al consultar analíticas.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOverview(range);
    }, [range, loadOverview]);

    const handleExportCSV = () => {
        if (!data) return;
        const rows = [
            "Metrica,Valor",
            `Rango,"${RANGE_LABELS[range]}"`,
            `Estudiantes Registrados,${data.totalStudents}`,
            `Padres Registrados,${data.totalParents}`,
            `Estudiantes Activos,${data.activeUsers}`,
            `Tasa de Actividad,${data.retentionRate}%`,
            `Finalizacion Promedio Modulos,${data.completionRate}%`,
            `Citas Pendientes,${data.pendingAppointments}`,
            `Solicitudes Escuelas,${data.schoolInquiriesCount}`,
            "",
            "Modulo,Finalizacion (%),Estudiantes",
            ...data.moduleCompletionRates.map((m) => `"${m.name}",${m.rate},${m.count}`),
        ];
        const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `conetica-analytics-${range}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const totalStudents = data?.totalStudents ?? 0;
    const activeUsers = data?.activeUsers ?? 0;
    const retentionRate = data?.retentionRate ?? 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analíticas de la Plataforma</h1>
                    <p className="text-sm text-slate-500">
                        Datos en tiempo real desde la base de datos de Conética Educativa.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => loadOverview(range)}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Actualizar
                    </button>
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value as DateRange)}
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
                        disabled={!data}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[var(--color-brand-600)] text-white rounded-xl hover:bg-[var(--color-brand-700)] disabled:opacity-50 transition-colors"
                    >
                        <Download size={16} /> Exportar Reporte
                    </button>
                </div>
            </div>

            {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                    {errorMessage}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="surface-card p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-sm text-slate-500 font-medium">Estudiantes Registrados</div>
                            <div className="text-3xl font-bold text-slate-900 mt-1">
                                {loading ? "—" : totalStudents.toLocaleString("es-MX")}
                            </div>
                        </div>
                        <div className="p-2.5 bg-blue-50 text-[var(--color-brand-600)] rounded-xl">
                            <Users size={22} />
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                        {data?.totalParents ?? 0} cuenta(s) de padres vinculables
                    </div>
                </div>

                <div className="surface-card p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-sm text-slate-500 font-medium">Activos ({RANGE_LABELS[range]})</div>
                            <div className="text-3xl font-bold text-slate-900 mt-1">
                                {loading ? "—" : activeUsers}
                            </div>
                        </div>
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Activity size={22} />
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                        {totalStudents > 0 ? `${retentionRate}% de los estudiantes registrados` : "Sin estudiantes activos todavía"}
                    </div>
                </div>

                <div className="surface-card p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-sm text-slate-500 font-medium">Avance Promedio</div>
                            <div className="text-3xl font-bold text-slate-900 mt-1">
                                {loading ? "—" : `${data?.completionRate ?? 0}%`}
                            </div>
                        </div>
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                            <UserCheck size={22} />
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                        Promedio de módulos completados
                    </div>
                </div>

                <div className="surface-card p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-sm text-slate-500 font-medium">Citas Pendientes</div>
                            <div className="text-3xl font-bold text-slate-900 mt-1">
                                {loading ? "—" : data?.pendingAppointments ?? 0}
                            </div>
                        </div>
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                            <Calendar size={22} />
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                        De {data?.totalAppointments ?? 0} cita(s) totales · {data?.schoolInquiriesCount ?? 0} leads B2B
                    </div>
                </div>
            </div>

            {/* Interactive Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="surface-card p-6">
                    <h2 className="font-bold text-slate-900 mb-1">Finalización por Módulo</h2>
                    <p className="text-xs text-slate-500 mb-6">Porcentaje real de estudiantes registrados que completan cada etapa.</p>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.moduleCompletionRates || []} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
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
                    <h2 className="font-bold text-slate-900 mb-1">Sesiones de Estudio (Últimas 4 Semanas)</h2>
                    <p className="text-xs text-slate-500 mb-6">Sesiones registradas y estudiantes activos por semana.</p>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.activityTrend || []} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="retentionFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#475569" }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#475569" }} />
                                <Tooltip contentStyle={{ borderRadius: "0.75rem", borderColor: "#e2e8f0" }} />
                                <Area
                                    type="monotone"
                                    dataKey="sesiones"
                                    name="Sesiones"
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
                        <AlertTriangle className="text-red-500" size={20} /> Alertas Tempranas de Estudiantes
                    </h2>
                    {(data?.studentsAtRisk.length ?? 0) > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowAllModal(true)}
                            className="text-sm text-[var(--color-brand-600)] font-semibold hover:underline"
                        >
                            Ver todos ({data?.studentsAtRisk.length})
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    {!data || data.studentsAtRisk.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-500">
                            {loading
                                ? "Analizando registros de estudiantes..."
                                : "No hay alertas tempranas de riesgo académico o inactividad en este momento."}
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-slate-200">
                            <tbody className="bg-white divide-y divide-slate-100">
                                {data.studentsAtRisk.slice(0, 5).map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-slate-900">{student.name}</div>
                                            <div className="text-xs text-slate-500">{student.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {student.issue}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs text-slate-500">
                                            Último registro: {student.lastActive}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Recent Users & School Inquiries */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="surface-card overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="font-bold text-slate-900 flex items-center gap-2">
                            <Users size={18} className="text-[var(--color-brand-600)]" /> Usuarios Registrados Recientes
                        </h2>
                    </div>
                    {!data || data.recentUsers.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-500">
                            Aún no hay cuentas de estudiantes o padres registradas.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                            {data.recentUsers.map((u) => (
                                <div key={u.id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{u.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                                            {u.role === "parent" ? "Padre/Tutor" : "Estudiante"}
                                        </span>
                                        <span className="text-xs text-slate-400">{u.createdAt}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="surface-card overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="font-bold text-slate-900 flex items-center gap-2">
                            <Building2 size={18} className="text-emerald-600" /> Solicitudes de Escuelas (B2B)
                        </h2>
                    </div>
                    {!data || data.schoolInquiries.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-500">
                            Aún no hay solicitudes institucionales registradas.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                            {data.schoolInquiries.map((inq) => (
                                <div key={inq.id} className="px-6 py-3.5 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-slate-900">{inq.school}</p>
                                        <span className="text-xs font-mono text-slate-400">{inq.referenceId}</span>
                                    </div>
                                    <p className="text-xs text-slate-600">
                                        {inq.name} ({inq.position}) · {inq.interest}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {inq.email} · {inq.phone}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showAllModal && data && (
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
                            {data.studentsAtRisk.map((s) => (
                                <div key={s.id} className="py-3.5 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-sm text-slate-900">{s.name}</p>
                                        <p className="text-xs text-slate-500">{s.email} · Último registro: {s.lastActive}</p>
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
