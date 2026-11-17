"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_NOTIFICATIONS, type Notification } from "@/lib/automation-service";
import { Bell, Check, ArrowRight } from "lucide-react";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const toggleRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
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
                        {unreadCount > 0 ? `${unreadCount} sin leer` : "Todas leídas"}
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

            <div className="space-y-4">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        onClick={() => toggleRead(notification.id)}
                        className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                            !notification.read
                                ? "bg-white border-[var(--color-brand-200)] shadow-sm border-l-4 border-l-[var(--color-brand-500)]"
                                : "bg-slate-50 border-slate-200 opacity-80"
                        }`}
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className={`p-3 rounded-full flex-shrink-0 ${
                                    notification.type === "premium"
                                        ? "bg-amber-100 text-amber-700"
                                        : notification.type === "success"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-blue-100 text-blue-700"
                                }`}
                            >
                                {notification.icon ? <notification.icon size={20} /> : <Bell size={20} />}
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
                                        {notification.timestamp}
                                    </span>
                                </div>

                                <p className="text-slate-600 mb-4 text-sm">{notification.message}</p>

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
                ))}
            </div>
        </div>
    );
}
