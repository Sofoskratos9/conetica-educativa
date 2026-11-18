"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Users,
    Search,
    RefreshCw,
    Sparkles,
    Send,
    Trash2,
    Link2,
    Download,
    X,
    Shield,
    CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AdminUserItem {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: "student" | "parent" | "admin";
    isPremium: boolean;
    studentId: string | null;
    linkedStudentEmail: string | null;
    createdAt: string;
    modulesCompleted: number;
    studyMinutes: number;
    tasksCompleted: number;
    exaniLastScore: number | null;
    riasecCode: string | null;
    psychometricCount: number;
    lastActive: string | null;
    isPrimaryAdmin: boolean;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "student" | "parent" | "admin">("all");
    const [busyId, setBusyId] = useState<string | null>(null);

    // Notification modal state
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifAudience, setNotifAudience] = useState<"user" | "students" | "parents" | "all">("all");
    const [notifTargetUser, setNotifTargetUser] = useState<AdminUserItem | null>(null);
    const [notifTitle, setNotifTitle] = useState("");
    const [notifMessage, setNotifMessage] = useState("");
    const [notifType, setNotifType] = useState<"info" | "success" | "warning" | "premium">("info");
    const [sendingNotif, setSendingNotif] = useState(false);

    // Link student modal state (for parents)
    const [linkingParent, setLinkingParent] = useState<AdminUserItem | null>(null);
    const [linkEmail, setLinkEmail] = useState("");

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setErrorMessage("");
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setErrorMessage(data.error || "No se pudieron cargar los usuarios.");
                return;
            }
            setUsers(data.users || []);
        } catch {
            setErrorMessage("Error de conexión al consultar usuarios.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleTogglePremium = async (u: AdminUserItem) => {
        setBusyId(u.id);
        setErrorMessage("");
        setSuccessMessage("");
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: u.id, isPremium: !u.isPremium }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setErrorMessage(data.error || "No se pudo actualizar el plan PRO.");
                return;
            }
            setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, isPremium: !u.isPremium } : x)));
            setSuccessMessage(
                `Plan PRO ${!u.isPremium ? "activado" : "desactivado"} para ${u.name}.`
            );
        } finally {
            setBusyId(null);
        }
    };

    const handleChangeRole = async (u: AdminUserItem, nextRole: "student" | "parent") => {
        if (u.role === nextRole) return;
        setBusyId(u.id);
        setErrorMessage("");
        setSuccessMessage("");
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: u.id, role: nextRole }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setErrorMessage(data.error || "No se pudo actualizar el rol.");
                return;
            }
            setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: nextRole } : x)));
            setSuccessMessage(`Rol de ${u.name} actualizado a ${nextRole === "parent" ? "Padre/Tutor" : "Estudiante"}.`);
        } finally {
            setBusyId(null);
        }
    };

    const handleDeleteUser = async (u: AdminUserItem) => {
        setBusyId(u.id);
        setErrorMessage("");
        setSuccessMessage("");
        try {
            const res = await fetch(`/api/admin/users?id=${encodeURIComponent(u.id)}`, {
                method: "DELETE",
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setErrorMessage(data.error || "No se pudo eliminar el usuario.");
                return;
            }
            setUsers((prev) => prev.filter((x) => x.id !== u.id));
            setSuccessMessage(`Cuenta ${u.email} eliminada permanentemente.`);
        } finally {
            setBusyId(null);
        }
    };

    const handleSaveLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!linkingParent) return;
        setBusyId(linkingParent.id);
        setErrorMessage("");
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: linkingParent.id,
                    studentEmail: linkEmail.trim() || null,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setErrorMessage(data.error || "No se pudo vincular el estudiante.");
                return;
            }
            setSuccessMessage(
                linkEmail.trim()
                    ? `Vinculación guardada: ${linkingParent.email} → ${linkEmail.trim()}`
                    : `Vínculo eliminado para ${linkingParent.email}`
            );
            setLinkingParent(null);
            setLinkEmail("");
            await loadUsers();
        } finally {
            setBusyId(null);
        }
    };

    const openBroadcastModal = (target?: AdminUserItem) => {
        if (target) {
            setNotifAudience("user");
            setNotifTargetUser(target);
        } else {
            setNotifAudience("all");
            setNotifTargetUser(null);
        }
        setNotifTitle("");
        setNotifMessage("");
        setNotifType("info");
        setNotifOpen(true);
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendingNotif(true);
        setErrorMessage("");
        try {
            const res = await fetch("/api/admin/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    audience: notifAudience,
                    userId: notifTargetUser?.id,
                    title: notifTitle,
                    message: notifMessage,
                    type: notifType,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setErrorMessage(data.error || "No se pudo enviar la notificación.");
                return;
            }
            setNotifOpen(false);
            setSuccessMessage(
                `Notificación entregada a ${data.deliveredCount} usuario(s) en tiempo real.`
            );
        } finally {
            setSendingNotif(false);
        }
    };

    const handleExportCSV = () => {
        const rows = [
            "Nombre,Email,Telefono,Rol,PRO,Modulos,Minutos Estudio,Ultimo EXANI,RIASEC,Pruebas Psicometricas,Registro",
            ...filteredUsers.map(
                (u) =>
                    `"${u.name}","${u.email}","${u.phone || ""}",${u.role},${u.isPremium ? "SI" : "NO"},${u.modulesCompleted}/5,${u.studyMinutes},${u.exaniLastScore ?? ""},${u.riasecCode || ""},${u.psychometricCount},${u.createdAt}`
            ),
        ];
        const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "usuarios-conetica.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const filteredUsers = users.filter((u) => {
        const matchesRole = roleFilter === "all" || u.role === roleFilter;
        const q = search.toLowerCase();
        const matchesSearch =
            !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        return matchesRole && matchesSearch;
    });

    const studentCount = users.filter((u) => u.role === "student").length;
    const parentCount = users.filter((u) => u.role === "parent").length;
    const proCount = users.filter((u) => u.isPremium && u.role !== "admin").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="text-[var(--color-brand-600)]" /> Gestión de Usuarios y Permisos
                    </h1>
                    <p className="text-sm text-slate-500">
                        Controla accesos PRO, roles, vínculos familiares y envía avisos directos o masivos.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={loadUsers} disabled={loading}>
                        <RefreshCw size={15} className={`mr-1.5 ${loading ? "animate-spin" : ""}`} /> Actualizar
                    </Button>
                    <Button variant="outline" onClick={handleExportCSV} disabled={filteredUsers.length === 0}>
                        <Download size={15} className="mr-1.5" /> Exportar CSV
                    </Button>
                    <Button onClick={() => openBroadcastModal()} className="gap-1.5">
                        <Send size={15} /> Enviar Aviso Masivo
                    </Button>
                </div>
            </div>

            {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                    {errorMessage}
                </div>
            )}
            {successMessage && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 size={16} /> {successMessage}
                </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="surface-card p-4">
                    <div className="text-xs text-slate-500">Total Cuentas</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{users.length}</div>
                </div>
                <div className="surface-card p-4">
                    <div className="text-xs text-slate-500">Estudiantes</div>
                    <div className="text-2xl font-bold text-blue-700 mt-1">{studentCount}</div>
                </div>
                <div className="surface-card p-4">
                    <div className="text-xs text-slate-500">Padres / Tutores</div>
                    <div className="text-2xl font-bold text-indigo-700 mt-1">{parentCount}</div>
                </div>
                <div className="surface-card p-4">
                    <div className="text-xs text-slate-500">Cuentas PRO Activas</div>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">{proCount}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="surface-card p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                    aria-label="Filtrar por rol"
                >
                    <option value="all">Todos los roles</option>
                    <option value="student">Estudiantes</option>
                    <option value="parent">Padres / Tutores</option>
                    <option value="admin">Administradores</option>
                </select>
            </div>

            {/* Table */}
            <div className="surface-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                            <tr>
                                <th className="px-5 py-3 text-left">Usuario</th>
                                <th className="px-5 py-3 text-left">Rol / Plan</th>
                                <th className="px-5 py-3 text-left">Actividad Real</th>
                                <th className="px-5 py-3 text-right">Acciones Admin</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                                        Cargando usuarios desde Postgres...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                                        No hay usuarios que coincidan con el filtro.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50">
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                                {u.name}
                                                {u.isPrimaryAdmin && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-emerald-400">
                                                        <Shield size={10} /> Principal
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500">{u.email}</div>
                                            {u.phone && <div className="text-xs text-slate-400">Tel: {u.phone}</div>}
                                            {u.linkedStudentEmail && (
                                                <div className="text-xs text-indigo-600 font-medium mt-0.5">
                                                    Vinculado a: {u.linkedStudentEmail}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {u.role === "admin" ? (
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-white">
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <select
                                                        value={u.role}
                                                        disabled={busyId === u.id}
                                                        onChange={(e) =>
                                                            handleChangeRole(u, e.target.value as "student" | "parent")
                                                        }
                                                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                                                        aria-label={`Cambiar rol de ${u.name}`}
                                                    >
                                                        <option value="student">Estudiante</option>
                                                        <option value="parent">Padre/Tutor</option>
                                                    </select>
                                                )}
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                        u.isPremium
                                                            ? "bg-emerald-100 text-emerald-800"
                                                            : "bg-slate-100 text-slate-600"
                                                    }`}
                                                >
                                                    {u.isPremium ? "PRO" : "Gratis"}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-400 mt-1">
                                                Registro: {u.createdAt}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-600 space-y-0.5">
                                            <div>
                                                Módulos: <strong>{u.modulesCompleted}/5</strong> · Estudio:{" "}
                                                <strong>{u.studyMinutes} min</strong>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-slate-500">
                                                {u.exaniLastScore !== null && (
                                                    <span>EXANI: {u.exaniLastScore} pts</span>
                                                )}
                                                {u.riasecCode && <span>RIASEC: {u.riasecCode}</span>}
                                                {u.psychometricCount > 0 && (
                                                    <span>Psicometría: {u.psychometricCount}</span>
                                                )}
                                                {u.exaniLastScore === null &&
                                                    !u.riasecCode &&
                                                    u.psychometricCount === 0 && <span>Sin evaluaciones aún</span>}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                                                {u.role !== "admin" && (
                                                    <button
                                                        type="button"
                                                        disabled={busyId === u.id}
                                                        onClick={() => handleTogglePremium(u)}
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                                            u.isPremium
                                                                ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
                                                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                        }`}
                                                        title={u.isPremium ? "Quitar acceso PRO" : "Activar acceso PRO"}
                                                    >
                                                        <Sparkles size={13} />
                                                        {u.isPremium ? "Quitar PRO" : "Dar PRO"}
                                                    </button>
                                                )}
                                                {u.role === "parent" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setLinkingParent(u);
                                                            setLinkEmail(u.linkedStudentEmail || "");
                                                        }}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                                    >
                                                        <Link2 size={13} /> Vincular
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => openBroadcastModal(u)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                    title="Enviar notificación directa"
                                                >
                                                    <Send size={13} /> Aviso
                                                </button>
                                                {!u.isPrimaryAdmin && u.role !== "admin" && (
                                                    <button
                                                        type="button"
                                                        disabled={busyId === u.id}
                                                        onClick={() => handleDeleteUser(u)}
                                                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                                                        title="Eliminar cuenta"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Notification Modal */}
            {notifOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <form
                        onSubmit={handleSendNotification}
                        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4"
                    >
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">
                                {notifTargetUser
                                    ? `Enviar aviso a ${notifTargetUser.name}`
                                    : "Enviar Aviso a Usuarios"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setNotifOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {!notifTargetUser && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Audiencia</label>
                                <select
                                    value={notifAudience}
                                    onChange={(e) => setNotifAudience(e.target.value as any)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                                >
                                    <option value="all">Todos (Estudiantes + Padres)</option>
                                    <option value="students">Solo Estudiantes</option>
                                    <option value="parents">Solo Padres / Tutores</option>
                                </select>
                            </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                                <select
                                    value={notifType}
                                    onChange={(e) => setNotifType(e.target.value as any)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                                >
                                    <option value="info">Informativo</option>
                                    <option value="success">Logro / Confirmación</option>
                                    <option value="warning">Recordatorio / Alerta</option>
                                    <option value="premium">Beneficio PRO</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                                <input
                                    type="text"
                                    required
                                    minLength={2}
                                    value={notifTitle}
                                    onChange={(e) => setNotifTitle(e.target.value)}
                                    placeholder="Ej: Nuevo simulacro disponible"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje</label>
                            <textarea
                                required
                                minLength={3}
                                rows={3}
                                value={notifMessage}
                                onChange={(e) => setNotifMessage(e.target.value)}
                                placeholder="Escribe el mensaje que verán en su campana de notificaciones..."
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <Button type="button" variant="outline" onClick={() => setNotifOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={sendingNotif} className="gap-1.5">
                                <Send size={14} /> {sendingNotif ? "Enviando..." : "Enviar Notificación"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Link Parent-Student Modal */}
            {linkingParent && (
                <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <form
                        onSubmit={handleSaveLink}
                        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4"
                    >
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">
                                Vincular Estudiante para {linkingParent.name}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setLinkingParent(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Correo del estudiante (dejar vacío para desvincular)
                            </label>
                            <input
                                type="email"
                                value={linkEmail}
                                onChange={(e) => setLinkEmail(e.target.value)}
                                placeholder="estudiante@correo.com"
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setLinkingParent(null)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={busyId === linkingParent.id}>
                                Guardar Vínculo
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
