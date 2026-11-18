"use client";

import { useEffect, useState, useCallback } from "react";
import { Activity, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

interface ActivityLogItem {
    id: string;
    trigger: string;
    userId: string;
    userName: string;
    action: string;
    timestamp: string;
    status: "success" | "failed";
}

export default function AutomationLogsPage() {
    const [logs, setLogs] = useState<ActivityLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const loadLogs = useCallback(async () => {
        setLoading(true);
        setErrorMessage("");
        try {
            const res = await fetch("/api/admin/overview");
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setErrorMessage(data.error || "No se pudieron cargar los registros.");
                return;
            }
            setLogs(data.activityLogs || []);
        } catch {
            setErrorMessage("Error de conexión al consultar eventos.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Activity className="text-[var(--color-brand-600)]" /> Registro de Actividad y Automatización
                    </h1>
                    <p className="text-sm text-slate-500">Eventos reales ejecutados en la plataforma.</p>
                </div>
                <button
                    type="button"
                    onClick={loadLogs}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Actualizar
                </button>
            </div>

            {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                    {errorMessage}
                </div>
            )}

            <div className="surface-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Evento</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acción Ejecutada</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                                        Cargando historial de eventos...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                                        Aún no hay eventos registrados. Se irán guardando conforme los usuarios usen los módulos, agenden citas o se registren.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs">
                                                {log.trigger}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{log.userName}</div>
                                            <div className="text-xs text-slate-400 font-mono">{log.userId.slice(0, 8)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-700">{log.action}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-500 flex items-center gap-1">
                                                <Clock size={14} /> {log.timestamp}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    log.status === "success"
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {log.status === "success" ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                {log.status === "success" ? "OK" : "ERROR"}
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
