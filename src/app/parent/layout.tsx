"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Users, LogOut, BarChart3, Home, Compass } from "lucide-react";
import { getCurrentUser, fetchServerSession, logout, type User } from "@/lib/auth-service";

export default function ParentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        setUser(getCurrentUser());
        fetchServerSession().then((u) => {
            setUser(u);
        });
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push("/auth/login");
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-[var(--color-surface-50)] font-sans">
            {/* Top Navigation Bar for Parents */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex-shrink-0 flex items-center gap-2.5">
                                <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center text-white">
                                    <Compass size={18} className="text-emerald-400" />
                                </div>
                                <span className="font-bold text-[var(--color-brand-900)]">
                                    Conética Familia
                                </span>
                            </Link>

                            <div className="hidden md:flex space-x-6">
                                <Link
                                    href="/parent/dashboard"
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-[var(--color-brand-600)] text-sm font-semibold text-slate-900"
                                >
                                    <Home size={17} className="mr-2 text-[var(--color-brand-600)]" /> Resumen
                                </Link>
                                <Link
                                    href="/parent/dashboard#reporte-detallado"
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors"
                                >
                                    <BarChart3 size={17} className="mr-2" /> Reportes Detallados
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-sm text-right hidden sm:block">
                                <div className="font-semibold text-slate-900">
                                    {user?.name || "Padre / Tutor"}
                                </div>
                                <div className="text-xs text-slate-500">Portal de Padres / Tutor</div>
                            </div>
                            <div className="p-2 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
                                <Users size={19} />
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                title="Cerrar sesión"
                                aria-label="Cerrar sesión"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={17} />
                                <span className="hidden sm:inline">Salir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">{children}</main>
        </div>
    );
}
