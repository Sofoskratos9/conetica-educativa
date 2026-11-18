"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Brain,
    BookOpen,
    TrendingUp,
    Activity,
    Compass,
    Calendar,
    BarChart3,
    Settings,
    LogOut,
    Bell,
    Menu,
    X,
    Sparkles,
    ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { getCurrentUser, fetchServerSession, logout, type User } from "@/lib/auth-service";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        setUser(getCurrentUser());
        fetchServerSession().then((u) => {
            setUser(u);
        });
    }, []);

    const navigation = [
        { name: "Resumen", href: "/dashboard", icon: LayoutDashboard },
        { name: "Diagnóstico", href: "/dashboard/diagnostic", icon: Brain },
        { name: "Plan de Estudio", href: "/dashboard/study-plan", icon: BookOpen },
        { name: "Práctica EXANI", href: "/dashboard/exani", icon: TrendingUp },
        { name: "Vocacional RIASEC", href: "/dashboard/vocational", icon: Compass },
        { name: "Bienestar", href: "/dashboard/wellness", icon: Activity },
        { name: "Mi Progreso", href: "/dashboard/progress", icon: BarChart3 },
        { name: "Agendar 1:1", href: "/dashboard/booking", icon: Calendar },
    ];

    const handleLogout = async () => {
        await logout();
        router.push("/auth/login");
        router.refresh();
    };

    const initials = user?.name
        ? user.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()
        : "CE";

    return (
        <div className="min-h-screen bg-[var(--color-surface-50)] flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg gradient-brand text-white flex items-center justify-center">
                            <Compass size={18} className="text-emerald-400" />
                        </div>
                        <span className="text-lg font-bold text-[var(--color-brand-900)]">Conética</span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1 text-slate-400 hover:text-slate-700"
                        aria-label="Cerrar menú"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive =
                            item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={clsx(
                                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-[var(--color-brand-50)] text-[var(--color-brand-600)] font-semibold"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon
                                    size={19}
                                    className={isActive ? "text-[var(--color-brand-600)]" : "text-slate-400"}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {!user?.isPremium && (
                    <div className="mx-4 mb-3 p-4 rounded-xl gradient-brand text-white text-xs space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                            <Sparkles size={14} /> Conética Premium
                        </div>
                        <p className="text-slate-200 leading-relaxed">
                            Desbloquea simuladores EXANI-II ilimitados y reportes completos.
                        </p>
                        <Link
                            href="/checkout?product=premium_monthly"
                            className="inline-block w-full text-center py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors"
                        >
                            Mejorar Plan
                        </Link>
                    </div>
                )}

                <div className="p-4 border-t border-slate-100 space-y-1">
                    {user?.role === "admin" && (
                        <Link
                            href="/admin/analytics"
                            onClick={() => setIsSidebarOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                        >
                            <ShieldCheck size={19} className="text-emerald-600" />
                            Consola Admin
                        </Link>
                    )}
                    <Link
                        href="/dashboard/settings"
                        onClick={() => setIsSidebarOpen(false)}
                        className={clsx(
                            "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                            pathname === "/dashboard/settings"
                                ? "bg-[var(--color-brand-50)] text-[var(--color-brand-600)] font-semibold"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        <Settings size={19} className="text-slate-400" />
                        Configuración
                    </Link>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={19} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                        aria-label="Abrir menú"
                    >
                        <Menu size={22} />
                    </button>

                    <div className="flex-1 px-4 lg:px-0">
                        <span className="text-sm font-medium text-slate-500 hidden sm:inline">
                            Plataforma de Aprendizaje Basada en Evidencia
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/notifications"
                            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 relative transition-colors"
                            aria-label="Notificaciones"
                        >
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </Link>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-semibold text-slate-900">
                                    {user?.name || "Estudiante"}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
                                    <span>{user?.role === "admin" ? "Administrador" : "Estudiante"}</span>
                                    {user?.isPremium && (
                                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">
                                            PRO
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-[var(--color-brand-100)] flex items-center justify-center text-[var(--color-brand-700)] font-bold text-sm">
                                {initials}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
