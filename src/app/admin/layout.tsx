"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    BarChart3,
    Calendar,
    Compass,
    FileText,
    Activity,
    LogOut,
    Menu,
    X,
    ExternalLink,
    ShieldCheck,
    Users,
    GraduationCap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { getCurrentUser, fetchServerSession, logout, type User } from "@/lib/auth-service";

export default function AdminLayout({
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
        { name: "Analíticas", href: "/admin/analytics", icon: BarChart3 },
        { name: "Usuarios y Permisos", href: "/admin/users", icon: Users },
        { name: "Banco EXANI-II", href: "/admin/questions", icon: GraduationCap },
        { name: "Gestión de Citas", href: "/admin/appointments", icon: Calendar },
        { name: "Psicometría y RIASEC", href: "/admin/vocational", icon: Compass },
        { name: "Gestión de Blog", href: "/admin/blog", icon: FileText },
        { name: "Actividad y Logs", href: "/admin/automations", icon: Activity },
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
        : "AD";

    return (
        <div className="min-h-screen bg-[var(--color-surface-50)] flex">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside
                className={clsx(
                    "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                    <Link href="/admin/analytics" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center">
                            <ShieldCheck size={18} />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white">
                            Conética Admin
                        </span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1 text-slate-400 hover:text-white"
                        aria-label="Cerrar menú"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive =
                            pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={clsx(
                                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-white/10 text-white font-semibold"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon
                                    size={18}
                                    className={isActive ? "text-emerald-400" : "text-slate-500"}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors"
                    >
                        <span>Vista Estudiante</span>
                        <ExternalLink size={14} />
                    </Link>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={18} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

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
                            Consola Administrativa y Control Académico
                        </span>
                    </div>

                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-semibold text-slate-900">
                                {user?.name || "Administrador"}
                            </div>
                            <div className="text-xs text-emerald-600 font-semibold">
                                Rol: Administrador
                            </div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-sm">
                            {initials}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
