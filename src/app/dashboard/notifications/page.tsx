"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Check, ArrowRight, CheckCircle, AlertTriangle, Sparkles } from "lucide-react";

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "premium";
    actionLink?: string;
    read: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/notifications")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data?.notifications) setNotifications(data.notifications);
            })
            .finally(() => setLoading(false));
    }, []);

    const markAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ markAllRead: true }),
        }).catch(() => {});
    };

    const markSingleRead = async (id: string) => {
        const target = notifications.find((n) => n.id === id);
        if (!target || target.read) return;
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        }).catch(() => {});
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-brand-900)] flex items-center gap-3">
                        <Bell className="text-[var(--color-brand-600)]" /> Notificaciones
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {loading
                            ? "Cargando avisos..."
                            : unreadCount > 0
                              ? `${unreadCount} sin leer`
                              : "Estás al día"}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        type="button"
                        onClick={markAllRead}
                        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-brand-600)] font-semibold hover:underline"
                    >
                        <Check size={16} /> Marcar todo como leído
                    </button>
                )}
            </div>

            {loading ? (
                <div className="surface-card p-10 text-center text-sm text-slate-500">
                    Cargando notificaciones...
                </div>
            ) : notifications.length === 0 ? (
                <div className="surface-card p-10 text-center space-y-2">
                    <Bell size={32} className="mx-auto text-slate-300" />
                    <h2 className="text-lg font-bold text-slate-900">Sin notificaciones aún</h2>
                    <p className="text-sm text-slate-500">
                        Aquí aparecerán avisos reales sobre tus diagnósticos, simulacros EXANI-II, citas 1:1 y vinculaciones familiares.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => {
                        const Icon =
                            notification.type === "premium"
                                ? Sparkles
                                : notification.type === "success"
                                  ? CheckCircle
                                  : notification.type === "warning"
                                    ? AlertTriangle
                                    : Bell;
                        return (
                            <div
                                key={notification.id}
                                onClick={() => markSingleRead(notification.id)}
                                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                                    !notification.read
                                        ? "bg-white border-[var(--color-brand-200)] shadow-sm border-l-4 border-l-[var(--color-brand-500)]"
                                        : "bg-slate-50 border-slate-200 opacity-85"
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`p-3 rounded-full flex-shrink-0 ${
                                            notification.type === "premium"
                                                ? "bg-amber-100 text-amber-700"
                                                : notification.type === "success"
                                                  ? "bg-emerald-100 text-emerald-700"
                                                  : notification.type === "warning"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-blue-100 text-blue-700"
                                        }`}
                                    >
                                        <Icon size={20} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <h2
                                                className={`font-bold text-lg mb-1 ${
                                                    !notification.read ? "text-slate-900" : "text-slate-700"
                                                }`}
                                            >
                                                {notification.title}
                                            </h2>
                                            <span className="text-xs text-slate-500 whitespace-nowrap">
                                                {new Date(notification.createdAt).toLocaleString("es-MX", {
                                                    dateStyle: "short",
                                                    timeStyle: "short",
                                                })}
                                            </span>
                                        </div>

                                        <p className="text-slate-600 mb-3 text-sm">{notification.message}</p>

                                        {notification.actionLink && (
                                            <Link
                                                href={notification.actionLink}
                                                className="inline-flex items-center text-sm font-bold text-[var(--color-brand-600)] hover:underline"
                                            >
                                                Ver detalles <ArrowRight size={16} className="ml-1" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
