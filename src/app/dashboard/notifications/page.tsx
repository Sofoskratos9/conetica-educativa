"use client";

import Link from "next/link";
import { MOCK_NOTIFICATIONS } from "@/lib/automation-service";
import { Bell, Check, ArrowRight } from "lucide-react";

export default function NotificationsPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-brand-900)] flex items-center gap-3">
                    <Bell className="text-[var(--color-brand-600)]" /> Notificaciones
                </h1>
                <button className="text-sm text-[var(--color-brand-600)] font-medium hover:underline">
                    Marcar todo como leído
                </button>
            </div>

            <div className="space-y-4">
                {MOCK_NOTIFICATIONS.map((notification) => (
                    <div
                        key={notification.id}
                        className={`p-6 rounded-xl border transition-all ${!notification.read
                                ? 'bg-white border-[var(--color-brand-200)] shadow-sm border-l-4 border-l-[var(--color-brand-500)]'
                                : 'bg-gray-50 border-gray-200 opacity-75'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full flex-shrink-0 ${notification.type === 'premium' ? 'bg-yellow-100 text-yellow-600' :
                                    notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                        'bg-blue-100 text-blue-600'
                                }`}>
                                {notification.icon ? <notification.icon size={20} /> : <Bell size={20} />}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-bold text-lg mb-1 ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                        {notification.title}
                                    </h3>
                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                        {notification.timestamp}
                                    </span>
                                </div>

                                <p className="text-gray-600 mb-4">
                                    {notification.message}
                                </p>

                                {notification.actionLink && (
                                    <Link href={notification.actionLink} className="inline-flex items-center text-sm font-bold text-[var(--color-brand-600)] hover:underline">
                                        Ver detalles <ArrowRight size={16} className="ml-1" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {MOCK_NOTIFICATIONS.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No tienes notificaciones nuevas.
                    </div>
                )}
            </div>
        </div>
    );
}
