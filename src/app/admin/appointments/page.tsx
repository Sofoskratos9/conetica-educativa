"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, CheckCircle, XCircle, RotateCcw, RefreshCw } from "lucide-react";

type AppointmentStatus = "confirmed" | "pending" | "cancelled";

interface AppointmentItem {
    id: string;
    student: string;
    service: string;
    date: string;
    time: string;
    status: AppointmentStatus;
}

export default function AdminAppointmentsPage() {
    const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
    const [filter, setFilter] = useState<string>("all");
    const [loading, setLoading] = useState<boolean>(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const loadAppointments = async () => {
        setLoading(true);
        setErrorMessage("");
        try {
            const res = await fetch("/api/appointments");
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                const list: AppointmentItem[] = (data.appointments || []).map((a: any) => ({
                    id: String(a.id),
                    student: a.studentName || "Estudiante",
                    service: a.serviceName || a.serviceId,
                    date: a.scheduledDate,
                    time: a.scheduledTime,
                    status: a.status === "completed" ? "confirmed" : a.status,
                }));
                setAppointments(list);
            } else {
                setErrorMessage(data.error || "No se pudieron cargar las citas.");
            }
        } catch {
            setErrorMessage("Error de conexión al cargar las citas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    const updateStatus = async (id: string, status: AppointmentStatus) => {
        setUpdatingId(id);
        setErrorMessage("");
        const prevList = appointments;
        setAppointments((prev) =>
            prev.map((app) => (app.id === id ? { ...app, status } : app))
        );
        try {
            const res = await fetch("/api/appointments", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setAppointments(prevList);
                setErrorMessage(data.error || "No se pudo actualizar el estado de la cita.");
            }
        } catch {
            setAppointments(prevList);
            setErrorMessage("Error de conexión al actualizar la cita.");
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredAppointments =
        filter === "all"
            ? appointments
            : appointments.filter((app) => app.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión de Citas</h1>
                    <p className="text-sm text-slate-500">Confirma, reprograma o cancela sesiones 1:1 en tiempo real.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={loadAppointments}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Actualizar
                    </button>
                    <select
                        className="bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">Todas ({appointments.length})</option>
                        <option value="confirmed">Confirmadas</option>
                        <option value="pending">Pendientes</option>
                        <option value="cancelled">Canceladas</option>
                    </select>
                </div>
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
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estudiante</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Servicio</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha y Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                                        Cargando citas...
                                    </td>
                                </tr>
                            ) : filteredAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                                        No hay citas registradas en este filtro todavía.
                                    </td>
                                </tr>
                            ) : filteredAppointments.map((app) => (
                                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                                                <User size={16} />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-semibold text-slate-900">{app.student}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                        {app.service}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-700 flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-400" /> {app.date}
                                            <Clock size={14} className="text-slate-400 ml-2" /> {app.time}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                app.status === "confirmed"
                                                    ? "bg-emerald-100 text-emerald-800"
                                                    : app.status === "pending"
                                                    ? "bg-amber-100 text-amber-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {app.status === "confirmed"
                                                ? "Confirmada"
                                                : app.status === "pending"
                                                ? "Pendiente"
                                                : "Cancelada"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="inline-flex items-center gap-1.5">
                                            {app.status !== "confirmed" && (
                                                <button
                                                    type="button"
                                                    disabled={updatingId === app.id}
                                                    onClick={() => updateStatus(app.id, "confirmed")}
                                                    title="Confirmar cita"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 text-xs font-semibold transition-colors"
                                                >
                                                    <CheckCircle size={14} /> Confirmar
                                                </button>
                                            )}
                                            {app.status !== "pending" && (
                                                <button
                                                    type="button"
                                                    disabled={updatingId === app.id}
                                                    onClick={() => updateStatus(app.id, "pending")}
                                                    title="Marcar pendiente"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50 text-xs font-semibold transition-colors"
                                                >
                                                    <RotateCcw size={14} /> Pendiente
                                                </button>
                                            )}
                                            {app.status !== "cancelled" && (
                                                <button
                                                    type="button"
                                                    disabled={updatingId === app.id}
                                                    onClick={() => updateStatus(app.id, "cancelled")}
                                                    title="Cancelar cita"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 text-xs font-semibold transition-colors"
                                                >
                                                    <XCircle size={14} /> Cancelar
                                                </button>
                                            )}
                                        </div>
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
